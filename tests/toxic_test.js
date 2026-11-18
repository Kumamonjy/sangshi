/* 自爆丧尸 + 毒气丧尸 验证 */
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
const { Game, Battle, DATA } = window.__T;
Game.g = Game.newGame(); Game.currentSlot = 1;
const mkZ=(zt,row,col)=>Battle.mkZombie(zt,row,col,1);
const mkA=(name,uid,row,col,hp)=>Battle.mkAlly({ uid, name, cls:'soldier', level:1, exp:0, av:'🪖',
  hp:hp||200, maxHp:200, stamina:120, maxStamina:120, atk:50, def:5, range:1, move:3, critRate:0, critDmg:150 }, row, col);
const mkB=(units)=>({ units, selected:units[0], terrain:Array.from({length:Battle.ROWS},()=>Array.from({length:Battle.COLS},()=>'plain')),
  mode:null, turn:1, phase:'player', weather:'sunny', stats:{}, log:[], logEl:null,
  loot:{gold:0,med:0,metal:0,food:0}, ruins:{}, over:false, subtitleT:null, zLevel:1, speed:1, zone:DATA.ZONES[0], doubledReward:false });

(async () => {
  // ===== T1 配置层 =====
  const B = DATA.ZOMBIES.bomber, G = DATA.ZOMBIES.gasbag;
  assert(B.base.move===2 && B.explodeDmg===80 && B.exp===20 && B.base.maxHp===160, 'T1a 自爆丧尸配置');
  assert(G.base.move===1 && G.gasMult===1.1 && G.exp===25 && G.base.maxHp===200, 'T1b 毒气丧尸配置');
  assert(Object.keys(DATA.ZOMBIES).length===8, 'T1c 丧尸种类共 8 种');
  assert(DATA.ZONES[2].pool.bomber===15 && DATA.ZONES[3].pool.gasbag===10 && DATA.ZONES[4].pool.gasbag===12, 'T1d 区域池已加入新丧尸');

  // ===== T2 自爆：攻击致死触发 =====
  const a1 = mkA('老兵','a1',5,5);
  const a2 = mkA('近卫','a2',5,6);
  const a3 = mkA('远哨','a3',5,8);   // 距爆点(5,7) 1格：波及；距离算：(5,8)到(5,7)=1 波及
  const far = mkA('后方','a4',2,2);  // 远处无伤
  const bom = mkZ('bomber',5,7);
  const b = mkB([a1,a2,a3,far,bom]); Battle.b = b;
  await Battle.applyDamage(a1, bom, 999, false, 1);   // 击杀自爆丧尸
  assert(bom.hp<=0 && bom.exploded===true, 'T2a 击杀触发自爆');
  const expD = a2.hp===0 ? 200 : 200-a2.hp;
  assert((200-a2.hp)===80 || a2.hp===0, 'T2b 相邻1格受 80 爆炸伤害（余 ' + a2.hp + '）');
  assert(a2.sts && a2.sts.poison && a2.sts.poison.t===3, 'T2c 幸存者中毒3回合');
  assert(far.hp===200 && !far.sts?.poison, 'T2d 远处无伤');

  // ===== T3 自爆：毒发致死触发 + 炸死重伤 =====
  const w = mkA('脆皮','w1',6,6,70);    // hp 70 < 80 → 爆炸致死
  const bom2 = mkZ('bomber',6,7);
  const b2 = mkB([w, bom2]); Battle.b = b2;
  bom2.hp = 20;   // 削血便于毒发致死（毒每回合 16%×160=16）
  Battle.applyStatus(bom2, 'poison', 5, 'w1');
  Battle.tickStatuses(); Battle.tickStatuses();   // 毒发身亡
  assert(bom2.hp<=0, 'T3a 自爆丧尸毒发身亡');
  assert(bom2.exploded===true, 'T3b 毒发身亡触发自爆');
  assert(w.hp===0, 'T3c 爆炸将 70 血角色炸成重伤');
  assert(b2.stats[bom2.uid] && b2.stats[bom2.uid].kill===1, 'T3d 击杀归属自爆丧尸');

  // ===== T4 毒气丧尸 AI：攻击即毒气 =====
  const g1 = mkA('甲','g1',9,9);   // 相邻
  const g2 = mkA('乙','g2',8,10);  // 相邻
  const g3 = mkA('丙','g3',6,9);   // 距离2 无伤
  const gas = mkZ('gasbag',8,9);
  gas.critRate = 0;   // 固定无暴击，排除随机性
  const b3 = mkB([g1,g2,g3,gas]); Battle.b = b3;
  await Battle.zombieAct(gas);
  const d1 = 200-g1.hp, d2 = 200-g2.hp;
  const expGas = Math.max(1, Math.round(35*1.1) - 5);
  assert(d1===expGas && d2===expGas, 'T4a 两相邻角色各受 ' + expGas + ' 毒气伤害（实际 ' + d1 + '/' + d2 + '）');
  assert(g1.sts?.poison?.t===5 && g2.sts?.poison?.t===5, 'T4b 双双中毒5回合');
  assert(g3.hp===200 && !g3.sts?.poison, 'T4c 距离2角色无伤');

  console.log('--- done ---');
  process.exit(0);
})().catch(e=>{ console.error('TEST ERROR:', e.message); process.exit(1); });
