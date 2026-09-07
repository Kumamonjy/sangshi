/**
 * 实时自走战斗核心模块
 * -------------------------------------------------------
 * 用 plain JS 对象维护战斗状态（避免 Pinia 每 tick 响应式更新的性能问题），
 * 通过 setInterval(50ms) 固定步长驱动逻辑循环。
 *
 * 角色行为（简化版 v0.2）：
 *   1. 选目标（每 1000ms 重选一次）
 *      - 近战：找最近的敌人
 *      - 远程：优先找射程内的敌人；射程内没敌人时找最靠近的敌人
 *   2. 移动（按 moveSpeed 逐格）
 *      - 远程且目标在射程内 → 停住不移动（进入攻击判定）
 *      - 其他 → BFS 寻路到目标位置（远程寻到射程边缘）
 *   3. 普攻（按 attackSpeed 间隔）
 *      - 独立于技能系统
 *      - 目标在攻击射程内 + 攻击间隔到了 → 执行
 *   4. 被堵处理
 *      - 下一格被占用 → 预定失败，停住
 *      - stuckCounter ≥ 5 → 丢目标，下一轮重选
 *
 * 状态系统：每秒 tick 结算一次（dt 累计到 1 秒再统一处理）
 */

import type {
  BattleCharacter,
  BattleMap,
  StatusInstance,
  StatusType,
  TerrainType,
  Skill,
} from './gameData'
import { STATUS_CONFIG } from './gameData'

// ============================================================
// 类型定义
// ============================================================

/** 模拟角色（非响应式 plain object，BattleManager 内部使用） */
export interface SimChar {
  id: string
  characterId: string
  row: number
  col: number
  hp: number
  maxHp: number
  mp: number
  maxMp: number
  attack: number
  defense: number
  moveSpeed: number        // 格/秒
  attackRange: number     // 格子数（1 = 近战）
  attackSpeed: number     // 次/秒
  isPlayer: boolean
  job: string
  faction: string
  aiType: 'ranged' | 'sniper' | 'skirmisher' // 远攻/狙击/缠斗
  skills: Skill[]
  statuses: StatusInstance[]
  // 运行时字段
  lastAttackTime: number      // ms
  targetCharacterId?: string
  path: { row: number; col: number }[]
  stuckCounter: number
  moveAccumulator: number     // 小数累积（moveSpeed × dt）
  lastStatusTickTime: number  // 状态上次完整结算的时间戳
  statusAccumulators: Record<string, number> // 每种状态的 dt 累积（秒）
  dead: boolean
  // 战斗统计（endBattle 结算用）
  totalDamage: number  // 对敌人造成的伤害
  totalHeal: number    // 对队友造成的治疗
}

/** 模拟战斗状态（非响应式） */
export interface SimBattleState {
  mapWidth: number
  mapHeight: number
  terrain: TerrainType[][]         // 静态地形（不含角色）
  chars: SimChar[]                 // 所有角色（玩家 + 敌方）
  playerChars: SimChar[]
  enemyChars: SimChar[]
  paused: boolean
  speedMultiplier: number
  battleStartTime: number
  battleEnded: boolean
  winner?: 'player' | 'enemy'
  // 事件队列（BattleManager 消费后触发 Vue 渲染层）
  events: SimBattleEvent[]
  // 角色预定槽（每个 tick 开始时清空，用于解决同格冲突）
  cellReservations: Set<string>
  destroyedCharacters: { id: string; char: SimChar }[]
  weatherLastTickTime: number  // 天气效果上次结算时间戳
}

/** 战斗事件（用于触发 UI 层的特效/日志等） */
export type SimBattleEvent =
  | { type: 'attack'; attackerId: string; targetId: string; damage: number }
  | { type: 'skill'; casterId: string; skillId: string; targetIds: string[] }
  | { type: 'status'; targetId: string; statusType: StatusType; duration: number }
  | { type: 'death'; charId: string }
  | { type: 'move'; charId: string; fromRow: number; fromCol: number; toRow: number; toCol: number }
  | { type: 'weather_damage'; row: number; col: number; hpDamage: number; mpDamage: number; source: 'fire' | 'sky_fire' }
  | { type: 'weather_heal'; row: number; col: number; hpHeal: number; mpHeal: number }

// ============================================================
// 工具函数
// ============================================================

/** 曼哈顿距离（只支持横竖，不支持对角线） */
export function manhattan(a: { row: number; col: number }, b: { row: number; col: number }): number {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col)
}

/** 坐标 key（用于 Map/Set） */
function key(row: number, col: number): string {
  return `${row},${col}`
}

/** 检查地形是否可通行（不含角色占用） */
function isTerrainPassable(terrain: TerrainType): boolean {
  return terrain === 'empty' || terrain === 'snow'
}

/** 构造 4 邻居（上下左右） */
function get4Neighbors(row: number, col: number, height: number, width: number): { row: number; col: number }[] {
  const result: { row: number; col: number }[] = []
  if (row > 0) result.push({ row: row - 1, col })
  if (row < height - 1) result.push({ row: row + 1, col })
  if (col > 0) result.push({ row, col: col - 1 })
  if (col < width - 1) result.push({ row, col: col + 1 })
  return result
}

// ============================================================
// BFS 寻路（4 方向 only）
// ============================================================

/**
 * BFS 最短路径（只走横竖 4 个方向）
 * @returns 从 start 的下一格到 goal 的路径数组（含 goal），或 null（无路）
 */
export function bfsPath(
  start: { row: number; col: number },
  goal: { row: number; col: number },
  terrain: TerrainType[][],
  blockedCells: Set<string>,
  height: number,
  width: number
): { row: number; col: number }[] | null {
  // 早停：start 就是 goal
  if (start.row === goal.row && start.col === goal.col) return []

  // 同行/同列也走完整 BFS — 直线优化容易被堵就 return null，
  // 而网格只有 11x13，BFS 性能完全足够
  const visited = new Set<string>([key(start.row, start.col)])
  const parent = new Map<string, { row: number; col: number } | null>()
  parent.set(key(start.row, start.col), null)

  const queue: { row: number; col: number }[] = [start]

  while (queue.length > 0) {
    const current = queue.shift()!

    // 到达目标 → 回溯路径
    if (current.row === goal.row && current.col === goal.col) {
      const path: { row: number; col: number }[] = []
      let node: { row: number; col: number } | null = current
      while (node) {
        if (!(node.row === start.row && node.col === start.col)) {
          path.unshift({ row: node.row, col: node.col })
        }
        node = parent.get(key(node.row, node.col)) ?? null
      }
      return path
    }

    for (const next of get4Neighbors(current.row, current.col, height, width)) {
      const k = key(next.row, next.col)
      if (visited.has(k)) continue
      if (!isTerrainPassable(terrain[next.row][next.col])) continue
      if (blockedCells.has(k)) continue

      visited.add(k)
      parent.set(k, current)
      queue.push(next)
    }
  }

  return null // 无路
}

