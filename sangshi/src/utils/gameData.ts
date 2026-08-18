export type Faction = 'human' | 'ghost' | 'beast' | 'immortal' | 'god' | 'demon'
export type Job = string
export type Rarity = 'common' | 'rare' | 'exceptional' | 'treasure' | 'celestial' | 'peerless'
export type ItemSubtype = 'weapon' | 'armor' | 'helmet' | 'shoes' | 'accessory' | 'book' | 'consumable' | 'chest' | 'soul'
export type TerrainType = 'empty' | 'river' | 'obstacle' | 'snow'
export type WeatherType = 'normal' | 'light_snow' | 'medium_snow' | 'heavy_snow' | 'mountain_fire' | 'sky_fire' | 'fog' | 'ghost_fog'
export type Attribute = 'normal' | 'metal' | 'wood' | 'water' | 'fire' | 'earth' | 'ice' | 'wind' | 'dark' | 'yang' | 'light' | 'yin'

// 状态系统类型
export type StatusType = 'poison' | 'burning' | 'silenced' | 'bleeding' | 'cold' | 'disorder' | 'stun' | 'resolute' | 'undying' | 'fury' | 'strong' | 'fierce' | 'swift' | 'lame' | 'weak' | 'heal' | 'regen' | 'tune' | 'meditate' | 'fear' | 'fragile' | 'crumble' | 'decay' | 'weakened' | 'imprison' | 'mili' | 'xinluan' | 'eagle_eye' | 'zhangmu' | 'dissipate'

// 状态配置：描述、图标、触发类型、标签（正面/负面）
// effects：战斗中对角色数值产生的百分比影响，正值为增益，负值为减益；用于攻击/防御计算逻辑自动读取
export type StatusTag = 'positive' | 'negative'

export interface StatusEffect {
  attackPercent?: number   // 攻击力百分比变化，如 20 表示 +20%
  defensePercent?: number  // 防御力百分比变化，如 -20 表示 -20%
  moveRange?: number       // 移动范围变化（整数，可为正负），如 1 表示 +1 格
  attackRange?: number     // 攻击范围变化（整数，可为正负），如 1 表示 +1 格
  maxHpPercent?: number    // 生命值上限百分比变化
  hpRegenPercent?: number  // 每回合恢复生命值百分比
  mpRegenPercent?: number  // 每回合恢复法力值百分比
}

export interface StatusConfig {
  id: StatusType
  name: string
  icon: string
  description: string
  tag: StatusTag
  effects?: StatusEffect
}

export interface StatusInstance {
  type: StatusType
  duration: number
}

export const STATUS_CONFIG: Record<StatusType, StatusConfig> = {
  poison: {
    id: 'poison',
    name: '中毒',
    icon: '☠',
    description: '每次操作（移动/攻击/技能）损失6%最大生命值',
    tag: 'negative',
  },
  burning: {
    id: 'burning',
    name: '燃烧',
    icon: '🔥',
    description: '每回合结束损失10%最大生命值和5%最大法力值',
    tag: 'negative',
  },
  silenced: {
    id: 'silenced',
    name: '沉默',
    icon: '🔇',
    description: '无法使用技能',
    tag: 'negative',
  },
  bleeding: {
    id: 'bleeding',
    name: '流血',
    icon: '🔴',
    description: '每回合结束损失12%最大生命值',
    tag: 'negative',
  },
  cold: {
    id: 'cold',
    name: '寒冷',
    icon: '❄',
    description: '无法移动',
    tag: 'negative',
  },
  disorder: {
    id: 'disorder',
    name: '紊乱',
    icon: '🌀',
    description: '每回合结束损失10%最大法力值',
    tag: 'negative',
  },
  stun: {
    id: 'stun',
    name: '眩晕',
    icon: '💫',
    description: '本回合只能防御，移动/攻击/技能均不可使用',
    tag: 'negative',
  },
  resolute: {
    id: 'resolute',
    name: '刚毅',
    icon: '🛡',
    description: '防御力提升30%',
    tag: 'positive',
    effects: { defensePercent: 30 },
  },
  undying: {
    id: 'undying',
    name: '不灭',
    icon: '🗡',
    description: '防御力提升50%',
    tag: 'positive',
    effects: { defensePercent: 50 },
  },
  fury: {
    id: 'fury',
    name: '愤怒',
    icon: '😡',
    description: '攻击力提升20%，防御力下降20%',
    tag: 'positive',
    effects: { attackPercent: 20, defensePercent: -20 },
  },
  strong: {
    id: 'strong',
    name: '强力',
    icon: '💪',
    description: '攻击力提升10%',
    tag: 'positive',
    effects: { attackPercent: 10 },
  },
  fierce: {
    id: 'fierce',
    name: '凶悍',
    icon: '👹',
    description: '攻击力提升20%',
    tag: 'positive',
    effects: { attackPercent: 20 },
  },
  swift: {
    id: 'swift',
    name: '迅捷',
    icon: '⚡',
    description: '移动力提升1',
    tag: 'positive',
    effects: { moveRange: 1 },
  },
  lame: {
    id: 'lame',
    name: '瘸腿',
    icon: '🚶',
    description: '移动力减少1',
    tag: 'negative',
    effects: { moveRange: -1 },
  },
  weak: {
    id: 'weak',
    name: '虚弱',
    icon: '🤒',
    description: '攻击力减少10%，防御力减少50%',
    tag: 'negative',
    effects: { attackPercent: -10, defensePercent: -50 },
  },
  heal: {
    id: 'heal',
    name: '愈合',
    icon: '💚',
    description: '每回合恢复5%最大生命值',
    tag: 'positive',
    effects: { hpRegenPercent: 5 },
  },
  regen: {
    id: 'regen',
    name: '再生',
    icon: '💖',
    description: '每回合恢复10%最大生命值',
    tag: 'positive',
    effects: { hpRegenPercent: 10 },
  },
  tune: {
    id: 'tune',
    name: '调息',
    icon: '💙',
    description: '每回合恢复5%最大法力值',
    tag: 'positive',
    effects: { mpRegenPercent: 5 },
  },
  meditate: {
    id: 'meditate',
    name: '静心',
    icon: '✨',
    description: '每回合恢复10%最大法力值',
    tag: 'positive',
    effects: { mpRegenPercent: 10 },
  },
  fear: {
    id: 'fear',
    name: '恐惧',
    icon: '😱',
    description: '只能移动，无法攻击或使用技能',
    tag: 'negative',
    effects: {},
  },
  fragile: {
    id: 'fragile',
    name: '脆弱',
    icon: '💔',
    description: '防御力下降50%',
    tag: 'negative',
    effects: { defensePercent: -50 },
  },
  crumble: {
    id: 'crumble',
    name: '脆皮',
    icon: '🐣',
    description: '生命值上限下降10%，防御力下降10%',
    tag: 'negative',
    effects: { maxHpPercent: -10, defensePercent: -10 },
  },
  decay: {
    id: 'decay',
    name: '腐朽',
    icon: '🍂',
    description: '生命值上限下降20%，防御力下降20%',
    tag: 'negative',
    effects: { maxHpPercent: -20, defensePercent: -20 },
  },
  weakened: {
    id: 'weakened',
    name: '削弱',
    icon: '📉',
    description: '攻击力下降10%，防御力下降10%',
    tag: 'negative',
    effects: { attackPercent: -10, defensePercent: -10 },
  },
  imprison: {
    id: 'imprison',
    name: '禁锢',
    icon: '🔒',
    description: '不能移动',
    tag: 'negative',
    effects: { moveRange: -999 },
  },
  mili: {
    id: 'mili',
    name: '迷离',
    icon: '😵',
    description: '攻击力下降10%',
    tag: 'negative',
    effects: { attackPercent: -10 },
  },
  xinluan: {
    id: 'xinluan',
    name: '心乱',
    icon: '🤔',
    description: '攻击力下降20%，防御力下降20%',
    tag: 'negative',
    effects: { attackPercent: -20, defensePercent: -20 },
  },
  eagle_eye: {
    id: 'eagle_eye',
    name: '鹰眼',
    icon: '🔭',
    description: '攻击范围+1',
    tag: 'positive',
    effects: { attackRange: 1 },
  },
  zhangmu: {
    id: 'zhangmu',
    name: '障目',
    icon: '🙈',
    description: '攻击范围-1',
    tag: 'negative',
    effects: { attackRange: -1 },
  },
  dissipate: {
    id: 'dissipate',
    name: '消散',
    icon: '💨',
    description: '每回合结束损失25%最大生命值',
    tag: 'negative',
  },
}

// 基于标签派生的状态集合，供驱散/增益等逻辑使用；新增状态时只需更新 STATUS_CONFIG 的 tag，这里会自动生效
export const NEGATIVE_STATUSES: StatusType[] = (Object.keys(STATUS_CONFIG) as StatusType[]).filter(id => STATUS_CONFIG[id].tag === 'negative')
export const POSITIVE_STATUSES: StatusType[] = (Object.keys(STATUS_CONFIG) as StatusType[]).filter(id => STATUS_CONFIG[id].tag === 'positive')

export interface SnowArea {
  row: number
  col: number
  source?: 'weather' | 'skill' // 来源：天气或技能
  expiresAfterPhase?: 'enemy' | 'player' // 技能雪地在哪个回合阶段结束后清除
}

export interface FireArea {
  row: number
  col: number
  source?: 'weather' | 'skill'
}

export interface FogArea {
  row: number
  col: number
  source?: 'weather'
}

export interface ItemStats {
  attack?: number
  defense?: number
  hp?: number
  mp?: number
  moveRange?: number
  attackRange?: number
  // 百分比加成（1-100）
  attackPercent?: number
  defensePercent?: number
  hpPercent?: number
  mpPercent?: number
}

export interface Skill {
  id: string
  name: string
  mpCost: number
  type: 'attack' | 'heal' | 'support' | 'passive'
  power: number
  cooldown: number
  currentCooldown: number
  description?: string
  range?: number // 技能释放范围（格子数）
  areaRange?: number // 范围技能的影响半径（以目标为中心的范围）
  effectType?: 'fire' | 'ice' | 'thunder' | 'shadow' | 'holy' | 'earth' | 'metal' | 'wood' | 'water' | 'wind' // 技能特效类型
  targetCount?: number // 多目标技能的目标数量，默认1
  attribute?: Attribute // 技能的属性（影响战斗字幕中的颜色显示）
  category?: '指定' | 'aoe' | '直线' | '横扫' | 'heal' | 'support' | 'summon' | 'special' // 技能分类：指定（选择目标攻击）、aoe（范围攻击）、直线（直线攻击）、横扫（方向横扫攻击）、heal（治疗）、support（辅助）、summon（召唤）、special（特殊）
  damageFormula?: 'power' | 'atk_plus_hp_pct' | 'move_based' // 伤害计算公式类型
  hpPct?: number // 当damageFormula为atk_plus_hp_pct时，目标当前生命值的百分比系数
  skillTypeTag?: string // 技能类型标签：攻击/辅助/治疗/特殊
  elementTag?: string // 元素标签：冰/火/雷/水等
  rangeTag?: string // 范围标签：1格/2格/3格等
  targetCountTag?: string // 目标数量标签：AOE/1个/2个/3个等
  statusEffect?: StatusType // AOE技能对目标施加的状态效果
  statusEffectDuration?: number // 状态效果持续回合数，0表示永久
  statusEffects?: StatusType[] // 技能对目标施加的多个状态效果
  statusEffectsDurations?: number[] // 对应statusEffects的持续回合数
  clearObstacles?: boolean // AOE技能是否清除范围内的障碍物
  rangeType?: 'diamond' | 'square' // AOE范围类型：菱形（曼哈顿距离）或正方形
  sweepLength?: number // 横扫技能的长度（沿方向的格子数，必须为奇数）
  sweepWidth?: number // 横扫技能的宽度（垂直方向的格子数）
  lineWidth?: number // 直线技能的宽度（垂直方向的格子数），默认1
  selfDefeat?: boolean // 使用后自身战败退场
  summonZombie?: boolean // 使用后召唤丧尸
  lifesteal?: number // 吸血比例（0-1）
  selfHpCost?: number // 自身生命值消耗比例（0-1）
  selfStatusEffects?: StatusType[] // 使用后自身获得的状态效果
  clearPositiveStatus?: boolean // 是否驱散目标所有正面状态
  createSnowTerrain?: boolean // 是否在目标脚下创建雪地地形
  selfMaxHpBuff?: number // 自身生命值上限提升比例（基于攻击力）
  summonCharacter?: string // 召唤技能召唤的角色ID
  summonJob?: string // 召唤技能召唤的职业类型（随机召唤该职业的角色）
  selfHpCostType?: 'current' | 'max' // 生命值消耗基于当前血量还是最大血量，默认max
  summonHpPct?: number // 召唤单位的生命值百分比（基于模板maxHp，0-1）
  selfHpThreshold?: number // 使用技能所需的最低生命值阈值（基于当前/最大，0-1）
  requireHpGtAtk?: boolean // 需要当前生命值大于攻击力才能使用
  summonMaxCount?: number // 同阵营召唤物最大数量
  summonCountId?: string // 用于统计召唤物数量的角色ID（如'shashengying'）
  summonStatusEffects?: StatusType[] // 召唤物获得的状态效果
  summonMpOverride?: number // 召唤物的法力值上限覆盖（固定值）
  reikiCost?: number // 消耗阵营灵气值
  shaQiCost?: number // 消耗阵营煞气值
  selfHealPct?: number // 自身生命值恢复比例（基于最大生命值，0-1）
  selfMpHealPct?: number // 自身法力值恢复比例（基于最大法力值，0-1）
  selfHealMaxHpPct?: number // 基于施法者最大生命值的恢复比例（用于AOE治疗技能）
  dispelRandomDebuffs?: number // 随机驱散负面状态的数量
  dispelAllDebuffs?: boolean // 驱散所有负面状态
  maxUsesPerBattle?: number // 每局战斗最大使用次数（每个角色独立计数）
}

export type Quality = '凡物' | '法器' | '灵器' | '古宝' | '仙器' | '神器'

export interface Item {
  id: string
  name: string
  icon: string
  type: 'equipment' | 'consumable'
  rarity: Rarity
  level: number
  subtype?: ItemSubtype
  count: number
  baseStats?: ItemStats
  description?: string
  grantedSkillId?: string
  setTag?: string
  quality?: Quality
  soulTargetId?: string  // 魂魄类型：目标角色ID，'universal'表示万能魂魄
}

export interface Equipment {
  weapon: Item | null
  armor: Item | null
  helmet: Item | null
  shoes: Item | null
  accessory: Item | null
  book: Item | null
}

export interface Character {
  id: string
  name: string
  faction: Faction
  job: Job
  level: number
  maxLevel: number
  exp: number
  baseMaxHp: number
  maxHp: number
  hp: number
  baseMaxMp: number
  maxMp: number
  mp: number
  baseAttack: number
  attack: number
  baseDefense: number
  defense: number
  baseMoveRange: number
  moveRange: number
  baseAttackRange: number
  attackRange: number
  skills: Skill[]
  equipment: Equipment
  avatar: string
  isPlayerOwned: boolean
  attribute?: Attribute
}

export interface Building {
  id: string
  type: 'spiritField' | 'elixirRoom' | 'heart' | 'barracks' | 'tianqiPao'
  name: string
  icon: string
  maxHp: number
  hp: number
}

export interface BattleBuilding {
  id: string
  type: 'spiritField' | 'elixirRoom' | 'heart' | 'barracks' | 'tianqiPao' | 'archerTower' | 'energyTower'
  name: string
  icon: string
  maxHp: number
  hp: number
  row: number
  col: number
  isPlayer: boolean
  spawnRound: number // 产出回合数
  hasSpawnedBonus: boolean // 是否已经产出过额外奖励
  targetPositions?: { row: number; col: number }[] // 天启炮的瞄准位置
  totalDamage?: number // 本局总伤害（用于天启炮）
  attack?: number // 攻击力
  defense?: number // 防御力
  attackRange?: number // 攻击范围
  level?: number // 等级
}

export interface HomeGridCell {
  row: number
  col: number
  terrain: TerrainType
  building: Building | null
}

export interface Player {
  id: string
  name: string
  gold: number
  day: number
  phase: 'day' | 'night'
  characters: Character[]
  inventory: Item[]
  homeGrid: HomeGridCell[][]
  createdAt: number
  updatedAt: number
}

export interface BattleCharacter {
  id: string
  characterId: string
  row: number
  col: number
  hp: number
  mp: number
  maxHp: number // 战斗中的血量上限（可能被技能提升）
  maxMp: number // 战斗中的法力上限（可能被技能提升）
  hasMoved: boolean
  hasActed: boolean // 攻击/技能/防御三选一
  isDefending: boolean
  isPlayer: boolean
  level: number // 角色等级
  defenseReduction?: number // 防御力降低百分比，0-100
  skillCooldowns?: Record<string, number> // key: skill id, value: current cooldown
  skillUseCount?: Record<string, number> // key: skill id, value: 本局已使用次数
  movedDistance?: number // 本回合移动的格子数
  totalDamage?: number // 本局总伤害
  totalHeal?: number // 本局总治疗
  attackBoost?: number // 攻击力提升百分比，0-100
  defenseReductionPermanent?: number // 防御力降低百分比（永久），0-100
  defense: number // 带装备加成的防御力
  attack: number // 带装备加成的攻击力
  moveRange: number // 带装备加成的移动范围
  attackRange: number // 带装备加成的攻击范围
  statuses: StatusInstance[] // 当前的状态列表：中毒/燃烧/沉默/流血/寒冷
  maxHpReductionHistory?: Record<string, number> // 状态生效前的生命值上限记录，key为状态类型，用于解除状态时恢复
  faction: string // 角色阵营
  job: string // 角色职业
}

export interface BattleTile {
  row: number
  col: number
  terrain: TerrainType
  character: BattleCharacter | null
  building: BattleBuilding | null
}

export interface BattleMap {
  id: string
  width: number
  height: number
  mode: 'offensive' | 'defensive'
  terrainType: string
  tiles: BattleTile[][]
  players: BattleCharacter[]
  enemies: BattleCharacter[]
  buildings: BattleBuilding[]
  collectibles: BattleCollectible[]
  loot: Item[]
  heartPosition?: { row: number; col: number }
  turn: number
  battlePhase: 'player' | 'enemy' | 'action'
  weather: WeatherType
  snowAreas: SnowArea[]
  fireAreas: FireArea[]
  fogAreas: FogArea[]
  enemyLevel: number
  initialEnemyCount: number
  defeatedCharacters: BattleCharacter[]
  destroyedBuildings: BattleBuilding[]
  playerReiki: number
  playerShaQi: number
  enemyReiki: number
  enemyShaQi: number
}

export interface BattleCollectible {
  id: string
  type: 'spirit_grass' | 'elixir'
  name: string
  icon: string
  description: string
  hpRestore?: number
  mpRestore?: number
  row: number
  col: number
}

export const FACTION_CONFIG: Record<Faction, { name: string; icon: string; color: string }> = {
  human: { name: '人界', icon: '👤', color: '#4ade80' },
  ghost: { name: '鬼界', icon: '💀', color: '#9333ea' },
  beast: { name: '妖界', icon: '👹', color: '#f97316' },
  immortal: { name: '仙界', icon: '☁️', color: '#60a5fa' },
  god: { name: '神界', icon: '⭐', color: '#fbbf24' },
  demon: { name: '魔界', icon: '🔥', color: '#ef4444' },
}

// 建筑配置 - maxHp为基础等级(1级)的血量，每级在1级基础上提高10%
export const BUILDING_CONFIG: Record<string, { 
  name: string; 
  icon: string; 
  description: string; 
  maxHp: number; 
  attack?: number; // 1级攻击力
  defense?: number; // 1级防御力
  attackRange?: number; // 攻击范围
  hpGrowth?: number; // 每级生命值增长
  attackGrowth?: number; // 每级攻击力增长
  defenseGrowth?: number; // 每级防御力增长
  spawnItem?: { id: string; count: number }; 
  spawnRound?: number; 
  spawnCharacter?: boolean; 
  characterFaction?: string; 
  characterJob?: string 
}> = {
  spiritField: { name: '灵田', icon: '🌾', description: '种植灵草的田地，战斗第5回合在4个相邻空格上生成最多4株灵草', maxHp: 200, spawnItem: { id: 'spirit_grass', count: 4 }, spawnRound: 5 },
  elixirRoom: { name: '丹房', icon: '🏯', description: '炼制丹药的场所，战斗第5回合在4个相邻空格上随机生成1个丹药', maxHp: 400, spawnItem: { id: 'elixir', count: 1 }, spawnRound: 5 },
  heart: { name: '血心', icon: '/static/avatars/ghost/xuexin.png', description: '鬼界的出兵建筑，每4回合生成一只丧尸', maxHp: 400, spawnRound: 4 },
  barracks: { name: '兵营', icon: '/static/avatars/human/bingying.png', description: '人界的出兵建筑，每6回合在周围生成一个随机职业为士兵的角色', maxHp: 600, spawnRound: 6, spawnCharacter: true, characterFaction: 'human', characterJob: '士兵' },
  tianqiPao: { name: '天启炮', icon: '/static/avatars/human/tianqipao.png', description: '人界的攻击建筑，奇数回合瞄准，偶数回合攻击被瞄准的目标', maxHp: 500 },
  archerTower: { name: '箭塔', icon: '/static/avatars/human/jianta.png', description: '每回合自动攻击4格范围内1个敌方目标，造成100%攻击力伤害', maxHp: 200, attack: 60, defense: 0, attackRange: 4, hpGrowth: 50, attackGrowth: 10, defenseGrowth: 0 },
  energyTower: { name: '灵能塔', icon: '/static/avatars/human/lingnengta.png', description: '每回合自动攻击4格范围内1个敌方目标，造成100%攻击力伤害', maxHp: 300, attack: 80, defense: 0, attackRange: 4, hpGrowth: 75, attackGrowth: 15, defenseGrowth: 0 },
}

// 装备配置 - 按类型分类展示
export const EQUIPMENT_CONFIG: Record<string, { name: string; icon: string; type: 'weapon' | 'armor' | 'helmet' | 'shoes' | 'accessory' | 'book'; baseStats: ItemStats; description: string; setTag?: string; quality?: Quality }[]> = {
  weapon: [
    { name: '教学剑', icon: '/static/avatars/items/jiaoxue_jian.png', type: 'weapon', baseStats: { attack: 5 }, description: '教学剑，攻击+5', quality: '凡物' },
    { name: '破损的剑', icon: '/static/avatars/items/posun_de_jian.png', type: 'weapon', baseStats: { attack: 10 }, description: '破损但仍可使用的剑', quality: '凡物' },
    { name: '餐刀', icon: '/static/avatars/items/caidao.png', type: 'weapon', baseStats: { attack: 8 }, description: '餐刀，攻击+8', quality: '凡物' },
    { name: '长矛', icon: '/static/avatars/items/changmao.png', type: 'weapon', baseStats: { attack: 15 }, description: '长矛，攻击+15', quality: '凡物' },
    { name: '长戈', icon: '/static/avatars/items/changge.png', type: 'weapon', baseStats: { attack: 12 }, description: '长戈，攻击+12', quality: '凡物' },
    { name: '白银狼牙棒', icon: '/static/avatars/items/baiyin_langyabang.png', type: 'weapon', baseStats: { attack: 25 }, description: '白银狼牙棒', quality: '凡物' },
    { name: '铁剑', icon: '/static/avatars/items/tiejian.png', type: 'weapon', baseStats: { attack: 20 }, description: '铁剑，攻击+20', quality: '凡物' },
    { name: '爪子刀', icon: '/static/avatars/items/zhuazidao.png', type: 'weapon', baseStats: { attack: 10 }, description: '爪子刀，攻击+10', quality: '凡物' },
    { name: '火羽', icon: '/static/avatars/items/huoyu.png', type: 'weapon', baseStats: { mp: 80, attack: 50, attackRange: 1 }, description: '法力值+80，攻击力+50，攻击范围+1，装备后获得专属技能【火羽流星】', quality: '仙器' },
    { name: '天雅', icon: '/static/avatars/items/tianya.png', type: 'weapon', baseStats: { mp: 80, attack: 40, attackRange: 1 }, description: '法力值+80，攻击力+40，攻击范围+1，装备后获得专属技能【天雅倾情】', quality: '仙器' },
    { name: '青云白鹤弓', icon: '/static/avatars/items/qingyunbaihegong.png', type: 'weapon', baseStats: { attack: 50, mp: 60, attackRange: 1 }, description: '攻击力+50，法力值+60，攻击范围+1，装备后获得专属技能【云鹤翔舞】', quality: '仙器' },
    { name: '精灵法杖', icon: '/static/avatars/items/jinglingfazhang.png', type: 'weapon', baseStats: { attack: 10, mp: 40 }, description: '精灵法杖，攻击+10，法力+40', setTag: '精灵', quality: '灵器' },
    { name: '巨兽尖牙', icon: '/static/avatars/items/jushoujianya.png', type: 'weapon', baseStats: { attack: 25, defense: 5 }, description: '巨兽尖牙，攻击+25，防御+5', setTag: '巨兽', quality: '灵器' },
  ],
  armor: [
    { name: '骑士甲胄', icon: '/static/avatars/items/qishi_jiazhou.png', type: 'armor', baseStats: { defense: 20, hp: 50 }, description: '防具，生命+50，防御+20', quality: '凡物' },
    { name: '棉衣', icon: '/static/avatars/items/mianyi.png', type: 'armor', baseStats: { hp: 20, defense: 5 }, description: '棉衣，生命+20，防御+5', quality: '凡物' },
    { name: '冒险者服装', icon: '/static/avatars/items/maoxianjiayifu.png', type: 'armor', baseStats: { hp: 25, defense: 10 }, description: '冒险者服装，生命+25，防御+10', quality: '凡物' },
    { name: '秀才服', icon: '/static/avatars/items/xiucaifu.png', type: 'armor', baseStats: { hp: 10, mp: 20, defense: 5 }, description: '秀才服，生命+10，法力+20，防御+5', quality: '凡物' },
  ],
  helmet: [
    { name: '白银赛车头盔', icon: '/static/avatars/items/baiyin_saiche_toukui.png', type: 'helmet', baseStats: { defense: 20, hp: 40 }, description: '白银赛车头盔，生命+40，防御+20', quality: '凡物' },
    { name: '战术头盔', icon: '/static/avatars/items/zhanshutoukui.png', type: 'helmet', baseStats: { hp: 40, defense: 20 }, description: '战术头盔，生命+40，防御+20', quality: '凡物' },
    { name: '冒险家帽子', icon: '/static/avatars/items/maoxianjiamaozi.png', type: 'helmet', baseStats: { hp: 25, defense: 10 }, description: '冒险家帽子，生命+25，防御+10', quality: '凡物' },
    { name: '魔术帽', icon: '/static/avatars/items/moshumao.png', type: 'helmet', baseStats: { hp: 10, mp: 20, defense: 5 }, description: '魔术帽，生命+10，法力+20，防御+5', quality: '凡物' },
    { name: '紫发簪', icon: '/static/avatars/items/zifazan.png', type: 'helmet', baseStats: { mp: 25 }, description: '紫发簪，法力+25', quality: '凡物' },
    { name: '臣相帽', icon: '/static/avatars/items/chenxiangmao.png', type: 'helmet', baseStats: { hp: 40, mp: 40, defense: 10 }, description: '臣相帽，生命+40，法力+40，防御+10', quality: '凡物' },
    { name: '精灵帽', icon: '/static/avatars/items/jinglingmao.png', type: 'helmet', baseStats: { hp: 10, mp: 30 }, description: '精灵帽，生命+10，法力+30', setTag: '精灵', quality: '灵器' },
    { name: '骑士头盔', icon: '/static/avatars/items/qishi_toukui.png', type: 'helmet', baseStats: { defense: 20, hp: 30 }, description: '头盔，生命+30，防御+20', quality: '凡物' },
    { name: '巨兽头盔', icon: '/static/avatars/items/jushoutoukui.png', type: 'helmet', baseStats: { hp: 40, defense: 15 }, description: '巨兽头盔，生命+40，防御+15', setTag: '巨兽', quality: '灵器' },
  ],
  shoes: [
    { name: '骑士靴', icon: '/static/avatars/items/qishi_xue.png', type: 'shoes', baseStats: { hp: 20, defense: 15 }, description: '骑士靴，生命+20，防御+15', quality: '凡物' },
    { name: '布鞋', icon: '/static/avatars/items/buxie.png', type: 'shoes', baseStats: { hp: 5, defense: 3 }, description: '布鞋，生命+5，防御+3', quality: '凡物' },
    { name: '暗黑玫瑰', icon: '/static/avatars/items/anheimeigui.png', type: 'shoes', baseStats: { hp: 15, mp: 25, defense: 5 }, description: '暗黑玫瑰，生命+15，法力+25，防御+5', quality: '凡物' },
    { name: '精灵靴', icon: '/static/avatars/items/jinglingxue.png', type: 'shoes', baseStats: { hp: 10, mp: 25 }, description: '精灵靴，生命+10，法力+25', setTag: '精灵', quality: '灵器' },
    { name: '巨兽鞋子', icon: '/static/avatars/items/jushouxiezi.png', type: 'shoes', baseStats: { hp: 30, defense: 10 }, description: '巨兽鞋子，生命+30，防御+10', setTag: '巨兽', quality: '灵器' },
  ],
  accessory: [
    { name: '骑士戒指', icon: '/static/avatars/items/qishi_jiezhi.png', type: 'accessory', baseStats: { attack: 15, defense: 15 }, description: '饰品，攻击+15，防御+15', quality: '凡物' },
    { name: '教会戒指', icon: '/static/avatars/items/jiaohui_jiezhi.png', type: 'accessory', baseStats: { defense: 5, hp: 20 }, description: '教会戒指，生命+20，防御+5', quality: '凡物' },
    { name: '耳环', icon: '/static/avatars/items/erhuan.png', type: 'accessory', baseStats: { mp: 20 }, description: '精美耳环', quality: '凡物' },
    { name: '金徽章', icon: '/static/avatars/items/jinhuizhang.png', type: 'accessory', baseStats: { hp: 90, attack: 30, defense: 15 }, description: '饰品，生命+90，攻击+30，防御+15', quality: '法器' },
    { name: '银徽章', icon: '/static/avatars/items/yinhuizhang.png', type: 'accessory', baseStats: { hp: 60, attack: 20, defense: 10 }, description: '饰品，生命+60，攻击+20，防御+10', quality: '法器' },
    { name: '铜徽章', icon: '/static/avatars/items/tonghuizhang.png', type: 'accessory', baseStats: { hp: 30, attack: 10, defense: 5 }, description: '饰品，生命+30，攻击+10，防御+5', quality: '法器' },
    { name: '精灵徽章', icon: '/static/avatars/items/jinglinghuizhang.png', type: 'accessory', baseStats: { hp: 30, mp: 50 }, description: '精灵徽章，生命+30，法力+50', setTag: '精灵', quality: '灵器' },
    { name: '巨兽护盾', icon: '/static/avatars/items/jushouhudun.png', type: 'accessory', baseStats: { hp: 50, defense: 20 }, description: '巨兽护盾，生命+50，防御+20', setTag: '巨兽', quality: '灵器' },
  ],
  book: [
    { name: '剑法', icon: '/static/avatars/items/jianfa.png', type: 'book', baseStats: { attack: 20 }, description: '剑法秘籍，攻击力+20', quality: '法器' },
    { name: '刀法', icon: '/static/avatars/items/daofa.png', type: 'book', baseStats: { attack: 15, hp: 20 }, description: '刀法秘籍，攻击力+15，生命值+20', quality: '法器' },
  ],
}

