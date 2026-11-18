/* 厨师双技能（泼火锅汤 + 美味料理）验证 */
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
  const C = DATA.CLASSES.chef;
  assert(C.skills && C.skills.length===2, 'T1a 厨师双技能');
  const sk2 = C.skills[1];
  assert(sk2.name==='美味料理' && sk2.type==='regen' && sk2.cost===25 && sk2.regenAmt===15 && sk2.range===1, 'T1b 美味料理参数');
  const sk1 = C.skills[0];
  assert(sk1.name==='泼火锅汤' && sk1.shape==='sweep2' && sk1.sweepLen===3 && sk1.sweepWid===1 && sk1.mult===0.7 && sk1.cost===30, 'T1c 泼火锅汤参数');

  // ===== T2 泼火锅汤执行 =====
  const chef = Battle.mkAlly({ uid:'c1', name:'老陈', cls:'chef', level:1, exp:0, av:'👨‍🍳',
    hp:250, maxHp:250, stamina:120, maxStamina:120, atk:30, def:10, range:1, move:2, critRate:0, critDmg:150 }, 5, 5);
  const z1 = mkZ(5,6), z2 = mkZ(5,8), z3 = mkZ(6,7), z4 = mkZ(4,7);
  const b = mkB([chef,z1,z2,z3,z4]); Battle.b = b;
  Battle.pickSkill(0);
  assert(b.mode==='skill' && b.targetMode==='sweep2', 'T2a 进入方向选择');
  b.pendingSkill = sk1;
  await Battle.execSkill(chef, { sk:sk1, dir:[5,6] });
  const expDmg = Math.max(1, Math.round(30*0.7) - 5);
  assert(z1.hp === z1.maxHp - expDmg && z2.hp === z2.maxHp - expDmg, 'T2b 直线1/3格丧尸各受 ' + expDmg + ' 伤害');
  assert(z3.hp === z3.maxHp && z4.hp === z4.maxHp, 'T2c 宽度1两侧无伤');
  assert(chef.stamina === 120-30 && chef.hasAttacked, 'T2d 消耗30体力与行动标记');

  // ===== T3 美味料理执行 =====
  chef.hasAttacked = false;
  const mate = Battle.mkAlly({ uid:'m1', name:'小满', cls:'civilian', level:1, exp:0, av:'🧍',
    hp:200, maxHp:200, stamina:80, maxStamina:120, atk:20, def:5, range:1, move:3, critRate:0, critDmg:150 }, 4, 5);
  b.units.push(mate);
  Battle.pickSkill(1);
  assert(b.mode==='skill' && b.targetMode==='regen' && b.targetSet.some(([r,c])=>r===4&&c===5), 'T3a 体力不满友方可选');
  b.pendingSkill = sk2;
  await Battle.doRegen(chef, mate);
  assert(mate.stamina === 95, 'T3b 美味料理回复15⚡');
  assert(chef.stamina === 90-25, 'T3c 消耗25体力');
  assert(chef.hasAttacked, 'T3d 行动标记');
  // 封顶：目标体力 110 → +15 = 125 → 封顶 120（上一次施放已清空 pendingSkill，需重新指定）
  chef.hasAttacked = false;
  chef.cds = {};
  mate.stamina = 110;
  b.pendingSkill = sk2;
  await Battle.doRegen(chef, mate);
  assert(mate.stamina === 120, 'T3e 溢出封顶 stamina=' + mate.stamina);

  console.log('--- done ---');
  process.exit(0);
})().catch(e=>{ console.error('TEST ERROR:', e.message); process.exit(1); });