/** 构造同行/同列的直线路径 */
function buildStraightLine(from: { row: number; col: number }, to: { row: number; col: number }): { row: number; col: number }[] {
  const path: { row: number; col: number }[] = []
  if (from.row === to.row) {
    const step = from.col < to.col ? 1 : -1
    for (let c = from.col + step; c !== to.col + step; c += step) {
      path.push({ row: from.row, col: c })
    }
  } else {
    const step = from.row < to.row ? 1 : -1
    for (let r = from.row + step; r !== to.row + step; r += step) {
      path.push({ row: r, col: from.col })
    }
  }
  return path
}

// ============================================================
// 目标选择
// ============================================================

/** 找最近的敌方角色（排除自己和已死亡） */
function findNearestEnemy(char: SimChar, enemies: SimChar[]): SimChar | null {
  let best: SimChar | null = null
  let bestDist = Infinity
  for (const e of enemies) {
    if (e.id === char.id || e.dead) continue
    const d = manhattan(char, e)
    if (d < bestDist) {
      bestDist = d
      best = e
    }
  }
  return best
}

/** 找射程内的最近敌人（远程用，排除自己和已死亡） */
function findInRangeEnemy(char: SimChar, enemies: SimChar[]): SimChar | null {
  let best: SimChar | null = null
  let bestDist = Infinity
  for (const e of enemies) {
    if (e.id === char.id || e.dead) continue
    const d = manhattan(char, e)
    if (d <= char.attackRange && d < bestDist) {
      bestDist = d
      best = e
    }
  }
  return best
}

/** 找射程内防御最低的敌人（远攻/缠斗类型用） */
function findInRangeEnemyByDefense(char: SimChar, enemies: SimChar[]): SimChar | null {
  let best: SimChar | null = null
  let bestScore = Infinity
  for (const e of enemies) {
    if (e.id === char.id || e.dead) continue
    if (manhattan(char, e) > char.attackRange) continue
    // 防御越低越优先；防御相同时选距离近的
    const score = e.defense * 1000 + manhattan(char, e)
    if (score < bestScore) {
      bestScore = score
      best = e
    }
  }
  return best
}

/** 找射程内生命值最低的敌人（狙击类型用） */
function findInRangeEnemyByHp(char: SimChar, enemies: SimChar[]): SimChar | null {
  let best: SimChar | null = null
  let bestScore = Infinity
  for (const e of enemies) {
    if (e.id === char.id || e.dead) continue
    if (manhattan(char, e) > char.attackRange) continue
    // HP百分比越低越优先；HP相同时选距离近的
    const hpPct = e.maxHp > 0 ? e.hp / e.maxHp : 1
    const score = hpPct * 10000 + manhattan(char, e)
    if (score < bestScore) {
      bestScore = score
      best = e
    }
  }
  return best
}

/**
 * 远程角色：找离目标最近、且位于射程边缘（距目标 attackRange 格）的可达格子
 * 也就是在目标周围距离 = attackRange 的圈上，找离自己最近的可达格
 */
function findRangedApproachPoint(
  char: SimChar,
  target: SimChar,
  terrain: TerrainType[][],
  blockedCells: Set<string>,
  height: number,
  width: number
): { row: number; col: number } {
  // 如果自己已经在射程内了，就停住（返回自己当前位置，让移动判定跳过）
  if (manhattan(char, target) <= char.attackRange) {
    return { row: char.row, col: char.col }
  }

  // 枚举目标周围所有曼哈顿距离 = attackRange 的格子
  const range = char.attackRange
  let best: { row: number; col: number } | null = null
  let bestDist = Infinity

  for (let r = 0; r < height; r++) {
    for (let c = 0; c < width; c++) {
      const d = Math.abs(r - target.row) + Math.abs(c - target.col)
      if (d !== range) continue
      // 可达：地形可通行 + 没有角色占位 + 不是目标自身的位置
      if (!isTerrainPassable(terrain[r][c])) continue
      if (blockedCells.has(key(r, c))) continue
      if (r === target.row && c === target.col) continue
      // 找离自己最近的
      const myDist = manhattan(char, { row: r, col: c })
      if (myDist < bestDist) {
        bestDist = myDist
        best = { row: r, col: c }
      }
    }
  }

  // 如果找不到射程边缘格（被地形围死），退而求其次找最靠近目标的可达格
  if (!best) {
    for (let r = 0; r < height; r++) {
      for (let c = 0; c < width; c++) {
        if (!isTerrainPassable(terrain[r][c])) continue
        if (blockedCells.has(key(r, c))) continue
        if (r === char.row && c === char.col) continue
        const targetDist = Math.abs(r - target.row) + Math.abs(c - target.col)
        if (targetDist < bestDist) {
          bestDist = targetDist
          best = { row: r, col: c }
        }
      }
    }
  }

  return best ?? { row: target.row, col: target.col }
}

// ============================================================
// 伤害计算（简化版，直接用攻击 - 防御，支持暴击）
// 完整伤害公式在 gameStore.ts 里，后面可以从那里移植过来
// ============================================================

/** 简化版伤害计算 */
export function computeAutoDamage(attacker: SimChar, target: SimChar): number {
  // 基础伤害 = 攻击力 - 防御力 × 0.5（至少 1）
  let damage = attacker.attack - target.defense * 0.5
  damage = Math.max(1, Math.floor(damage))
  // 简单暴击判定（10% 概率，1.5 倍）
  if (Math.random() < 0.1) {
    damage = Math.floor(damage * 1.5)
  }
  return damage
}

// ============================================================
// 技能 AI — 自动选择 + 执行
// ============================================================

/** 角色血量百分比（0-1） */
function getHpPct(char: SimChar): number {
  return char.maxHp > 0 ? char.hp / char.maxHp : 0
}

/** 角色蓝量百分比（0-1） */
function getMpPct(char: SimChar): number {
  return char.maxMp > 0 ? char.mp / char.maxMp : 0
}

/** 检查技能冷却是否就绪（now 单位 ms） */
function getSkillCooldownRemaining(char: SimChar, skillId: string, now: number): number {
  const lastUsed = char.skillLastUsedTime?.[skillId] ?? 0
  const cdMs = char.skillCooldownMap?.[skillId] ?? 0
  return Math.max(0, (lastUsed + cdMs) - now)
}

/** 从 Skill.frequency 算冷却毫秒数 */
function getSkillCooldownMs(skill: Skill): number {
  return (skill.frequency ?? 6) * 1000
}

/** 检查技能是否可以释放（冷却 + MP + 沉默 + HP阈值） */
export function canCastSkill(char: SimChar, skill: Skill, now: number): boolean {
  // 被动技能跳过
  if (skill.type === 'passive') return false
  // 冷却检查
  const lastUsed = char.skillLastUsedTime?.[skill.id] ?? 0
  const cdMs = getSkillCooldownMs(skill)
  if (now - lastUsed < cdMs) return false
  // MP 检查
  if (char.mp < skill.mpCost) return false
  // 沉默检查
  if (isSilenced(char)) return false
  // HP 阈值检查（如 selfHpThreshold: 需要当前血量 ≥ X% 才能用）
  if (skill.selfHpThreshold !== undefined && getHpPct(char) < skill.selfHpThreshold) return false
  // requireHpGtAtk: 当前HP必须 > 攻击力
  if (skill.requireHpGtAtk && char.hp <= char.attack) return false
  return true
}

