/* 泼火锅汤 3×1 直线 + 百步穿杨 4 格贯穿 验证 */
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
const mkA=(cls,name,uid,row,col)=>Battle.mkAlly({ uid, name, cls, level:1, exp:0, av:DATA.CLASSES[cls].icon,
  hp:DATA.CLASSES[cls].base.maxHp, maxHp:DATA.CLASSES[cls].base.maxHp, stamina:120, maxStamina:120,
  atk:DATA.CLASSES[cls].base.atk, def:DATA.CLASSES[cls].base.def, range:DATA.CLASSES[cls].base.range,
  move:DATA.CLASSES[cls].base.move, critRate:0, critDmg:150 }, row, col);
const mkZ=(row,col)=>Battle.mkZombie('walker',row,col,1);
const mkB=(units)=>({ units, selected:units[0], terrain:Array.from({length:Battle.ROWS},()=>Array.from({length:Battle.COLS},()=>'plain')),
  mode:null, turn:1, phase:'player', weather:'sunny', stats:{}, log:[], logEl:null,
  loot:{gold:0,med:0,metal:0,food:0}, ruins:{}, over:false, subtitleT:null });

(async () => {
  // ===== T1 百步穿杨 = 直线贯穿 4 格 =====
  const hunter = mkA('hunter','老猎','h1',5,5);
  const z1 = mkZ(5,6), z2 = mkZ(5,9), z3 = mkZ(6,6), z4 = mkZ(5,10);
  const b1 = mkB([hunter,z1,z2,z3,z4]); Battle.b = b1;
  const skH = DATA.CLASSES.hunter.skills[0];
  assert(skH.shape==='line' && skH.lineLen===4, 'T1a 百步穿杨 lineLen=4');
  Battle.pickSkill(0);
  assert(b1.mode==='skill' && b1.targetMode==='line' && b1.targetSet.some(([r,c])=>r===5&&c===9), 'T1b 直线瞄准含第4格');
  b1.pendingSkill = skH;
  await Battle.execSkill(hunter, { sk:skH, dir:[5,6] });
  assert(z1.hp < z1.maxHp && z2.hp < z2.maxHp, 'T1c 第1格与第4格丧尸均被贯穿');
  assert(z3.hp === z3.maxHp, 'T1d 直线外丧尸无伤');
  assert(z4.hp === z4.maxHp, 'T1e 第5格超出射程无伤');

  // ===== T2 泼火锅汤 = 横扫 3×1 =====
  const chef = mkA('chef','老陈','c1',5,5);
  const za=mkZ(5,6), zb=mkZ(5,8), zc=mkZ(6,7), zd=mkZ(4,7);
  const b2 = mkB([chef,za,zb,zc,zd]); Battle.b = b2;
  const skC = DATA.CLASSES.chef.skills[0];
  assert(skC.shape==='sweep2' && skC.sweepLen===3 && skC.sweepWid===1, 'T2a 泼火锅汤 sweep2 3×1');
  Battle.pickSkill(0);
  assert(b2.mode==='skill' && b2.targetMode==='sweep2' && b2.targetSet.some(([r,c])=>r===5&&c===6), 'T2b 四邻格选方向');
  b2.pendingSkill = skC;
  await Battle.execSkill(chef, { sk:skC, dir:[5,6] });
  assert(za.hp<za.maxHp && zb.hp<zb.maxHp, 'T2c 直线上2丧尸命中');
  assert(zc.hp===zc.maxHp && zd.hp===zd.maxHp, 'T2d 宽度1：垂直偏移两侧均无伤');
  assert(chef.stamina===120-skC.cost && chef.hasAttacked, 'T2e 体力与行动标记');

  console.log('--- done ---');
  process.exit(0);
})().catch(e=>{ console.error('TEST ERROR:', e.message); process.exit(1); });
