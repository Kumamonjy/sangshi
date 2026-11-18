/* 健身房建筑验证 */
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
  const D = DATA.GYM;
  assert(D && D.buildCost===200 && D.upgradeCost===200 && D.maxLv===5 && D.expAmt===40 && D.staminaCost===50, 'T1a 健身房配置 200/200/Lv5/+40/-50');
  assert(g.gymLv===0 && Array.isArray(g.gymSlots) && !g.gymSlots.length, 'T1b 初始状态未建造');

  // ===== T2 建造与升级 =====
  g.res.gold = 200;
  Game.buildGym();
  assert(g.gymLv===1 && g.res.gold===0, 'T2a 建造成功 200→0 金币 Lv.1');
  Game.upgradeGym();
  assert(g.gymLv===1, 'T2b 金币不足升级被拒');
  g.res.gold = 200;
  Game.upgradeGym();
  assert(g.gymLv===2 && g.res.gold===0, 'T2c 升级到 Lv.2 扣200');

  // ===== T3 指派校验 =====
  s1.stamina = 100; s1.injured = false;
  s2.stamina = 45;  s2.injured = false;
  Game.assignGym(s1.id);
  assert(g.gymSlots.length===1 && g.gymSlots[0]===s1.id, 'T3a 军人指派成功');
  Game.assignGym(s1.id);
  assert(g.gymSlots.length===1, 'T3b 重复指派被拒');
  s1.injured = true;
  const tmp = g.gymSlots.slice();
  Game.assignGym(s2.id);
  assert(g.gymSlots.length===1, 'T3c 重伤者指派被拒');
  s1.injured = false;
  Game.assignGym(s2.id);
  assert(g.gymSlots.length===1, 'T3d 体力45不足50指派被拒');
  const s3 = Game.createChar('civilian'); g.chars.push(s3);
  s3.stamina = 100; s3.injured = false;
  Game.assignGym(s3.id);
  assert(g.gymSlots.length===2, 'T3e 平民指派 Lv.2 满');
  const s4 = Game.createChar('civilian'); g.chars.push(s4);
  s4.stamina = 100; s4.injured = false;
  Game.assignGym(s4.id);
  assert(g.gymSlots.length===2, 'T3f 满员第3人被拒');
  Game.unassignGym(s3.id);
  assert(g.gymSlots.length===1 && g.gymSlots[0]===s1.id, 'T3g 平民退房');

  // ===== T4 过夜训练结算 =====
  s1.stamina = 60; s1.hp = 100; s1.exp = 0; s1.level = 1;
  g.res.food = 100;  // 全员吃饭：s1 60→110 → 训练-50 → 60，+40exp
  const r = Game.nextDay();
  assert(s1.stamina===60 && s1.exp===40, 'T4a 训练：吃饭+50 再 -50⚡，+40经验');
  assert(r.gym && r.gym.trained.length===1 && r.gym.exp===40, 'T4b 结算报告含训练');
  assert(Game.mealMsg(r).includes('训练') && Game.mealMsg(r).includes(s1.name), 'T4c mealMsg 提示训练');

  // ===== T5 停训兜底：体力不足 / 重伤 =====
  g.res.food = 0;  // 存粮0：demand>0 弹分配；手动只让 s1 吃 → s2 排除
  s1.stamina = 60; s1.exp = 40;
  s2.stamina = 30; s2.exp = 0;
  g.gymSlots = [s1.id, s2.id];
  const r2 = Game.nextDay([s1.id]);
  assert(s1.stamina===60 && s1.exp===80, 'T5a s1 吃饭60→110→训练→60 +40exp');
  assert(s2.stamina===30 && s2.exp===0, 'T5b s2 没饭吃30<50 停训不扣不获');
  assert(r2.gym && r2.gym.skipped.length===1 && r2.gym.skipped[0].includes('体力不足'), 'T5c skipped 提示体力不足');
  // 重伤停训（血量不满，不会触发吃饭自愈）
  g.res.food = 100;
  s2.injured = true; s2.stamina = 100; s2.hp = 100; s2.maxHp = 200;
  const r3 = Game.nextDay();
  assert(r3.gym && !r3.gym.trained.includes(s2.name) && s2.exp===0 && s2.stamina===Math.min(Game.effSt(s2),150), 'T5d 重伤者停训不扣不获（吃饭恢复clamp）');
  assert(r3.gym && r3.gym.skipped[0].includes('重伤'), 'T5e skipped 提示重伤静养');

  // ===== T6 旧档迁移 =====
  const oldSave = { v:1, ts:Date.now(), day:3, uid:5000, state:{ day:3, weather:'sunny', res:{gold:100,med:0,metal:0,food:10}, chars:[], seenMilestones:[], kitchenLv:1, kitchenChef:null, dormLv:1, dormBeds:[] } };
  Game.applySave(oldSave, 1);
  assert(Game.g.gymLv===0 && Array.isArray(Game.g.gymSlots), 'T6 旧档自动补 gymLv/gymSlots');

  console.log('--- done ---');
  process.exit(0);
})().catch(e=>{ console.error('TEST ERROR:', e.message); process.exit(1); });