/** 按优先级给技能打分（数值越高越优先） */
function scoreSkill(char: SimChar, skill: Skill, state: SimBattleState): number {
  let score = 0
  const hpPct = getHpPct(char)
  const allies = char.isPlayer ? state.playerChars : state.enemyChars
  const enemies = char.isPlayer ? state.enemyChars : state.playerChars
  const aliveAllies = allies.filter(a => !a.dead)
  const aliveEnemies = enemies.filter(e => !e.dead)

  // === 治疗技能 ===
  if (skill.type === 'heal') {
    // 找血量最低的队友
    const lowestHpAlly = aliveAllies.reduce((lowest, a) =>
      getHpPct(a) < getHpPct(lowest) ? a : lowest, aliveAllies[0])
    const lowestPct = lowestHpAlly ? getHpPct(lowestHpAlly) : 1
    // 队友血越残，越优先
    score += (1 - lowestPct) * 100
    // 自己血少更需要治疗
    if (lowestHpAlly?.id === char.id) score += 30
    return score
  }

  // === 攻击技能 ===
  if (skill.type === 'attack') {
    // AOE 优先（多个敌人能被覆盖）
    if (skill.category === 'aoe' || skill.areaRange) {
      // 粗略估计：如果有 ≥ 2 个敌人在技能范围内
      const range = skill.range ?? char.attackRange
      let targetsInRange = 0
      for (const e of aliveEnemies) {
        if (manhattan(char, e) <= range + (skill.areaRange ?? 0)) {
          targetsInRange++
        }
      }
      // 多杀奖励
      score += targetsInRange * 25
      if (targetsInRange >= 2) score += 40 // AOE 额外加成
    }

    // 直线/横扫也有群体覆盖
    if (skill.category === '直线' || skill.category === '横扫') {
      score += 20
    }

    // 有状态效果的攻击技能优先（控制/伤害加深）
    if (skill.statusEffect || skill.statusEffects?.length) score += 20

    // 吸血技能残血时优先
    if (skill.lifesteal && hpPct < 0.3) score += 30

    return score
  }

  // === 辅助/召唤技能 ===
  if (skill.type === 'support') {
    // 残血时辅助优先（加盾、驱散）
    if (hpPct < 0.5) score += 15
    // 召唤在敌方数量多时优先
    if (skill.category === 'summon') {
      score += Math.min(aliveEnemies.length * 5, 30)
    }
    return score
  }

  return score
}

/** 从角色技能列表中选最优可释放技能（自动 AI 用） */
export function pickBestSkill(char: SimChar, state: SimBattleState, now: number): Skill | null {
  if (!char.skills || char.skills.length === 0) return null
  if (isSilenced(char)) return null

  let bestSkill: Skill | null = null
  let bestScore = -1

  for (const skill of char.skills) {
    if (skill.type === 'passive') continue
    if (!canCastSkill(char, skill, now)) continue
    const s = scoreSkill(char, skill, state)
    if (s > bestScore) {
      bestScore = s
      bestSkill = skill
    }
  }

  return bestSkill
}

/** 获取技能目标位置列表（根据技能类型） */
export function getSkillTargetCells(
  char: SimChar,
  skill: Skill,
  state: SimBattleState
): { row: number; col: number }[] {
  const range = skill.range ?? char.attackRange
  const allies = char.isPlayer ? state.playerChars : state.enemyChars
  const enemies = char.isPlayer ? state.enemyChars : state.playerChars

  // === 治疗/辅助技能 → 找受伤最重的队友 ===
  if (skill.type === 'heal' || (skill.type === 'support' && skill.category === 'heal')) {
    const woundedAllies = allies
      .filter(a => !a.dead && a.id !== char.id && getHpPct(a) < 0.95)
      .sort((a, b) => getHpPct(a) - getHpPct(b))
    if (woundedAllies.length > 0) {
      const target = woundedAllies[0]
      return [{ row: target.row, col: target.col }]
    }
    // 实在没受伤队友，治疗自己
    return [{ row: char.row, col: char.col }]
  }

  // === 攻击/召唤 → 找敌人 ===
  if (skill.type === 'attack' || skill.category === 'summon') {
    // AOE / 直线 / 横扫：找覆盖最多敌人的位置
    if (skill.areaRange || skill.category === 'aoe') {
      // 简单策略：以射程内距离最近的敌人为中心
      const nearestInRange = enemies
        .filter(e => !e.dead && manhattan(char, e) <= range)
        .sort((a, b) => manhattan(char, a) - manhattan(char, b))
      if (nearestInRange.length > 0) {
        const target = nearestInRange[0]
        return [{ row: target.row, col: target.col }]
      }
    }

    // 直线：沿朝向最近敌人的方向
    if (skill.category === '直线') {
      const nearest = enemies
        .filter(e => !e.dead)
        .sort((a, b) => manhattan(char, a) - manhattan(char, b))[0]
      if (nearest) {
        // 从自身到敌人方向延伸 lineWidth 格
        const line: { row: number; col: number }[] = []
        const dr = Math.sign(nearest.row - char.row)
        const dc = Math.sign(nearest.col - char.col)
        const len = skill.lineWidth ?? 3
        for (let i = 1; i <= len; i++) {
          const r = char.row + dr * i
          const c = char.col + dc * i
          if (r >= 0 && r < state.mapHeight && c >= 0 && c < state.mapWidth) {
            line.push({ row: r, col: c })
          }
        }
        return line
      }
    }

    // 横扫：同样找方向
    if (skill.category === '横扫') {
      const nearest = enemies
        .filter(e => !e.dead)
        .sort((a, b) => manhattan(char, a) - manhattan(char, b))[0]
      if (nearest) {
        const sweepLen = skill.sweepLength ?? 3
        const sweepWid = skill.sweepWidth ?? 1
        const cells: { row: number; col: number }[] = []
        const dr = Math.sign(nearest.row - char.row)
        const dc = Math.sign(nearest.col - char.col)
        for (let i = 1; i <= sweepLen; i++) {
          cells.push({ row: char.row + dr * i, col: char.col + dc * i })
          // 宽度方向
          if (sweepWid > 1) {
            cells.push({ row: char.row + dr * i + dc, col: char.col + dc * i + dr })
          }
        }
        return cells
      }
    }

    // 指定单体：找射程内最近的敌人
    const nearest = enemies
      .filter(e => !e.dead && manhattan(char, e) <= range)
      .sort((a, b) => manhattan(char, a) - manhattan(char, b))
    if (nearest.length > 0) {
      return [{ row: nearest[0].row, col: nearest[0].col }]
    }
    // 射程内没敌人 → 返回空（说明技能放不了）
    return []
  }

  // === 其他（buff/debuff 自身目标）===
  return [{ row: char.row, col: char.col }]
}

