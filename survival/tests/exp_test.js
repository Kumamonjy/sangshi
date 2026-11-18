/* 经验值系统验证（100 起每级递增30 + 按击败丧尸类型结算 + 重伤减半） */
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

(async () => {
  // ===== T1 升级阈值公式 =====
  assert(Game.expNeed(1)===100, 'T1a Lv1→2 需 100');
  assert(Game.expNeed(2)===130, 'T1b Lv2→3 需 130');
  assert(Game.expNeed(3)===160, 'T1c Lv3→4 需 160');
  assert(Game.expNeed(5)===220, 'T1d 每级递增 30');

  // ===== T2 升级流程 =====
  const c = Game.createChar('civilian', '测试员');
  const lv0 = c.level;
  const r1 = Game.gainExp(c, 99);
  assert(!r1.lv && c.level===lv0 && c.exp===99, 'T2a 99 经验不升级');
  Game.gainExp(c, 1);
  assert(c.level===lv0+1 && c.exp===0, 'T2b 攒满 100 升级 exp 清零');
  assert(c.maxHp === Math.round(c.baseMaxHp*1.1) && c.atk === Math.round(c.baseAtk*1.1), 'T2c 升级属性+10%');

  // ===== T3 升级回复与连升 =====
  const c2 = Game.createChar('civilian', '测试员2');
  c2.stamina = 10; c2.hp = 10;
  const dHp = Math.round(c2.baseMaxHp*0.1), dSt = Math.round(c2.baseMaxStamina*0.1);
  Game.gainExp(c2, 100);
  assert(c2.hp === 10+dHp && c2.stamina === 10+dSt, 'T3a 升级回复成长量');
  c2.exp = 0; c2.level = 2;
  Game.gainExp(c2, 130);
  assert(c2.level===3 && c2.exp===0, 'T3b Lv2→3 需 130');
  Game.gainExp(c2, 130);
  assert(c2.level===3 && c2.exp===130, 'T3c 130 经验不够 Lv3→4（需160）');
  Game.gainExp(c2, 30);
  assert(c2.level===4 && c2.exp===0, 'T3d 补 30 后升 Lv.4');

  // ===== T4 死亡不获经验 =====
  const c3 = Game.createChar('civilian', '阵亡者');
  c3.dead = true;
  const r4 = Game.gainExp(c3, 500);
  assert(!r4.lv && c3.exp===0 && c3.level===1, 'T4 死亡角色不获得经验');

  // ===== T5 丧尸经验表 =====
  const Z = DATA.ZOMBIES;
  assert(Z.walker.exp===15 && Z.runner.exp===15 && Z.brute.exp===20 && Z.licker.exp===20 && Z.savage.exp===25 && Z.behemoth.exp===60, 'T5 经验表 15/15/20/20/25/60');

  // ===== T6 胜利结算：全员全额 + 重伤减半 =====
  const mkU = (ref, side, hp, zt) => ({ uid:'x'+Math.random(), side, ref, hp, maxHp:200, atk:30, def:5, row:1, col:1,
    sts:{}, zombieType:zt, name: ref?ref.name:zt, hasMoved:false, hasAttacked:false, stamina:100, maxStamina:100 });
  const cA = Game.createChar('soldier', '战士甲');
  const cB = Game.createChar('civilian', '平民乙');
  Game.g.chars.push(cA, cB);
  cA.exp = 0; cB.exp = 0;
  const b1 = { zone: DATA.ZONES[0], turn:2, phase:'player', over:false, doubledReward:false,
    loot:{gold:0,med:0,metal:0,food:0}, stats:{}, log:[], ruins:{}, lootBase:null,
    units:[ mkU(cA,'ally',100,null), mkU(cB,'ally',0,null),
            mkU(null,'enemy',0,'walker'), mkU(null,'enemy',0,'walker'),
            mkU(null,'enemy',150,'savage') ] };
  Battle.b = b1;
  await Battle.finish('win');
  assert(cA.exp===30 && !cA.injured, 'T6a 存活者全额 +30（2×游荡15）');
  assert(cB.exp===Math.ceil(30*0.5) && cB.injured, 'T6b 重伤者 +15 = 50%向上取整');

  // ===== T7 失败减半 / 撤离按击败数 =====
  const cC = Game.createChar('civilian', '平民丙');
  Game.g.chars.push(cC); cC.exp = 0;
  const b2 = { zone: DATA.ZONES[0], turn:3, phase:'player', over:false, doubledReward:false,
    loot:{gold:0,med:0,metal:0,food:0}, stats:{}, log:[], ruins:{}, lootBase:null,
    units:[ mkU(cC,'ally',0,null),
            mkU(null,'enemy',0,'walker'), mkU(null,'enemy',0,'savage') ] };
  Battle.b = b2;
  await Battle.finish('lose');
  assert(cC.exp===Math.ceil(Math.ceil(40/2)*0.5) && cC.injured, 'T7a 失败减半20再重伤减半=10');
  const cD = Game.createChar('civilian', '平民丁');
  Game.g.chars.push(cD); cD.exp = 0;
  const b3 = { zone: DATA.ZONES[0], turn:1, phase:'player', over:false, doubledReward:false,
    loot:{gold:0,med:0,metal:0,food:0}, stats:{}, log:[], ruins:{}, lootBase:null,
    units:[ mkU(cD,'ally',100,null),
            mkU(null,'enemy',0,'brute'), mkU(null,'enemy',150,'licker') ] };
  Battle.b = b3;
  await Battle.finish('flee');
  assert(cD.exp===20, 'T7b 撤离按击败数计 +20（未减半）');

  console.log('--- done ---');
  process.exit(0);
})();