export interface ChestConfig {
  id: string
  name: string
  icon: string
  rarity: Rarity
  description: string
  shopPrice?: number
  dropRate?: number
  qualityFilter?: Quality[]
}

export const CHEST_CONFIG: Record<string, ChestConfig> = {
  wanwu: {
    id: 'wanwu',
    name: '万物宝箱',
    icon: '/static/avatars/items/wanwubaoxiang.png',
    rarity: 'rare',
    description: '使用后获得随机装备',
    shopPrice: 1500,
    dropRate: 1.0,
  },
  faqi: {
    id: 'faqi',
    name: '法器宝箱',
    icon: '/static/avatars/items/faqibaoxiang.png',
    rarity: 'common',
    description: '使用后获得凡物或法器装备',
    shopPrice: 800,
    dropRate: 1.0,
    qualityFilter: ['凡物', '法器'],
  },
}

export function isChestItem(item: Item): boolean {
  return item.subtype === 'chest' || Object.values(CHEST_CONFIG).some(c => c.name === item.name)
}

export function getChestConfigByName(name: string): ChestConfig | undefined {
  return Object.values(CHEST_CONFIG).find(c => c.name === name)
}

export function getChestConfigById(id: string): ChestConfig | undefined {
  return CHEST_CONFIG[id]
}

export function createChestItem(chestId: string): Item {
  const config = CHEST_CONFIG[chestId]
  if (!config) {
    throw new Error(`Unknown chest type: ${chestId}`)
  }
  return {
    id: `chest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: config.name,
    icon: config.icon,
    type: 'consumable',
    subtype: 'chest',
    rarity: config.rarity,
    level: 1,
    count: 1,
    description: config.description,
  }
}

export const CHEST_TYPES = Object.keys(CHEST_CONFIG)

// 道具配置
export const ITEM_CONFIG: Record<string, { name: string; icon: string; type: 'consumable'; description: string; count: number }[]> = {
  consumable: [
    { name: '灵草', icon: '/static/avatars/items/lingcao.png', type: 'consumable', description: '生命值恢复10%，法力恢复10%', count: 1 },
    { name: '丹药', icon: '/static/avatars/items/danyao.png', type: 'consumable', description: '生命值恢复30%，法力恢复30%', count: 1 },
    { name: '药箱', icon: '/static/avatars/items/yaoxiang.png', type: 'consumable', description: '生命值恢复30%，法力恢复10%', count: 1 },
    { ...CHEST_CONFIG.wanwu, type: 'consumable', count: 1 } as any,
  ],
}

export const JOB_CONFIG: Record<string, { name: string; rank: number }> = {
  destiny: { name: '天命人', rank: 3 },
  士兵: { name: '士兵', rank: 2 },
  机甲: { name: '机甲', rank: 3 },
  普通丧尸: { name: '普通丧尸', rank: 1 },
  变异丧尸: { name: '变异丧尸', rank: 2 },
  人造丧尸: { name: '人造丧尸', rank: 2 },
  厉鬼: { name: '厉鬼', rank: 3 },
  鬼魂: { name: '鬼魂', rank: 3 },
  炼气修士: { name: '炼气修士', rank: 1 },
  筑基修士: { name: '筑基修士', rank: 2 },
  金丹修士: { name: '金丹修士', rank: 3 },
  傀儡: { name: '傀儡', rank: 1 },
  魔兽: { name: '魔兽', rank: 1 },
  魔族: { name: '魔族', rank: 2 },
  魔将: { name: '魔将', rank: 3 },
  灵宠: { name: '灵宠', rank: 1 },
  精怪: { name: '精怪', rank: 1 },
  妖怪: { name: '妖怪', rank: 2 },
  大妖: { name: '大妖', rank: 3 },
  生肖: { name: '生肖', rank: 4 },
  神兵: { name: '神兵', rank: 2 },
  流沙: { name: '流沙', rank: 2 },
  神将: { name: '神将', rank: 3 },
  神裔: { name: '神裔', rank: 4 },
  神兽: { name: '神兽', rank: 5 },
  人皇: { name: '人皇', rank: 5 },
  魔神: { name: '魔神', rank: 5 },
  血色嫁衣: { name: '血色嫁衣', rank: 5 },
  虚影: { name: '虚影', rank: 1 },
  天狐司命: { name: '天狐司命', rank: 5 },
  鬼神: { name: '鬼神', rank: 5 },
  黄泉冥神: { name: '黄泉冥神', rank: 5 },
  玉衡: { name: '玉衡', rank: 5 },
  冰雪女神: { name: '冰雪女神', rank: 5 },
  高科技: { name: '高科技', rank: 4 },
  蛇姬: { name: '蛇姬', rank: 5 },
}

export const ATTRIBUTE_CONFIG: Record<Attribute, { name: string; color: string }> = {
  normal: { name: '普', color: '#eaeaea' },
  metal: { name: '金', color: '#f59e0b' },
  wood: { name: '木', color: '#53c552' },
  water: { name: '水', color: '#3b82f6' },
  fire: { name: '火', color: '#ef4444' },
  earth: { name: '土', color: '#a16207' },
  ice: { name: '冰', color: '#67e8f9' },
  wind: { name: '风', color: '#4de083' },
  dark: { name: '暗', color: '#A21CAF' },
  yang: { name: '阳', color: '#FEF08A' },
  light: { name: '光', color: '#FDE68A' },
  yin: { name: '阴', color: '#8B5CF6' },
}

// 阶数颜色配置：1阶白色，2阶绿色，3阶蓝色，4阶紫色，5阶粉色，6阶红色，6阶以上金色
export const getRankColor = (rank: number): string => {
  if (rank <= 1) return '#ffffff'
  if (rank === 2) return '#22c55e'
  if (rank === 3) return '#3b82f6'
  if (rank === 4) return '#a855f7'
  if (rank === 5) return '#ec4899'
  if (rank === 6) return '#ef4444'
  return '#fbbf24' // 6阶以上金色
}

export const RARITY_CONFIG: Record<Rarity, { name: string; color: string; bonus: number }> = {
  common: { name: '普通', color: '#ffffff', bonus: 0 },
  rare: { name: '稀有', color: '#60a5fa', bonus: 0.2 },
  exceptional: { name: '非凡', color: '#4ade80', bonus: 0.4 },
  treasure: { name: '珍宝', color: '#a855f7', bonus: 0.6 },
  celestial: { name: '仙品', color: '#f59e0b', bonus: 0.8 },
  peerless: { name: '绝世', color: '#fbbf24', bonus: 1.0 },
}

export function getEquipmentStats(item: Item): ItemStats {
  if (!item.baseStats) return {}
  
  const rarityBonus = RARITY_CONFIG[item.rarity].bonus
  const levelBonus = (item.level - 1) * 0.1
  
  const result: ItemStats = {}
  
  for (const [key, value] of Object.entries(item.baseStats)) {
    if (value !== undefined) {
      // 百分比属性不受到品质和等级的影响
      if (['attackPercent', 'defensePercent', 'hpPercent', 'mpPercent'].includes(key)) {
        result[key as keyof ItemStats] = value
      } else {
        result[key as keyof ItemStats] = Math.floor(value * (1 + rarityBonus + levelBonus))
      }
    }
  }
  
  return result
}

export function getEquipmentUpgradeCost(item: Item): number {
  if (!item.baseStats) return 0;
  const totalStats = Object.values(item.baseStats).reduce((sum, val) => sum + (val || 0), 0);
  return totalStats * 5;
}

export function getQualityColor(quality?: string): string {
  if (!quality) return '#9ca3af'
  if (quality === '凡物') return '#9ca3af'
  if (quality === '法器') return '#4ade80'
  if (quality === '灵器') return '#60a5fa'
  if (quality === '古宝') return '#a855f7'
  if (quality === '仙器') return '#f87171'
  if (quality === '神器') return '#fbbf24'
  return '#9ca3af'
}

export interface SetBonus {
  hp?: number
  mp?: number
  attack?: number
  defense?: number
}

export interface SetEffect {
  name: string
  effects: Record<number, SetBonus>
}

export const SET_EFFECTS: Record<string, SetEffect> = {
  '精灵': {
    name: '精灵套装',
    effects: {
      2: { mp: 10 },
      3: { mp: 30, hp: 10 },
      4: { mp: 50, hp: 25 }
    }
  },
  '巨兽': {
    name: '巨兽套装',
    effects: {
      2: { hp: 20 },
      3: { hp: 40, attack: 10 },
      4: { hp: 60, attack: 20 }
    }
  }
}

export function calculateSetBonus(equipment: Equipment): { setName: string; count: number; bonus: SetBonus }[] {
  const setCounts: Record<string, number> = {}
  
  const slots: (Item | null)[] = [
    equipment.weapon,
    equipment.armor,
    equipment.helmet,
    equipment.shoes,
    equipment.accessory,
    equipment.book
  ]
  
  for (const item of slots) {
    if (item && item.setTag) {
      setCounts[item.setTag] = (setCounts[item.setTag] || 0) + 1
    }
  }
  
  const results: { setName: string; count: number; bonus: SetBonus }[] = []
  
  for (const [setTag, count] of Object.entries(setCounts)) {
    const setEffect = SET_EFFECTS[setTag]
    if (!setEffect) continue
    
    const thresholds = Object.keys(setEffect.effects)
      .map(Number)
      .sort((a, b) => b - a)
    
    for (const threshold of thresholds) {
      if (count >= threshold) {
        results.push({
          setName: setEffect.name,
          count: threshold,
          bonus: setEffect.effects[threshold]
        })
        break
      }
    }
  }
  
  return results
}

export interface EquipmentEffects {
  hp: number
  mp: number
  attack: number
  defense: number
  moveRange: number
  attackRange: number
  hpPercent: number
  mpPercent: number
  attackPercent: number
  defensePercent: number
  grantedSkills: Skill[]
  setBonuses: { setName: string; count: number; bonus: SetBonus }[]
}

export function processEquipmentEffects(equipment: Equipment | null | undefined): EquipmentEffects {
  const result: EquipmentEffects = {
    hp: 0,
    mp: 0,
    attack: 0,
    defense: 0,
    moveRange: 0,
    attackRange: 0,
    hpPercent: 0,
    mpPercent: 0,
    attackPercent: 0,
    defensePercent: 0,
    grantedSkills: [],
    setBonuses: []
  }

  if (!equipment) return result

  const slots: (Item | null)[] = [
    equipment.weapon,
    equipment.armor,
    equipment.helmet,
    equipment.shoes,
    equipment.accessory,
    equipment.book
  ]

  for (const item of slots) {
    if (!item) continue

    const stats = getEquipmentStats(item)

    if (stats.hp) result.hp += stats.hp
    if (stats.mp) result.mp += stats.mp
    if (stats.attack) result.attack += stats.attack
    if (stats.defense) result.defense += stats.defense
    if (stats.moveRange) result.moveRange += stats.moveRange
    if (stats.attackRange) result.attackRange += stats.attackRange
    if (stats.hpPercent) result.hpPercent += stats.hpPercent
    if (stats.mpPercent) result.mpPercent += stats.mpPercent
    if (stats.attackPercent) result.attackPercent += stats.attackPercent
    if (stats.defensePercent) result.defensePercent += stats.defensePercent

    if (item.grantedSkillId && SKILL_TEMPLATES[item.grantedSkillId]) {
      result.grantedSkills.push({ ...SKILL_TEMPLATES[item.grantedSkillId], currentCooldown: 0 } as Skill)
    }
  }

  result.setBonuses = calculateSetBonus(equipment)

  for (const bonus of result.setBonuses) {
    if (bonus.bonus.hp) result.hp += bonus.bonus.hp
    if (bonus.bonus.mp) result.mp += bonus.bonus.mp
    if (bonus.bonus.attack) result.attack += bonus.bonus.attack
    if (bonus.bonus.defense) result.defense += bonus.bonus.defense
  }

  return result
}

export interface CalculatedStats {
  attack: number
  defense: number
  maxHp: number
  maxMp: number
  moveRange: number
  attackRange: number
}

export function calculateCharacterStats(char: {
  attack: number
  defense: number
  maxHp: number
  maxMp: number
  moveRange: number
  attackRange: number
  equipment: Equipment
}): CalculatedStats {
  const equipEffects = processEquipmentEffects(char.equipment)
  return {
    attack: char.attack + equipEffects.attack,
    defense: char.defense + equipEffects.defense,
    maxHp: char.maxHp + equipEffects.hp,
    maxMp: char.maxMp + equipEffects.mp,
    moveRange: char.moveRange + equipEffects.moveRange,
    attackRange: char.attackRange + equipEffects.attackRange
  }
}

const CHEST_EQUIPMENT_TEMPLATES: Omit<Item, 'id' | 'count' | 'rarity'>[] = [
  { name: '教学剑', icon: '/static/avatars/items/jiaoxue_jian.png', type: 'equipment', level: 1, subtype: 'weapon', baseStats: { attack: 5 }, description: '教学剑，攻击+5', quality: '凡物' },
  { name: '骑士甲胄', icon: '/static/avatars/items/qishi_jiazhou.png', type: 'equipment', level: 1, subtype: 'armor', baseStats: { defense: 20, hp: 50 }, description: '防具，生命+50，防御+20', quality: '凡物' },
  { name: '白银赛车头盔', icon: '/static/avatars/items/baiyin_saiche_toukui.png', type: 'equipment', level: 1, subtype: 'helmet', baseStats: { defense: 20, hp: 40 }, description: '白银赛车头盔，生命+40，防御+20', quality: '凡物' },
  { name: '骑士靴', icon: '/static/avatars/items/qishi_xue.png', type: 'equipment', level: 1, subtype: 'shoes', baseStats: { hp: 20, defense: 15 }, description: '骑士靴，生命+20，防御+15', quality: '凡物' },
  { name: '布鞋', icon: '/static/avatars/items/buxie.png', type: 'equipment', level: 1, subtype: 'shoes', baseStats: { hp: 5, defense: 3 }, description: '布鞋，生命+5，防御+3', quality: '凡物' },
  { name: '暗黑玫瑰', icon: '/static/avatars/items/anheimeigui.png', type: 'equipment', level: 1, subtype: 'shoes', baseStats: { hp: 15, mp: 25, defense: 5 }, description: '暗黑玫瑰，生命+15，法力+25，防御+5', quality: '凡物' },
  { name: '骑士戒指', icon: '/static/avatars/items/qishi_jiezhi.png', type: 'equipment', level: 1, subtype: 'accessory', baseStats: { attack: 15, defense: 15 }, description: '饰品，攻击+15，防御+15', quality: '凡物' },
  { name: '破损的剑', icon: '/static/avatars/items/posun_de_jian.png', type: 'equipment', level: 1, subtype: 'weapon', baseStats: { attack: 10 }, description: '破损但仍可使用的剑', quality: '凡物' },
  { name: '餐刀', icon: '/static/avatars/items/caidao.png', type: 'equipment', level: 1, subtype: 'weapon', baseStats: { attack: 8 }, description: '餐刀，攻击+8', quality: '凡物' },
  { name: '长矛', icon: '/static/avatars/items/changmao.png', type: 'equipment', level: 1, subtype: 'weapon', baseStats: { attack: 15 }, description: '长矛，攻击+15', quality: '凡物' },
  { name: '长戈', icon: '/static/avatars/items/changge.png', type: 'equipment', level: 1, subtype: 'weapon', baseStats: { attack: 12 }, description: '长戈，攻击+12', quality: '凡物' },
  { name: '耳环', icon: '/static/avatars/items/erhuan.png', type: 'equipment', level: 1, subtype: 'accessory', baseStats: { mp: 20 }, description: '精美耳环', quality: '凡物' },
  { name: '骑士头盔', icon: '/static/avatars/items/qishi_toukui.png', type: 'equipment', level: 1, subtype: 'helmet', baseStats: { defense: 20, hp: 30 }, description: '头盔，生命+30，防御+20', quality: '凡物' },
  { name: '战术头盔', icon: '/static/avatars/items/zhanshutoukui.png', type: 'equipment', level: 1, subtype: 'helmet', baseStats: { hp: 40, defense: 20 }, description: '战术头盔，生命+40，防御+20', quality: '凡物' },
  { name: '冒险家帽子', icon: '/static/avatars/items/maoxianjiamaozi.png', type: 'equipment', level: 1, subtype: 'helmet', baseStats: { hp: 25, defense: 10 }, description: '冒险家帽子，生命+25，防御+10', quality: '凡物' },
  { name: '魔术帽', icon: '/static/avatars/items/moshumao.png', type: 'equipment', level: 1, subtype: 'helmet', baseStats: { hp: 10, mp: 20, defense: 5 }, description: '魔术帽，生命+10，法力+20，防御+5', quality: '凡物' },
  { name: '紫发簪', icon: '/static/avatars/items/zifazan.png', type: 'equipment', level: 1, subtype: 'helmet', baseStats: { mp: 25 }, description: '紫发簪，法力+25', quality: '凡物' },
  { name: '臣相帽', icon: '/static/avatars/items/chenxiangmao.png', type: 'equipment', level: 1, subtype: 'helmet', baseStats: { hp: 40, mp: 40, defense: 10 }, description: '臣相帽，生命+40，法力+40，防御+10', quality: '凡物' },
  { name: '白银狼牙棒', icon: '/static/avatars/items/baiyin_langyabang.png', type: 'equipment', level: 1, subtype: 'weapon', baseStats: { attack: 25 }, description: '白银狼牙棒', quality: '凡物' },
  { name: '教会戒指', icon: '/static/avatars/items/jiaohui_jiezhi.png', type: 'equipment', level: 1, subtype: 'accessory', baseStats: { defense: 5, hp: 20 }, description: '教会戒指，生命+20，防御+5', quality: '凡物' },
  { name: '金徽章', icon: '/static/avatars/items/jinhuizhang.png', type: 'equipment', level: 1, subtype: 'accessory', baseStats: { hp: 90, attack: 30, defense: 15 }, description: '饰品，生命+90，攻击+30，防御+15', quality: '法器' },
  { name: '银徽章', icon: '/static/avatars/items/yinhuizhang.png', type: 'equipment', level: 1, subtype: 'accessory', baseStats: { hp: 60, attack: 20, defense: 10 }, description: '饰品，生命+60，攻击+20，防御+10', quality: '法器' },
  { name: '铜徽章', icon: '/static/avatars/items/tonghuizhang.png', type: 'equipment', level: 1, subtype: 'accessory', baseStats: { hp: 30, attack: 10, defense: 5 }, description: '饰品，生命+30，攻击+10，防御+5', quality: '法器' },
  { name: '铁剑', icon: '/static/avatars/items/tiejian.png', type: 'equipment', level: 1, subtype: 'weapon', baseStats: { attack: 20 }, description: '铁剑，攻击+20', quality: '凡物' },
  { name: '爪子刀', icon: '/static/avatars/items/zhuazidao.png', type: 'equipment', level: 1, subtype: 'weapon', baseStats: { attack: 10 }, description: '爪子刀，攻击+10', quality: '凡物' },
  { name: '火羽', icon: '/static/avatars/items/huoyu.png', type: 'equipment', level: 1, subtype: 'weapon', baseStats: { mp: 80, attack: 50, attackRange: 1 }, description: '法力值+80，攻击力+50，攻击范围+1，装备后获得专属技能【火羽流星】', grantedSkillId: 'huo_yu_liu_xing', quality: '仙器' },
  { name: '天雅', icon: '/static/avatars/items/tianya.png', type: 'equipment', level: 1, subtype: 'weapon', baseStats: { mp: 80, attack: 40, attackRange: 1 }, description: '法力值+80，攻击力+40，攻击范围+1，装备后获得专属技能【天雅倾情】', grantedSkillId: 'tian_ya_qing_qing', quality: '仙器' },
  { name: '青云白鹤弓', icon: '/static/avatars/items/qingyunbaihegong.png', type: 'equipment', level: 1, subtype: 'weapon', baseStats: { attack: 50, mp: 60, attackRange: 1 }, description: '攻击力+50，法力值+60，攻击范围+1，装备后获得专属技能【云鹤翔舞】', grantedSkillId: 'yun_he_xiang_wu', quality: '仙器' },
  { name: '棉衣', icon: '/static/avatars/items/mianyi.png', type: 'equipment', level: 1, subtype: 'armor', baseStats: { hp: 20, defense: 5 }, description: '棉衣，生命+20，防御+5', quality: '凡物' },
  { name: '冒险者服装', icon: '/static/avatars/items/maoxianjiayifu.png', type: 'equipment', level: 1, subtype: 'armor', baseStats: { hp: 25, defense: 10 }, description: '冒险者服装，生命+25，防御+10', quality: '凡物' },
  { name: '秀才服', icon: '/static/avatars/items/xiucaifu.png', type: 'equipment', level: 1, subtype: 'armor', baseStats: { hp: 10, mp: 20, defense: 5 }, description: '秀才服，生命+10，法力+20，防御+5', quality: '凡物' },
  { name: '精灵帽', icon: '/static/avatars/items/jinglingmao.png', type: 'equipment', level: 1, subtype: 'helmet', baseStats: { hp: 10, mp: 30 }, description: '精灵帽，生命+10，法力+30', setTag: '精灵', quality: '灵器' },
  { name: '精灵靴', icon: '/static/avatars/items/jinglingxue.png', type: 'equipment', level: 1, subtype: 'shoes', baseStats: { hp: 10, mp: 25 }, description: '精灵靴，生命+10，法力+25', setTag: '精灵', quality: '灵器' },
  { name: '精灵法杖', icon: '/static/avatars/items/jinglingfazhang.png', type: 'equipment', level: 1, subtype: 'weapon', baseStats: { attack: 10, mp: 40 }, description: '精灵法杖，攻击+10，法力+40', setTag: '精灵', quality: '灵器' },
  { name: '精灵徽章', icon: '/static/avatars/items/jinglinghuizhang.png', type: 'equipment', level: 1, subtype: 'accessory', baseStats: { hp: 30, mp: 50 }, description: '精灵徽章，生命+30，法力+50', setTag: '精灵', quality: '灵器' },
  { name: '巨兽头盔', icon: '/static/avatars/items/jushoutoukui.png', type: 'equipment', level: 1, subtype: 'helmet', baseStats: { hp: 40, defense: 15 }, description: '巨兽头盔，生命+40，防御+15', setTag: '巨兽', quality: '灵器' },
  { name: '巨兽鞋子', icon: '/static/avatars/items/jushouxiezi.png', type: 'equipment', level: 1, subtype: 'shoes', baseStats: { hp: 30, defense: 10 }, description: '巨兽鞋子，生命+30，防御+10', setTag: '巨兽', quality: '灵器' },
  { name: '巨兽尖牙', icon: '/static/avatars/items/jushoujianya.png', type: 'equipment', level: 1, subtype: 'weapon', baseStats: { attack: 25, defense: 5 }, description: '巨兽尖牙，攻击+25，防御+5', setTag: '巨兽', quality: '灵器' },
  { name: '巨兽护盾', icon: '/static/avatars/items/jushouhudun.png', type: 'equipment', level: 1, subtype: 'accessory', baseStats: { hp: 50, defense: 20 }, description: '巨兽护盾，生命+50，防御+20', setTag: '巨兽', quality: '灵器' },
];

// 获取随机品质
export function getRandomRarity(): Rarity {
  const rand = Math.random() * 100;
  if (rand < 1) return 'peerless'; // 1%
  if (rand < 3) return 'celestial'; // 2%
  if (rand < 6) return 'treasure'; // 3%
  if (rand < 10) return 'exceptional'; // 4%
  if (rand < 20) return 'rare'; // 10%
  return 'common'; // 80%
}

// 开宝箱获得装备
export function openChest(chestId?: string): Item {
  const chestConfig = chestId ? CHEST_CONFIG[chestId] : undefined
  let filteredTemplates = CHEST_EQUIPMENT_TEMPLATES
  
  if (chestConfig?.qualityFilter) {
    filteredTemplates = CHEST_EQUIPMENT_TEMPLATES.filter(
      template => chestConfig!.qualityFilter!.includes(template.quality as Quality)
    )
  }
  
  if (filteredTemplates.length === 0) {
    filteredTemplates = CHEST_EQUIPMENT_TEMPLATES
  }
  
  const template = filteredTemplates[Math.floor(Math.random() * filteredTemplates.length)];
  const rarity = getRandomRarity();
  return {
    ...template,
    id: `chest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    rarity,
    level: 1,
    count: 1,
  };
}

export function getSkillTags(skill: Skill): { type: string; element: string; range: string; targetCount: string; typeColor: string; elementColor: string; rangeColor: string; targetCountColor: string } {
  let typeTag = skill.skillTypeTag || ''
  let elementTag = skill.elementTag || ''
  let rangeTag = skill.rangeTag || ''
  let targetCountTag = skill.targetCountTag || ''

  if (!typeTag) {
    if (skill.type === 'attack') {
      typeTag = '攻击'
    } else if (skill.type === 'heal') {
      typeTag = '治疗'
    } else if (skill.type === 'support') {
      if (skill.category === 'special') {
        typeTag = '特殊'
      } else {
        typeTag = '辅助'
      }
    }
  }

  if (!rangeTag) {
    if (skill.range !== undefined && skill.range > 0) {
      rangeTag = `${skill.range}格`
    } else {
      rangeTag = '1格'
    }
  }

  if (!targetCountTag) {
    if (skill.category === 'aoe') {
      targetCountTag = 'AOE'
    } else if (skill.category === '指定') {
      targetCountTag = skill.targetCount && skill.targetCount > 1 ? `${skill.targetCount}个` : '1个'
    } else if (skill.category === 'heal' || skill.category === 'support') {
      targetCountTag = '1个'
    } else if (skill.category === 'summon') {
      targetCountTag = skill.targetCount ? `${skill.targetCount}个` : '1个'
    } else {
      targetCountTag = '1个'
    }
  }

  let typeColor = '#eaeaea'
  if (typeTag === '攻击') {
    typeColor = '#f87171'
  } else if (typeTag === '治疗') {
    typeColor = '#4ade80'
  } else if (typeTag === '辅助') {
    typeColor = '#60a5fa'
  } else if (typeTag === '特殊') {
    typeColor = '#fbbf24'
  } else if (typeTag === '召唤') {
    typeColor = '#f472b6'
  }

  let rangeColor = '#eaeaea'
  if (rangeTag === '1格') {
    rangeColor = '#4ade80'
  } else if (rangeTag === '2格') {
    rangeColor = '#60a5fa'
  } else if (rangeTag === '3格') {
    rangeColor = '#f87171'
  } else if (rangeTag.includes('4格') || rangeTag.includes('5格')) {
    rangeColor = '#fbbf24'
  }

  let targetCountColor = '#eaeaea'
  if (targetCountTag === 'AOE') {
    targetCountColor = '#fbbf24'
  } else if (targetCountTag === '轰炸') {
    targetCountColor = '#f87171'
  } else if (targetCountTag === '直线') {
    targetCountColor = '#f472b6'
  } else if (targetCountTag === '横扫') {
    targetCountColor = '#a855f7'
  } else if (targetCountTag === '陷阵') {
    targetCountColor = '#fbbf24'
  } else if (targetCountTag === '3x1') {
    targetCountColor = '#4ade80'
  } else if (targetCountTag === '5x1') {
    targetCountColor = '#60a5fa'
  } else if (targetCountTag === '3x2') {
    targetCountColor = '#c084fc'
  } else if (targetCountTag === '3x3') {
    targetCountColor = '#f9a8d4'
  } else if (targetCountTag === '2x3') {
    targetCountColor = '#c084fc'
  } else if (targetCountTag === '1x3') {
    targetCountColor = '#4ade80'
  } else if (targetCountTag === '1x5') {
    targetCountColor = '#a855f7'
  } else if (targetCountTag === '1个') {
    targetCountColor = '#ffffff'
  } else if (targetCountTag === '2个') {
    targetCountColor = '#4ade80'
  } else if (targetCountTag === '3个' || targetCountTag === '多个') {
    targetCountColor = '#60a5fa'
  }

  if (!elementTag && skill.attribute) {
    const attrElementMap: Record<string, string> = {
      ice: '冰',
      fire: '火',
      thunder: '雷',
      water: '水',
      wind: '风',
      earth: '土',
      metal: '金',
      wood: '木',
      shadow: '暗',
      holy: '光',
      yin: '阴',
    }
    elementTag = attrElementMap[skill.attribute] || ''
  }

  let elementColor = '#eaeaea'
  if (elementTag === '冰') {
    elementColor = '#60a5fa'
  } else if (elementTag === '火') {
    elementColor = '#f87171'
  } else if (elementTag === '雷') {
    elementColor = '#fbbf24'
  } else if (elementTag === '水') {
    elementColor = '#38bdf8'
  } else if (elementTag === '风') {
    elementColor = '#4ade80'
  } else if (elementTag === '土') {
    elementColor = '#a16207'
  } else if (elementTag === '金') {
    elementColor = '#facc15'
  } else if (elementTag === '木') {
    elementColor = '#22c55e'
  } else if (elementTag === '暗') {
    elementColor = '#a855f7'
  } else if (elementTag === '光') {
    elementColor = '#fef08a'
  } else if (elementTag === '阴') {
    elementColor = '#8B5CF6'
  }

  return { type: typeTag, element: elementTag, range: rangeTag, targetCount: targetCountTag, typeColor, elementColor, rangeColor, targetCountColor }
}