/** 获取技能影响范围内的角色（用于 AOE 伤害/治疗） */
function getCharactersInArea(
  centerRow: number, centerCol: number,
  areaRange: number,
  state: SimBattleState,
  allySide: 'player' | 'enemy',
  char?: SimChar
): SimChar[] {
  const pool = allySide === 'player' ? state.playerChars : state.enemyChars
  return pool.filter(c =>
    !c.dead &&
    (char ? c.id !== char.id : true) &&
    manhattan({ row: centerRow, col: centerCol }, c) <= areaRange
  )
}

/** 技能伤害计算（比普攻更丰富） */
function computeSkillDamage(attacker: SimChar, target: SimChar, skill: Skill): number {
  let base = attacker.attack
  switch (skill.damageFormula) {
    case 'power':
      base = skill.power + attacker.attack * 0.5
      break
    case 'atk_plus_hp_pct':
      base = attacker.attack + attacker.maxHp * (skill.hpPct ?? 0.1)
      break
    case 'move_based':
      base = attacker.moveSpeed * skill.power
      break
    default:
      base = skill.power + attacker.attack * 0.5
  }
  // 基础伤害 = skill.power - 目标防御 × 0.3（至少 1）
  let damage = base - target.defense * 0.3
  damage = Math.max(1, Math.floor(damage))
  return damage
}

/** 应用状态效果到目标（带 duration 转秒） */
function applyStatusEffect(
  target: SimChar,
  statusType: StatusType,
  duration: number | undefined,
  events: SimBattleEvent[]
): void {
  // duration 如果来自模板（秒），直接存
  const dur = duration ?? 0
  // 去重：同类型已存在则刷新 duration
  const existing = target.statuses.find(s => s.type === statusType)
  if (existing) {
    existing.duration = Math.max(existing.duration, dur)
  } else {
    target.statuses.push({
      type: statusType,
      duration: dur,
      source: 'skill',
    })
  }
  events.push({ type: 'status', targetId: target.id, statusType, duration: dur })
}

/** 执行技能效果（返回 true 表示成功释放） */
export function castSkillEffect(
  char: SimChar,
  skill: Skill,
  state: SimBattleState,
  events: SimBattleEvent[],
  targetRow?: number,
  targetCol?: number
): boolean {
  // 决定目标位置
  let targetCells: { row: number; col: number }[]
  if (targetRow !== undefined && targetCol !== undefined) {
    targetCells = [{ row: targetRow, col: targetCol }]
  } else {
    targetCells = getSkillTargetCells(char, skill, state)
  }
  if (targetCells.length === 0) return false

  // === 扣除 MP ===
  char.mp = Math.max(0, char.mp - skill.mpCost)

  // === 自损（selfHpCost）===
  if (skill.selfHpCost) {
    const hpLoss = skill.selfHpCostType === 'current'
      ? char.hp * skill.selfHpCost
      : char.maxHp * skill.selfHpCost
    char.hp = Math.max(1, char.hp - hpLoss) // 至少保留 1
  }

  // === 自 buff ===
  if (skill.selfHealPct) {
    char.hp = Math.min(char.maxHp, char.hp + char.maxHp * skill.selfHealPct)
  }
  if (skill.selfMpHealPct) {
    char.mp = Math.min(char.maxMp, char.mp + char.maxMp * skill.selfMpHealPct)
  }

  const allySide: 'player' | 'enemy' = char.isPlayer ? 'player' : 'enemy'
  const enemySide: 'player' | 'enemy' = char.isPlayer ? 'enemy' : 'player'
  const allies = char.isPlayer ? state.playerChars : state.enemyChars
  const enemies = char.isPlayer ? state.enemyChars : state.playerChars

  // === 遍历目标位置，对范围内角色产生效果 ===
  for (const tCell of targetCells) {
    // AOE 范围
    const areaRange = skill.areaRange ?? 0

    if (skill.type === 'heal') {
      // 治疗：对友方生效
      const healTargets = areaRange > 0
        ? getCharactersInArea(tCell.row, tCell.col, areaRange, state, allySide)
        : [allies.find(a => a.row === tCell.row && a.col === tCell.col && !a.dead)].filter(Boolean) as SimChar[]

      for (const t of healTargets) {
        // 治疗量 = skill.power 或 基于施法者 maxHp
        const baseHeal = skill.selfHealMaxHpPct
          ? char.maxHp * skill.selfHealMaxHpPct
          : skill.power + char.attack * 0.3
        const healAmount = Math.floor(baseHeal)
        t.hp = Math.min(t.maxHp, t.hp + healAmount)
        events.push({ type: 'attack', attackerId: char.id, targetId: t.id, damage: -healAmount })
      }
    } else if (skill.type === 'attack' || skill.category === 'aoe' || skill.category === '直线' || skill.category === '横扫') {
      // 攻击：对敌方生效
      const attackTargets = areaRange > 0
        ? getCharactersInArea(tCell.row, tCell.col, areaRange, state, enemySide)
        : [enemies.find(e => e.row === tCell.row && e.col === tCell.col && !e.dead)].filter(Boolean) as SimChar[]

      for (const t of attackTargets) {
        const dmg = computeSkillDamage(char, t, skill)
        t.hp -= dmg
        events.push({ type: 'attack', attackerId: char.id, targetId: t.id, damage: dmg })

        // 吸血
        if (skill.lifesteal) {
          const healed = Math.floor(dmg * skill.lifesteal)
          char.hp = Math.min(char.maxHp, char.hp + healed)
        }

        // 状态施加
        if (skill.statusEffect) {
          applyStatusEffect(t, skill.statusEffect, skill.statusEffectDuration, events)
        }
        if (skill.statusEffects && skill.statusEffects.length > 0) {
          const durs = skill.statusEffectsDurations || skill.statusEffects.map(() => undefined)
          for (let i = 0; i < skill.statusEffects.length; i++) {
            applyStatusEffect(t, skill.statusEffects[i], durs[i], events)
          }
        }

        // 死亡判定
        if (t.hp <= 0 && !t.dead) {
          t.hp = 0
          t.dead = true
          state.destroyedCharacters.push({ id: t.id, char: t })
          events.push({ type: 'death', charId: t.id })
        }
      }
    } else if (skill.type === 'support') {
      // 辅助：对友方或自身
      const supportTargets = areaRange > 0
        ? getCharactersInArea(tCell.row, tCell.col, areaRange, state, allySide)
        : [allies.find(a => a.row === tCell.row && a.col === tCell.col && !a.dead)].filter(Boolean) as SimChar[]

      for (const t of supportTargets) {
        if (skill.statusEffect) {
          applyStatusEffect(t, skill.statusEffect, skill.statusEffectDuration, events)
        }
        if (skill.statusEffects && skill.statusEffects.length > 0) {
          const durs = skill.statusEffectsDurations || skill.statusEffects.map(() => undefined)
          for (let i = 0; i < skill.statusEffects.length; i++) {
            applyStatusEffect(t, skill.statusEffects[i], durs[i], events)
          }
        }
      }
    }
  }

  // === 自身获得的状态 ===
  if (skill.selfStatusEffects && skill.selfStatusEffects.length > 0) {
    for (const st of skill.selfStatusEffects) {
      applyStatusEffect(char, st, 0, events)
    }
  }

  // === 召唤 ===
  if (skill.summonCharacter) {
    // 简化版：召唤物暂时不生成（需要从 HIREABLE_CHARACTERS 找模板，过于复杂）
    // 留个占位
  }

  return true
}

