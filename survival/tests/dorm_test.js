/* 寝室建筑验证 */
const fs = require('fs');
const html = fs.readFileSync('/workspace/index.html', 'utf8');
const scripts = html.match(/<script>([\s\S]*?)<\/script>/g);
let code = scripts[scripts.length - 1].replace(/^<script>/, '').replace(/<\/script>\s*$/, '');
const bootIdx = code.lastIndexOf("Game.renderHome();\n  window.addEventListener('resize'");
code = code.slice(0, bootIdx) + "window.__T = { Game, Battle, UI, DATA };\n})();";
const elems = {};
function mkEl(){ return { innerHTML:'', textContent:'', style:{}, disabled:false, scrollTop:0, value:'', dataset:{}, children:[], className:'', classList:{toggle(){},add(){},remove(){},contains:()=>false}, setAttribute(){}, removeAttribute(){}, appendChild(c){this.children.push(c);return c;}, remove(){}, addEventListener(){}, focus(){}, blur(){}, querySelector(){return null;}, querySelectorAll(){return [];}, getBoundingClientRect(){return{width:400,height:700,top:0,left:0};} }; }
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
  // ===== T1 配置层 =====
  const D = DATA.DORM;
  assert(D && D.buildCost===150 && D.upgradeCost===150 && D.maxLv===5 && D.regenAmt===50, 'T1a 寝室配置 150/150/Lv5/+50');
  assert(g.dormLv===0 && Array.isArray(g.dormBeds) && !g.dormBeds.length, 'T1b 初始状态未建造');

  // ===== T2 建造与升级 =====
  g.res.gold = 200;
  Game.buildDorm();
  assert(g.dormLv===1 && g.res.gold===50, 'T2a 建造成功 200→50 金币 Lv.1');
  Game.upgradeDorm();
  assert(g.dormLv===1, 'T2b 金币不足升级被拒');
  g.res.gold = 500;
  Game.upgradeDorm();
  assert(g.dormLv===2 && g.res.gold===350, 'T2c 升级到 Lv.2 扣150');

  // ===== T3 床位分配 =====
  Game.assignBed(s1.id);
  assert(g.dormBeds.length===1 && g.dormBeds[0]===s1.id, 'T3a 军人入住');
  Game.assignBed(s1.id);
  assert(g.dormBeds.length===1, 'T3b 重复入住被拒');
  Game.assignBed(s2.id);
  assert(g.dormBeds.length===2, 'T3c 平民入住 Lv.2 满');
  Game.assignBed('nobody');
  assert(g.dormBeds.length===2, 'T3d 满员第3人被拒');
  Game.unassignBed(s2.id);
  assert(g.dormBeds.length===1 && g.dormBeds[0]===s1.id, 'T3e 平民退房');

  // ===== T4 过夜结算 =====
  const s3 = Game.createChar('civilian'); g.chars.push(s3);
  s1.stamina = 100; s1.maxStamina = 150; s1.hp = 100; s1.maxHp = 250;
  s2.stamina = 100; s2.maxStamina = 120; s2.hp = 100; s2.maxHp = 200;
  s3.stamina = 50;  s3.maxStamina = 120; s3.hp = 50;  s3.maxHp = 200; s3.injured = false;
  g.res.food = 0;
  g.dormLv = 2; g.dormBeds = [s1.id, s2.id];
  const r = Game.nextDay([s1.id, s3.id]);
  assert(!r.shortage, 'T4a 手动分配开饭');
  assert(s1.stamina===Game.effSt(s1) && s1.hp===200, 'T4b 军人 吃饱+睡床 = +100⚡+100❤️（⚡封顶装备后上限）');
  assert(s2.stamina===Game.effSt(s2) && s2.hp===150, 'T4c 平民 没饭吃但睡床 = 独立+50⚡+50❤️（⚡封顶装备后上限）');
  assert(s3.stamina===100 && s3.hp===100, 'T4d 平民 吃饱不睡床 = +50⚡+50❤️');
  assert(r.dorm && r.dorm.slept.length===2 && r.dorm.amt===50, 'T4e 结算报告含寝室 2 人');
  const msg = Game.mealMsg(r);
  assert(msg.includes('安睡寝室') && msg.includes(s1.name) && msg.includes(s2.name), 'T4f mealMsg 提示寝室');

  // ===== T5 重伤自愈（睡满即愈）=====
  s2.injured = true; s2.hp = 150; s2.maxHp = 200;
  g.res.food = 100;
  const r2 = Game.nextDay();
  assert(s2.injured===false && s2.hp===Math.min(Game.effHp(s2),250), 'T5a 重伤者 吃饭+睡床 = +100 回满自愈（仍穿装备）');
  assert(s1.stamina===Game.effSt(s1), 'T5b 恢复封顶不溢出（装备后上限）');

  // ===== T6 旧档迁移 =====
  const oldSave = { v:1, ts:Date.now(), day:3, uid:5000, state:{ day:3, weather:'sunny', res:{gold:100,med:0,metal:0,food:10}, chars:[], seenMilestones:[], kitchenLv:1, kitchenChef:null } };
  Game.applySave(oldSave, 1);
  assert(Game.g.dormLv===0 && Array.isArray(Game.g.dormBeds), 'T6 旧档自动补 dormLv/dormBeds');

  console.log('--- done ---');
  process.exit(0);
})().catch(e=>{ console.error('TEST ERROR:', e.message); process.exit(1); });
