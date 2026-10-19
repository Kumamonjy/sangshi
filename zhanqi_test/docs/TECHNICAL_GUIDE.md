# 养成战棋游戏 - 技术文档

## 文档信息

- 项目名称：养成战棋
- 版本：1.6.0
- 最后更新：2026-05-17
- 文档目的：帮助接手者快速理解和复现项目

## 参考文档

- [README.md](../README.md) - 项目说明文档
- [养成战棋游戏需求文档.txt](./养成战棋游戏需求文档.txt) - 原始需求文档（包含最初的游戏设计要求）
- [API.md](./API.md) - API说明文档
- [MODULES.md](./MODULES.md) - 模块说明文档
- [ERD.md](./ERD.md) - 实体关系图

---

## 1. 项目概述

### 1.1 项目定位

养成战棋是一款基于 **uni-app + Vue3** 开发的回合制策略游戏，玩家可以培养主角团队，在12×11的网格地图上进行战斗，通过策略性的移动、攻击和技能释放来击败敌人。

### 1.2 核心功能

1. **回合制战斗系统**
   - 12×11网格地图
   - 移动、攻击、技能、防御四种操作模式
   - 支持1x/2x/3x战斗加速
   - 实时字幕显示

2. **天气系统**
   - 7种天气类型（晴天、小雪、中雪、大雪、小雷雨、中雷雨、大雷雨）
   - 雪地：角色无法移动
   - 雷电：处于雷电格子的角色每回合受到50%最大生命值伤害
   - AI智能躲避雷电格子

3. **战斗日志系统**
   - 按回合记录战斗过程
   - 可查看历史战斗记录

4. **职业系统**
   - 战士、骑士、弓箭手、法师、巫师、刺客、建筑师
   - 各职业有独特的技能和属性

5. **养成系统**
   - 主角经验和等级
   - 天赋点分配
   - 角色雇佣/解雇
   - 职业切换

6. **存档系统**
   - 多存档槽位（最多3个）
   - 存档命名和时间记录

### 1.3 技术栈

| 分类 | 技术 | 版本 |
|------|------|------|
| 框架 | uni-app (Vue3) | 3.0.0-4010520240507001 |
| 状态管理 | Pinia | ^2.1.7 |
| 语言 | TypeScript | ^5.4.5 |
| 样式 | SCSS | ^1.72.0 |
| 构建工具 | Vite | ^5.2.8 |

---

## 2. 开发环境搭建

### 2.1 环境要求

- **Node.js**: >= 16.0.0
- **HBuilderX**: 推荐用于uni-app开发和App打包
- **操作系统**: Windows / macOS / Linux

### 2.2 安装步骤

1. 克隆或下载项目代码
2. 进入项目目录：
```bash
cd zhanqi_test
```

3. 安装依赖：
```bash
npm install
```

### 2.3 开发运行命令

#### H5开发
```bash
npm run dev:h5
```
访问：http://localhost:5173/

#### 微信小程序开发
```bash
npm run dev:mp-weixin
```
然后在微信开发者工具中打开 `dist/dev/mp-weixin` 目录

#### App开发
```bash
npm run dev:app-plus
```
配合HBuilderX，选择运行到模拟器/真机

### 2.4 构建命令

#### 构建H5
```bash
npm run build:h5
```
输出目录：`dist/build/h5`

#### 构建微信小程序
```bash
npm run build:mp-weixin
```
输出目录：`dist/build/mp-weixin`

#### 构建App
```bash
npm run build:app-plus
```
配合HBuilderX，选择发行

---

## 3. 项目架构

### 3.1 目录结构