export const SKILL_TEMPLATES: Record<string, Omit<Skill, 'currentCooldown'>> = {
  po_kong_zhan: { id: 'po_kong_zhan', name: '破空斩', mpCost: 50, type: 'attack', power: 130, cooldown: 3, description: '选择1格范围内的1个敌方目标，造成130%攻击力+10%当前生命值的伤害', effectType: 'fire', attribute: 'normal', category: '指定', skillTypeTag: '攻击', rangeTag: '1格', targetCountTag: '1个', damageFormula: 'atk_plus_hp_pct', hpPct: 0.1 },
  qian_li_bing_feng: { id: 'qian_li_bing_feng', name: '千里冰封', mpCost: 60, type: 'attack', power: 110, cooldown: 4, range: 0, description: '以自身为中心，对3格菱形范围内的所有敌方目标造成110%攻击力的伤害，并使目标陷入【削弱】状态', effectType: 'ice', areaRange: 3, attribute: 'ice', category: 'aoe', skillTypeTag: '攻击', rangeTag: '3格', targetCountTag: 'AOE', statusEffect: 'weakened', rangeType: 'diamond' },
  bing_feng_zhi_men: { id: 'bing_feng_zhi_men', name: '冰封之门', mpCost: 15, type: 'support', power: 0, cooldown: 2, range: 2, targetCount: 2, description: '选择2格范围内的任意两个空地，确认后生成障碍物', effectType: 'ice', attribute: 'ice', category: 'special', skillTypeTag: '特殊', rangeTag: '2格', targetCountTag: '2个' },
  bing_jing_fei_she: { id: 'bing_jing_fei_she', name: '冰晶飞射', mpCost: 50, type: 'attack', power: 90, cooldown: 2, range: 3, description: '选择上下左右中的一个方向，对该方向上3格范围内的所有敌方单位，造成90%攻击力的伤害', effectType: 'ice', attribute: 'ice', category: '直线', skillTypeTag: '攻击', elementTag: '冰', rangeTag: '3格', targetCountTag: '直线' },
  ai_de_bao_bao: { id: 'ai_de_bao_bao', name: '爱的抱抱', mpCost: 40, type: 'heal', power: 5, cooldown: 2, range: 1, description: '对相邻1格范围内的指定目标，恢复血量和法力值（恢复量为0.05*自身最大生命值/法力值+0.1*目标最大生命值/法力值），并驱散目标所有不良状态', attribute: 'water', category: 'heal', skillTypeTag: '治疗', rangeTag: '1格', targetCountTag: '1个' },
  ai_de_fei_wen: { id: 'ai_de_fei_wen', name: '爱的飞吻', mpCost: 50, type: 'heal', power: 0, cooldown: 3, range: 3, description: '选择3格范围内的一个指定目标，恢复血量（恢复量为0.05*自身最大生命值+0.1*目标最大生命值），并驱散目标所有不良状态', attribute: 'water', category: 'heal', skillTypeTag: '治疗', rangeTag: '3格', targetCountTag: '1个' },
  ai_de_hui_yi: { id: 'ai_de_hui_yi', name: '爱的回忆', mpCost: 30, type: 'heal', power: 0, cooldown: 5, range: 1, description: '熊熊选择自己为目标，恢复10%的最大生命值以及10%的最大法力值，并驱散自身所有不良状态', attribute: 'water', category: 'heal', skillTypeTag: '治疗', rangeTag: '1格', targetCountTag: '1个' },
  fire_burst: { id: 'fire_burst', name: '炎爆术', mpCost: 20, type: 'attack', power: 120, cooldown: 2, description: '选择1格范围内的1个敌方目标，造成120%攻击力的伤害', attribute: 'normal', category: '指定', skillTypeTag: '攻击', rangeTag: '1格', targetCountTag: '1个' },
  ice_shard: { id: 'ice_shard', name: '冰晶术', mpCost: 18, type: 'attack', power: 100, cooldown: 2, description: '选择1格范围内的1个敌方目标，造成100%攻击力的伤害', attribute: 'normal', category: '指定', skillTypeTag: '攻击', rangeTag: '1格', targetCountTag: '1个' },
  thunder_bolt: { id: 'thunder_bolt', name: '雷电术', mpCost: 25, type: 'attack', power: 140, cooldown: 3, description: '选择1格范围内的1个敌方目标，造成140%攻击力的伤害', attribute: 'normal', category: '指定', skillTypeTag: '攻击', rangeTag: '1格', targetCountTag: '1个' },
  
  shadow_strike: { id: 'shadow_strike', name: '暗影突袭', mpCost: 15, type: 'attack', power: 130, cooldown: 2, description: '选择1格范围内的1个敌方目标，造成130%攻击力的伤害', attribute: 'normal', category: '指定', skillTypeTag: '攻击', rangeTag: '1格', targetCountTag: '1个' },
  nature_power: { id: 'nature_power', name: '自然之力', mpCost: 12, type: 'heal', power: 60, cooldown: 1, description: '恢复友方角色60%最大生命值', attribute: 'normal', category: 'heal', skillTypeTag: '治疗', rangeTag: '1格', targetCountTag: '1个' },
  fierce_attack: { id: 'fierce_attack', name: '凶猛攻击', mpCost: 50, type: 'attack', power: 150, cooldown: 3, range: 1, description: '选择1格范围内的1个敌方目标，造成150%攻击力的伤害', effectType: 'fire', attribute: 'normal', category: '指定', skillTypeTag: '攻击', rangeTag: '1格', targetCountTag: '1个' },
  jin_shen_ge_dou: { id: 'jin_shen_ge_dou', name: '近身格斗', mpCost: 50, type: 'attack', power: 110, cooldown: 3, range: 1, description: '选择1格范围内的1个敌方目标，造成110%攻击力+30%当前生命值的伤害', effectType: 'fire', attribute: 'normal', category: '指定', skillTypeTag: '攻击', rangeTag: '1格', targetCountTag: '1个', damageFormula: 'atk_plus_hp_pct', hpPct: 0.3 },
  shadow_assassination: { id: 'shadow_assassination', name: '暗影刺杀', mpCost: 50, type: 'attack', power: 150, cooldown: 3, range: 1, areaRange: 1, description: '以自己为中心，对1格菱形范围内的所有敌方目标造成150%攻击力的伤害', effectType: 'shadow', attribute: 'normal', category: 'aoe', skillTypeTag: '攻击', rangeTag: '1格', targetCountTag: 'AOE', rangeType: 'diamond' },
  throw_grenade: { id: 'throw_grenade', name: '投掷手雷', mpCost: 50, type: 'attack', power: 200, cooldown: 3, range: 3, areaRange: 1, description: '选择3格范围内的1个格子为目标，对以该格子为中心范围1格的菱形区域内的所有敌方目标造成攻击力200%的伤害，并清除范围内的障碍物', effectType: 'fire', attribute: 'fire', category: 'aoe', skillTypeTag: '攻击', rangeTag: '3格', targetCountTag: '轰炸', clearObstacles: true, rangeType: 'diamond' },
  spit_slime: { id: 'spit_slime', name: '口吐粘液', mpCost: 50, type: 'attack', power: 140, cooldown: 3, range: 2, description: '选择2格范围内的1个敌方目标，造成140%攻击力的伤害，并使目标陷入【虚弱】状态', attribute: 'earth', category: '指定', skillTypeTag: '攻击', rangeTag: '2格', targetCountTag: '1个', statusEffect: 'weak' },
  fushi_nianye: { id: 'fushi_nianye', name: '腐蚀粘液', mpCost: 0, type: 'attack', power: 225, cooldown: 2, range: 2, areaRange: 2, description: '以自身为中心引爆，对2格范围内的所有敌方目标造成225%攻击力的伤害，并使目标进入【虚弱】状态（攻击力-10%，防御力-50%），使用后自身战败退场（仅在生命值<=20%时可用）', attribute: 'earth', category: 'aoe', skillTypeTag: '攻击', rangeTag: '2格', targetCountTag: 'AOE', statusEffect: 'weak', rangeType: 'diamond', selfDefeat: true },
  er_ye_pao_xiao: { id: 'er_ye_pao_xiao', name: '二爷咆哮', mpCost: 50, type: 'attack', power: 150, cooldown: 5, range: 1, description: '选择1格范围内的1个敌方目标，造成150%攻击力的伤害，自身获得【愤怒】状态', attribute: 'normal', category: '指定', skillTypeTag: '攻击', rangeTag: '1格', targetCountTag: '1个', selfStatusEffects: ['fury'] },
  xie_e_kun_bang: { id: 'xie_e_kun_bang', name: '邪恶捆绑', mpCost: 50, type: 'attack', power: 150, cooldown: 3, range: 4, description: '选择4格范围内的1个敌方目标，造成150%攻击力的伤害，并使目标陷入【禁锢】状态', attribute: 'wood', category: '指定', skillTypeTag: '攻击', rangeTag: '4格', targetCountTag: '1个', statusEffect: 'imprison' },
  life_drain: { id: 'life_drain', name: '汲取生命', mpCost: 35, type: 'attack', power: 120, cooldown: 2, range: 5, description: '选择5格范围内的1个敌方目标，造成120%攻击力的伤害，恢复自身造成伤害33%的生命值', attribute: 'metal', category: '指定', skillTypeTag: '攻击', rangeTag: '5格', targetCountTag: '1个', lifesteal: 0.333 },
  xiong_meng_si_yao: { id: 'xiong_meng_si_yao', name: '凶猛撕咬', mpCost: 50, type: 'attack', power: 150, cooldown: 3, range: 1, description: '选择1格范围内的1个敌方目标，造成150%攻击力的伤害', attribute: 'normal', category: '指定', skillTypeTag: '攻击', rangeTag: '1格', targetCountTag: '1个' },
  excited_frenzy: { id: 'excited_frenzy', name: '兴奋狂热', mpCost: 50, type: 'attack', power: 200, cooldown: 3, range: 3, description: '消耗自身最大生命值的20%（剩余生命不低于1），选择3格范围内的1个敌方目标，造成200%攻击力的伤害', attribute: 'normal', category: '指定', skillTypeTag: '攻击', rangeTag: '3格', targetCountTag: '1个', selfHpCost: 0.2 },
  jue_chu_feng_sheng: { id: 'jue_chu_feng_sheng', name: '绝处逢生', mpCost: 10, type: 'support', power: 0, cooldown: 4, description: '消耗自身最大生命值20%的生命（消耗后生命值至少为1），使自己进入【愤怒】状态', attribute: 'normal', category: 'support', skillTypeTag: '辅助', rangeTag: '1格', targetCountTag: '1个' },
  jue_ming_fu_ji: { id: 'jue_ming_fu_ji', name: '绝命伏击', mpCost: 50, type: 'attack', power: 200, cooldown: 2, range: 1, description: '选择1格范围内的1个敌方目标，造成200%攻击力的伤害', attribute: 'normal', category: '指定', skillTypeTag: '攻击', rangeTag: '1格', targetCountTag: '1个' },
  lingqi_bo: { id: 'lingqi_bo', name: '灵气波', mpCost: 40, type: 'attack', power: 150, cooldown: 3, range: 3, description: '选择3格范围内的1个敌方目标，造成150%攻击力的伤害', attribute: 'normal', category: '指定', skillTypeTag: '攻击', rangeTag: '3格', targetCountTag: '1个' },
  hong_hua_lv_ye: { id: 'hong_hua_lv_ye', name: '红花绿叶', mpCost: 60, type: 'attack', power: 120, cooldown: 3, range: 2, description: '选择2格范围内的1个敌方目标，造成120%攻击力的伤害，提高自身生命值上限并恢复生命值（提高和恢复量为攻击力的80%）', attribute: 'wood', category: '指定', skillTypeTag: '攻击', rangeTag: '2格', targetCountTag: '1个', selfMaxHpBuff: 0.8 },
  ni_tian_can_ren: { id: 'ni_tian_can_ren', name: '逆天残刃', mpCost: 60, type: 'attack', power: 120, cooldown: 4, range: 3, targetCount: 3, description: '选择3格范围内的3个敌方目标，分别造成120%攻击力的伤害', attribute: 'metal', category: '指定', skillTypeTag: '攻击', rangeTag: '3格', targetCountTag: '3个' },
  dao_guang_jian_ying: { id: 'dao_guang_jian_ying', name: '刀光剑影', mpCost: 50, type: 'attack', power: 140, cooldown: 2, range: 3, targetCount: 2, description: '选择3格范围内的2个敌方目标，分别造成140%攻击力的伤害', attribute: 'metal', category: '指定', skillTypeTag: '攻击', rangeTag: '3格', targetCountTag: '2个' },
  tian_han_di_dong: { id: 'tian_han_di_dong', name: '天寒地冻', mpCost: 50, type: 'attack', power: 150, cooldown: 2, range: 3, description: '选择3格范围内的1个敌方目标，造成150%攻击力的伤害，在目标脚下产生雪地', attribute: 'water', category: '指定', skillTypeTag: '攻击', rangeTag: '3格', targetCountTag: '1个', createSnowTerrain: true },
  terror_scream: { id: 'terror_scream', name: '恐怖尖叫', mpCost: 50, type: 'attack', power: 150, cooldown: 4, range: 0, areaRange: 3, description: '以自身为中心，对3格菱形范围内的所有敌方目标造成150%攻击力的伤害，并在2格范围内的空格随机生成1只普通丧尸', attribute: 'dark', category: 'aoe', skillTypeTag: '攻击', rangeTag: '3格', targetCountTag: 'AOE', rangeType: 'diamond', summonZombie: true },
  tian_beng_di_lie: { id: 'tian_beng_di_lie', name: '天崩地裂', mpCost: 60, type: 'attack', power: 80, cooldown: 3, range: 0, areaRange: 1, description: '以自身为中心，对1格正方形范围内的所有敌方目标造成80%攻击力的伤害', effectType: 'fire', attribute: 'earth', category: 'aoe', skillTypeTag: '攻击', rangeTag: '1格', targetCountTag: 'AOE', rangeType: 'square' },
  luo_tu_fei_yan: { id: 'luo_tu_fei_yan', name: '落土飞岩', mpCost: 75, type: 'attack', power: 150, cooldown: 4, range: 1, description: '选择1格范围内的1个敌方目标，造成150%攻击力的伤害，自身获得【强力】状态', effectType: 'earth', attribute: 'earth', category: '指定', skillTypeTag: '攻击', rangeTag: '1格', targetCountTag: '1个', selfStatusEffects: ['strong'] },
  lingqisi: { id: 'lingqisi', name: '灵气丝', mpCost: 40, type: 'attack', power: 130, cooldown: 3, range: 3, description: '选择3格范围内的1个敌方目标，造成130%攻击力的伤害，恢复自身造成伤害38%的生命值', attribute: 'normal', category: '指定', skillTypeTag: '攻击', rangeTag: '3格', targetCountTag: '1个', lifesteal: 0.385 },
  xing_huo_liao_yuan: { id: 'xing_huo_liao_yuan', name: '星火燎原', mpCost: 60, type: 'attack', power: 130, cooldown: 3, range: 3, targetCount: 2, description: '选择3格范围内的2个敌方目标，分别造成130%攻击力的伤害', effectType: 'fire', attribute: 'fire', category: '指定', skillTypeTag: '攻击', rangeTag: '3格', targetCountTag: '2个' },
  ju_huo_fen_tian: { id: 'ju_huo_fen_tian', name: '举火焚天', mpCost: 50, type: 'attack', power: 120, cooldown: 3, range: 3, description: '选择3格范围内的1个敌方目标，造成120%攻击力的伤害，自身获得【强力】状态', effectType: 'fire', attribute: 'fire', category: '指定', skillTypeTag: '攻击', rangeTag: '3格', targetCountTag: '1个', selfStatusEffects: ['strong'] },
  yuan_cheng_dao_dan: { id: 'yuan_cheng_dao_dan', name: '远程导弹', mpCost: 75, type: 'attack', power: 130, cooldown: 3, range: 4, areaRange: 1, description: '选择4格范围内的1个格子为目标，对以该格子为中心的1格菱形范围内的所有敌方目标造成130%攻击力的伤害', attribute: 'metal', category: 'aoe', skillTypeTag: '攻击', rangeTag: '4格', targetCountTag: '轰炸', rangeType: 'diamond' },
  jing_zhun_da_ji: { id: 'jing_zhun_da_ji', name: '精准打击', mpCost: 60, type: 'attack', power: 130, cooldown: 3, range: 4, targetCount: 2, description: '选择4格范围内的2个敌方目标，分别造成130%攻击力的伤害', attribute: 'metal', category: '指定', skillTypeTag: '攻击', rangeTag: '4格', targetCountTag: '2个' },
  gong_cheng_zhong_pao: { id: 'gong_cheng_zhong_pao', name: '攻城重炮', mpCost: 80, type: 'attack', power: 220, cooldown: 3, range: 5, areaRange: 1, description: '选择5格范围内的1个格子为目标，对以该格子为中心的1格菱形范围内的所有敌方目标造成220%攻击力的伤害；自身陷入【瘸腿】和【鹰眼】状态', effectType: 'fire', attribute: 'fire', category: 'aoe', skillTypeTag: '攻击', rangeTag: '5格', targetCountTag: '轰炸', rangeType: 'diamond', selfStatusEffects: ['lame', 'eagle_eye'] },
  hong_lian_hua_huo: { id: 'hong_lian_hua_huo', name: '红莲花火', mpCost: 80, type: 'attack', power: 150, cooldown: 3, range: 3, targetCount: 1, description: '选择3格范围内的1个敌方目标，造成150%攻击力的伤害，并使目标陷入【燃烧】状态', effectType: 'fire', attribute: 'fire', category: '指定', skillTypeTag: '攻击', rangeTag: '3格', targetCountTag: '1个', statusEffect: 'burning' },
  she_jian_du_wen: { id: 'she_jian_du_wen', name: '蛇剑毒吻', mpCost: 80, type: 'attack', power: 120, cooldown: 3, range: 3, targetCount: 2, description: '选择3格范围内的2个敌方目标，分别造成120%攻击力的伤害，并使目标陷入【流血】状态', effectType: 'earth', attribute: 'fire', category: '指定', skillTypeTag: '攻击', rangeTag: '3格', targetCountTag: '2个', statusEffect: 'bleeding' },
  xie_shen_di_yu: { id: 'xie_shen_di_yu', name: '邪神低语', mpCost: 90, type: 'attack', power: 120, cooldown: 4, range: 0, areaRange: 2, description: '以自身为中心，对2格菱形范围内的所有敌方目标造成120%攻击力的伤害，并使目标陷入【迷离】状态', effectType: 'shadow', attribute: 'earth', category: 'aoe', skillTypeTag: '攻击', rangeTag: '2格', targetCountTag: 'AOE', statusEffect: 'mili', rangeType: 'diamond' },
  rao_luan_xin_shen: { id: 'rao_luan_xin_shen', name: '扰乱心神', mpCost: 80, type: 'attack', power: 180, cooldown: 3, range: 2, targetCount: 1, description: '选择2格范围内的1个敌方目标，造成180%攻击力的伤害，驱散目标所有正面状态', effectType: 'shadow', attribute: 'earth', category: '指定', skillTypeTag: '攻击', rangeTag: '2格', targetCountTag: '1个', clearPositiveStatus: true },
  yi_jian_ting_yu: { id: 'yi_jian_ting_yu', name: '奕剑听雨', mpCost: 100, type: 'attack', power: 120, cooldown: 4, range: 0, areaRange: 2, description: '以自身为中心，对2格菱形范围内的所有敌方目标造成120%攻击力的伤害，并使自身获得【强力】和【迅捷】状态', effectType: 'metal', attribute: 'metal', category: 'aoe', skillTypeTag: '攻击', rangeTag: '2格', targetCountTag: 'AOE', rangeType: 'diamond', selfStatusEffects: ['strong', 'swift'] },
  ling_yun_fei_jian: { id: 'ling_yun_fei_jian', name: '凌云飞剑', mpCost: 75, type: 'attack', power: 130, cooldown: 3, range: 3, targetCount: 3, description: '选择3格范围内的3个敌方目标，分别造成130%攻击力的伤害', effectType: 'metal', attribute: 'metal', category: '指定', skillTypeTag: '攻击', rangeTag: '3格', targetCountTag: '3个' },
  ju_qi_cheng_ren: { id: 'ju_qi_cheng_ren', name: '聚气成刃', mpCost: 65, type: 'attack', power: 150, cooldown: 3, range: 3, targetCount: 2, description: '选择3格范围内的2个敌方目标，分别造成150%攻击力的伤害', attribute: 'metal', category: '指定', skillTypeTag: '攻击', rangeTag: '3格', targetCountTag: '2个' },
  yin_yang_kui_lei_shu: { id: 'yin_yang_kui_lei_shu', name: '阴阳傀儡术', mpCost: 90, type: 'attack', power: 180, cooldown: 4, range: 3, targetCount: 1, description: '选择3格范围内的1个敌方目标，造成180%攻击力的伤害，并使目标陷入【脆弱】状态', effectType: 'earth', attribute: 'metal', category: '指定', skillTypeTag: '攻击', rangeTag: '3格', targetCountTag: '1个', statusEffect: 'fragile' },
  meng_hu_xia_shan: { id: 'meng_hu_xia_shan', name: '猛虎下山', mpCost: 60, type: 'attack', power: 180, cooldown: 3, range: 1, targetCount: 1, description: '选择1格范围内的1个敌方目标，造成180%攻击力的伤害', attribute: 'earth', category: '指定', skillTypeTag: '攻击', rangeTag: '1格', targetCountTag: '1个' },
  meng_hu_si_hou: { id: 'meng_hu_si_hou', name: '猛虎嘶吼', mpCost: 60, type: 'attack', power: 70, cooldown: 4, range: 3, targetCount: 2, description: '选择3格范围内的2个敌方目标，分别造成70%攻击力的伤害，并使目标陷入【脆弱】状态', effectType: 'earth', attribute: 'earth', category: '指定', skillTypeTag: '攻击', rangeTag: '3格', targetCountTag: '2个', statusEffect: 'fragile' },
  da_di_zhong_ji: { id: 'da_di_zhong_ji', name: '大地重击', mpCost: 75, type: 'attack', power: 130, cooldown: 3, range: 0, areaRange: 2, description: '以自身为中心，对2格菱形范围内的所有敌方目标造成130%攻击力的伤害', effectType: 'earth', attribute: 'earth', category: 'aoe', skillTypeTag: '攻击', rangeTag: '2格', targetCountTag: 'AOE', rangeType: 'diamond' },
  man_jia_chong_ji: { id: 'man_jia_chong_ji', name: '蛮甲冲击', mpCost: 60, type: 'attack', power: 160, cooldown: 2, range: 2, description: '选择2格范围内的1个敌方目标，造成160%攻击力的伤害，自身获得【刚毅】状态', effectType: 'earth', attribute: 'earth', category: '指定', skillTypeTag: '攻击', rangeTag: '2格', targetCountTag: '1个', selfStatusEffects: ['resolute'] },
  sui_lie_zhong_ji: { id: 'sui_lie_zhong_ji', name: '碎裂重击', mpCost: 75, type: 'attack', power: 200, cooldown: 3, range: 1, description: '选择1格范围内的1个敌方目标，造成200%攻击力的伤害，并使目标陷入【眩晕】状态', effectType: 'earth', attribute: 'earth', category: '指定', skillTypeTag: '攻击', rangeTag: '1格', targetCountTag: '1个', statusEffect: 'stun' },
  mo_lian_gui_shou: { id: 'mo_lian_gui_shou', name: '魔殓鬼手', mpCost: 50, type: 'attack', power: 120, cooldown: 3, range: 0, areaRange: 1, description: '以自身为中心，对1格正方形范围内的所有敌方目标造成120%攻击力的伤害，并恢复自身造成伤害总和35%的生命值', effectType: 'shadow', attribute: 'earth', category: 'aoe', skillTypeTag: '攻击', rangeTag: '1格', targetCountTag: 'AOE', rangeType: 'square', lifesteal: 0.35 },
  qian_zhu_sui_ying: { id: 'qian_zhu_sui_ying', name: '千蛛碎影', mpCost: 60, type: 'attack', power: 110, cooldown: 3, range: 3, targetCount: 3, description: '选择3格范围内的3个敌方目标，分别造成110%攻击力的伤害', effectType: 'wood', attribute: 'wood', category: '指定', skillTypeTag: '攻击', rangeTag: '3格', targetCountTag: '3个' },
  ju_du_shi_gu: { id: 'ju_du_shi_gu', name: '巨毒噬骨', mpCost: 50, type: 'attack', power: 120, cooldown: 3, range: 3, description: '选择3格范围内的1个敌方目标，造成120%攻击力的伤害，并使目标陷入【中毒】状态', effectType: 'wood', attribute: 'wood', category: '指定', skillTypeTag: '攻击', rangeTag: '3格', targetCountTag: '1个', statusEffect: 'poison' },
  die_xue_ci_ji: { id: 'die_xue_ci_ji', name: '喋血刺击', mpCost: 50, type: 'attack', power: 150, cooldown: 3, range: 1, description: '选择1格范围内的1个敌方目标，造成150%攻击力的伤害，并使目标陷入【流血】状态', effectType: 'wind', attribute: 'normal', category: '指定', skillTypeTag: '攻击', rangeTag: '1格', targetCountTag: '1个', statusEffect: 'bleeding' },
  zi_bao_du_ye: { id: 'zi_bao_du_ye', name: '自爆毒液', mpCost: 100, type: 'attack', power: 150, cooldown: 5, range: 1, areaRange: 1, description: '引爆自身（直接战败退场），对以自身为中心的1格正方形范围内的所有敌方目标造成150%攻击力的伤害，并使目标陷入【中毒】状态', effectType: 'wood', attribute: 'wood', category: 'aoe', skillTypeTag: '攻击', rangeTag: '1格', targetCountTag: 'AOE', statusEffect: 'poison', rangeType: 'square', selfDefeat: true },
  zhai_ye_fei_hua: { id: 'zhai_ye_fei_hua', name: '摘叶飞花', mpCost: 50, type: 'attack', power: 100, cooldown: 3, range: 3, description: '选择3格范围内的1个敌方目标，造成(100%+20%*与目标距离)攻击力的伤害，并使目标陷入【流血】状态', effectType: 'wind', attribute: 'wind', category: '指定', skillTypeTag: '攻击', rangeTag: '3格', targetCountTag: '1个', statusEffect: 'bleeding', damageFormula: 'move_based' },
  wan_ye_fei_hua: { id: 'wan_ye_fei_hua', name: '万叶飞花', mpCost: 75, type: 'attack', power: 110, cooldown: 4, range: 3, targetCount: 2, description: '选择3格范围内的2个敌方目标，分别造成110%攻击力的伤害，并使目标陷入【流血】状态', effectType: 'wind', attribute: 'wind', category: '指定', skillTypeTag: '攻击', rangeTag: '3格', targetCountTag: '2个', statusEffect: 'bleeding' },
  yin_yang_yu_shou_yin: { id: 'yin_yang_yu_shou_yin', name: '阴阳玉手印', mpCost: 75, type: 'attack', power: 300, cooldown: 4, range: 3, targetCount: 3, description: '选择3格范围内的3个敌方目标，总计造成300%攻击力的伤害，根据目标数量均摊伤害', attribute: 'dark', category: '指定', skillTypeTag: '攻击', rangeTag: '3格', targetCountTag: '3个' },
  xi_xue: { id: 'xi_xue', name: '吸血', mpCost: 50, type: 'attack', power: 120, cooldown: 2, range: 1, description: '选择1格范围内的1个敌方目标，造成120%攻击力的伤害，恢复自身造成伤害67%的生命值', effectType: 'shadow', attribute: 'dark', category: '指定', skillTypeTag: '攻击', rangeTag: '1格', targetCountTag: '1个', lifesteal: 0.667 },
  ling_hun_zu_zhou: { id: 'ling_hun_zu_zhou', name: '灵魂诅咒', mpCost: 60, type: 'attack', power: 110, cooldown: 3, range: 5, description: '选择5格范围内的1个敌方目标，造成110%攻击力的伤害，并使目标陷入【沉默】状态，持续3回合', effectType: 'shadow', attribute: 'dark', category: '指定', skillTypeTag: '攻击', rangeTag: '5格', targetCountTag: '1个', statusEffect: 'silenced' },
  ling_hun_rao_luan: { id: 'ling_hun_rao_luan', name: '灵魂扰乱', mpCost: 75, type: 'attack', power: 75, cooldown: 3, range: 3, targetCount: 2, description: '选择3格范围内的2个敌方目标，分别造成75%攻击力的伤害，并使目标陷入【心乱】状态', effectType: 'shadow', attribute: 'dark', category: '指定', skillTypeTag: '攻击', rangeTag: '3格', targetCountTag: '2个', statusEffect: 'xinluan' },
  mei_huo: { id: 'mei_huo', name: '魅惑', mpCost: 50, type: 'attack', power: 120, cooldown: 3, range: 2, description: '选择2格范围内的1个敌方目标，造成120%攻击力的伤害，并使目标陷入【心乱】状态', effectType: 'shadow', attribute: 'water', category: '指定', skillTypeTag: '攻击', rangeTag: '2格', targetCountTag: '1个', statusEffect: 'xinluan' },
  pu_tong_hu_li: { id: 'pu_tong_hu_li', name: '普通护理', mpCost: 25, type: 'heal', power: 50, cooldown: 2, range: 2, description: '选择2格范围内的1个指定目标，恢复生命值和法力值，恢复量为50%的攻击力', attribute: 'normal', category: 'heal', skillTypeTag: '治疗', rangeTag: '2格', targetCountTag: '1个' },
  jin_ji_zhi_liao: { id: 'jin_ji_zhi_liao', name: '紧急治疗', mpCost: 50, type: 'heal', power: 100, cooldown: 3, range: 2, description: '选择2格范围内的1个指定目标，恢复生命值和法力值，恢复量为100%的攻击力，并驱散目标所有不良状态', attribute: 'normal', category: 'heal', skillTypeTag: '治疗', rangeTag: '2格', targetCountTag: '1个' },
  zhao_huan_ling_chong: { id: 'zhao_huan_ling_chong', name: '召唤灵宠', mpCost: 75, type: 'support', power: 0, cooldown: 5, range: 2, targetCount: 1, description: '选择2格范围内的1个空格，召唤一只职业为【灵宠】的随机角色', attribute: 'water', category: 'summon', skillTypeTag: '召唤', rangeTag: '2格', targetCountTag: '1个', summonJob: '灵宠' },
  gao_shan_liu_shui: { id: 'gao_shan_liu_shui', name: '高山流水', mpCost: 75, type: 'heal', power: 120, cooldown: 3, range: 4, targetCount: 2, description: '选择4格范围内的2个指定目标，恢复生命值和法力值，恢复量为75%的攻击力，并驱散目标所有不良状态', attribute: 'water', category: 'heal', skillTypeTag: '治疗', rangeTag: '4格', targetCountTag: '2个' },
  lian_yu_huo_hai: { id: 'lian_yu_huo_hai', name: '炼狱火海', mpCost: 90, type: 'attack', power: 95, cooldown: 3, range: 0, areaRange: 2, description: '以自身为中心，对2格菱形范围内的所有敌方目标造成95%攻击力的伤害，并使目标陷入【燃烧】状态', attribute: 'fire', category: 'aoe', skillTypeTag: '攻击', rangeTag: '2格', targetCountTag: 'AOE', statusEffect: 'burning', rangeType: 'diamond' },
  wang_zhe_zhi_qi: { id: 'wang_zhe_zhi_qi', name: '亡者之气', mpCost: 70, type: 'attack', power: 100, cooldown: 3, range: 3, targetCount: 2, description: '选择3格范围内的2个敌方目标，分别造成100%攻击力的伤害，并使目标陷入【心乱】状态', attribute: 'fire', category: '指定', skillTypeTag: '攻击', rangeTag: '3格', targetCountTag: '2个', statusEffect: 'xinluan' },
  ku_lou_xue_shou_yin: { id: 'ku_lou_xue_shou_yin', name: '骷髅血手印', mpCost: 60, type: 'attack', power: 160, cooldown: 3, range: 3, description: '选择3格范围内的1个敌方目标，造成160%攻击力的伤害，并使目标陷入【流血】状态', attribute: 'fire', category: '指定', skillTypeTag: '攻击', rangeTag: '3格', targetCountTag: '1个', statusEffect: 'bleeding' },
  liu_hun_kong_zhou: { id: 'liu_hun_kong_zhou', name: '六魂恐咒', mpCost: 80, type: 'attack', power: 150, cooldown: 4, range: 2, description: '选择2格范围内的1个敌方目标，造成150%攻击力的伤害，并使目标陷入【中毒】和【沉默】状态', attribute: 'fire', category: '指定', skillTypeTag: '攻击', rangeTag: '2格', targetCountTag: '1个', statusEffects: ['poison', 'silenced'] },
  zhi_yu_zhi_guang: { id: 'zhi_yu_zhi_guang', name: '治愈之光', mpCost: 70, type: 'heal', power: 100, cooldown: 4, range: 3, description: '选择3格范围内的1个友方目标，恢复自己和该目标100%攻击力的生命值与法力值，并驱散目标所有不良状态', attribute: 'wind', category: 'heal', skillTypeTag: '治疗', rangeTag: '3格', targetCountTag: '1个' },
  emp_chong_ji_bo: { id: 'emp_chong_ji_bo', name: 'EMP冲击波', mpCost: 100, type: 'attack', power: 120, cooldown: 4, range: 3, areaRange: 1, description: '选择3格范围内的1个格子为目标，对以该格子为中心的1格菱形范围内的所有敌方目标，造成攻击力120%的伤害，并使目标陷入【沉默】状态，持续2回合', effectType: 'wind', attribute: 'wind', category: 'aoe', skillTypeTag: '攻击', elementTag: '风', rangeTag: '3格', targetCountTag: '轰炸', rangeType: 'diamond', statusEffect: 'silenced', statusEffectDuration: 2 },
  fu_she_da_ji: { id: 'fu_she_da_ji', name: '辐射打击', mpCost: 80, type: 'attack', power: 150, cooldown: 3, range: 4, description: '选择4格范围内的1个敌方目标，造成150%攻击力的伤害，并使目标陷入【中毒】状态', attribute: 'wind', category: '指定', skillTypeTag: '攻击', rangeTag: '4格', targetCountTag: '1个', statusEffect: 'poison' },
  huo_yu_liu_xing: { id: 'huo_yu_liu_xing', name: '火羽流星', mpCost: 80, type: 'attack', power: 70, cooldown: 3, range: 3, targetCount: 3, description: '选择3格范围内的3个敌方目标，分别造成70%攻击力的伤害', effectType: 'fire', attribute: 'fire', category: '指定', skillTypeTag: '攻击', rangeTag: '3格', targetCountTag: '3个' },
  tian_ya_qing_qing: { id: 'tian_ya_qing_qing', name: '天雅倾情', mpCost: 60, type: 'heal', power: 10, cooldown: 4, range: 4, description: '选择4格范围内的1个友方目标，恢复生命值和法力值，恢复量为自身10%生命值和法力值上限，并消除所有不良状态', attribute: 'yang', category: 'heal', skillTypeTag: '治疗', rangeTag: '4格', targetCountTag: '1个' },
  yu_yin_rao_liang: { id: 'yu_yin_rao_liang', name: '余音绕梁', mpCost: 60, type: 'heal', power: 110, cooldown: 4, range: 3, description: '选择3格范围内的1个友方角色（可以选自己），恢复攻击力110%的生命值和40%攻击力的法力值，并获得【调息】状态', attribute: 'wind', category: 'heal', skillTypeTag: '治疗', rangeTag: '3格', targetCountTag: '1个' },
  feng_mo_qin_xin: { id: 'feng_mo_qin_xin', name: '疯魔琴心', mpCost: 60, type: 'heal', power: 120, cooldown: 4, range: 3, description: '选择3格范围内的1个友方角色（可以选自己），恢复攻击力120%的生命值，并获得【强力】状态', attribute: 'wind', category: 'heal', skillTypeTag: '治疗', rangeTag: '3格', targetCountTag: '1个' },
  shi_xin_shi_sui: { id: 'shi_xin_shi_sui', name: '噬心食髓', mpCost: 60, type: 'attack', power: 150, cooldown: 4, range: 3, description: '选择3格范围内的1个敌方目标，造成150%攻击力的伤害，并使目标陷入【中毒】状态', attribute: 'earth', category: '指定', skillTypeTag: '攻击', rangeTag: '3格', targetCountTag: '1个', statusEffect: 'poison' },
  tian_luo_di_wang: { id: 'tian_luo_di_wang', name: '天罗地网', mpCost: 60, type: 'attack', power: 120, cooldown: 4, range: 3, targetCount: 2, description: '选择3格范围内的2个敌方目标，分别造成120%攻击力的伤害，并使目标陷入【瘸腿】状态', attribute: 'earth', category: '指定', skillTypeTag: '攻击', rangeTag: '3格', targetCountTag: '2个', statusEffect: 'lame' },
  tao_zhi_yao_yao: { id: 'tao_zhi_yao_yao', name: '桃之夭夭', mpCost: 75, type: 'attack', power: 150, cooldown: 4, range: 3, description: '选择3格范围内的1个敌方目标，造成150%攻击力的伤害，并使目标陷入【迷离】状态', attribute: 'wood', category: '指定', skillTypeTag: '攻击', rangeTag: '3格', targetCountTag: '1个', statusEffect: 'mili' },
  tao_hua_zhuo_zhuo: { id: 'tao_hua_zhuo_zhuo', name: '桃花灼灼', mpCost: 60, type: 'heal', power: 120, cooldown: 4, range: 3, targetCount: 2, description: '选择3格范围内的2个友方角色，恢复120%攻击力的生命值，并获得【愈合】状态', attribute: 'wood', category: 'heal', skillTypeTag: '治疗', rangeTag: '3格', targetCountTag: '2个' },
  tun_jiu_kuang_xiao: { id: 'tun_jiu_kuang_xiao', name: '吞酒狂啸', mpCost: 80, type: 'attack', power: 150, cooldown: 3, range: 3, description: '选择上下左右某一方向为目标，对该方向上3格范围内的所有敌方单位，造成150%攻击力的伤害，自身获得【愤怒】状态', effectType: 'fire', attribute: 'fire', category: '直线', skillTypeTag: '攻击', rangeTag: '3格', targetCountTag: '直线', selfStatusEffects: ['fury'] },
  nu_za_hu_lu: { id: 'nu_za_hu_lu', name: '怒砸葫芦', mpCost: 60, type: 'attack', power: 150, cooldown: 4, range: 3, targetCount: 2, description: '选择3格范围内的2个敌方目标，分别造成150%攻击力的伤害，自身获得【脆皮】状态', effectType: 'fire', attribute: 'fire', category: '指定', skillTypeTag: '攻击', rangeTag: '3格', targetCountTag: '2个', selfStatusEffects: ['crumble'] },
  bi_hai_chao_sheng: { id: 'bi_hai_chao_sheng', name: '碧海潮生', mpCost: 75, type: 'heal', power: 120, cooldown: 3, range: 0, areaRange: 3, description: '选择自身为中心，对3格菱形范围内的所有友方角色，恢复120%攻击力的生命值，自身获得【愈合】状态', effectType: 'water', attribute: 'water', category: 'heal', skillTypeTag: '治疗', rangeTag: '3格', targetCountTag: 'AOE', selfStatusEffects: ['heal'] },
  shui_man_jin_shan: { id: 'shui_man_jin_shan', name: '水漫金山', mpCost: 75, type: 'attack', power: 80, cooldown: 4, range: 0, areaRange: 3, description: '以自身为中心，对3格菱形范围内的所有敌方目标造成80%攻击力的伤害，自身获得【刚毅】状态', effectType: 'water', attribute: 'water', category: 'aoe', skillTypeTag: '攻击', rangeTag: '3格', targetCountTag: 'AOE', rangeType: 'diamond', selfStatusEffects: ['resolute'] },
  mo_yu_he_ling: { id: 'mo_yu_he_ling', name: '墨羽鹤翎', mpCost: 80, type: 'attack', power: 130, cooldown: 3, range: 3, targetCount: 3, description: '选择3格范围内的3个敌方目标，分别造成130%攻击力的伤害，自身获得【鹰眼】状态', effectType: 'shadow', attribute: 'wind', category: '指定', skillTypeTag: '攻击', rangeTag: '3格', targetCountTag: '3个', selfStatusEffects: ['eagle_eye'] },
  mo_ying_jian_guang: { id: 'mo_ying_jian_guang', name: '墨影剑光', mpCost: 100, type: 'attack', power: 150, cooldown: 4, range: 0, areaRange: 2, description: '以自身为中心，对2格菱形范围内的所有敌方目标造成150%攻击力的伤害', effectType: 'shadow', attribute: 'wind', category: 'aoe', skillTypeTag: '攻击', rangeTag: '2格', targetCountTag: 'AOE', rangeType: 'diamond' },
  fu_guang_lue_ying: { id: 'fu_guang_lue_ying', name: '浮光掠影', mpCost: 80, type: 'heal', power: 50, cooldown: 4, range: 0, areaRange: 2, description: '选择自身为中心，对2格菱形范围内的所有友方角色，恢复50%攻击力的生命值与法力值，并且获得【迅捷】状态', effectType: 'fire', attribute: 'fire', category: 'heal', skillTypeTag: '治疗', rangeTag: '2格', targetCountTag: 'AOE', selfStatusEffects: ['swift'] },
  gao_bie_ming_deng: { id: 'gao_bie_ming_deng', name: '告别暝灯', mpCost: 100, type: 'attack', power: 120, cooldown: 4, range: 3, targetCount: 2, description: '选择3格范围内的2个敌方目标，分别造成120%攻击力的伤害，并使目标陷入【脆皮】状态', effectType: 'fire', attribute: 'fire', category: '指定', skillTypeTag: '攻击', rangeTag: '3格', targetCountTag: '2个', statusEffect: 'crumble' },
  shen_zhi_yi_shou: { id: 'shen_zhi_yi_shou', name: '神之一手', mpCost: 75, type: 'attack', power: 220, cooldown: 3, range: 3, targetCount: 1, description: '选择3格范围内的1个敌方目标，造成220%攻击力的伤害，自身获得【鹰眼】和【调息】状态', effectType: 'metal', attribute: 'metal', category: '指定', skillTypeTag: '攻击', rangeTag: '3格', targetCountTag: '1个', selfStatusEffects: ['eagle_eye', 'tune'] },
  yin_yang_qi_he: { id: 'yin_yang_qi_he', name: '阴阳气合', mpCost: 75, type: 'heal', power: 40, cooldown: 4, range: 0, areaRange: 2, description: '选择自身为中心，对2格菱形范围内的所有友方角色（包括自己），恢复40%攻击力的法力，并获得【调息】状态', effectType: 'metal', attribute: 'metal', category: 'heal', skillTypeTag: '治疗', rangeTag: '2格', targetCountTag: 'AOE', selfStatusEffects: ['tune'] },
  cang_jian_yi_ye: { id: 'cang_jian_yi_ye', name: '藏剑一叶', mpCost: 80, type: 'attack', power: 200, cooldown: 3, range: 2, targetCount: 1, description: '选择2格范围内的1个敌方目标，造成200%攻击力的伤害，并使目标陷入【迷离】状态', effectType: 'wood', attribute: 'wood', category: '指定', skillTypeTag: '攻击', rangeTag: '2格', targetCountTag: '1个', statusEffect: 'mili' },
  mu_feng_wei_shang: { id: 'mu_feng_wei_shang', name: '沐风为裳', mpCost: 90, type: 'heal', power: 50, cooldown: 4, range: 3, targetCount: 1, description: '选择3格范围内的1个友方目标，恢复自身和该目标50%攻击力的生命值和60%攻击力的法力值，驱散所有不良状态', effectType: 'wind', attribute: 'wood', category: 'heal', skillTypeTag: '治疗', rangeTag: '3格', targetCountTag: '1个' },
  huo_yan_pen_she: { id: 'huo_yan_pen_she', name: '火焰喷射', mpCost: 60, type: 'attack', power: 150, cooldown: 3, range: 1, sweepLength: 1, sweepWidth: 3, description: '选择上下左右某一方向为目标，对该方向上长1宽3范围内的所有敌方目标，造成攻击力150%的伤害，并使目标陷入【燃烧】状态', effectType: 'fire', attribute: 'fire', category: '横扫', skillTypeTag: '攻击', rangeTag: '1格', targetCountTag: '1x3', statusEffect: 'burning' },
  zhao_huan_wawa: { id: 'zhao_huan_wawa', name: '召唤娃娃', mpCost: 80, type: 'support', power: 0, cooldown: 3, range: 2, targetCount: 2, description: '选择2格菱形范围内的2个空地，召唤出2个【傀儡娃娃】，继承施法者阵营', attribute: 'dark', category: 'summon', skillTypeTag: '召唤', rangeTag: '2格', targetCountTag: '2个', summonCharacter: 'kuilei' },
  xi_rang_zai_sheng: { id: 'xi_rang_zai_sheng', name: '息壤再生', mpCost: 70, type: 'attack', power: 120, cooldown: 3, range: 1, description: '选择1格范围内的1个敌方目标，造成120%攻击力的伤害，恢复自身60%攻击力的生命值，自身获得【刚毅】状态', effectType: 'earth', attribute: 'normal', category: '指定', skillTypeTag: '攻击', rangeTag: '1格', targetCountTag: '1个', lifesteal: 0.5, selfStatusEffects: ['resolute'] },
  zhao_huan_nvhuang: { id: 'zhao_huan_nvhuang', name: '召唤女皇', mpCost: 125, type: 'support', power: 0, cooldown: 4, range: 2, targetCount: 1, description: '选择2格范围内的1个空地，召唤出1个【傀儡女皇】，继承施法者阵营', attribute: 'light', category: 'summon', skillTypeTag: '召唤', rangeTag: '2格', targetCountTag: '1个', summonCharacter: 'kuileinvhuang' },
  feng_wu_liu_huan: { id: 'feng_wu_liu_huan', name: '凤舞六幻', mpCost: 100, type: 'support', power: 0, cooldown: 5, range: 3, targetCount: 2, description: '消耗自身30%的生命值，选择3格菱形范围内的2个空格，召唤出2个【白凤】，召唤出的角色仅有生命值上限的30%血量，继承施法者阵营，白凤只有在血量>=50%生命值上限时可以使用该技能', effectType: 'wind', attribute: 'wind', category: 'summon', skillTypeTag: '召唤', rangeTag: '3格', targetCountTag: '2个', summonCharacter: 'baifeng', selfHpCost: 0.3, selfHpCostType: 'current', summonHpPct: 0.3, selfHpThreshold: 0.5, requireHpGtAtk: true },
  an_ye_jin_sheng: { id: 'an_ye_jin_sheng', name: '暗夜噤声', mpCost: 50, type: 'attack', power: 70, cooldown: 4, range: 3, targetCount: 2, description: '选择3格范围内的2个敌方目标，分别造成70%攻击力的伤害，并使目标陷入【沉默】状态，持续3回合', effectType: 'shadow', attribute: 'dark', category: '指定', skillTypeTag: '攻击', rangeTag: '3格', targetCountTag: '2个', statusEffect: 'silenced' },
  po_jing_chong_yuan: { id: 'po_jing_chong_yuan', name: '破镜重圆', mpCost: 50, type: 'attack', power: 150, cooldown: 2, range: 2, targetCount: 1, description: '选择2格范围内的1个敌方目标，造成150%攻击力的伤害，若目标有增益状态则自身获得相同增益', effectType: 'metal', attribute: 'metal', category: '指定', skillTypeTag: '攻击', rangeTag: '2格', targetCountTag: '1个' },
  yue_zhi_yin_li: { id: 'yue_zhi_yin_li', name: '月之引力', mpCost: 80, type: 'support', power: 0, cooldown: 5, range: 2, targetCount: 1, description: '选择2格范围内的1个同阵营目标，自身和该目标获得【愈合】和【调息】状态', effectType: 'water', attribute: 'water', category: 'support', skillTypeTag: '辅助', rangeTag: '2格', targetCountTag: '1个' },
  tian_tu_zhan_fang: { id: 'tian_tu_zhan_fang', name: '天兔绽放', mpCost: 60, type: 'attack', power: 120, cooldown: 3, range: 0, areaRange: 2, description: '以自身为中心，对2格菱形范围内的所有敌方目标造成120%攻击力的伤害', effectType: 'water', attribute: 'water', category: 'aoe', skillTypeTag: '攻击', rangeTag: '2格', targetCountTag: 'AOE', rangeType: 'diamond' },
  fei_xue_meng_ji: { id: 'fei_xue_meng_ji', name: '沸血猛击', mpCost: 80, type: 'attack', power: 210, cooldown: 3, range: 1, targetCount: 1, description: '选择1格范围内的1个敌方目标，造成210%攻击力的伤害，自身损失10%最大生命值并获得【愤怒】状态', effectType: 'earth', attribute: 'earth', category: '指定', skillTypeTag: '攻击', rangeTag: '1格', targetCountTag: '1个', selfHpCost: 0.1, selfStatusEffects: ['fury'] },
  wu_di_niu_niu: { id: 'wu_di_niu_niu', name: '无敌牛牛', mpCost: 100, type: 'heal', power: 100, cooldown: 5, range: 0, targetCount: 1, description: '选择自身为目标，恢复自身100%攻击力的生命值，驱散所有不良状态，并且自身获得【愈合】状态', effectType: 'earth', attribute: 'earth', category: 'heal', skillTypeTag: '治疗', rangeTag: '1格', targetCountTag: '1个', selfStatusEffects: ['heal'] },
  jian_yu: { id: 'jian_yu', name: '箭雨', mpCost: 80, type: 'attack', power: 80, cooldown: 3, range: 4, areaRange: 2, description: '选择4格范围内的1个格子为目标，对以该格子为中心的2格菱形范围内的所有敌方目标造成80%攻击力的伤害', effectType: 'wind', attribute: 'wind', category: 'aoe', skillTypeTag: '攻击', rangeTag: '4格', targetCountTag: '轰炸', rangeType: 'diamond' },
  sui_xing: { id: 'sui_xing', name: '碎星', mpCost: 80, type: 'attack', power: 200, cooldown: 4, range: 4, targetCount: 1, description: '选择4格范围内的1个敌方目标，造成200%攻击力的伤害，并使目标陷入【流血】状态', effectType: 'wind', attribute: 'wind', category: '指定', statusEffect: 'bleeding', skillTypeTag: '攻击', rangeTag: '4格', targetCountTag: '1个' },
  miao_shou: { id: 'miao_shou', name: '妙手', mpCost: 80, type: 'heal', power: 100, cooldown: 4, range: 3, targetCount: 1, description: '选择3格菱形范围内的1个友方单位（可以选择自身），恢复100%攻击力的生命值，使目标获得【愈合】状态，并驱散目标所有不良状态', effectType: 'water', attribute: 'water', category: 'heal', skillTypeTag: '治疗', rangeTag: '3格', targetCountTag: '1个' },
  cuo_gu: { id: 'cuo_gu', name: '错骨', mpCost: 80, type: 'attack', power: 50, cooldown: 4, range: 2, targetCount: 1, description: '选择2格范围内的1个敌方目标，造成50%攻击力+20%当前生命值的伤害，并使目标陷入【紊乱】状态', effectType: 'water', attribute: 'water', category: '指定', damageFormula: 'atk_plus_hp_pct', hpPct: 0.2, statusEffect: 'disorder', skillTypeTag: '攻击', rangeTag: '2格', targetCountTag: '1个' },
  you_ju_xi_tian: { id: 'you_ju_xi_tian', name: '幽驹袭天', mpCost: 50, type: 'attack', power: 100, cooldown: 3, range: 0, areaRange: 1, description: '以自身为中心，对1格菱形范围内的所有敌方目标，造成100%攻击力的伤害', effectType: 'shadow', attribute: 'dark', category: 'aoe', skillTypeTag: '攻击', rangeTag: '1格', targetCountTag: 'AOE', rangeType: 'diamond' },
  zhao_huan_you_ju: { id: 'zhao_huan_you_ju', name: '召唤幽驹', mpCost: 125, type: 'support', power: 0, cooldown: 6, range: 2, targetCount: 1, description: '选择自身2格范围内的1个空格，召唤角色【幽驹】', effectType: 'shadow', attribute: 'dark', category: 'summon', skillTypeTag: '召唤', rangeTag: '2格', targetCountTag: '1个', summonCharacter: 'youju' },
  ba_wang_qiang: { id: 'ba_wang_qiang', name: '霸王枪', mpCost: 65, type: 'attack', power: 150, cooldown: 3, range: 2, targetCount: 1, description: '选择2格菱形范围内的1个敌方目标，造成150%攻击力的伤害，并且使对方陷入【燃烧】状态', effectType: 'fire', attribute: 'fire', category: '指定', skillTypeTag: '攻击', rangeTag: '2格', targetCountTag: '1个', statusEffect: 'burning' },
  zhen_long_sha: { id: 'zhen_long_sha', name: '镇龙杀', mpCost: 80, type: 'attack', power: 120, cooldown: 4, range: 3, description: '选择上下左右某一方向为目标，对该方向上3格范围以内的所有敌方目标造成120%攻击力的伤害', effectType: 'thunder', attribute: 'metal', category: '直线', skillTypeTag: '攻击', rangeTag: '3格', targetCountTag: '直线' },
  ji_gu_tu: { id: 'ji_gu_tu', name: '戟骨突', mpCost: 75, type: 'attack', power: 120, cooldown: 4, range: 3, description: '选择上下左右某一方向为目标，对该方向上3格范围内的所有敌方单位，造成120%攻击力的伤害，并使目标陷入【中毒】状态', effectType: 'shadow', attribute: 'dark', category: '直线', skillTypeTag: '攻击', rangeTag: '3格', targetCountTag: '直线', statusEffect: 'poison' },
  duan_yan_sui_feng_bo: { id: 'duan_yan_sui_feng_bo', name: '断岩碎风波', mpCost: 75, type: 'attack', power: 100, cooldown: 3, range: 1, sweepLength: 1, sweepWidth: 3, description: '选择上下左右某一方向为目标，对该方向上长1宽3范围内的所有敌方目标，造成攻击力100%的伤害', effectType: 'earth', attribute: 'earth', category: '横扫', skillTypeTag: '攻击', rangeTag: '1格', targetCountTag: '1x3' },
  yun_he_xiang_wu: { id: 'yun_he_xiang_wu', name: '云鹤翔舞', mpCost: 60, type: 'attack', power: 60, cooldown: 3, range: 4, description: '选择上下左右某一方向为目标，对该方向上4格范围内的所有敌方单位，造成60%攻击力的伤害', effectType: 'wind', attribute: 'wind', category: '直线', skillTypeTag: '攻击', rangeTag: '4格', targetCountTag: '直线' },
  long_zhan_yu_ye: { id: 'long_zhan_yu_ye', name: '龙战于野', mpCost: 70, type: 'attack', power: 110, cooldown: 3, range: 4, description: '选择上下左右某一方向为目标，对该方向上4格范围内的所有敌方单位，造成110%攻击力的伤害，并使目标陷入【燃烧】状态', effectType: 'fire', attribute: 'fire', category: '直线', skillTypeTag: '攻击', rangeTag: '4格', targetCountTag: '直线', statusEffect: 'burning' },
  you_long_bai_wei: { id: 'you_long_bai_wei', name: '游龙摆尾', mpCost: 90, type: 'attack', power: 150, cooldown: 4, range: 2, sweepLength: 2, sweepWidth: 3, description: '选择上下左右某一方向为目标，对该方向上长2宽3范围内的所有敌方目标，造成150%攻击力的伤害，并使目标陷入【燃烧】状态', effectType: 'fire', attribute: 'fire', category: '横扫', skillTypeTag: '攻击', rangeTag: '2格', targetCountTag: '2x3', statusEffect: 'burning' },
  cang_hai_long_yin: { id: 'cang_hai_long_yin', name: '沧海龙吟', mpCost: 70, type: 'attack', power: 50, cooldown: 3, range: 0, areaRange: 3, description: '以自身为中心，对3格菱形范围内的所有敌方目标造成50%的伤害', effectType: 'fire', attribute: 'fire', category: 'aoe', skillTypeTag: '攻击', rangeTag: '3格', targetCountTag: 'AOE', rangeType: 'diamond' },
  kongshan_niaoyu: { id: 'kongshan_niaoyu', name: '空山鸟语', mpCost: 80, type: 'heal', power: 50, cooldown: 4, range: 0, areaRange: 3, description: '以自身为中心，对3格菱形范围内的所有友方目标，恢复50%攻击力的生命值和20%攻击力的法力值', effectType: 'wind', attribute: 'wind', category: 'heal', skillTypeTag: '治疗', rangeTag: '3格', targetCountTag: 'AOE', rangeType: 'diamond' },
  bainiao_zhaofeng: { id: 'bainiao_zhaofeng', name: '百鸟朝凤', mpCost: 80, type: 'attack', power: 60, cooldown: 3, range: 0, areaRange: 3, description: '以自身为中心，对3格菱形范围内的所有敌方目标，造成攻击力60%的伤害，自身获得【愈合】和【调息】状态', effectType: 'wind', attribute: 'wind', category: 'aoe', skillTypeTag: '攻击', rangeTag: '3格', targetCountTag: 'AOE', rangeType: 'diamond', selfStatusEffects: ['heal', 'tune'] },
  lie_di_zhan: { id: 'lie_di_zhan', name: '裂地斩', mpCost: 80, type: 'attack', power: 50, cooldown: 3, range: 0, areaRange: 1, description: '以自身为中心，对1格菱形范围内的所有敌方目标，造成50%攻击力+损失生命百分比*攻击力的伤害', effectType: 'earth', attribute: 'fire', category: 'aoe', skillTypeTag: '攻击', rangeTag: '1格', targetCountTag: 'AOE', rangeType: 'diamond', damageFormula: 'hp_lost_pct' },
  shan_he_zhen: { id: 'shan_he_zhen', name: '山河震', mpCost: 70, type: 'attack', power: 110, cooldown: 3, range: 0, areaRange: 2, description: '以自身为中心，对2格菱形范围内的所有敌方目标，造成攻击力110%的伤害', effectType: 'earth', attribute: 'earth', category: 'aoe', skillTypeTag: '攻击', rangeTag: '2格', targetCountTag: 'AOE', rangeType: 'diamond' },
  wenyi_chuanbo: { id: 'wenyi_chuanbo', name: '瘟疫传播', mpCost: 70, type: 'attack', power: 110, cooldown: 3, range: 0, areaRange: 1, description: '以自身为中心，对1格菱形范围内的所有敌方目标，造成110%攻击力的伤害，并使目标陷入【中毒】状态', effectType: 'water', attribute: 'water', category: 'aoe', skillTypeTag: '攻击', rangeTag: '1格', targetCountTag: 'AOE', rangeType: 'diamond', statusEffect: 'poison' },
  shushu_dadao: { id: 'shushu_dadao', name: '鼠鼠大盗', mpCost: 70, type: 'attack', power: 160, cooldown: 3, range: 2, targetCount: 1, description: '选择2格范围内的1个目标，造成攻击力160%的伤害，驱散目标的随机一个增益状态，并且自身获得该增益状态', effectType: 'water', attribute: 'water', category: '指定', skillTypeTag: '攻击', rangeTag: '2格', targetCountTag: '1个', stealBuff: true },
  kubi_zhou: { id: 'kubi_zhou', name: '枯笔咒', mpCost: 60, type: 'attack', power: 120, cooldown: 3, range: 3, targetCount: 1, description: '选择3格范围内的1个目标，造成攻击力120%的伤害，并且使目标陷入【紊乱】状态', effectType: 'wood', attribute: 'wood', category: '指定', skillTypeTag: '攻击', rangeTag: '3格', targetCountTag: '1个', statusEffect: 'disorder' },
  jiujie_fengling: { id: 'jiujie_fengling', name: '旧籍封灵', mpCost: 60, type: 'attack', power: 60, cooldown: 3, range: 3, targetCount: 3, description: '选择3格范围内的3个目标，造成攻击力60%的伤害，并且使目标陷入【禁锢】状态（持续2回合）', effectType: 'wood', attribute: 'wood', category: '指定', skillTypeTag: '攻击', rangeTag: '3格', targetCountTag: '3个', statusEffect: 'imprison', statusEffectDuration: 2 },
  ming_chui_sao_yu: { id: 'ming_chui_sao_yu', name: '冥锤扫狱', mpCost: 75, type: 'attack', power: 170, cooldown: 3, range: 2, sweepLength: 2, sweepWidth: 3, description: '选择上下左右某一个方向为目标，对该方向上长2宽3范围内的所有敌方单位，造成攻击力170%的伤害，并且使目标陷入【脆弱】状态', effectType: 'metal', attribute: 'metal', category: '横扫', skillTypeTag: '攻击', rangeTag: '2格', targetCountTag: '2x3', statusEffect: 'fragile' },
  yu_men_chong_zhen: { id: 'yu_men_chong_zhen', name: '狱门重震', mpCost: 75, type: 'attack', power: 130, cooldown: 4, range: 2, targetCount: 2, description: '选择2格菱形范围内的2个目标，造成攻击力130%的伤害，并且使目标陷入【虚弱】状态', effectType: 'metal', attribute: 'metal', category: '指定', skillTypeTag: '攻击', rangeTag: '2格', targetCountTag: '2个', statusEffect: 'weak', rangeType: 'diamond' },
  suo_hun: { id: 'suo_hun', name: '锁魂', mpCost: 50, type: 'attack', power: 150, cooldown: 2, range: 3, targetCount: 1, description: '选择3格菱形范围内的一个敌方目标，造成攻击力150%的伤害，并且使目标陷入【禁锢】状态，持续3回合', effectType: 'metal', attribute: 'metal', category: '指定', skillTypeTag: '攻击', rangeTag: '3格', targetCountTag: '1个', statusEffect: 'imprison', statusEffectDuration: 3, rangeType: 'diamond' },
  qiu_ling: { id: 'qiu_ling', name: '囚灵', mpCost: 100, type: 'attack', power: 130, cooldown: 4, range: 3, targetCount: 2, description: '选择3格菱形范围内的2个目标，造成攻击力130%的伤害，并且使目标陷入【禁锢】和【紊乱】状态，持续3回合', effectType: 'metal', attribute: 'metal', category: '指定', skillTypeTag: '攻击', rangeTag: '3格', targetCountTag: '2个', statusEffects: ['imprison', 'disorder'], statusEffectsDurations: [3, 3], rangeType: 'diamond' },
  fu_she_an_ji: { id: 'fu_she_an_ji', name: '辐射暗记', mpCost: 80, type: 'attack', power: 80, cooldown: 4, range: 3, targetCount: 1, description: '选择3格范围内的1个敌方目标，造成80%攻击力的伤害，并使目标陷入【中毒】状态', effectType: 'dark', attribute: 'dark', category: '指定', skillTypeTag: '攻击', rangeTag: '3格', targetCountTag: '1个', statusEffect: 'poison' },
  tian_di_sui: { id: 'tian_di_sui', name: '天地碎裂', mpCost: 75, type: 'attack', power: 150, cooldown: 3, range: 0, areaRange: 2, description: '以自身为中心，对2格菱形范围内的所有敌方目标造成150%的伤害', effectType: 'light', attribute: 'light', category: 'aoe', skillTypeTag: '攻击', rangeTag: '2格', targetCountTag: 'AOE', rangeType: 'diamond' },
  tian_ming_huang_quan: { id: 'tian_ming_huang_quan', name: '天命皇权', mpCost: 100, type: 'summon', power: 0, cooldown: 5, range: 3, targetCount: 4, description: '选择3格菱形范围内的4个空地，召唤出4个【动员兵】，并使自身获得【刚毅】和【愈合】状态，持续3回合', effectType: 'light', attribute: 'light', category: 'summon', skillTypeTag: '召唤', rangeTag: '3格', targetCountTag: '4个', summonCharacter: 'dongyuan_bing', selfStatusEffects: ['resolute', 'heal'], selfStatusEffectsDurations: [3, 3], reikiCost: 30, rangeType: 'diamond' },
  man_zhu_sha_hua: { id: 'man_zhu_sha_hua', name: '曼珠沙华', mpCost: 100, type: 'attack', power: 50, cooldown: 5, range: 0, areaRange: 3, description: '以自身为中心，对3格菱形范围内的所有敌方目标造成50%的伤害，并且陷入【中毒】状态，并恢复自身15%的生命值', effectType: 'dark', attribute: 'dark', category: 'aoe', skillTypeTag: '攻击', rangeTag: '3格', targetCountTag: 'AOE', rangeType: 'diamond', statusEffect: 'poison', selfHealPct: 0.15, shaQiCost: 60 },
  xi: { id: 'xi', name: '囍', mpCost: 100, type: 'attack', power: 66, cooldown: 4, range: 0, areaRange: 3, description: '以自身为中心，对3格菱形范围内的所有敌方目标造成66%攻击力的伤害，并使目标陷入【虚弱】状态，持续时间2回合', effectType: 'dark', attribute: 'yin', category: 'aoe', skillTypeTag: '攻击', rangeTag: '3格', targetCountTag: 'AOE', rangeType: 'diamond', statusEffect: 'weak', statusEffectDuration: 2, shaQiCost: 60 },
  ji_shu_huo_jian: { id: 'ji_shu_huo_jian', name: '集束火箭', mpCost: 100, type: 'attack', power: 140, cooldown: 4, range: 3, description: '选择上下左右中的一个方向，对该方向上3格范围内的所有敌方单位，造成140%攻击力的伤害，并使目标陷入【燃烧】状态', effectType: 'fire', attribute: 'fire', category: '直线', skillTypeTag: '攻击', rangeTag: '3格', targetCountTag: '直线', statusEffect: 'burning' },
  ji_qiang_sao_she: { id: 'ji_qiang_sao_she', name: '机枪扫射', mpCost: 80, type: 'attack', power: 120, cooldown: 3, range: 4, description: '选择上下左右中的一个方向，对该方向上4格范围内的所有敌方单位，造成120%攻击力的伤害', effectType: 'fire', attribute: 'fire', category: '直线', skillTypeTag: '攻击', rangeTag: '4格', targetCountTag: '直线' },
  feng_ren_san: { id: 'feng_ren_san', name: '风刃散', mpCost: 70, type: 'attack', power: 40, cooldown: 3, range: 3, sweepLength: 3, sweepWidth: 3, description: '选择上下左右某一方向为目标，对该方向上长3宽3范围内的所有敌方目标，造成40%攻击力的伤害', effectType: 'wind', attribute: 'wind', category: '横扫', skillTypeTag: '攻击', rangeTag: '3格', targetCountTag: '3x3' },
  shui_huan_xing: { id: 'shui_huan_xing', name: '水缓行', mpCost: 90, type: 'attack', power: 70, cooldown: 3, range: 0, areaRange: 2, description: '以自身为中心，对2格菱形范围内的所有敌方目标造成70%攻击力的伤害，并使目标陷入【瘸腿】状态，持续4回合', effectType: 'water', attribute: 'water', category: 'aoe', skillTypeTag: '攻击', rangeTag: '2格', targetCountTag: 'AOE', rangeType: 'diamond', statusEffect: 'lame', statusEffectDuration: 4 },
  huo_yan_niao: { id: 'huo_yan_niao', name: '火炎鸟', mpCost: 70, type: 'attack', power: 90, cooldown: 3, range: 4, description: '选择上下左右中的一个方向，对该方向上4格范围内的所有敌方单位，造成90%攻击力的伤害', effectType: 'fire', attribute: 'fire', category: '直线', skillTypeTag: '攻击', rangeTag: '4格', targetCountTag: '直线' },
  ning_xin_jue: { id: 'ning_xin_jue', name: '凝心诀', mpCost: 60, type: 'heal', power: 0, cooldown: 3, range: 1, description: '选择自身为目标，恢复自身10%的生命值，并随机驱散两个负面状态', attribute: 'yang', category: 'heal', skillTypeTag: '治疗', rangeTag: '1格', targetCountTag: '1个', selfHealPct: 0.1, dispelRandomDebuffs: 2 },
  // 玄武技能
  zhen_di_gui_ming: { id: 'zhen_di_gui_ming', name: '震地龟鸣', mpCost: 90, type: 'attack', power: 55, cooldown: 3, range: 0, areaRange: 2, description: '以自身为中心，对2格菱形范围内的所有敌方目标造成55%攻击力的伤害，并使目标陷入【沉默】状态，持续时间1回合', effectType: 'water', attribute: 'water', category: 'aoe', skillTypeTag: '攻击', rangeTag: '2格', targetCountTag: 'AOE', rangeType: 'diamond', statusEffect: 'silenced', statusEffectDuration: 1 },
  di_shui_chuan_shi: { id: 'di_shui_chuan_shi', name: '滴水穿石', mpCost: 50, type: 'attack', power: 60, cooldown: 2, range: 4, description: '选择上下左右中的一个方向，对该方向上4格范围内的所有敌方单位，造成60%攻击力的伤害', effectType: 'water', attribute: 'water', category: '直线', skillTypeTag: '攻击', rangeTag: '4格', targetCountTag: '直线' },
  di_mai_xuan_dun: { id: 'di_mai_xuan_dun', name: '地脉玄盾', mpCost: 70, type: 'heal', power: 0, cooldown: 3, range: 0, areaRange: 2, description: '以自身为中心，对2格菱形范围内的所有友方目标（包括自己），恢复生命，恢复量为玄武生命值上限的9%，并且玄武获得【刚毅】状态，持续时间2回合', effectType: 'water', attribute: 'water', category: 'heal', skillTypeTag: '治疗', rangeTag: '2格', targetCountTag: 'AOE', rangeType: 'diamond', selfHealMaxHpPct: 0.09, selfStatusEffects: ['resolute'], statusEffectDuration: 2 },
  wan_gu_jie_jie: { id: 'wan_gu_jie_jie', name: '万古结界', mpCost: 80, type: 'heal', power: 0, cooldown: 5, range: 1, description: '选择自身为目标，恢复自身15%的生命值，驱散所有负面状态，并且获得【不灭】状态，持续时间2回合', effectType: 'water', attribute: 'water', category: 'heal', skillTypeTag: '治疗', rangeTag: '1格', targetCountTag: '1个', reikiCost: 30, selfHealPct: 0.15, dispelAllDebuffs: true, selfStatusEffects: ['undying'], statusEffectDuration: 2 },
  // 红鸾技能
  ling_luo_shi_hun: { id: 'ling_luo_shi_hun', name: '绫罗噬魂', mpCost: 80, type: 'attack', power: 80, cooldown: 3, range: 4, targetCount: 2, description: '选择4格范围内的2个敌方目标，造成80%攻击力的伤害，并使目标陷入【紊乱】状态', attribute: 'yin', category: '指定', skillTypeTag: '攻击', rangeTag: '4格', targetCountTag: '2个', statusEffect: 'disorder' },
  shi_li_hong_xiao: { id: 'shi_li_hong_xiao', name: '十里红绡', mpCost: 80, type: 'attack', power: 60, cooldown: 3, range: 5, description: '选择上下左右中的一个方向，对该方向上5格范围内的所有敌方单位，造成60%攻击力的伤害，并使目标陷入【禁锢】状态', attribute: 'yin', category: '直线', skillTypeTag: '攻击', rangeTag: '5格', targetCountTag: '直线', statusEffect: 'imprison' },
  hong_gai_mi_zong: { id: 'hong_gai_mi_zong', name: '红盖迷踪', mpCost: 40, type: 'heal', power: 0, cooldown: 4, range: 1, description: '选择自身为目标，恢复自身10%生命值和10%法力值，驱散随机1个负面状态', attribute: 'yin', category: 'heal', skillTypeTag: '治疗', rangeTag: '1格', targetCountTag: '1个', selfHealPct: 0.10, selfMpHealPct: 0.10, dispelRandomDebuffs: 1 },
  // 杀生樱技能
  luo_lei: { id: 'luo_lei', name: '落雷', mpCost: 60, type: 'attack', power: 150, cooldown: 1, range: 4, targetCount: 1, description: '选择4格范围内的1个敌方目标，造成150%攻击力的伤害，并且自身陷入【消散】状态', effectType: 'metal', attribute: 'metal', category: '指定', skillTypeTag: '攻击', rangeTag: '4格', targetCountTag: '1个', selfStatusEffects: ['dissipate'] },
  lei_bao: { id: 'lei_bao', name: '雷暴', mpCost: 60, type: 'attack', power: 65, cooldown: 1, range: 3, areaRange: 1, description: '选择3格范围内的1个格子为目标，对以该格子为中心的1格菱形范围内的所有敌方目标造成65%攻击力的伤害，并且自身陷入【消散】状态', effectType: 'metal', attribute: 'metal', category: 'aoe', skillTypeTag: '攻击', rangeTag: '3格', targetCountTag: '轰炸', rangeType: 'diamond', selfStatusEffects: ['dissipate'] },
  da_lei_bao: { id: 'da_lei_bao', name: '大雷暴', mpCost: 80, type: 'attack', power: 120, cooldown: 3, range: 3, areaRange: 1, description: '选择3格范围内的1个格子为目标，对以该格子为中心的1格菱形范围内的所有敌方目标造成120%攻击力的伤害', effectType: 'metal', attribute: 'metal', category: 'aoe', skillTypeTag: '攻击', rangeTag: '3格', targetCountTag: '轰炸', rangeType: 'diamond' },
  // 八重神子技能
  sha_sheng_ying_zhou: { id: 'sha_sheng_ying_zhou', name: '杀生樱咒', mpCost: 40, type: 'support', power: 0, cooldown: 1, range: 4, targetCount: 1, description: '选择4格菱形范围内的1个空格，召唤出一个【杀生樱】，继承施法者阵营，召唤出的杀生樱处于【消散】状态', effectType: 'metal', attribute: 'metal', category: 'summon', skillTypeTag: '召唤', rangeTag: '4格', targetCountTag: '1个', summonCharacter: 'shashengying', summonStatusEffects: ['dissipate'], summonMaxCount: 3, summonCountId: 'shashengying', maxUsesPerBattle: 5 },
  tian_hu_xian_zhen: { id: 'tian_hu_xian_zhen', name: '天狐显真', mpCost: 100, type: 'attack', power: 50, cooldown: 4, range: 0, areaRange: 3, description: '以自身为中心，对3格菱形范围内的所有敌方目标造成50%的伤害，并且陷入【禁锢】状态，持续3回合，自身获得【强力】状态', effectType: 'metal', attribute: 'metal', category: 'aoe', skillTypeTag: '攻击', rangeTag: '3格', targetCountTag: 'AOE', rangeType: 'diamond', statusEffect: 'imprison', statusEffectDuration: 3, selfStatusEffects: ['strong'], shaQiCost: 30 },
  // 千手技能
  qian_ren_fan_zhan: { id: 'qian_ren_fan_zhan', name: '千刃梵斩', mpCost: 100, type: 'attack', power: 110, cooldown: 4, range: 2, sweepLength: 2, sweepWidth: 3, description: '选择上下左右某一方向为目标，对该方向上长2宽3的区域内的所有敌方目标，造成110%攻击力的伤害，并使目标陷入【流血】状态', effectType: 'shadow', attribute: 'dark', category: '横扫', skillTypeTag: '攻击', rangeTag: '2格', targetCountTag: '2x3', statusEffect: 'bleeding' },
  fan_guang_jin_hua: { id: 'fan_guang_jin_hua', name: '梵光烬化', mpCost: 60, type: 'attack', power: 150, cooldown: 3, range: 3, targetCount: 2, description: '选择3格菱形范围内的2个目标，造成攻击力150%的伤害', effectType: 'shadow', attribute: 'dark', category: '指定', skillTypeTag: '攻击', rangeTag: '3格', targetCountTag: '2个', rangeType: 'diamond' },
  fa_xiang_chong_yuan: { id: 'fa_xiang_chong_yuan', name: '法相重圆', mpCost: 100, type: 'heal', power: 0, cooldown: 4, range: 1, description: '选择自身为目标，恢复自身50%的生命值，并且驱散随机2个不良状态（如果有不良状态的话）', effectType: 'shadow', attribute: 'dark', category: 'heal', skillTypeTag: '治疗', rangeTag: '1格', targetCountTag: '1个', selfHealPct: 0.5, dispelRandomDebuffs: 2 },
  jing_ping_fu_ye: { id: 'jing_ping_fu_ye', name: '净瓶腐业', mpCost: 100, type: 'attack', power: 200, cooldown: 4, range: 1, sweepLength: 1, sweepWidth: 3, description: '选择上下左右某一方向为目标，对该方向上长1宽3的区域内的所有敌方目标，造成200%攻击力的伤害，并使目标陷入【流血】和【脆弱】状态', effectType: 'shadow', attribute: 'dark', category: '横扫', skillTypeTag: '攻击', rangeTag: '1格', targetCountTag: '1x3', statusEffects: ['bleeding', 'fragile'], shaQiCost: 40 },
  // 伊邪那美技能
  huang_quan_chui_ji: { id: 'huang_quan_chui_ji', name: '黄泉垂寂', mpCost: 100, type: 'attack', power: 150, cooldown: 4, range: 1, sweepLength: 1, sweepWidth: 3, description: '选择上下左右某一方向为目标，对该方向上长1宽3的区域内的所有敌方目标，造成150%攻击力的伤害，并使目标陷入【腐朽】状态', effectType: 'shadow', attribute: 'yin', category: '横扫', skillTypeTag: '攻击', rangeTag: '1格', targetCountTag: '1x3', statusEffect: 'decay' },
  si_sheng_duan_lv: { id: 'si_sheng_duan_lv', name: '死生断律', mpCost: 100, type: 'attack', power: 130, cooldown: 4, range: 4, description: '选择上下左右某一方向为目标，对该方向上4格范围内的所有敌方单位，造成130%攻击力的伤害，并使目标陷入【沉默】状态', effectType: 'shadow', attribute: 'yin', category: '直线', skillTypeTag: '攻击', rangeTag: '4格', targetCountTag: '直线', statusEffect: 'silenced' },
  ming_qu_gui_zhen: { id: 'ming_qu_gui_zhen', name: '冥躯归真', mpCost: 100, type: 'heal', power: 0, cooldown: 4, range: 1, description: '选择自身为目标，恢复自身30%的生命值和10%的法力值', effectType: 'shadow', attribute: 'yin', category: 'heal', skillTypeTag: '治疗', rangeTag: '1格', targetCountTag: '1个', selfHealPct: 0.30, selfMpHealPct: 0.10 },
  jing_hua_huang_quan: { id: 'jing_hua_huang_quan', name: '镜花黄泉', mpCost: 100, type: 'support', power: 0, cooldown: 5, range: 1, targetCount: 1, description: '选择1格范围内的1个空地，召唤出一个【伊邪那美虚影】，继承施法者阵营，召唤出的虚影处于【消散】状态', effectType: 'shadow', attribute: 'yin', category: 'summon', skillTypeTag: '召唤', rangeTag: '1格', targetCountTag: '1个', summonCharacter: 'yixienamei_virtual', summonStatusEffects: ['dissipate'], summonMpOverride: 100, shaQiCost: 60 },
  // 刻晴技能
  yun_lai_jian_fa: { id: 'yun_lai_jian_fa', name: '云来剑法', mpCost: 80, type: 'attack', power: 130, cooldown: 3, range: 2, sweepLength: 1, sweepWidth: 5, description: '选择上下左右某一方向为目标，对该方向上长1宽5的区域内的所有敌方目标，造成130%攻击力的伤害', effectType: 'metal', attribute: 'metal', category: '横扫', skillTypeTag: '攻击', rangeTag: '2格', targetCountTag: '1x5' },
  jian_ying_ru_guang: { id: 'jian_ying_ru_guang', name: '剑影如光', mpCost: 80, type: 'attack', power: 50, cooldown: 3, range: 0, areaRange: 3, description: '以自身为中心，对3格菱形范围内的所有敌方目标造成50%的伤害', effectType: 'metal', attribute: 'metal', category: 'aoe', skillTypeTag: '攻击', rangeTag: '3格', targetCountTag: 'AOE', rangeType: 'diamond' },
  tian_jie_xun_you: { id: 'tian_jie_xun_you', name: '天街巡游', mpCost: 80, type: 'attack', power: 150, cooldown: 3, range: 4, areaRange: 2, description: '选择4格范围内的一个空格子作为目标，对以该格子为中心的2格范围内所有敌方目标，造成150%攻击力的范围伤害', effectType: 'metal', attribute: 'metal', category: '陷阵', skillTypeTag: '攻击', rangeTag: '4格', targetCountTag: '陷阵', rangeType: 'diamond', reikiCost: 10 },
  // 雪月技能
  sui_bing_liu: { id: 'sui_bing_liu', name: '碎冰流', mpCost: 80, type: 'attack', power: 90, cooldown: 3, range: 4, description: '选择上下左右中的一个方向，对该方向上4格范围内的所有敌方单位，造成90%攻击力的伤害', effectType: 'ice', attribute: 'ice', category: '直线', skillTypeTag: '攻击', elementTag: '冰', rangeTag: '4格', targetCountTag: '直线' },
  lin_dong_jie_jie: { id: 'lin_dong_jie_jie', name: '凛冬结界', mpCost: 80, type: 'attack', power: 90, cooldown: 3, range: 0, areaRange: 2, description: '以自身为中心，对2格菱形范围内的所有敌方目标造成90%的伤害，并且陷入【寒冷】状态，持续2回合', effectType: 'ice', attribute: 'ice', category: 'aoe', skillTypeTag: '攻击', elementTag: '冰', rangeTag: '2格', targetCountTag: 'AOE', rangeType: 'diamond', statusEffect: 'cold', statusEffectDuration: 2 },
  wan_jing_qiu_lao: { id: 'wan_jing_qiu_lao', name: '万晶囚牢', mpCost: 100, type: 'attack', power: 95, cooldown: 4, range: 4, areaRange: 2, description: '选择4格范围内的1个格子为目标，对以该格子为中心的2格菱形范围内的所有敌方目标，造成攻击力95%的伤害，并使目标陷入【寒冷】状态，持续2回合', effectType: 'ice', attribute: 'ice', category: 'aoe', skillTypeTag: '攻击', elementTag: '冰', rangeTag: '4格', targetCountTag: '轰炸', rangeType: 'diamond', statusEffect: 'cold', statusEffectDuration: 2 },
  // 天蛇技能
  shi_gu_she_chao: { id: 'shi_gu_she_chao', name: '蚀骨蛇巢', mpCost: 100, type: 'attack', power: 130, cooldown: 4, range: 4, areaRange: 1, description: '选择4格范围内的一个空格子作为目标，对以该格子为中心的1格范围内所有敌方目标，造成130%攻击力的范围伤害，并使目标陷入【中毒】状态，持续时间3回合', effectType: 'shadow', attribute: 'yin', category: '陷阵', skillTypeTag: '攻击', elementTag: '阴', rangeTag: '4格', targetCountTag: '陷阵', statusEffect: 'poison', statusEffectDuration: 3 },
  she_ying_qiu_long: { id: 'she_ying_qiu_long', name: '蛇影囚笼', mpCost: 100, type: 'attack', power: 90, cooldown: 4, range: 4, areaRange: 2, description: '选择4格范围内的一个空格子作为目标，对以该格子为中心的2格范围内所有敌方目标，造成90%攻击力的范围伤害，施加【禁锢】状态，持续2回合', effectType: 'shadow', attribute: 'yin', category: '陷阵', skillTypeTag: '攻击', elementTag: '阴', rangeTag: '4格', targetCountTag: '陷阵', statusEffect: 'imprison', statusEffectDuration: 2 },
  du_ya_chuan_xi: { id: 'du_ya_chuan_xi', name: '毒牙穿隙', mpCost: 100, type: 'attack', power: 90, cooldown: 3, range: 4, description: '选择上下左右某一方向为目标，对该方向上4格范围内的所有敌方目标，造成90%攻击力的伤害，并使目标陷入【中毒】状态', effectType: 'shadow', attribute: 'yin', category: '直线', skillTypeTag: '攻击', elementTag: '阴', rangeTag: '4格', targetCountTag: '直线', statusEffect: 'poison' },
  wan_she_shi_xin: { id: 'wan_she_shi_xin', name: '万蛇噬心', mpCost: 120, type: 'attack', power: 90, cooldown: 3, range: 0, areaRange: 3, description: '以自身为中心，对3格菱形范围内的所有敌方目标造成90%攻击力的伤害，并使目标陷入【恐惧】状态，持续1回合', effectType: 'shadow', attribute: 'yin', category: 'aoe', skillTypeTag: '攻击', elementTag: '阴', rangeTag: '3格', targetCountTag: 'AOE', rangeType: 'diamond', statusEffect: 'fear', statusEffectDuration: 1, shaQiCost: 60 },
}

