/* 医生双技能（急救+医务护理）验证 */
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
const mkB=(units)=>({ units, selected:units[0], terrain:Array.from({length:Battle.ROWS},()=>Array.from({length:Battle.COLS},()=>'plain')),
  mode:null, turn:1, phase:'player', weather:'sunny', stats:{}, log:[], logEl:null,
  loot:{gold:0,med:0,metal:0,food:0}, ruins:{}, over:false, subtitleT:null });
const mkWounded=(name,uid,row,col,hp,maxHp,stamina)=>Battle.mkAlly({ uid, name, cls:'civilian', level:1, exp:0, av:'🧍',
  hp, maxHp, stamina, maxStamina:stamina, atk:20, def:5, range:1, move:3, critRate:0, critDmg:150 }, row, col);

(async () => {
  // ===== T1 配置层 =====
  const D = DATA.CLASSES.doctor, N = DATA.CLASSES.nurse;
  assert(D.skills && D.skills.length===2, 'T1a 医生双技能');
  const fa = D.skills[0];
  assert(fa.name==='急救' && fa.type==='heal' && fa.shape==='target' && fa.cost===35 && fa.mult===1.5 && !fa.flatHeal && fa.range===2, 'T1b 急救参数（35⚡/150%/2格）');
  assert(D.skills[1]===N.skills[0], 'T1c 医生与护士共用同一个医务护理对象');
  const mc = D.skills[1];
  assert(mc.name==='医务护理' && mc.cost===25 && mc.mult===1 && mc.range===1, 'T1d 医务护理参数（25⚡/100%/1格）');
  assert(N.skills[0].cost===25, 'T1e 护士医务护理同步为25体力');
  assert(Battle.unitSkills({skills:D.skills, skill:undefined}).length===2, 'T1f unitSkills 兼容数组');

  // ===== T2 瞄准层：急救射程2 =====
  const doc = Battle.mkAlly({ uid:'d1', name:'老医', cls:'doctor', level:1, exp:0, av:'⚕️',
    hp:250, maxHp:250, stamina:110, maxStamina:110, atk:30, def:10, range:1, move:3, critRate:0, critDmg:150 }, 5, 5);
  const w2 = mkWounded('伤员甲','w1',5,7,100,200,100);
  const w3 = mkWounded('伤员乙','w2',8,5,100,200,100);
  const b = mkB([doc,w2,w3]); Battle.b = b;
  Battle.pickSkill(0);
  assert(b.mode==='skill' && b.targetMode==='heal', 'T2a 进入治疗瞄准');
  assert(b.targetSet.some(([r,c])=>r===5&&c===7), 'T2b 距离2边界内友方可选');
  assert(!b.targetSet.some(([r,c])=>r===8&&c===5), 'T2c 距离3超程不可选');

  // ===== T3 急救结算：150% 攻击力 =====
  b.pendingSkill = fa;
  await Battle.doHeal(doc, w2);
  assert(w2.hp === 100+45, 'T3a 急救回复 45 = 150%×30 攻击力');
  assert(doc.stamina === 110-35 && doc.hasAttacked, 'T3b 急救消耗35体力与行动标记');

  // ===== T4 医务护理结算（医生施放，同一函数 doHeal）=====
  doc.hasAttacked = false;
  Battle.pickSkill(1);
  assert(b.pendingSkill===mc, 'T4a 选中医务护理');
  await Battle.doHeal(doc, w2);
  assert(w2.hp === 145+30, 'T4b 医务护理回复 30 = 100%×30 攻击力');
  assert(doc.stamina === 75-25, 'T4c 医务护理消耗25体力');
  assert(doc.cds['急救']===3 && doc.cds['医务护理']===3, 'T4d 两技能独立冷却');

  console.log('--- done ---');
  process.exit(0);
})().catch(e=>{ console.error('TEST ERROR:', e.message); process.exit(1); });