```
zhanqi_test/
├── src/                          # 源代码目录
│   ├── pages/                    # 页面目录
│   │   ├── start/start.vue      # 开始界面
│   │   ├── index/index.vue      # 主界面
│   │   ├── character/character.vue # 角色信息界面
│   │   ├── hire/hire.vue        # 雇佣/解雇界面
│   │   ├── select/select.vue    # 战前角色选择界面
│   │   └── battle/battle.vue    # 战斗界面
│   ├── stores/                   # Pinia状态管理
│   │   └── gameStore.ts         # 游戏核心状态管理
│   ├── utils/                    # 工具函数和数据定义
│   │   └── gameData.ts         # 游戏数据、算法、配置
│   ├── static/                  # 静态资源
│   │   ├── hero_1.png          # 主角1头像
│   │   ├── hero_2.png          # 主角2头像
│   │   └── hero_3.png          # 主角3头像
│   ├── App.vue                  # 应用根组件
│   ├── main.ts                  # 入口文件
│   ├── manifest.json            # 应用配置
│   └── pages.json              # 路由配置
├── docs/                        # 文档目录
│   ├── TECHNICAL_GUIDE.md      # 本文档
│   ├── MODULES.md              # 模块说明
│   └── API.md                  # API说明
├── dist/                        # 编译输出目录
├── package.json                # 项目依赖和脚本
├── package-lock.json          # 依赖锁定文件
├── tsconfig.json              # TypeScript配置
├── vite.config.ts             # Vite配置
├── uni.scss                   # uni-app全局样式
└── README.md                  # 项目说明
```

### 3.2 核心文件说明

| 文件 | 职责 |
|------|------|
| `src/main.ts` | 应用入口，初始化Pinia |
| `src/App.vue` | 根组件，应用全局样式和逻辑 |
| `src/pages.json` | 页面路由配置 |
| `src/manifest.json` | 应用基本配置（名称、图标、权限等） |
| `src/stores/gameStore.ts` | 全局状态管理，包含所有游戏逻辑 |
| `src/utils/gameData.ts` | 游戏数据结构、常量、算法 |
| `vite.config.ts` | Vite构建配置 |
| `tsconfig.json` | TypeScript编译配置 |

### 3.3 页面路由

根据 `pages.json`，页面路由如下：

| 路径 | 页面名称 | 说明 |
|------|----------|------|
| `pages/start/start` | 开始界面 | 全新游戏/载入存档 |
| `pages/index/index` | 主界面 | 导航、设置、保存 |
| `pages/character/character` | 角色信息 | 查看/修改角色属性 |
| `pages/hire/hire` | 雇佣/解雇 | 角色管理 |
| `pages/select/select` | 战前选择 | 选择参战角色 |
| `pages/battle/battle` | 战斗界面 | 核心战斗 |

### 3.4 状态管理架构

项目使用 **Pinia** 进行状态管理，核心 store 是 `gameStore.ts`。

主要状态：

```typescript
// 游戏基本状态
gold: number                    // 金币
heroes: Unit[]                  // 英雄列表
selectedBattleUnits: string[]  // 选中的参战角色
settings: GameSettings         // 游戏设置
battle: BattleState            // 战斗状态
battleLog: BattleLogEntry[]    // 战斗日志
```

---

## 4. 核心模块技术说明

### 4.1 战斗系统

#### 4.1.1 战斗状态（BattleState）

定义位置：`src/utils/gameData.ts`