export interface CharacterGrowth {
  maxHp: number
  maxMp: number
  attack: number
  defense: number
}

export const CHARACTER_GROWTH: Record<string, CharacterGrowth> = {
  xiongxiong: { maxHp: 50, maxMp: 5, attack: 10, defense: 10 },
  tutu: { maxHp: 40, maxMp: 50, attack: 35, defense: 5 },
  daheixiong: { maxHp: 75, maxMp: 50, attack: 10, defense: 30 },
  bingxin: { maxHp: 110, maxMp: 25, attack: 15, defense: 20 },
  ordinary_zombie: { maxHp: 50, maxMp: 0, attack: 10, defense: 5 },
  fat_zombie: { maxHp: 75, maxMp: 0, attack: 10, defense: 20 },
  swift_zombie: { maxHp: 50, maxMp: 0, attack: 25, defense: 5 },
  long_tongue_zombie: { maxHp: 50, maxMp: 0, attack: 15, defense: 10 },
  baihu: { maxHp: 30, maxMp: 15, attack: 5, defense: 5 },
  meimo: { maxHp: 50, maxMp: 15, attack: 15, defense: 10 },
  songyu: { maxHp: 90, maxMp: 25, attack: 20, defense: 20 },
  eba: { maxHp: 50, maxMp: 0, attack: 10, defense: 10 },
  qianfuzhe: { maxHp: 50, maxMp: 5, attack: 15, defense: 5 },
  yiliaobing: { maxHp: 60, maxMp: 25, attack: 5, defense: 15 },
  jujishou: { maxHp: 55, maxMp: 0, attack: 30, defense: 5 },
  tezhongbing: { maxHp: 60, maxMp: 0, attack: 20, defense: 10 },
  kuangren: { maxHp: 50, maxMp: 10, attack: 15, defense: 5 },
  little_zombie: { maxHp: 25, maxMp: 0, attack: 15, defense: 0 },
  pharaoh_zombie: { maxHp: 65, maxMp: 10, attack: 15, defense: 10 },
  dongyuan_bing: { maxHp: 50, maxMp: 5, attack: 10, defense: 5 },
  jianjiao_zombie: { maxHp: 30, maxMp: 15, attack: 15, defense: 5 },
  paxing_zombie: { maxHp: 60, maxMp: 10, attack: 30, defense: 5 },
  nanxiushi: { maxHp: 55, maxMp: 10, attack: 10, defense: 10 },
  nvxiushi: { maxHp: 55, maxMp: 10, attack: 10, defense: 10 },
  jinxiushi: { maxHp: 65, maxMp: 15, attack: 20, defense: 10 },
  muxiushi: { maxHp: 80, maxMp: 15, attack: 10, defense: 20 },
  shuixiushi: { maxHp: 75, maxMp: 15, attack: 10, defense: 20 },
  tuxiushi: { maxHp: 60, maxMp: 10, attack: 20, defense: 10 },
  huoxiushi: { maxHp: 60, maxMp: 15, attack: 20, defense: 10 },
  geliya: { maxHp: 80, maxMp: 15, attack: 25, defense: 20 },
  tanke: { maxHp: 100, maxMp: 15, attack: 30, defense: 15 },
  nvyao: { maxHp: 80, maxMp: 20, attack: 30, defense: 10 },
  chilian: { maxHp: 60, maxMp: 20, attack: 20, defense: 10 },
  eseng: { maxHp: 90, maxMp: 25, attack: 30, defense: 15 },
  yijian: { maxHp: 85, maxMp: 25, attack: 30, defense: 15 },
  xinghun: { maxHp: 90, maxMp: 25, attack: 30, defense: 15 },
  huyao: { maxHp: 70, maxMp: 10, attack: 25, defense: 10 },
  niutou: { maxHp: 80, maxMp: 20, attack: 25, defense: 20 },
  mamian: { maxHp: 80, maxMp: 25, attack: 20, defense: 20 },
  dasiming: { maxHp: 85, maxMp: 25, attack: 30, defense: 15 },
  kejiqiu: { maxHp: 120, maxMp: 40, attack: 15, defense: 35 },
  shouren: { maxHp: 65, maxMp: 5, attack: 15, defense: 10 },
  xueshou: { maxHp: 65, maxMp: 10, attack: 20, defense: 10 },
  duying: { maxHp: 50, maxMp: 15, attack: 20, defense: 10 },
  fuzhong_zombie: { maxHp: 30, maxMp: 10, attack: 5, defense: 5 },
  baifeng: { maxHp: 65, maxMp: 25, attack: 25, defense: 10 },
  shaosiming: { maxHp: 80, maxMp: 25, attack: 20, defense: 20 },
  xixuegui: { maxHp: 55, maxMp: 10, attack: 20, defense: 10 },
  saman: { maxHp: 35, maxMp: 20, attack: 10, defense: 5 },
  zhuyao: { maxHp: 55, maxMp: 10, attack: 15, defense: 10 },
  yaoqinshi: { maxHp: 60, maxMp: 15, attack: 15, defense: 10 },
  luoxinfu: { maxHp: 75, maxMp: 15, attack: 20, defense: 10 },
  taohuayao: { maxHp: 75, maxMp: 20, attack: 15, defense: 15 },
  tunjiuyao: { maxHp: 70, maxMp: 15, attack: 25, defense: 15 },
  jingyao: { maxHp: 80, maxMp: 20, attack: 15, defense: 20 },
  guhuoniao: { maxHp: 90, maxMp: 20, attack: 25, defense: 15 },
  qingxingdeng: { maxHp: 90, maxMp: 20, attack: 25, defense: 15 },
  qiyao: { maxHp: 70, maxMp: 15, attack: 15, defense: 10 },
  tianxiang: { maxHp: 80, maxMp: 25, attack: 25, defense: 15 },
  penhuobing: { maxHp: 70, maxMp: 15, attack: 15, defense: 10 },
  kuilei: { maxHp: 25, maxMp: 5, attack: 5, defense: 5 },
  kuileinvhuang: { maxHp: 50, maxMp: 25, attack: 20, defense: 10 },
  jixiesangshi: { maxHp: 65, maxMp: 10, attack: 15, defense: 10 },
  muoushi: { maxHp: 80, maxMp: 25, attack: 25, defense: 10 },
  jingziyao: { maxHp: 60, maxMp: 25, attack: 20, defense: 15 },
  tiantu: { maxHp: 90, maxMp: 30, attack: 25, defense: 20 },
  tianniu: { maxHp: 115, maxMp: 20, attack: 30, defense: 25 },
  lingyu: { maxHp: 80, maxMp: 20, attack: 25, defense: 15 },
  youju: { maxHp: 40, maxMp: 20, attack: 15, defense: 5 },
  longming: { maxHp: 95, maxMp: 30, attack: 30, defense: 15 },
  longyou: { maxHp: 90, maxMp: 25, attack: 30, defense: 15 },
  huanghuo: { maxHp: 100, maxMp: 25, attack: 30, defense: 15 },
  yunlu: { maxHp: 90, maxMp: 40, attack: 45, defense: 15 },
  xuanwu: { maxHp: 150, maxMp: 40, attack: 15, defense: 50 },
  nongyu: { maxHp: 80, maxMp: 40, attack: 25, defense: 15 },
  tianshu: { maxHp: 90, maxMp: 25, attack: 30, defense: 10 },
  canjuanhun: { maxHp: 80, maxMp: 20, attack: 25, defense: 10 },
  tiegao: { maxHp: 90, maxMp: 20, attack: 30, defense: 15 },
  zhengjia: { maxHp: 85, maxMp: 25, attack: 25, defense: 15 },
  mengsike: { maxHp: 150, maxMp: 40, attack: 35, defense: 25 },
  longwu: { maxHp: 110, maxMp: 50, attack: 45, defense: 20 },
  hongluan: { maxHp: 130, maxMp: 50, attack: 45, defense: 15 },
  shashengying: { maxHp: 40, maxMp: 30, attack: 35, defense: 5 },
  bachongshenzi: { maxHp: 130, maxMp: 50, attack: 50, defense: 15 },
  qianshou: { maxHp: 140, maxMp: 50, attack: 40, defense: 25 },
  yixienamei: { maxHp: 130, maxMp: 50, attack: 40, defense: 25 },
  yixienamei_virtual: { maxHp: 130, maxMp: 0, attack: 40, defense: 25 },
  keqing: { maxHp: 130, maxMp: 50, attack: 45, defense: 20 },
  xueyue: { maxHp: 130, maxMp: 50, attack: 40, defense: 20 },
  tianshe: { maxHp: 130, maxMp: 50, attack: 40, defense: 20 },
}

