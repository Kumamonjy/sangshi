/* V66 眩晕状态 + 科学家麻醉飞镖 */
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
const [s1, s2] = g.chars;

function mkB(units){
  return { units, selected:units[0], terrain:Array.from({length:Battle.ROWS},()=>Array.from({length:Battle.COLS},()=>'plain')),
    mode:null, turn:1, phase:'player', weather:'sunny', stats:{}, log:[], logEl:null, loot:{}, ruins:{}, over:false, subtitleT:null, zLevel:1, speed:1, zone:DATA.ZONES[0], doubledReward:false };
}

(async () => {
  // ===== T1 眩晕状态定义 =====
  const ST = DATA.STATUSES.stun;
  assert(ST && ST.name==='眩晕' && ST.bad===true && ST.icon==='💫' && /无法行动/.test(ST.desc), 'T1 眩晕状态定义（bad）');

  // ===== T2 科学家双技能 =====
  const SC = DATA.CLASSES.scientist;
  assert(Array.isArray(SC.skills) && SC.skills.length===2 && SC.skills[0].name==='特种医疗', 'T2a 双技能列表');
  const dart = SC.skills[1];
  assert(dart.name==='麻醉飞镖' && dart.type==='attack' && dart.shape==='target' && dart.mult===1.1 && dart.range===2 && dart.cost===35 && dart.cd===3 && dart.stun && dart.stun.turns===2, 'T2b 麻醉飞镖参数（110%/2格/35体/眩晕2）');

  // ===== T3 麻醉飞镖命中：伤害+眩晕+扣体 =====
  const sciCh = Game.createChar('scientist', '老陈');
  sciCh.talents = []; Game.applyTalents(sciCh); Game.recalc(sciCh);
  const me = Battle.mkAlly(sciCh, 5, 5);
  const foe = Battle.mkZombie('walker', 5, 6, 1);
  Battle.b = mkB([me, foe]);
  foe.critRate = 0; me.critRate = 0; foe.hp = foe.maxHp;
  const dartU = me.skills.find(s=>s.name==='麻醉飞镖');
  const hp0 = foe.hp, st0 = me.stamina;
  await Battle.execSkill(me, { sk: dartU, target: foe });
  const expDmg = Math.max(1, Math.round(me.atk*1.1) - foe.def);
  assert(foe.hp === hp0 - expDmg, `T3a 伤害=110%攻-防（${hp0-foe.hp}=${expDmg}）`);
  assert(foe.sts && foe.sts.stun && foe.sts.stun.t===2, `T3b 眩晕 2 回合（t=${foe.sts.stun&&foe.sts.stun.t}）`);
  assert(me.stamina === st0 - 35 && me.hasAttacked===true, 'T3c 消耗 35 体力');

  // ===== T4 眩晕敌人跳过行动 =====
  const meP = Battle.mkAlly(s2, 5, 4);
  meP.hp = meP.maxHp;
  Battle.b = mkB([meP, foe]);
  foe.sts = { stun:{ t:2, from:'x' } };
  Battle.b.log = [];
  await Battle.zombieAct(foe);
  const logs = Battle.b.log.flatMap(e=>e.msgs).map(x=>x.m).join('|');
  assert(/眩晕中，无法行动/.test(logs), 'T4a 眩晕敌人日志');
  assert(meP.hp === meP.maxHp, 'T4b 眩晕敌人未攻击（我方无伤）');

  // ===== T5 计时递减与消退 =====
  Battle.tickStatuses();
  assert(foe.sts.stun && foe.sts.stun.t===1, 'T5a 回合结算后 t=1');
  Battle.tickStatuses();
  assert(!foe.sts.stun, 'T5b 第二次结算后消退');

  // ===== T6 我方眩晕：新回合无法行动 =====
  const al = Battle.mkAlly(s1, 5, 5);
  al.cds = { '火力压制': 1 };
  Battle.newRoundReset(al);
  assert(al.hasAttacked===false && al.hasMoved===false, 'T6a 无眩晕正常重置');
  assert(al.cds['火力压制']===0, 'T6b CD 递减');
  al.sts = { stun:{ t:1 } };
  Battle.b = mkB([al]); Battle.b.log = [];
  Battle.newRoundReset(al);
  assert(al.hasAttacked===true && al.hasMoved===true, 'T6c 眩晕者标记已行动（置灰无法操作）');
  assert(/眩晕中，本回合无法行动/.test(Battle.b.log.flatMap(e=>e.msgs).map(x=>x.m).join('|')), 'T6d 眩晕日志');

  // ===== T7 净化可清除眩晕（bad:true 通用） =====
  al.sts = { stun:{ t:2 }, strong:{ t:2 } };
  const sciMe = Battle.mkAlly(sciCh, 5, 4);
  sciMe.skills = [DATA.CLASSES.scientist.skills[0]];
  Battle.b = mkB([sciMe, al]);
  Battle.b.pendingSkill = sciMe.skills[0];
  await Battle.doHeal(sciMe, al);
  assert(!al.sts.stun && al.sts.strong, 'T7 特种医疗清除眩晕、保留增益');

  console.log('--- done ---');
  process.exit(0);
})().catch(e=>{ console.error('TEST ERROR:', e.message); process.exit(1); });
