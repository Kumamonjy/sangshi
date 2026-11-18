/* 职务互斥（一人一天一个建筑职务）+ 统一结算 验证 */
const fs = require('fs');
const html = fs.readFileSync('/workspace/index.html', 'utf8');
const scripts = html.match(/<script>([\s\S]*?)<\/script>/g);
let code = scripts[scripts.length - 1].replace(/^<script>/, '').replace(/<\/script>\s*$/, '');
const bootIdx = code.lastIndexOf("Game.renderHome();\n  window.addEventListener('resize'");
code = code.slice(0, bootIdx) + "window.__T = { Game, Battle, UI, DATA };\n})();";
const elems = {};
function mkEl(){ return { innerHTML:'', textContent:'', style:{ setProperty(){}, cssText:'' }, disabled:false, scrollTop:0, value:'', dataset:{}, children:[], className:'', classList:{ set:new Set(), toggle(){}, add(){}, remove(){}, contains:()=>false }, setAttribute(){}, removeAttribute(){}, appendChild(c){return c;}, remove(){}, addEventListener(){}, focus(){}, blur(){}, querySelector(){return null;}, querySelectorAll(){return [];}, getBoundingClientRect(){return{width:400,height:700,top:0,left:0};} }; }
global.document = { getElementById:id=>elems[id]||(elems[id]=mkEl()), querySelector:()=>mkEl(), querySelectorAll:()=>[], addEventListener(){}, createElement:()=>mkEl(), body:mkEl() };
global.window = { addEventListener(){}, location:{search:''}, scrollTo(){}, innerWidth:400, innerHeight:700 };
global.localStorage = { getItem:()=>null, setItem(){}, removeItem(){} };
global.navigator = { userAgent:'node' };
eval(code);
const assert=(c,n)=>console.log(c?'PASS '+n:'FAIL '+n);
const { Game, UI, DATA } = window.__T;
Game.g = Game.newGame(); Game.currentSlot = 1;
const g = Game.g;
const [s1, s2] = g.chars;
// 建满四建筑 + 招厨师
g.kitchenLv = 2; g.farmLv = 2; g.dormLv = 2; g.gymLv = 2; g.res.gold = 1000;
const chef = Game.createChar('chef'); g.chars.push(chef);
const c3 = Game.createChar('civilian'); g.chars.push(c3);

(async () => {
  // ===== T1 dutyOf 四分支 =====
  Game.assignKitchen(chef.id);
  assert(Game.dutyOf(chef.id)==='厨房当值', 'T1a 厨师 dutyOf=厨房当值');
  Game.assignFarm(c3.id);
  assert(Game.dutyOf(c3.id)==='农场耕作', 'T1b 农场 dutyOf=农场耕作');
  Game.assignBed(s1.id);
  assert(Game.dutyOf(s1.id)==='寝室床位', 'T1c 床位 dutyOf=寝室床位');
  Game.assignGym(s2.id);
  assert(Game.dutyOf(s2.id)==='健身房训练', 'T1d 健身房 dutyOf=健身房训练');

  // ===== T2 跨建筑互斥 =====
  const toastHist = [];
  const origToast = UI.toast.bind(UI);
  UI.toast = m => { toastHist.push(String(m)); origToast(m); };
  const h0 = toastHist.length;
  Game.assignFarm(s1.id);         // 床位→农场
  assert(g.farmWorker===c3.id && toastHist.slice(h0).some(m=>m.includes('职务')), 'T2a 床位占用者不能进农场');
  Game.assignGym(c3.id);          // 农场→健身房
  assert(g.farmWorker===c3.id && !g.gymSlots.includes(c3.id), 'T2b 农场当值者不能进健身房');
  Game.assignBed(s2.id);          // 健身房→床位
  assert(!g.dormBeds.includes(s2.id), 'T2c 健身房当值者不能占床位');
  Game.assignFarm(chef.id);       // 厨房→农场
  assert(g.farmWorker===c3.id, 'T2d 厨房当值者不能进农场');

  // ===== T3 撤职后可换岗 =====
  Game.unassignFarm();
  Game.assignGym(c3.id);
  assert(g.gymSlots.includes(c3.id), 'T3a 撤出农场后可进健身房');
  Game.unassignGym(c3.id);
  Game.assignFarm(c3.id);
  assert(g.farmWorker===c3.id, 'T3b 退出健身房后可耕作');

  // ===== T4 统一结算：一次 nextDay 全建筑生效 =====
  g.chars.forEach(c=>{ if(!c.dead){ c.stamina = Math.max(c.stamina, 100); c.hp = c.maxHp; } });
  g.res.food = 50;
  const r = await Game.nextDay();
  assert(r.kitchen && r.kitchen.produced===8, 'T4a 厨房 Lv.2 产 8 食物');
  assert(r.farm && r.farm.produced===4, 'T4b 农场 Lv.2 产 4 食物');
  assert(r.dorm && r.dorm.slept.includes(s1.name), 'T4c 寝室床位恢复生效');
  assert(r.gym && r.gym.trained.includes(s2.name), 'T4d 健身房训练生效');
  assert(r.cost>0, `T4e 全员吃饭消耗 ${r.cost}`);
  assert(g.day > 1, 'T4f 天数推进');

  // ===== T5 UI：指派页与建筑页分工 =====
  UI.renderDuty();
  const dutyHtml = elems['duty-page'] ? elems['duty-page'].innerHTML : '';
  assert(dutyHtml.includes('职务总览') && dutyHtml.includes('农场耕作'), 'T5a 指派页渲染四模块总览');
  assert(dutyHtml.includes(c3.name) && dutyHtml.includes('撤职'), 'T5b 指派页显示当值者与撤职按钮');
  assert(dutyHtml.includes('已任：'), 'T5c 指派页显示职务冲突标签');
  assert(typeof UI.openDuty==='function' && typeof UI.renderDuty==='function', 'T5d 主界面指派入口函数存在');
  UI.renderBuild();
  const all = Object.values(elems).map(e=>e.innerHTML||'').join('');
  assert(!all.includes('队内厨师'), 'T5e 建筑页不再显示队内厨师卡片');
  assert(all.includes('职务指派'), 'T5f 建筑页提示去指派页');

  console.log('--- done ---');
  process.exit(0);
})().catch(e=>{ console.error('TEST ERROR:', e.message); process.exit(1); });