// 角色-技能关联表：角色 characterId -> 技能 id 列表
// （作为装配技能的权威来源，角色模板和存档都以它为准）
export const CHARACTER_SKILLS: Record<string, string[]> = {
  xiongxiong: ['po_kong_zhan', 'jue_chu_feng_sheng'],
  tutu: ['qian_li_bing_feng', 'bing_feng_zhi_men', 'bing_jing_fei_she'],
  daheixiong: ['ai_de_bao_bao', 'ai_de_fei_wen', 'ai_de_hui_yi'],
  eba: ['fierce_attack'],
  qianfuzhe: ['shadow_assassination', 'die_xue_ci_ji'],
  yiliaobing: ['pu_tong_hu_li', 'jin_ji_zhi_liao'],
  jujishou: [],
  tezhongbing: ['jin_shen_ge_dou'],
  kuangren: ['throw_grenade'],
  geliya: ['yuan_cheng_dao_dan', 'jing_zhun_da_ji'],
  tanke: ['gong_cheng_zhong_pao'],
  nvyao: ['ji_shu_huo_jian', 'ji_qiang_sao_she'],
  chilian: ['hong_lian_hua_huo', 'she_jian_du_wen'],
  eseng: ['xie_shen_di_yu', 'rao_luan_xin_shen'],
  yijian: ['yi_jian_ting_yu', 'ling_yun_fei_jian'],
  xinghun: ['ju_qi_cheng_ren', 'yin_yang_kui_lei_shu'],
  huyao: ['meng_hu_xia_shan', 'meng_hu_si_hou'],
  ordinary_zombie: ['xiong_meng_si_yao'],
  fat_zombie: ['spit_slime', 'fushi_nianye'],
  swift_zombie: ['er_ye_pao_xiao'],
  long_tongue_zombie: ['xie_e_kun_bang'],
  little_zombie: ['xiong_meng_si_yao'],
  pharaoh_zombie: ['life_drain'],
  dongyuan_bing: ['excited_frenzy'],
  jianjiao_zombie: ['terror_scream'],
  paxing_zombie: [],
  nanxiushi: ['lingqi_bo'],
  nvxiushi: ['lingqisi'],
  jinxiushi: ['ni_tian_can_ren', 'dao_guang_jian_ying'],
  muxiushi: ['hong_hua_lv_ye'],
  shuixiushi: ['tian_han_di_dong'],
  tuxiushi: ['luo_tu_fei_yan'],
  huoxiushi: ['xing_huo_liao_yuan', 'ju_huo_fen_tian'],
  niutou: ['da_di_zhong_ji', 'man_jia_chong_ji', 'sui_lie_zhong_ji'],
  shouren: ['fierce_attack'],
  xueshou: ['mo_lian_gui_shou'],
  duying: ['qian_zhu_sui_ying', 'ju_du_shi_gu'],
  fuzhong_zombie: ['zi_bao_du_ye'],
  shaosiming: ['zhai_ye_fei_hua', 'wan_ye_fei_hua', 'yin_yang_yu_shou_yin'],
  xixuegui: ['xi_xue'],
  saman: ['ling_hun_zu_zhou', 'ling_hun_rao_luan'],
  baihu: ['mei_huo'],
  meimo: ['mei_huo'],
  songyu: ['zhao_huan_ling_chong', 'gao_shan_liu_shui'],
  mamian: ['lian_yu_huo_hai', 'wang_zhe_zhi_qi'],
  dasiming: ['ku_lou_xue_shou_yin', 'liu_hun_kong_zhou'],
  kejiqiu: ['zhi_yu_zhi_guang', 'emp_chong_ji_bo', 'fu_she_da_ji'],
  baifeng: ['feng_wu_liu_huan'],
  zhuyao: ['fierce_attack'],
  yaoqinshi: ['yu_yin_rao_liang', 'feng_mo_qin_xin'],
  luoxinfu: ['shi_xin_shi_sui', 'tian_luo_di_wang'],
  taohuayao: ['tao_zhi_yao_yao', 'tao_hua_zhuo_zhuo'],
  tunjiuyao: ['tun_jiu_kuang_xiao', 'nu_za_hu_lu'],
  jingyao: ['bi_hai_chao_sheng', 'shui_man_jin_shan'],
  guhuoniao: ['mo_yu_he_ling', 'mo_ying_jian_guang'],
  qingxingdeng: ['fu_guang_lue_ying', 'gao_bie_ming_deng'],
  qiyao: ['shen_zhi_yi_shou', 'yin_yang_qi_he'],
  tianxiang: ['cang_jian_yi_ye', 'mu_feng_wei_shang'],
  penhuobing: ['huo_yan_pen_she'],
  kuilei: [],
  kuileinvhuang: ['zhao_huan_wawa'],
  jixiesangshi: ['xi_rang_zai_sheng'],
  muoushi: ['zhao_huan_nvhuang', 'an_ye_jin_sheng'],
  jingziyao: ['po_jing_chong_yuan'],
  tiantu: ['yue_zhi_yin_li', 'tian_tu_zhan_fang'],
  tianniu: ['fei_xue_meng_ji', 'wu_di_niu_niu'],
  lingyu: ['jian_yu', 'sui_xing'],
  bingxin: ['miao_shou', 'cuo_gu'],
  youju: ['you_ju_xi_tian'],
  longming: ['zhao_huan_you_ju', 'ba_wang_qiang'],
  longyou: ['ji_gu_tu', 'duan_yan_sui_feng_bo'],
  huanghuo: ['lie_di_zhan', 'shan_he_zhen'],
  yunlu: ['feng_ren_san', 'shui_huan_xing', 'huo_yan_niao', 'ning_xin_jue'],
  xuanwu: ['zhen_di_gui_ming', 'di_shui_chuan_shi', 'di_mai_xuan_dun', 'wan_gu_jie_jie'],
  nongyu: ['kongshan_niaoyu', 'bainiao_zhaofeng'],
  tianshu: ['wenyi_chuanbo', 'shushu_dadao'],
  canjuanhun: ['kubi_zhou', 'jiujie_fengling'],
  tiegao: ['ming_chui_sao_yu', 'yu_men_chong_zhen'],
  zhengjia: ['suo_hun', 'qiu_ling'],
  mengsike: ['fu_she_an_ji', 'tian_di_sui', 'tian_ming_huang_quan'],
  longwu: ['long_zhan_yu_ye', 'you_long_bai_wei', 'cang_hai_long_yin', 'man_zhu_sha_hua'],
  hongluan: ['ling_luo_shi_hun', 'shi_li_hong_xiao', 'hong_gai_mi_zong', 'xi'],
  shashengying: ['luo_lei', 'lei_bao'],
  bachongshenzi: ['sha_sheng_ying_zhou', 'da_lei_bao', 'tian_hu_xian_zhen'],
  qianshou: ['qian_ren_fan_zhan', 'fan_guang_jin_hua', 'fa_xiang_chong_yuan', 'jing_ping_fu_ye'],
  yixienamei: ['huang_quan_chui_ji', 'si_sheng_duan_lv', 'ming_qu_gui_zhen', 'jing_hua_huang_quan'],
  yixienamei_virtual: ['huang_quan_chui_ji', 'si_sheng_duan_lv', 'ming_qu_gui_zhen'],
  keqing: ['yun_lai_jian_fa', 'jian_ying_ru_guang', 'tian_jie_xun_you'],
  xueyue: ['sui_bing_liu', 'lin_dong_jie_jie', 'wan_jing_qiu_lao'],
  tianshe: ['shi_gu_she_chao', 'she_ying_qiu_long', 'du_ya_chuan_xi', 'wan_she_shi_xin'],
}

