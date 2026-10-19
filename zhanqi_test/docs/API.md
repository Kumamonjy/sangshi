# 养成战棋游戏 - API文档

## 文档说明

本文档详细描述了养成战棋游戏的API接口、数据结构和核心函数。

**参考文档：**
- [README.md](../README.md) - 项目说明文档
- [养成战棋游戏需求文档.txt](./养成战棋游戏需求文档.txt) - 原始需求文档（包含最初的游戏设计要求）
- [MODULES.md](./MODULES.md) - 模块说明文档
- [TECHNICAL_GUIDE.md](./TECHNICAL_GUIDE.md) - 技术指南
- [ERD.md](./ERD.md) - 实体关系图

---

## 目录

1. [数据结构定义](#数据结构定义)
   - [Unit（单位）](#unit-单位)
   - [GameSettings（游戏设置）](#gamesettings-游戏设置)
   - [BattleState（战斗状态）](#battlestate-战斗状态)

2. [工具函数](#工具函数)
   - [单位创建](#单位创建)
   - [地图与路径](#地图与路径)
   - [战斗计算](#战斗计算)

3. [状态管理API](#状态管理api)
   - [游戏控制](#游戏控制)
   - [战斗操作](#战斗操作)
   - [角色管理](#角色管理)

---

## 数据结构定义

### Unit（单位）

```typescript
interface Unit {
  id: string                    // 单位唯一标识
  name: string                  // 名称
  classType: 'warrior' | 'knight' | 'archer' | 'mage' | 'witch' | 'assassin' | 'architect'  // 职业类型
  isHero: boolean               // 是否为主角（可养成）
  isAI: boolean                 // 是否为AI控制
  isEnemy: boolean              // 是否为敌方
  level: number                 // 等级
  exp: number                   // 当前经验
  statPoints: number            // 属性点（用于自定义分配）
  usedStatPoints: number        // 已使用属性点
  maxHp: number                 // 最大生命值
  hp: number                    // 当前生命值
  attack: number                // 攻击力
  defense: number               // 防御力
  moveRange: number             // 移动范围
  attackRange: number           // 攻击范围
  skill: {
    name: string                // 技能名称
    description: string         // 技能描述
    cooldown: number            // 冷却回合数
    currentCooldown: number     // 当前冷却剩余
  }
  position: { row: number; col: number }  // 当前位置
  isDefending: boolean          // 是否处于防御状态
  hasActed: boolean             // 本回合是否已行动
  hasMoved: boolean             // 本回合是否已移动
  hasAttacked: boolean          // 本回合是否已攻击
  defenseBuffDuration: number   // 防御buff剩余回合数
}
```

### GameSettings（游戏设置）

```typescript
interface GameSettings {
  enemyCount: number            // 敌方初始数量（3-10）
  allyAiCount: number           // 己方AI数量（0-7）
  enemyAiMinLevel: number       // 敌方最低等级
  enemyAiMaxLevel: number       // 敌方最高等级
  allyAiMinLevel: number        // 己方AI最低等级
  allyAiMaxLevel: number        // 己方AI最高等级
}
```

### BattleState（战斗状态）

```typescript
interface BattleState {
  units: Unit[]                 // 所有战斗单位
  currentTurn: 'player' | 'enemy'  // 当前回合方
  selectedUnit: Unit | null     // 当前选中单位
  turnNumber: number            // 当前回合数
  speed: 1 | 2 | 3             // 战斗速度
  playerUnitsActed: number      // 本回合已行动玩家单位数
  totalPlayerUnits: number      // 玩家单位总数
  gameResult: 'victory' | 'defeat' | null  // 游戏结果
  aiJoinPending: boolean        // 是否有AI待加入
  pendingAiSide: 'ally' | 'enemy' | null   // 待加入AI阵营
  pendingAiClass: string | null // 待加入AI职业
  moveMode: boolean             // 是否处于移动模式
  attackMode: boolean           // 是否处于攻击模式
  skillMode: boolean            // 是否处于技能模式
  skillTargets: { row: number; col: number }[]  // 技能可释放位置
  summonCount: number           // 当前召唤数量
  maxSummons: number            // 最大召唤数量
  weather: WeatherType          // 天气类型
  snowAreas: { row: number; col: number }[]  // 雪地区域
  thunderAreas: { row: number; col: number }[]  // 雷电区域
  obstacles: { row: number; col: number }[]  // 障碍物位置
  healingGrass: { row: number; col: number }[]  // 草药位置
}

type WeatherType =
  | 'normal'
  | 'light_snow'
  | 'moderate_snow'
  | 'heavy_snow'
  | 'light_thunder'
  | 'moderate_thunder'
  | 'heavy_thunder'
```

---

## 工具函数

### 单位创建

#### createUnit(config)
创建一个游戏单位

**参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| name | string | 单位名称 |
| classType | string | 职业类型 |
| isHero | boolean (可选) | 是否为主角，默认false |
| isAI | boolean (可选) | 是否为AI，默认false |
| isEnemy | boolean (可选) | 是否为敌方，默认false |
| level | number (可选) | 等级，默认1 |
| exp | number (可选) | 经验值，默认0 |
| position | {row, col} (可选) | 初始位置，默认{0,0} |

**返回值**: Unit对象

---

#### createInitialHeroes()
创建初始的3个主角

**返回值**: Unit[] - 包含战士、弓箭手、法师各一名

---

#### createEnemyUnit(classType, position)
创建敌方单位

**参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| classType | string | 职业类型 |
| position | {row, col} | 生成位置 |

**返回值**: Unit对象

---

#### createAllyAI(classType, position)
创建己方AI单位

**参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| classType | string | 职业类型 |
| position | {row, col} | 生成位置 |

**返回值**: Unit对象

---

### 地图与路径

#### isObstacle(row, col)
判断指定位置是否有障碍物

**参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| row | number | 行坐标 |
| col | number | 列坐标 |

**返回值**: boolean

---

#### generateRandomObstacles()
生成随机障碍物（8-12个），确保地图连通

**返回值**: {row: number; col: number}[]

---

#### setObstacles(obstacles)
设置当前障碍物列表

**参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| obstacles | {row, col}[] | 障碍物位置数组 |

---

#### removeObstacle(row, col)
移除指定位置的障碍物

**参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| row | number | 行坐标 |
| col | number | 列坐标 |

**返回值**: boolean - 是否成功移除

---

#### getAvailablePositions(units, unit, moveRange, thunderAreas?)
获取单位可移动的所有位置（BFS算法），会优先选择非雷电位置

**参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| units | Unit[] | 所有单位列表 |
| unit | Unit | 当前单位 |
| moveRange | number | 移动范围 |
| thunderAreas | {row, col}[] | 雷电区域位置（可选） |

**返回值**: {row: number; col: number; distance: number}[]
排序规则：
  1. 非雷电位置优先
  2. 距离目标近优先

---

#### getAttackablePositions(units, unit)
获取单位可攻击的所有位置及目标

**参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| units | Unit[] | 所有单位列表 |
| unit | Unit | 当前单位 |

**返回值**: {row: number; col: number; target: Unit}[]

---

#### getSkillRangePositions(unit, units)
获取技能可释放的位置范围

**参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| unit | Unit | 当前单位 |
| units | Unit[] | 所有单位列表 |

**返回值**: {row: number; col: number}[]

---

### 战斗计算

#### calculateDamage(attacker, defender)
计算伤害值

**参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| attacker | Unit | 攻击者 |
| defender | Unit | 防御者 |

**返回值**: number - 伤害值（最低1）

---

#### useSkill(unit, targetPos, allUnits, skillTargets?)
释放技能并计算效果

**参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| unit | Unit | 释放技能的单位 |
| targetPos | {row, col} | 技能目标位置 |
| allUnits | Unit[] | 所有单位列表 |
| skillTargets | {row, col}[] (可选) | 建筑师技能的目标位置列表 |

**返回值**:
```typescript
{
  damage: { target: Unit; damage: number; killed: boolean }[]  // 伤害结果
  healing: { target: Unit; amount: number }[]                  // 治疗结果
  positionChange: { row: number; col: number } | null          // 位置变化（骑士/刺客）
  removedObstacles: { row: number; col: number }[]            // 建筑师清除的障碍物
  addedObstacles: { row: number; col: number }[]              // 建筑师生成的障碍物
}
```

---

#### getDistance(pos1, pos2)
计算两点间曼哈顿距离

**参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| pos1 | {row, col} | 位置1 |
| pos2 | {row, col} | 位置2 |

**返回值**: number

---

### 经验与升级

#### getExpForLevel(level)
获取升级所需经验

**参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| level | number | 当前等级 |

**返回值**: number

---

#### getLevelUpStats(heroClass, currentLevel)
获取升级时的属性提升

**参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| heroClass | string | 职业类型 |
| currentLevel | number | 当前等级（升级前） |

**返回值**:
```typescript
{
  hp: number,      // 生命值提升
  attack: number,  // 攻击力提升
  defense: number  // 防御力提升
}
```

---

## 状态管理API

### 游戏控制

#### startBattle()
开始战斗，初始化战场

**说明**: 使用选中的角色开始战斗，生成随机障碍物和敌方单位

---

#### endPlayerTurn()
结束玩家回合，切换到敌方回合

---

#### clearBattle()
清除战斗状态

---

#### resetGame()
重置整个游戏（金币、角色、设置）

---

### 战斗操作

#### selectUnit(unitId)
选中指定单位

**参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| unitId | string | 单位ID |

---

#### deselectUnit()
取消选中单位

---

#### moveUnit(unitId, row, col)
移动单位到指定位置

**参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| unitId | string | 单位ID |
| row | number | 目标行 |
| col | number | 目标列 |

---

#### attackTarget(targetId)
攻击目标单位

**参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| targetId | string | 目标单位ID |

---

#### attackObstacle(row, col)
攻击障碍物（战士/骑士专用）

**参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| row | number | 障碍物行 |
| col | number | 障碍物列 |

---

#### useSkillTarget(targetPos)
向指定位置释放技能或选择技能目标位置（建筑师）

**参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| targetPos | {row, col} | 技能目标位置 |

---

#### confirmArchitectSkill()
确认建筑师技能的多目标选择并执行

**说明**: 处理建筑师选择的最多3个目标位置，执行清除/生成障碍物

---

#### defend()
选中单位进入防御状态

---

#### setAttackMode(enabled)
设置攻击模式

**参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| enabled | boolean | 是否开启攻击模式 |

---

#### setSkillMode(enabled)
设置技能模式

**参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| enabled | boolean | 是否开启技能模式 |

---

#### setSpeed(speed)
设置战斗速度

**参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| speed | 1 | 2 | 3 | 速度倍率 |

---

### 角色管理

#### hireHero()
雇佣新角色（消耗100金币）

**返回值**:
```typescript
{
  success: boolean,  // 是否成功
  message: string,   // 提示信息
  hero?: Unit        // 新角色（成功时）
}
```

---

#### fireHero(heroId)
解雇角色（获得50金币）

**参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| heroId | string | 角色ID |

**返回值**:
```typescript
{
  success: boolean,  // 是否成功
  message: string    // 提示信息
}
```

---

#### renameHero(heroId, newName)
重命名角色

**参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| heroId | string | 角色ID |
| newName | string | 新名称 |

**返回值**:
```typescript
{
  success: boolean,  // 是否成功
  message: string    // 提示信息
}
```

---

#### changeHeroClass(heroIndex, newClass)
改变角色职业

**参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| heroIndex | number | 角色索引（在heroes数组中） |
| newClass | 'warrior' | 'knight' | 'archer' | 'mage' | 'witch' | 新职业 |

---

#### toggleBattleUnitSelection(unitId)
切换角色的参战选择状态

**参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| unitId | string | 角色ID |

---

#### clearBattleSelection()
清空参战角色选择

---

### 存档系统

#### 核心常量
- `SAVE_VERSION`: 当前存档版本号（值为2）

#### migrateSaveData(data)
数据迁移函数，将旧版本存档数据迁移到新版本

**参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| data | any | 原始存档数据 |

**返回值**: any - 迁移后的存档数据

**迁移逻辑**:
- 版本 < 1: 添加默认值（heroes、gold、settings）
- 版本 < 2: 确保所有英雄有完整属性

---

#### saveGame(saveName?)
保存游戏到可用存档槽位

**参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| saveName | string (可选) | 存档名称 |

**返回值**:
```typescript
{
  success: boolean,           // 是否成功
  needDeleteOldest?: boolean, // 是否需要删除最旧存档
  oldestSlotIndex?: number    // 最旧存档槽位索引
}
```

**说明**:
- 自动保存到gameSave_backup备份
- 查找可用槽位，优先使用空槽
- 所有槽位满时返回需要删除的最旧存档

---

#### saveGameOverwrite(saveName, slotIndex)
覆盖指定存档槽位

**参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| saveName | string | 存档名称 |
| slotIndex | number | 槽位索引（0-2） |

**返回值**: boolean - 是否成功

**说明**:
- 自动保存到gameSave_backup备份
- 直接覆盖指定槽位

---

#### loadGame(slotIndex)
加载游戏存档

**参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| slotIndex | number (可选) | 槽位索引（0-2），默认0 |

**返回值**: boolean - 是否成功

**加载流程**:
1. 尝试从指定槽位读取
2. 失败时尝试从gameSave_backup读取
3. 调用migrateSaveData进行数据迁移
4. 验证数据完整性
5. 加载数据到游戏状态
6. 更新gameSave_backup备份

---

### 设置管理

#### updateSettings(newSettings)
更新游戏设置

**参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| newSettings | Partial\<GameSettings\> | 设置对象（部分字段） |

---

### 资源管理

#### addGold(amount)
增加金币

**参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| amount | number | 增加数量 |

---

#### deductGold(amount)
扣除金币

**参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| amount | number | 扣除数量 |

---

## 天气系统函数

### updateWeather()
更新天气，随机生成不同类型的天气效果

**说明**：
- 20% 晴天
- 10% 小雪（1个3×3区域）
- 20% 中雪（2个3×3区域）
- 10% 大雪（3个3×3区域）
- 10% 小雷雨（6个1×1区域）
- 20% 中雷雨（3个2×2区域）
- 10% 大雷雨（5个2×2区域）

---

### isInSnowArea(row, col)
检查位置是否在雪地区域

**参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| row | number | 行坐标 |
| col | number | 列坐标 |

**返回值**: boolean

---

### isInThunderArea(row, col)
检查位置是否在雷电区域

**参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| row | number | 行坐标 |
| col | number | 列坐标 |

**返回值**: boolean

---

### applyThunderDamage()
应用雷电伤害（每回合结束时调用）

**说明**：
- 对所有处于雷电区域且生命值>0的单位造成50%最大生命值伤害
- 显示伤害字幕
- 添加战斗日志记录

---

## 数据流说明

### 战斗流程

```
选择角色 → startBattle() → 初始化战场 → 玩家回合
        ↓
    选择单位 → 移动/攻击/技能 → endPlayerTurn()
        ↓
    敌方AI回合 → executeEnemyTurn() → 自动操作所有敌方
        ↓
    回合结束 → endEnemyTurn() → 检查胜负 → 下一轮玩家回合
```

### 状态变化

| 操作 | 状态变化 |
|------|----------|
| selectUnit | selectedUnit, moveMode |
| moveUnit | unit.position, hasMoved |
| attackTarget | target.hp, attacker.hasAttacked |
| useSkill | unit.skill.currentCooldown, targets.hp |
| defend | unit.isDefending |
| endPlayerTurn | currentTurn → 'enemy', 技能冷却-1 |
| endEnemyTurn | currentTurn → 'player', turnNumber++, 重置hasActed |

---

## 游戏规则说明

### 金币奖励规则

胜利时获得金币计算公式：
```
金币 = 50 + 5 × 击杀敌人数量
```

### AI行动时间间隔

- 基础间隔：660ms
- 1x速度：660ms
- 2x速度：330ms
- 3x速度：220ms

友方AI和敌方AI都有相同的时间间隔。

### 角色位置限制

任何角色都不能移动到其他角色已占据的位置。AI决策时会检查目标位置是否被占据。

### 天气系统规则

| 天气类型 | 效果 |
|----------|------|
| 晴天 | 无特殊效果 |
| 小雪/中雪/大雪 | 雪地中的角色无法移动 |
| 小雷雨/中雷雨/大雷雨 | 雷电格子中的角色每回合结束受到50%最大生命值伤害，AI会优先躲避雷电格子 |

### 雷电格子AI策略

- 若当前在雷电区域，优先寻找非雷电格子移动
- 可移动位置排序：非雷电位置 > 距离目标近
- 若无法移动到非雷电格子，则在原地执行攻击/技能/防御

### 血条显示规则

- 敌方单位：红色血条
- 我方单位：绿色血条
- 已移除：血量低于30%时的红色警告

### 经验分配规则

- 只有参战角色获得经验
- 参战角色由selectedBattleUnits决定

### 角色属性计算规则

- 使用等级增长计算，而非乘法
- 从2级开始，每级使用getLevelUpStats获得属性增长

---

## 职业技能说明

| 职业 | 初始攻击 | 初始生命 | 初始防御 | 移动力 | 技能名称 | 效果 | 冷却 |
|------|----------|----------|----------|--------|----------|------|------|
| 战士 | 65 | 220 | 25 | 3 | 防御姿态 | 本回合+下回合防御+5 | 2回合 |
| 骑士 | 65 | 200 | 15 | 4 | 冲锋 | 直线移动，路径敌人受普攻伤害 | 3回合 |
| 弓箭手 | 40 | 160 | 10 | 3 | 远程射击 | 单体伤害×1.3，射程4格 | 2回合 |
| 法师 | 55 | 140 | 8 | 2 | 范围爆破 | 3×3范围伤害（仅敌方） | 3回合 |
| 巫师 | 35 | 150 | 12 | 2 | 治愈术 | 单体恢复（攻击力×2），射程3格 | 3回合 |
| 刺客 | 50 | 150 | 10 | 3 | 瞬杀 | 瞬移到5格范围内，攻击相邻4个方向敌人×1.3 | 2回合 |
| 建筑师 | 50 | 180 | 15 | 3 | 大兴土木 | 相邻4格内，最多3个无角色格子，有障碍物清除，无则生成 | 3回合 |

---

## 视觉提示规则

| 状态 | 视觉表现 |
|------|----------|
| 选中单位 | 绿色边框高亮 |
| 可移动范围 | 蓝色半透明格子 |
| 可攻击范围 | 红色半透明格子 |
| 技能范围 | 紫色半透明格子 |
| 主角标识 | 黄色边框 + ★标记 |
| AI标识 | 黄色边框 |
| 防御状态 | 防御图标 |
| 技能冷却 | 灰色按钮 + 冷却数字 |
| 敌方血条 | 红色 |
| 我方血条 | 绿色 |