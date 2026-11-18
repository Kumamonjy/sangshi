/* V51 六项验证：厨师重伤停产 / 字幕底部16字3行 / 速度倍率 / 一键分配 / 食物预警 / 承伤统计 */
const fs = require('fs');
const html = fs.readFileSync('/workspace/index.html', 'utf8');
const scripts = html.match(/<script>([\s\S]*?)<\/script>/g);
let code = scripts[scripts.length - 1].replace(/^<script>/, '').replace(/<\/script>\s*$/, '');
const bootIdx = code.lastIndexOf("Game.renderHome();\n  window.addEventListener('resize'");
code = code.slice(0, bootIdx) + "window.__T = { Game, Battle, UI, DATA };\n})();";
const elems = {};
function mkEl(){ return { innerHTML:'', textContent:'', style:{ setProperty(){}, cssText:'' }, disabled:false, scrollTop:0, value:'', dataset:{}, children:[], className:'', classList:{ set:new Set(), toggle(k){}, add(k){this.set.add(k);}, remove(k){this.set.delete(k);}, contains(k){return this.set.has(k);} }, setAttribute(){}, removeAttribute(){}, appendChild(c){this.children.push(c);return c;}, remove(){}, addEventListener(){}, focus(){}, blur(){}, querySelector(){return null;}, querySelectorAll(){return [];}, getBoundingClientRect(){return{width:400,height:700,top:0,left:0};} }; }
global.document = { getElementById:id=>elems[id]||(elems[id]=mkEl()), querySelector:()=>mkEl(), querySelectorAll:()=>[], addEventListener(){}, createElement:()=>mkEl(), body:mkEl() };
global.window = { addEventListener(){}, location:{search:''}, scrollTo(){}, innerWidth:400, innerHeight:700 };
global.localStorage = { getItem:()=>null, setItem(){}, removeItem(){} };
global.navigator = { userAgent:'node' };
eval(code);
const assert=(c,n)=>console.log(c?'PASS '+n:'FAIL '+n);
const { Game, Battle, UI, DATA } = window.__T;
Game.g = Game.newGame(); Game.currentSlot = 1;
const g = Game.g;
const [s1] = g.chars;

