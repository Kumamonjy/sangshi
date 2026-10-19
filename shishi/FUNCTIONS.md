# 苍穹战纪 - 核心函数调用关系文档

## 目录

1. [文件结构概述](#文件结构概述)
2. [核心数据文件 - gameData.ts](#核心数据文件---gamedatats)
3. [状态管理 - gameStore.ts](#状态管理---gamestorets)
4. [页面组件调用关系](#页面组件调用关系)

---

## 文件结构概述

```
sangshi/src/
├── utils/
│   ├── gameData.ts          # 游戏配置数据、类型定义、工具函数
│   ├── storageUtils.ts      # 存储相关工具
│   └── characterAvatars.ts  # 角色头像映射
├── stores/
│   └── gameStore.ts         # Pinia状态管理 - 核心业务逻辑
└── pages/
    ├── start/start.vue      # 启动页
    ├── index/index.vue      # 主界面
    ├── character/character.vue  # 角色信息
    ├── home/home.vue        # 家园建设
    ├── battle-select/battle-select.vue  # 战斗准备
    ├── battle/battle.vue    # 战斗界面
    └── inventory/inventory.vue  # 背包
```

---

## 核心数据文件 - gameData.ts

### 类型定义

| 类型名称 | 描述 | 用途 |
|---------|------|------|
| `Faction` | 阵营枚举 | 'human' \| 'ghost' \| 'beast' \| 'immortal' \| 'god' \| 'demon' |
| `Job` | 职业类型 | string，支持自定义职业名称（如天命人、士兵、炼气修士、筑基修士、普通丧尸、变异丧尸、机甲） |
| `Attribute` | 属性类型 | 'normal' \| 'metal' \| 'wood' \| 'water' \| 'fire' \| 'earth' \| 'ice' \| 'wind' \| 'dark' \| 'yang' \| 'light' |
| `Rarity` | 装备品质枚举 | 'common' \| 'rare' \| 'exceptional' \| 'treasure' \| 'celestial' \| 'peerless' |
| `TerrainType` | 地形类型 | 'empty' \| 'river' \| 'obstacle' \| 'snow' |
| `WeatherType` | 天气类型 | 'normal' \| 'light_snow' \| 'medium_snow' \| 'heavy_snow' |
| `StatusType` | 状态类型 | 'poison' \| 'burning' \| 'silenced' \| 'bleeding' \| 'cold' \| 'disorder' \| 'stun' \| 'resolute' \| 'undying' \| 'fury' \| 'strong' \| 'fierce' \| 'swift' \| 'lame' \| 'weak' \| 'heal' \| 'regen' \| 'tune' \| 'meditate' \| 'fear' \| 'fragile' \| 'crumble' \| 'weakened' \| 'imprison' \| 'mili' \| 'xinluan' \| 'eagle_eye' \| 'zhangmu' |
| `Character` | 角色接口 | 包含角色属性、技能、装备、avatar、isPlayerOwned等 |
| `BattleCharacter` | 战斗角色接口 | 包含战斗状态、位置、装备加成属性、独立的 maxHp/maxMp |
| `BattleMap` | 战斗地图接口 | 包含战斗场景所有数据 |
| `Skill` | 技能接口 | 包含技能id、名称、mp消耗、类型、威力、冷却、范围、目标数等 |
| `Item` | 物品接口 | 装备和消耗品 |
| `BattleBuilding` | 战斗建筑接口 | 建筑在战斗中的状态 |
| `HomeGridCell` | 家园格子接口 | 家园建设单元格 |
| `Player` | 玩家接口 | 玩家数据、角色列表、背包、家园 |

#### BattleCharacter 接口（核心更新）
```typescript
interface BattleCharacter {
  id: string                    // 战斗实例ID
  characterId: string           // 对应角色模板ID
  row: number; col: number      // 战场坐标
  hp: number                    // 当前生命值
  mp: number                    // 当前法力值
  maxHp: number                 // 战斗中的血量上限（含装备加成 + 技能提升）
  maxMp: number                 // 战斗中的法力上限（含装备加成）
  hasMoved: boolean             // 本回合是否已移动
  hasActed: boolean             // 本回合是否已行动（攻击/技能/防御三选一）
  isDefending: boolean          // 是否处于防御状态（防御+20%）
  isPlayer: boolean             // 是否为玩家阵营
  level: number                 // 角色等级
  defenseReduction?: number     // 防御力降低百分比（临时）
  defenseReductionPermanent?: number  // 防御力降低百分比（永久）
  attackBoost?: number          // 攻击力提升百分比
  skillCooldowns?: Record<string, number>  // 技能冷却
  movedDistance?: number        // 本回合移动格子数（影响暗影刺杀）
  totalDamage?: number          // 本局总伤害统计
  totalHeal?: number            // 本局总治疗统计
  defense: number               // 带装备加成的防御力
  attack: number                // 带装备加成的攻击力
  moveRange: number             // 带装备加成的移动范围
  attackRange: number           // 带装备加成的攻击范围
  statuses: StatusInstance[]   // 当前的状态列表：[{ type: StatusType, duration: number }]
  maxHpBeforeCrumble?: number  // 脆皮状态生效前的生命值上限，用于解除状态时恢复
  faction: string               // 角色阵营
  job: string                   // 角色职业
}
```

**重要更新说明：**
- `maxHp` / `maxMp` 字段为必填，在角色进入战斗时初始化，值为角色模板基础值 + 装备加成
- 技能（如红花绿叶）可动态修改 `maxHp`，提升后 `hp` 同时增加同等数值
- `attack` / `defense` 字段存装备加成后的实际值，战斗中直接使用，无需再次计算
- `hasActed` 替代 `hasAttacked`，代表攻击/技能/防御三选一的行动状态
- `statuses: StatusInstance[]` 数组存储角色当前所有状态效果，每个状态包含 `type`（状态类型）和 `duration`（剩余持续回合数）
- `moveRange` / `attackRange` 为装备加成后的实际值
- `maxHpBeforeCrumble` 用于脆皮(crumble)状态解除时恢复原始生命值上限
- **驱散机制（dispel）**：由爱的抱抱、爱的飞吻、爱的回忆等治疗技能触发，通过遍历 `NEGATIVE_STATUSES`（基于 STATUS_CONFIG 的 tag 自动派生）一次性移除所有不良状态

### 核心配置对象

| 配置对象 | 描述 |
|---------|------|
| `FACTION_CONFIG` | 阵营配置：名称、图标、颜色 |
| `ATTRIBUTE_CONFIG` | 属性配置：名称、颜色（普通/金/木/水/火/土/冰/风/暗/阳/光） |
| `EQUIPMENT_CONFIG` | 装备配置：武器、防具、头盔、鞋子、饰品（含新饰品金徽章/银徽章/铜徽章） |
| `EQUIPMENT_TEMPLATES` | 装备模板（用于宝箱随机装备） |
| `ITEM_CONFIG` | 道具配置 |
| `SKILL_TEMPLATES` | 技能模板：所有技能的基础信息（含喋血刺击、碎裂重击、自爆毒液、摘叶飞花、万叶飞花、阴阳玉手印、吸血、灵魂诅咒、灵魂扰乱、魅惑、远程导弹、精准打击、凶猛撕咬等） |
| `BUILDING_CONFIG` | 建筑配置：灵田、丹房、血心、兵营、天启炮 |
| `COLLECTIBLE_CONFIG` | 拾取物配置 |
| `TERRAIN_CONFIG` | 地形配置（空地/河流/障碍物） |
| `BATTLE_CONFIG` | 战斗配置（主动进攻11×13、家园防御19×19） |
| `DIFFICULTY_CONFIG` | 难度配置（简单/正常/困难/噩梦/绝命） |
| `TERRAIN_PROBABILITIES` | 地形生成概率 |
| `RARITY_CONFIG` | 装备品质配置（概率 + 属性加成） |
| `CHARACTER_GROWTH` | 角色成长数据（每级提升的属性值） |
| `INITIAL_CHARACTERS` | 初始角色（熊熊、兔兔、大黑熊） |
| `HIREABLE_CHARACTERS` | 可雇佣角色（恶霸、潜伏者、医疗兵、科技球、猪妖、狙击手、特种兵、狂人、喷火兵、歌莉娅、坦克、赤炼、恶僧、牛头、马面、震枷、白狐、宋玉、冰心、弄玉、荒火、魅魔、幽驹、大司命、所有丧尸系列、所有修士系列、十二生肖系列、神兵系列、鬼魂系列等） |
| `JOB_CONFIG` | 职业配置（剑士、医师、法师、天命人、士兵、机甲、厉鬼、普通丧尸、变异丧尸、炼气修士、筑基修士、魔兽、魔族、流沙、鬼魂、神兵等） |

### 工具函数

| 函数名 | 描述 | 调用关系 |
|-------|------|---------|
| `createInitialHomeGrid()` | 创建初始家园网格 | `initGame()` 调用 |
| `createCharacterFromTemplate()` | 从模板创建角色 | `initGame()`, `startBattle()` 调用 |
| `getEquipmentStats(item)` | 获取装备属性加成 | `startBattle()`, 计算属性时调用 |
| `getRandomRarity()` | 获取随机品质 | `initGame()` (初始装备), `openChest()` 调用 |
| `openChest()` | 开箱获得随机装备 | 战斗胜利奖励、使用宝箱道具时调用 |
| `getEquipmentUpgradeCost()` | 计算装备升级费用 | 角色信息界面调用 |
| `getExpRequired(level)` | 获取升级所需经验 | 角色升级检查时调用 |
| `buildSkillsForCharacterId(characterId)` | 根据角色ID构建技能列表 | 角色模板初始化时调用（CHARACTER_TEMPLATES中skills字段） |
| `buildFullSkillsForCharacter(characterId, equipment)` | 构建完整技能列表（含装备附加技能） | 战斗初始化时调用，确保存档技能同步 |

---

## 状态管理 - gameStore.ts

### 状态 (State)

| 状态变量 | 类型 | 描述 |
|---------|------|------|
| `player` | `Player \| null` | 当前玩家数据 |
| `currentCharacter` | `Character \| null` | 当前选中角色 |
| `battleMap` | `BattleMap \| null` | 战斗地图数据 |
| `isInBattle` | `boolean` | 是否在战斗中 |
| `battleLog` | `string[]` | 战斗日志 |
| `shakingTargets` | `ShakingTarget[]` | 抖动特效目标 |
| `targetedByTianqiPao` | `{row, col}[]` | 天启炮瞄准位置 |
| `factionCommand` | `FactionCommand` | 阵营指令（全军出击/全军集结） |
| `gameSpeed` | `number` | 游戏速度（1/2/3倍） |

### 计算属性 (Getters)

| 计算属性 | 描述 | 调用方式 |
|---------|------|---------|
| `aliveCharacters` | 存活的角色列表 | `gameStore.aliveCharacters` |
| `totalAttack` | 当前角色总攻击力（含装备） | `gameStore.totalAttack` |
| `totalDefense` | 当前角色总防御力（含装备） | `gameStore.totalDefense` |
| `totalMaxHp` | 当前角色最大生命值（含装备） | `gameStore.totalMaxHp` |
| `totalMaxMp` | 当前角色最大法力值（含装备） | `gameStore.totalMaxMp` |
| `totalMoveRange` | 当前角色移动范围（含装备） | `gameStore.totalMoveRange` |
| `totalAttackRange` | 当前角色攻击范围（含装备） | `gameStore.totalAttackRange` |

### 核心动作 (Actions)

#### 游戏初始化与存档

| 函数名 | 描述 | 调用关系 |
|-------|------|---------|
| `initGame()` | 初始化全新游戏 | start.vue中"全新游戏"按钮调用 |
| `loadGame(tryExternal)` | 加载存档 | 启动页调用 |
| `saveGame()` | 保存游戏 | 各种操作后自动调用（重置技能冷却、HP/MP自动回满） |
| `saveToSlot(slotId, name)` | 保存到指定槽位 | 存档界面调用 |
| `loadFromSlot(slotId)` | 从指定槽位加载 | 存档界面调用 |
| `getSaveSlots()` | 获取存档槽位列表 | start.vue加载时调用 |

**调用流程：**
```
start.vue
├── 全新游戏 → initGame()
│   ├── 创建角色：INITIAL_CHARACTERS.map(createCharacterFromTemplate)
│   ├── 生成初始装备（使用getRandomRarity()）
│   └── saveGame()
└── 加载存档 → loadGame()
    └── getSaveSlots()
```

**存档优化说明：**
- 保存时所有角色技能冷却重置为0
- 角色HP/MP自动恢复到满值
- 不保存 `avatar` 和 `isPlayerOwned` 字段（由模板动态获取）
- 技能信息仅保存 `id`，不保存 `icon` 和 `description`

#### 角色系统

| 函数名 | 描述 | 调用关系 |
|-------|------|---------|
| `hireCharacter(templateId)` | 雇佣角色 | 角色图鉴界面调用 |
| `equipItem(characterId, itemId)` | 角色装备物品 | 背包界面调用 |
| `unequipItem(characterId, slot)` | 卸下装备 | 角色信息界面调用 |
| `useItem(itemId)` | 使用消耗品 | 背包界面调用 |
| `updateCharacterStats(character)` | 更新角色属性（含装备） | `equipItem()`, `unequipItem()` 内部调用 |

**雇佣金额计算公式：**
```
雇佣金额 = maxHp + maxMp + 5 × attack + 5 × defense + 50 × moveRange + 50 × attackRange
```

**调用流程：**
```
装备系统流程：
equipItem(characterId, itemId)
├── 查找角色和物品
├── 装备物品到对应槽位
├── 减少物品数量（移除空物品）
├── updateCharacterStats(character)
│   └── 重新计算角色属性（含装备加成）
└── saveGame()
```

#### 家园系统

| 函数名 | 描述 | 调用关系 |
|-------|------|---------|
| `updateHomeGrid(row, col, data)` | 更新家园格子 | home.vue调用 |
| `placeBuilding(row, col, type)` | 放置建筑 | home.vue调用 |
| `removeBuilding(row, col)` | 移除建筑 | home.vue调用 |

#### 战斗系统 - 核心函数

##### 战斗初始化

| 函数名 | 描述 | 调用关系 |
|-------|------|---------|
| `startBattle(mode, terrain, difficulty, selectedCharacterIds, selectedFactions)` | 开始战斗 | battle-select.vue确认后调用 |

**调用流程：**
```
startBattle()
├── 初始化地图数据（BATTLE_CONFIG）
├── 生成地形（TERRAIN_PROBABILITIES）
├── 创建玩家阵营角色
│   ├── 为每个角色创建BattleCharacter
│   ├── 计算装备加成：getEquipmentStats()
│   ├── 存储到BattleCharacter.attack/defense/maxHp/maxMp
│   └── 放置到地图
├── 创建敌方阵营角色和建筑
│   ├── 敌人等级：玩家平均等级向下取整
│   └── 根据难度配置敌人数量
├── 生成收集品
├── 设置battleMap.value
└── isInBattle = true
```

##### 战斗移动

| 函数名 | 描述 | 调用关系 |
|-------|------|---------|
| `getCharacterMoveRange(char)` | 获取角色可移动范围 | battle.vue中显示移动范围 |
| `moveCharacter(characterId, row, col)` | 移动角色 | battle.vue点击移动目标调用 |

**调用流程：**
```
getCharacterMoveRange(char)
└── BFS算法计算
    ├── 检查地形可通行性：TERRAIN_CONFIG[terrain].passable
    ├── 检查是否被占用
    └── 受moveRange限制

moveCharacter()
├── 验证移动合法性
├── 更新BattleCharacter.row/col
├── 更新BattleTile.character
├── 记录movedDistance
├── 标记hasMoved = true
└── addBattleLog()
```

##### 战斗攻击

| 函数名 | 描述 | 调用关系 |
|-------|------|---------|
| `getAttackableEnemies(char)` | 获取可攻击的敌人列表 | battle.vue显示攻击范围 |
| `attack(attackerId, targetId)` | 普通攻击 | battle.vue点击敌人调用 |
| `attackBuilding(attackerId, buildingId)` | 攻击建筑 | battle.vue点击建筑调用 |
| `calculateDamage(attacker, target)` | 计算伤害值 | `attack()`, `useSkill()` 内部调用 |

**调用流程：**
```
attack()
├── 检查是否已行动
├── 判断是否攻击障碍物
│   └── 是：清除障碍物，记录日志
├── 获取目标（角色或建筑）
├── 验证目标在攻击范围内
├── 计算伤害：calculateDamage()
│   ├── 使用BattleCharacter.attack（含装备加成）
│   ├── 使用BattleCharacter.defense（含装备加成）
│   ├── 应用防御状态：defense * 1.2
│   ├── 应用防御力降低效果
│   └── 最小伤害 = 1
├── 扣除目标HP
├── 更新totalDamage统计
├── 触发抖动特效：triggerShake()
├── 添加战斗日志
├── 标记hasActed = true
├── 检查目标是否被击败
│   └── 是：removeCharacterFromBattle()
└── 检查战斗是否结束：checkBattleEnd()
```

##### 战斗技能

| 函数名 | 描述 | 调用关系 |
|-------|------|---------|
| `useSkill(skillId, attackerId, targetId, targetPos, multiTargets)` | 使用技能 | battle.vue点击技能调用 |

**技能类型与处理逻辑：**

| 技能ID | 技能名称 | 核心逻辑 | 特殊处理 |
|--------|----------|----------|----------|
| `fire_burst` | 炎爆术 | 单体伤害120% | 基础法术攻击 |
| `ice_shard` | 冰晶术 | 单体伤害100% | 基础法术攻击 |
| `thunder_bolt` | 雷电术 | 单体伤害140% | 基础法术攻击 |
| `shadow_strike` | 暗影突袭 | 单体伤害130% | 基础攻击 |
| `nature_power` | 自然之力 | 恢复友方60%最大生命值 | 基础治疗，power=60 |
| `jin_shen_ge_dou` | 近身格斗 | 单体110%+30%当前生命值伤害 | damageFormula='atk_plus_hp_pct', hpPct=0.3 |
| `po_kong_zhan` | 破空斩 | 单体伤害130%+10%当前生命值 | damageFormula='atk_plus_hp_pct', hpPct=0.1 |
| `jue_chu_feng_sheng` | 绝处逢生 | 消耗HP20%，自身获得【愤怒】状态 | selfHpCost=0.2, selfStatusEffects=['fury'] |
| `ai_de_bao_bao` | 爱的抱抱 | 治疗目标HP和MP，驱散所有不良状态 | 更新totalHeal，调用NEGATIVE_STATUSES遍历驱散 |
| `ai_de_fei_wen` | 爱的飞吻 | 治疗目标HP，驱散所有不良状态 | 更新totalHeal，调用NEGATIVE_STATUSES遍历驱散 |
| `ai_de_hui_yi` | 爱的回忆 | 恢复自身10%HP和10%MP，驱散自身所有不良状态 | 目标必须是自己 |
| `qian_li_bing_feng` | 千里冰封 | 范围伤害110%，目标陷入【削弱】状态 | areaRange=3, rangeType='diamond' |
| `bing_feng_zhi_men` | 冰封之门 | 选择2格范围内的2个空地，生成障碍物 | category='special', targetCount=2 |
| `shadow_assassination` | 暗影刺杀 | 范围伤害150%（自身1格菱形范围） | category='aoe', areaRange=1 |
| `throw_grenade` | 投掷手雷 | 范围伤害200% | 清除范围内障碍物，轰炸类 |
| `spit_slime` | 口吐粘液 | 单体伤害140%，范围2格，目标陷入【虚弱】状态 | power=140, range=2, statusEffect='weak' |
| `fushi_nianye` | 腐蚀粘液 | 2格范围伤害225%，目标陷入【虚弱】状态，自身退场 | HP≤20%时可用, selfDefeat=true |
| `er_ye_pao_xiao` | 二爷咆哮 | 单体伤害150%，自身获得【愤怒】状态 | selfStatusEffects=['fury'] |
| `xie_e_kun_bang` | 邪恶捆绑 | 单体伤害150%，range=4，目标陷入【禁锢】状态 | range=4, statusEffect='imprison' |
| `life_drain` | 汲取生命 | 单体伤害120%，恢复33%伤害为HP | lifesteal=0.333 |
| `xiong_meng_si_yao` | 凶猛撕咬 | 单体伤害150% | |
| `excited_frenzy` | 兴奋狂热 | 消耗自身HP20%，单体伤害200% | selfHpCost=0.2 |
| `jue_ming_fu_ji` | 绝命伏击 | 单体伤害200% | |
| `terror_scream` | 恐怖尖叫 | 3格菱形范围伤害150%，清除障碍物，随机生成1只普通丧尸 | summonZombie=true |
| `lingqi_bo` | 灵气波 | 3格范围单体伤害150% | power=150 |
| `lingqisi` | 灵气丝 | 3格范围单体伤害130%，恢复38%伤害为HP | lifesteal=0.385 |
| `hong_hua_lv_ye` | 红花绿叶 | 单体伤害120%，自身maxHp+攻击力80% | selfMaxHpBuff=0.8 |
| `ni_tian_can_ren` | 逆天残刃 | 3目标各120%伤害 | targetCount=3 |
| `dao_guang_jian_ying` | 刀光剑影 | 2目标各140%伤害 | targetCount=2 |
| `tian_han_di_dong` | 天寒地冻 | 单体伤害150%，目标脚下产生雪地 | createSnowTerrain=true |
| `tian_beng_di_lie` | 天崩地裂 | 1格正方形范围伤害80% | rangeType='square' |
| `luo_tu_fei_yan` | 落土飞岩 | 单体伤害150%，自身获得【强力】状态 | selfStatusEffects=['strong'] |
| `xing_huo_liao_yuan` | 星火燎原 | 2目标各130%伤害 | targetCount=2 |
| `ju_huo_fen_tian` | 举火焚天 | 单体伤害120%，自身获得【强力】状态 | selfStatusEffects=['strong'] |
| `yuan_cheng_dao_dan` | 远程导弹 | 4格内选格子为目标，菱形1格范围90%伤害 | range=4, areaRange=1 |
| `jing_zhun_da_ji` | 精准打击 | 4格范围2目标各130%伤害 | targetCount=2 |
| `gong_cheng_zhong_pao` | 攻城重炮 | 5格范围轰炸200%伤害，自身陷入【瘸腿】和【鹰眼】 | targetPos传递位置 |
| `hong_lian_hua_huo` | 红莲花火 | 3格单体150%伤害，目标陷入【燃烧】状态 | statusEffect='burning' |
| `she_jian_du_wen` | 蛇剑毒吻 | 3格2目标各120%伤害，目标陷入【流血】状态 | targetCount=2, statusEffect='bleeding' |
| `xie_shen_di_yu` | 邪神低语 | 2格菱形范围120%伤害，目标陷入【迷离】状态 | category='aoe', statusEffect='mili' |
| `rao_luan_xin_shen` | 扰乱心神 | 2格单体180%伤害，驱散目标所有正面状态 | clearPositiveStatus=true |
| `yi_jian_ting_yu` | 奕剑听雨 | 2格菱形范围120%伤害，自身获得【强力】和【迅捷】状态 | category='aoe' |
| `ling_yun_fei_jian` | 凌云飞剑 | 3格3目标各130%伤害 | targetCount=3 |
| `ju_qi_cheng_ren` | 聚气成刃 | 3格2目标各150%伤害 | targetCount=2 |
| `yin_yang_kui_lei_shu` | 阴阳傀儡术 | 3格单体180%伤害，目标陷入【脆弱】状态 | statusEffect='fragile' |
| `meng_hu_xia_shan` | 猛虎下山 | 1格单体180%伤害 | |
| `meng_hu_si_hou` | 猛虎嘶吼 | 3格2目标各70%伤害，目标陷入【脆弱】状态 | targetCount=2, statusEffect='fragile' |
| `da_di_zhong_ji` | 大地重击 | 2格菱形范围130%伤害 | category='aoe' |
| `man_jia_chong_ji` | 蛮甲冲击 | 2格单体160%伤害，自身获得【刚毅】状态 | selfStatusEffects=['resolute'] |
| `sui_lie_zhong_ji` | 碎裂重击 | 1格单体200%伤害，目标陷入【眩晕】状态 | statusEffect='stun' |
| `mo_lian_gui_shou` | 魔殓鬼手 | 1格正方形范围120%伤害，恢复35%伤害为HP | lifesteal=0.35 |
| `qian_zhu_sui_ying` | 千蛛碎影 | 3格3目标各110%伤害 | targetCount=3 |
| `ju_du_shi_gu` | 巨毒噬骨 | 3格单体120%伤害，目标陷入【中毒】状态 | statusEffect='poison' |
| `die_xue_ci_ji` | 喋血刺击 | 1格单体150%伤害，目标陷入【流血】状态 | statusEffect='bleeding' |
| `zi_bao_du_ye` | 自爆毒液 | 自身1格正方形范围150%伤害，所有敌人【中毒】，自身战败退场 | selfDefeat=true |
| `zhai_ye_fei_hua` | 摘叶飞花 | 3格单体，伤害=(100%+20%×距离)攻击，目标【流血】 | damageFormula='move_based' |
| `wan_ye_fei_hua` | 万叶飞花 | 3格2目标各110%伤害，目标【流血】 | targetCount=2 |
| `yin_yang_yu_shou_yin` | 阴阳玉手印 | 3格3目标总计300%伤害，按目标数均摊 | targetCount=3 |
| `xi_xue` | 吸血 | 1格单体120%伤害，恢复67%伤害为HP | lifesteal=0.667 |
| `ling_hun_zu_zhou` | 灵魂诅咒 | 5格单体110%伤害，目标陷入【沉默】状态 | range=5, statusEffect='silenced' |
| `ling_hun_rao_luan` | 灵魂扰乱 | 3格2目标各75%伤害，目标陷入【心乱】状态 | statusEffect='xinluan' |
| `mei_huo` | 魅惑 | 2格单体120%伤害，目标陷入【心乱】状态 | statusEffect='xinluan' |
| `wang_zhe_zhi_qi` | 亡者之气 | 3格2目标各100%伤害，目标陷入【心乱】状态 | statusEffect='xinluan' |
| `suo_hun` | 锁魂 | 3格菱形单体150%伤害，目标陷入【禁锢】3回合 | rangeType='diamond', statusEffectDuration=3 |
| `qiu_ling` | 囚灵 | 3格菱形2目标各130%伤害，目标陷入【禁锢】+【紊乱】3回合 | statusEffects=['imprison','disorder'] |
| `pu_tong_hu_li` | 普通护理 | 2格范围1目标，恢复50%攻击力的HP和MP | type='heal', power=50 |
| `jin_ji_zhi_liao` | 紧急治疗 | 2格范围1目标，恢复100%攻击力的HP和MP，驱散所有不良状态 | type='heal', power=100 |
| `zhao_huan_ling_chong` | 召唤灵宠 | 选择2格范围内的1个空格，召唤职业为【灵宠】的随机角色 | category='summon', summonJob='灵宠' |
| `gao_shan_liu_shui` | 高山流水 | 4格范围2目标，恢复75%攻击力的HP和MP，驱散所有不良状态 | type='heal', targetCount=2 |
| `lian_yu_huo_hai` | 炼狱火海 | 2格菱形范围110%伤害，目标陷入【燃烧】状态 | category='aoe', statusEffect='burning' |
| `ku_lou_xue_shou_yin` | 骷髅血手印 | 3格单体160%伤害，目标陷入【流血】状态 | statusEffect='bleeding' |
| `liu_hun_kong_zhou` | 六魂恐咒 | 2格单体150%伤害，目标陷入【中毒】和【沉默】状态 | statusEffects=['poison','silenced'] |
| `zhi_yu_zhi_guang` | 治愈之光 | 3格范围友方目标，恢复自身和目标100%攻击力HP/MP，驱散不良状态 | type='heal', power=100 |
| `emp_chong_ji_bo` | EMP冲击波 | 3格单体150%伤害，目标陷入【沉默】状态 | statusEffect='silenced' |
| `fu_she_da_ji` | 辐射打击 | 4格单体150%伤害，目标陷入【中毒】状态 | statusEffect='poison' |
| `huo_yu_liu_xing` | 火羽流星 | 3格3目标各70%伤害 | targetCount=3 |
| `tian_ya_qing_qing` | 天雅倾情 | 4格友方目标，恢复10%生命/法力上限，驱散不良状态 | type='heal', range=4 |
| `yu_yin_rao_liang` | 余音绕梁 | 3格友方角色，恢复110%攻击HP和40%攻击MP，获得【调息】状态 | type='heal', power=110 |
| `feng_mo_qin_xin` | 疯魔琴心 | 3格友方角色，恢复120%攻击HP，获得【强力】状态 | type='heal', power=120 |
| `shi_xin_shi_sui` | 噬心食髓 | 3格单体150%伤害，目标陷入【中毒】状态 | statusEffect='poison' |
| `tian_luo_di_wang` | 天罗地网 | 3格2目标各120%伤害，目标陷入【瘸腿】状态 | targetCount=2, statusEffect='lame' |
| `tao_zhi_yao_yao` | 桃之夭夭 | 3格单体150%伤害，目标陷入【迷离】状态 | statusEffect='mili' |
| `tao_hua_zhuo_zhuo` | 桃花灼灼 | 3格2友方目标，恢复120%攻击HP，获得【愈合】状态 | type='heal', targetCount=2 |
| `tun_jiu_kuang_xiao` | 吞酒狂啸 | 直线攻击：3格范围敌方150%伤害，自身【愤怒】 | category='直线', selfStatusEffects=['fury'] |
| `nu_za_hu_lu` | 怒砸葫芦 | 3格2目标各150%伤害，自身【脆皮】 | targetCount=2, selfStatusEffects=['crumble'] |
| `bi_hai_chao_sheng` | 碧海潮生 | 3格菱形友方恢复120%攻击HP，自身【愈合】 | type='heal', areaRange=3 |
| `shui_man_jin_shan` | 水漫金山 | 3格菱形敌方90%伤害，自身【刚毅】 | category='aoe' |
| `mo_yu_he_ling` | 墨羽鹤翎 | 3格3目标各130%伤害，自身【鹰眼】 | targetCount=3, selfStatusEffects=['eagle_eye'] |
| `mo_ying_jian_guang` | 墨影剑光 | 2格菱形范围150%伤害 | category='aoe', areaRange=2 |
| `fu_guang_lue_ying` | 浮光掠影 | 2格菱形友方恢复50%攻击HP/MP，自身【迅捷】 | type='heal', areaRange=2 |
| `gao_bie_ming_deng` | 告别暝灯 | 3格2目标各120%伤害，目标【脆皮】 | targetCount=2, statusEffect='crumble' |
| `shen_zhi_yi_shou` | 神之一手 | 3格单体220%伤害，自身【鹰眼】+【调息】 | selfStatusEffects=['eagle_eye','tune'] |
| `yin_yang_qi_he` | 阴阳气合 | 2格菱形友方恢复40%攻击MP，自身【调息】 | type='heal', areaRange=2 |
| `cang_jian_yi_ye` | 藏剑一叶 | 2格单体200%伤害，目标【迷离】 | statusEffect='mili' |
| `mu_feng_wei_shang` | 沐风为裳 | 3格友方目标，恢复自身+目标50%攻击HP和60%攻击MP，驱散不良状态 | type='heal' |
| `huo_yan_pen_she` | 火焰喷射 | 1格2目标各150%伤害，目标【燃烧】 | targetCount=2, statusEffect='burning' |
| `zhao_huan_wawa` | 召唤娃娃 | 2格菱形2个空地，召唤2个【傀儡娃娃】 | category='summon', summonCharacter='kuilei' |
| `xi_rang_zai_sheng` | 息壤再生 | 1格单体120%伤害，恢复60%攻击HP，自身【刚毅】 | lifesteal=0.5, selfStatusEffects=['resolute'] |
| `zhao_huan_nvhuang` | 召唤女皇 | 2格1个空地，召唤1个【傀儡女皇】 | category='summon', summonCharacter='kuileinvhuang' |
| `an_ye_jin_sheng` | 暗夜噤声 | 3格2目标各70%伤害，目标【沉默】 | targetCount=2, statusEffect='silenced' |
| `po_jing_chong_yuan` | 破镜重圆 | 2格单体150%伤害，若目标有增益则自身获得相同增益 | 状态偷取逻辑 |
| `yue_zhi_yin_li` | 月之引力 | 2格同阵营目标，双方获得【愈合】+【调息】 | type='support' |
| `tian_tu_zhan_fang` | 天兔绽放 | 2格菱形范围120%伤害 | category='aoe', areaRange=2 |
| `fei_xue_meng_ji` | 沸血猛击 | 1格单体210%伤害，自身损失10%HP并获得【愤怒】 | selfHpCost=0.1, selfStatusEffects=['fury'] |
| `wu_di_niu_niu` | 无敌牛牛 | 自身恢复100%攻击HP，驱散不良状态，获得【愈合】 | type='heal', power=100 |
| `jian_yu` | 箭雨 | 4格范围2格菱形35%伤害 | 轰炸类 |
| `sui_xing` | 碎星 | 4格单体100%+50%当前生命值伤害，目标【流血】 | damageFormula='atk_plus_hp_pct', hpPct=0.5 |
| `miao_shou` | 妙手 | 3格菱形友方，恢复当前HP30%，获得【愈合】，驱散不良状态 | type='heal' |
| `cuo_gu` | 错骨 | 2格单体50%+20%当前生命值伤害，目标【紊乱】 | damageFormula='atk_plus_hp_pct', hpPct=0.2 |
| `you_ju_xi_tian` | 幽驹袭天 | 1格菱形范围100%伤害 | category='aoe', areaRange=1 |
| `zhao_huan_you_ju` | 召唤幽驹 | 2格1个空地，召唤角色【幽驹】 | category='summon', summonCharacter='youju' |
| `ba_wang_qiang` | 霸王枪 | 2格菱形单体150%伤害，目标【燃烧】 | statusEffect='burning' |
| `zhen_long_sha` | 镇龙杀 | 直线攻击：3格范围敌方120%伤害 | category='直线' |
| `ji_gu_tu` | 戟骨突 | 直线攻击：3格范围敌方120%伤害，目标【中毒】 | category='直线', statusEffect='poison' |
| `duan_yan_sui_feng_bo` | 断岩碎风波 | 横扫攻击：长1宽3范围100%伤害 | category='横扫', sweepLength=1, sweepWidth=3 |
| `yun_he_xiang_wu` | 云鹤翔舞 | 直线攻击：4格范围60%伤害 | category='直线' |
| `kongshan_niaoyu` | 空山鸟语 | 3格菱形友方恢复50%攻击HP+20%攻击MP | type='heal', areaRange=3 |
| `bainiao_zhaofeng` | 百鸟朝凤 | 3格菱形敌方70%伤害，自身【愈合】+【调息】 | category='aoe', selfStatusEffects=['heal','tune'] |
| `lie_di_zhan` | 裂地斩 | 1格菱形50%+损失生命%攻击力伤害 | damageFormula='hp_lost_pct' |
| `shan_he_zhen` | 山河震 | 2格菱形范围110%伤害 | category='aoe', areaRange=2 |
| `wenyi_chuanbo` | 瘟疫传播 | 1格菱形90%伤害，目标【中毒】 | category='aoe', statusEffect='poison' |
| `shushu_dadao` | 鼠鼠大盗 | 2格单体160%伤害，偷取目标一个增益状态自身获得 | stealBuff=true |
| `kubi_zhou` | 枯笔咒 | 3格单体120%伤害，目标【紊乱】 | statusEffect='disorder' |
| `jiujie_fengling` | 旧籍封灵 | 3格3目标各60%伤害，目标【禁锢】2回合 | targetCount=3, statusEffectDuration=2 |
| `ming_chui_sao_yu` | 冥锤扫狱 | 横扫攻击：长2宽3范围170%伤害，目标【脆弱】 | category='横扫', sweepLength=2 |
| `yu_men_chong_zhen` | 狱门重震 | 2格菱形2目标各130%伤害，目标【虚弱】 | targetCount=2, statusEffect='weak' |

**多目标技能（targetCount）通用处理流程：**
```
useSkill() → 检测到targetCount属性
├── 验证多目标参数合法性
├── 对每个目标分别计算伤害
├── 触发每个目标的抖动特效
├── 更新totalDamage统计
└── 检查每个目标是否被击败
```

**位置指定技能（远程导弹）处理流程：**
```
useSkill() → 检测到areaRange属性且targetPos存在
├── 验证targetPos在技能范围内
├── 以targetPos为中心计算菱形范围（areaRange=1）
├── 对范围内所有敌人造成伤害
├── 清除范围内的障碍物
└── 触发抖动特效
```

**直线攻击技能（category='直线'）处理流程：**
```
useSkill() → 检测到category='直线'
├── 获取选择的方向（上/下/左/右）
├── 计算直线范围内的所有目标位置
├── 对范围内的敌方角色造成伤害（支持各种伤害公式）
├── 对范围内的敌方建筑造成伤害
├── 清除范围内的障碍物
├── 施加状态效果（支持statusEffect和selfStatusEffects）
├── 生成战斗日志和特效
└── 更新totalDamage统计
```

**横扫攻击技能（category='横扫'）处理流程：**
```
useSkill() → 检测到category='横扫'
├── 获取选择的方向（上/下/左/右）
├── 根据sweepLength和sweepWidth计算横扫范围
├── 对范围内的所有敌方目标造成伤害
├── 施加状态效果
├── 生成战斗日志和特效
└── 更新totalDamage统计
```

**召唤技能（category='summon'）处理流程：**
```
useSkill() → 检测到category='summon'
├── 获取选择的空地位置
├── 根据summonCharacter或summonJob创建召唤角色
├── 将召唤角色放置到战场
├── 继承施法者阵营
├── 生成战斗日志
└── 更新战场数据
```

**技能对建筑目标的处理：**
```
对建筑造成伤害时：
├── 触发triggerShake(row, col, 'building')
├── 血心建筑第一次被攻击时额外生成一只变异丧尸
└── 检查建筑HP是否为0 → removeBuildingFromBattle()
```

**调用流程：**
```
useSkill()
├── 检查技能冷却
├── 检查法力消耗
├── 检查HP限制（腐蚀粘液：HP≤20%）
├── 根据技能类型执行不同逻辑
│   ├── 多目标技能（targetCount）：对多个目标造成伤害
│   ├── 位置指定技能（如远程导弹）：对指定格子位置范围造成伤害
│   ├── 范围技能（如腐蚀粘液、天崩地裂）：以自身或目标为中心范围伤害
│   ├── 直线攻击技能（category='直线'）：选择方向，对直线范围内所有敌方单位造成伤害
│   ├── 横扫攻击技能（category='横扫'）：选择方向，对横扫范围内所有敌方单位造成伤害
│   ├── 召唤技能（category='summon'）：召唤角色到战场
│   ├── 单体技能：对单个目标造成伤害
│   ├── 治疗技能：恢复目标HP/MP
│   ├── 辅助技能：修改自身属性（攻击力提升、防御力降低）
│   └── HP恢复技能：提升maxHp并恢复hp（红花绿叶）
├── 标记hasActed = true
├── 应用技能冷却
├── 检查角色是否被击败（腐蚀粘液主动退场）
└── checkBattleEnd()
```

**统一技能处理函数说明：**

| 函数名 | 描述 | 适用技能类型 |
|-------|------|------------|
| `processSingleOrMultiTargetSkill()` | 处理单体和多目标攻击技能 | category='指定'，含targetCount的技能 |
| `processAOEAttackSkill()` | 处理AOE范围攻击技能 | category='aoe' |
| `processLineAttackSkill()` | 处理直线攻击技能 | category='直线' |
| `processSweepAttackSkill()` | 处理横扫攻击技能 | category='横扫' |
| `processSummonSkill()` | 处理召唤技能 | category='summon' |

**注意：** 治疗技能和辅助技能在 `useSkill()` 内通过内联逻辑处理（type='heal' / type='support'），不走统一函数路径。

##### 战斗防御

| 函数名 | 描述 | 调用关系 |
|-------|------|---------|
| `defend(characterId)` | 角色进入防御状态 | battle.vue点击防御按钮调用 |

**调用流程：**
```
defend()
├── 设置isDefending = true
├── 标记hasActed = true
└── addBattleLog()
```

##### 战斗回合

| 函数名 | 描述 | 调用关系 |
|-------|------|---------|
| `endPlayerTurn()` | 结束玩家回合 | battle.vue点击"结束行动"调用 |
| `executeEnemyTurn()` | 执行敌人回合 | `endPlayerTurn()` 内部调用 |
| `executeCharacterAi(char, isPlayer)` | 执行角色AI | `executeEnemyTurn()` 循环调用 |
| `executeAttackMode(char)` | 全军出击模式AI | `executeCharacterAi()` 调用 |
| `executeGatherMode(char)` | 全军集结模式AI | `executeCharacterAi()` 调用 |
| `endBattle(victory, isEscape)` | 结束战斗 | `checkBattleEnd()` 调用 |
| `checkBattleEnd()` | 检查战斗是否结束 | `attack()`, `useSkill()`, 角色死亡后调用 |

**AI行动逻辑更新：**
```
executeAttackMode(char)
├── 评估最优移动位置和目标
├── 技能使用智能判断
│   ├── 召唤技能（召唤灵宠、召唤娃娃、召唤女皇、召唤幽驹）：优先级9999，优先选择能召唤且离敌人更近的位置
│   ├── 震枷AI：优先使用【锁魂】对单体目标，其次【囚灵】对2目标
│   ├── 赤炼AI：优先使用火属性技能（红莲花火、蛇剑毒吻）
│   ├── 多目标技能（targetCount）：选择多个敌人目标
│   ├── 位置指定技能（远程导弹、攻城重炮）：选择敌人密集的格子位置
│   ├── AOE技能（墨影剑光、千里冰封、大地重击、魔殓鬼手、自爆毒液、炼狱火海、邪神低语、攻城重炮、恐怖尖叫、幽驹袭天、天兔绽放、断岩碎风波、瘟疫传播、百鸟朝凤、山河震、裂地斩）：使用areaRange计算伤害，只计算对敌方角色和建筑的伤害
│   ├── 直线攻击技能（吞酒狂啸、镇龙杀、戟骨突、云鹤翔舞）：计算四个方向的潜在伤害，选择伤害最大的方向
│   ├── 横扫攻击技能（断岩碎风波、冥锤扫狱）：计算四个方向的潜在伤害
│   ├── HP限制技能（腐蚀粘液）：仅HP≤20%时选择
│   ├── 自爆技能（自爆毒液）：自身HP≤20%且周围有敌人时优先选择
│   ├── 吸血鬼AI：自身HP≤50%且有相邻敌方目标时优先使用【吸血】技能
│   ├── 萨满AI：敌方有3个以上目标在5格范围内时使用【灵魂诅咒】，否则敌方有2个以上目标在3格范围内时使用【灵魂扰乱】
│   ├── 少司命AI：根据可攻击目标数量选择技能（1目标→摘叶飞花，2目标→万叶飞花，3+目标→阴阳玉手印）
│   ├── 医疗兵AI：2格范围内友方有血量损失时使用【普通护理】或【紧急治疗】（优先治疗血量损失最大的友方目标）
│   ├── 通用heal技能评估：对所有type='heal'的技能，评估对友方角色的治疗价值（恢复量×3.0权重），与攻击伤害对比选择最优行动
│   ├── 辅助技能（绝处逢生、月之引力）：【绝处逢生】对自己使用，【月之引力】查找范围内友方目标，优先选择离敌人更近的位置
│   └── 普通技能：选择造成最大伤害的目标（技能优先级=技能本回合能造成的最大伤害，普通攻击优先级=攻击力）
├── 选择造成最大伤害的方案
├── moveCharacter()（如需要）
└── attack() / useSkill()
```

**AI行动顺序：**
- 按角色到最近敌方目标的曼哈顿距离排序，距离近的先行动
- 技能优先级：攻击 > 召唤（9999） > 治疗 > 辅助 > 特殊（AI忽略）

**状态效果下的AI行为扩展：**
```
executeCharacterAi(char) → 行动前检查：
├── 有禁锢(imprison)状态？ 跳过本回合（不能移动）
├── 有眩晕(stun)状态？ 跳过本回合（不移动不攻击），stun回合数-1，结束
├── 有沉默(silenced)状态？ 本回合不能使用技能，只能普通攻击或移动
├── 有紊乱(disorder)状态？ AI行为混乱：随机选择目标（可能攻击己方或移动到随机方向）
├── 有寒冷(cold)或瘸腿(lame)状态？ 影响移动范围
├── 正常执行 executeAttackMode(char)
```

**调用流程：**
```
endPlayerTurn()
├── 敌方建筑行动
│   └── 天启炮：奇数回合锁定，偶数回合攻击
├── executeEnemyTurn()
│   └── 对每个敌人调用executeCharacterAi(char, false)
│       └── executeAttackMode(char)
├── 本回合建筑产出（灵田、丹房）
├── 本回合建筑出兵（血心、兵营）
├── 降低所有技能冷却
├── turn += 1
└── 下一轮开始
```

##### 状态效果系统

| 函数名 | 描述 | 调用关系 |
|-------|------|---------|
| `addStatusToCharacter(character, statusType, silent, duration)` | 给角色施加状态效果 | 技能命中时调用 |
| `removeStatusFromCharacter(character, statusType)` | 移除角色的指定状态 | 驱散技能、状态回合结束时调用 |
| `hasStatus(character, statusType)` | 检查角色是否有指定状态 | 多处调用 |
| `getStatusStacks(character, statusType)` | 获取角色指定状态的层数 | 战斗计算时调用 |
| `getStatusAttackPercent(character)` | 获取状态对攻击力的加成 | computeAttackPower()调用 |
| `getStatusDefensePercent(character)` | 获取状态对防御力的加成 | computeDefensePower()调用 |
| `getStatusMoveRange(character)` | 获取状态对移动范围的影响 | 计算移动范围时调用 |
| `getStatusAttackRange(character)` | 获取状态对攻击范围的影响 | 计算攻击范围时调用 |
| `triggerStatusOnAction(character)` | 角色行动时处理状态伤害（中毒6%maxHP） | 玩家/敌人行动前调用 |
| `triggerStatusOnTurnEnd(chars)` | 回合结束时处理持续状态伤害（燃烧、流血等） | endPlayerTurn() / executeEnemyTurn() 调用 |

**状态效果说明表：**
| 状态字段 | 状态名称 | 触发方式 | 效果 | 标签 |
|---------|---------|---------|------|------|
| `poison` | 中毒 | 自爆毒液、巨毒噬骨、戟骨突、瘟疫传播等 | 每次行动时损失6%最大生命值 | negative |
| `bleeding` | 流血 | 喋血刺击、摘叶飞花、万叶飞花、蛇剑毒吻、碎星 | 每回合结束损失12%最大生命值 | negative |
| `burning` | 燃烧 | 火系技能（炼狱火海、火焰喷射、霸王枪、红莲花火等） | 每回合结束损失10%最大生命值+5%最大法力值 | negative |
| `silenced` | 沉默 | 灵魂诅咒、暗夜噤声、六魂恐咒、EMP冲击波 | 无法使用技能，只能普通攻击或移动 | negative |
| `cold` | 寒冷 | 雪地地形效果（天寒地冻产生雪地） | 无法移动 | negative |
| `disorder` | 紊乱 | 错骨、枯笔咒、囚灵 | 每回合结束损失10%最大法力值 | negative |
| `stun` | 眩晕 | 碎裂重击 | 下一回合无法行动（持续1回合） | negative |
| `weak` | 虚弱 | 口吐粘液、腐蚀粘液、狱门重震 | 攻击力减少10%，防御力减少50% | negative |
| `fragile` | 脆弱 | 阴阳傀儡术、猛虎嘶吼、冥锤扫狱 | 防御力下降50% | negative |
| `fear` | 恐惧 | 恐惧类技能 | 只能移动，无法攻击或使用技能 | negative |
| `fury` | 愤怒 | 二爷咆哮、绝处逢生、吞酒狂啸、沸血猛击 | 攻击力提升20%，防御力下降20% | positive |
| `strong` | 强力 | 落土飞岩、举火焚天、奕剑听雨、疯魔琴心 | 攻击力提升10% | positive |
| `fierce` | 凶悍 | 凶悍类技能 | 攻击力提升20% | positive |
| `resolute` | 刚毅 | 蛮甲冲击、息壤再生、水漫金山 | 防御力提升30% | positive |
| `undying` | 不灭 | 不灭类技能 | 防御力提升50% | positive |
| `swift` | 迅捷 | 浮光掠影、奕剑听雨 | 移动力提升1 | positive |
| `lame` | 瘸腿 | 天罗地网、攻城重炮副作用 | 移动力减少1 | negative |
| `heal` | 愈合 | 百鸟朝凤、碧海潮生、桃花灼灼、无敌牛牛 | 每回合恢复5%最大生命值 | positive |
| `regen` | 再生 | 再生类技能 | 每回合恢复10%最大生命值 | positive |
| `tune` | 调息 | 余音绕梁、阴阳气合、神之一手 | 每回合恢复5%最大法力值 | positive |
| `meditate` | 静心 | 静心类技能 | 每回合恢复10%最大法力值 | positive |
| `crumble` | 脆皮 | 怒砸葫芦、告别暝灯 | 生命值上限下降20%，防御力下降20% | negative |
| `weakened` | 削弱 | 千里冰封 | 攻击力下降10%，防御力下降10% | negative |
| `imprison` | 禁锢 | 邪恶捆绑、锁魂、囚灵、旧籍封灵 | 不能移动 | negative |
| `mili` | 迷离 | 邪神低语、藏剑一叶、桃之夭夭 | 攻击力下降10% | negative |
| `xinluan` | 心乱 | 灵魂扰乱、魅惑、亡者之气 | 攻击力下降20%，防御力下降20% | negative |
| `eagle_eye` | 鹰眼 | 墨羽鹤翎、神之一手、攻城重炮 | 攻击范围+1 | positive |
| `zhangmu` | 障目 | 障目类技能 | 攻击范围-1 | negative |

**状态应用与驱散调用流程：**
```
addStatusToCharacter()
├── 检查状态是否已存在
├── 若已存在且duration>0，取最长duration
├── 若为新状态，push到char.statuses数组
├── 若为crumble状态，保存maxHpBeforeCrumble并降低maxHp
└── 非静默模式：添加战斗日志

removeStatusFromCharacter()
├── 从char.statuses数组中移除指定状态
├── 若为crumble状态，恢复maxHpBeforeCrumble
└── 添加战斗日志

dispelAllNegativeStatuses()（治疗技能调用）
├── 遍历NEGATIVE_STATUSES（基于STATUS_CONFIG的tag自动派生，所有tag==='negative'的状态）
│   ├── 对每个negative状态检查hasStatus()
│   ├── 调用removeStatusFromCharacter()移除
│   └── 记录被驱散的状态名
└── 添加战斗日志
```

**自动派生机制说明：**
- `NEGATIVE_STATUSES` 由 `STATUS_CONFIG` 中所有 `tag === 'negative'` 的状态自动派生
- `POSITIVE_STATUSES` 由 `STATUS_CONFIG` 中所有 `tag === 'positive'` 的状态自动派生
- 新增状态只需在 `STATUS_CONFIG` 中配置正确的 `tag`，驱散逻辑自动生效
- 当前 negative 状态包括：poison, burning, silenced, bleeding, cold, disorder, stun, weak, fragile, fear, lame, crumble, weakened, imprison, mili, xinluan, zhangmu

##### 战斗结算

| 函数名 | 描述 | 调用关系 |
|-------|------|---------|
| `endBattle(victory, isEscape)` | 结束战斗并结算 | checkBattleEnd()调用 |

**调用流程：**
```
endBattle(victory, isEscape)
├── 根据结果结算
│   ├── 胜利：
│   │   ├── 收集所有未拾取的消耗品
│   │   ├── 获得金币奖励（基于敌人等级和数量）
│   │   ├── 获得宝箱奖励
│   │   └── 角色获得经验（战败角色减半）
│   └── 战败/逃离：
│       └── 角色获得经验（敌人等级×击败数×5）
├── 更新角色经验并检查升级
├── 关闭战斗界面
└── saveGame()
```

##### 战斗辅助

| 函数名 | 描述 | 调用关系 |
|-------|------|---------|
| `addBattleLog(message)` | 添加战斗日志 | 各种战斗操作后调用 |
| `triggerShake(row, col, type)` | 触发抖动特效 | 攻击命中后调用（支持角色和建筑） |
| `findCharacterTemplateInStore(charId)` | 查找角色模板 | 多处调用 |
| `removeCharacterFromBattle(charId, isPlayer)` | 从战场移除角色 | 角色HP≤0时调用（腐蚀粘液主动退场也调用） |
| `removeBuildingFromBattle(buildingId)` | 从战场移除建筑 | 建筑HP≤0时调用 |
| `dispelAllNegativeStatuses(character)` | 驱散所有不良状态 | 治疗驱散技能调用 |

#### 阵营指令系统

| 函数名 | 描述 | 调用关系 |
|-------|------|---------|
| `setFactionCommand(command)` | 设置阵营指令 | battle.vue界面调用 |
| `addGatheringPoint(row, col)` | 添加集结点 | 选择集结点时调用 |
| `removeGatheringPoint(row, col)` | 移除集结点 | 取消选择时调用 |
| `confirmGatheringPoints()` | 确认集结点选择 | 完成选择时调用 |
| `toggleGatherPointSelection(active)` | 切换集结点选择状态 | UI调用 |

---

## 页面组件调用关系

### start.vue (启动页)

```
start.vue
├── onMounted()
│   └── getSaveSlots() → 显示存档列表
├── 全新游戏按钮
│   └── initGame()
│       └── navigateTo('/pages/index/index')
└── 加载存档按钮
    └── loadFromSlot(slotId)
        └── navigateTo('/pages/index/index')
```

### index.vue (主界面)

```
index.vue
├── 人物信息 → navigateTo('/pages/character/character')
├── 家园建设 → navigateTo('/pages/home/home')
├── 准备战斗 → navigateTo('/pages/battle-select/battle-select')
├── 背包仓库 → navigateTo('/pages/inventory/inventory')
├── 角色图鉴 → navigateTo('/pages/character-book/character-book')
├── 下一阶段 → nextPhase()
├── 导出存档 → 复制存档到剪贴板
└── 导入存档 → 从剪贴板恢复存档
```

---

## 技能标签颜色说明

### 技能类型标签 (`skillTypeTag`)

| 标签 | 颜色 | 色值 |
|------|------|------|
| 攻击 | 红色 | #f87171 |
| 治疗 | 绿色 | #4ade80 |
| 辅助 | 蓝色 | #60a5fa |
| 特殊 | 黄色 | #fbbf24 |
| 召唤 | 粉色 | #f472b6 |

### 范围标签 (`rangeTag`)

| 标签 | 颜色 | 色值 |
|------|------|------|
| 1格 | 绿色 | #4ade80 |
| 2格 | 蓝色 | #60a5fa |
| 3格 | 红色 | #f87171 |
| 4格/5格 | 黄色 | #fbbf24 |

### 目标数量标签 (`targetCountTag`)

| 标签 | 颜色 | 色值 |
|------|------|------|
| AOE | 黄色 | #fbbf24 |
| 直线 | 粉色 | #f472b6 |
| 1个 | 绿色 | #4ade80 |
| 2个 | 蓝色 | #60a5fa |
| 3个/多个 | 红色 | #f87171 |

---

### character.vue (角色信息)

```
character.vue
├── 显示角色属性和装备
├── getHireCost(char) → 计算雇佣金额
│   └── 公式: maxHp + maxMp + 5×attack + 5×defense + 50×moveRange + 50×attackRange
├── 装备管理
│   ├── 点击装备槽 → 选择背包物品 → equipItem()
│   └── 点击已装备物品 → unequipItem()
└── 技能列表 → 显示技能冷却
```

### battle-select.vue (战斗准备)

```
battle-select.vue
├── 选择战斗模式（主动进攻/家园防御）
├── 选择难度（简单/正常/困难/噩梦/绝命）
├── 选择地形（平原/河流/山地）
├── 选择参战角色
├── 选择敌方阵营（人界/鬼界/仙界等）
└── 开始战斗按钮
    └── startBattle(mode, terrain, difficulty, selectedIds, selectedFactions)
        └── navigateTo('/pages/battle/battle')
```

### battle.vue (战斗界面)

```
battle.vue
├── 渲染战斗地图
│   ├── 显示地形：battleMap.tiles
│   ├── 显示角色：battleMap.players/enemies
│   ├── 显示建筑：battleMap.buildings
│   ├── 显示收集品：battleMap.collectibles
│   └── 显示特效：shakingTargets, targetedByTianqiPao
├── 选择角色
│   ├── 显示移动范围：getCharacterMoveRange()
│   └── 显示攻击/技能目标（区分多目标、位置指定等特殊技能）
├── 移动角色
│   └── moveCharacter(charId, row, col)
├── 普通攻击
│   └── attack(attackerId, targetId)
├── 攻击建筑
│   └── attackBuilding(attackerId, buildingId)
├── 使用技能
│   └── useSkill(skillId, attackerId, targetId, targetPos, multiTargets)
│       └── 特殊技能UI限制：
│           └── 腐蚀粘液：HP>20%时禁用按钮
├── 防御
│   └── defend(characterId)
├── 拾取收集品
│   └── collectItem(charId, itemId)
├── 结束行动
│   └── endPlayerTurn()
├── 逃离战斗
│   └── endBattle(false, true)
└── 战斗记录面板
    └── 显示battleLog（文字记录 + 数据统计柱状图）
```

### character-book.vue (角色图鉴)

```
character-book.vue
├── 顶部阵营标签页（6个阵营）
├── 角色卡片列表（按阵营筛选）
│   ├── 角色头像
│   ├── 角色名称和职业（属性标签）
│   ├── 1级初始属性
│   ├── 升级成长属性
│   └── 技能列表（名称、消耗、冷却、描述）
└── 雇佣角色按钮 → hireCharacter(templateId)
```

### inventory.vue (背包)

```
inventory.vue
├── 显示物品列表
│   ├── 装备：显示品质和属性
│   └── 消耗品：显示数量
├── 装备物品
│   └── 选择物品 → 选择角色 → equipItem()
├── 使用消耗品
│   └── useItem(itemId)
└── 打开宝箱
    └── openChest() → 添加到背包
```

### home.vue (家园建设)

```
home.vue
├── 显示家园网格（9×9）
├── 放置建筑
│   └── updateHomeGrid(row, col, {building})
└── 移除建筑
    └── updateHomeGrid(row, col, {building: null})
```

---

## 伤害计算公式详解

```typescript
攻击力 = 角色攻击属性 × (1 + 状态攻击加成%) × (1 + attackBoost%) × (1 + 阵营攻击加成%)
防御力 = 角色防御属性 × (1 + 状态防御加成%) × 防御姿态(1.2) × (1 - 防御降低%) × (1 - 永久防御降低%) × (1 + 阵营防御加成%)

最终伤害 = max(1, floor(攻击力 × 技能倍率 - 防御力))
```

**阵营攻击加成（基于煞气）：**
| 煞气值 | 加成 |
|--------|------|
| < 60 | 0% |
| ≥ 60 | +5% |
| ≥ 100 | +10% |

**阵营防御加成（基于灵气）：**
| 灵气值 | 加成 |
|--------|------|
| < 60 | 0% |
| ≥ 60 | +20% |
| ≥ 100 | +40% |

**其他参数说明：**
- 角色攻击属性 = BattleCharacter.attack（已包含装备加成）
- 角色防御属性 = BattleCharacter.defense（已包含装备加成）
- attackBoost：绝处逢生(+10%)、二爷咆哮(+30%)、举火焚天(+10%) 等技能提供
- 防御降低 = defenseReduction（口吐粘液50%、腐蚀粘液50%）+ defenseReductionPermanent
- 技能倍率：100% = 1.0, 150% = 1.5, 以此类推
- 最小伤害 = 1

---

## 阵营灵气煞气系统

### 系统概述

战斗中双方阵营各拥有灵气和煞气两种资源，用于提供阵营级别的攻击和防御加成。

### 数据结构

**BattleMap 接口新增字段：**
| 字段 | 类型 | 描述 |
|------|------|------|
| `playerReiki` | number | 我方灵气值（0-100） |
| `playerShaQi` | number | 我方煞气值（0-100） |
| `enemyReiki` | number | 敌方灵气值（0-100） |
| `enemyShaQi` | number | 敌方煞气值（0-100） |

**BattleCharacter 接口新增字段：**
| 字段 | 类型 | 描述 |
|------|------|------|
| `faction` | string | 角色阵营 |
| `job` | string | 角色职业 |

### 灵气/煞气机制

- **增加灵气值**：击败敌方单位（+5）、击败敌方建筑（+10）
- **增加煞气值**：击败敌方单位（+5）、击败敌方建筑（+10）
- **阵营攻击加成（基于煞气）**：
  - 煞气 < 60：0%
  - 煞气 ≥ 60：+5% 攻击力
  - 煞气 ≥ 100：+10% 攻击力
- **阵营防御加成（基于灵气）**：
  - 灵气 < 60：0%
  - 灵气 ≥ 60：+20% 防御力
  - 灵气 ≥ 100：+40% 防御力

### 相关函数

| 函数名 | 描述 |
|-------|------|
| `addReiki(amount)` | 增加我方灵气值 |
| `addShaQi(amount)` | 增加我方煞气值 |
| `getFactionAttackBonus()` | 计算阵营攻击加成（基于煞气） |
| `getFactionDefenseBonus()` | 计算阵营防御加成（基于灵气） |

---

## 技能系统接口定义

### Skill 接口（完整字段）

```typescript
interface Skill {
  id: string
  name: string
  mpCost: number
  type: 'attack' | 'heal' | 'support' | 'passive'
  power: number
  cooldown: number
  currentCooldown: number
  description?: string
  range?: number
  areaRange?: number
  effectType?: 'fire' | 'ice' | 'thunder' | 'shadow' | 'holy' | 'earth' | 'metal' | 'wood' | 'water' | 'wind'
  targetCount?: number
  attribute?: Attribute
  category?: '指定' | 'aoe' | '直线' | '横扫' | 'heal' | 'support' | 'summon' | 'special'
  damageFormula?: 'power' | 'atk_plus_hp_pct' | 'move_based'
  hpPct?: number
  skillTypeTag?: string
  rangeTag?: string
  targetCountTag?: string
  statusEffect?: StatusType
  statusEffectDuration?: number
  statusEffects?: StatusType[]
  statusEffectsDurations?: number[]
  clearObstacles?: boolean
  rangeType?: 'diamond' | 'square'
  sweepLength?: number
  sweepWidth?: number
  selfDefeat?: boolean
  summonZombie?: boolean
  lifesteal?: number
  selfHpCost?: number
  selfStatusEffects?: StatusType[]
  clearPositiveStatus?: boolean
  createSnowTerrain?: boolean
  selfMaxHpBuff?: number
  summonCharacter?: string
  summonJob?: string
}
```

### Skill 字段说明表

| 字段 | 类型 | 描述 |
|------|------|------|
| `id` | string | 技能唯一标识符（如 `suo_hun`） |
| `name` | string | 技能显示名称（如 锁魂） |
| `mpCost` | number | 使用技能消耗的法力值 |
| `type` | enum | 技能类型：attack（攻击）/ heal（治疗）/ support（辅助）/ passive（被动） |
| `power` | number | 技能基础威力（百分比，如 130 表示 130%） |
| `cooldown` | number | 技能冷却回合数 |
| `currentCooldown` | number | 当前剩余冷却回合数（运行时动态管理） |
| `description` | string | 技能描述文本 |
| `range` | number | 技能释放范围（格子数） |
| `areaRange` | number | AOE技能影响半径（以目标为中心） |
| `effectType` | enum | 技能特效类型（fire/ice/thunder等） |
| `targetCount` | number | 多目标技能的目标数量（默认1） |
| `attribute` | Attribute | 技能属性（影响字幕颜色） |
| `category` | enum | 技能分类：指定/aoe/直线/横扫/heal/support/summon/special |
| `damageFormula` | enum | 伤害计算公式：power（标准）/ atk_plus_hp_pct（攻击力+生命百分比）/ move_based（距离相关） |
| `hpPct` | number | 当damageFormula为atk_plus_hp_pct时，目标当前生命值的百分比系数 |
| `skillTypeTag` | string | 技能类型标签（攻击/辅助/治疗/特殊） |
| `rangeTag` | string | 范围标签（1格/2格/3格等） |
| `targetCountTag` | string | 目标数量标签（AOE/1个/2个/3个等） |
| `statusEffect` | StatusType | 技能对目标施加的单个状态效果 |
| `statusEffectDuration` | number | 状态效果持续回合数（0表示永久） |
| `statusEffects` | StatusType[] | 技能对目标施加的多个状态效果 |
| `statusEffectsDurations` | number[] | 对应statusEffects的持续回合数 |
| `clearObstacles` | boolean | AOE技能是否清除范围内的障碍物 |
| `rangeType` | enum | AOE范围类型：diamond（菱形，曼哈顿距离）/ square（正方形） |
| `sweepLength` | number | 横扫技能的长度（沿方向的格子数） |
| `sweepWidth` | number | 横扫技能的宽度（垂直方向的格子数） |
| `selfDefeat` | boolean | 使用后自身是否战败退场（自爆毒液、腐蚀粘液） |
| `summonZombie` | boolean | 使用后是否召唤丧尸（恐怖尖叫） |
| `lifesteal` | number | 吸血比例（0-1，如0.333表示回复33%伤害为HP） |
| `selfHpCost` | number | 自身生命值消耗比例（0-1） |
| `selfStatusEffects` | StatusType[] | 使用后自身获得的状态效果 |
| `clearPositiveStatus` | boolean | 是否驱散目标所有正面状态（扰乱心神） |
| `createSnowTerrain` | boolean | 是否在目标脚下创建雪地地形（天寒地冻） |
| `selfMaxHpBuff` | number | 自身生命值上限提升比例（红花绿叶） |
| `summonCharacter` | string | 召唤技能指定的角色ID（召唤娃娃→kuilei，召唤女皇→kuileinvhuang，召唤幽驹→youju） |
| `summonJob` | string | 召唤技能指定的职业类型（召唤灵宠→灵宠） |

### HIREABLE_CHARACTERS 完整列表

| ID | 名称 | 阵营 | 职业 |
|----|------|------|------|
| baohu | 恶霸 | human | 士兵 |
| qianfu | 潜伏者 | human | 士兵 |
| yiliao | 医疗兵 | human | 士兵 |
| juji | 狙击手 | human | 士兵 |
| tezhongbing | 特总兵 | human | 士兵 |
| kuangren | 狂人 | human | 士兵 |
| dongyuan_bing | 动员兵 | human | 士兵 |
| penhuobing | 喷火兵 | human | 士兵 |
| geliya | 歌莉娅 | human | 机甲 |
| tanke | 坦克 | human | 机甲 |
| kejiqiu | 科技球 | human | 机甲 |
| chilian | 赤炼 | human | 流沙 |
| ordinary_zombie | 普通丧尸 | ghost | 普通丧尸 |
| pangfu_zombie | 肥胖丧尸 | ghost | 变异丧尸 |
| xunmeng_zombie | 迅猛丧尸 | ghost | 变异丧尸 |
| paxing_zombie | 爬行丧尸 | ghost | 变异丧尸 |
| changshe_zombie | 长舌丧尸 | ghost | 变异丧尸 |
| little_zombie | 小鬼丧尸 | ghost | 普通丧尸 |
| pharaoh_zombie | 法老丧尸 | ghost | 变异丧尸 |
| jianjiao_zombie | 尖叫丧尸 | ghost | 变异丧尸 |
| fushui_zombie | 浮肿丧尸 | ghost | 变异丧尸 |
| machine_zombie | 机械丧尸 | ghost | 人造丧尸 |
| eseng | 恶僧 | ghost | 厉鬼 |
| niutou | 牛头 | ghost | 厉鬼 |
| mamian | 马面 | ghost | 厉鬼 |
| zhengjia | 震枷 | ghost | 鬼魂 |
| canjuan_hun | 残卷魂 | ghost | 鬼魂 |
| tie_gao | 铁锆 | ghost | 鬼魂 |
| nanxiushi | 男修士 | immortal | 炼气修士 |
| nvxiushi | 女修士 | immortal | 炼气修士 |
| jinxiushi | 金系修士 | immortal | 筑基修士 |
| muxioushi | 木系修士 | immortal | 筑基修士 |
| shuixiushi | 水系修士 | immortal | 筑基修士 |
| tuxiushi | 土系修士 | immortal | 筑基修士 |
| huoxiushi | 火系修士 | immortal | 筑基修士 |
| baihu | 白狐 | immortal | 灵宠 |
| songyu | 宋玉 | immortal | 金丹修士 |
| tianxiang | 天香 | immortal | 金丹修士 |
| nongyu | 弄玉 | immortal | 金丹修士 |
| lingyu | 翎羽 | god | 神兵 |
| bingxin | 冰心 | god | 神兵 |
| huanghuo | 荒火 | god | 神兵 |
| yijian | 奕剑 | god | 金丹修士 |
| shaosiming | 少司命 | demon | 魔将 |
| xixuegui | 吸血鬼 | demon | 魔族 |
| shaman | 萨满 | demon | 魔族 |
| meimo | 魅魔 | demon | 魔族 |
| youju | 幽驹 | demon | 魔兽 |
| dasiming | 大司命 | demon | 魔将 |
| xinghun | 星魂 | demon | 魔将 |
| longming | 龙溟 | demon | 魔将 |
| longyou | 龙幽 | demon | 魔将 |
| shouren | 血手 | demon | 魔族 |
| duoying | 毒影 | demon | 魔族 |
| shouren_zu | 兽人 | demon | 魔兽 |
| muoushi | 木偶师 | demon | 魔将 |
| tian_tu | 天兔 | beast | 生肖 |
| tian_niu | 天牛 | beast | 生肖 |
| tian_shu | 天鼠 | beast | 生肖 |
| zhu_yao | 猪妖 | beast | 精怪 |
| yaoqinshi | 妖琴师 | beast | 妖怪 |
| luoxin_fu | 络新妇 | beast | 妖怪 |
| taohua_yao | 桃花妖 | beast | 妖怪 |
| tunjiu_yao | 吞酒妖 | beast | 妖怪 |
| jing_yao | 鲸妖 | beast | 妖怪 |
| qi_yao | 棋妖 | beast | 妖怪 |
| jing_yao_female | 镜妖 | beast | 妖怪 |
| hu_yao | 虎妖 | beast | 妖怪 |
| guo_hua_niao | 姑获鸟 | beast | 大妖 |
| qing_xing_deng | 青行灯 | beast | 大妖 |
| kuilei | 傀儡娃娃 | demon | 傀儡 |
| kuileinvhuang | 傀儡女皇 | demon | 傀儡 |

### JOB_CONFIG 职业位阶配置

| 职业 | 位阶 |
|------|------|
| 天命人 | 3阶 |
| 士兵 | 2阶 |
| 机甲 | 3阶 |
| 普通丧尸 | 1阶 |
| 变异丧尸 | 2阶 |
| 人造丧尸 | 2阶 |
| 厉鬼 | 3阶 |
| 鬼魂 | 3阶 |
| 炼气修士 | 1阶 |
| 筑基修士 | 2阶 |
| 金丹修士 | 3阶 |
| 傀儡 | 1阶 |
| 魔兽 | 1阶 |
| 魔族 | 2阶 |
| 魔将 | 3阶 |
| 灵宠 | 1阶 |
| 精怪 | 1阶 |
| 妖怪 | 2阶 |
| 大妖 | 3阶 |
| 生肖 | 4阶 |
| 神兵 | 2阶 |
| 流沙 | 2阶 |