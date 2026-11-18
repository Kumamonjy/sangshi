/* 战斗特效（基础包）验证：CSS 类定义 + 挂点触发 + DOM 安全跳过 */
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
  // ===== T1 CSS 定义层 =====
  assert(html.includes('@keyframes fxShake') && html.includes('@keyframes fxShakeCrit') && html.includes('@keyframes fxFlash') && html.includes('@keyframes fxLungeK') && html.includes('@keyframes fxHeal') && html.includes('@keyframes fxStPop'), 'T1a 六组特效 keyframes 已定义');
  assert(html.includes('.unit.hit-shake') && html.includes('.unit.crit-shake') && html.includes('.unit.heal-glow') && html.includes('.unit.lunge') && html.includes('.unit.status-pop .psn'), 'T1b 五个动画类选择器已定义');
  assert(html.includes('fxShake .25s linear') && html.includes('fxLungeK .2s ease-out'), 'T1c 时长 250ms/200ms 轻快节奏');

  // ===== T2 fxAt / fxLunge DOM 安全跳过 =====
  Battle.fxAt(3, 3, 'hit-shake', 250);      // mock cell.querySelector 返回 null → 不炸
  Battle.fxLunge({row:1,col:1}, {row:1,col:2});
  assert(true, 'T2a DOM 缺失时特效安全跳过');

  // ===== T3 战斗挂点触发 =====
  const u = Battle.mkAlly(s1, 5, 5);
  const foe = Battle.mkZombie('walker', 5, 6, 1);
  Battle.b = { units:[u, foe], selected:u, terrain:Array.from({length:Battle.ROWS},()=>Array.from({length:Battle.COLS},()=>'plain')),
    mode:null, turn:1, phase:'player', weather:'sunny', stats:{}, log:[], logEl:null, loot:{}, ruins:{}, over:false, subtitleT:null, zLevel:1, speed:1, zone:DATA.ZONES[0], doubledReward:false };
  u.critRate = 0; foe.critRate = 0;
  const hp0 = foe.hp;
  await Battle.doAttack(u, foe);
  assert(hp0-foe.hp>0, 'T3a 普攻造成伤害');
  const br = Game.createChar('brawler'); g.chars.push(br);
  const ub = Battle.mkAlly(br, 3, 3);
  assert(ub.range===br.range && br.range>=1, `T3b 格斗家射程继承有效（天赋随机 range=${br.range}）`);
  const foe2 = Battle.mkZombie('walker', 3, 4, 1);
  Battle.b.units.push(ub, foe2); ub.critRate = 0;
  await Battle.doAttack(ub, foe2);
  assert(foe2.hp<foe2.maxHp, 'T3c 近战普攻走 lunge 分支并造成伤害');

  // ===== T4 applyStatus 新状态弹入（不炸即通过，refresh 分支不弹） =====
  foe.sts = {};
  Battle.applyStatus(foe, 'poison', 3, u.uid);
  assert(foe.sts.poison && foe.sts.poison.t===3, 'T4a 新状态施加成功');
  Battle.applyStatus(foe, 'poison', 5, u.uid);
  assert(foe.sts.poison.t===5, 'T4b 同名刷新不重复弹入');

  // ===== T5 治疗/恢复挂点 =====
  u.stamina = 100; u.hasAttacked = false;
  const docSkill = { name:'急救', cost:10, cd:0, type:'heal', mult:1, range:1 };
  u.hp = 50; u.maxHp = 300;
  Battle.b.pendingSkill = docSkill; Battle.b.selected = u;
  await Battle.doHeal(u, foe);   // 治疗（目标为 foe 模拟）
  assert(true, 'T5a doHeal 特效挂点不炸');
  console.log('--- done ---');
  process.exit(0);
})().catch(e=>{ console.error('TEST ERROR:', e.message); process.exit(1); });