/** 尝试自动释放技能（返回 true 表示成功释放） */
export function tryAutoSkill(
  char: SimChar,
  state: SimBattleState,
  now: number,
  events: SimBattleEvent[]
): boolean {
  const skill = pickBestSkill(char, state, now)
  if (!skill) return false

  const ok = castSkillEffect(char, skill, state, events)
  if (ok) {
    // 记录冷却时间戳
    if (!char.skillLastUsedTime) char.skillLastUsedTime = {}
    char.skillLastUsedTime[skill.id] = now
    events.push({ type: 'skill', casterId: char.id, skillId: skill.id, targetIds: [] })
  }
  return ok
}

// ============================================================
// 状态计算
// ============================================================

/**
 * 每秒结算一次状态效果（dt 累积到 1 秒时触发）
 * 所有状态的秒效果已在 Phase 1 转成每秒效果
 */
function applyStatusTick(char: SimChar, dtSec: number, events: SimBattleEvent[]): void {
  for (let i = char.statuses.length - 1; i >= 0; i--) {
    const st = char.statuses[i]
    st.duration -= dtSec

    // 累积器
    char.statusAccumulators[st.type] = (char.statusAccumulators[st.type] || 0) + dtSec

    // 不同状态的每秒效果
    switch (st.type) {
      case 'burning':
        // 每秒 5% maxHp + 5% maxMp
        if (char.statusAccumulators[st.type] >= 1) {
          const tickCount = Math.floor(char.statusAccumulators[st.type])
          const hpDmg = Math.floor(char.maxHp * 0.05 * tickCount)
          const mpDmg = Math.floor(char.maxMp * 0.05 * tickCount)
          char.hp -= hpDmg
          char.mp -= mpDmg
          char.statusAccumulators[st.type] -= tickCount
        }
        break
      case 'bleeding':
        // 每秒 6% maxHp
        if (char.statusAccumulators[st.type] >= 1) {
          const tickCount = Math.floor(char.statusAccumulators[st.type])
          const dmg = Math.floor(char.maxHp * 0.06 * tickCount)
          char.hp -= dmg
          char.statusAccumulators[st.type] -= tickCount
        }
        break
      case 'dissipate':
        // 每秒 12.5% maxHp
        if (char.statusAccumulators[st.type] >= 1) {
          const tickCount = Math.floor(char.statusAccumulators[st.type])
          const dmg = Math.floor(char.maxHp * 0.125 * tickCount)
          char.hp -= dmg
          char.statusAccumulators[st.type] -= tickCount
        }
        break
      case 'poison':
        // 每秒 3% maxHp
        if (char.statusAccumulators[st.type] >= 1) {
          const tickCount = Math.floor(char.statusAccumulators[st.type])
          const dmg = Math.floor(char.maxHp * 0.03 * tickCount)
          char.hp -= dmg
          char.statusAccumulators[st.type] -= tickCount
        }
        break
      case 'disorder':
        // 每秒 5% maxMp
        if (char.statusAccumulators[st.type] >= 1) {
          const tickCount = Math.floor(char.statusAccumulators[st.type])
          char.mp -= Math.floor(char.maxMp * 0.05 * tickCount)
          char.statusAccumulators[st.type] -= tickCount
        }
        break
      case 'regen':
        // 每秒 5% maxHp
        if (char.statusAccumulators[st.type] >= 1) {
          const tickCount = Math.floor(char.statusAccumulators[st.type])
          const heal = Math.floor(char.maxHp * 0.05 * tickCount)
          char.hp = Math.min(char.maxHp, char.hp + heal)
          char.totalHeal += heal
          char.statusAccumulators[st.type] -= tickCount
        }
        break
      case 'heal':
        // 每秒 2.5% maxHp
        if (char.statusAccumulators[st.type] >= 1) {
          const tickCount = Math.floor(char.statusAccumulators[st.type])
          const heal = Math.floor(char.maxHp * 0.025 * tickCount)
          char.hp = Math.min(char.maxHp, char.hp + heal)
          char.totalHeal += heal
          char.statusAccumulators[st.type] -= tickCount
        }
        break
      case 'meditate':
        // 每秒 5% maxMp
        if (char.statusAccumulators[st.type] >= 1) {
          const tickCount = Math.floor(char.statusAccumulators[st.type])
          char.mp = Math.min(char.maxMp, char.mp + Math.floor(char.maxMp * 0.05 * tickCount))
          char.statusAccumulators[st.type] -= tickCount
        }
        break
      case 'tune':
        // 每秒 2.5% maxMp
        if (char.statusAccumulators[st.type] >= 1) {
          const tickCount = Math.floor(char.statusAccumulators[st.type])
          char.mp = Math.min(char.maxMp, char.mp + Math.floor(char.maxMp * 0.025 * tickCount))
          char.statusAccumulators[st.type] -= tickCount
        }
        break
    }

    // 状态过期移除
    if (st.duration <= 0) {
      char.statuses.splice(i, 1)
    }
  }

  // HP/MP 边界裁剪
  char.hp = Math.max(0, Math.min(char.maxHp, char.hp))
  char.mp = Math.max(0, Math.min(char.maxMp, char.mp))
}

/** 角色是否被禁锢/眩晕/寒冷（不能移动也不能攻击） */
function isFrozen(char: SimChar): boolean {
  return char.statuses.some(s => s.type === 'imprison' || s.type === 'stun' || s.type === 'cold')
}

/** 角色是否被沉默（不能用技能，但可以普攻和移动） */
function isSilenced(char: SimChar): boolean {
  return char.statuses.some(s => s.type === 'silenced')
}

/** 状态对属性的加成（移动速度/攻击速度） */
function applyStatusModifiers(char: SimChar): { moveSpeed: number; attackSpeed: number } {
  let moveSpeed = char.moveSpeed
  let attackSpeed = char.attackSpeed
  for (const st of char.statuses) {
    const cfg = STATUS_CONFIG[st.type]
    if (cfg.effects?.moveSpeedMod) moveSpeed += cfg.effects.moveSpeedMod
    if (cfg.effects?.attackSpeedMod) attackSpeed += cfg.effects.attackSpeedMod
  }
  return { moveSpeed: Math.max(0, moveSpeed), attackSpeed: Math.max(0, attackSpeed) }
}

