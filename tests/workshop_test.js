/* 工坊建筑 + 布料资源 + 装备制造 验证 */
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

(async () => {
  // ===== T1 布料资源初始化 =====
  assert(typeof g.res.fabric === 'number' && g.res.fabric === 0, 'T1a 新档布料初始 0');
  assert(DATA.ZONES[0].sub.fabric && DATA.ZONES[0].sub.fabric[0]>=2, 'T1b 废弃超市奖励含布料');
  assert(DATA.ZONES.every(z=>z.sub.fabric || z.main.fabric), 'T1c 五个区域均有布料产出');

  // ===== T2 建造工坊 =====
  g.res.gold = 300;
  Game.buildWorkshop();
  assert(g.workshopLv === 1 && g.res.gold === 300-DATA.WORKSHOP.buildCost, 'T2a 建造工坊扣 250 金币');

  // ===== T3 制造石块（金币+金属） =====
  g.res.gold = 100; g.res.metal = 5; g.res.fabric = 0;
  Game.craft('stone');
  assert(g.bag.stone===3 && g.res.gold===100-15 && g.res.metal===5-2, 'T3a 制造石块：扣 15💰+2⚙️（初始2+造1=3）');

  // ===== T4 材料不足拒绝 =====
  g.res.metal = 0;
  Game.craft('stick');   // 需 2 金属
  assert(!g.bag.stick, 'T4a 金属不足不能造木棍');
  g.res.fabric = 1;
  const clothCnt = g.bag.cloth;   // 新档自带 2 件
  Game.craft('cloth');   // 需 4 布料
  assert(g.bag.cloth===clothCnt, 'T4b 布料不足不能造布衣（数量不增）');

  // ===== T5 制造布系装备（布料） =====
  g.res.gold = 500; g.res.fabric = 10;
  Game.craft('chood');
  assert(g.bag.chood===1 && g.res.fabric===10-3 && g.res.gold===500-40, 'T5a 制造布帽：扣 3🧵');
  Game.craft('cshoes');
  assert(g.bag.cshoes===3 && g.res.fabric===7-3 && g.res.gold===460-50, 'T5b 制造布鞋：扣 3🧵（初始2+造1=3）');
  Game.craft('cloth');
  assert(g.bag.cloth===3 && g.res.fabric===4-4 && g.res.gold===410-60, 'T5c 制造布衣：扣 4🧵（初始2+造1=3）');

  // ===== T6 未建工坊不能造（新档） =====
  const g2 = Game.newGame();
  Game.g = g2; g2.res.gold = 500; g2.res.metal = 5;
  Game.craft('stone');
  assert(g2.bag.stone===2 && !g2.bag.stick, 'T6a 未建工坊制造被拒（自带2不增、无棍）');

  // ===== T7 制造面板渲染 =====
  Game.g = g;   // 回到已建工坊档
  UI.renderBuild();
  const bp = elems['build-page'] ? elems['build-page'].innerHTML : Object.values(elems).map(e=>e.innerHTML).join('|');
  assert(bp.includes('工坊') && bp.includes('制造'), 'T7a 建筑页显示工坊与制造按钮');

  // ===== T8 旧档迁移 workshopLv =====
  const oldSave = { v:1, ts:Date.now(), day:4, uid:8000, state:{ day:4, weather:'sunny', res:{gold:50,med:1,metal:0,food:30,fabric:0}, chars:[], seenMilestones:[], kitchenLv:0, kitchenChef:null, dormLv:0, dormBeds:[], gymLv:0, gymSlots:[], todayExplored:0 } };
  Game.applySave(oldSave, 1);
  assert(Game.g.workshopLv === 0, 'T8 旧档自动补 workshopLv');

  // ===== T9 区域奖励结算含布料入库 =====
  const g9 = Game.g;              // T8 applySave 已替换 g，重新取引用
  g9.res.fabric = 0;
  g9.hordeWarning = false;
  const c9 = Game.createChar('soldier', '老九', false);
  g9.chars.push(c9);
  c9.stamina = 100;
  Battle.b = { units:[Battle.mkAlly(c9,5,5), Battle.mkZombie('walker',0,5,1)], selected:null, terrain:Array.from({length:Battle.ROWS},()=>Array.from({length:Battle.COLS},()=>'plain')),
    mode:null, turn:1, phase:'player', weather:'sunny', stats:{}, log:[], logEl:null, loot:{}, ruins:{}, over:false, subtitleT:null, zLevel:1, speed:1, zone:DATA.ZONES[0], doubledReward:false };
  Battle.b.units[1].hp = 0;
  const origRandom = Math.random; Math.random = () => 0.9;   // >0.2 不掉装备
  Battle.finish('win');
  Math.random = origRandom;
  assert(g9.res.fabric >= 2, `T9 超市胜利结算布料入库（+${g9.res.fabric}）`);

  console.log('--- done ---');
  process.exit(0);
})().catch(e=>{ console.error('TEST ERROR:', e.message); process.exit(1); });