```typescript
interface BattleState {
  units: Unit[]                            // 战斗单位
  currentTurn: 'player' | 'enemy'          // 当前回合
  selectedUnit: Unit | null               // 选中的单位
  turnNumber: number                       // 回合数
  speed: 1 | 2 | 3                         // 战斗速度
  playerUnitsActed: number                // 已行动的玩家单位数
  totalPlayerUnits: number                // 总玩家单位数
  gameResult: 'victory' | 'defeat' | null // 游戏结果
  aiJoinPending: boolean                  // AI加入等待
  pendingAiSide: 'ally' | 'enemy' | null  // 待加入AI阵营
  pendingAiClass: string | null           // 待加入AI职业
  moveMode: boolean                        // 移动模式
  attackMode: boolean                      // 攻击模式
  skillMode: boolean                       // 技能模式
  skillTargets: { row: number; col: number }[] // 技能目标位置
  summonCount: number                      // 已召唤次数
  maxSummons: number                       // 最大召唤次数
  healingGrass: { row: number; col: number }[] // 回血草位置
  weather: WeatherType                    // 天气状态
  snowAreas: { row: number; col: number }[] // 雪地区域
  thunderAreas: { row: number; col: number }[] // 雷电区域
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

#### 4.1.2 战斗流程

1. **开始战斗** (`startBattle`)
   - 初始化地图和障碍物
   - 放置玩家单位和敌方单位
   - 初始化天气
   - 重置所有状态

2. **玩家回合**
   - 选择未行动的玩家单位
   - 选择操作（移动/攻击/技能/防御）
   - 执行操作
   - 标记单位已行动
   - 点击"结束回合"

3. **敌方回合** (`executeEnemyTurn`)
   - AI自动决策
   - 每个敌方单位依次行动
   - 血量<30%优先防御
   - 技能冷却结束优先释放技能
   - 否则移动并攻击

4. **天气更新** (`updateWeather`)
   - 每回合开始时50%概率下雪
   - 下雪时生成2个3×3雪地区域
   - 检查角色是否在雪地中

5. **胜负判定**
   - 敌方单位全灭：胜利
   - 玩家单位全灭：失败

#### 4.1.3 关键算法

**可移动位置计算** (`getAvailablePositions`)
- BFS算法
- 计算单位移动范围内的所有可到达格子
- 避开障碍物和其他单位

**可攻击位置计算** (`getAttackablePositions`)
- 计算单位攻击范围内的所有敌人
- 检查距离是否在攻击范围内

**技能效果** (`useSkill`)
- 根据职业执行不同的技能效果
- 骑士：冲锋（直线移动+路径伤害）
- 法师：3×3范围伤害
- 弓箭手：单体高伤害
- 战士：防御强化
- 巫师：治疗
- 刺客：瞬移攻击
- 建筑师：大兴土木（相邻4格范围内，最多选择3个无角色的格子，有障碍物则清除，无障碍物则生成，冷却3回合）

### 4.2 天气系统

#### 4.2.1 天气类型与概率

| 天气类型 | 概率 | 区域配置 | 效果 |
|----------|------|----------|------|
| Normal | 20% | 无 | 无特殊效果 |
| Light Snow | 10% | 1个3×3区域 | 雪地角色无法移动 |
| Moderate Snow | 20% | 2个3×3区域 | 雪地角色无法移动 |
| Heavy Snow | 10% | 3个3×3区域 | 雪地角色无法移动 |
| Light Thunder | 10% | 6个1×1区域 | 雷电区域角色受到50%最大生命值伤害（每回合结束） |
| Moderate Thunder | 20% | 3个2×2区域 | 雷电区域角色受到50%最大生命值伤害（每回合结束） |
| Heavy Thunder | 10% | 5个2×2区域 | 雷电区域角色受到50%最大生命值伤害（每回合结束） |

#### 4.2.2 核心逻辑

定义位置：`src/stores/gameStore.ts`

**雪地系统**：
```typescript
// 生成雪地区域
function generateSnowAreas(areaCount: number): { row: number; col: number }[] {
  // 生成指定数量的3×3区域
  // 避开障碍物
  // 避免区域重叠
}

// 检查位置是否在雪地中
function isInSnowArea(row: number, col: number): boolean {
  return battle.value.snowAreas.some(s => s.row === row && s.col === col)
}
```

**雷雨系统**：
```typescript
// 生成雷电区域
function generateThunderAreas(weatherType: WeatherType): { row: number; col: number }[] {
  // 根据天气类型生成相应的雷电区域
  // 小雷雨：6个1×1区域
  // 中雷雨：3个2×2区域
  // 大雷雨：5个2×2区域
  // 避开障碍物
}

// 检查位置是否在雷电区域中
function isInThunderArea(row: number, col: number): boolean {
  return battle.value.thunderAreas.some(t => t.row === row && t.col === col)
}

