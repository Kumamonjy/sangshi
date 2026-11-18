/* V64 厨房烤面包：workCost 50 / 烤面包按钮 / 面包消耗品战斗回体力（含自己） */
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
  // ===== T1 面包定义 =====
  const bd = DATA.EQUIPS.bread;
  assert(bd && bd.consumable===true && !bd.stats && bd.slot==='item' && bd.icon==='🥖', 'T1a 面包=消耗品（无属性，slot item）');
  assert(bd.skill && bd.skill.name==='吃面包' && bd.skill.type==='regen' && bd.skill.regenAmt===20 && bd.skill.cost===0
    && bd.skill.range===1 && bd.skill.includeSelf===true && bd.skill.equipSkill===true, 'T1b 技能参数（regen 20 / 0体力 / 1格 / 含自己 / equipSkill）');

  // ===== T2 厨房工作消耗 50 =====
  assert(DATA.KITCHEN.workCost===50, 'T2a 厨房 workCost=50');
  g.res.gold = 1000; g.res.food = 20;
  Game.buildKitchen();
  assert(g.kitchenLv===1, 'T2b 建造厨房');
  const cook = Game.createChar('chef', '面点师');
  g.chars.push(cook);
  Game.assignKitchen(cook.id);
  assert(g.kitchenChef===cook.id, 'T2c 指派厨师');
  const buildHtml = elems['build-body'] ? elems['build-body'].innerHTML : '';
  void buildHtml;
  assert(!JSON.stringify(DATA.KITCHEN).includes('30'), 'T2d 数据无旧值 30 残留');

  // ===== T3 烤面包：资源/体力/背包 =====
  const food0 = g.res.food, st0 = cook.stamina, bagB0 = Game.bagCount ? Game.bagCount('bread') : g.bagInst.filter(e=>e.id==='bread').length;
  Game.cookBread();
  const bagB1 = g.bagInst.filter(e=>e.id==='bread').length;
  assert(g.res.food===food0-1 && cook.stamina===st0-10, `T3a 烤面包消耗 1 食物 + 10⚡（${g.res.food}/${cook.stamina}）`);
  assert(bagB1===bagB0+1, `T3b 背包面包 +1（${bagB1}）`);
  // 拒绝：体力不足
  cook.stamina = 5;
  Game.cookBread();
  assert(g.res.food===food0-1 && g.bagInst.filter(e=>e.id==='bread').length===bagB1, 'T3c 厨师体力<10 拒绝');
  cook.stamina = st0;
  // 拒绝：食物不足
  g.res.food = 0;
  Game.cookBread();
  assert(g.bagInst.filter(e=>e.id==='bread').length===bagB1, 'T3d 食物不足拒绝');
  g.res.food = food0;
  // 拒绝：无厨师
  Game.assignKitchen(cook.id);   // 撤职（重复指派触发撤职？若实现为 toast 则手动清）
  if (g.kitchenChef===cook.id) g.kitchenChef = null;
  Game.cookBread();
  assert(g.bagInst.filter(e=>e.id==='bread').length===bagB1, 'T3e 无当值厨师拒绝');
  Game.assignKitchen(cook.id);

  // ===== T4 携带面包进战斗并食用 =====
  Game.addEquip('bread', 3);
  Game.carryItem(s1.id, 'bread'); Game.carryItem(s1.id, 'bread'); Game.carryItem(s1.id, 'bread');
  assert(s1.item && s1.item.id==='bread' && s1.item.count===3, 'T4a 携带 3 个面包');
  const me = Battle.mkAlly(s1, 5, 5);
  const foe = Battle.mkZombie('walker', 5, 7, 1);
  Battle.b = { units:[me, foe], selected:me, terrain:Array.from({length:Battle.ROWS},()=>Array.from({length:Battle.COLS},()=>'plain')),
    mode:null, turn:1, phase:'player', weather:'sunny', stats:{}, log:[], logEl:null, loot:{}, ruins:{}, over:false, subtitleT:null, zLevel:1, speed:1, zone:DATA.ZONES[0], doubledReward:false };
  const eatSk = me.skills.find(s=>s.equipSkill && s.type==='regen');
  assert(eatSk && eatSk.name==='吃面包', 'T4b 吃面包技能入列');
  me.stamina = 100; me.maxStamina = 150;
  Battle.b.pendingSkill = eatSk;
  await Battle.doRegen(me, me);   // 自己吃（includeSelf）
  assert(me.stamina===120, `T4c 恢复 20 体力（${me.stamina}）`);
  assert(me.item.count===2, `T4d 消耗 1 个面包（余 ${me.item.count}）`);
  // 上限截断
  me.stamina = 145;
  Battle.b.pendingSkill = me.skills.find(s=>s.equipSkill && s.type==='regen');
  await Battle.doRegen(me, me);
  assert(me.stamina===150 && me.item.count===1, 'T4e 恢复截断至上限 150');
  // 喂队友（1 格内）
  const mate = Battle.mkAlly(s2, 5, 4);
  Battle.b.units.push(mate);
  mate.stamina = 50; mate.maxStamina = 120;
  me.hasAttacked = false;
  const mateSkills = mate.skills||[];
  void mateSkills;
  Battle.b.pendingSkill = me.skills.find(s=>s.equipSkill && s.type==='regen');
  await Battle.doRegen(me, mate);
  assert(mate.stamina===70 && me.item.count===0, 'T4f 喂 1 格内队友恢复 20、最后一个面包消耗');
  assert(!(me.skills||[]).some(s=>s.equipSkill && s.type==='regen'), 'T4g 用尽后吃面包技能移除');
  Battle.finish('win');
  assert(s1.item===null, 'T4h 战后回写空槽');

  // ===== T5 includeSelf 目标集（吃面包含自己 / 美味料理不含） =====
  const me2 = Battle.mkAlly(s1, 5, 5);
  Battle.b = { units:[me2], selected:me2, terrain:Array.from({length:Battle.ROWS},()=>Array.from({length:Battle.COLS},()=>'plain')),
    mode:null, turn:1, phase:'player', weather:'sunny', stats:{}, log:[], logEl:null, loot:{}, ruins:{}, over:false, subtitleT:null, zLevel:1, speed:1, zone:DATA.ZONES[0], doubledReward:false };
  me2.item = { id:'bread', count:2 };
  me2.skills = [DATA.EQUIPS.bread.skill];
  me2.stamina = 100; me2.maxStamina = 150;
  Battle.pickSkill(0);
  const tset = (Battle.b.targetSet||[]).map(p=>p.join(','));
  assert(tset.includes('5,5'), 'T5a 吃面包目标集含自己格');
  const me3 = Battle.mkAlly(s2, 5, 5);
  me3.skills = [{ name:'美味料理', cost:25, cd:3, type:'regen', shape:'target', regenAmt:15, range:1 }];
  me3.stamina = 100; me3.maxStamina = 150;
  Battle.b.units = [me3]; Battle.b.selected = me3; Battle.b.mode=null;
  Battle.pickSkill(0);
  const tset2 = (Battle.b.targetSet||[]).map(p=>p.join(','));
  assert(!tset2.includes('5,5'), 'T5b 美味料理不含自己格（行为未回归）');

  // ===== T6 面包不进工坊配方、不可升级 =====
  assert(!DATA.RECIPES.some(r=>r.id==='bread'), 'T6a 面包不在工坊配方');
  Game.addEquip('bread', 1);
  UI.openUpgradeModal();
  const upHtml = elems['modal-body'] ? elems['modal-body'].innerHTML : '';
  assert(!upHtml.includes('面包'), 'T6b 升级弹窗不含面包');

  console.log('--- done ---');
  process.exit(0);
})().catch(e=>{ console.error('TEST ERROR:', e.message); process.exit(1); });
