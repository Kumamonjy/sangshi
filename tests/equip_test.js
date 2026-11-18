/* 装备系统验证（无新手装版）：定义/空初始/派生属性/穿卸/装备技能/掉落/迁移 */
const fs = require('fs');
const html = fs.readFileSync('/workspace/index.html', 'utf8');
const scripts = html.match(/<script>([\s\S]*?)<\/script>/g);
let code = scripts[scripts.length - 1].replace(/^<script>/, '').replace(/<\/script>\s*$/, '');
const bootIdx = code.lastIndexOf("Game.renderHome();\n  window.addEventListener('resize'");
code = code.slice(0, bootIdx) + "window.__T = { Game, Battle, UI, DATA };\n})();";
const elems = {};
function mkEl(){ return { innerHTML:'', textContent:'', style:{ setProperty(){} }, disabled:false, scrollTop:0, value:'', dataset:{}, children:[], className:'', classList:{toggle(){},add(){},remove(){},contains:()=>false}, setAttribute(){}, removeAttribute(){}, appendChild(c){this.children.push(c);return c;}, remove(){}, addEventListener(){}, focus(){}, blur(){}, querySelector(){return null;}, querySelectorAll(){return [];}, getBoundingClientRect(){return{width:400,height:700,top:0,left:0};} }; }
global.document = { getElementById:id=>elems[id]||(elems[id]=mkEl()), querySelector:()=>mkEl(), querySelectorAll:()=>[], addEventListener(){}, createElement:()=>mkEl(), body:mkEl() };
global.window = { addEventListener(){}, location:{search:''}, scrollTo(){}, innerWidth:400, innerHeight:700 };
global.localStorage = { getItem:()=>null, setItem(){}, removeItem(){} };
global.navigator = { userAgent:'node' };
eval(code);
const assert=(c,n)=>console.log(c?'PASS '+n:'FAIL '+n);
const { Game, Battle, UI, DATA } = window.__T;
Game.g = Game.newGame(); Game.currentSlot = 1;
const g = Game.g;
const [s1, s2] = g.chars;