(async () => {
  // ===== T1 厨师重伤停产 =====
  g.kitchenLv = 2; g.farmLv = 0; g.dormLv = 0; g.gymLv = 0; g.res.food = 0;
  const chef = Game.createChar('chef'); g.chars.push(chef);
  chef.stamina = 100;
  Game.assignKitchen(chef.id);
  let r = await Game.nextDay();
  assert(r.kitchen && r.kitchen.produced===8, 'T1a 健康厨师正常产粮 8');
  chef.injured = true; chef.stamina = 100;
  g.res.food = 0;
  r = await Game.nextDay();
  assert(r.kitchen && r.kitchen.blocked==='injured' && !r.kitchen.produced, 'T1b 重伤厨师当天停产(blocked=injured)');
  chef.injured = false;

  // ===== T2 字幕：16字/行、最多3行、截断 =====
  const long50 = '末日围城生存战棋战斗字幕测试用例超过三行内容将被截断处理确保界面整洁不溢出屏幕之外不出现换行错乱与遮挡问题出现';
  Battle.b = { speed:1 };
  Battle.subtitle(long50);
  const subHtml = elems['battle-subtitle'].innerHTML;
  const lines = subHtml.split('<br>');
  assert(lines.length===3 && [...lines.join('')].length===48, `T2a 50字截断为3行48字（实际${lines.length}行/${[...lines.join('')].length}字）`);
  assert([...lines[0]].length===16 && [...lines[1]].length===16 && [...lines[2]].length===16, 'T2b 每行16个中文字符');
  Battle.subtitle('短消息');
  assert(elems['battle-subtitle'].innerHTML==='短消息', 'T2c 短文本单行不换行');
  assert(html.includes('#battle-subtitle') && html.includes('translate(-50%,-50%)'), 'T2d 字幕 CSS 定位（地图底部三行中间，JS 实时计算）');
  Battle.subtitle('定位测试');
  assert(html.includes("1200/((Battle.b&&Battle.b.speed)||1)"), 'T2f 字幕停留 1.2s 且随倍速缩短（2x=0.6s，4x=0.3s）');
  const mapEl = document.getElementById('battle-map');
  mapEl.parentElement = { getBoundingClientRect: ()=>({ top:0 }) };
  mapEl.getBoundingClientRect = ()=>({ top:0, bottom:546, height:546, width:400 });   // 13 行 × 42px
  Battle.subtitle('定位测试');
  assert(elems['battle-subtitle'].style.top==='483px', `T2e subtitle() 运行时计算 top（地图底 546 - 1.5 行 63 = ${elems['battle-subtitle'].style.top}）`);

  // ===== T3 速度倍率 =====
  Battle.b = { speed:1 };
  Battle.toggleSpeed();
  assert(Battle.b.speed===2, 'T3a x1→x2');
  Battle.toggleSpeed();
  assert(Battle.b.speed===3, 'T3b x2→x3');
  Battle.toggleSpeed();
  assert(Battle.b.speed===1, 'T3c x3→x1 循环');
  assert(html.includes('setTimeout(r, ms / Battle.b.speed)'), 'T3d sleep 接入倍率');

  // ===== T4 一键最佳分配 =====
  Game.g = Game.newGame(); Game.currentSlot = 1;
  const g2 = Game.g;
  g2.kitchenLv = 2; g2.farmLv = 2; g2.dormLv = 2; g2.gymLv = 2;
  const chef2 = Game.createChar('chef'); chef2.stamina = 100; g2.chars.push(chef2);
  const civ = Game.createChar('civilian'); civ.stamina = 100; g2.chars.push(civ);
  civ.injured = true;   // 重伤平民 → 应被分到床位（睡满自愈）
  const brawler = Game.createChar('brawler'); brawler.stamina = 100; g2.chars.push(brawler);
  const acts = Game.recommendDuty();
  assert(g2.kitchenChef===chef2.id, 'T4a 厨师→职业厨师');
  const fw = g2.chars.find(c=>c.id===g2.farmWorker);
  assert(fw && fw.id!==chef2.id && fw.id!==civ.id && !fw.injured, `T4b 农场→健康无职务者（${fw.name}）`);
  assert((g2.dormBeds||[]).includes(civ.id), 'T4c 重伤者优先入床位');
  const total = 1 + 1 + (g2.dormBeds||[]).length + g2.gymSlots.length;
  assert(total===g2.chars.filter(c=>!c.dead).length, `T4d 全员各就其位（${total} = 在编人数）`);
  assert(acts.length>=3, `T4e 分配摘要 ${acts.length} 项`);
  const acts2 = Game.recommendDuty();   // 再点一次：无空位
  assert(acts2.length===0 && g2.kitchenChef===chef2.id, 'T4f 已满配时重复点击不换人');

  // ===== T5 食物预警 =====
  g2.res.food = 0;
  g2.chars.forEach(c=>{ if(!c.dead){ c.injured=false; } });
  g2.farmWorker = null; g2.kitchenChef = null;
  UI.renderHome();
  const tip = elems['home-tip'].textContent;
  assert(tip.includes('食物预警') && tip.includes('挨饿'), `T5a 供给不足时红字预警（${tip.slice(0,26)}…）`);
  g2.res.food = 999;
  UI.renderHome();
  assert(!elems['home-tip'].textContent.includes('食物预警'), 'T5b 供给充足时无预警');

  // ===== T6 承伤统计 =====
  const u = Battle.mkAlly(s1, 5, 5);
  const foe = Battle.mkZombie('walker', 5, 6, 1);
  Battle.b = { units:[u, foe], selected:u, terrain:Array.from({length:Battle.ROWS},()=>Array.from({length:Battle.COLS},()=>'plain')),
    mode:null, turn:1, phase:'player', weather:'sunny', stats:{}, log:[], logEl:null, loot:{}, ruins:{}, over:false, subtitleT:null, zLevel:1, speed:1, zone:DATA.ZONES[0], doubledReward:false };
  u.critRate = 0; foe.critRate = 0;
  await Battle.doAttack(u, foe);
  const su = Battle.b.stats[u.uid];
  assert(su && su.dmg>0, 'T6a 攻击者伤害累计');
  const sf = Battle.b.stats[foe.uid];
  assert(sf && sf.taken>0 && sf.taken===su.dmg, `T6b 受击者承伤累计（taken=${sf && sf.taken}）`);
  assert(html.includes("if (s.taken) parts.push('🛡️'+s.taken)") && html.includes('伤害 / 承伤 / 击杀 / 治疗'), 'T6c 战报表头含承伤列');
  assert(html.includes("Battle.stat(def, 'taken'") && html.includes("Battle.stat(u, 'taken'") && html.includes("Battle.stat(v, 'taken'") && html.includes("Battle.stat(t, 'taken'"), 'T6d 四处扣血点均计入承伤');

  console.log('--- done ---');
  process.exit(0);
})().catch(e=>{ console.error('TEST ERROR:', e.message); process.exit(1); });