// ============================================================
// 角色行为 tick（核心三段式）
// ============================================================

/** 每个 tick 内对单个角色执行的完整行为逻辑 */
function tickCharacter(
  char: SimChar,
  state: SimBattleState,
  dtMs: number,
  now: number,
  events: SimBattleEvent[]
): void {
  if (char.dead) return

  // ======== 状态门禁 ========
  if (isFrozen(char)) return // 禁锢/眩晕/寒冷 → 跳过整个 tick

  const dtSec = dtMs / 1000

  // 应用状态加成到 moveSpeed/attackSpeed
  const { moveSpeed: effMoveSpeed, attackSpeed: effAttackSpeed } = applyStatusModifiers(char)

  // 构建 blockedCells（所有其他角色当前位置 + 预定中的位置）
  const blockedCells = new Set<string>()
  for (const c of state.chars) {
    if (c.id !== char.id && !c.dead) {
      blockedCells.add(key(c.row, c.col))
    }
  }
  // 加上预定槽（同一 tick 内已经被预定的格子）
  for (const k of state.cellReservations) {
    blockedCells.add(k)
  }

  // ======== ① 攻击判定（优先） ========
  // 先确定敌我阵营（玩家的敌人是敌方，敌人的敌人是玩家）
  const enemies = char.isPlayer ? state.enemyChars : state.playerChars

  // 根据 aiType 选不同的目标选择策略
  let attackTarget: SimChar | null = null
  if (char.aiType === 'skirmisher' && char.attackRange <= 1) {
    // 缠斗·近战：找相邻的防御最低敌人
    attackTarget = findInRangeEnemyByDefense(char, enemies)
  } else if (char.aiType === 'skirmisher') {
    // 缠斗·远程（少见）：射程内防御最低敌人
    attackTarget = findInRangeEnemyByDefense(char, enemies)
  } else if (char.aiType === 'sniper') {
    // 狙击：射程内 HP 最低敌人
    attackTarget = findInRangeEnemyByHp(char, enemies)
  } else {
    // 远攻：射程内防御最低敌人
    attackTarget = findInRangeEnemyByDefense(char, enemies)
  }

  if (attackTarget) {
    const interval = 1000 / Math.max(0.1, effAttackSpeed)
    if (now - char.lastAttackTime >= interval) {
      // 执行普攻
      char.lastAttackTime = now
      const damage = computeAutoDamage(char, attackTarget)
      attackTarget.hp -= damage
      char.totalDamage += damage  // 统计：攻击者造成的伤害
      events.push({ type: 'attack', attackerId: char.id, targetId: attackTarget.id, damage })
      // 标记目标为最近攻击对象（目标可能因伤害而死亡，稍后统一处理）
      if (attackTarget.hp <= 0) {
        attackTarget.hp = 0
        attackTarget.dead = true
        events.push({ type: 'death', charId: attackTarget.id })
      }
    }
    // 缠斗类型：攻击后不 return，继续走移动段（边打边走）
    // 远攻/狙击：攻击后停住
    if (char.aiType !== 'skirmisher') {
      return
    }
  }

  // ======== ② 技能 AI 判定 ========
  if (!isSilenced(char)) {
    const casted = tryAutoSkill(char, state, now, events)
    if (casted) {
      // 技能放了就不移动（让下一个 tick 再决定移动方向）
      return
    }
  }

  // ======== ③ 移动判定 ========
  // 找目标（优先用已有 target，过期了再重选）
  let target: SimChar | null = null
  if (char.targetCharacterId) {
    target = state.chars.find(c => c.id === char.targetCharacterId && !c.dead) ?? null
  }
  if (!target) {
    target = findNearestEnemy(char, enemies)
    char.targetCharacterId = target?.id
    char.path = [] // 换目标了，路径作废
    char.stuckCounter = 0
  }
  if (!target) return // 没敌人了，发呆

  // 远攻/狙击：目标已在射程内 → 停住（不进上面的 attackTarget 说明攻击间隔还没到）
  // 缠斗类型：即使在射程内也继续移动靠近
  if (char.aiType !== 'skirmisher' && char.attackRange > 1 && manhattan(char, target) <= char.attackRange) {
    return
  }

  // 确定寻路目标点
  let goal: { row: number; col: number }
  if (char.aiType === 'skirmisher') {
    // 缠斗类型：直接追敌人，射程内也继续靠近
    goal = { row: target.row, col: target.col }
  } else if (char.attackRange > 1) {
    // 远程（远攻/狙击）：找射程边缘
    goal = findRangedApproachPoint(
      char, target, state.terrain, blockedCells, state.mapHeight, state.mapWidth
    )
  } else {
    // 近战
    goal = { row: target.row, col: target.col }
  }

  // 寻路（没路径、路径被堵、卡住 → 重算）
  const needNewPath =
    !char.path ||
    char.path.length === 0 ||
    char.stuckCounter >= 5 ||
    // 目标超出当前路径终点（目标移动了）
    (char.path.length > 0 &&
      (char.path[char.path.length - 1].row !== goal.row || char.path[char.path.length - 1].col !== goal.col))

  if (needNewPath) {
    // 复制一份 blockedCells，然后排除目标自身所在格子
    // （近战角色 BFS 的 goal 是敌人位置，必须允许 BFS 到达那里）
    const blockedForPath = new Set(blockedCells)
    blockedForPath.delete(key(goal.row, goal.col))

    char.path = bfsPath(
      { row: char.row, col: char.col },
      goal,
      state.terrain,
      blockedForPath,
      state.mapHeight,
      state.mapWidth
    ) ?? []
    char.stuckCounter = 0
  }

  // 执行移动：按 moveSpeed 累积
  if (char.path && char.path.length > 0) {
    char.moveAccumulator += effMoveSpeed * dtSec

    // 累积够 ≥ 1 格就走一步
    while (char.moveAccumulator >= 1 && char.path.length > 0) {
      const nextStep = char.path[0]
      const k = key(nextStep.row, nextStep.col)

      // 检查是否被占用（角色实体 + 预定槽）
      const entityBlocked = blockedCells.has(k)
      const reserved = state.cellReservations.has(k)

      if (entityBlocked || reserved) {
        // 被堵了 → 停止移动，等下一个 tick 重算
        char.stuckCounter++
        char.moveAccumulator = 0 // 清掉累积，避免一解除就飞 2 格
        break
      }

      // 预定 + 移动
      state.cellReservations.add(k)
      const fromRow = char.row
      const fromCol = char.col
      char.row = nextStep.row
      char.col = nextStep.col
      char.path.shift()
      char.moveAccumulator -= 1
      char.stuckCounter = 0

      // 用户明确说移动数据不需要记录，不再 push move 事件
      // events.push({ type: 'move', ... })
    }
  }

  // ======== ④ 原地发呆 ========
  // 没路径、卡住阈值到、没敌人都处理过了，什么都不做
}

