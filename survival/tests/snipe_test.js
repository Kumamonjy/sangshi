/* 猎人精准射击验证 */
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
const { Game, Battle, DATA } = window.__T;
Game.g = Game.newGame(); Game.currentSlot = 1;
const mkZ=(row,col)=>Battle.mkZombie(Object.keys(DATA.ZOMBIES)[0],row,col,1);
const mkB=(units)=>({ units, selected:units[0], terrain:Array.from({length:Battle.ROWS},()=>Array.from({length:Battle.COLS},()=>'plain')),
  mode:null, turn:1, phase:'player', weather:'sunny', stats:{}, log:[], logEl:null,
  loot:{gold:0,med:0,metal:0,food:0}, ruins:{}, over:false, subtitleT:null });

(async () => {
  const C = DATA.CLASSES.hunter;
  assert(C.skills && C.skills.length===2, 'T1a 猎人双技能');
  const sk = C.skills[1];
  assert(sk.name==='精准射击' && sk.shape==='target' && sk.range===4 && sk.mult===1.5 && sk.cost===25, 'T1b 精准射击参数');
  assert(C.skills[0].name==='百步穿杨' && C.skills[0].shape==='line' && C.skills[0].lineLen===4, 'T1c 百步穿杨保留');

  const hunter = Battle.mkAlly({ uid:'h1', name:'老猎', cls:'hunter', level:1, exp:0, av:C.icon,
    hp:250, maxHp:250, stamina:120, maxStamina:120, atk:50, def:5, range:3, move:3, critRate:0, critDmg:150 }, 5, 5);
  const zNear = mkZ(5,6), zFar = mkZ(8,9), zEdge = mkZ(5,9);
  const b = mkB([hunter,zNear,zFar,zEdge]); Battle.b = b;

  Battle.pickSkill(1);
  assert(b.mode==='skill' && b.targetMode==='target', 'T2a 进入目标瞄准');
  assert(b.targetSet.some(([r,c])=>r===5&&c===9), 'T2b 距离4边界内可选');
  assert(!b.targetSet.some(([r,c])=>r===8&&c===9), 'T2c 距离7超程不可选');

  b.pendingSkill = sk;
  await Battle.execSkill(hunter, { sk, target:zNear });
  const exp = Math.max(1, Math.round(50*1.5) - zNear.def);
  assert(zNear.hp === zNear.maxHp - exp, 'T3a 150%伤害 ' + (zNear.maxHp-zNear.hp) + ' = ' + exp);
  assert(hunter.stamina === 120-25 && hunter.hasAttacked, 'T3b 体力与行动标记');
  assert(zFar.hp === zFar.maxHp && zEdge.hp === zEdge.maxHp, 'T3c 其他目标无伤');
  console.log('--- done ---');
  process.exit(0);
})().catch(e=>{ console.error('TEST ERROR:', e.message); process.exit(1); });