// 应用雷电伤害（每回合结束时）
function applyThunderDamage() {
  battle.value.units.forEach((unit, index) => {
    if (isInThunderArea(unit.position.row, unit.position.col) && unit.hp > 0) {
      const damage = Math.floor(unit.maxHp * 0.5)
      unit.hp = Math.max(0, unit.hp - damage)
      
      const side = unit.isEnemy ? '敌方' : '我方'
      const subtitle = `⚡ ${side}【${unit.name}】被雷电击中！受到 ${damage} 点伤害！`
      showSubtitle(subtitle)
      addBattleLog(subtitle)
      
      battle.value.units[index] = { ...unit }
    }
  })
}
```

**天气更新**：
```typescript
// 更新天气
function updateWeather() {
  const rand = Math.random()
  let weatherType: WeatherType = 'normal'
  let snowAreas: { row: number; col: number }[] = []
  let thunderAreas: { row: number; col: number }[] = []

  if (rand < 0.1) {
    weatherType = 'light_snow'
    snowAreas = generateSnowAreas(1)
  } else if (rand < 0.3) {
    weatherType = 'moderate_snow'
    snowAreas = generateSnowAreas(2)
  } else if (rand < 0.4) {
    weatherType = 'heavy_snow'
    snowAreas = generateSnowAreas(3)
  } else if (rand < 0.5) {
    weatherType = 'light_thunder'
    thunderAreas = generateThunderAreas('light_thunder')
  } else if (rand < 0.7) {
    weatherType = 'moderate_thunder'
    thunderAreas = generateThunderAreas('moderate_thunder')
  } else if (rand < 0.8) {
    weatherType = 'heavy_thunder'
    thunderAreas = generateThunderAreas('heavy_thunder')
  }

  battle.value.weather = weatherType
  battle.value.snowAreas = snowAreas
  battle.value.thunderAreas = thunderAreas
  
  // 显示天气提示
  const weatherNames: Record<WeatherType, string> = {
    normal: '☀️ 天气晴朗',
    light_snow: '❄️ 小雪飘飘',
    moderate_snow: '❄️❄️ 中雪纷纷',
    heavy_snow: '❄️❄️❄️ 大雪纷飞',
    light_thunder: '⚡ 电闪雷鸣（小）',
    moderate_thunder: '⚡⚡ 电闪雷鸣（中）',
    heavy_thunder: '⚡⚡⚡ 电闪雷鸣（大）'
  }
  showSubtitle(weatherNames[weatherType])
  addBattleLog(weatherNames[weatherType])
}
```

#### 4.2.3 移动限制与AI策略

- **玩家角色**：
  - 在 `battle.vue` 中检查，若在雪地则清空 `movablePositions`
  - 移动范围计算时避开雷电格子
  - 移动按钮：在雪地中时按钮置灰（disabled）

- **AI角色**：
  - 在雪地中不执行移动
  - AI决策时优先考虑雷电格子
  - 若当前在雷电区域，优先寻找非雷电格子移动
  - 若无法移动到非雷电格子，则在原地执行攻击/技能/防御
  - 可移动位置排序：
    1. 非雷电位置优先
    2. 距离目标近优先

- **关键函数修改**：
  - `getAvailablePositions()`：增加 thunderAreas 参数，排序时优先非雷电位置
  - `evaluateMoveAttackDamage()`：考虑雷电格子
  - `evaluateMoveSkillDamage()`：考虑雷电格子
  - `findClosestEnemyPosition()`：考虑雷电格子

### 4.3 战斗日志系统

#### 4.3.1 数据结构

```typescript
interface BattleLogEntry {
  turn: number              // 回合数
  messages: string[]        // 该回合的消息列表
}
```

#### 4.3.2 添加日志

```typescript
function addBattleLog(message: string) {
  const currentTurn = battle.value.turnNumber
  const existingTurn = battleLog.value.find(entry => entry.turn === currentTurn)
  
  if (existingTurn) {
    existingTurn.messages.push(message)
    // 触发响应式更新
    const index = battleLog.value.findIndex(entry => entry.turn === currentTurn)
    if (index !== -1) {
      battleLog.value[index] = { ...existingTurn }
    }
  } else {
    battleLog.value = [...battleLog.value, { turn: currentTurn, messages: [message] }]
  }
}
```

### 4.4 存档系统

#### 4.4.1 存储机制

使用 `uni.getStorageSync` 和 `uni.setStorageSync` 进行本地存储。

存档键名格式：
- `gameSave_0` - 存档槽0
- `gameSave_1` - 存档槽1
- `gameSave_2` - 存档槽2
- `gameSave_backup` - 备份存档（自动保存）

#### 4.4.2 存档内容

```typescript
{
  version: number            // 存档版本号（用于数据迁移）
  saveName: string           // 存档名称
  savedAt: string            // 保存时间（格式：yyyyMMddHHmmss）
  gold: number               // 金币
  heroes: Unit[]             // 英雄列表
  settings: GameSettings     // 游戏设置
}
```

#### 4.4.3 数据迁移机制

存档系统支持自动数据迁移，确保旧版本存档在新版本中正常加载：

```typescript
function migrateSaveData(data: any): any {
  if (!data.version || data.version < 1) {
    // 版本1迁移：添加默认值
  }
  if (data.version < 2) {
    // 版本2迁移：确保所有英雄有完整属性
  }
  return data
}
```

#### 4.4.4 备份机制

- 每次保存游戏时自动保存备份
- 加载失败时自动尝试从备份恢复
- 加载成功后自动更新备份

#### 4.4.5 核心函数

- `saveGame(saveName?)` - 保存游戏到可用槽位
- `saveGameOverwrite(saveName, slotIndex)` - 覆盖指定槽位
- `loadGame(slotIndex)` - 加载游戏（含自动备份恢复）
- `migrateSaveData(data)` - 数据迁移函数

#### 4.4.6 血条显示规则

- 敌方单位：红色血条
- 我方单位：绿色血条
- 已移除：血量低于30%时的红色警告

### 4.5 角色养成系统

#### 4.5.1 单位数据结构

```typescript
interface Unit {
  id: string
  name: string
  classType: string
  isHero: boolean
  isAI: boolean
  isEnemy: boolean
  level: number
  exp: number
  statPoints: number
  usedStatPoints: number
  maxHp: number
  hp: number
  attack: number
  defense: number
  moveRange: number
  attackRange: number
  skill: {
    name: string
    description: string
    cooldown: number
    currentCooldown: number
  }
  position: { row: number; col: number }
  isDefending: boolean
  hasActed: boolean
  hasMoved: boolean
  hasAttacked: boolean
  defenseBuffDuration: number
}
```

#### 4.5.2 职业配置

定义位置：`src/utils/gameData.ts`

每个职业有初始属性、成长属性、技能配置。

#### 4.5.3 升级机制

- 经验值 = 20 + 击杀敌人数 × 10
- 每级获得1个天赋点
- 天赋点可分配到：生命+30、攻击+10、防御+10

### 4.6 草药系统

#### 4.6.1 草药生成

- 所有攻击技能可以清除障碍物
- 清除障碍物时有30%概率在原地生成草药
- 草药位置会被记录在 `battle.healingGrass` 中

#### 4.6.2 草药使用

- 角色移动到草药位置会自动使用
- 恢复30%最大生命值
- 使用后草药会从地图上移除

### 4.7 金币系统

#### 4.7.1 胜利奖励

胜利时获得金币计算公式：
```
金币 = 50 + 5 × 击杀敌人数量
```

#### 4.7.2 金币用途

- 雇佣新角色：100金币
- 解雇角色：获得50金币

### 4.8 AI行动时间间隔

#### 4.8.1 时间控制

- 基础间隔：660ms
- 1x速度：660ms
- 2x速度：330ms
- 3x速度：220ms

#### 4.8.2 实现方式

使用 `setTimeout` 配合 `speed` 参数控制：
```typescript
await new Promise(resolve => setTimeout(resolve, 660 / speed))
```

友方AI和敌方AI都有相同的时间间隔，确保战斗过程清晰可见。

### 4.9 角色位置限制

#### 4.9.1 核心规则

任何角色都不能移动到其他角色已占据的位置。

#### 4.9.2 实现方式

在所有移动操作前检查：
```typescript
const occupied = battle.value.units.some(u => 
  u.id !== unit.id && 
  u.position.row === targetRow && 
  u.position.col === targetCol
)
if (!occupied) {
  // 执行移动
}
```

AI决策时也会进行相同的检查。

### 4.10 刺客技能修复

#### 4.10.1 问题描述

AI刺客使用技能后，虽然内部对象位置更新了，但响应式数组未更新，导致UI显示位置错误。

#### 4.10.2 解决方案

使用 `useSkill` 函数后，检查是否有位置变化，然后显式更新响应式数组：
```typescript
if (results.positionChange) {
  const unitIndex = battle.value.units.findIndex(u => u.id === unit.id)
  if (unitIndex !== -1) {
    battle.value.units[unitIndex] = { ...unit }
  }
}
```

### 4.11 弓箭手目标限制

#### 4.11.1 问题描述

AI弓箭手可能攻击多个目标。

#### 4.11.2 解决方案

在目标选择逻辑中添加 `foundTarget` 标志，找到第一个目标后立即停止搜索：
```typescript
let foundTarget = false
for (let row = 0; row < MAP_ROWS; row++) {
  if (foundTarget) break
  // 搜索逻辑
  if (target) {
    foundTarget = true
    break
  }
}
```

### 4.12 建筑师职业

#### 4.12.1 职业属性

- 初始生命值：180
- 初始攻击力：50
- 初始防御力：15
- 移动力：3
- 升级加成：生命值+35、攻击力+10、防御力+10

#### 4.12.2 技能：大兴土木

- 技能范围：相邻4格（上、下、左、右）
- 选择限制：最多3个格子，且不能有角色
- 技能效果：
  - 有障碍物：清除障碍物
  - 无障碍物：生成障碍物
- 冷却时间：3回合

#### 4.12.3 多目标选择实现

在 `gameStore.ts` 中新增 `confirmArchitectSkill` 函数处理多目标选择逻辑：
```typescript
function confirmArchitectSkill() {
  if (!battle.value.selectedUnit || battle.value.selectedUnit.classType !== 'architect') return
  const unit = battle.value.selectedUnit
  const results = useSkill(unit, null, battle.value.units, battle.value.skillTargets)
  
  // 处理清除/生成障碍物
  if (results.removedObstacles.length > 0 || results.addedObstacles.length > 0) {
    // 清除障碍物
    results.removedObstacles.forEach(({ row, col }) => {
      const index = battle.value.obstacles.findIndex(obs => obs.row === row && obs.col === col)
      if (index !== -1) {
        battle.value.obstacles.splice(index, 1)
      }
    })
    
    // 生成障碍物
    results.addedObstacles.forEach(({ row, col }) => {
      if (!battle.value.obstacles.some(obs => obs.row === row && obs.col === col)) {
        battle.value.obstacles.push({ row, col })
      }
    })
  }
  
  unit.skill.currentCooldown = unit.skill.cooldown
  unit.hasAttacked = true
  if (!unit.hasMoved) unit.hasActed = true
  
  battle.value.skillMode = false
  battle.value.skillTargets = []
}
```

#### 4.12.4 UI提示更新

在 `battle.vue` 中添加建筑师专属的技能提示和确认按钮：
```vue
<text v-if="battle.skillMode && battle.selectedUnit?.classType === 'architect'">
  选择最多3个格子（有障碍物清除，无则生成），已选择：{{ battle.skillTargets.length }}/3