/**
 * 根据角色 characterId 装配完整的技能数组（带 currentCooldown = 0）
 * 优先从 CHARACTER_SKILLS 查表获取（避免不同位置数据不一致）。
 * 若表中没有该角色，返回空数组（兼容玩家创建的临时/特殊角色）。
 */
export function buildSkillsForCharacterId(characterId: string): Skill[] {
  const skillIds = CHARACTER_SKILLS[characterId]
  if (!skillIds || skillIds.length === 0) return []
  return skillIds
    .map(id => SKILL_TEMPLATES[id])
    .filter(Boolean)
    .map(template => ({ ...template, currentCooldown: 0 } as Skill))
}

/**
 * 构建角色的完整技能列表（包括装备附带的技能）
 * @param characterId 角色id
 * @param equipment 角色的装备
 * @returns 完整的技能数组
 */
export function buildFullSkillsForCharacter(characterId: string, equipment: Equipment | null | undefined): Skill[] {
  const baseSkills = buildSkillsForCharacterId(characterId)
  if (!equipment) return baseSkills

  const equipEffects = processEquipmentEffects(equipment)
  return [...baseSkills, ...equipEffects.grantedSkills]
}

/**
 * 从角色基础配置表中查找角色模板（INITIAL_CHARACTERS / HIREABLE_CHARACTERS）
 * 不查询玩家的运行态角色，仅用于从 characterId 解析基础属性
 */
export function getCharacterBaseTemplate(characterId: string): Omit<Character, 'equipment' | 'avatar' | 'isPlayerOwned' | 'hp' | 'mp'> | undefined {
  const initial = INITIAL_CHARACTERS.find((c: any) => c.id === characterId)
  if (initial) return initial
  const hireable = HIREABLE_CHARACTERS.find((c: any) => c.id === characterId)
  return hireable
}

export function getExpRequired(level: number): number {
  if (level < 1) return 0
  return 80 + (level - 1) * 40
}

export const INITIAL_CHARACTERS: Omit<Character, 'equipment' | 'avatar' | 'isPlayerOwned' | 'hp' | 'mp'>[] = [
  {
    id: 'xiongxiong',
    name: '熊熊',
    job: 'destiny',
    faction: 'human',
    level: 1,
    exp: 0,
    baseMaxHp: 200,
    maxHp: 200,
    baseMaxMp: 100,
    maxMp: 100,
    baseAttack: 50,
    attack: 50,
    baseDefense: 10,
    defense: 10,
    baseMoveRange: 3,
    moveRange: 3,
    baseAttackRange: 1,
    attackRange: 1,
    skills: buildSkillsForCharacterId('xiongxiong'),
    attribute: 'normal',
  },
  {
    id: 'tutu',
    name: '兔兔',
    job: 'destiny',
    faction: 'human',
    level: 1,
    exp: 0,
    baseMaxHp: 220,
    maxHp: 220,
    baseMaxMp: 250,
    maxMp: 250,
    baseAttack: 70,
    attack: 70,
    baseDefense: 5,
    defense: 5,
    baseMoveRange: 3,
    moveRange: 3,
    baseAttackRange: 3,
    attackRange: 3,
    skills: buildSkillsForCharacterId('tutu'),
    attribute: 'ice',
  },
  {
    id: 'daheixiong',
    name: '大黑熊',
    job: 'destiny',
    faction: 'human',
    level: 1,
    exp: 0,
    baseMaxHp: 250,
    maxHp: 250,
    baseMaxMp: 250,
    maxMp: 250,
    baseAttack: 50,
    attack: 50,
    baseDefense: 20,
    defense: 20,
    baseMoveRange: 3,
    moveRange: 3,
    baseAttackRange: 3,
    attackRange: 3,
    skills: buildSkillsForCharacterId('daheixiong'),
    attribute: 'water',
  },
  ]

