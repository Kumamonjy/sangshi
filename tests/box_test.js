/* V58 石头物资箱：清除障碍留箱，拾取石块×1 + 金属 0-2 */
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

(async () => {
  // T1 地形定义
  const sb = DATA.TERRAIN.stonebox;
  assert(sb && sb.walk===true && sb.moveCost===1 && sb.icon==='📦', 'T1 stonebox 地形：可通行/1体/📦');
  assert(DATA.TERRAIN.rubble.desc.includes('石头物资箱'), 'T1b 瓦砾描述含留箱说明');

  // T2 清除障碍 → 原地留箱
  const s1 = g.chars[0]; s1.talents=[]; Game.applyTalents(s1); Game.recalc(s1);
  const me = Battle.mkAlly(s1, 5, 5);
  const foe = Battle.mkZombie('walker', 8, 8, 1);
  Battle.b = { units:[me, foe], selected:me, terrain:Array.from({length:Battle.ROWS},()=>Array.from({length:Battle.COLS},()=>'plain')),
    mode:null, turn:1, phase:'player', weather:'sunny', stats:{}, log:[], logEl:null, loot:{gold:0,med:0,metal:0,food:0,fabric:0}, ruins:{}, over:false, subtitleT:null, zLevel:1, speed:1, zone:DATA.ZONES[0], doubledReward:false };
  Battle.b.terrain[4][5] = 'rubble';
  me.hasAttacked = false;
  await Battle.clearRubble(me, 4, 5);
  assert(Battle.b.terrain[4][5]==='stonebox', 'T2a 清除后原地留箱');
  assert(me.hasAttacked===true, 'T2b 清除消耗攻击');

  // T3 拾取：石块×1 + 金属 0-2，箱消失
  const n0 = g.bagInst.filter(e=>e.id==='stone').length;
  const m0 = Battle.b.loot.metal;
  await Battle.doMove(me, 4, 5);
  assert(g.bagInst.filter(e=>e.id==='stone').length===n0+1, 'T3a 石块 +1 入背包');
  assert(Battle.b.terrain[4][5]==='plain', 'T3b 箱消失');
  // 多轮金属范围
  for (let i=0;i<20;i++) {
    const meX = Battle.mkAlly(Game.createChar('civilian','路'+i), 1, 1+i%4);
    Battle.b.units.push(meX);
    Battle.b.terrain[2][3] = 'stonebox';
    const mm0 = Battle.b.loot.metal;
    await Battle.doMove(meX, 2, 3);
    const got = Battle.b.loot.metal - mm0;
    if (!(got>=0 && got<=2 && Battle.b.terrain[2][3]==='plain')) { assert(false, `T3c 金属越界 ${got}`); break; }
    if (i===19) assert(true, `T3c 20 轮拾取金属均在 0-2`);
  }

  // T4 石块为消耗品实例（可携带/可制造/无属性）
  const stoneInst = g.bagInst.filter(e=>e.id==='stone').pop();
  assert(stoneInst && stoneInst.lv===0 && !DATA.EQUIPS.stone.stats, 'T4 拾取石块为独立消耗品实例');

  // T5 渲染：百科地形表
  UI.wikiTab = 'fight'; UI.openWiki();
  const wh = elems['wiki-content'] ? elems['wiki-content'].innerHTML : '';
  assert(wh.includes('石头物资箱'), 'T5 百科地形表含石头物资箱');

  console.log('--- done ---');
  process.exit(0);
})();