</text>
<button v-if="battle.skillMode && battle.selectedUnit?.classType === 'architect'"
        class="confirm-btn"
        :disabled="battle.skillTargets.length === 0"
        @click="confirmArchitectSkill">
  确认
</button>
```

---

## 5. 关键配置文件详解

### 5.1 package.json

```json
{
  "name": "养成战棋",
  "version": "1.0.0",
  "scripts": {
    "dev:h5": "uni",              // H5开发
    "build:h5": "uni build",       // H5构建
    "dev:mp-weixin": "uni -p mp-weixin",  // 小程序开发
    "build:mp-weixin": "uni build -p mp-weixin", // 小程序构建
    "dev:app-plus": "uni -p app-plus",      // App开发
    "build:app-plus": "uni build -p app-plus" // App构建
  }
}
```

### 5.2 tsconfig.json

TypeScript配置，确保类型安全。

### 5.3 vite.config.ts

```typescript
import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

export default defineConfig({
  plugins: [uni()],
  resolve: {
    alias: {
      '@': '/src'  // 路径别名，@ 指向 src 目录
    }
  }
})
```

### 5.4 pages.json

页面路由和全局样式配置。

### 5.5 manifest.json

应用配置，包含：
- 应用名称
- 版本号
- 图标配置
- 权限配置
- 各平台特定配置

---

## 6. 部署流程

### 6.1 H5部署

1. 构建项目：
```bash
npm run build:h5
```

2. 部署 `dist/build/h5` 目录到任何静态文件服务器
3. 配置服务器（Nginx、Apache等）
4. 注意：uni-app H5版支持路由模式配置

### 6.2 微信小程序部署

1. 构建项目：
```bash
npm run build:mp-weixin
```

2. 在微信开发者工具中打开 `dist/build/mp-weixin`
3. 配置小程序AppID
4. 预览和调试
5. 上传代码
6. 在微信公众平台提交审核

### 6.3 App打包部署

1. 使用HBuilderX打开项目
2. 配置manifest.json（应用名称、图标、启动图等）
3. 选择"发行" -> "原生App-云打包"
4. 配置打包参数：
   - Android包名
   - iOS Bundle ID
   - 证书配置
5. 提交云打包
6. 下载APK/IPA文件
7. 分发安装

---

## 7. 开发规范与最佳实践

### 7.1 代码规范

- **语言**：使用TypeScript，确保类型安全
- **命名**：驼峰式命名
  - 组件：PascalCase（如 `BattlePage`）
  - 变量/函数：camelCase（如 `moveUnit`）
  - 常量：UPPER_SNAKE_CASE（如 `MAP_ROWS`）
- **文件**：kebab-case（如 `battle-page.vue`）

### 7.2 Git提交规范

建议使用以下格式：

```
<type>(<scope>): <subject>