export const HIREABLE_CHARACTERS: Omit<Character, 'equipment' | 'avatar' | 'isPlayerOwned' | 'hp' | 'mp'>[] = [
  {
    id: 'eba',
    name: '恶霸',
    job: '士兵',
    faction: 'human',
    level: 1,
    exp: 0,
    baseMaxHp: 225,
    maxHp: 225,
    baseMaxMp: 50,
    maxMp: 50,
    baseAttack: 55,
    attack: 55,
    baseDefense: 10,
    defense: 10,
    baseMoveRange: 3,
    moveRange: 3,
    baseAttackRange: 1,
    attackRange: 1,
    skills: buildSkillsForCharacterId('eba'),
    attribute: 'normal',
  },
  {
    id: 'qianfuzhe',
    name: '潜伏者',
    job: '士兵',
    faction: 'human',
    level: 1,
    exp: 0,
    baseMaxHp: 200,
    maxHp: 200,
    baseMaxMp: 100,
    maxMp: 100,
    baseAttack: 65,
    attack: 65,
    baseDefense: 10,
    defense: 10,
    baseMoveRange: 4,
    moveRange: 4,
    baseAttackRange: 1,
    attackRange: 1,
    skills: buildSkillsForCharacterId('qianfuzhe'),
    attribute: 'normal',
  },
  {
    id: 'yiliaobing',
    name: '医疗兵',
    job: '士兵',
    faction: 'human',
    level: 1,
    exp: 0,
    baseMaxHp: 240,
    maxHp: 240,
    baseMaxMp: 125,
    maxMp: 125,
    baseAttack: 40,
    attack: 40,
    baseDefense: 15,
    defense: 15,
    baseMoveRange: 2,
    moveRange: 2,
    baseAttackRange: 2,
    attackRange: 2,
    skills: buildSkillsForCharacterId('yiliaobing'),
    attribute: 'normal',
  },
  {
    id: 'kejiqiu',
    name: '科技球',
    job: '高科技',
    faction: 'human',
    level: 1,
    exp: 0,
    baseMaxHp: 480,
    maxHp: 480,
    baseMaxMp: 280,
    maxMp: 280,
    baseAttack: 60,
    attack: 60,
    baseDefense: 35,
    defense: 35,
    baseMoveRange: 4,
    moveRange: 4,
    baseAttackRange: 3,
    attackRange: 3,
    skills: buildSkillsForCharacterId('kejiqiu'),
    attribute: 'wind',
  },
  {
    id: 'baifeng',
    name: '白凤',
    job: '流沙',
    faction: 'human',
    level: 1,
    exp: 0,
    baseMaxHp: 260,
    maxHp: 260,
    baseMaxMp: 200,
    maxMp: 200,
    baseAttack: 75,
    attack: 75,
    baseDefense: 15,
    defense: 15,
    baseMoveRange: 4,
    moveRange: 4,
    baseAttackRange: 3,
    attackRange: 3,
    skills: buildSkillsForCharacterId('baifeng'),
    attribute: 'wind',
  },
  {
    id: 'zhuyao',
    name: '猪妖',
    job: '精怪',
    faction: 'beast',
    level: 1,
    exp: 0,
    baseMaxHp: 225,
    maxHp: 225,
    baseMaxMp: 100,
    maxMp: 100,
    baseAttack: 60,
    attack: 60,
    baseDefense: 10,
    defense: 10,
    baseMoveRange: 3,
    moveRange: 3,
    baseAttackRange: 1,
    attackRange: 1,
    skills: buildSkillsForCharacterId('zhuyao'),
    attribute: 'normal',
  },
  {
    id: 'yaoqinshi',
    name: '妖琴师',
    job: '妖怪',
    faction: 'beast',
    level: 1,
    exp: 0,
    baseMaxHp: 240,
    maxHp: 240,
    baseMaxMp: 150,
    maxMp: 150,
    baseAttack: 60,
    attack: 60,
    baseDefense: 10,
    defense: 10,
    baseMoveRange: 3,
    moveRange: 3,
    baseAttackRange: 3,
    attackRange: 3,
    skills: buildSkillsForCharacterId('yaoqinshi'),
    attribute: 'wind',
  },
  {
    id: 'luoxinfu',
    name: '络新妇',
    job: '妖怪',
    faction: 'beast',
    level: 1,
    exp: 0,
    baseMaxHp: 260,
    maxHp: 260,
    baseMaxMp: 150,
    maxMp: 150,
    baseAttack: 75,
    attack: 75,
    baseDefense: 15,
    defense: 15,
    baseMoveRange: 3,
    moveRange: 3,
    baseAttackRange: 3,
    attackRange: 3,
    skills: buildSkillsForCharacterId('luoxinfu'),
    attribute: 'earth',
  },
  {
    id: 'taohuayao',
    name: '桃花妖',
    job: '妖怪',
    faction: 'beast',
    level: 1,
    exp: 0,
    baseMaxHp: 280,
    maxHp: 280,
    baseMaxMp: 150,
    maxMp: 150,
    baseAttack: 65,
    attack: 65,
    baseDefense: 20,
    defense: 20,
    baseMoveRange: 3,
    moveRange: 3,
    baseAttackRange: 3,
    attackRange: 3,
    skills: buildSkillsForCharacterId('taohuayao'),
    attribute: 'wood',
  },
  {
    id: 'tunjiuyao',
    name: '吞酒妖',
    job: '妖怪',
    faction: 'beast',
    level: 1,
    exp: 0,
    baseMaxHp: 280,
    maxHp: 280,
    baseMaxMp: 140,
    maxMp: 140,
    baseAttack: 75,
    attack: 75,
    baseDefense: 20,
    defense: 20,
    baseMoveRange: 2,
    moveRange: 2,
    baseAttackRange: 3,
    attackRange: 3,
    skills: buildSkillsForCharacterId('tunjiuyao'),
    attribute: 'fire',
  },
  {
    id: 'jingyao',
    name: '鲸妖',
    job: '妖怪',
    faction: 'beast',
    level: 1,
    exp: 0,
    baseMaxHp: 300,
    maxHp: 300,
    baseMaxMp: 150,
    maxMp: 150,
    baseAttack: 60,
    attack: 60,
    baseDefense: 25,
    defense: 25,
    baseMoveRange: 3,
    moveRange: 3,
    baseAttackRange: 3,
    attackRange: 3,
    skills: buildSkillsForCharacterId('jingyao'),
    attribute: 'water',
  },
  {
    id: 'guhuoniao',
    name: '姑获鸟',
    job: '大妖',
    faction: 'beast',
    level: 1,
    exp: 0,
    baseMaxHp: 360,
    maxHp: 360,
    baseMaxMp: 180,
    maxMp: 180,
    baseAttack: 95,
    attack: 95,
    baseDefense: 20,
    defense: 20,
    baseMoveRange: 4,
    moveRange: 4,
    baseAttackRange: 4,
    attackRange: 4,
    skills: buildSkillsForCharacterId('guhuoniao'),
    attribute: 'wind',
  },
  {
    id: 'qingxingdeng',
    name: '青行灯',
    job: '大妖',
    faction: 'beast',
    level: 1,
    exp: 0,
    baseMaxHp: 360,
    maxHp: 360,
    baseMaxMp: 200,
    maxMp: 200,
    baseAttack: 90,
    attack: 90,
    baseDefense: 25,
    defense: 25,
    baseMoveRange: 4,
    moveRange: 4,
    baseAttackRange: 4,
    attackRange: 4,
    skills: buildSkillsForCharacterId('qingxingdeng'),
    attribute: 'fire',
  },
  {
    id: 'qiyao',
    name: '棋妖',
    job: '妖怪',
    faction: 'beast',
    level: 1,
    exp: 0,
    baseMaxHp: 260,
    maxHp: 260,
    baseMaxMp: 150,
    maxMp: 150,
    baseAttack: 65,
    attack: 65,
    baseDefense: 15,
    defense: 15,
    baseMoveRange: 3,
    moveRange: 3,
    baseAttackRange: 3,
    attackRange: 3,
    skills: buildSkillsForCharacterId('qiyao'),
    attribute: 'metal',
  },
  {
    id: 'jujishou',
    name: '狙击手',
    job: '士兵',
    faction: 'human',
    level: 1,
    exp: 0,
    baseMaxHp: 220,
    maxHp: 220,
    baseMaxMp: 100,
    maxMp: 100,
    baseAttack: 80,
    attack: 80,
    baseDefense: 5,
    defense: 5,
    baseMoveRange: 2,
    moveRange: 2,
    baseAttackRange: 5,
    attackRange: 5,
    skills: buildSkillsForCharacterId('jujishou'),
    attribute: 'normal',
  },
  {
    id: 'tezhongbing',
    name: '特种兵',
    job: '士兵',
    faction: 'human',
    level: 1,
    exp: 0,
    baseMaxHp: 250,
    maxHp: 250,
    baseMaxMp: 100,
    maxMp: 100,
    baseAttack: 70,
    attack: 70,
    baseDefense: 10,
    defense: 10,
    baseMoveRange: 3,
    moveRange: 3,
    baseAttackRange: 4,
    attackRange: 4,
    skills: buildSkillsForCharacterId('tezhongbing'),
    attribute: 'normal',
  },
  {
    id: 'penhuobing',
    name: '喷火兵',
    job: '士兵',
    faction: 'human',
    level: 1,
    exp: 0,
    baseMaxHp: 260,
    maxHp: 260,
    baseMaxMp: 120,
    maxMp: 120,
    baseAttack: 65,
    attack: 65,
    baseDefense: 15,
    defense: 15,
    baseMoveRange: 3,
    moveRange: 3,
    baseAttackRange: 1,
    attackRange: 1,
    skills: buildSkillsForCharacterId('penhuobing'),
    attribute: 'fire',
  },
  {
    id: 'kuangren',
    name: '狂人',
    job: '士兵',
    faction: 'human',
    level: 1,
    exp: 0,
    baseMaxHp: 200,
    maxHp: 200,
    baseMaxMp: 100,
    maxMp: 100,
    baseAttack: 55,
    attack: 55,
    baseDefense: 10,
    defense: 10,
    baseMoveRange: 3,
    moveRange: 3,
    baseAttackRange: 1,
    attackRange: 1,
    skills: buildSkillsForCharacterId('kuangren'),
    attribute: 'fire',
  },
  {
    id: 'geliya',
    name: '歌莉娅',
    job: '机甲',
    faction: 'human',
    level: 1,
    exp: 0,
    baseMaxHp: 350,
    maxHp: 350,
    baseMaxMp: 150,
    maxMp: 150,
    baseAttack: 90,
    attack: 90,
    baseDefense: 20,
    defense: 20,
    baseMoveRange: 3,
    moveRange: 3,
    baseAttackRange: 3,
    attackRange: 3,
    skills: buildSkillsForCharacterId('geliya'),
    attribute: 'metal',
  },
  {
    id: 'tanke',
    name: '坦克',
    job: '机甲',
    faction: 'human',
    level: 1,
    exp: 0,
    baseMaxHp: 400,
    maxHp: 400,
    baseMaxMp: 150,
    maxMp: 150,
    baseAttack: 95,
    attack: 95,
    baseDefense: 25,
    defense: 25,
    baseMoveRange: 2,
    moveRange: 2,
    baseAttackRange: 4,
    attackRange: 4,
    skills: buildSkillsForCharacterId('tanke'),
    attribute: 'fire',
  },
  {
    id: 'shouren',
    name: '兽人',
    job: '魔兽',
    faction: 'demon',
    level: 1,
    exp: 0,
    baseMaxHp: 230,
    maxHp: 230,
    baseMaxMp: 80,
    maxMp: 80,
    baseAttack: 60,
    attack: 60,
    baseDefense: 15,
    defense: 15,
    baseMoveRange: 3,
    moveRange: 3,
    baseAttackRange: 1,
    attackRange: 1,
    skills: buildSkillsForCharacterId('shouren'),
    attribute: 'normal',
  },
  {
    id: 'xueshou',
    name: '血手',
    job: '魔族',
    faction: 'demon',
    level: 1,
    exp: 0,
    baseMaxHp: 230,
    maxHp: 230,
    baseMaxMp: 100,
    maxMp: 100,
    baseAttack: 70,
    attack: 70,
    baseDefense: 15,
    defense: 15,
    baseMoveRange: 3,
    moveRange: 3,
    baseAttackRange: 2,
    attackRange: 2,
    skills: buildSkillsForCharacterId('xueshou'),
    attribute: 'earth',
  },
  {
    id: 'duying',
    name: '毒影',
    job: '魔族',
    faction: 'demon',
    level: 1,
    exp: 0,
    baseMaxHp: 200,
    maxHp: 200,
    baseMaxMp: 120,
    maxMp: 120,
    baseAttack: 60,
    attack: 60,
    baseDefense: 10,
    defense: 10,
    baseMoveRange: 3,
    moveRange: 3,
    baseAttackRange: 3,
    attackRange: 3,
    skills: buildSkillsForCharacterId('duying'),
    attribute: 'wood',
  },
  {
    id: 'fuzhong_zombie',
    name: '浮肿丧尸',
    job: '变异丧尸',
    faction: 'ghost',
    level: 1,
    exp: 0,
    baseMaxHp: 120,
    maxHp: 120,
    baseMaxMp: 100,
    maxMp: 100,
    baseAttack: 40,
    attack: 40,
    baseDefense: 5,
    defense: 5,
    baseMoveRange: 2,
    moveRange: 2,
    baseAttackRange: 1,
    attackRange: 1,
    skills: buildSkillsForCharacterId('fuzhong_zombie'),
    attribute: 'wood',
  },
  {
    id: 'ordinary_zombie',
    name: '普通丧尸',
    job: '普通丧尸',
    faction: 'ghost',
    level: 1,
    exp: 0,
    baseMaxHp: 200,
    maxHp: 200,
    baseMaxMp: 50,
    maxMp: 50,
    baseAttack: 50,
    attack: 50,
    baseDefense: 10,
    defense: 10,
    baseMoveRange: 2,
    moveRange: 2,
    baseAttackRange: 1,
    attackRange: 1,
    skills: buildSkillsForCharacterId('ordinary_zombie'),
    attribute: 'normal',
  },
  {
    id: 'fat_zombie',
    name: '肥胖丧尸',
    job: '变异丧尸',
    faction: 'ghost',
    level: 1,
    exp: 0,
    baseMaxHp: 280,
    maxHp: 280,
    baseMaxMp: 100,
    maxMp: 100,
    baseAttack: 40,
    attack: 40,
    baseDefense: 20,
    defense: 20,
    baseMoveRange: 3,
    moveRange: 3,
    baseAttackRange: 2,
    attackRange: 2,
    skills: buildSkillsForCharacterId('fat_zombie'),
    attribute: 'earth',
  },
  {
    id: 'swift_zombie',
    name: '迅猛丧尸',
    job: '变异丧尸',
    faction: 'ghost',
    level: 1,
    exp: 0,
    baseMaxHp: 250,
    maxHp: 250,
    baseMaxMp: 50,
    maxMp: 50,
    baseAttack: 70,
    attack: 70,
    baseDefense: 10,
    defense: 10,
    baseMoveRange: 4,
    moveRange: 4,
    baseAttackRange: 1,
    attackRange: 1,
    skills: buildSkillsForCharacterId('swift_zombie'),
    attribute: 'normal',
  },
  {
    id: 'paxing_zombie',
    name: '爬行丧尸',
    job: '变异丧尸',
    faction: 'ghost',
    level: 1,
    exp: 0,
    baseMaxHp: 250,
    maxHp: 250,
    baseMaxMp: 100,
    maxMp: 100,
    baseAttack: 100,
    attack: 100,
    baseDefense: 10,
    defense: 10,
    baseMoveRange: 1,
    moveRange: 1,
    baseAttackRange: 1,
    attackRange: 1,
    skills: buildSkillsForCharacterId('paxing_zombie'),
    attribute: 'normal',
  },
  {
    id: 'long_tongue_zombie',
    name: '长舌丧尸',
    job: '变异丧尸',
    faction: 'ghost',
    level: 1,
    exp: 0,
    baseMaxHp: 250,
    maxHp: 250,
    baseMaxMp: 50,
    maxMp: 50,
    baseAttack: 60,
    attack: 60,
    baseDefense: 10,
    defense: 10,
    baseMoveRange: 3,
    moveRange: 3,
    baseAttackRange: 3,
    attackRange: 3,
    skills: buildSkillsForCharacterId('long_tongue_zombie'),
    attribute: 'wood',
  },
  {
    id: 'little_zombie',
    name: '小鬼丧尸',
    job: '普通丧尸',
    faction: 'ghost',
    level: 1,
    exp: 0,
    baseMaxHp: 100,
    maxHp: 100,
    baseMaxMp: 50,
    maxMp: 50,
    baseAttack: 60,
    attack: 60,
    baseDefense: 0,
    defense: 0,
    baseMoveRange: 4,
    moveRange: 4,
    baseAttackRange: 1,
    attackRange: 1,
    skills: buildSkillsForCharacterId('little_zombie'),
    attribute: 'normal',
  },
  {
    id: 'pharaoh_zombie',
    name: '法老丧尸',
    job: '变异丧尸',
    faction: 'ghost',
    level: 1,
    exp: 0,
    baseMaxHp: 250,
    maxHp: 250,
    baseMaxMp: 100,
    maxMp: 100,
    baseAttack: 50,
    attack: 50,
    baseDefense: 15,
    defense: 15,
    baseMoveRange: 2,
    moveRange: 2,
    baseAttackRange: 4,
    attackRange: 4,
    skills: buildSkillsForCharacterId('pharaoh_zombie'),
    attribute: 'metal',
  },
  {
    id: 'eseng',
    name: '恶僧',
    job: '厉鬼',
    faction: 'ghost',
    level: 1,
    exp: 0,
    baseMaxHp: 360,
    maxHp: 360,
    baseMaxMp: 180,
    maxMp: 180,
    baseAttack: 90,
    attack: 90,
    baseDefense: 25,
    defense: 25,
    baseMoveRange: 3,
    moveRange: 3,
    baseAttackRange: 2,
    attackRange: 2,
    skills: buildSkillsForCharacterId('eseng'),
    attribute: 'earth',
  },
  {
    id: 'dongyuan_bing',
    name: '动员兵',
    job: '士兵',
    faction: 'human',
    level: 1,
    exp: 0,
    baseMaxHp: 200,
    maxHp: 200,
    baseMaxMp: 100,
    maxMp: 100,
    baseAttack: 50,
    attack: 50,
    baseDefense: 5,
    defense: 5,
    baseMoveRange: 3,
    moveRange: 3,
    baseAttackRange: 3,
    attackRange: 3,
    skills: buildSkillsForCharacterId('dongyuan_bing'),
    attribute: 'normal',
  },
  {
    id: 'nvyao',
    name: '女妖',
    job: '机甲',
    faction: 'human',
    level: 1,
    exp: 0,
    baseMaxHp: 320,
    maxHp: 320,
    baseMaxMp: 180,
    maxMp: 180,
    baseAttack: 90,
    attack: 90,
    baseDefense: 20,
    defense: 20,
    baseMoveRange: 4,
    moveRange: 4,
    baseAttackRange: 4,
    attackRange: 4,
    skills: buildSkillsForCharacterId('nvyao'),
    attribute: 'fire',
  },
  {
    id: 'jianjiao_zombie',
    name: '尖叫丧尸',
    job: '变异丧尸',
    faction: 'ghost',
    level: 1,
    exp: 0,
    baseMaxHp: 150,
    maxHp: 150,
    baseMaxMp: 100,
    maxMp: 100,
    baseAttack: 40,
    attack: 40,
    baseDefense: 5,
    defense: 5,
    baseMoveRange: 2,
    moveRange: 2,
    baseAttackRange: 3,
    attackRange: 3,
    skills: buildSkillsForCharacterId('jianjiao_zombie'),
    attribute: 'dark',
  },
  {
    id: 'niutou',
    name: '牛头',
    job: '厉鬼',
    faction: 'ghost',
    level: 1,
    exp: 0,
    baseMaxHp: 360,
    maxHp: 360,
    baseMaxMp: 150,
    maxMp: 150,
    baseAttack: 95,
    attack: 95,
    baseDefense: 25,
    defense: 25,
    baseMoveRange: 3,
    moveRange: 3,
    baseAttackRange: 1,
    attackRange: 1,
    skills: buildSkillsForCharacterId('niutou'),
    attribute: 'earth',
  },
  {
    id: 'mamian',
    name: '马面',
    job: '厉鬼',
    faction: 'ghost',
    level: 1,
    exp: 0,
    baseMaxHp: 320,
    maxHp: 320,
    baseMaxMp: 180,
    maxMp: 180,
    baseAttack: 85,
    attack: 85,
    baseDefense: 20,
    defense: 20,
    baseMoveRange: 3,
    moveRange: 3,
    baseAttackRange: 3,
    attackRange: 3,
    skills: buildSkillsForCharacterId('mamian'),
    attribute: 'fire',
  },
  {
    id: 'dasiming',
    name: '大司命',
    job: '魔将',
    faction: 'demon',
    level: 1,
    exp: 0,
    baseMaxHp: 340,
    maxHp: 340,
    baseMaxMp: 180,
    maxMp: 180,
    baseAttack: 90,
    attack: 90,
    baseDefense: 15,
    defense: 15,
    baseMoveRange: 3,
    moveRange: 3,
    baseAttackRange: 3,
    attackRange: 3,
    skills: buildSkillsForCharacterId('dasiming'),
    attribute: 'fire',
  },
  {
    id: 'youju',
    name: '幽驹',
    job: '魔兽',
    faction: 'demon',
    level: 1,
    exp: 0,
    baseMaxHp: 180,
    maxHp: 180,
    baseMaxMp: 100,
    maxMp: 100,
    baseAttack: 65,
    attack: 65,
    baseDefense: 10,
    defense: 10,
    baseMoveRange: 4,
    moveRange: 4,
    baseAttackRange: 1,
    attackRange: 1,
    skills: buildSkillsForCharacterId('youju'),
    attribute: 'dark',
  },
  {
    id: 'longming',
    name: '龙溟',
    job: '魔将',
    faction: 'demon',
    level: 1,
    exp: 0,
    baseMaxHp: 380,
    maxHp: 380,
    baseMaxMp: 190,
    maxMp: 190,
    baseAttack: 95,
    attack: 95,
    baseDefense: 25,
    defense: 25,
    baseMoveRange: 3,
    moveRange: 3,
    baseAttackRange: 2,
    attackRange: 2,
    skills: buildSkillsForCharacterId('longming'),
    attribute: 'dark',
  },
  {
    id: 'longyou',
    name: '龙幽',
    job: '魔将',
    faction: 'demon',
    level: 1,
    exp: 0,
    baseMaxHp: 360,
    maxHp: 360,
    baseMaxMp: 150,
    maxMp: 150,
    baseAttack: 90,
    attack: 90,
    baseDefense: 25,
    defense: 25,
    baseMoveRange: 3,
    moveRange: 3,
    baseAttackRange: 2,
    attackRange: 2,
    skills: buildSkillsForCharacterId('longyou'),
    attribute: 'dark',
  },
  {
    id: 'nanxiushi',
    name: '男修士',
    job: '炼气修士',
    faction: 'immortal',
    level: 1,
    exp: 0,
    baseMaxHp: 225,
    maxHp: 225,
    baseMaxMp: 110,
    maxMp: 110,
    baseAttack: 55,
    attack: 55,
    baseDefense: 10,
    defense: 10,
    baseMoveRange: 3,
    moveRange: 3,
    baseAttackRange: 3,
    attackRange: 3,
    skills: buildSkillsForCharacterId('nanxiushi'),
    attribute: 'normal',
  },
  {
    id: 'nvxiushi',
    name: '女修士',
    job: '炼气修士',
    faction: 'immortal',
    level: 1,
    exp: 0,
    baseMaxHp: 210,
    maxHp: 210,
    baseMaxMp: 110,
    maxMp: 110,
    baseAttack: 55,
    attack: 55,
    baseDefense: 5,
    defense: 5,
    baseMoveRange: 4,
    moveRange: 4,
    baseAttackRange: 3,
    attackRange: 3,
    skills: buildSkillsForCharacterId('nvxiushi'),
    attribute: 'normal',
  },
  {
    id: 'jinxiushi',
    name: '金系修士',
    job: '筑基修士',
    faction: 'immortal',
    level: 1,
    exp: 0,
    baseMaxHp: 260,
    maxHp: 260,
    baseMaxMp: 150,
    maxMp: 150,
    baseAttack: 70,
    attack: 70,
    baseDefense: 10,
    defense: 10,
    baseMoveRange: 3,
    moveRange: 3,
    baseAttackRange: 3,
    attackRange: 3,
    skills: buildSkillsForCharacterId('jinxiushi'),
    attribute: 'metal',
  },
  {
    id: 'muxiushi',
    name: '木系修士',
    job: '筑基修士',
    faction: 'immortal',
    level: 1,
    exp: 0,
    baseMaxHp: 300,
    maxHp: 300,
    baseMaxMp: 150,
    maxMp: 150,
    baseAttack: 60,
    attack: 60,
    baseDefense: 15,
    defense: 15,
    baseMoveRange: 3,
    moveRange: 3,
    baseAttackRange: 3,
    attackRange: 3,
    skills: buildSkillsForCharacterId('muxiushi'),
    attribute: 'wood',
  },
  {
    id: 'shuixiushi',
    name: '水系修士',
    job: '筑基修士',
    faction: 'immortal',
    level: 1,
    exp: 0,
    baseMaxHp: 280,
    maxHp: 280,
    baseMaxMp: 150,
    maxMp: 150,
    baseAttack: 60,
    attack: 60,
    baseDefense: 20,
    defense: 20,
    baseMoveRange: 3,
    moveRange: 3,
    baseAttackRange: 3,
    attackRange: 3,
    skills: buildSkillsForCharacterId('shuixiushi'),
    attribute: 'water',
  },
  {
    id: 'tuxiushi',
    name: '土系修士',
    job: '筑基修士',
    faction: 'immortal',
    level: 1,
    exp: 0,
    baseMaxHp: 270,
    maxHp: 270,
    baseMaxMp: 120,
    maxMp: 120,
    baseAttack: 90,
    attack: 90,
    baseDefense: 20,
    defense: 20,
    baseMoveRange: 3,
    moveRange: 3,
    baseAttackRange: 1,
    attackRange: 1,
    skills: buildSkillsForCharacterId('tuxiushi'),
    attribute: 'earth',
  },
  {
    id: 'huoxiushi',
    name: '火系修士',
    job: '筑基修士',
    faction: 'immortal',
    level: 1,
    exp: 0,
    baseMaxHp: 250,
    maxHp: 250,
    baseMaxMp: 150,
    maxMp: 150,
    baseAttack: 70,
    attack: 70,
    baseDefense: 10,
    defense: 10,
    baseMoveRange: 4,
    moveRange: 4,
    baseAttackRange: 3,
    attackRange: 3,
    skills: buildSkillsForCharacterId('huoxiushi'),
    attribute: 'fire',
  },
  {
    id: 'baihu',
    name: '白狐',
    job: '灵宠',
    faction: 'immortal',
    level: 1,
    exp: 0,
    baseMaxHp: 120,
    maxHp: 120,
    baseMaxMp: 100,
    maxMp: 100,
    baseAttack: 40,
    attack: 40,
    baseDefense: 5,
    defense: 5,
    baseMoveRange: 4,
    moveRange: 4,
    baseAttackRange: 2,
    attackRange: 2,
    skills: buildSkillsForCharacterId('baihu'),
    attribute: 'water',
  },
  {
    id: 'songyu',
    name: '宋玉',
    job: '金丹修士',
    faction: 'immortal',
    level: 1,
    exp: 0,
    baseMaxHp: 360,
    maxHp: 360,
    baseMaxMp: 180,
    maxMp: 180,
    baseAttack: 85,
    attack: 85,
    baseDefense: 25,
    defense: 25,
    baseMoveRange: 3,
    moveRange: 3,
    baseAttackRange: 3,
    attackRange: 3,
    skills: buildSkillsForCharacterId('songyu'),
    attribute: 'water',
  },
  {
    id: 'tianxiang',
    name: '天香',
    job: '金丹修士',
    faction: 'immortal',
    level: 1,
    exp: 0,
    baseMaxHp: 340,
    maxHp: 340,
    baseMaxMp: 200,
    maxMp: 200,
    baseAttack: 85,
    attack: 85,
    baseDefense: 25,
    defense: 25,
    baseMoveRange: 4,
    moveRange: 4,
    baseAttackRange: 4,
    attackRange: 4,
    skills: buildSkillsForCharacterId('tianxiang'),
    attribute: 'wood',
  },
  {
    id: 'yijian',
    name: '奕剑',
    job: '金丹修士',
    faction: 'immortal',
    level: 1,
    exp: 0,
    baseMaxHp: 350,
    maxHp: 350,
    baseMaxMp: 200,
    maxMp: 200,
    baseAttack: 95,
    attack: 95,
    baseDefense: 20,
    defense: 20,
    baseMoveRange: 3,
    moveRange: 3,
    baseAttackRange: 3,
    attackRange: 3,
    skills: buildSkillsForCharacterId('yijian'),
    attribute: 'metal',
    avatar: '/static/avatars/immortal/yijian.png',
  },
  {
    id: 'xinghun',
    name: '星魂',
    job: '魔将',
    faction: 'demon',
    level: 1,
    exp: 0,
    baseMaxHp: 360,
    maxHp: 360,
    baseMaxMp: 200,
    maxMp: 200,
    baseAttack: 95,
    attack: 95,
    baseDefense: 15,
    defense: 15,
    baseMoveRange: 3,
    moveRange: 3,
    baseAttackRange: 4,
    attackRange: 4,
    skills: buildSkillsForCharacterId('xinghun'),
    attribute: 'metal',
  },
  {
    id: 'huyao',
    name: '虎妖',
    job: '妖怪',
    faction: 'beast',
    level: 1,
    exp: 0,
    baseMaxHp: 280,
    maxHp: 280,
    baseMaxMp: 120,
    maxMp: 120,
    baseAttack: 75,
    attack: 75,
    baseDefense: 15,
    defense: 15,
    baseMoveRange: 3,
    moveRange: 3,
    baseAttackRange: 1,
    attackRange: 1,
    skills: buildSkillsForCharacterId('huyao'),
    attribute: 'earth',
  },
  {
    id: 'shaosiming',
    name: '少司命',
    job: '魔将',
    faction: 'demon',
    level: 1,
    exp: 0,
    baseMaxHp: 320,
    maxHp: 320,
    baseMaxMp: 180,
    maxMp: 180,
    baseAttack: 70,
    attack: 70,
    baseDefense: 10,
    defense: 10,
    baseMoveRange: 5,
    moveRange: 5,
    baseAttackRange: 4,
    attackRange: 4,
    skills: buildSkillsForCharacterId('shaosiming'),
    attribute: 'wind',
  },
  {
    id: 'xixuegui',
    name: '吸血鬼',
    job: '魔族',
    faction: 'demon',
    level: 1,
    exp: 0,
    baseMaxHp: 210,
    maxHp: 210,
    baseMaxMp: 100,
    maxMp: 100,
    baseAttack: 60,
    attack: 60,
    baseDefense: 5,
    defense: 5,
    baseMoveRange: 3,
    moveRange: 3,
    baseAttackRange: 2,
    attackRange: 2,
    skills: buildSkillsForCharacterId('xixuegui'),
    attribute: 'dark',
  },
  {
    id: 'saman',
    name: '萨满',
    job: '魔族',
    faction: 'demon',
    level: 1,
    exp: 0,
    baseMaxHp: 150,
    maxHp: 150,
    baseMaxMp: 150,
    maxMp: 150,
    baseAttack: 40,
    attack: 40,
    baseDefense: 5,
    defense: 5,
    baseMoveRange: 2,
    moveRange: 2,
    baseAttackRange: 4,
    attackRange: 4,
    skills: buildSkillsForCharacterId('saman'),
    attribute: 'dark',
  },
  {
    id: 'meimo',
    name: '魅魔',
    job: '魔族',
    faction: 'demon',
    level: 1,
    exp: 0,
    baseMaxHp: 200,
    maxHp: 200,
    baseMaxMp: 150,
    maxMp: 150,
    baseAttack: 50,
    attack: 50,
    baseDefense: 10,
    defense: 10,
    baseMoveRange: 3,
    moveRange: 3,
    baseAttackRange: 3,
    attackRange: 3,
    skills: buildSkillsForCharacterId('meimo'),
    attribute: 'water',
  },
  {
    id: 'chilian',
    name: '赤炼',
    job: '流沙',
    faction: 'human',
    level: 1,
    exp: 0,
    baseMaxHp: 240,
    maxHp: 240,
    baseMaxMp: 160,
    maxMp: 160,
    baseAttack: 70,
    attack: 70,
    baseDefense: 15,
    defense: 15,
    baseMoveRange: 3,
    moveRange: 3,
    baseAttackRange: 3,
    attackRange: 3,
    skills: buildSkillsForCharacterId('chilian'),
    attribute: 'fire',
  },
  {
    id: 'kuilei',
    name: '傀儡娃娃',
    job: '傀儡',
    faction: 'demon',
    level: 1,
    exp: 0,
    baseMaxHp: 100,
    maxHp: 100,
    baseMaxMp: 50,
    maxMp: 50,
    baseAttack: 55,
    attack: 55,
    baseDefense: 5,
    defense: 5,
    baseMoveRange: 2,
    moveRange: 2,
    baseAttackRange: 2,
    attackRange: 2,
    skills: buildSkillsForCharacterId('kuilei'),
    attribute: 'dark',
  },
  {
    id: 'kuileinvhuang',
    name: '傀儡女皇',
    job: '傀儡',
    faction: 'demon',
    level: 1,
    exp: 0,
    baseMaxHp: 200,
    maxHp: 200,
    baseMaxMp: 150,
    maxMp: 150,
    baseAttack: 65,
    attack: 65,
    baseDefense: 15,
    defense: 15,
    baseMoveRange: 2,
    moveRange: 2,
    baseAttackRange: 3,
    attackRange: 3,
    skills: buildSkillsForCharacterId('kuileinvhuang'),
    attribute: 'light',
  },
  {
    id: 'jixiesangshi',
    name: '机械丧尸',
    job: '人造丧尸',
    faction: 'ghost',
    level: 1,
    exp: 0,
    baseMaxHp: 250,
    maxHp: 250,
    baseMaxMp: 100,
    maxMp: 100,
    baseAttack: 60,
    attack: 60,
    baseDefense: 15,
    defense: 15,
    baseMoveRange: 3,
    moveRange: 3,
    baseAttackRange: 1,
    attackRange: 1,
    skills: buildSkillsForCharacterId('jixiesangshi'),
    attribute: 'normal',
  },
  {
    id: 'muoushi',
    name: '木偶师',
    job: '魔将',
    faction: 'demon',
    level: 1,
    exp: 0,
    baseMaxHp: 320,
    maxHp: 320,
    baseMaxMp: 200,
    maxMp: 200,
    baseAttack: 70,
    attack: 70,
    baseDefense: 15,
    defense: 15,
    baseMoveRange: 3,
    moveRange: 3,
    baseAttackRange: 3,
    attackRange: 3,
    skills: buildSkillsForCharacterId('muoushi'),
    attribute: 'dark',
  },
  {
    id: 'jingziyao',
    name: '镜妖',
    job: '妖怪',
    faction: 'beast',
    level: 1,
    exp: 0,
    baseMaxHp: 250,
    maxHp: 250,
    baseMaxMp: 150,
    maxMp: 150,
    baseAttack: 60,
    attack: 60,
    baseDefense: 20,
    defense: 20,
    baseMoveRange: 3,
    moveRange: 3,
    baseAttackRange: 2,
    attackRange: 2,
    skills: buildSkillsForCharacterId('jingziyao'),
    attribute: 'metal',
  },
  {
    id: 'tiantu',
    name: '天兔',
    job: '生肖',
    faction: 'beast',
    level: 1,
    exp: 0,
    baseMaxHp: 360,
    maxHp: 360,
    baseMaxMp: 200,
    maxMp: 200,
    baseAttack: 70,
    attack: 70,
    baseDefense: 25,
    defense: 25,
    baseMoveRange: 3,
    moveRange: 3,
    baseAttackRange: 2,
    attackRange: 2,
    skills: buildSkillsForCharacterId('tiantu'),
    attribute: 'water',
  },
  {
    id: 'tianniu',
    name: '天牛',
    job: '生肖',
    faction: 'beast',
    level: 1,
    exp: 0,
    baseMaxHp: 460,
    maxHp: 460,
    baseMaxMp: 180,
    maxMp: 180,
    baseAttack: 95,
    attack: 95,
    baseDefense: 30,
    defense: 30,
    baseMoveRange: 3,
    moveRange: 3,
    baseAttackRange: 1,
    attackRange: 1,
    skills: buildSkillsForCharacterId('tianniu'),
    attribute: 'earth',
  },
  {
    id: 'lingyu',
    name: '翎羽',
    job: '神将',
    faction: 'god',
    level: 1,
    exp: 0,
    baseMaxHp: 320,
    maxHp: 320,
    baseMaxMp: 180,
    maxMp: 180,
    baseAttack: 90,
    attack: 90,
    baseDefense: 20,
    defense: 20,
    baseMoveRange: 4,
    moveRange: 4,
    baseAttackRange: 4,
    attackRange: 4,
    skills: buildSkillsForCharacterId('lingyu'),
    attribute: 'wind',
  },
  {
    id: 'bingxin',
    name: '冰心',
    job: '金丹修士',
    faction: 'immortal',
    level: 1,
    exp: 0,
    baseMaxHp: 360,
    maxHp: 360,
    baseMaxMp: 200,
    maxMp: 200,
    baseAttack: 70,
    attack: 70,
    baseDefense: 20,
    defense: 20,
    baseMoveRange: 3,
    moveRange: 3,
    baseAttackRange: 4,
    attackRange: 4,
    skills: buildSkillsForCharacterId('bingxin'),
    attribute: 'water',
    avatar: '/static/avatars/immortal/bingxin.png',
  },
  {
    id: 'huanghuo',
    name: '荒火',
    job: '神将',
    faction: 'god',
    level: 1,
    exp: 0,
    baseMaxHp: 400,
    maxHp: 400,
    baseMaxMp: 180,
    maxMp: 180,
    baseAttack: 95,
    attack: 95,
    baseDefense: 25,
    defense: 25,
    baseMoveRange: 3,
    moveRange: 3,
    baseAttackRange: 2,
    attackRange: 2,
    skills: buildSkillsForCharacterId('huanghuo'),
    attribute: 'fire',
    avatar: '/static/avatars/god/huanghuo.png',
  },
  {
    id: 'yunlu',
    name: '云麓',
    job: '神裔',
    faction: 'god',
    level: 1,
    exp: 0,
    baseMaxHp: 360,
    maxHp: 360,
    baseMaxMp: 290,
    maxMp: 290,
    baseAttack: 105,
    attack: 105,
    baseDefense: 25,
    defense: 25,
    baseMoveRange: 3,
    moveRange: 3,
    baseAttackRange: 4,
    attackRange: 4,
    skills: buildSkillsForCharacterId('yunlu'),
    attribute: 'yang',
    avatar: '/static/avatars/god/yunlu.png',
  },
  {
    id: 'xuanwu',
    name: '玄武',
    job: '神兽',
    faction: 'god',
    level: 1,
    exp: 0,
    baseMaxHp: 600,
    maxHp: 600,
    baseMaxMp: 320,
    maxMp: 320,
    baseAttack: 65,
    attack: 65,
    baseDefense: 75,
    defense: 75,
    baseMoveRange: 2,
    moveRange: 2,
    baseAttackRange: 2,
    attackRange: 2,
    skills: buildSkillsForCharacterId('xuanwu'),
    attribute: 'water',
    avatar: '/static/avatars/god/xuanwu.png',
  },
  {
    id: 'nongyu',
    name: '弄玉',
    job: '金丹修士',
    faction: 'immortal',
    level: 1,
    exp: 0,
    baseMaxHp: 320,
    maxHp: 320,
    baseMaxMp: 200,
    maxMp: 200,
    baseAttack: 70,
    attack: 70,
    baseDefense: 25,
    defense: 25,
    baseMoveRange: 3,
    moveRange: 3,
    baseAttackRange: 4,
    attackRange: 4,
    skills: buildSkillsForCharacterId('nongyu'),
    attribute: 'wind',
    avatar: '/static/avatars/immortal/nongyu.png',
  },
  {
    id: 'tianshu',
    name: '天鼠',
    job: '生肖',
    faction: 'beast',
    level: 1,
    exp: 0,
    baseMaxHp: 360,
    maxHp: 360,
    baseMaxMp: 210,
    maxMp: 210,
    baseAttack: 70,
    attack: 70,
    baseDefense: 15,
    defense: 15,
    baseMoveRange: 4,
    moveRange: 4,
    baseAttackRange: 1,
    attackRange: 1,
    skills: buildSkillsForCharacterId('tianshu'),
    attribute: 'water',
    avatar: '/static/avatars/beast/tianshu.png',
  },
  {
    id: 'canjuanhun',
    name: '残卷魂',
    job: '鬼魂',
    faction: 'ghost',
    level: 1,
    exp: 0,
    baseMaxHp: 320,
    maxHp: 320,
    baseMaxMp: 180,
    maxMp: 180,
    baseAttack: 75,
    attack: 75,
    baseDefense: 15,
    defense: 15,
    baseMoveRange: 3,
    moveRange: 3,
    baseAttackRange: 3,
    attackRange: 3,
    skills: buildSkillsForCharacterId('canjuanhun'),
    attribute: 'wood',
    avatar: '/static/avatars/ghost/canjuanhun.png',
  },
  {
    id: 'tiegao',
    name: '铁锆',
    job: '鬼魂',
    faction: 'ghost',
    level: 1,
    exp: 0,
    baseMaxHp: 360,
    maxHp: 360,
    baseMaxMp: 150,
    maxMp: 150,
    baseAttack: 85,
    attack: 85,
    baseDefense: 25,
    defense: 25,
    baseMoveRange: 3,
    moveRange: 3,
    baseAttackRange: 2,
    attackRange: 2,
    skills: buildSkillsForCharacterId('tiegao'),
    attribute: 'metal',
    avatar: '/static/avatars/ghost/tiegao.png',
  },
  {
    id: 'zhengjia',
    name: '震枷',
    job: '鬼魂',
    faction: 'ghost',
    level: 1,
    exp: 0,
    baseMaxHp: 340,
    maxHp: 340,
    baseMaxMp: 200,
    maxMp: 200,
    baseAttack: 75,
    attack: 75,
    baseDefense: 20,
    defense: 20,
    baseMoveRange: 3,
    moveRange: 3,
    baseAttackRange: 4,
    attackRange: 4,
    skills: buildSkillsForCharacterId('zhengjia'),
    attribute: 'metal',
    avatar: '/static/avatars/ghost/zhenjia.png',
  },
  {
    id: 'mengsike',
    name: '蒙斯克',
    job: '人皇',
    faction: 'human',
    level: 1,
    exp: 0,
    baseMaxHp: 600,
    maxHp: 600,
    baseMaxMp: 260,
    maxMp: 260,
    baseAttack: 100,
    attack: 100,
    baseDefense: 35,
    defense: 35,
    baseMoveRange: 3,
    moveRange: 3,
    baseAttackRange: 3,
    attackRange: 3,
    skills: buildSkillsForCharacterId('mengsike'),
    attribute: 'light',
    avatar: '/static/avatars/human/mengsike.png',
  },
  {
    id: 'longwu',
    name: '龙巫',
    job: '魔神',
    faction: 'demon',
    level: 1,
    exp: 0,
    baseMaxHp: 450,
    maxHp: 450,
    baseMaxMp: 300,
    maxMp: 300,
    baseAttack: 130,
    attack: 130,
    baseDefense: 30,
    defense: 30,
    baseMoveRange: 3,
    moveRange: 3,
    baseAttackRange: 4,
    attackRange: 4,
    skills: buildSkillsForCharacterId('longwu'),
    attribute: 'fire',
    avatar: '/static/avatars/demon/longwu.png',
  },
  {
    id: 'hongluan',
    name: '红鸾',
    job: '血色嫁衣',
    faction: 'ghost',
    level: 1,
    exp: 0,
    baseMaxHp: 520,
    maxHp: 520,
    baseMaxMp: 320,
    maxMp: 320,
    baseAttack: 115,
    attack: 115,
    baseDefense: 30,
    defense: 30,
    baseMoveRange: 4,
    moveRange: 4,
    baseAttackRange: 4,
    attackRange: 4,
    skills: buildSkillsForCharacterId('hongluan'),
    attribute: 'yin',
    avatar: '/static/avatars/ghost/hongluan.png',
  },
  {
    id: 'shashengying',
    name: '杀生樱',
    job: '虚影',
    faction: 'beast',
    level: 1,
    exp: 0,
    baseMaxHp: 160,
    maxHp: 160,
    baseMaxMp: 240,
    maxMp: 240,
    baseAttack: 80,
    attack: 80,
    baseDefense: 5,
    defense: 5,
    baseMoveRange: 0,
    moveRange: 0,
    baseAttackRange: 4,
    attackRange: 4,
    skills: buildSkillsForCharacterId('shashengying'),
    attribute: 'metal',
    avatar: '/static/avatars/beast/shashengying.png',
  },
  {
    id: 'bachongshenzi',
    name: '八重神子',
    job: '天狐司命',
    faction: 'beast',
    level: 1,
    exp: 0,
    baseMaxHp: 520,
    maxHp: 520,
    baseMaxMp: 320,
    maxMp: 320,
    baseAttack: 120,
    attack: 120,
    baseDefense: 30,
    defense: 30,
    baseMoveRange: 4,
    moveRange: 4,
    baseAttackRange: 4,
    attackRange: 4,
    skills: buildSkillsForCharacterId('bachongshenzi'),
    attribute: 'metal',
    avatar: '/static/avatars/beast/bachongshenzi.png',
  },
  {
    id: 'qianshou',
    name: '千手',
    job: '鬼神',
    faction: 'ghost',
    level: 1,
    exp: 0,
    baseMaxHp: 560,
    maxHp: 560,
    baseMaxMp: 320,
    maxMp: 320,
    baseAttack: 110,
    attack: 110,
    baseDefense: 40,
    defense: 40,
    baseMoveRange: 2,
    moveRange: 2,
    baseAttackRange: 3,
    attackRange: 3,
    skills: buildSkillsForCharacterId('qianshou'),
    attribute: 'dark',
    avatar: '/static/avatars/ghost/qianshou.png',
  },
  {
    id: 'yixienamei',
    name: '伊邪那美',
    job: '黄泉冥神',
    faction: 'ghost',
    level: 1,
    exp: 0,
    baseMaxHp: 520,
    maxHp: 520,
    baseMaxMp: 350,
    maxMp: 350,
    baseAttack: 120,
    attack: 120,
    baseDefense: 35,
    defense: 35,
    baseMoveRange: 4,
    moveRange: 4,
    baseAttackRange: 4,
    attackRange: 4,
    skills: buildSkillsForCharacterId('yixienamei'),
    attribute: 'yin',
    avatar: '/static/avatars/ghost/yixienamei.png',
  },
  {
    id: 'yixienamei_virtual',
    name: '伊邪那美虚影',
    job: '虚影',
    faction: 'ghost',
    level: 1,
    exp: 0,
    baseMaxHp: 520,
    maxHp: 520,
    baseMaxMp: 100,
    maxMp: 100,
    baseAttack: 120,
    attack: 120,
    baseDefense: 35,
    defense: 35,
    baseMoveRange: 4,
    moveRange: 4,
    baseAttackRange: 4,
    attackRange: 4,
    skills: buildSkillsForCharacterId('yixienamei_virtual'),
    attribute: 'yin',
    avatar: '/static/avatars/ghost/yixienamei.png',
  },
  {
    id: 'keqing',
    name: '刻晴',
    job: '玉衡',
    faction: 'god',
    level: 1,
    exp: 0,
    baseMaxHp: 520,
    maxHp: 520,
    baseMaxMp: 320,
    maxMp: 320,
    baseAttack: 125,
    attack: 125,
    baseDefense: 25,
    defense: 25,
    baseMoveRange: 4,
    moveRange: 4,
    baseAttackRange: 2,
    attackRange: 2,
    skills: buildSkillsForCharacterId('keqing'),
    attribute: 'metal',
    avatar: '/static/avatars/god/keqing.png',
  },
  {
    id: 'xueyue',
    name: '雪月',
    job: '冰雪女神',
    faction: 'god',
    level: 1,
    exp: 0,
    baseMaxHp: 520,
    maxHp: 520,
    baseMaxMp: 350,
    maxMp: 350,
    baseAttack: 110,
    attack: 110,
    baseDefense: 30,
    defense: 30,
    baseMoveRange: 3,
    moveRange: 3,
    baseAttackRange: 4,
    attackRange: 4,
    skills: buildSkillsForCharacterId('xueyue'),
    attribute: 'ice',
    avatar: '/static/avatars/god/xueyue.jpg',
  },
  {
    id: 'tianshe',
    name: '天蛇',
    job: '蛇姬',
    faction: 'beast',
    level: 1,
    exp: 0,
    baseMaxHp: 520,
    maxHp: 520,
    baseMaxMp: 340,
    maxMp: 340,
    baseAttack: 125,
    attack: 125,
    baseDefense: 25,
    defense: 25,
    baseMoveRange: 4,
    moveRange: 4,
    baseAttackRange: 1,
    attackRange: 1,
    skills: buildSkillsForCharacterId('tianshe'),
    attribute: 'yin',
    avatar: '/static/avatars/beast/tianshe.jpg',
  },
]

