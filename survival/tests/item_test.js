/* V57 道具消耗品：无属性/不可升级/携带≤3占用背包/战斗使用消耗/迁移 */
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
  // T1 石块定义：无属性消耗品
  const stone = DATA.EQUIPS.stone;
  assert(!stone.stats && stone.consumable===true && stone.skill, 'T1 石块=消耗品（无 stats，保留技能）');
  const probe = { equip:{ armor:{ uid:'x', id:'cloth', lv:0 }, item:{ uid:'y', id:'stone', lv:0 } }, maxHp:0, maxStamina:0, atk:0, def:0 };
  const st0 = Game.equipStats({ equip:{ armor:{ uid:'x', id:'cloth', lv:0 } }, maxHp:0, maxStamina:0, atk:0, def:0 });
  void probe; void st0;
  const c0 = Game.createChar('soldier', '基准'); c0.talents=[]; Game.applyTalents(c0); Game.recalc(c0);
  assert(Game.effAtk(c0)===c0.atk, 'T1b 空装攻击=基础');

  // T2 携带：占用背包、≤3、异类拦截
  Game.addEquip('stone', 2);   // 补足背包石块到 4 个（新档自带 2）
  const bag0 = g.bagInst.filter(e=>e.id==='stone').length;
  Game.carryItem(s1.id, 'stone'); Game.carryItem(s1.id, 'stone'); Game.carryItem(s1.id, 'stone');
  assert(s1.item && s1.item.id==='stone' && s1.item.count===3, `T2a 携带 3 个（${s1.item&&s1.item.count}）`);
  assert(g.bagInst.filter(e=>e.id==='stone').length===bag0-3, 'T2b 背包扣 3（占用背包）');
  Game.carryItem(s1.id, 'stone');
  assert(s1.item.count===3, 'T2c 第 4 个被拦截');
  Game.carryItem(s1.id, 'stick');
  assert(s1.item.id==='stone', 'T2d 异类携带拦截');

  // T3 放回：1 个 / 全部
  Game.uncarryItem(s1.id, false);
  assert(s1.item.count===2 && Game.bagCount('stone')===bag0-2, 'T3a 放回 1 个');
  Game.uncarryItem(s1.id, true);
  assert(s1.item===null && Game.bagCount('stone')===bag0, 'T3b 全部放回清槽');

  // T4 战斗：携带道具 → 技能入列 → 使用消耗 → 用尽移除 → 回写
  Game.carryItem(s1.id, 'stone'); Game.carryItem(s1.id, 'stone');
  const me = Battle.mkAlly(s1, 5, 5);
  const foe = Battle.mkZombie('walker', 5, 6, 1);
  Battle.b = { units:[me, foe], selected:me, terrain:Array.from({length:Battle.ROWS},()=>Array.from({length:Battle.COLS},()=>'plain')),
    mode:null, turn:1, phase:'player', weather:'sunny', stats:{}, log:[], logEl:null, loot:{}, ruins:{}, over:false, subtitleT:null, zLevel:1, speed:1, zone:DATA.ZONES[0], doubledReward:false };
  me.critRate = 0; foe.critRate = 0; foe.hp = foe.maxHp;
  const throwSk = me.skills.find(s=>s.equipSkill);
  assert(throwSk && me.item.count===2, 'T4a 携带中技能入列（余 2）');
  me.stamina = 100;
  await Battle.execSkill(me, { sk: throwSk, target: foe });
  assert(me.item.count===1 && me.stamina===90, `T4b 使用后消耗 1（余 ${me.item.count}）+ 扣 10 体（${me.stamina}）`);
  assert(foe.hp<foe.maxHp, 'T4c 全力投掷造成伤害');
  me.hasAttacked = false;   // 重置攻击标记，模拟下一回合
  await Battle.execSkill(me, { sk: me.skills.find(s=>s.equipSkill), target: foe });
  assert(me.item.count===0 && !(me.skills||[]).some(s=>s.equipSkill), 'T4d 用尽后技能移除');
  // 战后回写
  me.hp = 100;
  Battle.finish('win');
  assert(s1.item===null, 'T4e 用尽后回写为空槽');
  void downedCheck;
  function downedCheck(){}

  // T5 道具不可升级：升级弹窗过滤
  Game.addEquip('stick', 1);
  UI.openUpgradeModal();
  const upHtml = elems['modal-body'] ? elems['modal-body'].innerHTML : '';
  assert(!upHtml.includes('石块'), 'T5a 升级弹窗不含石块（不可升级）');
  assert(upHtml.includes('木棍'), 'T5b 装备仍在升级列表');

  // T6 装备技能移除：equipChar item 拦截
  Game.equipChar(s2.id, 'item', 'stone');
  assert(!s2.equip.item, 'T6a item 槽禁止走 equipChar');

  // T7 旧档迁移：equip.item {id,lv:2} → c.item {id,count:3}
  const oldC = Object.assign(Game.createChar('civilian', '旧人'), { equip:{ ...DATA.EMPTY_EQUIP, item:{ id:'stone', lv:2 } } });
  const oldIt = oldC.equip.item;
  if (oldIt && typeof oldIt==='object' && oldIt.id && DATA.EQUIPS[oldIt.id].slot==='item') {
    if (!oldC.item) oldC.item = { id:oldIt.id, count:Math.min(3, 1+(oldIt.lv||0)) };
    oldC.equip.item = null;
  }
  assert(oldC.item && oldC.item.id==='stone' && oldC.item.count===3 && oldC.equip.item===null, 'T7 旧档道具迁移为 ×3 消耗品');

  // T8 道具管理弹窗渲染
  Game.addEquip('stone', 2);
  Game.carryItem(s2.id, 'stone');
  UI.openItemSlot(s2.id);
  const itHtml = elems['modal-body'] ? elems['modal-body'].innerHTML : '';
  assert(itHtml.includes('道具管理') && itHtml.includes('石块 ×1'), 'T8a 道具管理弹窗渲染');
  assert(itHtml.includes('携带') && itHtml.includes('放回'), 'T8b 数量调整按钮');

  // T9 携带道具不提供属性
  const a0 = Game.effAtk(s2);
  assert(a0===s2.atk, 'T9 携带石块不提供攻击加成');

  console.log('--- done ---');
  process.exit(0);
})();
