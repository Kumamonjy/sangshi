/* 时间解耦：探索不过夜 + 进入下一天按钮 验证 */
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
const mkB=(units)=>({ units, selected:units[0], terrain:Array.from({length:Battle.ROWS},()=>Array.from({length:Battle.COLS},()=>'plain')),
  mode:null, turn:1, phase:'player', weather:'sunny', stats:{}, log:[], logEl:null,
  loot:{gold:3,med:0,metal:0,food:0}, ruins:{}, over:false, subtitleT:null, zLevel:1, speed:1, zone:DATA.ZONES[0], doubledReward:false });

(async () => {
  // ===== T1 探索不过夜 =====
  const day0 = g.day;
  s1.stamina = s2.stamina = 100;
  Battle.b = mkB([Battle.mkAlly(s1,5,5), Battle.mkAlly(s2,6,5), Battle.mkZombie('walker',0,5,1)]);
  const foe = Battle.b.units.find(u=>u.side==='enemy');
  await Battle.applyDamage(Battle.b.units[0], foe, 999, false, 1);
  Battle.finish('win');
  assert(g.day === day0, 'T1a 探索后天数不变');
  assert(g.todayExplored === 1, 'T1b 探索计数 +1');

  // ===== T2 同一天第二次探索 =====
  Battle.b = mkB([Battle.mkAlly(s1,5,5), Battle.mkZombie('runner',0,6,1)]);
  await Battle.applyDamage(Battle.b.units[0], Battle.b.units[1], 999, false, 1);
  Battle.finish('win');
  assert(g.day === day0, 'T2a 二次探索天数仍不变');
  assert(g.todayExplored === 2, 'T2b 探索计数累加到 2');

  // ===== T3 进入下一天 =====
  s1.stamina = 60; s1.hp = 80;
  const food0 = g.res.food;
  const w0 = g.weather;
  Game.restDay();
  assert(g.day === day0+1, 'T3a 进入下一天天数+1');
  assert(g.todayExplored === 0, 'T3b 新一天探索计数重置');
  const mealCost = g.chars.filter(c=>!c.dead).reduce((s,c)=>s+Game.foodCost(c),0);
  assert(g.res.food === food0-mealCost, `T3c 晚餐扣食物（动态 ${mealCost}，含天赋修正）`);
  assert(s1.stamina > 60 && s1.hp > 80, 'T3d 过夜恢复体力生命');
  const modal1 = Object.values(elems).map(e=>e.innerHTML).join('|');
  assert(modal1.includes('过夜结算'), 'T3e 显示过夜结算弹窗');

  // ===== T4 连续过夜 + 二次探索独立 =====
  g.todayExplored = 0;
  Battle.b = mkB([Battle.mkAlly(s1,5,5), Battle.mkZombie('walker',0,5,1)]);
  await Battle.applyDamage(Battle.b.units[0], Battle.b.units[1], 999, false, 1);
  Battle.finish('win');
  Battle.backHome();
  assert(g.todayExplored === 1, 'T4a 新一天探索计数从 0 开始');
  const day3 = g.day;
  Battle.b = mkB([Battle.mkAlly(s1,5,5), Battle.mkZombie('walker',0,5,1)]);
  await Battle.applyDamage(Battle.b.units[0], Battle.b.units[1], 999, false, 1);
  Battle.finish('flee');
  assert(g.day === day3 && g.todayExplored === 2, 'T4b 撤离同样不过夜且计数+1');

  // ===== T5 旧档迁移 =====
  const oldSave = { v:1, ts:Date.now(), day:5, uid:9000, state:{ day:5, weather:'sunny', res:{gold:100,med:0,metal:0,food:20}, chars:[], seenMilestones:[], kitchenLv:0, kitchenChef:null, dormLv:0, dormBeds:[], gymLv:0, gymSlots:[] } };
  Game.applySave(oldSave, 1);
  assert(typeof Game.g.todayExplored === 'number', 'T5 旧档自动补 todayExplored');

  console.log('--- done ---');
  process.exit(0);
})().catch(e=>{ console.error('TEST ERROR:', e.message); process.exit(1); });
