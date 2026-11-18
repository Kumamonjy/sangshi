/* 格斗家横扫千军（曼哈顿 aoe 1格）验证 */
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
const mkZ=(row,col)=>Battle.mkZombie('walker',row,col,1);
const mkB=(units)=>({ units, selected:units[0], terrain:Array.from({length:Battle.ROWS},()=>Array.from({length:Battle.COLS},()=>'plain')),
  mode:null, turn:1, phase:'player', weather:'sunny', stats:{}, log:[], logEl:null,
  loot:{gold:0,med:0,metal:0,food:0}, ruins:{}, over:false, subtitleT:null });

(async () => {
  // ===== T1 配置层 =====
  const C = DATA.CLASSES.brawler;
  const sk = (C.skills||[C.skill].filter(Boolean))[0];
  assert(sk.name==='横扫千军' && sk.shape==='sweep' && (sk.area||1)===1 && sk.mult===1.0, 'T1a 横扫千军参数（aoe 1格/100%）');
  assert(C.base.range===1, 'T1b 格斗家射程1');

  // ===== T2 执行层 =====
  const br = Battle.mkAlly({ uid:'b1', name:'老拳', cls:'brawler', level:1, exp:0, av:'👊',
    hp:DATA.CLASSES.brawler.base.maxHp, maxHp:DATA.CLASSES.brawler.base.maxHp, stamina:120, maxStamina:120,
    atk:DATA.CLASSES.brawler.base.atk, def:DATA.CLASSES.brawler.base.def, range:1, move:3, critRate:0, critDmg:150 }, 3, 3);
  const zU = mkZ(2,3), zD = mkZ(4,3), zL = mkZ(3,2), zR = mkZ(3,4);
  const zDiag = mkZ(2,4), zFar = mkZ(5,3);
  const b = mkB([br,zU,zD,zL,zR,zDiag,zFar]); Battle.b = b;
  const victims = [zU,zD,zL,zR];
  await Battle.execSkill(br, { sk, targets:victims });
  const exp = Math.max(1, Math.round(br.atk*1.0) - zU.def);
  assert(zU.hp<zU.maxHp && zD.hp<zD.maxHp && zL.hp<zL.maxHp && zR.hp<zR.maxHp, 'T2a 十字四向全命中');
  assert(zDiag.hp === zDiag.maxHp && zFar.hp === zFar.maxHp, 'T2b 斜角与2格外无伤');
  assert(zU.maxHp - zU.hp === exp, 'T2c 伤害 ' + (zU.maxHp-zU.hp) + ' = 100%×' + br.atk + ' - ' + zU.def);
  assert(br.hasAttacked === true && br.stamina === br.maxStamina - sk.cost, 'T2d 体力与行动标记');
  const sub = elems['battle-subtitle'] ? elems['battle-subtitle'].innerHTML : '';
  assert(/✨ 横扫千军：命中 4 人(，击杀 [0-4])?$/.test(sub), `T2e AOE 汇总字幕（${sub}）`);

  // ===== T3 周围无丧尸时拒绝 =====
  const br2 = Battle.mkAlly({ uid:'b2', name:'老拳2', cls:'brawler', level:1, exp:0, av:'👊',
    hp:300, maxHp:300, stamina:120, maxStamina:120, atk:40, def:10, range:1, move:3, critRate:0, critDmg:150 }, 8, 8);
  const b2 = mkB([br2]); Battle.b = b2;
  br2.hasAttacked = false;
  const st0 = br2.stamina;
  Battle.pickSkill(0);
  assert(br2.stamina === st0 && !br2.hasAttacked && b2.mode===null, 'T3a 周围无丧尸不消耗');

  console.log('--- done ---');
  process.exit(0);
})().catch(e=>{ console.error('TEST ERROR:', e.message); process.exit(1); });