// ============================================================
// BattleManager — 管理整个实时战斗
// ============================================================

/**
 * 战斗管理器
 * 使用 setInterval(50ms) 驱动逻辑 tick，setInterval(200ms) 驱动同步渲染
 */
export class BattleManager {
  private state: SimBattleState
  private tickInterval: number | null = null
  private syncInterval: number | null = null
  private lastTickTime = 0
  private tickCount = 0

  // 天气区域 getter（由 gameStore 构造时传入，因为 updateWeather 会重新赋值新数组）
  private getFireAreas: () => { row: number; col: number }[]
  private getSnowAreas: () => { row: number; col: number }[]
  private getFogAreas: () => { row: number; col: number }[]
  private onSyncCallback?: (state: SimBattleState) => void
  private onEndCallback?: (winner: 'player' | 'enemy') => void

  /**
   * @param initialMap BattleMap（秒制的初始状态，我们只提取初始位置/地形）
   * @param players 玩家角色列表（BattleCharacter）
   * @param enemies 敌方角色列表（BattleCharacter）
   */
  constructor(
    initialMap: BattleMap,
    players: BattleCharacter[],
    enemies: BattleCharacter[],
    getFireAreas: () => { row: number; col: number }[],
    getSnowAreas: () => { row: number; col: number }[],
    getFogAreas: () => { row: number; col: number }[]
  ) {
    this.getFireAreas = getFireAreas
    this.getSnowAreas = getSnowAreas
    this.getFogAreas = getFogAreas
    this.state = this.buildInitialState(initialMap, players, enemies)
  }

  // ========== 初始化 ==========

  /** 从 BattleMap + BattleCharacter[] 构建 SimBattleState */
  private buildInitialState(
    map: BattleMap,
    players: BattleCharacter[],
    enemies: BattleCharacter[]
  ): SimBattleState {
    // 提取静态地形（去掉角色占用）
    const terrain: TerrainType[][] = []
    for (let r = 0; r < map.height; r++) {
      terrain[r] = []
      for (let c = 0; c < map.width; c++) {
        terrain[r][c] = map.tiles[r][c].terrain
      }
    }

    const playerChars = players.map(bc => this.toSimChar(bc, true))
    const enemyChars = enemies.map(bc => this.toSimChar(bc, false))

    return {
      mapWidth: map.width,
      mapHeight: map.height,
      terrain,
      chars: [...playerChars, ...enemyChars],
      playerChars,
      enemyChars,
      paused: false,
      speedMultiplier: 1,
      battleStartTime: Date.now(),
      battleEnded: false,
      events: [],
      cellReservations: new Set(),
      destroyedCharacters: [],
      weatherLastTickTime: Date.now(),
    }
  }

  /** BattleCharacter → SimChar */
  private toSimChar(bc: BattleCharacter, isPlayer: boolean): SimChar {
    // aiType：优先用角色显式指定的，否则按 attackRange 自动推断
    // 规则（用户要求）：1-2→缠斗, 3→远攻, >3→狙击
    let aiType: 'ranged' | 'sniper' | 'skirmisher'
    if (bc.aiType) {
      aiType = bc.aiType
    } else if (bc.attackRange <= 2) {
      aiType = 'skirmisher' // 缠斗
    } else if (bc.attackRange === 3) {
      aiType = 'ranged'     // 远攻
    } else {
      aiType = 'sniper'     // 狙击（>3）
    }

    return {
      id: bc.id,
      characterId: bc.characterId,
      row: bc.row,
      col: bc.col,
      hp: bc.hp,
      maxHp: bc.maxHp,
      mp: bc.mp,
      maxMp: bc.maxMp,
      attack: bc.attack,
      defense: bc.defense,
      moveSpeed: bc.moveSpeed,
      attackRange: bc.attackRange,
      attackSpeed: bc.attackSpeed || 1, // 默认每秒 1 次
      isPlayer,
      job: bc.job,
      faction: bc.faction,
      aiType,
      skills: (bc as unknown as { skills?: Skill[] }).skills ?? [],
      statuses: bc.statuses || [],
      lastAttackTime: 0,
      path: [],
      stuckCounter: 0,
      moveAccumulator: 0,
      lastStatusTickTime: Date.now(),
      statusAccumulators: {},
      dead: false,
      totalDamage: 0,
      totalHeal: 0,
    }
  }

  // ========== 控制接口 ==========

  /** 开始战斗 */
  start(): void {
    if (this.tickInterval) return
    this.lastTickTime = Date.now()
    this.tickInterval = setInterval(() => this.tick(), 50) as unknown as number // 固定 50ms tick
    this.syncInterval = setInterval(() => this.sync(), 200) as unknown as number // 200ms 同步渲染
  }

  /** 暂停战斗 */
  pause(): void {
    this.state.paused = true
  }

  /** 恢复战斗 */
  resume(): void {
    if (!this.state.paused) return
    this.state.paused = false
    this.lastTickTime = Date.now() // 重置时间基准，避免 dt 跳变
  }

  /** 切换暂停状态 */
  togglePause(): void {
    if (this.state.paused) this.resume()
    else this.pause()
  }

  /** 设置速度倍率（1x / 2x / 3x） */
  setSpeedMultiplier(multiplier: number): void {
    this.state.speedMultiplier = multiplier
  }

  /** 停止战斗并清理 */
  stop(): void {
    if (this.tickInterval) {
      clearInterval(this.tickInterval)
      this.tickInterval = null
    }
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
  }

  /** 设置同步回调（UI 层用来更新渲染） */
  onSync(callback: (state: SimBattleState) => void): void {
    this.onSyncCallback = callback
  }

  /** 设置战斗结束回调 */
  onEnd(callback: (winner: 'player' | 'enemy') => void): void {
    this.onEndCallback = callback
  }

  /** 获取当前状态（只读快照，供 UI 查询） */
  getState(): Readonly<SimBattleState> {
    return this.state
  }

  /** 便捷：当前是否暂停 */
  isPaused(): boolean {
    return this.state.paused
  }

  /** 便捷：当前速度倍率 */
  getSpeedMultiplier(): number {
    return this.state.speedMultiplier
  }

  /** 便捷：战斗是否已结束 */
  isEnded(): boolean {
    return this.state.battleEnded
  }

  /** 便捷：获取胜者（战斗未结束时 undefined） */
  getWinner(): 'player' | 'enemy' | undefined {
    return this.state.winner
  }

