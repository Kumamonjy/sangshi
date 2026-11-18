/* V56 装备实例化：升级（+20%/级、成本×级数、上限+5、身上可升）+ 分解（50% 向上取整、身上不可分解）+ 旧档迁移 */
const fs = require('fs');
const html = fs.readFileSync('/workspace/index.html', 'utf8');
const scripts = html.match(/<script>([\s\S]*?)<\/script>/g);
let code = scripts[scripts.length - 1].replace(/^<script>/, '').replace(/<\/script>\s*$/, '');
const bootIdx = code.lastIndexOf("Game.renderHome();\n  window.addEventListener('resize'");
code = code.slice(0, bootIdx) + "window.__T = { Game, UI, DATA };\n})();";
const elems = {};
function mkEl(){ return { innerHTML:'', textContent:'', style:{ setProperty(){} }, disabled:false, scrollTop:0, value:'', dataset:{}, children:[], className:'', classList:{toggle(){},add(){},remove(){},contains:()=>false}, setAttribute(){}, removeAttribute(){}, appendChild(c){this.children.push(c);return c;}, remove(){}, addEventListener(){}, focus(){}, blur(){}, querySelector(){return null;}, querySelectorAll(){return [];}, getBoundingClientRect(){return{width:400,height:700,top:0,left:0};} }; }
global.document = { getElementById:id=>elems[id]||(elems[id]=mkEl()), querySelector:()=>mkEl(), querySelectorAll:()=>[], addEventListener(){}, createElement:()=>mkEl(), body:mkEl() };
global.window = { addEventListener(){}, location:{search:''}, scrollTo(){}, innerWidth:400, innerHeight:700 };
global.localStorage = { getItem:()=>null, setItem(){}, removeItem(){} };
global.navigator = { userAgent:'node' };
eval(code);
const assert=(c,n)=>console.log(c?'PASS '+n:'FAIL '+n);
const { Game, UI, DATA } = window.__T;
Game.g = Game.newGame(); Game.currentSlot = 1;
const g = Game.g;
const [s1, s2] = g.chars;

