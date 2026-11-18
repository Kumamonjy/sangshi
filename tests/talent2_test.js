/* V53 新天赋（6正+4负）与初始资源 300/12 */
const fs = require('fs');
const html = fs.readFileSync('/workspace/index.html', 'utf8');
const scripts = html.match(/<script>([\s\S]*?)<\/script>/g);
let code = scripts[scripts.length - 1].replace(/^<script>/, '').replace(/<\/script>\s*$/, '');
const bootIdx = code.lastIndexOf("Game.renderHome();\n  window.addEventListener('resize'");
code = code.slice(0, bootIdx) + "window.__T = { Game, Battle, UI, DATA };\n})();";
const elems = {};
function mkEl(){ return { innerHTML:'', textContent:'', style:{ setProperty(){}, cssText:'' }, disabled:false, scrollTop:0, value:'', dataset:{}, children:[], className:'', classList:{ set:new Set(), toggle(k){}, add(k){this.set.add(k);}, remove(k){this.set.delete(k);}, contains(k){return this.set.has(k);} }, setAttribute(){}, removeAttribute(){}, appendChild(c){this.children.push(c);return c;}, remove(){}, addEventListener(){}, focus(){}, blur(){}, querySelector(){return null;}, querySelectorAll(){return [];}, getBoundingClientRect(){return{width:400,height:700,top:0,left:0};} }; }
global.document = { getElementById:id=>elems[id]||(elems[id]=mkEl()), querySelector:()=>mkEl(), querySelectorAll:()=>[], addEventListener(){}, createElement:()=>mkEl(), body:mkEl() };
global.window = { addEventListener(){}, location:{search:''}, scrollTo(){}, innerWidth:400, innerHeight:700 };
global.localStorage = { getItem:()=>null, setItem(){}, removeItem(){} };
global.navigator = { userAgent:'node' };
eval(code);
const assert=(c,n)=>console.log(c?'PASS '+n:'FAIL '+n);
const { Game, UI, DATA } = window.__T;
Game.g = Game.newGame(); Game.currentSlot = 1;
const g = Game.g;
const [s1] = g.chars;

(() => {
  // T1 初始资源
  assert(g.res.gold===500 && g.res.food===12, `T1 新档初始金币 500 / 食物 12（实际 ${g.res.gold}/${g.res.food}）`);

  // T2 天赋注册（V54：迅捷已删除）
  const ids = DATA.TALENTS.map(t=>t.id);
  const pos = ['sharp','vitality','berserk','veteran','lucky'].every(id=>ids.includes(id) && DATA.TALENTS.find(t=>t.id===id).good);
  const neg = ['clumsy','anemic','coward','lazy'].every(id=>ids.includes(id) && !DATA.TALENTS.find(t=>t.id===id).good);
  const noswift = !ids.includes('swift');
  assert(pos && neg && noswift, 'T2 天赋库注册正确（迅捷已删除，5 正 4 负）');

  // T2b 一览排序：正面在前、组内数值降序
  const seq = DATA.TALENTS.map(t=>t.id);
  const expSeq = ['immortal','vitality','veteran','eagle','berserk','athlete','ironwall','tough','brave','strong','sharp','sniper','hunter','frugal','lucky','anemic','coward','frail','lazy','dull','sick','glutton','clumsy'];
  const firstNeg = seq.findIndex(id=>!DATA.TALENTS.find(t=>t.id===id).good);
  const posSorted = seq.slice(0, firstNeg).join()===expSeq.slice(0, firstNeg).join();
  const negSorted = seq.slice(firstNeg).join()===expSeq.slice(firstNeg).join();
  assert(posSorted && negSorted, 'T2b 天赋一览：正面在前、负而在后、组内数值降序');

  // T3 正面天赋数值
  const mk = tids => { const c = Game.createChar('soldier', '测试'); c.talents = tids; Game.applyTalents(c); Game.recalc(c); return c; };
  const base = Game.createChar('soldier', '基准'); // 无天赋基准（withTalent=true 有随机天赋——改用清空）
  base.talents = []; Game.applyTalents(base); Game.recalc(base);
  const sh = mk(['sharp']); assert(sh.critRate===base.critRate+12, `T3a 锐利暴击+12（${sh.critRate}）`);
  const vi = mk(['vitality']); assert(vi.maxStamina===Math.round(base.baseMaxStamina*1.4), `T3b 活力体力+40%（${vi.maxStamina}）`);
  const be = mk(['berserk']); assert(be.atk===Math.round(base.baseAtk*1.25), `T3c 狂暴攻击+25%（${be.atk}）`);
  const ve = mk(['veteran']); assert(ve.maxHp===Math.round(base.baseMaxHp*1.2) && ve.def===Math.round(base.baseDef*1.3), `T3d 老兵血+20%防+30%`);

  // T4 负面天赋数值
  const cl = mk(['clumsy']); assert(cl.move===base.move-1, `T4a 笨拙移速-1（${cl.move}=${base.move}-1）`);
  const cl2 = mk(['clumsy','clumsy']); assert(cl2.move===Math.max(1,base.move-2) && cl2.move>=1, `T4a-2 双笨拙不低于1（${cl2.move}）`);
  const an = mk(['anemic']); assert(an.maxHp===Math.round(base.baseMaxHp*0.7), `T4b 贫血生命-30%（${an.maxHp}）`);
  const co = mk(['coward']); assert(co.critDmg===base.critDmg-30, `T4c 懦弱暴伤-30（${co.critDmg}）`);
  const la = mk(['lazy']); assert(la.maxStamina===Math.round(base.baseMaxStamina*0.8), `T4d 懒散体力-20%（${la.maxStamina}）`);

  // T5 福星每日 +5 金币
  const g0 = Game.newGame();
  g0.chars[0].talents = ['lucky']; Game.applyTalents(g0.chars[0]); Game.recalc(g0.chars[0]);
  g0.chars[1].talents = []; Game.applyTalents(g0.chars[1]); Game.recalc(g0.chars[1]);   // 排除随机天赋干扰
  Game.g = g0;
  g0.res.food = 99;
  const goldA = g0.res.gold;
  Game.nextDay();
  assert(g0.res.gold===goldA+5, `T5a 福星过夜+5金币（${goldA}→${g0.res.gold}）`);

  // T6 applyTalents 重置 luckyTalent
  g0.chars[0].talents = []; Game.applyTalents(g0.chars[0]);
  assert(g0.chars[0].luckyTalent===false, 'T6 清空天赋后 luckyTalent 重置');
  Game.g = g0; g0.res.food = 99;
  const goldB = g0.res.gold;
  Game.nextDay();
  assert(g0.res.gold===goldB, `T6b 无福星不加分（${goldB}）`);

  // T7 mealMsg 福星文案
  assert(Game.mealMsg({lucky:10}).includes('福星天赋带来 10 金币'), 'T7 mealMsg 福星文案');

  // T8 天赋数据在文件中（百科自动渲染）
  assert(html.includes('老兵') && html.includes('福星') && html.includes('懒散') && !html.includes("id:'swift'"), 'T8 天赋数据在文件中（迅捷已删）');

  console.log('--- done ---');
  process.exit(0);
})();