<type>: feat(新功能) | fix(修复) | docs(文档) | style(格式) | refactor(重构) | test(测试) | chore(构建/工具)
```

示例：
```
feat(battle): 添加天气系统
fix(battle): 修复AI在雪地中仍可移动的bug
docs: 更新技术文档
```

### 7.3 调试技巧

1. 使用 `console.log` 在关键位置输出调试信息
2. H5端可直接使用浏览器DevTools
3. 小程序端使用微信开发者工具调试
4. App端使用HBuilderX的真机调试

### 7.4 性能优化建议

1. **虚拟滚动**：若角色列表增长很大，考虑使用虚拟滚动
2. **缓存计算**：缓存移动范围、攻击范围计算结果
3. **响应式优化**：避免不必要的响应式更新
4. **资源优化**：压缩图片资源

---

## 8. 常见问题与故障排除

### 8.1 依赖安装问题

**问题**：npm install 失败

**解决**：
1. 清除 npm 缓存：`npm cache clean --force`
2. 使用淘宝镜像：`npm config set registry https://registry.npmmirror.com`
3. 删除 `node_modules` 和 `package-lock.json`，重新安装

### 8.2 开发服务器无法启动

**问题**：npm run dev:h5 报错

**解决**：
1. 检查端口5173是否被占用
2. 删除 `node_modules/.vite` 缓存目录
3. 重新安装依赖