(() => {
  // T1 新档 bagInst 实例化（6 件 lv0）+ 计数投影一致
  assert(g.bagInst.length===6 && g.bagInst.every(e=>e.uid && e.lv===0), `T1 新档 6 件实例（实际 ${g.bagInst.length}）`);
  assert(g.bag.cloth===2 && g.bag.cshoes===2 && g.bag.stone===2, 'T1b 计数投影一致');

  // T2 制造产生新实例（独立 uid）
  g.workshopLv = 1;
  g.res.gold = 200; g.res.metal = 10;
  const n0 = g.bagInst.length;
  Game.craft('stick');
  assert(g.bagInst.length===n0+1 && Game.bagCount('stick')===1, 'T2 制造生成独立实例');
  const stick = g.bagInst[g.bagInst.length-1];

  // T3 升级：成本 = 制造成本 × (lv+1)，属性 +20%
  g.res.gold = 500; g.res.metal = 50;
  const stickE = DATA.EQUIPS.stick;
  Game.upgradeEquip(stick.uid);          // +1：30💰+3⚙️
  assert(stick.lv===1 && g.bagInst.length===n0+1, `T3a 升级到 +1（${stick.lv}）`);
  assert(g.res.gold===500-30 && g.res.metal===50-3, `T3b +1 成本 30💰+3⚙️（${g.res.gold}/${g.res.metal}）`);
  Game.upgradeEquip(stick.uid);          // +2：60💰+6⚙️
  assert(stick.lv===2 && g.res.gold===470-60 && g.res.metal===47-6, `T3c +2 成本 60💰+6⚙️`);
  // 属性系数：攻 +5 → +1 级 = round(5*1.2)=6
  const probe = { equip:{ weapon:{ uid:'x', id:'stick', lv:1 } }, maxHp:0, maxStamina:0, atk:0, def:0 };
  const st1 = Game.equipStats(probe);
  assert(st1.atk===6, `T3d +1 级属性 = 初始×1.2（atk ${st1.atk}=round(5×1.2)）`);
  probe.equip.weapon.lv = 5;
  const st5 = Game.equipStats(probe);
  assert(st5.atk===10, `T3e +5 级属性 = 初始×2（atk ${st5.atk}=round(5×2)）`);

  // T4 满级拦截
  stick.lv = 5;
  const goldBefore = g.res.gold;
  Game.upgradeEquip(stick.uid);
  assert(stick.lv===5 && g.res.gold===goldBefore, 'T4 +5 满级无法再升');
  stick.lv = 0;

  // T5 材料不足拦截
  g.res.metal = 0;
  const lvBefore = stick.lv;
  Game.upgradeEquip(stick.uid);
  assert(stick.lv===lvBefore, 'T5 材料不足无法升级');

  // T6 分解：返还 50% 向上取整，实例移除
  g.res.gold = 100; g.res.metal = 0;
  const cntBefore = g.bagInst.length;
  Game.salvageEquip(stick.uid);          // 木棍 30💰+3⚙️ → 返 15💰+2⚙️
  assert(g.bagInst.length===cntBefore-1 && Game.bagCount('stick')===0, 'T6a 分解移除实例+投影');
  assert(g.res.gold===115 && g.res.metal===2, `T6b 返还 ceil(15)+ceil(1.5)=2⚙️（${g.res.gold}/${g.res.metal}）`);

  // T7 穿戴实例：穿上后离开背包、卸下放回、lv 跟随
  const clothInst = g.bagInst.find(e=>e.id==='cloth');
  clothInst.lv = 3;
  Game.equipChar(s1.id, 'armor', clothInst.uid);
  assert(Game.bagCount('cloth')===1 && typeof s1.equip.armor==='object' && s1.equip.armor.lv===3, 'T7a 穿上后实例离开背包、lv 保留');
  const hpLv3 = Game.effHp(s1);          // 布衣 hp+25 → +3 级 round(25*1.6)=40
  assert(hpLv3===s1.maxHp+40, `T7b +3 布衣生命加成 = round(25×1.6)=40（+${hpLv3-s1.maxHp}）`);
  Game.equipChar(s1.id, 'armor', null);
  assert(Game.bagCount('cloth')===2, 'T7c 卸下放回背包');
  const backInst = g.bagInst.find(e=>e.id==='cloth' && e.lv===3);
  assert(backInst && backInst.uid===clothInst.uid, 'T7d 卸下实例 uid/lv 保持');

  // T8 身上穿戴的装备可直接升级（升级弹窗含身上件）
  Game.equipChar(s1.id, 'armor', backInst.uid);
  g.res.gold = 500; g.res.fabric = 100;
  const g0 = g.res.gold;
  const wearRef = s1.equip.armor;                       // 穿戴槽对象引用（bagInst 中为另一实例对象）
  Game.upgradeEquip(wearRef.uid);                       // 布衣 +3→+4：60×4=240💰+16🧵
  assert(wearRef.lv===4, `T8a 身上件升级（${wearRef.lv}）`);
  assert(g.res.gold===g0-240 && g.res.fabric===84, 'T8b 布衣 +4 成本 240💰+16🧵');
  assert(s1.equip.armor.lv===4, 'T8c 穿戴槽同步');
  Game.equipChar(s1.id, 'armor', null);

  // T9 穿戴中不能分解
  const armInst = g.bagInst.find(e=>e.id==='cloth');
  Game.equipChar(s2.id, 'armor', armInst.uid);
  const cnt9 = g.bagInst.length;
  const gold9 = g.res.gold;
  Game.salvageEquip(armInst.uid);
  assert(g.bagInst.length===cnt9 && g.res.gold===gold9, 'T9 穿戴中不可分解');

  // T10 旧档迁移：计数 bag → 实例、equip 字符串 → 对象、投影重建
  const oldSave = { bag:{ stone:3, cloth:1 }, bagInst:[], chars:[ Object.assign({}, Game.createChar('soldier','旧人'), { equip:{ weapon:'stone', armor:null } }) ] };
  const gg = oldSave;
  // 直接走迁移逻辑（模拟 applySave 的装备段）
  gg.bagInst = gg.bagInst || [];
  if (gg.bagInst.length===0) Object.entries(gg.bag).forEach(([id,n])=>{ if (DATA.EQUIPS[id]) for(let i=0;i<n;i++) gg.bagInst.push({ uid:Game.newUid(), id, lv:0 }); });
  gg.bag = {}; gg.bagInst.forEach(e=>{ gg.bag[e.id]=(gg.bag[e.id]||0)+1; });
  gg.chars.forEach(c=>{ Object.entries(c.equip||{}).forEach(([slot,v])=>{ if (typeof v==='string') c.equip[slot] = { uid:Game.newUid(), id:v, lv:0 }; }); });
  assert(gg.bagInst.length===4 && gg.bag.stone===3, 'T10a 旧计数迁移为 4 件实例');
  assert(typeof gg.chars[0].equip.weapon==='object' && gg.chars[0].equip.weapon.id==='stone' && gg.chars[0].equip.weapon.lv===0, 'T10b 穿戴槽对象化');
  const probe2 = { equip:{ weapon: gg.chars[0].equip.weapon }, maxHp:0, maxStamina:0, atk:0, def:0 };
  assert(Game.equipStats(probe2).atk===5, 'T10c 迁移后 +0 级属性正常');

  // T11 UI 弹窗渲染
  UI.openUpgradeModal();
  const upHtml = elems['modal-body'] ? elems['modal-body'].innerHTML : '';
  assert(upHtml.includes('升级装备') && upHtml.includes('背包'), 'T11a 升级弹窗渲染（背包/身上标注）');
  UI.openSalvageModal();
  const svHtml = elems['modal-body'] ? elems['modal-body'].innerHTML : '';
  assert(svHtml.includes('分解装备') && svHtml.includes('返还'), 'T11b 分解弹窗渲染');
  UI.openCraftModal();
  assert((elems['modal-body'] ? elems['modal-body'].innerHTML : '').includes('打造装备'), 'T11c 打造弹窗渲染');

  // T12 工坊卡三按钮 + 内容不再铺开
  UI.renderBuild();
  const bh = elems['build-page'].innerHTML;
  assert(bh.includes('openCraftModal') && bh.includes('openUpgradeModal') && bh.includes('openSalvageModal'), 'T12a 工坊卡三功能按钮');
  assert(!bh.includes('成本：'), 'T12b 工坊卡不再铺开装备列表');

  console.log('--- done ---');
  process.exit(0);
})();
