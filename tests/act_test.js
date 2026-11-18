/* 行动置灰规则 + 字幕换行 + 石块技能耗体 验证 */
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
const [s1] = g.chars;

(async () => {
  // ===== T1 字幕 16 字换行（3 行截断）=====
  const long = '甲'.repeat(31);
  Battle.subtitle(long);
  const subEl = elems['battle-subtitle'];
  const lines = subEl.innerHTML.split('<br>');
  assert(lines.length===2 && [...lines[0]].length===16 && [...lines[1]].length===15, 'T1a 31字字幕分 2 行（16/15）');
  const long2 = '乙'.repeat(46);
  Battle.subtitle(long2);
  const lines2 = elems['battle-subtitle'].innerHTML.split('<br>');
  assert(lines2.length===3 && lines2.every(l=>[...l].length<=16) && [...lines2[0]].length===16 && [...lines2[2]].length===14, 'T1a2 46字分 3 行（16/16/14）');
  const long3 = '丙'.repeat(50);
  Battle.subtitle(long3);
  const lines3 = elems['battle-subtitle'].innerHTML.split('<br>');
  assert(lines3.length===3 && [...lines3.join('')].length===48, 'T1a3 50字截断为3行48字');
  Battle.subtitle('短字幕');
  assert(elems['battle-subtitle'].innerHTML==='短字幕' && !elems['battle-subtitle'].innerHTML.includes('<br>'), 'T1b 短字幕不换行');
  assert((document.getElementById('battle-subtitle'), true), 'T1c 字幕元素存在');

  // ===== T2 石块技能 =====
  assert(DATA.EQUIPS.stone.skill.cost===10, 'T2a 石块技能 cost=10');
  assert(DATA.EQUIPS.stone.skill.desc.includes('消耗10体力'), 'T2b 技能描述含消耗10体力');

  // ===== T3 战斗：行动置灰规则 =====
  g.bag = {}; g.bagInst = [];
  Game.addEquip('cloth',1); Game.addEquip('stone',2);   // 石块现为消耗品：携带制
  Game.equipChar(s1.id,'armor','cloth'); Game.carryItem(s1.id,'stone'); Game.carryItem(s1.id,'stone');
  const u = Battle.mkAlly(s1, 5, 5);
  const foe = Battle.mkZombie('walker', 5, 6, 1);
  Battle.b = { units:[u, foe], selected:u, terrain:Array.from({length:Battle.ROWS},()=>Array.from({length:Battle.COLS},()=>'plain')),
    mode:null, turn:1, phase:'player', weather:'sunny', stats:{}, log:[], logEl:null, loot:{}, ruins:{}, over:false, subtitleT:null, zLevel:1, speed:1, zone:DATA.ZONES[0], doubledReward:false };
  u.critRate = 0; foe.critRate = 0;

  // 移动后未攻击 → 不灰
  u.hasMoved = true; u.hasAttacked = false;
  Battle.renderMap();
  assert(!elems['battle-map'].innerHTML.includes('acted'), 'T3a 仅移动不置灰');
  // 攻击后 → 置灰 + cmdMove 拒绝
  u.hasAttacked = true;
  Battle.renderMap();
  assert(elems['battle-map'].innerHTML.includes('acted'), 'T3b 攻击后地图置灰（acted）');
  Battle.cmdMove();
  assert(Battle.b.mode!=='move', 'T3c 攻击后禁止移动（cmdMove 拒绝）');
  // 信息条显示已行动
  Battle.renderInfo(u);
  assert(Object.values(elems).some(e=>(e.innerHTML||'').includes('已行动完毕')), 'T3d 信息条显示已行动完毕');

  // ===== T4 技能后置灰 + 石块技能耗体 10（消耗品） =====
  u.hasAttacked = false; u.stamina = 50; foe.hp = foe.maxHp;
  const sk = u.skills.find(s=>s.name==='全力投掷');
  assert(sk && sk.cost===10, 'T4a 携带石块后技能进入列表且 cost=10');
  await Battle.execSkill(u, { sk, target:foe });
  assert(u.hasAttacked===true, 'T4b 技能后 hasAttacked=true');
  assert(u.stamina===40, 'T4c 全力投掷消耗 10 体力');
  assert(foe.hp < foe.maxHp, 'T4d 投掷造成伤害');
  assert(u.item && u.item.count===1, 'T4e 使用后消耗 1 个石块（余 1）');

  // ===== T5 防御后置灰 =====
  const u2 = Battle.mkAlly(g.chars[1], 6, 6);
  Battle.b.units.push(u2);
  u2.hasAttacked = false; u2.hasMoved = false; u2.stamina = 50;
  Battle.b.selected = u2;
  Battle.cmdDefend();
  assert(u2.hasAttacked===true && u2.isDefending===true, 'T5a 防御后 hasAttacked=true');
  Battle.renderMap();
  assert(elems['battle-map'].innerHTML.includes('acted'), 'T5b 防御后置灰');
  Battle.cmdMove();
  assert(Battle.b.mode!=='move', 'T5c 防御后禁止移动');

  // ===== T6 全员行动提示 =====
  u.hasAttacked = true;
  elems['toast'] && (elems['toast'].innerHTML='');
  Battle.checkAllActed();
  const toastEl = elems['toast'];
  assert(toastEl && (toastEl.innerHTML+toastEl.textContent).includes('全员行动完毕'), 'T6a 全员行动完毕提示');

  // ===== T7 回合重置清标记 =====
  Battle.b.selected = u;
  u.hasAttacked = false; u.hasMoved = false;
  Battle.cmdMove();
  assert(Battle.b.mode==='move', 'T7a 重置后可再移动');

  console.log('--- done ---');
  process.exit(0);
})().catch(e=>{ console.error('TEST ERROR:', e.message); process.exit(1); });