### 8.3 类型错误

**问题**：TypeScript 类型检查报错

**解决**：
1. 检查 `tsconfig.json` 配置
2. 确保所有类型定义正确
3. 运行 `npx tsc --noEmit` 进行类型检查

### 8.4 页面显示问题

**问题**：页面白屏或样式错乱

**解决**：
1. 检查 `pages.json` 中的页面路径是否正确
2. 检查是否有 CSS 语法错误
3. 清除浏览器缓存
4. 检查控制台是否有 JavaScript 错误

### 8.5 战斗AI问题

**问题**：AI不行动或行动异常

**解决**：
1. 检查 `executeEnemyTurn` 和 `executeAllyAIAction` 函数
2. 添加 console.log 调试AI决策过程
3. 检查单位状态（hasActed、hp等）

---

## 9. 版本更新历史

### v1.6.0 (2026-05-17)

新增功能：
- 存档版本号机制（SAVE_VERSION = 2）
- 自动数据迁移系统（migrateSaveData）
- 存档自动备份机制
- 存档加载失败时的自动备份恢复
- 骑士技能使用草药时的正确处理

优化：
- 血条显示规则：移除血量低于30%的红色警告
- 血条显示：敌方始终红色，我方始终绿色
- 存档数据完整性验证
- 经验分配：仅参战角色获得经验
- 角色属性计算：使用等级增长而非乘法
- 骑士技能使用后检查草药并自动使用

修复：
- 敌方等级2的AI属性计算错误
- 骑士技能使用后没有正确使用草药
- 非参战角色也会获得经验