  /**
   * 暂停指挥：玩家手动释放技能
   * @param charId 角色 ID
   * @param skillId 技能 ID
   * @param targetRow 目标行（可选，AOE/指定技能需要）
   * @param targetCol 目标列（可选）
   * @returns 是否成功释放
   */
  castSkillByPlayer(charId: string, skillId: string, targetRow?: number, targetCol?: number): boolean {
    const char = this.state.chars.find(c => c.id === charId)
    if (!char || char.dead) return false

    // 找技能定义
    const skill = char.skills.find(s => s.id === skillId)
    if (!skill) return false

    const now = Date.now()
    if (!canCastSkill(char, skill, now)) return false

    // 检查技能范围（如果指定了目标格）
    if (targetRow !== undefined && targetCol !== undefined) {
      const range = skill.range ?? char.attackRange
      if (manhattan(char, { row: targetRow, col: targetCol }) > range) return false
    }

    const ok = castSkillEffect(char, skill, this.state, this.state.events, targetRow, targetCol)
    if (ok) {
      if (!char.skillLastUsedTime) char.skillLastUsedTime = {}
      char.skillLastUsedTime[skillId] = now
      this.state.events.push({
        type: 'skill',
        casterId: charId,
        skillId,
        targetIds: targetRow !== undefined ? [`${targetRow},${targetCol}`] : [],
      })
      // 立即检查战斗结束
      this.checkBattleEnd()
      return true
    }
    return false
  }

  /** 查询角色技能剩余冷却（毫秒），-1 表示不存在 */
  getSkillCooldownFor(charId: string, skillId: string): number {
    const char = this.state.chars.find(c => c.id === charId)
    if (!char) return -1
    const skill = char.skills.find(s => s.id === skillId)
    if (!skill) return -1
    const lastUsed = char.skillLastUsedTime?.[skillId] ?? 0
    const cdMs = (skill.frequency ?? 6) * 1000
    return Math.max(0, (lastUsed + cdMs) - Date.now())
  }

  /** 角色是否是己方玩家角色（暂停指挥时 UI 用来判断） */
  isPlayerChar(charId: string): boolean {
    const char = this.state.chars.find(c => c.id === charId)
    return !!char?.isPlayer && !char.dead
  }

  // ========== 核心 tick ==========

  /** 固定 50ms 驱动的逻辑循环 */
  private tick(): void {
    if (this.state.paused || this.state.battleEnded) {
      this.lastTickTime = Date.now()
      return
    }

    const now = Date.now()
    // 实际 dt = 基础 tick(50ms) × speedMultiplier
    const dtMs = (now - this.lastTickTime) * this.state.speedMultiplier
    this.lastTickTime = now
    this.tickCount++

    // 清空上一轮的预定槽
    this.state.cellReservations.clear()

    // 清空事件队列（由 sync 消费后这里才清，sync 每 200ms 触发一次，
    // 事件可能跨多个 tick 积累，所以这里不清，让 sync 清）

    // 遍历所有角色执行 tickCharacter
    const fireAreas = this.getFireAreas()
    const snowAreas = this.getSnowAreas()
    const fogAreas = this.getFogAreas()
    for (const char of this.state.chars) {
      if (char.dead) continue

      // 雪区减速：角色在 snowAreas 里时 moveSpeed × 0.7（减速 30%）
      const origMoveSpeed = char.moveSpeed
      if (this.isInArea(snowAreas, char.row, char.col)) {
        char.moveSpeed = origMoveSpeed * 0.7
      }

      // 雾区减射程：角色在 fogAreas 里时 attackRange - 2（最低 1）
      const origAtkRange = char.attackRange
      if (this.isInArea(fogAreas, char.row, char.col)) {
        char.attackRange = Math.max(1, origAtkRange - 2)
      }

      tickCharacter(char, this.state, dtMs, now, this.state.events)

      // 恢复被雪/雾临时修改的属性（不能污染基础值）
      char.moveSpeed = origMoveSpeed
      char.attackRange = origAtkRange

      // 状态结算（每秒一次）
      applyStatusTick(char, dtMs / 1000, this.state.events)

      // 死亡判定
      if (char.hp <= 0 && !char.dead) {
        char.dead = true
        this.state.destroyedCharacters.push({ id: char.id, char })
        this.state.events.push({ type: 'death', charId: char.id })
      }
    }

    // 天气效果每秒结算一次：火区烧血（上一次 tick 后满 1 秒）
    const elapsedWeather = (now - this.state.weatherLastTickTime) / 1000
    if (elapsedWeather >= 1) {
      this.state.weatherLastTickTime = now
      // 火区：每秒 5% HP + 5% MP 扣血
      for (const char of this.state.chars) {
        if (char.dead) continue
        if (this.isInArea(fireAreas, char.row, char.col)) {
          const hpDmg = Math.max(1, Math.floor(char.maxHp * 0.05))
          const mpDmg = Math.max(1, Math.floor(char.maxMp * 0.05))
          char.hp = Math.max(0, char.hp - hpDmg)
          char.mp = Math.max(0, char.mp - mpDmg)
          this.state.events.push({
            type: 'weather_damage',
            row: char.row, col: char.col,
            hpDamage: hpDmg, mpDamage: mpDmg,
            source: 'fire'
          })
          if (char.hp <= 0 && !char.dead) {
            char.dead = true
            this.state.destroyedCharacters.push({ id: char.id, char })
            this.state.events.push({ type: 'death', charId: char.id })
          }
        }
      }
    }

    // 每秒打印一次诊断日志
    if (this.tickCount % 20 === 0) {
      for (const c of this.state.chars) {
        if (c.dead) continue
        const blocked = isFrozen(c) ? 'FROZEN' : ''
        const target = c.targetCharacterId ? `→${c.targetCharacterId.slice(-4)}` : '无目标'
        const pathLen = c.path?.length ?? 0
        const dmg = c.lastAttackTime > 0 ? `${Math.floor((now - c.lastAttackTime) / 100) / 10}s前攻击` : '未攻击'
        console.log(`[BT] ${c.id}(${c.isPlayer ? 'P' : 'E'}) (${c.row},${c.col}) mvSpeed=${c.moveSpeed} atkRange=${c.attackRange} atkSpeed=${c.attackSpeed} ${target} path=${pathLen} stuck=${c.stuckCounter} ${dmg} ${blocked}`)
      }
    }

    // 检查战斗结束
    this.checkBattleEnd()
  }

  // ========== 天气区域辅助 ==========

  /** 判断 (row,col) 是否在某个天气区域里 */
  private isInArea(areas: { row: number; col: number }[], row: number, col: number): boolean {
    for (const a of areas) {
      if (a.row === row && a.col === col) return true
    }
    return false
  }

  /** 检查是否有一方角色全部阵亡 */
  private checkBattleEnd(): void {
    if (this.state.battleEnded) return
    const playerAlive = this.state.playerChars.some(c => !c.dead)
    const enemyAlive = this.state.enemyChars.some(c => !c.dead)

    if (!playerAlive || !enemyAlive) {
      this.state.battleEnded = true
      this.state.winner = playerAlive ? 'player' : 'enemy'
      this.stop()
      this.onEndCallback?.(this.state.winner)
    }
  }

  // ========== 同步渲染 ==========

  /** 每 200ms 把非响应式状态同步给 Vue 渲染层（目前由 gameStore 自己消费 events 所以这里只做回调） */
  private sync(): void {
    this.onSyncCallback?.(this.state)
    // 注意：events 不清空，由 gameStore 的 100ms 定时器消费后清空
  }
}