export const EQUIPMENT_TEMPLATES: {
  weapons: Omit<Item, 'id' | 'count' | 'rarity'>[]
  armors: Omit<Item, 'id' | 'count' | 'rarity'>[]
  helmets: Omit<Item, 'id' | 'count' | 'rarity'>[]
  shoes: Omit<Item, 'id' | 'count' | 'rarity'>[]
  accessories: Omit<Item, 'id' | 'count' | 'rarity'>[]
  books: Omit<Item, 'id' | 'count' | 'rarity'>[]
} = {
  weapons: [
    { name: '教学剑', icon: '/static/avatars/items/jiaoxue_jian.png', type: 'equipment', level: 1, subtype: 'weapon', baseStats: { attack: 5 }, description: '教学剑，攻击+5', quality: '凡物' },
    { name: '破损的剑', icon: '/static/avatars/items/posun_de_jian.png', type: 'equipment', level: 1, subtype: 'weapon', baseStats: { attack: 10 }, description: '破损但仍可使用的剑', quality: '凡物' },
    { name: '餐刀', icon: '/static/avatars/items/caidao.png', type: 'equipment', level: 1, subtype: 'weapon', baseStats: { attack: 8 }, description: '餐刀，攻击+8', quality: '凡物' },
    { name: '长矛', icon: '/static/avatars/items/changmao.png', type: 'equipment', level: 1, subtype: 'weapon', baseStats: { attack: 15 }, description: '长矛，攻击+15', quality: '凡物' },
    { name: '长戈', icon: '/static/avatars/items/changge.png', type: 'equipment', level: 1, subtype: 'weapon', baseStats: { attack: 12 }, description: '长戈，攻击+12', quality: '凡物' },
    { name: '白银狼牙棒', icon: '/static/avatars/items/baiyin_langyabang.png', type: 'equipment', level: 1, subtype: 'weapon', baseStats: { attack: 25 }, description: '白银狼牙棒', quality: '凡物' },
    { name: '铁剑', icon: '/static/avatars/items/tiejian.png', type: 'equipment', level: 1, subtype: 'weapon', baseStats: { attack: 20 }, description: '铁剑，攻击+20', quality: '凡物' },
    { name: '爪子刀', icon: '/static/avatars/items/zhuazidao.png', type: 'equipment', level: 1, subtype: 'weapon', baseStats: { attack: 10 }, description: '爪子刀，攻击+10', quality: '凡物' },
    { name: '火羽', icon: '/static/avatars/items/huoyu.png', type: 'equipment', level: 1, subtype: 'weapon', baseStats: { mp: 80, attack: 50, attackRange: 1 }, description: '法力值+80，攻击力+50，攻击范围+1，装备后获得专属技能【火羽流星】', grantedSkillId: 'huo_yu_liu_xing', quality: '仙器' },
    { name: '天雅', icon: '/static/avatars/items/tianya.png', type: 'equipment', level: 1, subtype: 'weapon', baseStats: { mp: 80, attack: 40, attackRange: 1 }, description: '法力值+80，攻击力+40，攻击范围+1，装备后获得专属技能【天雅倾情】', grantedSkillId: 'tian_ya_qing_qing', quality: '仙器' },
    { name: '青云白鹤弓', icon: '/static/avatars/items/qingyunbaihegong.png', type: 'equipment', level: 1, subtype: 'weapon', baseStats: { attack: 50, mp: 60, attackRange: 1 }, description: '攻击力+50，法力值+60，攻击范围+1，装备后获得专属技能【云鹤翔舞】', grantedSkillId: 'yun_he_xiang_wu', quality: '仙器' },
    { name: '精灵法杖', icon: '/static/avatars/items/jinglingfazhang.png', type: 'equipment', level: 1, subtype: 'weapon', baseStats: { attack: 10, mp: 40 }, description: '精灵法杖，攻击+10，法力+40', setTag: '精灵', quality: '灵器' },
    { name: '巨兽尖牙', icon: '/static/avatars/items/jushoujianya.png', type: 'equipment', level: 1, subtype: 'weapon', baseStats: { attack: 25, defense: 5 }, description: '巨兽尖牙，攻击+25，防御+5', setTag: '巨兽', quality: '灵器' },
  ],
  armors: [
    { name: '骑士甲胄', icon: '/static/avatars/items/qishi_jiazhou.png', type: 'equipment', level: 1, subtype: 'armor', baseStats: { defense: 20, hp: 50 }, description: '防具，生命+50，防御+20', quality: '凡物' },
    { name: '棉衣', icon: '/static/avatars/items/mianyi.png', type: 'equipment', level: 1, subtype: 'armor', baseStats: { hp: 20, defense: 5 }, description: '棉衣，生命+20，防御+5', quality: '凡物' },
    { name: '冒险者服装', icon: '/static/avatars/items/maoxianjiayifu.png', type: 'equipment', level: 1, subtype: 'armor', baseStats: { hp: 25, defense: 10 }, description: '冒险者服装，生命+25，防御+10', quality: '凡物' },
    { name: '秀才服', icon: '/static/avatars/items/xiucaifu.png', type: 'equipment', level: 1, subtype: 'armor', baseStats: { hp: 10, mp: 20, defense: 5 }, description: '秀才服，生命+10，法力+20，防御+5', quality: '凡物' },
  ],
  helmets: [
    { name: '精灵帽', icon: '/static/avatars/items/jinglingmao.png', type: 'equipment', level: 1, subtype: 'helmet', baseStats: { hp: 10, mp: 30 }, description: '精灵帽，生命+10，法力+30', setTag: '精灵', quality: '灵器' },
    { name: '白银赛车头盔', icon: '/static/avatars/items/baiyin_saiche_toukui.png', type: 'equipment', level: 1, subtype: 'helmet', baseStats: { defense: 20, hp: 40 }, description: '白银赛车头盔，生命+40，防御+20', quality: '凡物' },
    { name: '骑士头盔', icon: '/static/avatars/items/qishi_toukui.png', type: 'equipment', level: 1, subtype: 'helmet', baseStats: { defense: 20, hp: 30 }, description: '头盔，生命+30，防御+20', quality: '凡物' },
    { name: '战术头盔', icon: '/static/avatars/items/zhanshutoukui.png', type: 'equipment', level: 1, subtype: 'helmet', baseStats: { hp: 40, defense: 20 }, description: '战术头盔，生命+40，防御+20', quality: '凡物' },
    { name: '冒险家帽子', icon: '/static/avatars/items/maoxianjiamaozi.png', type: 'equipment', level: 1, subtype: 'helmet', baseStats: { hp: 25, defense: 10 }, description: '冒险家帽子，生命+25，防御+10', quality: '凡物' },
    { name: '魔术帽', icon: '/static/avatars/items/moshumao.png', type: 'equipment', level: 1, subtype: 'helmet', baseStats: { hp: 10, mp: 20, defense: 5 }, description: '魔术帽，生命+10，法力+20，防御+5', quality: '凡物' },
    { name: '紫发簪', icon: '/static/avatars/items/zifazan.png', type: 'equipment', level: 1, subtype: 'helmet', baseStats: { mp: 25 }, description: '紫发簪，法力+25', quality: '凡物' },
    { name: '臣相帽', icon: '/static/avatars/items/chenxiangmao.png', type: 'equipment', level: 1, subtype: 'helmet', baseStats: { hp: 40, mp: 40, defense: 10 }, description: '臣相帽，生命+40，法力+40，防御+10', quality: '凡物' },
    { name: '巨兽头盔', icon: '/static/avatars/items/jushoutoukui.png', type: 'equipment', level: 1, subtype: 'helmet', baseStats: { hp: 40, defense: 15 }, description: '巨兽头盔，生命+40，防御+15', setTag: '巨兽', quality: '灵器' },
  ],
  shoes: [
    { name: '精灵靴', icon: '/static/avatars/items/jinglingxue.png', type: 'equipment', level: 1, subtype: 'shoes', baseStats: { hp: 10, mp: 25 }, description: '精灵靴，生命+10，法力+25', setTag: '精灵', quality: '灵器' },
    { name: '骑士靴', icon: '/static/avatars/items/qishi_xue.png', type: 'equipment', level: 1, subtype: 'shoes', baseStats: { hp: 20, defense: 15 }, description: '骑士靴，生命+20，防御+15', quality: '凡物' },
    { name: '布鞋', icon: '/static/avatars/items/buxie.png', type: 'equipment', level: 1, subtype: 'shoes', baseStats: { hp: 5, defense: 3 }, description: '布鞋，生命+5，防御+3', quality: '凡物' },
    { name: '暗黑玫瑰', icon: '/static/avatars/items/anheimeigui.png', type: 'equipment', level: 1, subtype: 'shoes', baseStats: { hp: 15, mp: 25, defense: 5 }, description: '暗黑玫瑰，生命+15，法力+25，防御+5', quality: '凡物' },
    { name: '巨兽鞋子', icon: '/static/avatars/items/jushouxiezi.png', type: 'equipment', level: 1, subtype: 'shoes', baseStats: { hp: 30, defense: 10 }, description: '巨兽鞋子，生命+30，防御+10', setTag: '巨兽', quality: '灵器' },
  ],
  accessories: [
    { name: '骑士戒指', icon: '/static/avatars/items/qishi_jiezhi.png', type: 'equipment', level: 1, subtype: 'accessory', baseStats: { attack: 15, defense: 15 }, description: '饰品，攻击+15，防御+15', quality: '凡物' },
    { name: '教会戒指', icon: '/static/avatars/items/jiaohui_jiezhi.png', type: 'equipment', level: 1, subtype: 'accessory', baseStats: { defense: 5, hp: 20 }, description: '教会戒指，生命+20，防御+5', quality: '凡物' },
    { name: '耳环', icon: '/static/avatars/items/erhuan.png', type: 'equipment', level: 1, subtype: 'accessory', baseStats: { mp: 20 }, description: '精美耳环', quality: '凡物' },
    { name: '金徽章', icon: '/static/avatars/items/jinhuizhang.png', type: 'equipment', level: 1, subtype: 'accessory', baseStats: { hp: 90, attack: 30, defense: 15 }, description: '饰品，生命+90，攻击+30，防御+15', quality: '法器' },
    { name: '银徽章', icon: '/static/avatars/items/yinhuizhang.png', type: 'equipment', level: 1, subtype: 'accessory', baseStats: { hp: 60, attack: 20, defense: 10 }, description: '饰品，生命+60，攻击+20，防御+10', quality: '法器' },
    { name: '铜徽章', icon: '/static/avatars/items/tonghuizhang.png', type: 'equipment', level: 1, subtype: 'accessory', baseStats: { hp: 30, attack: 10, defense: 5 }, description: '饰品，生命+30，攻击+10，防御+5', quality: '法器' },
    { name: '精灵徽章', icon: '/static/avatars/items/jinglinghuizhang.png', type: 'equipment', level: 1, subtype: 'accessory', baseStats: { hp: 30, mp: 50 }, description: '精灵徽章，生命+30，法力+50', setTag: '精灵', quality: '灵器' },
    { name: '巨兽护盾', icon: '/static/avatars/items/jushouhudun.png', type: 'equipment', level: 1, subtype: 'accessory', baseStats: { hp: 50, defense: 20 }, description: '巨兽护盾，生命+50，防御+20', setTag: '巨兽', quality: '灵器' },
  ],
  books: [
    { name: '剑法', icon: '/static/avatars/items/jianfa.png', type: 'equipment', level: 1, subtype: 'book', baseStats: { attack: 20 }, description: '剑法秘籍，攻击力+20', quality: '法器' },
    { name: '刀法', icon: '/static/avatars/items/daofa.png', type: 'equipment', level: 1, subtype: 'book', baseStats: { attack: 15, hp: 20 }, description: '刀法秘籍，攻击力+15，生命值+20', quality: '法器' },
  ],
}

export const CONSUMABLE_TEMPLATES: Omit<Item, 'id' | 'count'>[] = [
  { name: '灵草', icon: '/static/avatars/items/lingcao.png', type: 'consumable', rarity: 'common', level: 1, subtype: 'consumable', description: '恢复10%最大生命和10%最大法力' },
  { name: '灵药', icon: '/static/avatars/items/danyao.png', type: 'consumable', rarity: 'rare', level: 1, subtype: 'consumable', description: '恢复30%最大生命和30%最大法力' },
  { ...CHEST_CONFIG.wanwu, type: 'consumable', level: 1, subtype: 'consumable' } as any,
  { ...CHEST_CONFIG.faqi, type: 'consumable', level: 1, subtype: 'consumable' } as any,
  { name: '药箱', icon: '/static/avatars/items/yaoxiang.png', type: 'consumable', rarity: 'exceptional', level: 1, subtype: 'consumable', description: '恢复全部生命值' },
]

// 魂魄配置：用于提升角色等级上限
export const SOUL_CONFIG: Record<string, { name: string; icon: string; description: string }> = {
  universal: {
    name: '万能魂魄',
    icon: '/static/avatars/items/hunpo.png',
    description: '可提升任意角色的等级上限'
  },
}

// 特定类型魂魄配置（根据角色ID生成），使用角色的头像作为图标
export function getSoulConfigByCharacter(characterId: string, characterName: string, faction?: string): { name: string; icon: string; description: string } {
  const avatarPath = getAvatarPath(characterId, faction || 'human')
  return {
    name: `${characterName}魂魄`,
    icon: avatarPath,
    description: `可提升【${characterName}】的等级上限`
  }
}

export function createSoulItem(targetId: string, targetName?: string, targetFaction?: string): Omit<Item, 'id' | 'count'> {
  if (targetId === 'universal') {
    const config = SOUL_CONFIG.universal
    return {
      name: config.name,
      icon: config.icon,
      type: 'consumable',
      rarity: 'rare',
      level: 1,
      subtype: 'soul',
      description: config.description,
      soulTargetId: 'universal'
    }
  } else {
    const name = targetName || targetId
    const config = getSoulConfigByCharacter(targetId, name, targetFaction)
    return {
      name: config.name,
      icon: config.icon,
      type: 'consumable',
      rarity: 'common',
      level: 1,
      subtype: 'soul',
      description: config.description,
      soulTargetId: targetId
    }
  }
}

export const COLLECTIBLE_CONFIG: Record<string, { name: string; icon: string; description: string; hpRestore?: number; mpRestore?: number }> = {
  spirit_grass: { 
    name: '灵草', 
    icon: '/static/avatars/items/lingcao.png', 
    description: '恢复10%最大生命和法力',
    hpRestore: 10,
    mpRestore: 10
  },
  elixir: { 
    name: '丹药', 
    icon: '/static/avatars/items/danyao.png', 
    description: '恢复30%最大生命和法力',
    hpRestore: 30,
    mpRestore: 30
  }
}

export const TERRAIN_CONFIG: Record<TerrainType, { icon: string; passable: boolean; destructible: boolean; hp?: number }> = {
  river: { icon: '🌊', passable: false, destructible: false },
  obstacle: { icon: '⛰️', passable: false, destructible: true, hp: 100 },
  empty: { icon: '', passable: true, destructible: false },
  snow: { icon: '❄️', passable: true, destructible: false },
}



export const BATTLE_CONFIG = {
  offensive: { width: 11, height: 13, playerRows: 2, enemyRows: 2 },
  defensive: { width: 19, height: 19, playerRows: 9, enemyRows: 10 },
}

export const TERRAIN_PROBABILITIES = {
  river: { river: 0.11, obstacle: 0.07 },
  plain: { river: 0.05, obstacle: 0.13 },
  mountain: { river: 0.01, obstacle: 0.17 },
}

export const DIFFICULTY_CONFIG = {
  easy: { name: '简单', multiplier: 0.5 },
  normal: { name: '正常', multiplier: 1 },
  hard: { name: '困难', multiplier: 1.25 },
  nightmare: { name: '噩梦', multiplier: 1.5 },
  deadly: { name: '绝命', multiplier: 2 },
}

export function createEmptyEquipment(): Equipment {
  return {
    weapon: null,
    armor: null,
    helmet: null,
    shoes: null,
    accessory: null,
    book: null,
  }
}

export function createInitialHomeGrid(): HomeGridCell[][] {
  const grid: HomeGridCell[][] = []
  for (let row = 0; row < 9; row++) {
    grid[row] = []
    for (let col = 0; col < 9; col++) {
      grid[row][col] = {
        row,
        col,
        terrain: 'empty',
        building: null,
      }
    }
  }
  return grid
}

export function getAvatarPath(charId: string, faction: string = 'human'): string {
  // 共享的角色头像路径映射
  const avatarPathMap: Record<string, string> = {
    'xiongxiong': '/static/avatars/characters/xiongxiong.png',
    'tutu': '/static/avatars/characters/tutu.png',
    'daheixiong': '/static/avatars/characters/daheixiong.png',
    'ranbing': '/static/avatars/characters/ranbing.png',
    'maiduo': '/static/avatars/characters/maiduo.png',
    'ordinary_zombie': '/static/avatars/ghost/putong_zombie.png',
    'fat_zombie': '/static/avatars/ghost/feipang_zombie.png',
    'swift_zombie': '/static/avatars/ghost/xunmeng_zombie.png',
    'long_tongue_zombie': '/static/avatars/ghost/changshetou_zombie.png',
    'little_zombie': '/static/avatars/ghost/xiaogui_zombie.png',
    'pharaoh_zombie': '/static/avatars/ghost/falao_zombie.png',
    'eseng': '/static/avatars/ghost/eseng.png',
    'jianjiao_zombie': '/static/avatars/ghost/jianjiao_zombie.png',
    'paxing_zombie': '/static/avatars/ghost/paxing_zombie.png',
    'jixiesangshi': '/static/avatars/ghost/jixiesangshi.png',
    'niutou': '/static/avatars/ghost/niutou.png',
    'mamian': '/static/avatars/ghost/mamian.png',
    'nanxiushi': '/static/avatars/immortal/nanxiushi.png',
    'nvxiushi': '/static/avatars/immortal/nvxiushi.png',
    'jinxiushi': '/static/avatars/immortal/jinxiushi.png',
    'muxiushi': '/static/avatars/immortal/muxiushi.png',
    'shuixiushi': '/static/avatars/immortal/shuixiushi.png',
    'tuxiushi': '/static/avatars/immortal/tuxiushi.png',
    'huoxiushi': '/static/avatars/immortal/huoxiushi.png',
    'baihu': '/static/avatars/immortal/baihuli.png',
    'songyu': '/static/avatars/immortal/songyu.png',
    'tianxiang': '/static/avatars/immortal/tianxiang.jpg',
    'penhuobing': '/static/avatars/human/penhuobing.png',
    'eba': '/static/avatars/human/eba.png',
    'qianfuzhe': '/static/avatars/human/qianfuzhe.png',
    'yiliaobing': '/static/avatars/human/yiliaobing.png',
    'kejiqiu': '/static/avatars/human/kejiqiu.png',
    'baifeng': '/static/avatars/human/baifeng.png',
    'jujishou': '/static/avatars/human/jujishou.png',
    'tezhongbing': '/static/avatars/human/tezhongbing.png',
    'kuangren': '/static/avatars/human/kuangren.png',
    'dongyuan_bing': '/static/avatars/human/dongyuan_bing.png',
    'geliya': '/static/avatars/human/geliya.png',
    'tanke': '/static/avatars/human/tanke.png',
    'nvyao': '/static/avatars/human/nvyao.png',
    'shouren': '/static/avatars/demon/shouren.png',
    'xueshou': '/static/avatars/demon/xueshou.png',
    'duying': '/static/avatars/demon/duying.png',
    'kuilei': '/static/avatars/demon/kuileiwawa.png',
    'kuileinvhuang': '/static/avatars/demon/kuileinvhuang.png',
    'muoushi': '/static/avatars/demon/muoushi.png',
    'shaosiming': '/static/avatars/demon/shaosiming.png',
    'dasiming': '/static/avatars/demon/dasiming.png',
    'xixuegui': '/static/avatars/demon/xixuegui.png',
    'saman': '/static/avatars/demon/saman.png',
    'meimo': '/static/avatars/demon/meimo.png',
    'chilian': '/static/avatars/human/chilian.png',
    'youju': '/static/avatars/demon/youju.png',
    'longming': '/static/avatars/demon/longming.png',
    'longyou': '/static/avatars/demon/longyou.png',
    'fuzhong_zombie': '/static/avatars/ghost/fuzhong_zombie.png',
    'zhuyao': '/static/avatars/beast/zhuyao.png',
    'yaoqinshi': '/static/avatars/beast/yaoqinshi.png',
    'luoxinfu': '/static/avatars/beast/luoxinfu.png',
    'taohuayao': '/static/avatars/beast/taohuayao.png',
    'tunjiuyao': '/static/avatars/beast/tunjiuyao.png',
    'jingyao': '/static/avatars/beast/jingyao.png',
    'guhuoniao': '/static/avatars/beast/guhuoniao.png',
    'qingxingdeng': '/static/avatars/beast/qingxingdeng.png',
    'qiyao': '/static/avatars/beast/qiyao.png',
    'yijian': '/static/avatars/immortal/yijian.png',
    'xinghun': '/static/avatars/demon/xinghun.png',
    'huyao': '/static/avatars/beast/huyao.png',
    'jingziyao': '/static/avatars/beast/jingziyao.png',
    'tiantu': '/static/avatars/beast/tiantu.png',
    'tianniu': '/static/avatars/beast/tianniu.png',
    'lingyu': '/static/avatars/god/lingyu.png',
    'bingxin': '/static/avatars/immortal/bingxin.png',
    'huanghuo': '/static/avatars/god/huanghuo.png',
    'yunlu': '/static/avatars/god/yunlu.png',
    'xuanwu': '/static/avatars/god/xuanwu.png',
    'nongyu': '/static/avatars/immortal/nongyu.png',
    'tianshu': '/static/avatars/beast/tianshu.png',
    'canjuanhun': '/static/avatars/ghost/canjuanhun.png',
    'tiegao': '/static/avatars/ghost/tiegao.png',
    'zhengjia': '/static/avatars/ghost/zhenjia.png',
    'mengsike': '/static/avatars/human/mengsike.png',
    'longwu': '/static/avatars/demon/longwu.png',
    'hongluan': '/static/avatars/ghost/hongluan.png',
    'shashengying': '/static/avatars/beast/shashengying.png',
    'bachongshenzi': '/static/avatars/beast/bachongshenzi.png',
    'qianshou': '/static/avatars/ghost/qianshou.png',
    'yixienamei': '/static/avatars/ghost/yixienamei.png',
    'yixienamei_virtual': '/static/avatars/ghost/yixienamei.png',
    'keqing': '/static/avatars/god/keqing.png',
    'xueyue': '/static/avatars/god/xueyue.jpg',
    'tianshe': '/static/avatars/beast/tianshe.jpg',
  }
  return avatarPathMap[charId] || FACTION_CONFIG[faction as keyof typeof FACTION_CONFIG].icon
}

/**
 * 为战斗日志文本添加属性颜色。
 * 遍历所有角色名和技能名，将【角色名】与【技能名】替换为
 * 对应角色属性颜色的 HTML span，供 rich-text 组件使用。
 */
export function colorizeBattleLogText(text: string): string {
  if (!text) return text

  // 角色名 -> 颜色
  const charColorMap: Record<string, string> = {}
  for (const c of [...INITIAL_CHARACTERS, ...HIREABLE_CHARACTERS]) {
    if (c.name && c.attribute) {
      charColorMap[c.name] = ATTRIBUTE_CONFIG[c.attribute].color
    }
  }

  // 技能名 -> 颜色（直接从 SKILL_TEMPLATES 的 attribute 字段获取）
  const skillColorMap: Record<string, string> = {}
  for (const key in SKILL_TEMPLATES) {
    const t = SKILL_TEMPLATES[key]
    if (t && t.name) {
      const attr = t.attribute || 'normal'
      skillColorMap[t.name] = ATTRIBUTE_CONFIG[attr].color
    }
  }

  // 按名称长度从长到短排序，避免短名优先替换导致长名匹配不上
  const charNames = Object.keys(charColorMap).sort((a, b) => b.length - a.length)
  const skillNames = Object.keys(skillColorMap).sort((a, b) => b.length - a.length)

  // 先处理技能（如果技能中含角色名，优先技能替换也没问题）
  let result = text
  for (const name of skillNames) {
    const safe = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    result = result.replace(
      new RegExp(`【${safe}】`, 'g'),
      `<span style="color:${skillColorMap[name]}">【${name}】</span>`
    )
  }
  for (const name of charNames) {
    const safe = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    result = result.replace(
      new RegExp(`【${safe}】`, 'g'),
      `<span style="color:${charColorMap[name]}">【${name}】</span>`
    )
  }
  return result
}

export function createCharacterFromTemplate(template: Omit<Character, 'equipment' | 'avatar' | 'isPlayerOwned' | 'hp' | 'mp' | 'maxLevel'>): Character {
  return {
    ...template,
    maxLevel: 5,  // 初始等级上限为5级
    equipment: createEmptyEquipment(),
    avatar: getAvatarPath(template.id, template.faction),
    isPlayerOwned: true,
    hp: template.maxHp,
    mp: template.maxMp,
  }
}