### v1.5.0 (2026-05-15)

新增功能：
- 建筑师职业
  - 初始属性：生命值180、攻击力50、防御力15、移动力3
  - 升级加成：生命值+35、攻击力+10、防御力+10
  - 技能：大兴土木
  - 技能效果：相邻4格范围内，最多选择3个无角色的格子，有障碍物则清除，无障碍物则生成，冷却3回合
- 多目标技能选择机制
- 建筑师专属技能UI提示和确认按钮
- 雷电特效颜色调整为更淡的紫色

优化：
- 更新useSkill函数，新增skillTargets参数和障碍物操作返回值
- 新增confirmArchitectSkill函数处理多目标技能
- 更新getSkillRangePositions函数支持建筑师技能范围
- 更新getClassEmoji和getClassShortName函数支持建筑师
- 更新battle.vue UI显示支持建筑师
- 扩展所有核心文档

### v1.4.0 (2026-05-15)

新增功能：
- 雷雨天气系统（小/中/大雷雨三种类型）
- 雷电格子生成与显示（闪烁动画效果）
- 雷电伤害机制（每回合结束时对雷电格子内角色造成50%最大生命值伤害）
- AI智能躲避雷电格子策略
- 骑士初始攻击力从60提升至65
- 创建ERD实体关系图文档

优化：
- 扩展BattleState接口，新增thunderAreas和WeatherType类型
- 修改天气系统，支持7种天气类型（20%晴天、10%小雪、20%中雪、10%大雪、10%小雷雨、20%中雷雨、10%大雷雨）
- 更新getAvailablePositions等路径计算函数，优先选择非雷电位置
- 更新battle.vue添加雷电格子视觉效果
- 更新所有核心文档

### v1.3.0 (2026-05-15)

新增功能：
- 草药系统（清除障碍物30%概率生成，回复30%生命值）
- 所有攻击技能可清除障碍物
- 刺客职业（瞬移+攻击相邻4个方向×1.3伤害）

优化：
- 金币奖励公式改为 50 + 5×击杀人数
- AI行动间隔改为 660ms（支持1x/2x/3x加速）
- 友方AI也有行动间隔，使战斗过程更清晰
- 刺客技能修复：确保位置正确更新到响应式数组
- 弓箭手修复：只攻击一个目标
- 角色位置限制：任何角色不能移动到其他角色已占据的位置
- 移除多余的条件判断，优化代码逻辑

### v1.2.0 (2026-05-14)

新增功能：
- 天气系统（下雪、雪地区域）
- 战斗日志系统
- 移动按钮在雪地时置灰
- 修复AI在雪地中仍可移动的bug

优化：
- 骑士技能冲锋逻辑
- 设置界面默认值（敌方/我方总人数默认4人）
- 底部UI布局

### v1.1.3

- 移除雇佣兵属性为主角80%的限制
- 多存档槽位支持（最多3个）
- 存档命名和时间记录

### v1.0.0

- 核心战斗系统
- 6种职业及技能
- 养成系统（经验、金币、雇佣）
- 随机障碍物生成
- AI行为逻辑

---

## 10. 参考文档

- [README.md](../README.md) - 项目说明文档
- [MODULES.md](./MODULES.md) - 模块说明文档
- [API.md](./API.md) - API说明文档
- [ERD.md](./ERD.md) - 实体关系图文档
- [uni-app官方文档](https://uniapp.dcloud.net.cn/)
- [Vue3官方文档](https://cn.vuejs.org/)
- [Pinia官方文档](https://pinia.vuejs.org/zh/)

---

## 附录

### A. 联系方式

如有问题，可参考项目历史提交记录或联系项目维护者。

### B. 更新日志

本文档最后更新：2026-05-17

### C. 快速开始检查清单

- [ ] 安装 Node.js 16+
- [ ] 安装项目依赖：`npm install`
- [ ] 运行 H5 开发：`npm run dev:h5`
- [ ] 访问 http://localhost:5173/
- [ ] 了解项目结构
- [ ] 阅读核心代码（gameStore.ts、gameData.ts）
- [ ] 运行完整游戏流程测试

---

**祝开发顺利！** 🎮
