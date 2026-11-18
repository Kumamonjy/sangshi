/* 区域丧尸概率池 + 丧尸等级=队伍平均等级 验证 */
const fs = require('fs');
const html = fs.readFileSync('/workspace/index.html', 'utf8');
const scripts = html.match(/<script>([\s\S]*?)<\/script>/g);
let code = scripts[scripts.length - 1].replace(/^<script>/, '').replace(/<\/script>\s*$/, '');
const bootIdx = code.lastIndexOf("Game.renderHome();\n  window.addEventListener('resize'");
code = code.slice(0, bootIdx) + "window.__T = { Game, Battle, UI, DATA };\n})();";
const elems = {};
function mkEl(){ return { innerHTML:'', textContent:'', style:{ setProperty(){}, }, disabled:false, scrollTop:0, value:'', dataset:{}, children:[], className:'', classList:{toggle(){},add(){},remove(){},contains:()=>false}, setAttribute(){}, removeAttribute(){}, appendChild(c){this.children.push(c);return c;}, remove(){}, addEventListener(){}, focus(){}, blur(){}, querySelector(){return null;}, querySelectorAll(){return [];}, getBoundingClientRect(){return{width:400,height:700,top:0,left:0};} }; }
global.document = { getElementById:id=>elems[id]||(elems[id]=mkEl()), querySelector:()=>mkEl(), querySelectorAll:()=>[], addEventListener(){}, createElement:()=>mkEl(), body:mkEl() };
global.window = { addEventListener(){}, location:{search:''}, scrollTo(){}, innerWidth:400, innerHeight:700 };
global.localStorage = { getItem:()=>null, setItem(){}, removeItem(){} };
global.navigator = { userAgent:'node' };
eval(code);
const assert=(c,n)=>console.log(c?'PASS '+n:'FAIL '+n);
const { Game, Battle, UI, DATA } = window.__T;
Game.g = Game.newGame(); Game.currentSlot = 1;
const g = Game.g;
const Z = id => DATA.ZONES.find(z=>z.id===id);

(async () => {
  // ===== T1 区域配置 =====
  assert(DATA.ZONES.length===5 && DATA.ZONES.every(z=>z.pool && z.count && z.count[0]<=z.count[1]), 'T1a 5 区域均有概率池与数量区间');
  assert(Z('factory').pool.behemoth===5 && !Z('factory').boss, 'T1b 工厂 5% 权重暴君且非必出');
  assert(Z('base').boss===true, 'T1c 军事基地 boss 必出');

  // ===== T2 丧尸等级 = 队伍平均等级 =====
  const [a,b0] = g.chars;
  a.level = 1; b0.level = 4;
  const c2 = Game.createChar('civilian'); g.chars.push(c2); c2.level = 2;
  UI.teamSelected = [a.id, b0.id, c2.id];
  a.stamina = b0.stamina = c2.stamina = 100;
  Battle.start(Z('market'));
  assert(Battle.b.zLevel === 2, 'T2a 平均 (1+4+2)/3=2.33 → Lv.2');
  assert(Battle.b.units.filter(u=>u.side==='ally').length===3, 'T2b 出战3人');
  const zlv = Battle.b.units.filter(u=>u.side==='enemy')[0].level;
  assert(zlv === 2, 'T2c 丧尸等级=2');

  // ===== T3 工厂编队：概率池 + 数量区间 =====
  let sawBehemoth = 0, counts = new Set();
  for (let i=0;i<120;i++) {
    UI.teamSelected = [a.id, b0.id, c2.id];
    a.stamina = b0.stamina = c2.stamina = 100;
    Battle.start(Z('factory'));
    const foes = Battle.b.units.filter(u=>u.side==='enemy');
    counts.add(foes.length);
    if (foes.some(u=>u.zombieType==='behemoth')) sawBehemoth++;
  }
  assert(sawBehemoth > 0, 'T3a 工厂可遭遇暴君（120 场出现 ' + sawBehemoth + ' 次）');
  assert([...counts].every(n=>n>=5 && n<=7), 'T3b 工厂丧尸数量 5~7（出现: ' + [...counts].sort().join(',') + '）');
  assert(sawBehemoth < 60, 'T3c 暴君非必出（占比 ' + Math.round(sawBehemoth/1.2) + '%）');

  // ===== T4 军事基地：暴君必出 1 只 + pool 抽取 =====
  UI.teamSelected = [a.id, b0.id, c2.id];
  a.stamina = b0.stamina = c2.stamina = 100;
  Battle.start(Z('base'));
  const bosses = Battle.b.units.filter(u=>u.zombieType==='behemoth');
  assert(bosses.length===1, 'T4a 军事基地恰好 1 只暴君');
  const types = new Set(Battle.b.units.filter(u=>u.side==='enemy').map(u=>u.zombieType));
  assert([...types].every(t=>['brute','licker','runner','savage','bomber','gasbag','behemoth'].includes(t)), 'T4b 类型均在基地池内');

  // ===== T5 丧尸潮预警 +2 =====
  g.hordeWarning = true;
  UI.teamSelected = [a.id, b0.id, c2.id];
  a.stamina = b0.stamina = c2.stamina = 100;
  Battle.start(Z('market'));
  const foes5 = Battle.b.units.filter(u=>u.side==='enemy').length;
  assert(foes5 >= 4+2 && foes5 <= 5+2, 'T5 丧尸潮数量 6~7（实际 ' + foes5 + '）');

  // ===== T6 市场只有 walker/runner =====
  let marketOK = true;
  for (let i=0;i<40;i++) {
    UI.teamSelected = [a.id, b0.id, c2.id];
    a.stamina = b0.stamina = c2.stamina = 100;
    Battle.start(Z('market'));
    if (Battle.b.units.filter(u=>u.side==='enemy').some(u=>!['walker','runner'].includes(u.zombieType))) marketOK = false;
  }
  assert(marketOK, 'T6 市场仅出现游荡丧尸/丧尸犬');

  console.log('--- done ---');
  process.exit(0);
})().catch(e=>{ console.error('TEST ERROR:', e.message); process.exit(1); });
