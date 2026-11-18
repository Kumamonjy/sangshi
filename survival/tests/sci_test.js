/* V65 科学家职业：属性/招募成本/特种医疗（治疗+净化负面+含自己） */
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
  // ===== T1 职业定义 =====
  const SC = DATA.CLASSES.scientist;
  assert(SC && SC.name==='科学家' && SC.icon==='🔬' && SC.price===250 && SC.food===1, 'T1a 定义（招募 250 金 + 1 食物）');
  const b0 = SC.base;
  assert(b0.maxHp===160 && b0.maxStamina===100 && b0.atk===25 && b0.def===5 && b0.range===1 && b0.move===2 && b0.critRate===5 && b0.critDmg===150, 'T1b 基础值逐项');
  const sk = SC.skills[0];
  assert(SC.skills.length===1 || SC.skills.length===2, '技能列表存在');
  assert(sk.name==='特种医疗' && sk.type==='heal' && sk.mult===1 && sk.range===1 && sk.cost===30 && sk.cd===3 && sk.cure===true && sk.includeSelf===true, 'T1c 技能参数（heal 100%/1格/30体/cure/含自己）');

  // ===== T2 创建角色属性 =====
  const sci = Game.createChar('scientist', '老陈');
  sci.talents = []; Game.applyTalents(sci); Game.recalc(sci);   // 去随机天赋，断纯基础值
  assert(sci.maxHp===160 && sci.maxStamina===100 && sci.atk===25 && sci.def===5 && sci.range===1 && sci.move===2, 'T2 创建角色基础值');
  void sci;

  // ===== T3 特种医疗：治疗 + 净化负面、保留增益 =====
  const me = Battle.mkAlly(s1, 5, 5);
  me.skills = [Object.assign({}, sk)];
  me.stamina = 100;
  const mate = Battle.mkAlly(Game.createChar('civilian','伤员'), 5, 4);
  mate.sts = { poison:{ turns:3 }, weak:{ turns:2 }, strong:{ turns:2 }, lame:{ turns:1 } };
  mate.hp = 100; mate.maxHp = 260;
  Battle.b = { units:[me, mate], selected:me, terrain:Array.from({length:Battle.ROWS},()=>Array.from({length:Battle.COLS},()=>'plain')),
    mode:null, turn:1, phase:'player', weather:'sunny', stats:{}, log:[], logEl:null, loot:{}, ruins:{}, over:false, subtitleT:null, zLevel:1, speed:1, zone:DATA.ZONES[0], doubledReward:false, pendingSkill:me.skills[0] };
  const expHeal = me.atk;   // 100% 攻击力
  await Battle.doHeal(me, mate);
  assert(mate.hp === 100 + expHeal, `T3a 治疗量=100%攻击（${mate.hp-100}=${expHeal}）`);
  assert(!mate.sts.poison && !mate.sts.weak && !mate.sts.lame, 'T3b 负面（中毒/虚弱/瘸腿）已清除');
  assert(mate.sts.strong && mate.sts.strong.turns===2, 'T3c 增益（强力）保留');
  const logTxt = Battle.b.log.flatMap(e=>e.msgs).map(x=>x.m).join('|');
  assert(/解除 中毒\/虚弱\/瘸腿/.test(logTxt), 'T3d 日志含净化明细');
  assert(me.stamina===70 && me.hasAttacked===true, 'T3e 消耗 30 体力');

  // ===== T4 无负面时净化不出现 =====
  mate.sts = {};
  mate.hp = 100;
  me.hasAttacked = false;
  Battle.b.pendingSkill = me.skills[0];
  Battle.b.log = [];   // 清日志，只验证本次治疗
  await Battle.doHeal(me, mate);
  const log2 = Battle.b.log.flatMap(e=>e.msgs).map(x=>x.m).join('|');
  assert(!/解除/.test(log2), 'T4 无负面时日志无「解除」');

  // ===== T5 includeSelf 目标集（特种医疗含自己 / 医务护理不含） =====
  const me2 = Battle.mkAlly(s1, 5, 5);
  me2.skills = [Object.assign({}, sk)];
  me2.hp = 50; me2.maxHp = 300;   // 掉血 → 自己可被选
  Battle.b = { units:[me2], selected:me2, terrain:Array.from({length:Battle.ROWS},()=>Array.from({length:Battle.COLS},()=>'plain')),
    mode:null, turn:1, phase:'player', weather:'sunny', stats:{}, log:[], logEl:null, loot:{}, ruins:{}, over:false, subtitleT:null, zLevel:1, speed:1, zone:DATA.ZONES[0], doubledReward:false };
  Battle.pickSkill(0);
  let ts = (Battle.b.targetSet||[]).map(p=>p.join(','));
  assert(ts.includes('5,5'), 'T5a 特种医疗目标集含自己');
  const me3 = Battle.mkAlly(Game.createChar('doctor','老医'), 5, 5);
  me3.skills = [DATA.CLASSES.doctor.skills[1]];   // MED_CARE
  me3.hp = 50; me3.maxHp = 250;
  Battle.b.units = [me3]; Battle.b.selected = me3; Battle.b.mode = null;
  Battle.pickSkill(0);
  ts = (Battle.b.targetSet||[]).map(p=>p.join(','));
  assert(!ts.includes('5,5'), 'T5b 医务护理不含自己（行为未回归）');

  // ===== T6 负面状态标记 =====
  const bads = ['poison','bleed','burn','weak','lame'].every(k=>DATA.STATUSES[k].bad===true);
  const goods = ['heal','regen','strong'].every(k=>!DATA.STATUSES[k].bad);
  assert(bads && goods, 'T6 负面 bad:true ×5，增益无标记');

  console.log('--- done ---');
  process.exit(0);
})().catch(e=>{ console.error('TEST ERROR:', e.message); process.exit(1); });