(async () => {
  // ===== T1 装备定义 =====
  assert(DATA.EQUIPS.cloth && DATA.EQUIPS.cloth.slot==='armor' && DATA.EQUIPS.cloth.stats.hp===25 && DATA.EQUIPS.cloth.stats.def===5, 'T1a 布衣：衣服槽 HP+25 防+5');
  assert(DATA.EQUIPS.cshoes.stats.hp===10 && DATA.EQUIPS.cshoes.stats.stamina===10 && DATA.EQUIPS.cshoes.stats.def===3, 'T1b 布鞋：HP+10 体力+10 防+3');
  assert(DATA.EQUIPS.chood.stats.hp===20 && DATA.EQUIPS.chood.stats.def===5, 'T1c 布帽：HP+20 防+5');
  assert(DATA.EQUIPS.stick.slot==='weapon' && DATA.EQUIPS.stick.stats.atk===5, 'T1d 木棍：武器槽 攻+5');
  assert(DATA.EQUIPS.stone.slot==='item' && !DATA.EQUIPS.stone.stats && DATA.EQUIPS.stone.consumable && DATA.EQUIPS.stone.skill.mult===0.5 && DATA.EQUIPS.stone.skill.range===3, 'T1e 石块：道具槽消耗品 无属性+全力投掷(3格50%)');
  assert(DATA.SLOTS.length===6 && DATA.SLOTS.map(s=>s.id).join()=='weapon,head,armor,shoes,acc,item', 'T1f 六槽位定义');

  // ===== T2 初始无装备 =====
  const e0 = s1.equip;
  assert(Object.values(e0).every(v=>v===null), 'T2a 新角色六格全空（无新手装）');
  assert(g.bag.cloth===2 && g.bag.cshoes===2 && g.bag.stone===2 && Object.keys(g.bag).length===3, 'T2b 新档背包自带 2 布衣 2 布鞋 2 石块');

  // ===== T3 空装备时 eff=基础 =====
  const baseAtk = s1.atk, baseDef = s1.def, baseHp = s1.maxHp, baseSt = s1.maxStamina;
  assert(Game.effAtk(s1)===baseAtk && Game.effDef(s1)===baseDef && Game.effHp(s1)===baseHp && Game.effSt(s1)===baseSt, 'T3a 空装备时属性=基础值');
  assert(Game.createChar('civilian','阿空',false).maxStamina===Game.effSt(Game.createChar('civilian','阿空2',false)), 'T3b 新角色均无装备加成');

  // ===== T4 穿上装备后 mkAlly 加成 + 装备技能 =====
  g.bag = {}; g.bagInst = [];
  ['cloth','cshoes','chood','stick','stone'].forEach(id=>Game.addEquip(id,1));
  Game.equipChar(s1.id,'armor','cloth'); Game.equipChar(s1.id,'head','chood');
  Game.equipChar(s1.id,'shoes','cshoes'); Game.equipChar(s1.id,'weapon','stick'); Game.carryItem(s1.id,'stone');
  assert(g.bag.stone===0 && s1.item && s1.item.id==='stone' && s1.item.count===1, 'T4a 五格装备+道具携带成功（背包清空）');
  const u = Battle.mkAlly(s1, 5, 5);
  assert(u.atk===baseAtk+5 && u.def===baseDef+13 && u.maxHp===baseHp+55 && u.maxStamina===baseSt+10, 'T4b mkAlly 属性含装备加成（石块无属性）');
  assert(u.skills.some(sk=>sk.name==='全力投掷' && sk.equipSkill), 'T4c 装备技能进入技能列表');
  const baseSkills = (DATA.CLASSES[s1.cls].skills || [DATA.CLASSES[s1.cls].skill]);
  assert(u.skills.length===baseSkills.length+1, 'T4d 技能数 = 职业+1 装备技能');

  // ===== T5 装备技能实战（全力投掷 3 格 50%） =====
  const foe = Battle.mkZombie('walker', 5, 8, 1);   // 距离3
  Battle.b = { units:[u, foe], selected:u, terrain:Array.from({length:Battle.ROWS},()=>Array.from({length:Battle.COLS},()=>'plain')),
    mode:null, turn:1, phase:'player', weather:'sunny', stats:{}, log:[], logEl:null, loot:{}, ruins:{}, over:false, subtitleT:null, zLevel:1, speed:1, zone:DATA.ZONES[0], doubledReward:false };
  u.critRate = 0;
  const throwSk = u.skills.find(sk=>sk.name==='全力投掷');
  const expDmg = Math.max(1, Math.round(u.atk*0.5) - foe.def);
  const hp0 = foe.hp;
  await Battle.execSkill(u, { sk:throwSk, target:foe });
  assert(hp0-foe.hp===expDmg, `T5a 全力投掷造成 ${expDmg} 伤害（50%攻 ${u.atk}）`);
  const far = Battle.mkZombie('walker', 5, 9, 1); far.hp = 999; far.maxHp = 999;
  Battle.b.units.push(far);
  const cells = Battle.attackCells(u, throwSk.range||u.range);
  assert(!cells.some(([r,c])=>r===far.row&&c===far.col) && cells.some(([r,c])=>r===5&&c===8), 'T5b 技能射程 3 格（4 格目标不可选）');

  // ===== T6 穿卸装备（s2 身上为空：穿/卸） =====
  g.bag = {}; g.bagInst = [];
  Game.addEquip('cloth',1);
  const eff0 = Game.effHp(s2);                        // 空装备基准
  Game.equipChar(s2.id, 'armor', 'cloth');
  assert(s2.equip.armor && s2.equip.armor.id==='cloth' && g.bag.cloth===0 && Game.effHp(s2)===eff0+25, 'T6a 空槽穿上布衣（+25）');
  s2.hp = eff0 + 25;                                  // 满血（含装备加成）
  Game.equipChar(s2.id, 'armor', null);              // 卸下 → 放回背包
  assert(s2.equip.armor===null && g.bag.cloth===1, 'T6b 卸下放回背包');
  assert(Game.effHp(s2)===eff0, 'T6c 卸下后生命上限回退');
  assert(s2.hp===eff0, 'T6d 卸下后当前生命自动截断到新上限');

  // ===== T7 掉落入背包 =====
  g.bag = {}; g.bagInst = [];
  const origRandom = Math.random;
  Math.random = () => 0.1;   // 固定 <0.2 触发掉落
  s1.stamina = 100;
  Battle.b = { units:[Battle.mkAlly(s1,5,5), Battle.mkZombie('walker',0,5,1)], selected:null, terrain:Array.from({length:Battle.ROWS},()=>Array.from({length:Battle.COLS},()=>'plain')),
    mode:null, turn:1, phase:'player', weather:'sunny', stats:{}, log:[], logEl:null, loot:{gold:2}, ruins:{}, over:false, subtitleT:null, zLevel:1, speed:1, zone:DATA.ZONES[0], doubledReward:false };
  Battle.b.units[1].hp = 0;
  Battle.finish('win');
  Math.random = origRandom;
  const dropped = Object.keys(g.bag).filter(id=>g.bag[id]>0);
  assert(dropped.length===1 && DATA.EQUIPS[dropped[0]], 'T7a 胜利掉落一件装备入背包');
  const modalTxt = Object.values(elems).map(e=>e.innerHTML).join('|');
  assert(modalTxt.includes('装备掉落'), 'T7b 结算弹窗显示掉落信息');

  // ===== T8 旧档迁移（不补装备，只补空结构） =====
  const oldChar = Game.createChar('civilian', '老张', false);
  delete oldChar.equip;
  const oldSave = { v:1, ts:Date.now(), day:2, uid:7000, state:{ day:2, weather:'sunny', res:{gold:50,med:1,metal:0,food:30,fabric:0}, chars:[oldChar], seenMilestones:[], kitchenLv:0, kitchenChef:null, dormLv:0, dormBeds:[], gymLv:0, gymSlots:[], todayExplored:0 } };
  Game.applySave(oldSave, 1);
  const migrated = Game.g.chars[0];
  assert(Game.g.bag && typeof Game.g.bag==='object' && typeof Game.g.workshopLv==='number', 'T8a 旧档补 bag/workshopLv');
  assert(migrated && migrated.equip && Object.values(migrated.equip).every(v=>v===null), 'T8b 旧档角色补空装备结构（不补装备本体）');

  console.log('--- done ---');
  process.exit(0);
})().catch(e=>{ console.error('TEST ERROR:', e.message); process.exit(1); });
