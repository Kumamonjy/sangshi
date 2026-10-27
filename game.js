// ============== 游戏配置 ==============
const CONFIG = {
  cols: 9,
  rows: 12,
  cellW: 50,
  cellH: 50,
  topOffset: 48,
  bottomOffset: 400,
  startGold: 300,
  baseHp: 2000,
  baseCol: 4,
  baseRow: 11,
  totalWaves: 5,
  moveCost: 10
};

const CW = CONFIG.cols * CONFIG.cellW;        // 450
const CH = CONFIG.rows * CONFIG.cellH;        // 600
const CV = CH + CONFIG.topOffset + CONFIG.bottomOffset; // 1048

function cellCenter(col, row) {
  return {
    x: col * CONFIG.cellW + CONFIG.cellW / 2,
    y: row * CONFIG.cellH + CONFIG.cellH / 2 + CONFIG.topOffset
  };
}

// 画布像素坐标 → 格子坐标（越界返回 null）
function pxToCell(x, y) {
  const col = Math.floor(x / CONFIG.cellW);
  const row = Math.floor((y - CONFIG.topOffset) / CONFIG.cellH);
  if (col < 0 || col >= CONFIG.cols || row < 0 || row >= CONFIG.rows) return null;
  return { col, row };
}

// 鼠标/触摸事件坐标 → 画布内部像素坐标
function clientToCanvas(e) {
  const cv = Game.canvas;
  const rect = cv.getBoundingClientRect();
  return {
    x: (e.clientX - rect.left) * (cv.width / rect.width),
    y: (e.clientY - rect.top) * (cv.height / rect.height)
  };
}

// 统一的血条绘制（供 Unit / Monster 复用）
function drawHealthBar(ctx, x, y, size, hp, maxHp) {
  const bw = size * 2;
  const bx = x - bw / 2;
  const by = y - size - 10;
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(bx - 1, by - 1, bw + 2, 6);
  ctx.fillStyle = '#222';
  ctx.fillRect(bx, by, bw, 4);
  const ratio = Math.max(0, hp / maxHp);
  ctx.fillStyle = ratio > 0.5 ? '#22c55e' : ratio > 0.25 ? '#eab308' : '#ef4444';
  ctx.fillRect(bx, by, bw * ratio, 4);
}

// ============== 单位矢量图标绘制（战斗画布与建造栏共用，保证图标一致） ==============

// 颜色加深辅助
function darken(hex, amt) {
  const c = hex.replace('#','');
  const r = Math.max(0, parseInt(c.substr(0,2),16) - amt);
  const g = Math.max(0, parseInt(c.substr(2,2),16) - amt);
  const b = Math.max(0, parseInt(c.substr(4,2),16) - amt);
  return `rgb(${r},${g},${b})`;
}

// 栅栏
function drawFence(ctx, x, y, s, flash) {
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(x, y + s*0.6, s*0.6, s*0.16, 0, 0, Math.PI*2);
  ctx.fill();
  const col = flash ? '#fff' : '#8b7355';
  const dark = flash ? '#fff' : '#5c4a30';
  // 三根竖木
  for (let i = -1; i <= 1; i++) {
    ctx.fillStyle = col;
    ctx.fillRect(x + i*s*0.42 - s*0.12, y - s*0.7, s*0.24, s*1.3);
    ctx.fillStyle = dark;
    ctx.fillRect(x + i*s*0.42 - s*0.12, y - s*0.7, s*0.06, s*1.3);
    // 尖头
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.moveTo(x + i*s*0.42 - s*0.12, y - s*0.7);
    ctx.lineTo(x + i*s*0.42, y - s*0.95);
    ctx.lineTo(x + i*s*0.42 + s*0.12, y - s*0.7);
    ctx.fill();
  }
  // 两根横木
  ctx.fillStyle = dark;
  ctx.fillRect(x - s*0.6, y - s*0.35, s*1.2, s*0.1);
  ctx.fillRect(x - s*0.6, y + s*0.15, s*1.2, s*0.1);
  ctx.restore();
}

// 地雷
function drawMine(ctx, x, y, s, flash, unit) {
  ctx.save();
  // 阴影
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(x, y + s*0.5, s*0.5, s*0.14, 0, 0, Math.PI*2);
  ctx.fill();
  const armed = unit ? unit.armTimer <= 0 : true;
  const body = flash ? '#fff' : '#1f2937';
  const dark = flash ? '#fff' : '#111827';
  // 已埋设：半透明（埋入地下效果）
  if (armed) ctx.globalAlpha = 0.55;
  // 地雷主体（圆形）
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.arc(x, y, s*0.5, 0, Math.PI*2);
  ctx.fill();
  // 顶部凸起（引信座）
  ctx.fillStyle = dark;
  ctx.fillRect(x - s*0.12, y - s*0.6, s*0.24, s*0.2);
  // 引线
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = s*0.08;
  ctx.beginPath();
  ctx.moveTo(x, y - s*0.6);
  ctx.quadraticCurveTo(x + s*0.2, y - s*0.85, x + s*0.15, y - s*1.0);
  ctx.stroke();
  // 引线火花（仅埋设期闪烁，提醒玩家尚未生效）
  if (!armed) {
    const spark = Math.sin(Date.now() / 100) > 0;
    if (spark) {
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(x + s*0.15, y - s*1.0, s*0.12, 0, Math.PI*2);
      ctx.fill();
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(x + s*0.15, y - s*1.0, s*0.06, 0, Math.PI*2);
      ctx.fill();
    }
  }
  // 地雷表面十字标记
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = s*0.06;
  ctx.beginPath();
  ctx.moveTo(x - s*0.25, y);
  ctx.lineTo(x + s*0.25, y);
  ctx.moveTo(x, y - s*0.25);
  ctx.lineTo(x, y + s*0.25);
  ctx.stroke();
  // 埋设期进度环
  if (!armed && unit && unit.armTimer > 0) {
    ctx.globalAlpha = 1;
    const progress = 1 - unit.armTimer / 3;
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = s*0.1;
    ctx.beginPath();
    ctx.arc(x, y, s*0.7, -Math.PI/2, -Math.PI/2 + progress * Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

// 医院
function drawHospital(ctx, x, y, s, flash) {
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(x, y + s*0.6, s*0.6, s*0.16, 0, 0, Math.PI*2);
  ctx.fill();
  const wall = flash ? '#fff' : '#e2e8f0';
  const roof = flash ? '#fff' : '#dc2626';
  // 墙身
  ctx.fillStyle = wall;
  ctx.fillRect(x - s*0.55, y - s*0.3, s*1.1, s*0.85);
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x - s*0.55, y - s*0.3, s*1.1, s*0.85);
  // 屋顶
  ctx.fillStyle = roof;
  ctx.beginPath();
  ctx.moveTo(x - s*0.65, y - s*0.3);
  ctx.lineTo(x, y - s*0.8);
  ctx.lineTo(x + s*0.65, y - s*0.3);
  ctx.fill();
  // 十字
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(x - s*0.1, y - s*0.1, s*0.2, s*0.45);
  ctx.fillRect(x - s*0.28, y + s*0.02, s*0.56, s*0.18);
  ctx.restore();
}

// 前哨站
function drawOutpost(ctx, x, y, s, flash) {
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(x, y + s*0.6, s*0.55, s*0.16, 0, 0, Math.PI*2);
  ctx.fill();
  const stone = flash ? '#fff' : '#6b7280';
  const stoneDark = flash ? '#fff' : '#374151';
  // 塔身
  ctx.fillStyle = stone;
  ctx.fillRect(x - s*0.4, y - s*0.5, s*0.8, s*1.0);
  ctx.fillStyle = stoneDark;
  ctx.fillRect(x - s*0.4, y - s*0.5, s*0.8, s*0.12);
  // 城垛
  ctx.fillStyle = stone;
  for (let i = -2; i <= 2; i++) {
    ctx.fillRect(x + i*s*0.18 - s*0.08, y - s*0.72, s*0.16, s*0.22);
  }
  // 射击孔
  ctx.fillStyle = '#1f2937';
  ctx.fillRect(x - s*0.08, y - s*0.05, s*0.16, s*0.28);
  ctx.restore();
}

// 冰冻塔：冰晶塔身 + 顶部水晶
function drawFreezeTower(ctx, x, y, s, flash) {
  ctx.save();
  // 阴影
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(x, y + s*0.6, s*0.55, s*0.16, 0, 0, Math.PI*2);
  ctx.fill();
  const base = flash ? '#fff' : '#0ea5e9';
  const baseDark = flash ? '#fff' : '#0369a1';
  // 塔身
  ctx.fillStyle = base;
  ctx.beginPath();
  ctx.moveTo(x - s*0.38, y + s*0.5);
  ctx.lineTo(x - s*0.28, y - s*0.3);
  ctx.lineTo(x + s*0.28, y - s*0.3);
  ctx.lineTo(x + s*0.38, y + s*0.5);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = baseDark;
  ctx.fillRect(x - s*0.38, y + s*0.35, s*0.76, s*0.15);
  // 顶部水晶
  const crystal = flash ? '#fff' : '#7dd3fc';
  const crystalDark = flash ? '#fff' : '#38bdf8';
  ctx.fillStyle = crystal;
  ctx.beginPath();
  ctx.moveTo(x, y - s*0.75);
  ctx.lineTo(x - s*0.22, y - s*0.3);
  ctx.lineTo(x + s*0.22, y - s*0.3);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = crystalDark;
  ctx.beginPath();
  ctx.moveTo(x, y - s*0.75);
  ctx.lineTo(x, y - s*0.3);
  ctx.lineTo(x + s*0.22, y - s*0.3);
  ctx.closePath();
  ctx.fill();
  // 水晶高光
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.beginPath();
  ctx.moveTo(x - s*0.06, y - s*0.6);
  ctx.lineTo(x - s*0.12, y - s*0.35);
  ctx.lineTo(x, y - s*0.4);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// 角色小人（含身体、头、武器、头饰）
function drawCharacter(ctx, x, y, s, type, flash) {
  const cfg = UNIT_TYPES[type];
  const body = flash ? '#fff' : cfg.color;
  const bodyDark = flash ? '#fff' : darken(cfg.color, 50);
  const skin = flash ? '#fff' : '#fcd5b5';
  ctx.save();
  // 阴影
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(x, y + s*0.65, s*0.5, s*0.16, 0, 0, Math.PI*2);
  ctx.fill();
  // 身体
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.roundRect(x - s*0.32, y - s*0.15, s*0.64, s*0.65, s*0.12);
  ctx.fill();
  ctx.fillStyle = bodyDark;
  ctx.fillRect(x - s*0.32, y + s*0.25, s*0.64, s*0.12);
  // 头
  ctx.fillStyle = skin;
  ctx.beginPath();
  ctx.arc(x, y - s*0.32, s*0.24, 0, Math.PI*2);
  ctx.fill();
  ctx.strokeStyle = '#d4a574';
  ctx.lineWidth = 1;
  ctx.stroke();
  // 眼睛
  ctx.fillStyle = '#1f2937';
  ctx.beginPath();
  ctx.arc(x - s*0.08, y - s*0.34, s*0.035, 0, Math.PI*2);
  ctx.arc(x + s*0.08, y - s*0.34, s*0.035, 0, Math.PI*2);
  ctx.fill();
  // 武器
  drawWeapon(ctx, x, y, s, type, flash);
  // 头饰
  drawHeadgear(ctx, x, y, s, type, flash);
  ctx.restore();
}

// 武器（按类型区分）
function drawWeapon(ctx, x, y, s, type, flash) {
  const wcol = flash ? '#fff' : '#374151';
  const wdark = flash ? '#fff' : '#111827';
  ctx.fillStyle = wcol;
  ctx.strokeStyle = wdark;
  ctx.lineWidth = 1;
  if (type === 'pistol') {
    // 手枪
    ctx.fillRect(x + s*0.1, y - s*0.05, s*0.32, s*0.1);
    ctx.fillRect(x + s*0.12, y + s*0.02, s*0.14, s*0.14);
  } else if (type === 'assault') {
    // 突击步枪
    ctx.fillRect(x + s*0.05, y - s*0.04, s*0.5, s*0.09);
    ctx.fillRect(x + s*0.42, y - s*0.1, s*0.08, s*0.08);
    ctx.fillRect(x + s*0.15, y + s*0.04, s*0.1, s*0.16);
  } else if (type === 'rifle') {
    // 步枪（长枪管）
    ctx.fillRect(x - s*0.05, y - s*0.03, s*0.6, s*0.07);
    ctx.fillRect(x + s*0.5, y - s*0.06, s*0.08, s*0.12);
  } else if (type === 'mg') {
    // 机枪（粗大）
    ctx.fillRect(x, y - s*0.06, s*0.55, s*0.14);
    ctx.fillRect(x + s*0.5, y - s*0.04, s*0.1, s*0.1);
    ctx.fillRect(x + s*0.1, y + s*0.06, s*0.08, s*0.16);
  } else if (type === 'sniper') {
    // 狙击枪（超长+瞄准镜）
    ctx.fillRect(x - s*0.15, y - s*0.03, s*0.75, s*0.06);
    ctx.fillStyle = flash ? '#fff' : '#1e293b';
    ctx.fillRect(x + s*0.15, y - s*0.14, s*0.2, s*0.1);
    ctx.fillStyle = wcol;
  } else if (type === 'grenadier') {
    // 榴弹发射器
    ctx.fillRect(x, y - s*0.06, s*0.45, s*0.14);
    ctx.fillStyle = flash ? '#fff' : '#16a34a';
    ctx.beginPath();
    ctx.arc(x + s*0.48, y - s*0.02, s*0.1, 0, Math.PI*2);
    ctx.fill();
  } else if (type === 'shotgun') {
    // 霰弹枪（粗短双管）
    ctx.fillRect(x, y - s*0.07, s*0.42, s*0.08);
    ctx.fillRect(x, y + s*0.01, s*0.42, s*0.08);
    ctx.fillRect(x + s*0.38, y - s*0.09, s*0.06, s*0.2);
  } else if (type === 'terminator') {
    // 重型霰弹枪（金属红，更大更粗）
    ctx.fillStyle = flash ? '#fff' : '#991b1b';
    ctx.fillRect(x - s*0.05, y - s*0.09, s*0.5, s*0.1);
    ctx.fillRect(x - s*0.05, y + s*0.01, s*0.5, s*0.1);
    ctx.fillStyle = flash ? '#fff' : '#450a0a';
    ctx.fillRect(x + s*0.4, y - s*0.11, s*0.08, s*0.24);
    // 枪管金属高光
    ctx.fillStyle = flash ? '#fff' : '#fca5a5';
    ctx.fillRect(x + s*0.38, y - s*0.09, s*0.02, s*0.2);
  } else if (type === 'medic') {
    // 医疗杖：杖身 + 顶部红十字
    ctx.fillRect(x + s*0.1, y - s*0.02, s*0.3, s*0.06);
    ctx.fillStyle = flash ? '#fff' : '#dc2626';
    ctx.fillRect(x + s*0.38, y - s*0.12, s*0.06, s*0.22);
    ctx.fillRect(x + s*0.3, y - s*0.04, s*0.22, s*0.06);
  } else if (type === 'pharmacist') {
    // 注射器：针筒 + 推杆 + 针头
    ctx.fillStyle = flash ? '#fff' : '#e9d5ff';
    ctx.fillRect(x + s*0.12, y - s*0.04, s*0.3, s*0.1); // 针筒
    ctx.fillStyle = flash ? '#fff' : '#7c3aed';
    ctx.fillRect(x + s*0.06, y - s*0.02, s*0.08, s*0.06); // 推杆
    ctx.fillStyle = flash ? '#fff' : '#9ca3af';
    ctx.fillRect(x + s*0.42, y - s*0.015, s*0.1, s*0.05); // 针头
    // 药液（紫色）
    ctx.fillStyle = flash ? '#fff' : '#a855f7';
    ctx.fillRect(x + s*0.16, y - s*0.03, s*0.18, s*0.08);
  } else if (type === 'crossbow') {
    // 弩：横向弓臂 + 弩身 + 弦
    ctx.fillRect(x - s*0.1, y - s*0.02, s*0.4, s*0.05); // 弩身
    // 弓臂（上下弯曲）
    ctx.strokeStyle = flash ? '#fff' : '#78350f';
    ctx.lineWidth = s*0.07;
    ctx.beginPath();
    ctx.moveTo(x + s*0.15, y - s*0.25);
    ctx.quadraticCurveTo(x + s*0.4, y - s*0.12, x + s*0.45, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + s*0.15, y + s*0.25);
    ctx.quadraticCurveTo(x + s*0.4, y + s*0.12, x + s*0.45, y);
    ctx.stroke();
    // 弦
    ctx.strokeStyle = flash ? '#fff' : '#e5e7eb';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x + s*0.45, y);
    ctx.lineTo(x + s*0.15, y - s*0.25);
    ctx.moveTo(x + s*0.45, y);
    ctx.lineTo(x + s*0.15, y + s*0.25);
    ctx.stroke();
    // 箭
    ctx.fillStyle = flash ? '#fff' : '#fbbf24';
    ctx.fillRect(x + s*0.3, y - s*0.01, s*0.3, s*0.02);
    ctx.beginPath();
    ctx.moveTo(x + s*0.6, y - s*0.04);
    ctx.lineTo(x + s*0.68, y);
    ctx.lineTo(x + s*0.6, y + s*0.04);
    ctx.closePath();
    ctx.fill();
  } else if (type === 'axe') {
    // 战斧：长柄 + 双面斧刃
    ctx.fillStyle = flash ? '#fff' : '#78350f';
    ctx.fillRect(x + s*0.08, y - s*0.025, s*0.42, s*0.05); // 斧柄
    // 斧刃（双面）
    ctx.fillStyle = flash ? '#fff' : '#9ca3af';
    ctx.strokeStyle = flash ? '#fff' : '#4b5563';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + s*0.42, y - s*0.025);
    ctx.lineTo(x + s*0.58, y - s*0.2);
    ctx.lineTo(x + s*0.52, y);
    ctx.lineTo(x + s*0.58, y + s*0.2);
    ctx.lineTo(x + s*0.42, y + s*0.025);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // 斧刃高光
    ctx.fillStyle = flash ? '#fff' : '#d1d5db';
    ctx.beginPath();
    ctx.moveTo(x + s*0.46, y - s*0.02);
    ctx.lineTo(x + s*0.56, y - s*0.16);
    ctx.lineTo(x + s*0.5, y);
    ctx.closePath();
    ctx.fill();
  } else if (type === 'engineer') {
    // 扳手：长柄 + 开口扳手头部
    ctx.fillStyle = flash ? '#fff' : '#374151';
    ctx.strokeStyle = flash ? '#fff' : '#111827';
    ctx.lineWidth = 1;
    // 扳手柄
    ctx.fillRect(x + s*0.05, y - s*0.03, s*0.35, s*0.06);
    // 扳手头（开口）
    ctx.fillStyle = flash ? '#fff' : '#9ca3af';
    ctx.beginPath();
    ctx.arc(x + s*0.42, y, s*0.12, 0, Math.PI*2);
    ctx.fill();
    ctx.stroke();
    // 开口槽
    ctx.fillStyle = flash ? '#fff' : '#111827';
    ctx.fillRect(x + s*0.42, y - s*0.06, s*0.04, s*0.12);
  } else if (type === 'firemage') {
    // 法杖：深色杖身 + 顶部火球
    ctx.fillStyle = flash ? '#fff' : '#78350f';
    ctx.fillRect(x + s*0.1, y - s*0.02, s*0.32, s*0.05);
    // 顶部火球（发光）
    const fx = x + s*0.44, fy = y;
    const fg = ctx.createRadialGradient(fx, fy, 0, fx, fy, s*0.12);
    fg.addColorStop(0, flash ? '#fff' : '#fef08a');
    fg.addColorStop(0.5, flash ? '#fff' : '#f97316');
    fg.addColorStop(1, 'rgba(239,68,68,0)');
    ctx.fillStyle = fg;
    ctx.beginPath();
    ctx.arc(fx, fy, s*0.12, 0, Math.PI*2);
    ctx.fill();
  } else if (type === 'icemage') {
    // 法杖：深蓝杖身 + 顶部冰晶
    ctx.fillStyle = flash ? '#fff' : '#1e3a5f';
    ctx.fillRect(x + s*0.1, y - s*0.02, s*0.32, s*0.05);
    // 顶部冰晶（菱形发光）
    const ix = x + s*0.44, iy = y;
    const ig = ctx.createRadialGradient(ix, iy, 0, ix, iy, s*0.13);
    ig.addColorStop(0, flash ? '#fff' : '#e0f2fe');
    ig.addColorStop(0.5, flash ? '#fff' : '#38bdf8');
    ig.addColorStop(1, 'rgba(56,189,248,0)');
    ctx.fillStyle = ig;
    ctx.beginPath();
    ctx.arc(ix, iy, s*0.13, 0, Math.PI*2);
    ctx.fill();
    // 冰晶菱形
    ctx.fillStyle = flash ? '#fff' : '#bae6fd';
    ctx.strokeStyle = flash ? '#fff' : '#0284c7';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(ix, iy - s*0.08);
    ctx.lineTo(ix + s*0.06, iy);
    ctx.lineTo(ix, iy + s*0.08);
    ctx.lineTo(ix - s*0.06, iy);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
  }
}

// 头饰（按类型区分）
function drawHeadgear(ctx, x, y, s, type, flash) {
  const cfg = UNIT_TYPES[type];
  const col = flash ? '#fff' : darken(cfg.color, 30);
  ctx.fillStyle = col;
  if (type === 'pistol') {
    // 头盔
    ctx.beginPath();
    ctx.arc(x, y - s*0.38, s*0.26, Math.PI, 0);
    ctx.fill();
  } else if (type === 'assault') {
    // 头盔+护带
    ctx.beginPath();
    ctx.arc(x, y - s*0.38, s*0.27, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = flash ? '#fff' : '#1f2937';
    ctx.fillRect(x - s*0.27, y - s*0.4, s*0.54, s*0.05);
  } else if (type === 'rifle') {
    // 贝雷帽
    ctx.beginPath();
    ctx.ellipse(x, y - s*0.42, s*0.28, s*0.12, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.fillRect(x - s*0.28, y - s*0.42, s*0.56, s*0.06);
  } else if (type === 'mg') {
    // 钢盔
    ctx.beginPath();
    ctx.arc(x, y - s*0.38, s*0.28, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(x - s*0.3, y - s*0.4, s*0.6, s*0.04);
  } else if (type === 'sniper') {
    // 鸭舌帽
    ctx.beginPath();
    ctx.ellipse(x, y - s*0.4, s*0.24, s*0.1, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.fillRect(x - s*0.05, y - s*0.42, s*0.32, s*0.06);
  } else if (type === 'grenadier') {
    // 头盔
    ctx.beginPath();
    ctx.arc(x, y - s*0.38, s*0.27, Math.PI, 0);
    ctx.fill();
  } else if (type === 'shotgun') {
    // 头巾/帽
    ctx.beginPath();
    ctx.ellipse(x, y - s*0.4, s*0.26, s*0.11, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.fillRect(x - s*0.26, y - s*0.4, s*0.52, s*0.05);
  } else if (type === 'terminator') {
    // 金属头盔
    ctx.fillStyle = flash ? '#fff' : '#dc2626';
    ctx.beginPath();
    ctx.ellipse(x, y - s*0.4, s*0.3, s*0.22, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.strokeStyle = flash ? '#fff' : '#7f1d1d';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // 红色独眼（发光）
    ctx.fillStyle = '#fef08a';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(x, y - s*0.4, s*0.09, 0, Math.PI*2);
    ctx.fill();
    ctx.shadowBlur = 0;
    // 瞳孔
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(x, y - s*0.4, s*0.04, 0, Math.PI*2);
    ctx.fill();
    // 头盔金属接缝
    ctx.strokeStyle = flash ? '#fff' : '#7f1d1d';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x - s*0.28, y - s*0.4);
    ctx.lineTo(x - s*0.12, y - s*0.4);
    ctx.moveTo(x + s*0.12, y - s*0.4);
    ctx.lineTo(x + s*0.28, y - s*0.4);
    ctx.stroke();
  } else if (type === 'medic') {
    // 白色医疗帽 + 红十字
    ctx.fillStyle = flash ? '#fff' : '#f1f5f9';
    ctx.beginPath();
    ctx.arc(x, y - s*0.38, s*0.26, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(x - s*0.26, y - s*0.4, s*0.52, s*0.05);
    // 红十字标记
    ctx.fillStyle = flash ? '#fff' : '#dc2626';
    ctx.fillRect(x - s*0.04, y - s*0.46, s*0.08, s*0.14);
    ctx.fillRect(x - s*0.09, y - s*0.41, s*0.18, s*0.05);
  } else if (type === 'pharmacist') {
    // 紫色制药头巾（圆帽，带药瓶徽记）
    ctx.fillStyle = flash ? '#fff' : '#7c3aed';
    ctx.beginPath();
    ctx.arc(x, y - s*0.38, s*0.27, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(x - s*0.27, y - s*0.4, s*0.54, s*0.06);
    // 药瓶徽记（圆身+瓶颈）
    ctx.fillStyle = flash ? '#fff' : '#c4b5fd';
    ctx.beginPath();
    ctx.arc(x, y - s*0.46, s*0.07, 0, Math.PI*2);
    ctx.fill();
    ctx.fillRect(x - s*0.03, y - s*0.53, s*0.06, s*0.05);
  } else if (type === 'crossbow') {
    // 猎人兜帽
    ctx.beginPath();
    ctx.arc(x, y - s*0.38, s*0.27, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(x - s*0.27, y - s*0.4, s*0.54, s*0.06);
    // 兜帽尖端
    ctx.beginPath();
    ctx.moveTo(x + s*0.2, y - s*0.55);
    ctx.lineTo(x + s*0.32, y - s*0.7);
    ctx.lineTo(x + s*0.12, y - s*0.42);
    ctx.closePath();
    ctx.fill();
  } else if (type === 'axe') {
    // 角盔（战士头盔 + 双角）
    ctx.beginPath();
    ctx.arc(x, y - s*0.38, s*0.28, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(x - s*0.28, y - s*0.4, s*0.56, s*0.05);
    // 双角
    ctx.fillStyle = flash ? '#fff' : '#fef3c7';
    ctx.beginPath();
    ctx.moveTo(x - s*0.22, y - s*0.42);
    ctx.lineTo(x - s*0.36, y - s*0.62);
    ctx.lineTo(x - s*0.16, y - s*0.5);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + s*0.22, y - s*0.42);
    ctx.lineTo(x + s*0.36, y - s*0.62);
    ctx.lineTo(x + s*0.16, y - s*0.5);
    ctx.closePath();
    ctx.fill();
  } else if (type === 'engineer') {
    // 安全帽：黄色圆顶 + 帽檐
    ctx.fillStyle = flash ? '#fff' : '#eab308';
    ctx.beginPath();
    ctx.arc(x, y - s*0.38, s*0.26, Math.PI, 0);
    ctx.fill();
    // 帽檐
    ctx.fillRect(x - s*0.3, y - s*0.4, s*0.6, s*0.06);
    // 顶部条纹
    ctx.fillStyle = flash ? '#fff' : '#ca8a04';
    ctx.fillRect(x - s*0.15, y - s*0.45, s*0.3, s*0.03);
  } else if (type === 'firemage') {
    // 法师尖帽：橙色尖顶 + 帽檐
    ctx.fillStyle = flash ? '#fff' : '#f97316';
    ctx.strokeStyle = flash ? '#fff' : '#c2410c';
    ctx.lineWidth = 1;
    // 帽檐
    ctx.fillRect(x - s*0.32, y - s*0.42, s*0.64, s*0.06);
    // 尖顶（三角形）
    ctx.beginPath();
    ctx.moveTo(x - s*0.22, y - s*0.42);
    ctx.lineTo(x, y - s*0.85);
    ctx.lineTo(x + s*0.22, y - s*0.42);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // 帽尖火球装饰
    const hx = x, hy = y - s*0.85;
    const hg = ctx.createRadialGradient(hx, hy, 0, hx, hy, s*0.08);
    hg.addColorStop(0, flash ? '#fff' : '#fef08a');
    hg.addColorStop(1, 'rgba(239,68,68,0)');
    ctx.fillStyle = hg;
    ctx.beginPath();
    ctx.arc(hx, hy, s*0.08, 0, Math.PI*2);
    ctx.fill();
  } else if (type === 'icemage') {
    // 法师尖帽：冰蓝尖顶 + 帽檐
    ctx.fillStyle = flash ? '#fff' : '#38bdf8';
    ctx.strokeStyle = flash ? '#fff' : '#0284c7';
    ctx.lineWidth = 1;
    // 帽檐
    ctx.fillRect(x - s*0.32, y - s*0.42, s*0.64, s*0.06);
    // 尖顶（三角形）
    ctx.beginPath();
    ctx.moveTo(x - s*0.22, y - s*0.42);
    ctx.lineTo(x, y - s*0.85);
    ctx.lineTo(x + s*0.22, y - s*0.42);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // 帽尖冰晶装饰
    const hx2 = x, hy2 = y - s*0.85;
    const hg2 = ctx.createRadialGradient(hx2, hy2, 0, hx2, hy2, s*0.08);
    hg2.addColorStop(0, flash ? '#fff' : '#e0f2fe');
    hg2.addColorStop(1, 'rgba(56,189,248,0)');
    ctx.fillStyle = hg2;
    ctx.beginPath();
    ctx.arc(hx2, hy2, s*0.08, 0, Math.PI*2);
    ctx.fill();
  }
}

// 统一单位图标分发（战斗画布与建造栏共用）
// 火焰塔：红砖塔身 + 顶部喷火口（朝向由光束体现）
function drawFlameTower(ctx, x, y, s, flash) {
  ctx.save();
  // 阴影
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(x, y + s*0.6, s*0.55, s*0.16, 0, 0, Math.PI*2);
  ctx.fill();
  const brick = flash ? '#fff' : '#b91c1c';
  const brickDark = flash ? '#fff' : '#7f1d1d';
  // 塔身（红砖）
  ctx.fillStyle = brick;
  ctx.fillRect(x - s*0.4, y - s*0.4, s*0.8, s*0.9);
  // 砖纹
  ctx.strokeStyle = brickDark;
  ctx.lineWidth = 1;
  for (let r = 0; r < 4; r++) {
    const yy = y - s*0.4 + r * s*0.22;
    ctx.beginPath();
    ctx.moveTo(x - s*0.4, yy);
    ctx.lineTo(x + s*0.4, yy);
    ctx.stroke();
    const off = (r % 2) * s*0.2;
    ctx.beginPath();
    ctx.moveTo(x - s*0.4 + off, yy);
    ctx.lineTo(x - s*0.4 + off, yy + s*0.22);
    ctx.moveTo(x + s*0.4 - off + (off?s*0.2:0), yy);
    ctx.lineTo(x + s*0.4 - off + (off?s*0.2:0), yy + s*0.22);
    ctx.stroke();
  }
  // 顶部喷火口（金属环）
  ctx.fillStyle = flash ? '#fff' : '#374151';
  ctx.fillRect(x - s*0.3, y - s*0.55, s*0.6, s*0.18);
  ctx.fillStyle = flash ? '#fff' : '#1f2937';
  ctx.fillRect(x - s*0.22, y - s*0.5, s*0.44, s*0.1);
  // 火苗（塔顶小火焰）
  const t = Date.now() / 120;
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  ctx.moveTo(x, y - s*0.75 - Math.sin(t)*2);
  ctx.quadraticCurveTo(x - s*0.12, y - s*0.58, x - s*0.1, y - s*0.5);
  ctx.quadraticCurveTo(x, y - s*0.56, x + s*0.1, y - s*0.5);
  ctx.quadraticCurveTo(x + s*0.12, y - s*0.58, x, y - s*0.75 - Math.sin(t)*2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.ellipse(x, y - s*0.58, s*0.04, s*0.08, 0, 0, Math.PI*2);
  ctx.fill();
  ctx.restore();
}

// 闪电塔：紫色塔身 + 顶部闪电符文
function drawLightningTower(ctx, x, y, s, flash) {
  ctx.save();
  // 阴影
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(x, y + s*0.6, s*0.55, s*0.16, 0, 0, Math.PI*2);
  ctx.fill();
  const base = flash ? '#fff' : '#7c3aed';
  const baseDark = flash ? '#fff' : '#4c1d95';
  // 塔身（梯形）
  ctx.fillStyle = base;
  ctx.beginPath();
  ctx.moveTo(x - s*0.4, y + s*0.5);
  ctx.lineTo(x - s*0.28, y - s*0.25);
  ctx.lineTo(x + s*0.28, y - s*0.25);
  ctx.lineTo(x + s*0.4, y + s*0.5);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = baseDark;
  ctx.fillRect(x - s*0.4, y + s*0.35, s*0.8, s*0.15);
  // 顶部金属环
  ctx.fillStyle = flash ? '#fff' : '#312e81';
  ctx.fillRect(x - s*0.28, y - s*0.38, s*0.56, s*0.15);
  // 闪电符号（发光）
  const bolt = flash ? '#fff' : '#fde047';
  const boltGlow = flash ? '#fff' : '#a855f7';
  ctx.shadowColor = boltGlow;
  ctx.shadowBlur = 10;
  ctx.fillStyle = bolt;
  ctx.beginPath();
  ctx.moveTo(x + s*0.05, y - s*0.8);
  ctx.lineTo(x - s*0.14, y - s*0.4);
  ctx.lineTo(x - s*0.01, y - s*0.4);
  ctx.lineTo(x - s*0.1, y - s*0.12);
  ctx.lineTo(x + s*0.14, y - s*0.5);
  ctx.lineTo(x + s*0.01, y - s*0.5);
  ctx.lineTo(x + s*0.1, y - s*0.8);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();
}

function drawUnitVector(ctx, type, x, y, size, flash, unit) {
  const cfg = UNIT_TYPES[type];
  if (cfg.isBuilding) {
    if (type === 'fence') drawFence(ctx, x, y, size, flash);
    else if (type === 'mine') drawMine(ctx, x, y, size, flash, unit);
    else if (type === 'hospital') drawHospital(ctx, x, y, size, flash);
    else if (type === 'outpost') drawOutpost(ctx, x, y, size, flash);
    else if (type === 'freeze') drawFreezeTower(ctx, x, y, size, flash);
    else if (type === 'flame') drawFlameTower(ctx, x, y, size, flash);
    else if (type === 'lightning') drawLightningTower(ctx, x, y, size, flash);
  } else {
    // 英雄按职业（baseClass）绘制外观
    const drawType = cfg.hero ? (cfg.baseClass || type) : type;
    drawCharacter(ctx, x, y, size, drawType, flash);
    // 英雄头顶星级标记（⭐）— 位于头部上方，醒目
    if (cfg.hero) {
      const stars = cfg.stars || 1;
      const sy = y - size * 0.88;
      const r = size * 0.22;
      const gap = r * 2.3;
      const totalW = (stars - 1) * gap;
      ctx.save();
      ctx.shadowColor = '#fde047';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#facc15';
      ctx.strokeStyle = '#854d0e';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < stars; i++) {
        const sx = x - totalW / 2 + i * gap;
        drawStar(ctx, sx, sy, r, r * 0.42, 5);
        ctx.fill(); ctx.stroke();
      }
      ctx.restore();
    }
  }
}

// 绘制五角星
function drawStar(ctx, cx, cy, outerR, innerR, points) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const a = (Math.PI / points) * i - Math.PI / 2;
    const px = cx + Math.cos(a) * r;
    const py = cy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

// ============== 单位配置 ==============
// 建筑：isBuilding=true（不可移动）；角色：isBuilding=false（可移动）
const UNIT_TYPES = {
  fence:    { name:'栅栏',   icon:'🧱', cost:25,  hp:300, atk:0,  range:0, fireRate:0, isBuilding:true,  canAttack:false, color:'#8b7355', desc:'木质防御工事，无法攻击，但生命值高，可阻挡怪物前进。' },
  mine:     { name:'地雷',   icon:'💣', cost:60,  hp:50,  atk:150, range:1, fireRate:0, isBuilding:true, canAttack:false, color:'#1f2937', mine:true, desc:'一次性陷阱建筑，摆放后前3秒为埋设期（不生效），3秒后埋入地下生效。怪物踩到后爆炸，对3*3范围内所有怪物造成150点伤害，爆炸后消失。' },
  outpost:  { name:'前哨站', icon:'🗼', cost:100, hp:300, atk:20, range:3, fireRate:0.5, isBuilding:true, canAttack:true, color:'#6b7280', desc:'特殊防御塔，可建造在地图任意位置，攻击3格范围内的敌人，并为周围2格提供建造区域。' },
  hospital: { name:'医院',   icon:'🏥', cost:250, hp:300, atk:0,  range:2, fireRate:1, heal:10, isBuilding:true, canAttack:false, color:'#22c55e', desc:'医疗建筑，每秒治疗周围2格范围内2个血量最低的友方角色10点生命值，并保护2格范围内的角色免受毒气伤害，周围3格内可放置单位。' },
  freeze:   { name:'冰冻塔', icon:'❄️', cost:250, hp:300, atk:15, range:5, fireRate:0.25, isBuilding:true, canAttack:true, color:'#38bdf8', aoe:true, aoeStraight:true, freeze:{slowFactor:0.5,duration:6}, desc:'冰冻防御塔，发射直线冰弹，命中后爆炸（目标格及上下左右共5格），对范围内所有怪物造成伤害并减速50%，持续6秒。' },
  flame:    { name:'火焰塔', icon:'🔥', cost:210, hp:300, atk:90, range:2, fireRate:0, isBuilding:true, canAttack:true, color:'#f97316', flame:true, desc:'火焰防御塔，自动旋转朝向敌人最多的方向，持续喷射火焰，对2格内直线上所有敌人造成90/秒持续伤害，伤害高但射程短。' },
  lightning:{ name:'闪电塔', icon:'⚡', cost:250, hp:300, atk:60, range:5, fireRate:0.5, isBuilding:true, canAttack:true, color:'#a855f7', chain:{jumps:5, range:1, falloff:[1,0.8,0.6,0.4,0.2]}, desc:'闪电防御塔，发射闪电链攻击目标，并在1格内相邻怪物间传导，最多传导5次，伤害依次衰减为100%/80%/60%/40%/20%。' },
  pistol:   { name:'手枪手', icon:'🔫', cost:40,  hp:100, atk:15, range:4,  fireRate:1.0, isBuilding:false, canAttack:true, color:'#3b82f6', desc:'基础远程单位，性价比高，适合前期防守。' },
  assault:  { name:'突击手', icon:'💥', cost:80,  hp:120, atk:15, range:5,  fireRate:2.0, isBuilding:false, canAttack:true, color:'#f97316', desc:'高射速突击单位，持续输出能力强，生命较厚。' },
  rifle:    { name:'步枪手', icon:'🎖️', cost:120, hp:150, atk:30, range:6,  fireRate:1.2, isBuilding:false, canAttack:true, color:'#10b981', desc:'中远程精准射手，单发伤害高，射程远。' },
  mg:       { name:'机枪手', icon:'🔥', cost:180, hp:150, atk:35, range:6,  fireRate:1.6, isBuilding:false, canAttack:true, color:'#a855f7', desc:'重火力单位，高伤害与高射速兼备，压制力强。' },
  sniper:   { name:'狙击手', icon:'🎯', cost:240, hp:100, atk:120,range:10, fireRate:0.3, isBuilding:false, canAttack:true, color:'#ef4444', desc:'超远程高伤单位，可覆盖全图，但射速极慢。' },
  grenadier:{ name:'掷弹兵', icon:'💣', cost:250, hp:150, atk:100,range:3, fireRate:0.15, isBuilding:false, canAttack:true, aoe:true, color:'#f97316', desc:'强力爆破兵种，投掷榴弹对目标格及上下左右格造成范围伤害，射速慢但威力巨大。' },
  shotgun:  { name:'霰弹枪手', icon:'💢', cost:180, hp:150, atk:35,range:4, fireRate:0.4, isBuilding:false, canAttack:true, spread:true, color:'#f59e0b', desc:'近距离高伤兵种，每次射击发射5颗扇形弹丸，每颗35点伤害，越近命中越多伤害越高，远距离弹丸分散伤害降低。' },
  crossbow: { name:'神射手', icon:'🏹', cost:150, hp:120, atk:45, range:4, fireRate:0.6, isBuilding:false, canAttack:true, pierce:true, color:'#14b8a6', desc:'远程穿透兵种，锁定射程内最近的敌人并射出穿透箭矢，箭矢沿直线飞行贯穿路径上的所有敌人，射程4格。' },
  medic:    { name:'军医',   icon:'🩹', cost:130, hp:160, atk:15, range:4, fireRate:1.0, isBuilding:false, canAttack:true, heal:10, color:'#06b6d4', desc:'战场医疗兵种，既能射击敌人，又能治疗自己和周围一格（上下左右）的友方角色，攻速1次/秒，每次治疗10点生命值。' },
  pharmacist:{ name:'制药师', icon:'💊', cost:50,  hp:80,  atk:10, range:1, fireRate:1.0, isBuilding:false, canAttack:true, heal:5, plagueImmune:true, cure:true, color:'#a855f7', desc:'制药支援兵种，自身免疫血疫。攻速1次/秒，每次治疗身边1格（曼哈顿距离）内血量最低的1个友方角色5点生命值，并清除其身上的中毒与血疫状态，同时可攻击敌人。' },
  axe:      { name:'刀斧手', icon:'🪓', cost:100, hp:250, atk:50, range:1, fireRate:0.8, isBuilding:false, canAttack:true, fan:true, color:'#b45309', desc:'近战扇形攻击兵种，生命值较高，每次挥砍自动选择周围8格中敌人最多的连续3格造成伤害，攻速0.8次/秒。' },
  engineer: { name:'工程师', icon:'🔧', cost:100, hp:120, atk:10, range:1, fireRate:0.8, isBuilding:false, canAttack:true, repair:10, color:'#65a30d', desc:'战场支援兵种，既能近战攻击，又能持续修复周围一圈（3*3）内血量最低的建筑物，修复速度10点/秒。' },
  firemage: { name:'火法师', icon:'🔥', cost:230, hp:100, atk:50, range:5, fireRate:0.25, isBuilding:false, canAttack:true, burn:{groundDur:5, debuffDur:3, dps:25}, color:'#f97316', desc:'远程法系兵种，锁定5格内最近敌人并点燃其所在格子，燃烧地面持续5秒，经过的敌人或放置的单位会进入燃烧状态（3秒内每秒掉25血）。' },
  icemage:  { name:'冰法师', icon:'❄️', cost:240, hp:100, atk:20, range:4, fireRate:0.35, isBuilding:false, canAttack:true, pierce:true, freeze:{slowFactor:0.5, duration:3}, color:'#38bdf8', desc:'远程法系兵种，射出冰锥沿直线穿透4格内所有敌人，造成伤害并使其减速50%，持续3秒。攻速慢但控场能力强。' },
  macarthur:{ name:'麦克阿瑟', icon:'🎖️', cost:350, hp:150, atk:150, range:4, fireRate:0.15, isBuilding:false, canAttack:true, aoe:true, color:'#dc2626', hero:true, baseClass:'grenadier', desc:'英雄·掷弹兵，每场战斗只能部署一个。可放置在地图任意位置，投掷高爆榴弹对目标格及上下左右格造成巨额范围伤害。英雄被动：每秒恢复5生命值。' },
  yanshuangying:{ name:'燕双鹰', icon:'🔫', cost:200, hp:160, atk:25, range:4, fireRate:2.0, isBuilding:false, canAttack:true, color:'#facc15', hero:true, baseClass:'pistol', desc:'英雄·手枪兵，每场战斗只能部署一个。可放置在地图任意位置，以极快射速持续射击，生命比普通手枪手更厚。英雄被动：每秒恢复5生命值。' },
  huasheng: { name:'华生',   icon:'🩹', cost:190, hp:200, atk:20, range:4, fireRate:0.7, isBuilding:false, canAttack:true, heal:14, color:'#14b8a6', hero:true, baseClass:'medic', desc:'英雄·军医，每场战斗只能部署一个。可放置在地图任意位置，既能射击敌人，又能治疗自己和周围一格（上下左右）的友方角色，治疗量约10/秒。英雄被动：每秒恢复5生命值。' },
  terminator:{ name:'终结者', icon:'🤖', cost:360, hp:350, atk:50, range:5, fireRate:0.5, isBuilding:false, canAttack:true, spread:true, color:'#ef4444', hero:true, stars:2, baseClass:'shotgun', desc:'二星英雄·霰弹枪手，每场战斗只能部署一个。可放置在地图任意位置，手持重型霰弹枪，每次射击发射5颗扇形弹丸，每颗50点伤害，射程5格，生命值极高，是近战区域的终结者。英雄被动：每秒恢复7.5生命值。' }
};

// ============== 怪物配置 ==============
const MONSTER_TYPES = {
  normal: { name:'普通丧尸', icon:'👹', category:'zombie', hp:100, atk:50,  speed:1.0, gold:15, color:'#ef4444', size:16, desc:'最常见的敌人，各项属性均衡，会直线向基地推进。' },
  fast:   { name:'丧尸犬', icon:'🐺', category:'zombie', hp:50,  atk:35,  speed:2.2, gold:25, color:'#f59e0b', size:14, poison:{dps:8, duration:10}, desc:'四足丧尸犬，移动速度极快，生命值较低但能迅速突破防线，攻击会使角色/英雄陷入10秒中毒（每秒8点伤害）。' },
  rat:    { name:'丧尸鼠', icon:'🐀', category:'zombie', hp:15,  atk:10,  speed:3.0, gold:5,  color:'#a3a3a3', size:10, poison:{dps:8, duration:10}, desc:'小型丧尸鼠，生命值极低但移动速度极快，攻击会使角色/英雄陷入10秒中毒（每秒8点伤害）。' },
  tank:   { name:'肥胖丧尸', icon:'🛡️', category:'zombie', hp:300, atk:50, speed:0.5, gold:50, color:'#6366f1', size:22, deathFx:'#6366f1', desc:'重甲怪物，生命值和攻击力都很高，但移动缓慢。' },
  bat:    { name:'蝙蝠怪', icon:'🦇', category:'monster', hp:50, atk:40, speed:2.0, gold:25, color:'#a78bfa', size:15, flying:true, desc:'初级飞行怪物，生命值不高但速度快，无视地面建筑和角色阻挡，直接飞向基地攻击。' },
  acid:   { name:'吐酸丧尸', icon:'🧟', category:'zombie', hp:80, atk:45, speed:0.8, gold:25, color:'#84cc16', size:17, ranged:true, rangedRange:3, fireRate:0.5, desc:'远程攻击怪物，能从3格外喷射酸液攻击玩家单位，生命值不高但威胁大，需优先击杀。' },
  boss:   { name:'丧尸王', icon:'👑', category:'zombie', hp:1400,atk:100, speed:0.4, gold:200,color:'#dc2626', size:28, deathFx:'boss', desc:'最终首领，拥有惊人的生命值和攻击力，需要全力应对。' },
  gas:    { name:'毒气丧尸', icon:'☠️', category:'zombie', hp:120, atk:40, speed:0.6, gold:30, color:'#65a30d', size:17, desc:'死亡时释放毒气，在自身及周围一格（共5格）产生持续5秒的毒气，对处于毒气中的角色和非丧尸类怪物造成每秒25点伤害，对建筑和丧尸无效。' },
  mother: { name:'母体丧尸', icon:'🤰', category:'zombie', hp:300, atk:20, speed:0.5, gold:45, color:'#be185d', size:24, deathFx:'#be185d', spawn:{type:'normal', count:2, interval:5, range:1}, desc:'巨型孕育母体，生命值高但攻击力低、移动缓慢。每隔5秒在自身周围1格内随机位置召唤2只普通丧尸，需尽快击杀阻止其增殖。' },
  warcry: { name:'战吼丧尸', icon:'📢', category:'zombie', hp:600, atk:50, speed:0.4, gold:100, color:'#7c3aed', size:26, deathFx:'#7c3aed', warcry:{interval:2, range:2, damage:50, stunDur:3}, desc:'精英丧尸，生命值极高，移动缓慢。每2秒发动一次战吼，对自身周围2格（曼哈顿距离）内的所有玩家角色/英雄造成50点伤害并使其眩晕3秒（眩晕期间无法攻击），对建筑物无影响。' },
  ratnest:{ name:'鼠穴',   icon:'🕳️', category:'zombie', hp:250, atk:0,  speed:0,   gold:50, color:'#78350f', size:24, deathFx:'#78350f', stationary:true, spawn:{type:'rat', count:2, interval:5, range:1}, desc:'敌方巢穴建筑，无法移动与攻击。生命值250，每隔5秒在自身周围1格内召唤2只丧尸鼠。在后期关卡会随机出现在地图边缘，需优先摧毁以阻止丧尸鼠持续涌出。' },
  redeye: { name:'红眼丧尸', icon:'👁️', category:'zombie', hp:100, atk:50, speed:1.0, gold:30, color:'#7f1d1d', size:16, plague:true, desc:'感染血疫的丧尸，属性与普通丧尸一致。攻击角色/英雄时会使其陷入血疫状态（每秒损失7生命值，永久持续，仅制药师可清除），血疫每10秒会传染给周围1格的友方角色。' },
  // ===== 劫掠者：以最近玩家单位为目标，而非基地 =====
  bully:       { name:'恶霸',       icon:'💪', category:'raider', hp:150, atk:40, speed:1.0, gold:35, color:'#b45309', size:18, rangedRange:1, fireRate:1.0, desc:'劫掠者近战单位，生命值较高，会主动寻找并攻击最近的玩家角色/建筑，而非冲向基地。' },
  raider_gunner:{ name:'劫掠枪手',  icon:'🔫', category:'raider', hp:150, atk:20, speed:1.0, gold:35, color:'#0891b2', size:17, ranged:true, rangedRange:4, fireRate:0.8, desc:'劫掠者远程单位，手持枪械，从4格开外射击最近的玩家角色/建筑。' },
  armed_raider:{ name:'武装劫掠者', icon:'🎖️', category:'raider', hp:200, atk:25, speed:1.0, gold:55, color:'#7c2d12', size:19, ranged:true, rangedRange:5, fireRate:0.7, desc:'劫掠者精英远程单位，装备精良，射程更远（5格），伤害与生命均高于劫掠枪手。' },
  thug:        { name:'暴徒',       icon:'🔥', category:'raider', hp:150, atk:20, speed:1.0, gold:40, color:'#dc2626', size:18, ranged:true, rangedRange:2, fireRate:1.0, aoe:true, burn:{groundDur:5, debuffDur:3, dps:20}, desc:'劫掠者纵火单位，投掷燃烧弹攻击目标格及上下左右共5格，使地面持续燃烧5秒，经过的单位受到灼烧伤害。' }
};

// ============== 波次配置 ==============
// 关卡配置：3个关卡，难度递增
const LEVELS = [
  {
    id: 1, name: '基地防御1', desc: '基础难度 · 适合新手',
    waves: [
      [{ type:'normal', count:6, interval:1.2, delay:0 }],
      [{ type:'normal', count:8, interval:1.0, delay:0 },{ type:'fast', count:4, interval:0.6, delay:4 },{ type:'rat', count:6, interval:0.4, delay:2 }],
      [{ type:'normal', count:8, interval:0.9, delay:0 },{ type:'fast', count:6, interval:0.5, delay:3 },{ type:'tank', count:2, interval:2.0, delay:6 },{ type:'gas', count:2, interval:1.5, delay:4 },{ type:'mother', count:1, interval:0, delay:8 }],
      [{ type:'normal', count:6, interval:0.8, delay:0 },{ type:'fast', count:8, interval:0.45, delay:3 },{ type:'tank', count:2, interval:2.0, delay:5 },{ type:'bat', count:4, interval:0.8, delay:6 },{ type:'gas', count:3, interval:1.3, delay:5 },{ type:'mother', count:2, interval:4, delay:4 },{ type:'warcry', count:1, interval:0, delay:8 }],
      [{ type:'boss', count:1, interval:0, delay:0 },{ type:'tank', count:3, interval:1.8, delay:3 },{ type:'fast', count:10, interval:0.4, delay:5 },{ type:'normal', count:8, interval:0.5, delay:7 },{ type:'bat', count:6, interval:0.7, delay:6 },{ type:'acid', count:3, interval:1.5, delay:8 },{ type:'gas', count:3, interval:1.4, delay:9 },{ type:'mother', count:2, interval:5, delay:6 },{ type:'warcry', count:2, interval:6, delay:5 }]
    ],
    hpMul: 1.0, atkMul: 1.0, speedMul: 1.0, startGoldMul: 1.0, honorMul: 1.0
  },
  {
    id: 2, name: '基地防御2', desc: '中等难度 · 怪物更多',
    waves: [
      [{ type:'normal', count:8, interval:1.1, delay:0 },{ type:'fast', count:4, interval:0.6, delay:3 },{ type:'bat', count:4, interval:0.8, delay:5 }],
      [{ type:'normal', count:10, interval:0.9, delay:0 },{ type:'fast', count:8, interval:0.5, delay:3 },{ type:'tank', count:3, interval:1.8, delay:6 },{ type:'acid', count:3, interval:1.5, delay:5 },{ type:'gas', count:2, interval:1.4, delay:7 },{ type:'mother', count:2, interval:4, delay:5 }],
      [{ type:'normal', count:12, interval:0.8, delay:0 },{ type:'fast', count:10, interval:0.45, delay:3 },{ type:'tank', count:4, interval:1.6, delay:5 },{ type:'bat', count:6, interval:0.7, delay:6 },{ type:'acid', count:4, interval:1.3, delay:5 },{ type:'mother', count:2, interval:4, delay:6 },{ type:'warcry', count:1, interval:0, delay:7 },{ type:'redeye', count:2, interval:1.0, delay:4 },{ type:'bully', count:3, interval:1.5, delay:5 },{ type:'raider_gunner', count:2, interval:1.2, delay:6 },{ type:'thug', count:2, interval:1.5, delay:6 }],
      [{ type:'tank', count:6, interval:1.5, delay:0 },{ type:'fast', count:14, interval:0.4, delay:3 },{ type:'bat', count:8, interval:0.6, delay:4 },{ type:'acid', count:6, interval:1.1, delay:4 },{ type:'normal', count:10, interval:0.6, delay:6 },{ type:'gas', count:4, interval:1.2, delay:5 },{ type:'mother', count:3, interval:4, delay:5 },{ type:'warcry', count:2, interval:5, delay:6 },{ type:'redeye', count:3, interval:0.9, delay:4 },{ type:'bully', count:4, interval:1.3, delay:5 },{ type:'raider_gunner', count:3, interval:1.0, delay:6 },{ type:'armed_raider', count:1, interval:0, delay:8 },{ type:'thug', count:2, interval:1.3, delay:7 }],
      [{ type:'boss', count:1, interval:0, delay:0 },{ type:'tank', count:5, interval:1.5, delay:3 },{ type:'bat', count:10, interval:0.5, delay:4 },{ type:'acid', count:7, interval:1.0, delay:5 },{ type:'fast', count:16, interval:0.35, delay:5 },{ type:'normal', count:12, interval:0.5, delay:7 },{ type:'gas', count:5, interval:1.1, delay:6 },{ type:'mother', count:3, interval:4, delay:5 },{ type:'warcry', count:2, interval:5, delay:5 },{ type:'ratnest', count:1, interval:0, delay:0 },{ type:'redeye', count:3, interval:0.9, delay:4 },{ type:'bully', count:4, interval:1.2, delay:6 },{ type:'raider_gunner', count:4, interval:0.9, delay:7 },{ type:'armed_raider', count:2, interval:3, delay:8 },{ type:'thug', count:3, interval:1.2, delay:7 }]
    ],
    hpMul: 1.0, atkMul: 1.0, speedMul: 1.0, startGoldMul: 1.0, honorMul: 1.2
  },
  {
    id: 3, name: '基地防御3', desc: '高难度 · 海量怪物',
    waves: [
      [{ type:'normal', count:10, interval:1.0, delay:0 },{ type:'fast', count:6, interval:0.5, delay:3 },{ type:'bat', count:6, interval:0.7, delay:4 },{ type:'acid', count:4, interval:1.4, delay:5 },{ type:'gas', count:3, interval:1.3, delay:6 }],
      [{ type:'normal', count:14, interval:0.9, delay:0 },{ type:'fast', count:10, interval:0.45, delay:3 },{ type:'tank', count:2, interval:2.0, delay:6 },{ type:'bat', count:8, interval:0.6, delay:5 },{ type:'acid', count:6, interval:1.2, delay:5 },{ type:'mother', count:3, interval:3.5, delay:5 },{ type:'warcry', count:1, interval:0, delay:6 },{ type:'redeye', count:3, interval:0.9, delay:4 },{ type:'bully', count:3, interval:1.3, delay:5 },{ type:'raider_gunner', count:2, interval:1.1, delay:6 },{ type:'thug', count:2, interval:1.4, delay:6 }],
      [{ type:'normal', count:16, interval:0.8, delay:0 },{ type:'fast', count:14, interval:0.4, delay:3 },{ type:'tank', count:5, interval:1.5, delay:5 },{ type:'bat', count:10, interval:0.5, delay:6 },{ type:'acid', count:8, interval:1.0, delay:5 },{ type:'gas', count:5, interval:1.0, delay:6 },{ type:'mother', count:3, interval:3.5, delay:5 },{ type:'warcry', count:2, interval:4, delay:5 },{ type:'ratnest', count:1, interval:0, delay:0 },{ type:'redeye', count:4, interval:0.8, delay:4 },{ type:'bully', count:4, interval:1.2, delay:5 },{ type:'raider_gunner', count:3, interval:1.0, delay:6 },{ type:'armed_raider', count:1, interval:0, delay:8 },{ type:'thug', count:3, interval:1.3, delay:6 }],
      [{ type:'tank', count:8, interval:1.4, delay:0 },{ type:'fast', count:20, interval:0.38, delay:3 },{ type:'bat', count:14, interval:0.45, delay:4 },{ type:'acid', count:10, interval:0.9, delay:4 },{ type:'normal', count:14, interval:0.55, delay:6 },{ type:'gas', count:6, interval:0.9, delay:5 },{ type:'mother', count:4, interval:3, delay:4 },{ type:'warcry', count:3, interval:4, delay:5 },{ type:'ratnest', count:1, interval:0, delay:0 },{ type:'redeye', count:5, interval:0.8, delay:4 },{ type:'bully', count:5, interval:1.1, delay:5 },{ type:'raider_gunner', count:4, interval:0.9, delay:6 },{ type:'armed_raider', count:2, interval:3, delay:7 },{ type:'thug', count:3, interval:1.2, delay:7 }],
      [{ type:'boss', count:1, interval:0, delay:0 },{ type:'tank', count:7, interval:1.4, delay:3 },{ type:'bat', count:16, interval:0.4, delay:4 },{ type:'acid', count:12, interval:0.8, delay:4 },{ type:'fast', count:22, interval:0.33, delay:5 },{ type:'normal', count:16, interval:0.5, delay:7 },{ type:'gas', count:8, interval:0.8, delay:6 },{ type:'mother', count:4, interval:3, delay:5 },{ type:'warcry', count:3, interval:4, delay:5 },{ type:'ratnest', count:1, interval:0, delay:0 },{ type:'redeye', count:5, interval:0.8, delay:4 },{ type:'bully', count:5, interval:1.0, delay:6 },{ type:'raider_gunner', count:5, interval:0.8, delay:7 },{ type:'armed_raider', count:3, interval:2.5, delay:8 },{ type:'thug', count:4, interval:1.1, delay:7 }]
    ],
    hpMul: 1.0, atkMul: 1.0, speedMul: 1.0, startGoldMul: 1.0, honorMul: 1.4
  }
];

// ============== 永久升级配置 ==============
// 全局升级（仅经济天赋）
const UPGRADES = [
  { id:'startGold', name:'经济天赋', icon:'💰', desc:'初始金币 +30', max:10, baseCost:5, costMul:1.3 }
];

// 角色通用升级字段（HP+40/级, ATK+5/级, 攻速+0.1/级）
const CHAR_UPGRADE_FIELDS = [
  { key:'hp',   name:'生命值',   icon:'❤️', desc:'生命值 +40/级', add:40,  baseCost:8,  costMul:1.3, max:10 },
  { key:'atk',  name:'攻击力',   icon:'⚔️', desc:'攻击力 +5/级',  add:5,   baseCost:10, costMul:1.3, max:10 },
  { key:'rate', name:'攻击速度', icon:'⚡', desc:'攻速 +0.1/级',  add:0.1, baseCost:10, costMul:1.3, max:10 }
];

// 狙击手：攻击+10/级，攻速+0.05/级（高攻慢射速，避免攻速收益过高）
const SNIPER_UPGRADE_FIELDS = [
  { key:'hp',   name:'生命值',   icon:'❤️', desc:'生命值 +40/级',  add:40,   baseCost:8,  costMul:1.3, max:10 },
  { key:'atk',  name:'攻击力',   icon:'⚔️', desc:'攻击力 +10/级',  add:10,   baseCost:10, costMul:1.3, max:10 },
  { key:'rate', name:'攻击速度', icon:'⚡', desc:'攻速 +0.05/级', add:0.05, baseCost:10, costMul:1.3, max:10 }
];

// 掷弹兵：攻击+10/级，攻速+0.03/级（极慢射速，攻速升级需更克制）
const GRENADIER_UPGRADE_FIELDS = [
  { key:'hp',   name:'生命值',   icon:'❤️', desc:'生命值 +40/级',  add:40,   baseCost:8,  costMul:1.3, max:10 },
  { key:'atk',  name:'攻击力',   icon:'⚔️', desc:'攻击力 +10/级',  add:10,   baseCost:10, costMul:1.3, max:10 },
  { key:'rate', name:'攻击速度', icon:'⚡', desc:'攻速 +0.03/级', add:0.03, baseCost:10, costMul:1.3, max:10 }
];

// 霰弹枪手：攻击+6/级，攻速+0.04/级（5发扇形，atk增量需克制避免被弹丸数放大）
const SHOTGUN_UPGRADE_FIELDS = [
  { key:'hp',   name:'生命值',   icon:'❤️', desc:'生命值 +40/级',  add:40,   baseCost:8,  costMul:1.3, max:10 },
  { key:'atk',  name:'攻击力',   icon:'⚔️', desc:'攻击力 +6/级',   add:6,    baseCost:10, costMul:1.3, max:10 },
  { key:'rate', name:'攻击速度', icon:'⚡', desc:'攻速 +0.04/级', add:0.04, baseCost:10, costMul:1.3, max:10 }
];

// 刀斧手：生命+50/级，攻击+8/级，攻速+0.05/级（近战高血，攻速慢）
const AXE_UPGRADE_FIELDS = [
  { key:'hp',   name:'生命值',   icon:'❤️', desc:'生命值 +50/级',  add:50,   baseCost:8,  costMul:1.3, max:10 },
  { key:'atk',  name:'攻击力',   icon:'⚔️', desc:'攻击力 +8/级',   add:8,    baseCost:10, costMul:1.3, max:10 },
  { key:'rate', name:'攻击速度', icon:'⚡', desc:'攻速 +0.05/级', add:0.05, baseCost:10, costMul:1.3, max:10 }
];

// 每个单位可升级的属性
const UNIT_UPGRADE_FIELDS = {
  fence:    [{ key:'hp', name:'生命值', icon:'❤️', desc:'生命值 +40/级', add:40, baseCost:8, costMul:1.3, max:10 }],
  outpost:  CHAR_UPGRADE_FIELDS,
  hospital: [{ key:'hp', name:'生命值', icon:'❤️', desc:'生命值 +40/级', add:40, baseCost:8, costMul:1.3, max:10 },
             { key:'rate', name:'治疗速度', icon:'⚡', desc:'攻速 +0.1/级', add:0.1, baseCost:10, costMul:1.3, max:10 }],
  freeze:   [{ key:'hp', name:'生命值', icon:'❤️', desc:'生命值 +40/级', add:40, baseCost:8, costMul:1.3, max:10 },
             { key:'atk', name:'冰冻伤害', icon:'❄️', desc:'攻击力 +5/级', add:5, baseCost:10, costMul:1.3, max:10 },
             { key:'rate', name:'冰冻频率', icon:'⚡', desc:'攻速 +0.05/级', add:0.05, baseCost:10, costMul:1.3, max:10 }],
  flame:    [{ key:'hp', name:'生命值', icon:'❤️', desc:'生命值 +40/级', add:40, baseCost:8, costMul:1.3, max:10 },
             { key:'atk', name:'灼烧强度', icon:'🔥', desc:'攻击力 +12/级', add:12, baseCost:10, costMul:1.3, max:10 },
             { key:'rate', name:'灼烧频率', icon:'⚡', desc:'灼烧倍率 +0.1/级', add:0.1, baseCost:10, costMul:1.3, max:10 }],
  lightning:[{ key:'hp', name:'生命值', icon:'❤️', desc:'生命值 +40/级', add:40, baseCost:8, costMul:1.3, max:10 },
             { key:'atk', name:'闪电伤害', icon:'⚡', desc:'攻击力 +8/级', add:8, baseCost:10, costMul:1.3, max:10 },
             { key:'rate', name:'闪电频率', icon:'⚡', desc:'攻速 +0.05/级', add:0.05, baseCost:10, costMul:1.3, max:10 }],
  pistol:   CHAR_UPGRADE_FIELDS,
  assault:  CHAR_UPGRADE_FIELDS,
  rifle:    CHAR_UPGRADE_FIELDS,
  mg:       CHAR_UPGRADE_FIELDS,
  sniper:   SNIPER_UPGRADE_FIELDS,
  grenadier:GRENADIER_UPGRADE_FIELDS,
  shotgun:  SHOTGUN_UPGRADE_FIELDS,
  crossbow: CHAR_UPGRADE_FIELDS,
  medic:    CHAR_UPGRADE_FIELDS,
  pharmacist: CHAR_UPGRADE_FIELDS,
  axe:      AXE_UPGRADE_FIELDS,
  engineer: CHAR_UPGRADE_FIELDS,
  firemage: CHAR_UPGRADE_FIELDS,
  icemage:  CHAR_UPGRADE_FIELDS,
  // 英雄升级字段：每级提升高于普通角色
  macarthur: [
    { key:'hp',   name:'生命值',   icon:'❤️', desc:'生命值 +60/级',  add:60,  baseCost:12, costMul:1.4, max:10 },
    { key:'atk',  name:'攻击力',   icon:'⚔️', desc:'攻击力 +12/级', add:12,  baseCost:15, costMul:1.4, max:10 },
    { key:'rate', name:'攻击速度', icon:'⚡', desc:'攻速 +0.04/级', add:0.04, baseCost:15, costMul:1.4, max:10 }
  ],
  yanshuangying: [
    { key:'hp',   name:'生命值',   icon:'❤️', desc:'生命值 +60/级',  add:60,  baseCost:12, costMul:1.4, max:10 },
    { key:'atk',  name:'攻击力',   icon:'⚔️', desc:'攻击力 +6/级',  add:6,   baseCost:12, costMul:1.4, max:10 },
    { key:'rate', name:'攻击速度', icon:'⚡', desc:'攻速 +0.2/级',  add:0.2, baseCost:12, costMul:1.4, max:10 }
  ],
  // 华生（军医英雄）：攻速升级同时提升治疗量
  huasheng: [
    { key:'hp',   name:'生命值',   icon:'❤️', desc:'生命值 +60/级',  add:60,  baseCost:12, costMul:1.4, max:10 },
    { key:'atk',  name:'攻击力',   icon:'⚔️', desc:'攻击力 +5/级',  add:5,   baseCost:12, costMul:1.4, max:10 },
    { key:'rate', name:'攻速/治疗', icon:'⚡', desc:'攻速 +0.1/级（同步提升治疗量）', add:0.1, baseCost:12, costMul:1.4, max:10 }
  ],
  // 终结者（霰弹枪手英雄）
  terminator: [
    { key:'hp',   name:'生命值',   icon:'❤️', desc:'生命值 +70/级',  add:70,  baseCost:14, costMul:1.4, max:10 },
    { key:'atk',  name:'攻击力',   icon:'⚔️', desc:'攻击力 +5/级',  add:5,   baseCost:14, costMul:1.4, max:10 },
    { key:'rate', name:'攻击速度', icon:'⚡', desc:'攻速 +0.05/级', add:0.05, baseCost:14, costMul:1.4, max:10 }
  ]
};

function upgradeCost(upg, lvl) {
  return Math.floor(upg.baseCost * Math.pow(upg.costMul, lvl));
}

// 生成单位升级项的唯一ID
function unitUpgradeId(type, key) { return 'unit_' + type + '_' + key; }

// ============== 战斗内升级系统 ==============
// 每单位最多 3 级：Lv1(基础) → Lv2(+主属性) → Lv3(选择分支专精)
// 升级花费 = 部署花费 × 系数（英雄更贵）
function getBattleUpgradeCost(cfg) {
  const heroMul = cfg.hero ? 1.3 : 1;
  return {
    toLv2: Math.round(cfg.cost * 0.5 * heroMul),
    toLv3: Math.round(cfg.cost * 0.8 * heroMul)
  };
}

// 按单位类型定义升级档案：主属性 + 两个分支专精
const BATTLE_UPGRADE_PROFILES = {
  // 攻击型角色 / 防御塔：主属性 atk
  _attack: {
    primaryStat: 'atk', primaryPct: 0.25,
    branches: [
      { id: 'offense', name: '猛攻', stat: 'atk', pct: 0.35, desc: '攻击力+35%' },
      { id: 'haste', name: '急速', stat: 'rate', pct: 0.30, desc: '攻速+30%' }
    ]
  },
  // 英雄：主属性 atk + 副属性 hp
  _hero: {
    primaryStat: 'atk', primaryPct: 0.20, secondaryStat: 'hp', secondaryPct: 0.15,
    branches: [
      { id: 'warrior', name: '战神', desc: '攻击+35% · 生命+25%', multi: { atk: 0.35, hp: 0.25 } },
      { id: 'guardian', name: '守护', desc: '生命+45% · 攻速+20%', multi: { hp: 0.45, rate: 0.20 } }
    ]
  },
  // 治疗型（军医/制药师/医院）
  _heal: {
    primaryStat: 'heal', primaryPct: 0.30,
    branches: [
      { id: 'potent', name: '强效', stat: 'heal', pct: 0.60, desc: '治疗量+60%' },
      { id: 'reach', name: '扩散', stat: 'range', pct: 1, desc: '范围+1格' }
    ]
  },
  // 工程师
  _repair: {
    primaryStat: 'repair', primaryPct: 0.35,
    branches: [
      { id: 'master', name: '精通', stat: 'repair', pct: 0.70, desc: '修复量+70%' },
      { id: 'wide', name: '广域', stat: 'range', pct: 1, desc: '范围+1格' }
    ]
  },
  // 栅栏（纯防御）
  _fence: {
    primaryStat: 'hp', primaryPct: 0.35,
    branches: [
      { id: 'fortify', name: '加固', stat: 'hp', pct: 0.70, desc: '生命+70%' },
      { id: 'thorns', name: '尖刺', stat: 'thorns', pct: 0.25, desc: '反弹25%近战伤害' }
    ]
  }
};

// 根据单位类型获取升级档案
function getBattleUpgradeProfile(unit) {
  const cfg = unit.cfg;
  if (cfg.hero) return BATTLE_UPGRADE_PROFILES._hero;
  if (unit.type === 'fence') return BATTLE_UPGRADE_PROFILES._fence;
  if (cfg.repair) return BATTLE_UPGRADE_PROFILES._repair;
  if (cfg.heal) return BATTLE_UPGRADE_PROFILES._heal;
  if (cfg.canAttack) return BATTLE_UPGRADE_PROFILES._attack;
  return null; // 地雷等不可升级
}

// ============== 存档系统 ==============
const SAVE_KEY = 'towerdefense_save_v3';
const Save = {
  meta: {
    honor: 0, bestWaves: {}, upgrades: {}, unitUpgrades: {},
    unlockedLevel: 1
  },
  // 运行时计算属性（不持久化）
  goldBonus: 0, unitMul: {},
  game: null,
  load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (data.meta) {
        this.meta.honor = data.meta.honor || 0;
        this.meta.bestWaves = data.meta.bestWaves || {};
        this.meta.upgrades = data.meta.upgrades || {};
        this.meta.unitUpgrades = data.meta.unitUpgrades || {};
        this.meta.unlockedLevel = data.meta.unlockedLevel || 1;
      }
      this.game = data.game || null;
    } catch(e) { console.warn('存档读取失败', e); }
    this.applyUpgrades();
  },
  save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify({ meta:this.meta, game:this.game })); }
    catch(e) { console.warn('存档写入失败', e); }
  },
  applyUpgrades() {
    // 经济天赋
    const gl = this.meta.upgrades.startGold || 0;
    this.goldBonus = gl * 30;
    // 计算每个单位的属性加成（从各单位升级字段定义中读取每级增量）
    this.unitMul = {};
    for (const type in UNIT_TYPES) {
      const fields = UNIT_UPGRADE_FIELDS[type] || [];
      const up = this.meta.unitUpgrades[type] || {};
      const mul = { hpAdd: 0, atkAdd: 0, rateAdd: 0 };
      for (const f of fields) {
        const lvl = up[f.key] || 0;
        if (f.key === 'hp') mul.hpAdd = f.add * lvl;
        else if (f.key === 'atk') mul.atkAdd = f.add * lvl;
        else if (f.key === 'rate') mul.rateAdd = f.add * lvl;
      }
      this.unitMul[type] = mul;
    }
  },
  hasSave() { return !!this.game; },
  clearGame() { this.game = null; this.save(); }
};

function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }

// ============== 单位基类 ==============
class Unit {
  constructor(type, col, row) {
    const cfg = UNIT_TYPES[type];
    this.type = type;
    this.cfg = cfg;
    this.col = col;
    this.row = row;
    const mul = Save.unitMul[type] || { hpAdd:0, atkAdd:0, rateAdd:0 };
    this.maxHp = cfg.hp + mul.hpAdd;
    this.hp = this.maxHp;
    this.atk = cfg.atk + mul.atkAdd;
    this.range = cfg.range;
    this.fireRate = cfg.fireRate + mul.rateAdd;
    this.fireTimer = 0;
    this.heal = cfg.heal || 0;
    this.repair = cfg.repair || 0;
    // 记录永久升级后的基础属性（战斗内升级以此为基准做倍率）
    this.baseMaxHp = this.maxHp;
    this.baseAtk = this.atk;
    this.baseFireRate = this.fireRate;
    this.baseHeal = this.heal;
    this.baseRepair = this.repair;
    this.baseRange = this.range;
    // 战斗内升级
    this.battleLvl = 1;
    this.battleBranch = null;
    this.thorns = 0; // 尖刺反弹比例（栅栏分支）
    this.burnTimer = 0;
    this.burnDps = 0;
    this.poisonTimer = 0;
    this.poisonDps = 0;
    this.plagueActive = false;       // 血疫状态（永久，直到被制药师清除）
    this.plagueSpreadTimer = 0;      // 血疫传染倒计时（每10秒传染一次）
    this.stunTimer = 0;
    this.angle = 0;
    this.hitFlash = 0;
    this.alive = true;
    this.totalSpent = cfg.cost;
    this.sellValue = Math.floor(cfg.cost * 0.6);
    // 火焰塔：朝向方向（自动旋转）+ 火焰是否激活
    this.direction = 'down';
    this.flameActive = false;
    // 地雷：埋设延迟（3秒后生效）
    this.armTimer = cfg.mine ? 3 : 0;
    const c = cellCenter(col, row);
    this.x = c.x; this.y = c.y;
  }
  get isBuilding() { return this.cfg.isBuilding; }
  get canAttack() { return this.cfg.canAttack; }

  // 重新应用战斗内升级（根据 battleLvl 和 battleBranch 计算最终属性）
  applyBattleUpgrades() {
    const profile = getBattleUpgradeProfile(this);
    if (!profile) return;
    let atkMul = 1, hpMul = 1, rateMul = 1, healMul = 1, repairMul = 1, rangeAdd = 0;
    this.thorns = 0;

    const levels = this.battleLvl - 1; // Lv1 无加成，Lv2 +1级，Lv3 +2级
    if (levels > 0) {
      if (profile.primaryStat === 'atk') atkMul += profile.primaryPct * levels;
      else if (profile.primaryStat === 'hp') hpMul += profile.primaryPct * levels;
      else if (profile.primaryStat === 'heal') healMul += profile.primaryPct * levels;
      else if (profile.primaryStat === 'repair') repairMul += profile.primaryPct * levels;
      // 英雄副属性
      if (profile.secondaryStat === 'hp') hpMul += profile.secondaryPct * levels;
    }

    // Lv3 分支专精
    if (this.battleLvl >= 3 && this.battleBranch) {
      const branch = (profile.branches || []).find(b => b.id === this.battleBranch);
      if (branch) {
        if (branch.multi) {
          for (const [stat, pct] of Object.entries(branch.multi)) {
            if (stat === 'atk') atkMul += pct;
            else if (stat === 'hp') hpMul += pct;
            else if (stat === 'rate') rateMul += pct;
          }
        } else if (branch.stat === 'atk') atkMul += branch.pct;
        else if (branch.stat === 'hp') hpMul += branch.pct;
        else if (branch.stat === 'rate') rateMul += branch.pct;
        else if (branch.stat === 'heal') healMul += branch.pct;
        else if (branch.stat === 'repair') repairMul += branch.pct;
        else if (branch.stat === 'range') rangeAdd += branch.pct;
        else if (branch.stat === 'thorns') this.thorns = branch.pct;
      }
    }

    this.atk = this.baseAtk * atkMul;
    this.maxHp = Math.round(this.baseMaxHp * hpMul);
    this.fireRate = this.baseFireRate * rateMul;
    this.heal = this.baseHeal * healMul;
    this.repair = this.baseRepair * repairMul;
    this.range = this.baseRange + rangeAdd;
    if (this.hp > this.maxHp) this.hp = this.maxHp;
  }

  // 执行升级。branchId 仅在 Lv2→Lv3 时需要（选择分支）
  battleUpgrade(branchId) {
    const profile = getBattleUpgradeProfile(this);
    if (!profile) return false;
    if (this.battleLvl >= 3) return false;

    const cost = getBattleUpgradeCost(this.cfg);
    const need = this.battleLvl === 1 ? cost.toLv2 : cost.toLv3;
    if (Game.gold < need) { Game.showToast('金币不足！'); return false; }

    // Lv2→Lv3 需要选择分支
    if (this.battleLvl === 2) {
      if (!branchId) return false; // 需要用户选择，由 UI 触发
      this.battleBranch = branchId;
    }
    Game.gold -= need;
    this.totalSpent += need;
    this.sellValue = Math.floor(this.totalSpent * 0.6);
    this.battleLvl++;
    this.applyBattleUpgrades();
    // 升级时回满血量
    this.hp = this.maxHp;
    return true;
  }

  update(dt) {
    if (this.hitFlash > 0) this.hitFlash -= dt;
    // 地雷：埋设计时器，埋设完成时检查当前格子是否有怪物
    if (this.cfg.mine && this.armTimer > 0) {
      this.armTimer -= dt;
      if (this.armTimer <= 0) {
        // 埋设完成，若当前格子有怪物则立即爆炸
        const m = Game.monsters.find(mo => mo.alive && mo.col === this.col && mo.row === this.row);
        if (m) this.explode();
      }
    }
    // 英雄自我恢复：一星5/秒，二星7.5/秒
    if (this.cfg.hero && this.hp < this.maxHp) {
      const stars = this.cfg.stars || 1;
      const regenRate = stars >= 2 ? 7.5 : 5;
      this.hp = Math.min(this.maxHp, this.hp + regenRate * dt);
    }
    // 眩晕：无法攻击/治疗/修复，但仍承受燃烧伤害
    if (this.stunTimer > 0) {
      this.stunTimer -= dt;
      // 燃烧伤害（眩晕中仍会被燃烧）
      if (this.burnTimer > 0) {
        this.burnTimer -= dt;
        this.takeDamage(this.burnDps * dt);
      }
      return;
    }
    // 燃烧伤害（所有单位都可能被燃烧）
    if (this.burnTimer > 0) {
      this.burnTimer -= dt;
      this.takeDamage(this.burnDps * dt);
      if (!this.alive) return;
    }
    // 中毒伤害（角色/英雄被丧尸犬/丧尸鼠攻击后）
    if (this.poisonTimer > 0) {
      this.poisonTimer -= dt;
      this.takeDamage(this.poisonDps * dt);
      if (!this.alive) return;
    }
    // 血疫伤害（每秒7点，永久持续，仅制药师可清除）+ 每10秒传染周围1格友方
    if (this.plagueActive) {
      this.takeDamage(7 * dt);
      if (!this.alive) return;
      this.plagueSpreadTimer -= dt;
      if (this.plagueSpreadTimer <= 0) {
        this.plagueSpreadTimer = 10;
        for (const u of Game.units) {
          if (u === this || !u.alive || u.isBuilding) continue;
          if (u.cfg.plagueImmune || u.plagueActive) continue;
          const dc = Math.abs(u.col - this.col);
          const dr = Math.abs(u.row - this.row);
          if (dc + dr <= 1) {
            if (!Game.isProtectedFromPlague(u.col, u.row)) {
              u.plagueActive = true;
              u.plagueSpreadTimer = 10;
            }
          }
        }
      }
    }
    if (!this.canAttack && !this.cfg.heal) return;

    // 火焰塔：自动旋转 + 持续灼烧
    if (this.cfg.flame) {
      this.updateFlame(dt);
      return;
    }

    // 闪电塔：发射闪电链，在相邻怪物间传导
    if (this.cfg.chain) {
      this.fireTimer -= dt;
      if (this.fireTimer <= 0) {
        const target = this.findTarget();
        if (target) {
          this.fireTimer = 1 / this.fireRate;
          this.angle = Math.atan2(target.y - this.y, target.x - this.x);
          this.performLightning(target);
        }
      }
      return;
    }

    this.fireTimer -= dt;

    // 医院（heal 且不可攻击）：只治疗不攻击，每次最多治疗2个血量最低的角色
    if (this.cfg.heal && !this.cfg.canAttack) {
      if (this.fireTimer <= 0) {
        this.fireTimer = 1 / this.fireRate;
        this.performHeal(this.range, false, 2);
      }
      return;
    }

    // 刀斧手：扇形近战，自动选择敌人最多的连续3格
    if (this.cfg.fan) {
      if (this.fireTimer <= 0) {
        if (this.performFanAttack()) {
          this.fireTimer = 1 / this.fireRate;
        } else {
          // 周围无敌人，短暂重试（0.3秒后再检查），不浪费完整冷却
          this.fireTimer = 0.3;
        }
      }
      return;
    }

    // 工程师：持续修复相邻1格内血量最低的非满血建筑 + 近战攻击
    if (this.cfg.repair) {
      this.performRepair(dt);
      const target = this.findTarget();
      if (target) {
        this.angle = Math.atan2(target.y - this.y, target.x - this.x);
        if (this.fireTimer <= 0) {
          this.fireTimer = 1 / this.fireRate;
          const atkClass = this.cfg.baseClass || this.type;
          this.performAttack(atkClass, target);
        }
      }
      if (this.fireTimer > 0) this.fireTimer -= dt;
      return;
    }

    // 火法师：锁定最近敌人，点燃其所在格子
    if (this.cfg.burn) {
      const target = this.findTarget();
      if (target) {
        this.angle = Math.atan2(target.y - this.y, target.x - this.x);
        if (this.fireTimer <= 0) {
          this.fireTimer = 1 / this.fireRate;
          this.performFireball(target);
        }
      }
      if (this.fireTimer > 0) this.fireTimer -= dt;
      return;
    }

    // 战斗角色 / 军医：寻找目标并瞄准
    const target = this.findTarget();
    const atkClass = this.cfg.baseClass || this.type;
    if (target) {
      this.angle = Math.atan2(target.y - this.y, target.x - this.x);
    }

    const tick = this.fireTimer <= 0;

    // 制药师：每次 tick 治疗身边1格内血量最低的1个角色（含自身），并清除其中毒/血疫，同时攻击
    if (this.cfg.cure) {
      if (tick) {
        this.fireTimer = 1 / this.fireRate;
        this.performCureHeal(1);
        if (target) this.performAttack(atkClass, target);
      }
      return;
    }

    // 军医：每次 tick 同时治疗 + 攻击，每次最多治疗1个血量最低的角色
    if (this.cfg.heal) {
      if (tick) {
        this.fireTimer = 1 / this.fireRate;
        this.performHeal(1, true, 1); // 治疗自己+1个相邻格血量最低的角色
        if (target) this.performAttack(atkClass, target);
      }
      return;
    }

    // 普通战斗角色：有目标且冷却就绪时攻击
    if (tick && target) {
      this.fireTimer = 1 / this.fireRate;
      this.performAttack(atkClass, target);
    }
  }

  // 治疗范围内友方角色（range=曼哈顿距离，includeSelf=是否治疗自己，maxTargets=最多治疗几个友方角色）
  performHeal(range, includeSelf, maxTargets) {
    if (includeSelf) {
      this.hp = Math.min(this.maxHp, this.hp + this.heal);
      Game.effects.push(new HealEffect(this.x, this.y));
    }
    // 收集范围内需要治疗的非满血友方角色
    const candidates = [];
    for (const u of Game.units) {
      if (u === this || !u.alive) continue;
      if (u.isBuilding) continue;
      if (u.hp >= u.maxHp) continue;
      const dc = Math.abs(u.col - this.col);
      const dr = Math.abs(u.row - this.row);
      if (dc + dr <= range) candidates.push(u);
    }
    // 按当前生命值升序（血量最低优先）
    candidates.sort((a, b) => a.hp - b.hp);
    const limit = maxTargets || Infinity;
    for (let i = 0; i < Math.min(candidates.length, limit); i++) {
      const u = candidates[i];
      u.hp = Math.min(u.maxHp, u.hp + this.heal);
      Game.effects.push(new HealEffect(u.x, u.y));
    }
  }

  // 制药师：治疗身边 range（曼哈顿）内血量最低的1个角色（含自身），并清除其中毒与血疫
  performCureHeal(range) {
    const candidates = [];
    // 自身（仅在不满血时作为候选，确保优先治疗更需要的友方）
    if (this.hp < this.maxHp) candidates.push(this);
    for (const u of Game.units) {
      if (u === this || !u.alive || u.isBuilding || u.hp >= u.maxHp) continue;
      const dc = Math.abs(u.col - this.col);
      const dr = Math.abs(u.row - this.row);
      if (dc + dr <= range) candidates.push(u);
    }
    if (candidates.length === 0) return;
    candidates.sort((a, b) => a.hp - b.hp);
    const t = candidates[0];
    t.hp = Math.min(t.maxHp, t.hp + this.heal);
    t.poisonTimer = 0;     // 清除中毒
    t.plagueActive = false; // 清除血疫
    Game.effects.push(new HealEffect(t.x, t.y));
  }

  // 修复周围一圈（3*3）内血量最低的非满血建筑（持续，repair点/秒）
  performRepair(dt) {
    let target = null, bestHp = Infinity;
    for (const u of Game.units) {
      if (u === this || !u.alive) continue;
      if (!u.isBuilding) continue;
      if (u.hp >= u.maxHp) continue;
      const dc = Math.abs(u.col - this.col);
      const dr = Math.abs(u.row - this.row);
      if (dc <= 1 && dr <= 1 && u.hp < bestHp) { bestHp = u.hp; target = u; }
    }
    if (target) {
      target.hp = Math.min(target.maxHp, target.hp + this.repair * dt);
      Game.effects.push(new RepairEffect(target.x, target.y));
    }
  }

  // 火法师：火球攻击 - 直接伤害 + 在目标格留下燃烧地面
  performFireball(target) {
    // 直接伤害
    target.takeDamage(this.atk);
    // 目标格燃烧
    const tc = pxToCell(target.x, target.y);
    if (tc) {
      const burn = this.cfg.burn;
      // 叠加或刷新该格的燃烧地面
      const existing = Game.burningCells.find(b => b.col === tc.col && b.row === tc.row);
      if (existing) {
        existing.remaining = Math.max(existing.remaining, burn.groundDur);
        existing.dps = Math.max(existing.dps, burn.dps);
        existing.debuffDur = Math.max(existing.debuffDur, burn.debuffDur);
      } else {
        Game.burningCells.push({
          col: tc.col, row: tc.row,
          remaining: burn.groundDur, maxTime: burn.groundDur,
          dps: burn.dps, debuffDur: burn.debuffDur
        });
      }
      const cc = cellCenter(tc.col, tc.row);
      Game.effects.push(new FlameZoneEffect(cc.x, cc.y, burn.groundDur));
    }
    // 火球飞行特效
    Game.effects.push(new FireballProjectile(this.x, this.y, target.x, target.y));
  }

  // 执行一次攻击（发射投射物）
  performAttack(atkClass, target) {
    // 枪口火光（在单位朝向方向前方）
    const mx = this.x + Math.cos(this.angle) * 14;
    const my = this.y + Math.sin(this.angle) * 14;
    Game.effects.push(new MuzzleFlash(mx, my, this.angle, this.cfg.color));

    if (atkClass === 'shotgun') {
      // 霰弹枪：发射5颗扇形弹丸，朝向目标方向扩散
      const baseAngle = this.angle;
      const pelletCount = 5;
      const spread = 0.55; // 扇形总角度（弧度，约31度）
      for (let i = 0; i < pelletCount; i++) {
        const t = (i / (pelletCount - 1) - 0.5) * 2; // -1 ~ 1
        const a = baseAngle + t * spread;
        const dir = { x: Math.cos(a), y: Math.sin(a) };
        Game.projectiles.push(new Projectile(this.x, this.y, target, this, null, dir, true));
      }
    } else if (atkClass === 'crossbow' || atkClass === 'icemage') {
      // 朝目标方向射出穿透箭/冰锥（任意方向）
      const dx = target.x - this.x;
      const dy = target.y - this.y;
      const d = Math.hypot(dx, dy) || 1;
      const dir = { x: dx / d, y: dy / d };
      Game.projectiles.push(new Projectile(this.x, this.y, target, this, null, dir));
      this.angle = Math.atan2(dir.y, dir.x);
    } else {
      Game.projectiles.push(new Projectile(this.x, this.y, target, this));
    }
  }

  // 闪电塔：发射闪电链，从主目标开始在相邻1格内的怪物间传导
  performLightning(target) {
    const chain = this.cfg.chain;
    const falloff = chain.falloff;
    const path = [{ x: this.x, y: this.y }];
    const hit = new Set();
    let current = target;
    for (let i = 0; i < falloff.length && current; i++) {
      const dmg = this.atk * falloff[i];
      current.takeDamage(dmg);
      hit.add(current);
      path.push({ x: current.x, y: current.y });
      // 寻找下一个未命中过的、曼哈顿距离 <= chain.range 的最近怪物
      let next = null, bestDist = Infinity;
      const cc = pxToCell(current.x, current.y);
      if (cc) {
        for (const m of Game.monsters) {
          if (!m.alive || hit.has(m)) continue;
          const mc = pxToCell(m.x, m.y);
          if (!mc) continue;
          const md = Math.abs(mc.col - cc.col) + Math.abs(mc.row - cc.row);
          if (md <= chain.range && md < bestDist) {
            bestDist = md;
            next = m;
          }
        }
      }
      current = next;
    }
    Game.effects.push(new LightningEffect(path, this.cfg.color));
  }

  // 刀斧手：扇形近战，自动选择周围8格中敌人最多的连续3格
  performFanAttack() {
    // 8个相邻格偏移（顺时针：N, NE, E, SE, S, SW, W, NW）
    const neighbors = [[0,-1],[1,-1],[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1]];
    // 每格对应的角度（用于特效朝向）
    const angles = [-Math.PI/2, -Math.PI/4, 0, Math.PI/4, Math.PI/2, 3*Math.PI/4, Math.PI, -3*Math.PI/4];
    // 统计每个相邻格的怪物
    const cellMonsters = Array.from({length:8}, () => []);
    for (const m of Game.monsters) {
      if (!m.alive) continue;
      const mc = pxToCell(m.x, m.y);
      if (!mc) continue;
      for (let i = 0; i < 8; i++) {
        const [dc, dr] = neighbors[i];
        if (mc.col === this.col + dc && mc.row === this.row + dr) {
          cellMonsters[i].push(m);
          break;
        }
      }
    }
    // 寻找怪物最多的连续3格扇形
    let bestSector = 0, bestCount = 0;
    for (let i = 0; i < 8; i++) {
      const count = cellMonsters[i].length + cellMonsters[(i+1)%8].length + cellMonsters[(i+2)%8].length;
      if (count > bestCount) { bestCount = count; bestSector = i; }
    }
    if (bestCount === 0) return false; // 周围无敌人则不攻击
    // 对最佳扇形3格内所有怪物造成伤害
    const hitSet = new Set();
    for (const idx of [bestSector, (bestSector+1)%8, (bestSector+2)%8]) {
      for (const m of cellMonsters[idx]) hitSet.add(m);
    }
    for (const m of hitSet) m.takeDamage(this.atk);
    // 扇形斩击特效（朝中间格方向）
    const midIdx = (bestSector + 1) % 8;
    Game.effects.push(new SlashEffect(this.x, this.y, angles[midIdx], this.cfg.color));
    return true;
  }

  findTarget() {
    const maxRange = this.range * CONFIG.cellW;
    // 集火优先：若集火目标存活且在射程内，则优先攻击
    const ft = Game.focusTarget;
    if (ft && ft.alive) {
      const d = dist(ft, this);
      if (d <= maxRange) return ft;
    }
    // 原逻辑：寻找射程内距离最近的敌人
    let best = null, bestDist = Infinity;
    for (const m of Game.monsters) {
      if (!m.alive) continue;
      const d = dist(m, this);
      if (d <= maxRange && d < bestDist) {
        bestDist = d;
        best = m;
      }
    }
    return best;
  }

  // 火焰塔：自动选方向 + 持续伤害
  updateFlame(dt) {
    const dirs = { up:[0,-1], down:[0,1], left:[-1,0], right:[1,0] };
    // 统计四个方向上射程内的敌人数
    let bestDir = this.direction, bestCount = 0;
    for (const name in dirs) {
      const [dc, dr] = dirs[name];
      let count = 0;
      for (let i = 1; i <= this.range; i++) {
        const cc = this.col + dc*i, rr = this.row + dr*i;
        for (const m of Game.monsters) {
          if (!m.alive) continue;
          const mc = pxToCell(m.x, m.y);
          if (mc && mc.col === cc && mc.row === rr) count++;
        }
      }
      if (count > bestCount) { bestCount = count; bestDir = name; }
    }
    this.direction = bestDir;
    // 对选定方向上的所有敌人造成持续伤害
    this.flameActive = bestCount > 0;
    if (!this.flameActive) return;
    const [dc, dr] = dirs[this.direction];
    const dmg = this.atk * (1 + this.fireRate) * dt;
    for (let i = 1; i <= this.range; i++) {
      const cc = this.col + dc*i, rr = this.row + dr*i;
      for (const m of Game.monsters) {
        if (!m.alive) continue;
        const mc = pxToCell(m.x, m.y);
        if (mc && mc.col === cc && mc.row === rr) {
          m.takeDamage(dmg);
        }
      }
    }
  }

  takeDamage(dmg) {
    this.hp -= dmg;
    this.hitFlash = 0.1;
    // 玩家单位受击飘字（DoT 每帧伤害过小，阈值1过滤掉）
    if (dmg >= 1) {
      Game.effects.push(new DamageTextEffect(this.x, this.y, dmg));
    }
    if (this.hp <= 0) {
      this.alive = false;
      Game.onUnitDestroyed(this);
    }
  }
  applyStun(duration) {
    this.stunTimer = Math.max(this.stunTimer, duration);
  }

  // 地雷爆炸：对3*3范围内所有怪物造成伤害，然后自身消失
  explode() {
    if (!this.cfg.mine || !this.alive || this.armTimer > 0) return;
    const c = this.col, r = this.row;
    const dmg = this.cfg.atk;
    // 爆炸特效
    Game.effects.push(new ExplosionEffect(this.x, this.y));
    // 对3*3范围内所有怪物造成伤害
    for (const m of Game.monsters) {
      if (!m.alive) continue;
      if (Math.abs(m.col - c) <= 1 && Math.abs(m.row - r) <= 1) {
        m.takeDamage(dmg);
      }
    }
    // 地雷消失
    this.alive = false;
    Game.onUnitDestroyed(this);
  }

  draw(ctx) {
    const cfg = this.cfg;
    const size = this.isBuilding ? 22 : 20;
    // 火焰塔：先画光束（在塔身下方），仅在攻击时绘制
    if (cfg.flame && this.flameActive) this.drawFlameBeam(ctx);
    // 统一矢量图标（与建造栏同源，保证图标一致）
    drawUnitVector(ctx, this.type, this.x, this.y, size, this.hitFlash > 0, this);
    // 燃烧状态：橙色火焰光晕 + 闪烁
    if (this.burnTimer > 0) {
      const flick = 0.6 + Math.sin(performance.now() / 80) * 0.4;
      ctx.globalAlpha = 0.5 * flick;
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(this.x, this.y, size * 0.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    // 中毒状态：绿色毒雾光晕 + 气泡
    if (this.poisonTimer > 0) {
      const flick = 0.5 + Math.sin(performance.now() / 120) * 0.3;
      ctx.globalAlpha = 0.45 * flick;
      ctx.fillStyle = '#65a30d';
      ctx.beginPath();
      ctx.arc(this.x, this.y, size * 0.85, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      // 小毒气泡
      const bt = performance.now() / 300;
      for (let i = 0; i < 3; i++) {
        const bx = this.x + Math.sin(bt + i * 2) * size * 0.3;
        const by = this.y - size * 0.3 - ((bt * 20 + i * 15) % (size * 0.8));
        ctx.fillStyle = 'rgba(132,204,22,0.6)';
        ctx.beginPath();
        ctx.arc(bx, by, size * 0.1, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // 血疫状态：暗红色血雾光晕 + 血滴
    if (this.plagueActive) {
      const flick = 0.55 + Math.sin(performance.now() / 110) * 0.3;
      ctx.globalAlpha = 0.5 * flick;
      ctx.fillStyle = '#7f1d1d';
      ctx.beginPath();
      ctx.arc(this.x, this.y, size * 0.88, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      // 血滴粒子
      const pt = performance.now() / 280;
      for (let i = 0; i < 3; i++) {
        const bx = this.x + Math.sin(pt + i * 2.1) * size * 0.32;
        const by = this.y - size * 0.28 - ((pt * 22 + i * 17) % (size * 0.85));
        ctx.fillStyle = 'rgba(220,38,38,0.7)';
        ctx.beginPath();
        ctx.arc(bx, by, size * 0.09, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // 眩晕状态：头顶旋转星星 + 紫色光晕
    if (this.stunTimer > 0) {
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = '#a855f7';
      ctx.beginPath();
      ctx.arc(this.x, this.y, size * 0.9, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      const t = performance.now() / 200;
      ctx.save();
      ctx.translate(this.x, this.y - size * 1.0);
      ctx.rotate(t);
      ctx.fillStyle = '#facc15';
      ctx.strokeStyle = '#a16207';
      ctx.lineWidth = 1;
      for (let i = 0; i < 3; i++) {
        const a = (Math.PI * 2 / 3) * i;
        const sx = Math.cos(a) * size * 0.3;
        const sy = Math.sin(a) * size * 0.3;
        ctx.beginPath();
        drawStar(ctx, sx, sy, size * 0.14, size * 0.06, 5);
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    }
    // 血条
    if (this.hp < this.maxHp) {
      drawHealthBar(ctx, this.x, this.y, size, this.hp, this.maxHp);
    }
  }

  // 绘制火焰光束
  drawFlameBeam(ctx) {
    const dirs = { up:[0,-1], down:[0,1], left:[-1,0], right:[1,0] };
    const [dc, dr] = dirs[this.direction] || [0,1];
    const cw = CONFIG.cellW;
    const len = this.range * cw;
    ctx.save();
    ctx.translate(this.x, this.y);
    const angle = Math.atan2(dr, dc);
    ctx.rotate(angle);
    const flick = 0.85 + Math.random() * 0.3;
    // 外层火焰（橙红）
    const g1 = ctx.createLinearGradient(0, 0, len, 0);
    g1.addColorStop(0, 'rgba(255,180,40,0.85)');
    g1.addColorStop(0.5, 'rgba(249,115,22,0.6)');
    g1.addColorStop(1, 'rgba(239,68,68,0)');
    ctx.fillStyle = g1;
    ctx.fillRect(0, -cw*0.32*flick, len, cw*0.64*flick);
    // 内层核心（亮黄白）
    const g2 = ctx.createLinearGradient(0, 0, len*0.85, 0);
    g2.addColorStop(0, 'rgba(255,255,220,0.95)');
    g2.addColorStop(0.5, 'rgba(255,200,60,0.8)');
    g2.addColorStop(1, 'rgba(249,115,22,0)');
    ctx.fillStyle = g2;
    ctx.fillRect(0, -cw*0.13*flick, len*0.85, cw*0.26*flick);
    ctx.restore();
  }

  drawRange(ctx) {
    ctx.strokeStyle = 'rgba(78,205,196,0.6)';
    ctx.fillStyle = 'rgba(78,205,196,0.08)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.range * CONFIG.cellW, 0, Math.PI*2);
    ctx.fill();
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

// ============== 怪物类 ==============
class Monster {
  constructor(type, col, mul) {
    const cfg = MONSTER_TYPES[type];
    const m = mul || { hp:1, atk:1, speed:1 };
    this.type = type;
    this.cfg = cfg;
    this.category = cfg.category || 'zombie';
    this.maxHp = Math.round(cfg.hp * m.hp);
    this.hp = this.maxHp;
    this.atk = Math.round(cfg.atk * m.atk);
    this.baseSpeed = cfg.speed * m.speed;
    this.speed = this.baseSpeed;
    this.gold = cfg.gold;
    this.col = col;
    this.row = 0;
    this.targetCol = col;
    this.targetRow = 0;
    this.moveProgress = 1; // 1=已在格子，开始选择下一步
    const c = cellCenter(col, 0);
    this.x = c.x; this.y = c.y;
    this.alive = true;
    this.attackTarget = null;
    this.attackTimer = 0;
    this.attackInterval = cfg.fireRate ? (1 / cfg.fireRate) : 1.0; // 远程怪用fireRate，近战默认1秒/次
    this.hitFlash = 0;
    this.angle = 0;
    this.slowTimer = 0;
    this.slowFactor = 1;
    this.burnTimer = 0;
    this.burnDps = 0;
    // 母体丧尸：保存关卡倍率（召唤的普通丧尸继承此倍率）+ 召唤计时器
    this.mul = m;
    this.spawnTimer = 0;
    // 战吼丧尸：战吼计时器
    this.warcryTimer = 0;
  }

  update(dt) {
    if (!this.alive) return;
    if (this.hitFlash > 0) this.hitFlash -= dt;
    // 燃烧伤害
    if (this.burnTimer > 0) {
      this.burnTimer -= dt;
      this.takeDamage(this.burnDps * dt);
      if (!this.alive) return;
    }
    if (this.slowTimer > 0) {
      this.slowTimer -= dt;
      this.speed = this.baseSpeed * this.slowFactor;
      if (this.slowTimer <= 0) { this.speed = this.baseSpeed; this.slowFactor = 1; }
    }

    // 母体丧尸：定时召唤普通丧尸
    if (this.cfg.spawn) {
      this.spawnTimer += dt;
      if (this.spawnTimer >= this.cfg.spawn.interval) {
        this.spawnTimer = 0;
        this.spawnMinions();
      }
    }

    // 战吼丧尸：定时发动战吼（范围伤害+眩晕）
    if (this.cfg.warcry) {
      this.warcryTimer += dt;
      if (this.warcryTimer >= this.cfg.warcry.interval) {
        this.warcryTimer = 0;
        this.warcryShout();
      }
    }

    // 静止敌方建筑（如鼠穴）：不移动、不攻击，仅执行上方的召唤/战吼逻辑
    if (this.cfg.stationary) return;

    // 攻击目标
    if (this.attackTarget) {
      if (this.attackTarget === 'base') {
        // 持续攻击基地，直到被消灭
        this.attackTimer -= dt;
        if (this.attackTimer <= 0) {
          this.attackTimer = this.attackInterval;
          Game.baseHp -= this.atk;
          Game.updateHUD();
          if (Game.baseHp <= 0) { Game.lose(); return; }
        }
        return;
      }
      if (!this.attackTarget.alive) {
        this.attackTarget = null;
      } else {
        this.attackTimer -= dt;
        if (this.attackTimer <= 0) {
          this.attackTimer = this.attackInterval;
          this.attackTarget.takeDamage(this.atk);
          // 尖刺反弹：被攻击单位有 thorns 时，怪物受到反弹伤害
          if (this.attackTarget.thorns && this.attackTarget.alive) {
            this.takeDamage(this.attackTarget.maxHp * this.attackTarget.thorns);
          }
          // 丧尸犬/丧尸鼠攻击：使角色/英雄中毒（建筑免疫）
          if (this.cfg.poison && !this.attackTarget.cfg.isBuilding) {
            this.attackTarget.poisonTimer = Math.max(this.attackTarget.poisonTimer, this.cfg.poison.duration);
            this.attackTarget.poisonDps = this.cfg.poison.dps;
          }
          // 红眼丧尸攻击：使角色/英雄陷入血疫（建筑免疫，制药师免疫，医院1格内免疫）
          if (this.cfg.plague && !this.attackTarget.cfg.isBuilding && !this.attackTarget.cfg.plagueImmune) {
            if (!Game.isProtectedFromPlague(this.attackTarget.col, this.attackTarget.row)) {
              this.attackTarget.plagueActive = true;
              if (this.attackTarget.plagueSpreadTimer <= 0) this.attackTarget.plagueSpreadTimer = 10;
            }
          }
          // 远程怪物：发射弹丸特效
          if (this.cfg.ranged) {
            if (this.cfg.burn && this.cfg.aoe) {
              // 暴徒：投掷燃烧弹，目标格及上下左右共5格燃烧
              const burn = this.cfg.burn;
              const tc = pxToCell(this.attackTarget.x, this.attackTarget.y);
              if (tc) {
                const cells = [[tc.col,tc.row],[tc.col-1,tc.row],[tc.col+1,tc.row],[tc.col,tc.row-1],[tc.col,tc.row+1]];
                for (const [c, r] of cells) {
                  if (c < 0 || c >= CONFIG.cols || r < 0 || r >= CONFIG.rows) continue;
                  const ex = Game.burningCells.find(b => b.col === c && b.row === r);
                  if (ex) {
                    ex.remaining = Math.max(ex.remaining, burn.groundDur);
                    ex.dps = Math.max(ex.dps, burn.dps);
                    ex.debuffDur = Math.max(ex.debuffDur, burn.debuffDur);
                  } else {
                    Game.burningCells.push({ col:c, row:r, remaining:burn.groundDur, maxTime:burn.groundDur, dps:burn.dps, debuffDur:burn.debuffDur });
                  }
                  const cc = cellCenter(c, r);
                  Game.effects.push(new FlameZoneEffect(cc.x, cc.y, burn.groundDur));
                }
              }
              Game.effects.push(new FireballProjectile(this.x, this.y, this.attackTarget.x, this.attackTarget.y));
            } else {
              Game.effects.push(new AcidProjectile(this.x, this.y, this.attackTarget.x, this.attackTarget.y));
            }
          }
        }
        return;
      }
    }

    // 移动到目标格
    if (this.moveProgress < 1) {
      this.moveProgress += this.speed * dt;
      const from = cellCenter(this.col, this.row);
      const to = cellCenter(this.targetCol, this.targetRow);
      const p = Math.min(1, this.moveProgress);
      this.x = from.x + (to.x - from.x) * p;
      this.y = from.y + (to.y - from.y) * p;
      if (p >= 1) {
        this.col = this.targetCol;
        this.row = this.targetRow;
        this.moveProgress = 1;
        // 地面怪物踩到地雷（仅已埋设的地雷生效）
        if (!this.cfg.flying) {
          const mine = Game.units.find(u => u.alive && u.cfg.mine && u.armTimer <= 0 && u.col === this.col && u.row === this.row);
          if (mine) mine.explode();
        }
      }
      return;
    }

    // 到达格子，选择下一步
    this.chooseNext();
  }

  chooseNext() {
    const baseCol = CONFIG.baseCol;
    const baseRow = CONFIG.baseRow;
    const flying = !!this.cfg.flying;
    const ranged = !!this.cfg.ranged;

    // 劫掠者：以最近的玩家单位为目标，而非基地
    if (this.cfg.category === 'raider') {
      // 寻找最近的存活玩家单位
      let target = null, bestDist = Infinity;
      for (const u of Game.units) {
        if (!u.alive) continue;
        const d = Math.abs(u.col - this.col) + Math.abs(u.row - this.row);
        if (d < bestDist) { bestDist = d; target = u; }
      }
      const atkRange = this.cfg.rangedRange || 1;
      if (target) {
        // 在攻击范围内：攻击目标
        if (bestDist <= atkRange) {
          this.attackTarget = target;
          this.attackTimer = 0;
          return;
        }
        // 不在范围内：直接向目标移动（不绕路，受阻就攻击障碍）
        const dx = target.col - this.col;
        const dy = target.row - this.row;
        // 主方向：绝对值更大的轴
        let ox, oy;
        if (Math.abs(dx) >= Math.abs(dy)) {
          ox = Math.sign(dx); oy = 0;
          if (ox === 0) { ox = 0; oy = Math.sign(dy); }
        } else {
          ox = 0; oy = Math.sign(dy);
        }
        let nc = this.col + ox, nr = this.row + oy;
        // 越界则尝试另一轴
        if (nc < 0 || nc >= CONFIG.cols || nr < 0 || nr >= CONFIG.rows) {
          if (ox !== 0) { ox = 0; oy = Math.sign(dy); }
          else { ox = Math.sign(dx); oy = 0; }
          nc = this.col + ox; nr = this.row + oy;
          if (nc < 0 || nc >= CONFIG.cols || nr < 0 || nr >= CONFIG.rows) return;
        }
        const obs = Game.getObstacleAt(nc, nr);
        if (obs) {
          // 被阻挡：攻击障碍物，不绕路
          this.attackTarget = obs;
          this.attackTimer = 0;
        } else {
          this.targetCol = nc;
          this.targetRow = nr;
          this.moveProgress = 0;
        }
        return;
      }
      // 没有玩家单位：回退到攻击基地（沿用普通地面怪物逻辑）
    }

    // 远程怪物：优先攻击射程内的玩家单位（曼哈顿距离<=rangedRange）
    if (ranged) {
      const range = this.cfg.rangedRange || 3;
      let target = null, bestDist = Infinity;
      for (const u of Game.units) {
        if (!u.alive) continue;
        const d = Math.abs(u.col - this.col) + Math.abs(u.row - this.row);
        if (d <= range && d < bestDist) {
          bestDist = d;
          target = u;
        }
      }
      if (target) {
        this.attackTarget = target;
        this.attackTimer = 0;
        return;
      }
    }

    // 飞行怪物：无视地面建筑/角色阻挡，直接飞向基地
    if (flying) {
      // 优先横向对齐基地列，再纵向飞向基地
      if (this.col !== baseCol) {
        const dir = this.col < baseCol ? 1 : -1;
        this.targetCol = this.col + dir;
        this.targetRow = this.row;
        this.moveProgress = 0;
        return;
      }
      // 已对齐基地列，向下飞
      if (this.row < baseRow) {
        if (this.row + 1 === baseRow) {
          // 到达基地旁，攻击基地
          this.attackTarget = 'base';
          this.attackTimer = 0;
          return;
        }
        this.targetCol = this.col;
        this.targetRow = this.row + 1;
        this.moveProgress = 0;
        return;
      }
      // 已在基地行，攻击基地
      if (this.row >= baseRow) {
        this.attackTarget = 'base';
        this.attackTimer = 0;
      }
      return;
    }

    // 还没到基地行，优先向下（最短路径）
    if (this.row < baseRow) {
      // 下一格是基地格，则停在原地攻击基地
      if (this.row + 1 === baseRow && this.col === baseCol) {
        this.attackTarget = 'base';
        this.attackTimer = 0;
        return;
      }
      const below = Game.getObstacleAt(this.col, this.row + 1);
      if (!below) {
        this.targetCol = this.col;
        this.targetRow = this.row + 1;
        this.moveProgress = 0;
      } else {
        // 下方有障碍物，攻击它（不绕路）
        this.attackTarget = below;
        this.attackTimer = 0;
      }
      return;
    }

    // 到达基地行，横向移动到基地列
    if (this.row === baseRow) {
      const dir = this.col < baseCol ? 1 : -1;
      const nc = this.col + dir;
      // 下一格是基地格，则停在原地攻击基地
      if (nc === baseCol) {
        this.attackTarget = 'base';
        this.attackTimer = 0;
        return;
      }
      const unit = Game.getObstacleAt(nc, this.row);
      if (!unit) {
        this.targetCol = nc;
        this.targetRow = this.row;
        this.moveProgress = 0;
      } else {
        this.attackTarget = unit;
        this.attackTimer = 0;
      }
      return;
    }
  }

  // 母体丧尸/鼠穴：在自身周围 range 格内随机位置召唤 count 只小怪
  spawnMinions() {
    const sp = this.cfg.spawn;
    const range = sp.range || 1;
    let spawned = 0, attempts = 0;
    const maxAttempts = sp.count * 30;
    while (spawned < sp.count && attempts < maxAttempts) {
      attempts++;
      // 随机偏移（曼哈顿距离 <= range）
      let dc, dr;
      do {
        dc = Math.floor(Math.random() * (range * 2 + 1)) - range;
        dr = Math.floor(Math.random() * (range * 2 + 1)) - range;
      } while (Math.abs(dc) + Math.abs(dr) > range);
      const nc = this.col + dc;
      const nr = this.row + dr;
      // 越界检查：列在地图内，行不超过基地行（避免直接生成到基地）
      if (nc < 0 || nc >= CONFIG.cols) continue;
      if (nr < 0 || nr > CONFIG.baseRow) continue;
      // 创建小怪，继承召唤者的关卡倍率
      const baby = new Monster(sp.type, nc, this.mul);
      baby.row = nr;
      baby.targetRow = nr;
      baby.moveProgress = 1;
      const bc = cellCenter(nc, nr);
      baby.x = bc.x; baby.y = bc.y;
      Game.monsters.push(baby);
      spawned++;
    }
  }

  // 战吼丧尸：对周围2格内的角色/英雄造成伤害+眩晕（建筑无效）
  warcryShout() {
    const wc = this.cfg.warcry;
    const range = wc.range;
    const dmg = wc.damage;
    const stunDur = wc.stunDur;
    // 战吼声波特效（扩散圆环）
    Game.effects.push(new WarcryWave(this.x, this.y, range * CONFIG.cellW));
    // 遍历所有玩家单位，只对非建筑的角色/英雄生效
    for (const u of Game.units) {
      if (!u.alive) continue;
      if (u.isBuilding) continue; // 建筑无效
      const uc = pxToCell(u.x, u.y);
      if (!uc) continue;
      const dist = Math.abs(uc.col - this.col) + Math.abs(uc.row - this.row);
      if (dist <= range) {
        u.takeDamage(dmg);
        u.applyStun(stunDur);
      }
    }
  }

  takeDamage(dmg) {
    this.hp -= dmg;
    this.hitFlash = 0.1;
    if (this.hp <= 0) {
      this.alive = false;
      Game.gold += this.gold;
      Game.updateHUD();
      Game.updateBuildBar();
      // Boss / 精英怪物死亡特效
      if (this.cfg.deathFx) {
        if (this.cfg.deathFx === 'boss') {
          Game.effects.push(new BossDeathEffect(this.x, this.y));
        } else {
          Game.effects.push(new EliteDeathEffect(this.x, this.y, this.cfg.deathFx));
        }
      }
      // 毒气丧尸死亡：在自身及上下左右4格释放毒气
      if (this.type === 'gas') {
        const cc = pxToCell(this.x, this.y);
        if (cc) {
          const cells = [
            { col: cc.col, row: cc.row },
            { col: cc.col, row: cc.row - 1 },
            { col: cc.col, row: cc.row + 1 },
            { col: cc.col - 1, row: cc.row },
            { col: cc.col + 1, row: cc.row }
          ];
          for (const c of cells) {
            if (c.col < 0 || c.col >= CONFIG.cols || c.row < 0 || c.row >= CONFIG.rows) continue;
            const existing = Game.poisonCells.find(p => p.col === c.col && p.row === c.row);
            if (existing) {
              existing.remaining = Math.max(existing.remaining, 5);
            } else {
              Game.poisonCells.push({ col: c.col, row: c.row, remaining: 5, maxTime: 5, dps: 25 });
            }
          }
        }
      }
    }
  }

  applySlow(factor, duration) {
    this.slowFactor = Math.min(this.slowFactor, factor);
    this.slowTimer = Math.max(this.slowTimer, duration);
  }

  draw(ctx) {
    const cfg = this.cfg;
    const size = cfg.size;
    ctx.save();
    ctx.translate(this.x, this.y);

    if (this.type === 'normal') this.drawNormal(ctx, size);
    else if (this.type === 'fast') this.drawFast(ctx, size);
    else if (this.type === 'rat') this.drawRat(ctx, size);
    else if (this.type === 'tank') this.drawTank(ctx, size);
    else if (this.type === 'bat') this.drawBat(ctx, size);
    else if (this.type === 'acid') this.drawAcid(ctx, size);
    else if (this.type === 'gas') this.drawGas(ctx, size);
    else if (this.type === 'boss') this.drawBoss(ctx, size);
    else if (this.type === 'mother') this.drawMother(ctx, size);
    else if (this.type === 'warcry') this.drawWarcry(ctx, size);
    else if (this.type === 'ratnest') this.drawRatNest(ctx, size);
    else if (this.type === 'redeye') this.drawRedeye(ctx, size);
    else if (this.type === 'bully') this.drawBully(ctx, size);
    else if (this.type === 'raider_gunner') this.drawRaiderGunner(ctx, size);
    else if (this.type === 'armed_raider') this.drawArmedRaider(ctx, size);
    else if (this.type === 'thug') this.drawThug(ctx, size);

    ctx.restore();

    // 减速效果
    if (this.slowTimer > 0) {
      ctx.fillStyle = 'rgba(160,231,255,0.4)';
      ctx.beginPath();
      ctx.arc(this.x, this.y, size+4, 0, Math.PI*2);
      ctx.fill();
    }
    // 燃烧状态：橙色火焰光晕 + 闪烁
    if (this.burnTimer > 0) {
      const flick = 0.6 + Math.sin(performance.now() / 80) * 0.4;
      ctx.globalAlpha = 0.5 * flick;
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(this.x, this.y, size + 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    // 血条
    if (this.hp < this.maxHp) {
      drawHealthBar(ctx, this.x, this.y, size, this.hp, this.maxHp);
    }
  }

  // ========== 丧尸系统一辅助 ==========
  // 绘制丧尸通用的腐肉皮肤色块
  _zombieSkin(ctx, s, flash, baseColor, rotColor) {
    const grad = ctx.createRadialGradient(-s*0.15, -s*0.15, s*0.1, 0, 0, s*0.7);
    grad.addColorStop(0, flash ? '#fff' : baseColor);
    grad.addColorStop(1, flash ? '#fff' : rotColor);
    return grad;
  }

  drawNormal(ctx, s) {
    const flash = this.hitFlash > 0;
    const skin = flash ? '#fff' : '#8a9a5b';
    const skinDark = flash ? '#fff' : '#5f6e3a';
    // 阴影
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(0, s*0.72, s*0.55, s*0.18, 0, 0, Math.PI*2);
    ctx.fill();
    // 褴褛衣衫（深褐色）
    ctx.fillStyle = flash ? '#fff' : '#5c4033';
    ctx.beginPath();
    ctx.moveTo(-s*0.5, s*0.1);
    ctx.lineTo(-s*0.42, s*0.6);
    ctx.lineTo(s*0.42, s*0.6);
    ctx.lineTo(s*0.5, s*0.1);
    ctx.closePath();
    ctx.fill();
    // 衣衫破洞
    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.arc(-s*0.15, s*0.35, s*0.08, 0, Math.PI*2);
    ctx.arc(s*0.2, s*0.4, s*0.06, 0, Math.PI*2);
    ctx.fill();
    // 胸腔撕裂伤口（暴露肋骨+黑血）
    ctx.fillStyle = flash ? '#fff' : '#4a1a1a';
    ctx.beginPath();
    ctx.ellipse(0, s*0.22, s*0.2, s*0.13, 0, 0, Math.PI*2);
    ctx.fill();
    // 肋骨
    ctx.strokeStyle = flash ? '#fff' : '#d4c5a0';
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(-s*0.14, s*0.16 + i*s*0.06);
      ctx.lineTo(s*0.14, s*0.16 + i*s*0.06);
      ctx.stroke();
    }
    // 血迹滴落
    ctx.fillStyle = flash ? '#fff' : '#7f1d1d';
    ctx.beginPath();
    ctx.arc(-s*0.18, s*0.38, s*0.025, 0, Math.PI*2);
    ctx.arc(s*0.16, s*0.42, s*0.02, 0, Math.PI*2);
    ctx.fill();
    // 脖子
    ctx.fillStyle = skinDark;
    ctx.fillRect(-s*0.12, -s*0.15, s*0.24, s*0.2);
    // 头（腐烂绿灰）
    ctx.fillStyle = this._zombieSkin(ctx, s, flash, '#9caa6b', '#6b7a44');
    ctx.beginPath();
    ctx.arc(0, -s*0.4, s*0.32, 0, Math.PI*2);
    ctx.fill();
    ctx.strokeStyle = '#4a5d30';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // 头侧腐烂伤口
    ctx.fillStyle = '#7c2d12';
    ctx.beginPath();
    ctx.ellipse(s*0.22, -s*0.35, s*0.1, s*0.06, 0.5, 0, Math.PI*2);
    ctx.fill();
    // 眼睛（空洞白眼）
    ctx.fillStyle = '#e8e0d0';
    ctx.beginPath();
    ctx.arc(-s*0.13, -s*0.42, s*0.09, 0, Math.PI*2);
    ctx.arc(s*0.13, -s*0.42, s*0.09, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = '#374151';
    ctx.beginPath();
    ctx.arc(-s*0.13, -s*0.42, s*0.035, 0, Math.PI*2);
    ctx.arc(s*0.13, -s*0.42, s*0.035, 0, Math.PI*2);
    ctx.fill();
    // 嘴（张开，缺牙）
    ctx.fillStyle = '#1f2937';
    ctx.beginPath();
    ctx.ellipse(0, -s*0.22, s*0.14, s*0.09, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = '#e8e0d0';
    ctx.beginPath();
    ctx.arc(-s*0.06, -s*0.16, s*0.025, 0, Math.PI*2);
    ctx.arc(s*0.07, -s*0.15, s*0.025, 0, Math.PI*2);
    ctx.fill();
    // 手臂（前伸，丧尸经典姿势）
    ctx.fillStyle = skinDark;
    ctx.beginPath();
    ctx.ellipse(-s*0.52, -s*0.05, s*0.13, s*0.32, 0.4, 0, Math.PI*2);
    ctx.ellipse(s*0.52, -s*0.05, s*0.13, s*0.32, -0.4, 0, Math.PI*2);
    ctx.fill();
    // 手骨（白骨）
    ctx.fillStyle = '#e8e0d0';
    ctx.beginPath();
    ctx.arc(-s*0.62, -s*0.32, s*0.1, 0, Math.PI*2);
    ctx.arc(s*0.62, -s*0.32, s*0.1, 0, Math.PI*2);
    ctx.fill();
  }

  drawRedeye(ctx, s) {
    // 复用普通丧尸外形，仅将双眼替换为发光红色
    this.drawNormal(ctx, s);
    const flash = this.hitFlash > 0;
    if (flash) return;
    const t = Date.now() / 150;
    const glow = 0.6 + Math.sin(t * 2) * 0.3;
    // 红眼发光晕
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 8 * glow;
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(-s*0.13, -s*0.42, s*0.09, 0, Math.PI*2);
    ctx.arc(s*0.13, -s*0.42, s*0.09, 0, Math.PI*2);
    ctx.fill();
    ctx.shadowBlur = 0;
    // 红色瞳孔
    ctx.fillStyle = '#7f1d1d';
    ctx.beginPath();
    ctx.arc(-s*0.13, -s*0.42, s*0.04, 0, Math.PI*2);
    ctx.arc(s*0.13, -s*0.42, s*0.04, 0, Math.PI*2);
    ctx.fill();
  }

  // 恶霸：壮硕人形，手持棍棒
  drawBully(ctx, s) {
    const flash = this.hitFlash > 0;
    // 身体
    ctx.fillStyle = flash ? '#fff' : '#b45309';
    ctx.beginPath();
    ctx.ellipse(0, s*0.1, s*0.32, s*0.42, 0, 0, Math.PI*2);
    ctx.fill();
    // 头
    ctx.fillStyle = flash ? '#fff' : '#d97706';
    ctx.beginPath();
    ctx.arc(0, -s*0.42, s*0.22, 0, Math.PI*2);
    ctx.fill();
    // 眼睛
    if (!flash) {
      ctx.fillStyle = '#1f2937';
      ctx.beginPath();
      ctx.arc(-s*0.08, -s*0.45, s*0.04, 0, Math.PI*2);
      ctx.arc(s*0.08, -s*0.45, s*0.04, 0, Math.PI*2);
      ctx.fill();
    }
    // 肌肉手臂 + 棍棒
    ctx.fillStyle = flash ? '#fff' : '#92400e';
    ctx.fillRect(-s*0.45, -s*0.05, s*0.18, s*0.35);
    ctx.fillRect(s*0.27, -s*0.15, s*0.18, s*0.35);
    // 棍棒
    ctx.strokeStyle = flash ? '#fff' : '#78350f';
    ctx.lineWidth = s*0.12;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(s*0.32, -s*0.1);
    ctx.lineTo(s*0.55, s*0.3);
    ctx.stroke();
    ctx.lineCap = 'butt';
  }

  // 劫掠枪手：持枪人形
  drawRaiderGunner(ctx, s) {
    const flash = this.hitFlash > 0;
    // 身体
    ctx.fillStyle = flash ? '#fff' : '#0891b2';
    ctx.beginPath();
    ctx.ellipse(0, s*0.1, s*0.28, s*0.38, 0, 0, Math.PI*2);
    ctx.fill();
    // 头
    ctx.fillStyle = flash ? '#fff' : '#0e7490';
    ctx.beginPath();
    ctx.arc(0, -s*0.38, s*0.2, 0, Math.PI*2);
    ctx.fill();
    // 头巾
    ctx.fillStyle = flash ? '#fff' : '#155e75';
    ctx.fillRect(-s*0.2, -s*0.52, s*0.4, s*0.14);
    // 眼睛
    if (!flash) {
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(-s*0.07, -s*0.38, s*0.035, 0, Math.PI*2);
      ctx.arc(s*0.07, -s*0.38, s*0.035, 0, Math.PI*2);
      ctx.fill();
    }
    // 手枪
    ctx.fillStyle = flash ? '#fff' : '#374151';
    ctx.fillRect(s*0.18, -s*0.02, s*0.28, s*0.1);
    ctx.fillRect(s*0.18, s*0.08, s*0.1, s*0.16);
  }

  // 武装劫掠者：重甲持枪人形
  drawArmedRaider(ctx, s) {
    const flash = this.hitFlash > 0;
    // 身体（重甲）
    ctx.fillStyle = flash ? '#fff' : '#7c2d12';
    ctx.beginPath();
    ctx.ellipse(0, s*0.1, s*0.33, s*0.44, 0, 0, Math.PI*2);
    ctx.fill();
    // 护甲片
    if (!flash) {
      ctx.fillStyle = '#9a3412';
      ctx.fillRect(-s*0.25, -s*0.1, s*0.5, s*0.08);
      ctx.fillRect(-s*0.25, s*0.08, s*0.5, s*0.08);
    }
    // 头盔
    ctx.fillStyle = flash ? '#fff' : '#431407';
    ctx.beginPath();
    ctx.arc(0, -s*0.38, s*0.22, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(-s*0.22, -s*0.38, s*0.44, s*0.12);
    // 护目镜
    if (!flash) {
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(-s*0.18, -s*0.42, s*0.36, s*0.08);
    }
    // 步枪
    ctx.fillStyle = flash ? '#fff' : '#1c1917';
    ctx.fillRect(s*0.15, -s*0.05, s*0.4, s*0.09);
    ctx.fillRect(s*0.15, s*0.04, s*0.12, s*0.18);
    // 枪托
    ctx.fillStyle = flash ? '#fff' : '#78350f';
    ctx.fillRect(s*0.5, -s*0.08, s*0.1, s*0.15);
  }

  drawThug(ctx, s) {
    const flash = this.hitFlash > 0;
    // 身体（红色夹克）
    ctx.fillStyle = flash ? '#fff' : '#dc2626';
    ctx.beginPath();
    ctx.ellipse(0, s*0.1, s*0.32, s*0.42, 0, 0, Math.PI*2);
    ctx.fill();
    // 腰带
    if (!flash) {
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(-s*0.3, s*0.18, s*0.6, s*0.07);
    }
    // 头部
    ctx.fillStyle = flash ? '#fff' : '#d4a373';
    ctx.beginPath();
    ctx.arc(0, -s*0.32, s*0.2, 0, Math.PI*2);
    ctx.fill();
    // 面罩（下半脸）
    if (!flash) {
      ctx.fillStyle = '#7f1d1d';
      ctx.fillRect(-s*0.18, -s*0.28, s*0.36, s*0.12);
    }
    // 眼睛
    if (!flash) {
      ctx.fillStyle = '#fde047';
      ctx.fillRect(-s*0.12, -s*0.38, s*0.07, s*0.05);
      ctx.fillRect(s*0.05, -s*0.38, s*0.07, s*0.05);
    }
    // 燃烧瓶（右手）
    ctx.fillStyle = flash ? '#fff' : '#16a34a';
    ctx.beginPath();
    ctx.ellipse(s*0.3, -s*0.05, s*0.09, s*0.13, 0.3, 0, Math.PI*2);
    ctx.fill();
    // 瓶口火焰
    if (!flash) {
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(s*0.3, -s*0.2, s*0.07, 0, Math.PI*2);
      ctx.fill();
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(s*0.3, -s*0.2, s*0.035, 0, Math.PI*2);
      ctx.fill();
    }
  }

  drawFast(ctx, s) {
    const flash = this.hitFlash > 0;
    const t = Date.now() / 100;
    const skin = flash ? '#fff' : '#8a9a5b';
    const skinDark = flash ? '#fff' : '#5f6e3a';
    // 阴影
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(0, s*0.72, s*0.55, s*0.17, 0, 0, Math.PI*2);
    ctx.fill();
    // 速度线（上方，向下冲）
    ctx.strokeStyle = flash ? '#fff' : 'rgba(180,200,120,0.5)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(-s*0.35 + i*s*0.35, -s*0.7);
      ctx.lineTo(-s*0.35 + i*s*0.35, -s*0.4);
      ctx.stroke();
    }
    // 身体（瘦长犬身，竖向，腐烂灰绿）
    ctx.fillStyle = this._zombieSkin(ctx, s, flash, '#9caa6b', '#5f6e3a');
    ctx.beginPath();
    ctx.ellipse(0, s*0.05, s*0.28, s*0.42, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.strokeStyle = '#4a5d30';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // 肋骨（暴露）
    ctx.strokeStyle = skinDark;
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(-s*0.22, -s*0.1 + i*s*0.12);
      ctx.lineTo(s*0.22, -s*0.1 + i*s*0.12);
      ctx.stroke();
    }
    // 脊柱（背部）
    ctx.strokeStyle = skinDark;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, -s*0.3);
    ctx.lineTo(0, s*0.35);
    ctx.stroke();
    // 四条腿（奔跑姿态，左右交替）
    const legPhase = Math.sin(t) * s*0.08;
    ctx.fillStyle = skin;
    // 前左腿
    ctx.beginPath();
    ctx.ellipse(-s*0.2, s*0.38 + legPhase, s*0.07, s*0.18, 0.2, 0, Math.PI*2);
    ctx.fill();
    // 前右腿
    ctx.beginPath();
    ctx.ellipse(s*0.2, s*0.38 - legPhase, s*0.07, s*0.18, -0.2, 0, Math.PI*2);
    ctx.fill();
    // 后左腿
    ctx.beginPath();
    ctx.ellipse(-s*0.2, -s*0.28 - legPhase, s*0.07, s*0.16, -0.2, 0, Math.PI*2);
    ctx.fill();
    // 后右腿
    ctx.beginPath();
    ctx.ellipse(s*0.2, -s*0.28 + legPhase, s*0.07, s*0.16, 0.2, 0, Math.PI*2);
    ctx.fill();
    // 爪子（前爪）
    ctx.fillStyle = '#3a3a2a';
    for (const lx of [-s*0.2, s*0.2]) {
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(lx - s*0.05 + i*s*0.05, s*0.55);
        ctx.lineTo(lx - s*0.04 + i*s*0.05, s*0.62);
        ctx.lineTo(lx - s*0.03 + i*s*0.05, s*0.55);
        ctx.closePath();
        ctx.fill();
      }
    }
    // 尾巴（向上翘起，腐烂）
    ctx.strokeStyle = skinDark;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, -s*0.38);
    ctx.quadraticCurveTo(s*0.15, -s*0.55, s*0.05, -s*0.7);
    ctx.stroke();
    // 头部（犬头，朝下，长嘴）
    ctx.fillStyle = this._zombieSkin(ctx, s, flash, '#9caa6b', '#5f6e3a');
    ctx.beginPath();
    ctx.ellipse(0, s*0.5, s*0.26, s*0.24, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.strokeStyle = '#4a5d30';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // 长嘴（口鼻部）
    ctx.fillStyle = skinDark;
    ctx.beginPath();
    ctx.ellipse(0, s*0.68, s*0.12, s*0.1, 0, 0, Math.PI*2);
    ctx.fill();
    // 鼻子
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.arc(0, s*0.74, s*0.04, 0, Math.PI*2);
    ctx.fill();
    // 尖耳（竖立）
    ctx.fillStyle = skinDark;
    ctx.beginPath();
    ctx.moveTo(-s*0.2, s*0.38);
    ctx.lineTo(-s*0.28, s*0.18);
    ctx.lineTo(-s*0.08, s*0.35);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(s*0.2, s*0.38);
    ctx.lineTo(s*0.28, s*0.18);
    ctx.lineTo(s*0.08, s*0.35);
    ctx.closePath();
    ctx.fill();
    // 眼睛（发光红，狂暴）
    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(-s*0.1, s*0.46, s*0.055, 0, Math.PI*2);
    ctx.arc(s*0.1, s*0.46, s*0.055, 0, Math.PI*2);
    ctx.fill();
    ctx.shadowBlur = 0;
    // 嘴（犬嘴张开，尖牙）
    ctx.fillStyle = '#1f2937';
    ctx.beginPath();
    ctx.ellipse(0, s*0.64, s*0.09, s*0.06, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = '#e8e0d0';
    // 上排尖牙
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(i*s*0.04 - s*0.02, s*0.58);
      ctx.lineTo(i*s*0.04, s*0.66);
      ctx.lineTo(i*s*0.04 + s*0.02, s*0.58);
      ctx.fill();
    }
  }

  drawRat(ctx, s) {
    const flash = this.hitFlash > 0;
    const t = Date.now() / 90;
    const body = flash ? '#fff' : '#a3a3a3';
    const bodyDark = flash ? '#fff' : '#737373';
    // 阴影
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(0, s*0.75, s*0.5, s*0.15, 0, 0, Math.PI*2);
    ctx.fill();
    // 速度线
    ctx.strokeStyle = flash ? '#fff' : 'rgba(200,200,200,0.5)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(-s*0.3 + i*s*0.3, -s*0.6);
      ctx.lineTo(-s*0.3 + i*s*0.3, -s*0.35);
      ctx.stroke();
    }
    // 身体（椭圆，灰色）
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.ellipse(0, s*0.1, s*0.3, s*0.38, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.strokeStyle = bodyDark;
    ctx.lineWidth = 1.2;
    ctx.stroke();
    // 尾巴（细长，弯曲摆动）
    const tailWag = Math.sin(t) * s*0.15;
    ctx.strokeStyle = bodyDark;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, -s*0.25);
    ctx.quadraticCurveTo(s*0.3, -s*0.5, s*0.25 + tailWag, -s*0.75);
    ctx.stroke();
    // 四条小腿（快速跑动）
    const legPhase = Math.sin(t) * s*0.1;
    ctx.fillStyle = bodyDark;
    // 前腿
    ctx.beginPath();
    ctx.ellipse(-s*0.18, s*0.4 + legPhase, s*0.05, s*0.12, 0.3, 0, Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(s*0.18, s*0.4 - legPhase, s*0.05, s*0.12, -0.3, 0, Math.PI*2);
    ctx.fill();
    // 后腿
    ctx.beginPath();
    ctx.ellipse(-s*0.15, -s*0.15 - legPhase, s*0.05, s*0.11, -0.3, 0, Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(s*0.15, -s*0.15 + legPhase, s*0.05, s*0.11, 0.3, 0, Math.PI*2);
    ctx.fill();
    // 头部（朝下，尖嘴）
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.ellipse(0, s*0.48, s*0.22, s*0.2, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.strokeStyle = bodyDark;
    ctx.lineWidth = 1.2;
    ctx.stroke();
    // 尖嘴（口鼻部）
    ctx.fillStyle = bodyDark;
    ctx.beginPath();
    ctx.moveTo(-s*0.1, s*0.58);
    ctx.lineTo(0, s*0.75);
    ctx.lineTo(s*0.1, s*0.58);
    ctx.closePath();
    ctx.fill();
    // 鼻子
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.arc(0, s*0.73, s*0.035, 0, Math.PI*2);
    ctx.fill();
    // 大耳朵（圆耳）
    ctx.fillStyle = bodyDark;
    ctx.beginPath();
    ctx.ellipse(-s*0.2, s*0.38, s*0.1, s*0.13, -0.4, 0, Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(s*0.2, s*0.38, s*0.1, s*0.13, 0.4, 0, Math.PI*2);
    ctx.fill();
    // 耳朵内侧（粉色）
    ctx.fillStyle = '#f9a8d4';
    ctx.beginPath();
    ctx.ellipse(-s*0.2, s*0.38, s*0.05, s*0.08, -0.4, 0, Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(s*0.2, s*0.38, s*0.05, s*0.08, 0.4, 0, Math.PI*2);
    ctx.fill();
    // 眼睛（红色发光）
    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 5;
    ctx.beginPath();
    ctx.arc(-s*0.08, s*0.45, s*0.04, 0, Math.PI*2);
    ctx.arc(s*0.08, s*0.45, s*0.04, 0, Math.PI*2);
    ctx.fill();
    ctx.shadowBlur = 0;
    // 门牙（两颗小尖牙）
    ctx.fillStyle = '#e8e0d0';
    ctx.beginPath();
    ctx.moveTo(-s*0.04, s*0.66);
    ctx.lineTo(-s*0.02, s*0.72);
    ctx.lineTo(0, s*0.66);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0, s*0.66);
    ctx.lineTo(s*0.02, s*0.72);
    ctx.lineTo(s*0.04, s*0.66);
    ctx.fill();
  }

  drawTank(ctx, s) {
    const flash = this.hitFlash > 0;
    const skin = flash ? '#fff' : '#8a7a8a';
    // 阴影
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(0, s*0.78, s*0.75, s*0.22, 0, 0, Math.PI*2);
    ctx.fill();
    // 肥大肚腩（灰紫色腐肉）
    ctx.fillStyle = this._zombieSkin(ctx, s, flash, '#9a8a9a', '#6a5a6a');
    ctx.beginPath();
    ctx.ellipse(0, s*0.15, s*0.72, s*0.62, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.strokeStyle = '#4a3a4a';
    ctx.lineWidth = 2;
    ctx.stroke();
    // 脂肪褶皱
    ctx.strokeStyle = flash ? '#ddd' : '#5a4a5a';
    ctx.lineWidth = 1.5;
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.ellipse(0, s*0.1 + i*s*0.2, s*0.55 - Math.abs(i)*s*0.1, s*0.1, 0, 0, Math.PI);
      ctx.stroke();
    }
    // 肚破洞（暴露内脏）
    ctx.fillStyle = '#7c2d12';
    ctx.beginPath();
    ctx.ellipse(-s*0.15, s*0.3, s*0.2, s*0.14, 0.3, 0, Math.PI*2);
    ctx.fill();
    // 肠子（盘绕悬挂）
    ctx.strokeStyle = flash ? '#fff' : '#991b1b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-s*0.2, s*0.35);
    ctx.quadraticCurveTo(-s*0.3, s*0.5, -s*0.15, s*0.55);
    ctx.quadraticCurveTo(-s*0.05, s*0.62, -s*0.12, s*0.72);
    ctx.quadraticCurveTo(-s*0.2, s*0.8, -s*0.1, s*0.85);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-s*0.08, s*0.32);
    ctx.quadraticCurveTo(0, s*0.5, -s*0.05, s*0.6);
    ctx.stroke();
    // 内脏血迹
    ctx.fillStyle = flash ? '#fff' : '#7f1d1d';
    ctx.beginPath();
    ctx.arc(-s*0.12, s*0.72, s*0.025, 0, Math.PI*2);
    ctx.fill();
    // 脖子粗短
    ctx.fillStyle = flash ? '#fff' : '#7a6a7a';
    ctx.fillRect(-s*0.18, -s*0.2, s*0.36, s*0.2);
    // 头（小，陷入脂肪）
    ctx.fillStyle = this._zombieSkin(ctx, s, flash, '#8a7a8a', '#6a5a6a');
    ctx.beginPath();
    ctx.arc(0, -s*0.42, s*0.26, 0, Math.PI*2);
    ctx.fill();
    ctx.strokeStyle = '#4a3a4a';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // 双下巴
    ctx.fillStyle = flash ? '#fff' : '#7a6a7a';
    ctx.beginPath();
    ctx.ellipse(0, -s*0.22, s*0.28, s*0.12, 0, 0, Math.PI*2);
    ctx.fill();
    // 眼睛（眯成缝，愤怒）
    ctx.fillStyle = '#1f2937';
    ctx.beginPath();
    ctx.ellipse(-s*0.1, -s*0.45, s*0.1, s*0.04, 0, 0, Math.PI*2);
    ctx.ellipse(s*0.1, -s*0.45, s*0.1, s*0.04, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = '#fca5a5';
    ctx.beginPath();
    ctx.arc(-s*0.1, -s*0.45, s*0.025, 0, Math.PI*2);
    ctx.arc(s*0.1, -s*0.45, s*0.025, 0, Math.PI*2);
    ctx.fill();
    // 嘴（流口水）
    ctx.fillStyle = '#1f2937';
    ctx.beginPath();
    ctx.ellipse(0, -s*0.3, s*0.16, s*0.08, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = '#a5f3fc';
    ctx.beginPath();
    ctx.ellipse(0, -s*0.22, s*0.04, s*0.08, 0, 0, Math.PI*2);
    ctx.fill();
    // 短粗手臂
    ctx.fillStyle = flash ? '#fff' : '#7a6a7a';
    ctx.beginPath();
    ctx.ellipse(-s*0.6, s*0.05, s*0.18, s*0.3, 0.4, 0, Math.PI*2);
    ctx.ellipse(s*0.6, s*0.05, s*0.18, s*0.3, -0.4, 0, Math.PI*2);
    ctx.fill();
  }

  drawBat(ctx, s) {
    const flash = this.hitFlash > 0;
    const t = Date.now() / 120;
    const wing = Math.sin(t) * 0.5 + 0.5;
    // 阴影
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(0, s*0.55, s*0.7, s*0.18, 0, 0, Math.PI*2);
    ctx.fill();
    // 翅膀（破烂的，有洞）
    ctx.fillStyle = flash ? '#fff' : '#5b21b6';
    ctx.beginPath();
    ctx.moveTo(0, -s*0.1);
    ctx.quadraticCurveTo(-s*0.5, -s*0.6 - wing*s*0.4, -s*0.95, -s*0.2);
    ctx.quadraticCurveTo(-s*0.7, s*0.05, -s*0.45, s*0.1);
    ctx.quadraticCurveTo(-s*0.55, -s*0.05, -s*0.3, -s*0.05);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0, -s*0.1);
    ctx.quadraticCurveTo(s*0.5, -s*0.6 - wing*s*0.4, s*0.95, -s*0.2);
    ctx.quadraticCurveTo(s*0.7, s*0.05, s*0.45, s*0.1);
    ctx.quadraticCurveTo(s*0.55, -s*0.05, s*0.3, -s*0.05);
    ctx.closePath();
    ctx.fill();
    // 翅膀破洞
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.arc(-s*0.5, -s*0.2, s*0.06, 0, Math.PI*2);
    ctx.arc(s*0.55, -s*0.15, s*0.05, 0, Math.PI*2);
    ctx.fill();
    // 身体
    ctx.fillStyle = flash ? '#fff' : '#4c1d95';
    ctx.beginPath();
    ctx.ellipse(0, 0, s*0.26, s*0.36, 0, 0, Math.PI*2);
    ctx.fill();
    // 耳朵（尖长）
    ctx.fillStyle = flash ? '#fff' : '#3b0764';
    ctx.beginPath();
    ctx.moveTo(-s*0.13, -s*0.28);
    ctx.lineTo(-s*0.22, -s*0.55);
    ctx.lineTo(-s*0.04, -s*0.32);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(s*0.13, -s*0.28);
    ctx.lineTo(s*0.22, -s*0.55);
    ctx.lineTo(s*0.04, -s*0.32);
    ctx.closePath();
    ctx.fill();
    // 眼睛（血红发光）
    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(-s*0.1, -s*0.06, s*0.06, 0, Math.PI*2);
    ctx.arc(s*0.1, -s*0.06, s*0.06, 0, Math.PI*2);
    ctx.fill();
    ctx.shadowBlur = 0;
    // 獠牙
    ctx.fillStyle = '#e8e0d0';
    ctx.beginPath();
    ctx.moveTo(-s*0.06, s*0.05);
    ctx.lineTo(-s*0.04, s*0.18);
    ctx.lineTo(-s*0.02, s*0.05);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(s*0.02, s*0.05);
    ctx.lineTo(s*0.04, s*0.18);
    ctx.lineTo(s*0.06, s*0.05);
    ctx.fill();
  }

  drawAcid(ctx, s) {
    const flash = this.hitFlash > 0;
    const t = Date.now() / 180;
    const skin = flash ? '#fff' : '#c2c878';
    const skinDark = flash ? '#fff' : '#8a8f45';
    // 阴影（佝偻，靠前）
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(s*0.05, s*0.62, s*0.58, s*0.18, 0, 0, Math.PI*2);
    ctx.fill();
    // 身体（病弱黄绿，佝偻前倾）
    ctx.fillStyle = this._zombieSkin(ctx, s, flash, '#c8cf70', '#8a8f45');
    ctx.beginPath();
    ctx.moveTo(-s*0.4, s*0.5);
    ctx.quadraticCurveTo(-s*0.5, s*0.0, -s*0.28, -s*0.2);
    ctx.quadraticCurveTo(-s*0.15, -s*0.35, s*0.05, -s*0.3);
    ctx.quadraticCurveTo(s*0.3, -s*0.25, s*0.35, s*0.1);
    ctx.quadraticCurveTo(s*0.4, s*0.45, s*0.15, s*0.58);
    ctx.quadraticCurveTo(-s*0.1, s*0.62, -s*0.4, s*0.5);
    ctx.fill();
    ctx.strokeStyle = '#5a6028';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // 酸烧伤疤（深褐色焦痕）
    ctx.fillStyle = flash ? '#fff' : '#5c3317';
    ctx.beginPath();
    ctx.ellipse(-s*0.18, s*0.05, s*0.12, s*0.07, -0.4, 0, Math.PI*2);
    ctx.ellipse(s*0.15, s*0.3, s*0.1, s*0.06, 0.3, 0, Math.PI*2);
    ctx.fill();
    // 酸液囊（腹部鼓起的透明酸袋，区别于毒气的圆身体）
    ctx.fillStyle = flash ? '#fff' : 'rgba(190,242,100,0.65)';
    ctx.beginPath();
    ctx.ellipse(s*0.02, s*0.28, s*0.3, s*0.22, 0.1, 0, Math.PI*2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(101,163,13,0.8)';
    ctx.lineWidth = 1;
    ctx.stroke();
    // 酸液气泡（在酸囊内翻滚）
    ctx.fillStyle = 'rgba(163,230,53,0.95)';
    for (let i = 0; i < 4; i++) {
      const bx = s*0.02 + Math.sin(t*1.3 + i*1.7) * s*0.18;
      const by = s*0.28 - ((t*10 + i*7) % (s*0.2));
      ctx.beginPath();
      ctx.arc(bx, by, s*0.04 + Math.sin(t+i)*s*0.015, 0, Math.PI*2);
      ctx.fill();
    }
    // 头（前倾，嘴朝下张）
    ctx.fillStyle = this._zombieSkin(ctx, s, flash, '#c8cf70', '#8a8f45');
    ctx.beginPath();
    ctx.ellipse(s*0.08, -s*0.42, s*0.26, s*0.28, 0.15, 0, Math.PI*2);
    ctx.fill();
    ctx.strokeStyle = '#5a6028';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // 眼睛（翻白眼，只露眼白+针尖瞳）
    ctx.fillStyle = '#f5f0e0';
    ctx.beginPath();
    ctx.ellipse(-s*0.05, -s*0.5, s*0.08, s*0.06, -0.2, 0, Math.PI*2);
    ctx.ellipse(s*0.2, -s*0.47, s*0.08, s*0.06, 0.2, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.arc(-s*0.05, -s*0.5, s*0.02, 0, Math.PI*2);
    ctx.arc(s*0.2, -s*0.47, s*0.02, 0, Math.PI*2);
    ctx.fill();
    // 嘴（大张朝下，正在呕吐酸液）
    ctx.fillStyle = '#1a2e05';
    ctx.beginPath();
    ctx.ellipse(s*0.12, -s*0.2, s*0.18, s*0.16, 0.2, 0, Math.PI*2);
    ctx.fill();
    // 酸液柱（从嘴喷出向下流）
    const acidAlpha = 0.75 + Math.sin(t*2)*0.2;
    ctx.fillStyle = `rgba(163,230,53,${acidAlpha})`;
    ctx.beginPath();
    ctx.moveTo(s*0.02, -s*0.08);
    ctx.quadraticCurveTo(s*0.18, s*0.1, s*0.12, s*0.42);
    ctx.quadraticCurveTo(s*0.06, s*0.1, s*0.22, -s*0.08);
    ctx.closePath();
    ctx.fill();
    // 酸液飞溅滴
    ctx.fillStyle = 'rgba(190,242,100,0.9)';
    for (let i = 0; i < 3; i++) {
      const dx = s*0.12 + Math.sin(t*1.5 + i*2)*s*0.08;
      const dy = s*0.45 + ((t*8 + i*10) % (s*0.2));
      ctx.beginPath();
      ctx.arc(dx, dy, s*0.035, 0, Math.PI*2);
      ctx.fill();
    }
    // 手臂（下垂，指尖滴酸）
    ctx.fillStyle = skinDark;
    ctx.beginPath();
    ctx.ellipse(-s*0.42, s*0.18, s*0.1, s*0.34, 0.35, 0, Math.PI*2);
    ctx.ellipse(s*0.42, s*0.18, s*0.1, s*0.34, -0.35, 0, Math.PI*2);
    ctx.fill();
    // 指尖酸液
    ctx.fillStyle = 'rgba(163,230,53,0.85)';
    ctx.beginPath();
    ctx.arc(-s*0.52, s*0.48, s*0.04, 0, Math.PI*2);
    ctx.arc(s*0.52, s*0.48, s*0.04, 0, Math.PI*2);
    ctx.fill();
  }

  drawGas(ctx, s) {
    const flash = this.hitFlash > 0;
    const t = Date.now() / 220;
    const skin = flash ? '#fff' : '#6b5a7a';
    const skinDark = flash ? '#fff' : '#3e2f4d';
    // 阴影（大圆身体）
    ctx.fillStyle = 'rgba(0,0,0,0.32)';
    ctx.beginPath();
    ctx.ellipse(0, s*0.62, s*0.72, s*0.2, 0, 0, Math.PI*2);
    ctx.fill();
    // 身体（极度圆鼓肿胀，像充饱毒气的气球）
    ctx.fillStyle = this._zombieSkin(ctx, s, flash, '#7a6a8a', '#3e2f4d');
    ctx.beginPath();
    ctx.ellipse(0, s*0.05, s*0.68, s*0.66, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.strokeStyle = '#2a1a3a';
    ctx.lineWidth = 2;
    ctx.stroke();
    // 皮下绿色毒血管（发光，区别于毒气格的普通绿）
    ctx.strokeStyle = flash ? '#fff' : '#84cc16';
    ctx.lineWidth = 1.5;
    ctx.shadowColor = '#84cc16';
    ctx.shadowBlur = 4;
    const veins = [
      [-0.3,-0.3,-0.5,0.0,-0.4,0.3],
      [0.3,-0.25,0.5,0.05,0.42,0.35],
      [0.0,-0.5,0.0,-0.2,0.05,0.1],
      [-0.15,0.4,-0.1,0.55,0.1,0.5]
    ];
    for (const v of veins) {
      ctx.beginPath();
      ctx.moveTo(v[0]*s, v[1]*s);
      ctx.quadraticCurveTo(v[2]*s, v[3]*s, v[4]*s, v[5]*s);
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
    // 身体排气阀（金属环，毒气从这里漏出）
    ctx.fillStyle = flash ? '#fff' : '#6b7280';
    ctx.beginPath();
    ctx.arc(-s*0.3, s*0.35, s*0.1, 0, Math.PI*2);
    ctx.arc(s*0.32, s*0.4, s*0.1, 0, Math.PI*2);
    ctx.fill();
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // 阀门中心（毒气泄漏孔）
    ctx.fillStyle = '#1a2e05';
    ctx.beginPath();
    ctx.arc(-s*0.3, s*0.35, s*0.05, 0, Math.PI*2);
    ctx.arc(s*0.32, s*0.4, s*0.05, 0, Math.PI*2);
    ctx.fill();
    // 毒气从阀门冒出（上升的绿色气泡）
    ctx.fillStyle = 'rgba(132,204,22,0.7)';
    for (let i = 0; i < 5; i++) {
      const baseX = i < 3 ? -s*0.3 : s*0.32;
      const bx = baseX + Math.sin(t + i)*s*0.08;
      const by = s*0.35 - ((t*9 + i*12) % (s*0.55));
      ctx.beginPath();
      ctx.arc(bx, by, s*0.05 + Math.sin(t*1.5+i)*s*0.02, 0, Math.PI*2);
      ctx.fill();
    }
    // 头部（肿胀，被防毒面具盖住下半脸）
    ctx.fillStyle = this._zombieSkin(ctx, s, flash, '#7a6a8a', '#3e2f4d');
    ctx.beginPath();
    ctx.arc(0, -s*0.45, s*0.32, 0, Math.PI*2);
    ctx.fill();
    ctx.strokeStyle = '#2a1a3a';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // 眼睛（凸出眼眶，毒气黄绿发光，布满血丝）
    ctx.fillStyle = `rgba(190,242,100,${0.85 + Math.sin(t*2)*0.15})`;
    ctx.shadowColor = '#bef264';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(-s*0.13, -s*0.52, s*0.1, 0, Math.PI*2);
    ctx.arc(s*0.13, -s*0.52, s*0.1, 0, Math.PI*2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 1;
    for (const ex of [-s*0.13, s*0.13]) {
      ctx.beginPath();
      ctx.moveTo(ex - s*0.08, -s*0.58);
      ctx.lineTo(ex - s*0.02, -s*0.52);
      ctx.moveTo(ex + s*0.08, -s*0.58);
      ctx.lineTo(ex + s*0.02, -s*0.52);
      ctx.stroke();
    }
    ctx.fillStyle = '#1a2e05';
    ctx.beginPath();
    ctx.arc(-s*0.13, -s*0.52, s*0.04, 0, Math.PI*2);
    ctx.arc(s*0.13, -s*0.52, s*0.04, 0, Math.PI*2);
    ctx.fill();
    // 防毒面具（覆盖口鼻，带滤毒罐）
    ctx.fillStyle = flash ? '#fff' : '#4b5563';
    ctx.beginPath();
    ctx.ellipse(0, -s*0.3, s*0.26, s*0.18, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // 面具镜片（眼眶部分透明）
    ctx.fillStyle = 'rgba(190,242,100,0.25)';
    ctx.beginPath();
    ctx.ellipse(-s*0.13, -s*0.38, s*0.06, s*0.05, 0, 0, Math.PI*2);
    ctx.ellipse(s*0.13, -s*0.38, s*0.06, s*0.05, 0, 0, Math.PI*2);
    ctx.fill();
    // 滤毒罐（面具下方的圆柱）
    ctx.fillStyle = flash ? '#fff' : '#374151';
    ctx.fillRect(-s*0.08, -s*0.2, s*0.16, s*0.14);
    ctx.strokeStyle = '#1f2937';
    ctx.strokeRect(-s*0.08, -s*0.2, s*0.16, s*0.14);
    // 滤毒罐网格
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 0.8;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(-s*0.08, -s*0.2 + (i+1)*s*0.035);
      ctx.lineTo(s*0.08, -s*0.2 + (i+1)*s*0.035);
      ctx.stroke();
    }
    // 面具漏气（从面具边缘冒毒气）
    ctx.fillStyle = 'rgba(132,204,22,0.6)';
    for (let i = 0; i < 2; i++) {
      const lx = -s*0.26 + i*s*0.52;
      const ly = -s*0.32 - ((t*6 + i*10) % (s*0.25));
      ctx.beginPath();
      ctx.arc(lx, ly, s*0.04, 0, Math.PI*2);
      ctx.fill();
    }
    // 短粗肿胀手臂
    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.ellipse(-s*0.62, s*0.1, s*0.18, s*0.28, 0.2, 0, Math.PI*2);
    ctx.ellipse(s*0.62, s*0.1, s*0.18, s*0.28, -0.2, 0, Math.PI*2);
    ctx.fill();
  }

  drawBoss(ctx, s) {
    const flash = this.hitFlash > 0;
    // 阴影
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.beginPath();
    ctx.ellipse(0, s*0.82, s*0.85, s*0.26, 0, 0, Math.PI*2);
    ctx.fill();
    // 身体（巨大腐烂丧尸王）
    ctx.fillStyle = this._zombieSkin(ctx, s, flash, '#7a4a4a', '#4a1a1a');
    ctx.beginPath();
    ctx.ellipse(0, s*0.15, s*0.8, s*0.7, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.strokeStyle = '#2a0a0a';
    ctx.lineWidth = 3;
    ctx.stroke();
    // 暴露的肋骨
    ctx.strokeStyle = flash ? '#fff' : '#3a1a1a';
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.arc(0, s*0.0 + i*s*0.16, s*0.5, -0.5, Math.PI + 0.5);
      ctx.stroke();
    }
    // 脖子
    ctx.fillStyle = flash ? '#fff' : '#5a2a2a';
    ctx.fillRect(-s*0.2, -s*0.35, s*0.4, s*0.3);
    // 头
    ctx.fillStyle = this._zombieSkin(ctx, s, flash, '#7a4a4a', '#4a1a1a');
    ctx.beginPath();
    ctx.arc(0, -s*0.55, s*0.4, 0, Math.PI*2);
    ctx.fill();
    ctx.strokeStyle = '#2a0a0a';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    // 王冠
    ctx.fillStyle = flash ? '#fff' : '#fbbf24';
    ctx.beginPath();
    ctx.moveTo(-s*0.3, -s*0.85);
    ctx.lineTo(-s*0.3, -s*0.65);
    ctx.lineTo(-s*0.15, -s*0.78);
    ctx.lineTo(0, -s*0.62);
    ctx.lineTo(s*0.15, -s*0.78);
    ctx.lineTo(s*0.3, -s*0.65);
    ctx.lineTo(s*0.3, -s*0.85);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // 王冠宝石
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(0, -s*0.72, s*0.05, 0, Math.PI*2);
    ctx.fill();
    // 多只眼睛（血红发光）
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 10;
    const eyes = [[-0.22,-0.55],[0.22,-0.55],[-0.12,-0.45],[0.12,-0.45]];
    for (const [ex,ey] of eyes) {
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(ex*s, ey*s, s*0.1, 0, Math.PI*2);
      ctx.fill();
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(ex*s, ey*s, s*0.05, 0, Math.PI*2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
    // 大嘴+多层尖牙
    ctx.fillStyle = '#1f2937';
    ctx.beginPath();
    ctx.ellipse(0, -s*0.25, s*0.32, s*0.2, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = '#e8e0d0';
    for (let i = -3; i <= 3; i++) {
      ctx.beginPath();
      ctx.moveTo(i*s*0.09 - s*0.035, -s*0.38);
      ctx.lineTo(i*s*0.09, -s*0.15);
      ctx.lineTo(i*s*0.09 + s*0.035, -s*0.38);
      ctx.fill();
    }
    // 巨臂
    ctx.fillStyle = flash ? '#fff' : '#5a2a2a';
    ctx.beginPath();
    ctx.ellipse(-s*0.75, s*0.1, s*0.22, s*0.45, 0.3, 0, Math.PI*2);
    ctx.ellipse(s*0.75, s*0.1, s*0.22, s*0.45, -0.3, 0, Math.PI*2);
    ctx.fill();
  }

  // 母体丧尸：巨型孕育体，腹部有跳动的孕育囊
  drawMother(ctx, s) {
    const flash = this.hitFlash > 0;
    const t = Date.now() / 100;
    const pulse = 0.85 + Math.sin(t * 1.5) * 0.15; // 孕育囊脉动
    // 阴影
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(0, s*0.78, s*0.72, s*0.2, 0, 0, Math.PI*2);
    ctx.fill();
    // 下肢（粗短腿，挪动）
    ctx.fillStyle = flash ? '#fff' : '#6b1d3a';
    ctx.beginPath();
    ctx.ellipse(-s*0.3, s*0.65, s*0.15, s*0.22, 0, 0, Math.PI*2);
    ctx.ellipse(s*0.3, s*0.65, s*0.15, s*0.22, 0, 0, Math.PI*2);
    ctx.fill();
    // 巨大腹部（孕育囊，半透明粉紫色，脉动）
    const bellyGrad = ctx.createRadialGradient(0, s*0.1, s*0.1, 0, s*0.1, s*0.65);
    if (flash) {
      bellyGrad.addColorStop(0, '#fff');
      bellyGrad.addColorStop(1, '#fff');
    } else {
      bellyGrad.addColorStop(0, `rgba(244,114,182,${0.9 * pulse})`);
      bellyGrad.addColorStop(0.6, `rgba(190,24,93,${0.85 * pulse})`);
      bellyGrad.addColorStop(1, 'rgba(131,24,67,0.95)');
    }
    ctx.fillStyle = bellyGrad;
    ctx.beginPath();
    ctx.ellipse(0, s*0.12, s*0.62, s*0.68, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.strokeStyle = flash ? '#fff' : '#831843';
    ctx.lineWidth = 2;
    ctx.stroke();
    // 腹部内胎儿轮廓（暗影）
    if (!flash) {
      ctx.fillStyle = 'rgba(80,10,40,0.5)';
      ctx.beginPath();
      ctx.ellipse(-s*0.12, s*0.1, s*0.12, s*0.2, 0.3, 0, Math.PI*2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(s*0.15, s*0.2, s*0.1, s*0.16, -0.2, 0, Math.PI*2);
      ctx.fill();
    }
    // 腹部脉动光晕
    if (!flash) {
      ctx.strokeStyle = `rgba(251,207,232,${0.4 * pulse})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(0, s*0.12, s*0.66, s*0.72, 0, 0, Math.PI*2);
      ctx.stroke();
    }
    // 上半身（腐肉，连接头部和腹部）
    ctx.fillStyle = flash ? '#fff' : this._zombieSkin(ctx, s, flash, '#9d5a7a', '#5c2a40');
    ctx.beginPath();
    ctx.ellipse(0, -s*0.35, s*0.38, s*0.3, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.strokeStyle = '#4a1d30';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // 两只肿胀手臂（前伸）
    ctx.fillStyle = flash ? '#fff' : '#833858';
    ctx.beginPath();
    ctx.ellipse(-s*0.45, -s*0.1, s*0.13, s*0.4, 0.4, 0, Math.PI*2);
    ctx.ellipse(s*0.45, -s*0.1, s*0.13, s*0.4, -0.4, 0, Math.PI*2);
    ctx.fill();
    // 头部（小，凹陷在肩膀间）
    ctx.fillStyle = flash ? '#fff' : this._zombieSkin(ctx, s, flash, '#9d5a7a', '#5c2a40');
    ctx.beginPath();
    ctx.ellipse(0, -s*0.55, s*0.22, s*0.2, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.strokeStyle = '#4a1d30';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // 空洞白眼（母性空洞）
    ctx.fillStyle = '#e8e0d0';
    ctx.beginPath();
    ctx.arc(-s*0.08, -s*0.58, s*0.05, 0, Math.PI*2);
    ctx.arc(s*0.08, -s*0.58, s*0.05, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.arc(-s*0.08, -s*0.58, s*0.02, 0, Math.PI*2);
    ctx.arc(s*0.08, -s*0.58, s*0.02, 0, Math.PI*2);
    ctx.fill();
    // 嘴（无声嘶吼）
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(0, -s*0.47, s*0.07, s*0.04, 0, 0, Math.PI*2);
    ctx.stroke();
    // 头顶两根触须（感知周围）
    ctx.strokeStyle = flash ? '#fff' : '#833858';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-s*0.1, -s*0.7);
    ctx.quadraticCurveTo(-s*0.25, -s*0.9, -s*0.15, -s*1.05);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(s*0.1, -s*0.7);
    ctx.quadraticCurveTo(s*0.25, -s*0.9, s*0.15, -s*1.05);
    ctx.stroke();
    // 触须尖端发光点
    ctx.fillStyle = '#f9a8d4';
    ctx.shadowColor = '#f9a8d4';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(-s*0.15, -s*1.05, s*0.035, 0, Math.PI*2);
    ctx.arc(s*0.15, -s*1.05, s*0.035, 0, Math.PI*2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  drawWarcry(ctx, s) {
    const flash = this.hitFlash > 0;
    const t = Date.now() / 120;
    const shoutOpen = 0.5 + Math.sin(t * 2) * 0.5; // 嘴巴开合（战吼）
    // 精英紫色光晕
    if (!flash) {
      const aura = ctx.createRadialGradient(0, 0, s * 0.3, 0, 0, s * 1.1);
      aura.addColorStop(0, 'rgba(168,85,247,0.25)');
      aura.addColorStop(1, 'rgba(168,85,247,0)');
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(0, 0, s * 1.1, 0, Math.PI * 2);
      ctx.fill();
    }
    // 阴影
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(0, s * 0.8, s * 0.7, s * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();
    // 粗壮下肢
    ctx.fillStyle = flash ? '#fff' : '#4c1d95';
    ctx.beginPath();
    ctx.ellipse(-s * 0.28, s * 0.65, s * 0.16, s * 0.24, 0, 0, Math.PI * 2);
    ctx.ellipse(s * 0.28, s * 0.65, s * 0.16, s * 0.24, 0, 0, Math.PI * 2);
    ctx.fill();
    // 巨大躯干（壮硕精英体格）
    const bodyGrad = ctx.createLinearGradient(0, -s * 0.4, 0, s * 0.6);
    if (flash) {
      bodyGrad.addColorStop(0, '#fff');
      bodyGrad.addColorStop(1, '#fff');
    } else {
      bodyGrad.addColorStop(0, '#7c3aed');
      bodyGrad.addColorStop(1, '#4c1d95');
    }
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.ellipse(0, s * 0.1, s * 0.55, s * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = flash ? '#fff' : '#3b0764';
    ctx.lineWidth = 2;
    ctx.stroke();
    // 胸口战吼符文（发光）
    if (!flash) {
      ctx.fillStyle = '#c084fc';
      ctx.shadowColor = '#a855f7';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.15);
      ctx.lineTo(s * 0.12, 0);
      ctx.lineTo(0, s * 0.15);
      ctx.lineTo(-s * 0.12, 0);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
    }
    // 粗壮手臂（前举，战吼姿态）
    ctx.fillStyle = flash ? '#fff' : '#5b21b6';
    ctx.beginPath();
    ctx.ellipse(-s * 0.5, -s * 0.05, s * 0.14, s * 0.35, 0.5, 0, Math.PI * 2);
    ctx.ellipse(s * 0.5, -s * 0.05, s * 0.14, s * 0.35, -0.5, 0, Math.PI * 2);
    ctx.fill();
    // 拳头
    ctx.fillStyle = flash ? '#fff' : '#3b0764';
    ctx.beginPath();
    ctx.arc(-s * 0.62, -s * 0.3, s * 0.1, 0, Math.PI * 2);
    ctx.arc(s * 0.62, -s * 0.3, s * 0.1, 0, Math.PI * 2);
    ctx.fill();
    // 头部（较大，精英面容）
    ctx.fillStyle = flash ? '#fff' : '#6d28d9';
    ctx.beginPath();
    ctx.ellipse(0, -s * 0.5, s * 0.28, s * 0.26, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = flash ? '#fff' : '#3b0764';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // 发光双眼（愤怒红光）
    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(-s * 0.1, -s * 0.55, s * 0.045, 0, Math.PI * 2);
    ctx.arc(s * 0.1, -s * 0.55, s * 0.045, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    // 张大的嘴（战吼，随时间开合）
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.ellipse(0, -s * 0.38, s * 0.16, s * 0.1 * shoutOpen + s * 0.04, 0, 0, Math.PI * 2);
    ctx.fill();
    // 尖牙
    ctx.fillStyle = '#e8e0d0';
    ctx.beginPath();
    ctx.moveTo(-s * 0.1, -s * 0.42);
    ctx.lineTo(-s * 0.07, -s * 0.32);
    ctx.lineTo(-s * 0.04, -s * 0.42);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(s * 0.1, -s * 0.42);
    ctx.lineTo(s * 0.07, -s * 0.32);
    ctx.lineTo(s * 0.04, -s * 0.42);
    ctx.fill();
    // 头顶精英角/冠
    ctx.fillStyle = flash ? '#fff' : '#7c3aed';
    ctx.strokeStyle = flash ? '#fff' : '#3b0764';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-s * 0.18, -s * 0.68);
    ctx.lineTo(-s * 0.25, -s * 0.95);
    ctx.lineTo(-s * 0.08, -s * 0.72);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(s * 0.18, -s * 0.68);
    ctx.lineTo(s * 0.25, -s * 0.95);
    ctx.lineTo(s * 0.08, -s * 0.72);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
  }

  drawRatNest(ctx, s) {
    const flash = this.hitFlash > 0;
    const t = Date.now() / 100;
    const pulse = 0.85 + Math.sin(t * 1.2) * 0.15; // 巢穴活性脉动
    // 阴影
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(0, s * 0.8, s * 0.85, s * 0.22, 0, 0, Math.PI * 2);
    ctx.fill();
    // 外围土堆（棕色环形隆起）
    const moundGrad = ctx.createRadialGradient(0, 0, s * 0.3, 0, 0, s * 0.9);
    if (flash) {
      moundGrad.addColorStop(0, '#fff');
      moundGrad.addColorStop(1, '#fff');
    } else {
      moundGrad.addColorStop(0, '#92400e');
      moundGrad.addColorStop(0.6, '#78350f');
      moundGrad.addColorStop(1, '#451a03');
    }
    ctx.fillStyle = moundGrad;
    ctx.beginPath();
    ctx.ellipse(0, s * 0.1, s * 0.85, s * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = flash ? '#fff' : '#3f1d04';
    ctx.lineWidth = 2;
    ctx.stroke();
    // 土堆上的碎石/泥土颗粒
    if (!flash) {
      ctx.fillStyle = 'rgba(63,29,4,0.6)';
      const pebbles = [[-0.5,0.2,0.06],[0.45,-0.1,0.05],[-0.3,-0.4,0.04],[0.5,0.4,0.05],[-0.55,0.5,0.04]];
      for (const [px, py, pr] of pebbles) {
        ctx.beginPath();
        ctx.arc(px * s, py * s, pr * s, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // 中央黑洞（巢穴入口，深邃）
    const holeGrad = ctx.createRadialGradient(0, s * 0.1, s * 0.05, 0, s * 0.1, s * 0.55);
    holeGrad.addColorStop(0, '#000000');
    holeGrad.addColorStop(0.7, '#1a0f08');
    holeGrad.addColorStop(1, '#2a1810');
    ctx.fillStyle = holeGrad;
    ctx.beginPath();
    ctx.ellipse(0, s * 0.12, s * 0.5, s * 0.42, 0, 0, Math.PI * 2);
    ctx.fill();
    // 洞口活性光晕（脉动，表明正在孕育）
    if (!flash) {
      ctx.strokeStyle = `rgba(250,204,21,${0.35 * pulse})`;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(0, s * 0.12, s * 0.52, s * 0.44, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    // 洞口内窥视的红色鼠眼（成对，随脉动明暗）
    if (!flash) {
      const eyeAlpha = 0.6 + 0.4 * pulse;
      ctx.fillStyle = `rgba(239,68,68,${eyeAlpha})`;
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 5;
      ctx.beginPath();
      ctx.arc(-s * 0.14, s * 0.05, s * 0.05, 0, Math.PI * 2);
      ctx.arc(s * 0.14, s * 0.05, s * 0.05, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      // 眼睛高光
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.beginPath();
      ctx.arc(-s * 0.12, s * 0.03, s * 0.018, 0, Math.PI * 2);
      ctx.arc(s * 0.16, s * 0.03, s * 0.018, 0, Math.PI * 2);
      ctx.fill();
    }
    // 洞口边缘探出的鼠爪/轮廓（暗示有鼠）
    if (!flash) {
      ctx.fillStyle = '#3f2a1a';
      ctx.beginPath();
      ctx.ellipse(-s * 0.3, s * 0.32, s * 0.08, s * 0.05, -0.4, 0, Math.PI * 2);
      ctx.ellipse(s * 0.32, s * 0.3, s * 0.08, s * 0.05, 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// ============== 投射物 ==============
class Projectile {
  constructor(x, y, target, unit, targetCell, pierceDir, shotgun) {
    this.x = x; this.y = y;
    this.startX = x; this.startY = y;
    this.target = target;
    this.aoe = !!unit.cfg.aoe;
    this.aoeStraight = !!unit.cfg.aoeStraight; // 直线AOE（寒冰塔：冰弹直线飞行后爆炸）
    this.color = unit.cfg.color;
    this.freeze = unit.cfg.freeze || null; // 冰冻配置 {slowFactor, duration}
    this.pierce = !!unit.cfg.pierce;
    this.pierceDir = pierceDir || null; // 穿透方向 {x, y}
    this.pierceHit = new Set(); // 已命中的怪物，避免重复伤害
    this.shotgun = !!shotgun; // 霰弹弹丸：直线飞行，命中首怪消失
    this.alive = true;
    // 武器类型（英雄继承 baseClass）
    this.atkClass = unit.cfg.baseClass || unit.type;
    this.size = this.aoe ? 6 : 4;
    this.trail = [];
    // 霰弹弹丸：每颗伤害直接等于攻击力（atk即单颗弹丸伤害），飞向射程尽头固定点（不追踪）
    if (this.shotgun) {
      this.damage = unit.atk;
      this.targetCell = null;
      this.lastX = x + this.pierceDir.x * unit.range * CONFIG.cellW;
      this.lastY = y + this.pierceDir.y * unit.range * CONFIG.cellH;
    } else {
      this.damage = unit.atk;
      // targetCell：散射弹模式，飞向固定格子中心而非追踪怪物
      this.targetCell = targetCell || null;
      if (this.targetCell) {
        const c = cellCenter(this.targetCell.col, this.targetCell.row);
        this.lastX = c.x;
        this.lastY = c.y;
      } else if (this.pierce && this.pierceDir) {
        // 穿透弹：飞向射程尽头的固定点（不追踪）
        this.lastX = x + this.pierceDir.x * unit.range * CONFIG.cellW;
        this.lastY = y + this.pierceDir.y * unit.range * CONFIG.cellH;
      } else {
        this.lastX = target.x;
        this.lastY = target.y;
        this.lastCol = target.col;
        this.lastRow = target.row;
      }
    }
    // 抛物线弹道参数（直线AOE不走抛物线）
    this.arcHeight = (this.aoe && !this.aoeStraight) ? 80 : 0;
    this.progress = 0;
    // 按武器类型差异化速度
    const speedMap = { sniper:1400, crossbow:620, icemage:620, mg:560, rifle:520, shotgun:500, outpost:460 };
    this.speed = (this.aoe && !this.aoeStraight) ? 260 : (speedMap[this.atkClass] || 480);
    // 按武器类型差异化拖尾长度
    const trailMap = { sniper:12, crossbow:9, icemage:9, mg:7, rifle:6 };
    this.maxTrail = trailMap[this.atkClass] || 5;
    this.totalDist = Math.hypot(this.lastX - x, this.lastY - y);
  }
  update(dt) {
    if (!this.alive) return;
    // 目标存活：追踪目标并记录最后位置（散射弹/穿透弹/霰弹弹丸不追踪）
    if (this.target && this.target.alive && !this.targetCell && !this.pierce && !this.shotgun) {
      this.lastX = this.target.x;
      this.lastY = this.target.y;
      this.lastCol = this.target.col;
      this.lastRow = this.target.row;
    }
    const tx = this.lastX, ty = this.lastY;
    const dx = tx - this.x;
    const dy = ty - this.y;
    const d = Math.hypot(dx, dy);
    const step = this.speed * dt;

    if (this.aoe && !this.aoeStraight) {
      // 抛物线弹道：沿直线推进，高度用 sin 曲线
      this.progress += step / Math.max(1, this.totalDist);
      this.progress = Math.min(1, this.progress);
      this.x = this.startX + (tx - this.startX) * this.progress;
      this.y = this.startY + (ty - this.startY) * this.progress;
      if (this.progress >= 1) {
        this.explode();
        return;
      }
    } else {
      // 直线弹道（含直线AOE冰弹）
      if (d <= step) {
        if (this.aoeStraight) {
          // 直线AOE：到达目标后爆炸（十字5格伤害+减速）
          this.explode();
          return;
        } else if (this.shotgun) {
          // 霰弹弹丸到达最大射程，未命中则消失
          this.alive = false;
          return;
        } else if (this.targetCell) {
          // 散射弹：对目标格内的怪物造成伤害
          this.hitCell();
        } else if (this.pierce) {
          // 穿透弹到达射程尽头，消失
          this.alive = false;
          return;
        } else if (this.target && this.target.alive) {
          this.target.takeDamage(this.damage);
          // 命中火花
          Game.effects.push(new ImpactSpark(this.target.x, this.target.y, this.color));
          // 狙击命中：红色冲击波
          if (this.atkClass === 'sniper') {
            Game.effects.push(new ShockwaveEffect(this.target.x, this.target.y, '#ef4444'));
          }
          // 冰冻效果：减速
          if (this.freeze) {
            this.target.applySlow(this.freeze.slowFactor, this.freeze.duration);
            Game.effects.push(new FreezeEffect(this.target.x, this.target.y));
          }
        }
        this.alive = false;
        return;
      } else {
        this.x += (dx/d)*step;
        this.y += (dy/d)*step;
        // 穿透弹：检测路径上的所有怪物，每个只命中一次
        if (this.pierce) {
          for (const m of Game.monsters) {
            if (!m.alive) continue;
            if (this.pierceHit.has(m)) continue;
            if (dist(m, this) <= (m.cfg.size || 16) + this.size + 4) {
              m.takeDamage(this.damage);
              this.pierceHit.add(m);
              // 冰法师穿透：对命中的怪物施加减速
              if (this.freeze) {
                m.applySlow(this.freeze.slowFactor, this.freeze.duration);
                Game.effects.push(new FreezeEffect(m.x, m.y));
              }
              // 穿透命中火花
              Game.effects.push(new ImpactSpark(m.x, m.y, this.color));
            }
          }
        }
        // 霰弹弹丸：命中路径上第一个怪物后消失
        if (this.shotgun) {
          for (const m of Game.monsters) {
            if (!m.alive) continue;
            if (dist(m, this) <= (m.cfg.size || 16) + this.size + 2) {
              m.takeDamage(this.damage);
              Game.effects.push(new ImpactSpark(m.x, m.y, this.color));
              this.alive = false;
              break;
            }
          }
        }
      }
    }
    this.trail.push({x:this.x, y:this.y});
    if (this.trail.length > this.maxTrail) this.trail.shift();
  }
  explode() {
    // 用实际像素坐标计算爆炸中心格（避免 col/row 滞后）
    const center = pxToCell(this.lastX, this.lastY);
    const cells = [];
    if (center) {
      const { col: cx, row: cy } = center;
      cells.push([cx,cy],[cx+1,cy],[cx-1,cy],[cx,cy+1],[cx,cy-1]);
    }
    // 用怪物实际像素坐标判断所在格子
    for (const m of Game.monsters) {
      if (!m.alive) continue;
      const mc = pxToCell(m.x, m.y);
      if (!mc) continue;
      for (const [c, r] of cells) {
        if (mc.col === c && mc.row === r) {
          m.takeDamage(this.damage);
          // AOE冰冻：范围内所有怪物减速
          if (this.freeze) {
            m.applySlow(this.freeze.slowFactor, this.freeze.duration);
            Game.effects.push(new FreezeEffect(m.x, m.y));
          }
          break;
        }
      }
    }
    // 爆炸特效：冰冻AOE用冰爆特效，否则火焰爆炸
    if (this.freeze) {
      Game.effects.push(new FreezeEffect(this.lastX, this.lastY));
    } else {
      Game.effects.push(new ExplosionEffect(this.lastX, this.lastY));
    }
    this.alive = false;
  }
  // 散射弹/冰冻弹命中：对目标格内的所有怪物造成伤害
  hitCell() {
    const { col: tc, row: tr } = this.targetCell;
    const c = cellCenter(tc, tr);
    let hit = false;
    for (const m of Game.monsters) {
      if (!m.alive) continue;
      const mc = pxToCell(m.x, m.y);
      if (mc && mc.col === tc && mc.row === tr) {
        m.takeDamage(this.damage);
        Game.effects.push(new ImpactSpark(m.x, m.y, this.color));
        // 冰冻效果：减速
        if (this.freeze) {
          m.applySlow(this.freeze.slowFactor, this.freeze.duration);
        }
        hit = true;
      }
    }
    // 冰冻特效（无论是否命中都显示在目标格）
    if (this.freeze) {
      Game.effects.push(new FreezeEffect(c.x, c.y));
    }
  }
  draw(ctx) {
    // 拖尾
    for (let i = 0; i < this.trail.length; i++) {
      const t = this.trail[i];
      const ratio = i / this.trail.length;
      ctx.globalAlpha = ratio * 0.5;
      // 狙击手：红→橙渐变拖尾，拉长
      if (this.atkClass === 'sniper') {
        ctx.fillStyle = ratio > 0.5 ? '#fbbf24' : '#ef4444';
      } else {
        ctx.fillStyle = this.color;
      }
      ctx.beginPath();
      ctx.arc(t.x, t.y, this.size * ratio, 0, Math.PI*2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    if (this.aoe) {
      // 榴弹：带阴影的圆形，模拟高度
      const arcOff = Math.sin(this.progress * Math.PI) * this.arcHeight * 0.3;
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.beginPath();
      ctx.ellipse(this.x, this.y + 6, this.size, this.size*0.4, 0, 0, Math.PI*2);
      ctx.fill();
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y - arcOff, this.size, 0, Math.PI*2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(this.x - 1.5, this.y - arcOff - 1.5, 1.5, 0, Math.PI*2);
      ctx.fill();
    } else if (this.atkClass === 'sniper') {
      // 狙击手：拉长的红色激光弹
      const dx = this.lastX - this.x, dy = this.lastY - this.y;
      const angle = Math.atan2(dy, dx);
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(angle);
      // 外层红光
      ctx.fillStyle = 'rgba(239,68,68,0.5)';
      ctx.beginPath();
      ctx.ellipse(0, 0, 10, 3, 0, 0, Math.PI*2);
      ctx.fill();
      // 核心亮黄
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.ellipse(0, 0, 7, 1.8, 0, 0, Math.PI*2);
      ctx.fill();
      ctx.restore();
    } else if (this.atkClass === 'crossbow') {
      // 弩手：三角形箭矢
      const angle = this.pierceDir ? Math.atan2(this.pierceDir.y, this.pierceDir.x) : Math.atan2(this.lastY - this.y, this.lastX - this.x);
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(angle);
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.moveTo(8, 0);
      ctx.lineTo(-5, -4);
      ctx.lineTo(-3, 0);
      ctx.lineTo(-5, 4);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.moveTo(4, 0);
      ctx.lineTo(-1, -1.5);
      ctx.lineTo(-1, 1.5);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    } else {
      // 普通弹丸：圆形
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI*2);
      ctx.fill();
      // 高光
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.beginPath();
      ctx.arc(this.x - this.size*0.3, this.y - this.size*0.3, this.size*0.35, 0, Math.PI*2);
      ctx.fill();
    }
  }
}

// 枪口火光：开火瞬间的星形闪光
class MuzzleFlash {
  constructor(x, y, angle, color) {
    this.x = x; this.y = y; this.angle = angle; this.color = color;
    this.life = 0.09; this.maxLife = 0.09;
  }
  update(dt) { this.life -= dt; }
  get alive() { return this.life > 0; }
  draw(ctx) {
    const t = this.life / this.maxLife;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.globalAlpha = t;
    const r = 7 + (1 - t) * 5;
    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
    grad.addColorStop(0, 'rgba(255,255,210,0.95)');
    grad.addColorStop(0.4, this.color);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
    ctx.globalAlpha = 1;
  }
}

// 命中火花：子弹命中时的小型粒子飞溅
class ImpactSpark {
  constructor(x, y, color) {
    this.x = x; this.y = y; this.color = color;
    this.particles = [];
    const count = 6;
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 80 + Math.random() * 100;
      this.particles.push({
        x, y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        size: 1.5 + Math.random() * 2,
        life: 0.2 + Math.random() * 0.15
      });
    }
  }
  update(dt) {
    for (const p of this.particles) {
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.vx *= 0.92; p.vy *= 0.92;
      p.life -= dt;
    }
    this.particles = this.particles.filter(p => p.life > 0);
  }
  get alive() { return this.particles.length > 0; }
  draw(ctx) {
    for (const p of this.particles) {
      ctx.globalAlpha = Math.min(1, p.life * 4);
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}

// 冲击波：扩散圆环（用于狙击命中、爆炸等）
class ShockwaveEffect {
  constructor(x, y, color) {
    this.x = x; this.y = y; this.color = color;
    this.life = 0.35; this.maxLife = 0.35;
  }
  update(dt) { this.life -= dt; }
  get alive() { return this.life > 0; }
  draw(ctx) {
    const t = 1 - this.life / this.maxLife;
    const radius = 6 + t * CONFIG.cellW * 1.1;
    ctx.globalAlpha = (1 - t) * 0.8;
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 3 * (1 - t);
    ctx.beginPath();
    ctx.arc(this.x, this.y, radius, 0, Math.PI*2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
}

// 伤害飘字：玩家单位受击时弹出，向上漂浮并淡出（仅玩家单位，怪物不显示）
class DamageTextEffect {
  constructor(x, y, dmg) {
    this.x = x + (Math.random() - 0.5) * 16;
    this.y = y - 10;
    this.dmg = Math.round(dmg);
    this.life = 0.8;
    this.maxLife = 0.8;
  }
  update(dt) {
    this.life -= dt;
    this.y -= 28 * dt;
  }
  get alive() { return this.life > 0; }
  draw(ctx) {
    const t = 1 - this.life / this.maxLife;
    ctx.globalAlpha = Math.max(0, this.life / this.maxLife);
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // 描边
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(0,0,0,0.8)';
    ctx.strokeText('-' + this.dmg, this.x, this.y);
    // 填充：按伤害量分级颜色
    let color = '#f87171';
    if (this.dmg >= 50) color = '#ef4444';
    if (this.dmg >= 100) color = '#dc2626';
    ctx.fillStyle = color;
    ctx.fillText('-' + this.dmg, this.x, this.y);
    ctx.globalAlpha = 1;
  }
}

// Boss 死亡特效：巨型爆炸 + 多色粒子 + 冲击波
class BossDeathEffect {
  constructor(x, y) {
    this.x = x; this.y = y;
    this.life = 1.0;
    this.maxLife = 1.0;
    this.particles = [];
    for (let i = 0; i < 30; i++) {
      const angle = (i / 30) * Math.PI * 2 + Math.random() * 0.4;
      const speed = 80 + Math.random() * 140;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 4,
        color: ['#dc2626', '#f97316', '#fbbf24', '#a855f7'][Math.floor(Math.random()*4)],
        life: 0.6 + Math.random() * 0.4
      });
    }
  }
  update(dt) {
    this.life -= dt;
    for (const p of this.particles) {
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.vy += 150 * dt;
      p.life -= dt;
    }
    this.particles = this.particles.filter(p => p.life > 0);
  }
  get alive() { return this.life > 0 || this.particles.length > 0; }
  draw(ctx) {
    const t = 1 - this.life / this.maxLife;
    // 扩散光环
    if (this.life > 0) {
      ctx.globalAlpha = Math.max(0, this.life / this.maxLife) * 0.7;
      const radius = CONFIG.cellW * 0.8 + t * CONFIG.cellW * 2.5;
      const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, radius);
      grad.addColorStop(0, 'rgba(255,240,150,0.9)');
      grad.addColorStop(0.3, 'rgba(249,115,22,0.6)');
      grad.addColorStop(0.6, 'rgba(220,38,38,0.4)');
      grad.addColorStop(1, 'rgba(168,85,247,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
      ctx.fill();
      // 白色闪光
      if (t < 0.3) {
        ctx.globalAlpha = (0.3 - t) / 0.3;
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 20 + t * 40, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
    // 粒子
    for (const p of this.particles) {
      ctx.globalAlpha = Math.min(1, p.life / 0.4);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}

// 精英怪物死亡特效：中等规模爆裂 + 粒子
class EliteDeathEffect {
  constructor(x, y, color) {
    this.x = x; this.y = y;
    this.color = color || '#a855f7';
    this.life = 0.6;
    this.maxLife = 0.6;
    this.particles = [];
    for (let i = 0; i < 18; i++) {
      const angle = (i / 18) * Math.PI * 2 + Math.random() * 0.3;
      const speed = 50 + Math.random() * 90;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 3,
        life: 0.4 + Math.random() * 0.25
      });
    }
  }
  update(dt) {
    this.life -= dt;
    for (const p of this.particles) {
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.vy += 120 * dt;
      p.life -= dt;
    }
    this.particles = this.particles.filter(p => p.life > 0);
  }
  get alive() { return this.life > 0 || this.particles.length > 0; }
  draw(ctx) {
    const t = 1 - this.life / this.maxLife;
    if (this.life > 0) {
      ctx.globalAlpha = Math.max(0, this.life / this.maxLife) * 0.6;
      const radius = CONFIG.cellW * 0.4 + t * CONFIG.cellW * 1.3;
      const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, radius);
      grad.addColorStop(0, this.color);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    for (const p of this.particles) {
      ctx.globalAlpha = Math.min(1, p.life / 0.3);
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}

class HealEffect {
  constructor(x, y) { this.x=x; this.y=y; this.life=0.4; this.maxLife=0.4; }
  update(dt) { this.life -= dt; }
  get alive() { return this.life > 0; }
  draw(ctx) {
    ctx.globalAlpha = this.life/this.maxLife;
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 8 + (1-this.life/this.maxLife)*12, 0, Math.PI*2);
    ctx.stroke();
    ctx.fillStyle = '#22c55e';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('+', this.x, this.y - (1-this.life/this.maxLife)*15);
    ctx.globalAlpha = 1;
  }
}

// 修复特效：绿色上升扳手图标 + 圆环
class RepairEffect {
  constructor(x, y) { this.x=x; this.y=y; this.life=0.35; this.maxLife=0.35; }
  update(dt) { this.life -= dt; }
  get alive() { return this.life > 0; }
  draw(ctx) {
    const p = 1 - this.life/this.maxLife;
    ctx.globalAlpha = this.life/this.maxLife;
    ctx.strokeStyle = '#84cc16';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 6 + p*10, 0, Math.PI*2);
    ctx.stroke();
    ctx.fillStyle = '#84cc16';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🔧', this.x, this.y - p*14);
    ctx.globalAlpha = 1;
  }
}

// 爆炸特效：扩散火球 + 十字冲击 + 碎片粒子
class ExplosionEffect {
  constructor(x, y) {
    this.x = x; this.y = y;
    this.life = 0.5;
    this.maxLife = 0.5;
    // 碎片粒子
    this.particles = [];
    const count = 14;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.3;
      const speed = 60 + Math.random() * 80;
      this.particles.push({
        x: x, y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 3,
        color: Math.random() > 0.5 ? '#f97316' : '#fbbf24',
        life: 0.4 + Math.random() * 0.2
      });
    }
  }
  update(dt) {
    this.life -= dt;
    for (const p of this.particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 120 * dt; // 碎片受重力下落
      p.life -= dt;
    }
    this.particles = this.particles.filter(p => p.life > 0);
  }
  get alive() { return this.life > 0 || this.particles.length > 0; }
  draw(ctx) {
    const t = 1 - this.life / this.maxLife; // 0→1
    // 中心闪光
    if (this.life > 0) {
      ctx.globalAlpha = Math.max(0, this.life / this.maxLife);
      // 外层扩散圆
      const radius = CONFIG.cellW * 0.6 + t * CONFIG.cellW * 1.2;
      const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, radius);
      grad.addColorStop(0, 'rgba(255,240,150,0.9)');
      grad.addColorStop(0.4, 'rgba(249,115,22,0.6)');
      grad.addColorStop(1, 'rgba(220,38,38,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(this.x, this.y, radius, 0, Math.PI*2);
      ctx.fill();
      // 十字冲击波
      ctx.strokeStyle = 'rgba(251,191,36,0.5)';
      ctx.lineWidth = 3;
      const cr = CONFIG.cellW * (0.5 + t * 0.8);
      ctx.beginPath();
      ctx.moveTo(this.x - cr, this.y); ctx.lineTo(this.x + cr, this.y);
      ctx.moveTo(this.x, this.y - cr); ctx.lineTo(this.x, this.y + cr);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    // 碎片粒子
    for (const p of this.particles) {
      ctx.globalAlpha = Math.min(1, p.life * 2.5);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}

// 冰冻特效：冰晶扩散 + 雪花粒子
class FreezeEffect {
  constructor(x, y) {
    this.x = x; this.y = y;
    this.life = 0.6;
    this.maxLife = 0.6;
    this.particles = [];
    const count = 10;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.4;
      const speed = 40 + Math.random() * 60;
      this.particles.push({
        x: x, y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 20,
        size: 2 + Math.random() * 3,
        life: 0.5 + Math.random() * 0.3
      });
    }
  }
  update(dt) {
    this.life -= dt;
    for (const p of this.particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 60 * dt;
      p.life -= dt;
    }
    this.particles = this.particles.filter(p => p.life > 0);
  }
  get alive() { return this.life > 0 || this.particles.length > 0; }
  draw(ctx) {
    const t = 1 - this.life / this.maxLife;
    if (this.life > 0) {
      ctx.globalAlpha = Math.max(0, this.life / this.maxLife) * 0.8;
      // 扩散冰圈
      const radius = CONFIG.cellW * 0.3 + t * CONFIG.cellW * 0.7;
      ctx.strokeStyle = '#7dd3fc';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(this.x, this.y, radius, 0, Math.PI*2);
      ctx.stroke();
      // 中心冰晶
      ctx.fillStyle = 'rgba(186,230,253,0.6)';
      ctx.beginPath();
      ctx.arc(this.x, this.y, CONFIG.cellW * 0.35 * (1 - t * 0.5), 0, Math.PI*2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    // 雪花粒子
    for (const p of this.particles) {
      ctx.globalAlpha = Math.min(1, p.life * 2.5);
      ctx.fillStyle = '#e0f2fe';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
      ctx.fill();
      ctx.strokeStyle = '#7dd3fc';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
}

// 战吼声波特效：紫色扩散圆环 + 音波粒子
class WarcryWave {
  constructor(x, y, maxRadius) {
    this.x = x; this.y = y;
    this.maxRadius = maxRadius;
    this.life = 0.7;
    this.maxLife = 0.7;
  }
  update(dt) { this.life -= dt; }
  get alive() { return this.life > 0; }
  draw(ctx) {
    const t = 1 - this.life / this.maxLife;
    ctx.globalAlpha = Math.max(0, this.life / this.maxLife);
    // 外层扩散圆环
    const r = this.maxRadius * t;
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 4 * (1 - t * 0.5);
    ctx.shadowColor = '#a855f7';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
    ctx.stroke();
    // 内层圆环
    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(this.x, this.y, r * 0.65, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
    // 中心爆发光
    ctx.globalAlpha = Math.max(0, this.life / this.maxLife) * 0.6;
    const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, CONFIG.cellW * 0.6);
    g.addColorStop(0, 'rgba(168,85,247,0.8)');
    g.addColorStop(1, 'rgba(168,85,247,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(this.x, this.y, CONFIG.cellW * 0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

// 闪电链特效：沿路径绘制曲折闪电，带发光与末端火花
class LightningEffect {
  constructor(path, color) {
    this.path = path; // [{x,y}, ...]
    this.color = color || '#a855f7';
    this.life = 0.22;
    this.maxLife = 0.22;
    // 为每段预先生成锯齿偏移（固定随机，避免每帧抖动）
    this.segments = [];
    for (let i = 0; i < path.length - 1; i++) {
      const a = path[i], b = path[i + 1];
      const segs = this.buildBolt(a, b);
      this.segments.push(segs);
    }
    // 每个命中点的小火花
    this.sparks = [];
    for (let i = 1; i < path.length; i++) {
      const p = path[i];
      const parts = [];
      const cnt = 5;
      for (let k = 0; k < cnt; k++) {
        const ang = Math.random() * Math.PI * 2;
        const sp = 50 + Math.random() * 70;
        parts.push({
          x: p.x, y: p.y,
          vx: Math.cos(ang) * sp,
          vy: Math.sin(ang) * sp,
          size: 1.5 + Math.random() * 1.5,
          life: 0.15 + Math.random() * 0.12
        });
      }
      this.sparks.push({ x: p.x, y: p.y, parts });
    }
  }
  // 在两点间生成一条锯齿折线路径
  buildBolt(a, b) {
    const dx = b.x - a.x, dy = b.y - a.y;
    const len = Math.hypot(dx, dy);
    const segs = Math.max(3, Math.floor(len / 14));
    const points = [];
    const nx = -dy / (len || 1), ny = dx / (len || 1);
    for (let i = 0; i <= segs; i++) {
      const t = i / segs;
      const bx = a.x + dx * t;
      const by = a.y + dy * t;
      let off = 0;
      if (i !== 0 && i !== segs) off = (Math.random() - 0.5) * 10;
      points.push({ x: bx + nx * off, y: by + ny * off });
    }
    return points;
  }
  update(dt) {
    this.life -= dt;
    for (const s of this.sparks) {
      for (const p of s.parts) {
        p.x += p.vx * dt; p.y += p.vy * dt;
        p.vx *= 0.9; p.vy *= 0.9;
        p.life -= dt;
      }
    }
  }
  get alive() { return this.life > 0; }
  draw(ctx) {
    const t = Math.max(0, this.life / this.maxLife);
    ctx.save();
    ctx.globalAlpha = t;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    // 外层光晕（粗）
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 14;
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 5;
    for (const pts of this.segments) {
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
      ctx.stroke();
    }
    // 内层亮白核心
    ctx.shadowBlur = 6;
    ctx.strokeStyle = '#f5f3ff';
    ctx.lineWidth = 2;
    for (const pts of this.segments) {
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
      ctx.stroke();
    }
    ctx.restore();
    // 命中点火花
    for (const s of this.sparks) {
      for (const p of s.parts) {
        if (p.life <= 0) continue;
        ctx.globalAlpha = Math.min(1, p.life * 5) * t;
        ctx.fillStyle = '#fde68a';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }
}

// 扇形斩击特效：135度扇形扩散+渐隐
class SlashEffect {
  constructor(x, y, centerAngle, color) {
    this.x = x; this.y = y;
    this.centerAngle = centerAngle;
    this.life = 0.28;
    this.maxLife = 0.28;
    this.sweep = 3 * Math.PI / 4; // 135度扇形（覆盖连续3格）
  }
  update(dt) { this.life -= dt; }
  get alive() { return this.life > 0; }
  draw(ctx) {
    const t = 1 - this.life / this.maxLife; // 0→1
    const r = CONFIG.cellW * (0.5 + t * 0.8);
    const alpha = (1 - t) * 0.8;
    const start = this.centerAngle - this.sweep / 2;
    const end = this.centerAngle + this.sweep / 2;
    ctx.save();
    ctx.globalAlpha = alpha;
    // 红色扇形填充（外深内亮渐变）
    const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, r);
    grad.addColorStop(0, 'rgba(255,80,80,0.85)');
    grad.addColorStop(0.6, 'rgba(220,38,38,0.6)');
    grad.addColorStop(1, 'rgba(127,29,29,0.15)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.arc(this.x, this.y, r, start, end);
    ctx.closePath();
    ctx.fill();
    // 红色发光弧刃
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 12;
    ctx.globalAlpha = Math.min(1, alpha * 1.3);
    ctx.strokeStyle = '#fca5a5';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(this.x, this.y, r, start, end);
    ctx.stroke();
    // 内层亮白弧芯
    ctx.shadowBlur = 6;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(this.x, this.y, r * 0.92, start, end);
    ctx.stroke();
    ctx.restore();
    ctx.globalAlpha = 1;
  }
}

// 酸液弹丸：从吐酸丧尸飞向目标单位的绿色弹道
class AcidProjectile {
  constructor(sx, sy, tx, ty) {
    this.x = sx; this.y = sy;
    this.tx = tx; this.ty = ty;
    this.alive = true;
    this.speed = 320;
    this.totalDist = Math.hypot(tx - sx, ty - sy);
    this.traveled = 0;
    this.trail = [];
  }
  update(dt) {
    if (!this.alive) return;
    const dx = this.tx - this.x;
    const dy = this.ty - this.y;
    const d = Math.hypot(dx, dy);
    const step = this.speed * dt;
    if (d <= step) {
      this.alive = false;
      // 命中时的酸液溅射
      Game.effects.push(new AcidSplash(this.tx, this.ty));
      return;
    }
    this.x += (dx/d)*step;
    this.y += (dy/d)*step;
    this.traveled += step;
    this.trail.push({x:this.x, y:this.y});
    if (this.trail.length > 6) this.trail.shift();
  }
  draw(ctx) {
    // 拖尾
    for (let i = 0; i < this.trail.length; i++) {
      const t = this.trail[i];
      const alpha = (i+1) / this.trail.length * 0.5;
      ctx.fillStyle = `rgba(132,204,22,${alpha})`;
      ctx.beginPath();
      ctx.arc(t.x, t.y, 3, 0, Math.PI*2);
      ctx.fill();
    }
    // 酸液弹
    ctx.fillStyle = '#84cc16';
    ctx.beginPath();
    ctx.arc(this.x, this.y, 5, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = '#bef264';
    ctx.beginPath();
    ctx.arc(this.x, this.y, 2.5, 0, Math.PI*2);
    ctx.fill();
  }
}

// 酸液溅射：命中时的绿色扩散效果
class AcidSplash {
  constructor(x, y) {
    this.x = x; this.y = y;
    this.life = 0.4;
    this.maxLife = 0.4;
  }
  update(dt) { this.life -= dt; }
  get alive() { return this.life > 0; }
  draw(ctx) {
    const t = 1 - this.life / this.maxLife;
    ctx.globalAlpha = Math.max(0, this.life / this.maxLife);
    ctx.fillStyle = '#84cc16';
    ctx.beginPath();
    ctx.arc(this.x, this.y, 4 + t*14, 0, Math.PI*2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

// 燃烧地面特效：橙色径向渐变地面 + 跳动火苗，随剩余时间淡出
class FlameZoneEffect {
  constructor(x, y, duration) {
    this.x = x; this.y = y;
    this.life = duration;
    this.maxLife = duration;
    this.t = 0;
    // 预生成火苗粒子（围绕格子中心）
    this.flames = [];
    const count = 8;
    for (let i = 0; i < count; i++) {
      const ang = (i / count) * Math.PI * 2 + Math.random() * 0.5;
      const rad = CONFIG.cellW * (0.15 + Math.random() * 0.25);
      this.flames.push({
        ox: Math.cos(ang) * rad,
        oy: Math.sin(ang) * rad,
        phase: Math.random() * Math.PI * 2,
        speed: 3 + Math.random() * 3
      });
    }
  }
  update(dt) {
    this.life -= dt;
    this.t += dt;
  }
  get alive() { return this.life > 0; }
  draw(ctx) {
    const p = Math.max(0, this.life / this.maxLife);
    const cw = CONFIG.cellW;
    ctx.save();
    // 地面径向渐变（半透明橙红）
    const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, cw * 0.5);
    grad.addColorStop(0, `rgba(255,140,40,${0.45 * p})`);
    grad.addColorStop(0.6, `rgba(239,68,68,${0.3 * p})`);
    grad.addColorStop(1, `rgba(220,38,38,0)`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(this.x, this.y, cw * 0.5, 0, Math.PI * 2);
    ctx.fill();
    // 跳动火苗
    for (const f of this.flames) {
      const fh = 6 + Math.sin(this.t * f.speed + f.phase) * 4;
      const fx = this.x + f.ox;
      const fy = this.y + f.oy;
      const fg = ctx.createLinearGradient(fx, fy, fx, fy - fh);
      fg.addColorStop(0, `rgba(255,200,60,${0.9 * p})`);
      fg.addColorStop(0.5, `rgba(249,115,22,${0.7 * p})`);
      fg.addColorStop(1, `rgba(239,68,68,0)`);
      ctx.fillStyle = fg;
      ctx.beginPath();
      ctx.moveTo(fx - 3, fy);
      ctx.quadraticCurveTo(fx, fy - fh, fx + 3, fy);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }
}

// 火球飞行特效：从施法者飞向目标格，带橙色拖尾
class FireballProjectile {
  constructor(sx, sy, tx, ty) {
    this.sx = sx; this.sy = sy;
    this.tx = tx; this.ty = ty;
    this.x = sx; this.y = sy;
    this.speed = 600;
    this.totalDist = Math.hypot(tx - sx, ty - sy) || 1;
    this.traveled = 0;
    this.trail = [];
    this.dead = false;
  }
  update(dt) {
    this.traveled += this.speed * dt;
    if (this.traveled >= this.totalDist) {
      this.x = this.tx; this.y = this.ty;
      this.dead = true;
      return;
    }
    const r = this.traveled / this.totalDist;
    this.x = this.sx + (this.tx - this.sx) * r;
    this.y = this.sy + (this.ty - this.sy) * r;
    this.trail.push({ x: this.x, y: this.y, life: 0.25 });
    if (this.trail.length > 10) this.trail.shift();
    for (const t of this.trail) t.life -= dt;
    this.trail = this.trail.filter(t => t.life > 0);
  }
  get alive() { return !this.dead; }
  draw(ctx) {
    // 拖尾
    for (let i = 0; i < this.trail.length; i++) {
      const t = this.trail[i];
      const a = (t.life / 0.25) * 0.6;
      ctx.fillStyle = `rgba(249,115,22,${a})`;
      ctx.beginPath();
      ctx.arc(t.x, t.y, 4 + i * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
    // 火球本体
    const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, 8);
    g.addColorStop(0, 'rgba(255,240,150,1)');
    g.addColorStop(0.5, 'rgba(249,115,22,0.9)');
    g.addColorStop(1, 'rgba(239,68,68,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 8, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ============== 游戏主对象 ==============
const Game = {
  canvas: null, ctx: null,
  state: 'menu',
  gold: 0, baseHp: 0, wave: 0,
  waveActive: false,
  levelId: 1, levelCfg: LEVELS[0],
  units: [], monsters: [], projectiles: [], effects: [],
  burningCells: [], poisonCells: [],
  weather: 'normal', weatherTimer: 0,
  spawnQueue: [], spawnTimer: 0,
  placedHeroes: new Set(), // 已部署过的英雄（整局限一个）
  selectedBuildType: null,
  selectedUnit: null,
  moveMode: false,
  hoverCell: null,
  lastTime: 0,
  honorEarned: 0,
  gameSpeed: 1,

  init() {
    this.canvas = document.getElementById('gameCanvas');
    this.canvas.width = CW;
    this.canvas.height = CV;
    this.ctx = this.canvas.getContext('2d');
    Save.load();
    this.buildTab = 'building';
    this.buildBuildBar();
    document.querySelectorAll('.build-tab').forEach(b => {
      b.addEventListener('click', () => this.switchBuildTab(b.dataset.tab));
    });
    this.bindEvents();
    this.refreshMenu();
    requestAnimationFrame(this.loop.bind(this));
  },

  // 格子查询
  getUnit(col, row) {
    if (col < 0 || col >= CONFIG.cols || row < 0 || row >= CONFIG.rows) return null;
    return this.units.find(u => u.alive && u.col === col && u.row === row) || null;
  },

  // 获取格子上的障碍物（排除地雷，怪物可踩过地雷）
  getObstacleAt(col, row) {
    if (col < 0 || col >= CONFIG.cols || row < 0 || row >= CONFIG.rows) return null;
    return this.units.find(u => u.alive && !u.cfg.mine && u.col === col && u.row === row) || null;
  },

  // 获取占据某格的静止敌方建筑（如鼠穴），用于阻挡玩家建造/移动
  getEnemyBuildingAt(col, row) {
    if (col < 0 || col >= CONFIG.cols || row < 0 || row >= CONFIG.rows) return null;
    return this.monsters.find(m => m.alive && m.cfg.stationary && m.col === col && m.row === row) || null;
  },

  // 检查某格是否处于医院1格（曼哈顿距离）血疫保护范围内
  isProtectedFromPlague(col, row) {
    for (const h of this.units) {
      if (!h.alive || h.type !== 'hospital') continue;
      if (Math.abs(h.col - col) + Math.abs(h.row - row) <= 1) return true;
    }
    return false;
  },

  // 检查某格是否允许建造：基地4格内 / 前哨站2格内 / 医院2格内（曼哈顿距离）
  canBuildAt(col, row) {
    // 前哨站、英雄：可建造在地图任意位置（边界内即可）
    const sel = this.selectedBuildType;
    if (sel === 'outpost' || (sel && UNIT_TYPES[sel] && UNIT_TYPES[sel].hero)) {
      return col >= 0 && col < CONFIG.cols && row >= 0 && row < CONFIG.rows;
    }
    if (this.buildableCells && this.buildableCells.has(col + ',' + row)) return true;
    return this.canBuildAtDirect(col, row);
  },
  canBuildAtDirect(col, row) {
    // 基地4格内
    if (Math.abs(col - CONFIG.baseCol) + Math.abs(row - CONFIG.baseRow) <= 4) return true;
    // 前哨站2格内 / 医院3格内
    for (const u of this.units) {
      if (!u.alive) continue;
      if (u.type === 'outpost') {
        if (Math.abs(col - u.col) + Math.abs(row - u.row) <= 2) return true;
      } else if (u.type === 'hospital') {
        if (Math.abs(col - u.col) + Math.abs(row - u.row) <= 3) return true;
      }
    }
    return false;
  },
  // 预计算所有可建造格子（范围条件），在单位放置/移动/死亡时调用
  recomputeBuildableCells() {
    const cells = new Set();
    // 基地4格内
    for (let r = 0; r < CONFIG.rows; r++) {
      for (let c = 0; c < CONFIG.cols; c++) {
        if (Math.abs(c - CONFIG.baseCol) + Math.abs(r - CONFIG.baseRow) <= 4) {
          cells.add(c + ',' + r);
        }
      }
    }
    // 前哨站2格内 / 医院3格内
    for (const u of this.units) {
      if (!u.alive) continue;
      const r = u.type === 'outpost' ? 2 : (u.type === 'hospital' ? 3 : 0);
      if (r === 0) continue;
      for (let dr = -r; dr <= r; dr++) {
        for (let dc = -r; dc <= r; dc++) {
          if (Math.abs(dc) + Math.abs(dr) > r) continue;
          const nc = u.col + dc, nr = u.row + dr;
          if (nc >= 0 && nc < CONFIG.cols && nr >= 0 && nr < CONFIG.rows) {
            cells.add(nc + ',' + nr);
          }
        }
      }
    }
    this.buildableCells = cells;
  },

  // 建造栏
  buildBuildBar() {
    const bar = document.getElementById('buildBar');
    bar.innerHTML = '';
    const tab = this.buildTab || 'building';
    const buildingTypes = ['fence', 'mine', 'outpost', 'hospital', 'freeze', 'flame', 'lightning'];
    const characterTypes = ['pistol', 'assault', 'rifle', 'mg', 'sniper', 'grenadier', 'shotgun', 'crossbow', 'medic', 'pharmacist', 'axe', 'engineer', 'firemage', 'icemage'];
    const heroTypes = ['macarthur', 'yanshuangying', 'huasheng', 'terminator'];
    let types;
    if (tab === 'building') types = buildingTypes;
    else if (tab === 'hero') types = heroTypes;
    else types = characterTypes;
    // 按造价从低到高排序
    types = [...types].sort((a, b) => UNIT_TYPES[a].cost - UNIT_TYPES[b].cost);
    for (const type of types) {
      const cfg = UNIT_TYPES[type];
      const btn = document.createElement('div');
      btn.className = 'build-btn';
      btn.dataset.type = type;
      // 英雄已部署过则禁用
      if (cfg.hero && this.placedHeroes.has(type)) btn.classList.add('disabled');
      // 用 canvas 绘制矢量图标，与战斗画布同源
      const cv = document.createElement('canvas');
      cv.width = 40; cv.height = 40;
      cv.className = 'tower-icon';
      const ictx = cv.getContext('2d');
      drawUnitVector(ictx, type, 20, 24, 16, false);
      btn.appendChild(cv);
      const name = document.createElement('div');
      name.className = 'tower-name';
      name.textContent = cfg.name;
      btn.appendChild(name);
      const cost = document.createElement('div');
      cost.className = 'tower-cost';
      cost.textContent = cfg.cost;
      btn.appendChild(cost);
      btn.addEventListener('click', () => this.selectBuild(type));
      bar.appendChild(btn);
    }
  },

  switchBuildTab(tab) {
    this.buildTab = tab;
    document.querySelectorAll('.build-tab').forEach(b => {
      b.classList.toggle('active', b.dataset.tab === tab);
    });
    this.buildBuildBar();
    this.updateBuildBar();
  },

  selectBuild(type) {
    if (this.state !== 'playing') return;
    const cfg = UNIT_TYPES[type];
    if (this.gold < cfg.cost) { this.showToast('金币不足！'); return; }
    if (this.selectedBuildType === type) this.selectedBuildType = null;
    else this.selectedBuildType = type;
    this.selectedUnit = null;
    this.moveMode = false;
    this.hideInfoPanel();
    document.getElementById('moveHint').style.display = 'none';
    this.updateBuildBar();
  },

  updateBuildBar() {
    document.querySelectorAll('.build-btn').forEach(btn => {
      const type = btn.dataset.type;
      const cfg = UNIT_TYPES[type];
      const noGold = this.gold < cfg.cost;
      const heroUsed = cfg.hero === true && this.placedHeroes.has(type);
      btn.classList.toggle('disabled', noGold || heroUsed);
      btn.classList.toggle('selected', this.selectedBuildType === type);
    });
  },

  // ---------- 菜单 ----------
  refreshMenu() {
    document.getElementById('menuHonor').textContent = Save.meta.honor;
    const bw = Save.meta.bestWaves;
    const parts = LEVELS.map(lv => `${lv.id}:${bw[lv.id]||0}`);
    document.getElementById('menuBestWave').textContent = parts.join('  ');
    document.getElementById('continueBtn').disabled = !Save.hasSave();
  },

  hideAllOverlays() {
    ['mainMenu','shopScreen','helpScreen','codexScreen','pauseScreen','endScreen','levelSelectScreen','exportSaveScreen','importSaveScreen'].forEach(id => {
      document.getElementById(id).style.display = 'none';
    });
  },

  showMainMenu() {
    this.hideAllOverlays();
    document.getElementById('mainMenu').style.display = 'flex';
    document.getElementById('hud').style.display = 'none';
    document.getElementById('buildBar').style.display = 'none';
    document.getElementById('buildTabs').style.display = 'none';
    this.hideInfoPanel();
    document.getElementById('moveHint').style.display = 'none';
    this.refreshMenu();
    this.state = 'menu';
  },

  startNewGame(levelId) {
    const lvl = LEVELS.find(l => l.id === levelId) || LEVELS[0];
    this.levelId = lvl.id;
    this.levelCfg = lvl;
    this.hideAllOverlays();
    this.resetGameState();
    this.enterGame();
    this.showToast('准备布防，5秒后开始第1波...');
    setTimeout(() => { if (this.state === 'playing' && !this.waveActive) this.startNextWave(); }, 5000);
  },

  // 打开关卡选择界面
  openLevelSelect() {
    this.hideAllOverlays();
    this.state = 'levelSelect';
    document.getElementById('levelSelectScreen').style.display = 'flex';
    this.renderLevelSelect();
  },

  renderLevelSelect() {
    const list = document.getElementById('levelList');
    list.innerHTML = '';
    const unlocked = Save.meta.unlockedLevel || 1;
    for (const lvl of LEVELS) {
      const locked = lvl.id > unlocked;
      const card = document.createElement('div');
      card.className = 'level-card' + (locked ? ' locked' : '');
      const bw = Save.meta.bestWaves[lvl.id] || 0;
      const totalMonsters = lvl.waves.reduce((sum, wave) =>
        sum + wave.reduce((s, g) => s + g.count, 0), 0);
      card.innerHTML = `
        <div class="level-title">${locked?'🔒':'🏰'} ${lvl.name}</div>
        <div class="level-desc">${lvl.desc}</div>
        <div class="level-stats">
          <span>❤️×${lvl.hpMul}</span>
          <span>⚔️×${lvl.atkMul}</span>
          <span>🏃×${lvl.speedMul}</span>
          <span>💰×${lvl.startGoldMul}</span>
        </div>
        <div class="level-best" style="font-size:12px;color:#ffd700;margin:4px 0;">🏆 最高波次：${bw}/${CONFIG.totalWaves}</div>
        <div style="font-size:12px;color:#cbd5e1;margin-bottom:6px;">👾 怪物总数：${totalMonsters}</div>
        <button class="menu-btn btn-primary level-start-btn" ${locked?'disabled':''} data-id="${lvl.id}">
          ${locked ? '未解锁' : '开始挑战'}
        </button>
      `;
      list.appendChild(card);
    }
    list.querySelectorAll('.level-start-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (!btn.disabled) this.startNewGame(parseInt(btn.dataset.id));
      });
    });
  },

  continueGame() {
    if (!Save.game) return;
    this.hideAllOverlays();
    this.loadGameState(Save.game);
    this.enterGame();
    if (!this.waveActive) {
      this.showToast('准备就绪，即将开始下一波...');
      setTimeout(() => { if (this.state === 'playing' && !this.waveActive) this.startNextWave(); }, 1500);
    }
  },

  resetGameState() {
    this.gold = Math.round((CONFIG.startGold + Save.goldBonus) * (this.levelCfg?.startGoldMul || 1));
    this.baseHp = CONFIG.baseHp;
    this.wave = 0;
    this.units = [];
    this.monsters = [];
    this.projectiles = [];
    this.effects = [];
    this.burningCells = [];
    this.poisonCells = [];
    this.spawnQueue = [];
    this.placedHeroes = new Set();
    this.selectedBuildType = null;
    this.selectedUnit = null;
    this.moveMode = false;
    this.focusTarget = null;
    this.focusMode = false;
    this.waveActive = false;
    this.honorEarned = 0;
    this.gameSpeed = 1;
    this.buildableCells = null;
    this.weather = 'normal';
    this.weatherTimer = 0;
    const spdBtn = document.getElementById('speedBtn');
    if (spdBtn) spdBtn.textContent = '1x';
    const fb = document.getElementById('focusBtn');
    if (fb) fb.classList.remove('active');
    Save.clearGame();
  },

  loadGameState(s) {
    this.gold = s.gold;
    this.baseHp = s.baseHp;
    this.levelId = s.levelId || 1;
    this.levelCfg = LEVELS.find(l => l.id === this.levelId) || LEVELS[0];
    this.wave = s.waveActive ? s.wave - 1 : s.wave;
    this.units = [];
    this.monsters = [];
    this.projectiles = [];
    this.effects = [];
    this.burningCells = [];
    this.poisonCells = [];
    this.spawnQueue = [];
    this.waveActive = false;
    this.selectedBuildType = null;
    this.selectedUnit = null;
    this.moveMode = false;
    this.focusTarget = null;
    this.focusMode = false;
    this.honorEarned = 0;
    this.weather = 'normal';
    this.weatherTimer = 0;
    for (const u of (s.units || [])) {
      const unit = new Unit(u.type, u.col, u.row);
      unit.totalSpent = u.totalSpent;
      unit.sellValue = Math.floor(unit.totalSpent * 0.6);
      // 恢复战斗内升级等级并重算属性（baseXxx 在构造时已设置）
      unit.battleLvl = u.battleLvl || 1;
      unit.battleBranch = u.battleBranch || null;
      unit.applyBattleUpgrades();
      unit.hp = Math.min(u.hp, unit.maxHp);
      this.units.push(unit);
    }
    // 恢复已部署英雄集合：优先使用存档记录（含已被摧毁的英雄），兼容旧存档则从单位重建
    if (Array.isArray(s.placedHeroes)) {
      this.placedHeroes = new Set(s.placedHeroes);
    } else {
      this.placedHeroes = new Set();
      for (const u of this.units) {
        if (u.cfg.hero) this.placedHeroes.add(u.type);
      }
    }
    this.buildableCells = null;
  },

  enterGame() {
    this.state = 'playing';
    document.getElementById('hud').style.display = 'flex';
    document.getElementById('buildBar').style.display = 'flex';
    document.getElementById('buildTabs').style.display = 'flex';
    this.updateHUD();
    this.updateBuildBar();
  },

  openShop() {
    document.getElementById('mainMenu').style.display = 'none';
    document.getElementById('shopScreen').style.display = 'flex';
    this.shopTab = 'building';
    document.querySelectorAll('#shopTabs .tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('#shopTabs .tab-btn[data-tab="building"]').classList.add('active');
    this.renderShop('building');
    this.state = 'shop';
  },
  closeShop() {
    document.getElementById('shopScreen').style.display = 'none';
    document.getElementById('mainMenu').style.display = 'flex';
    this.state = 'menu';
  },
  showHelp() {
    document.getElementById('mainMenu').style.display = 'none';
    document.getElementById('helpScreen').style.display = 'flex';
  },
  closeHelp() {
    document.getElementById('helpScreen').style.display = 'none';
    document.getElementById('mainMenu').style.display = 'flex';
  },

  // ---------- 游戏百科 ----------
  openCodex() {
    document.getElementById('mainMenu').style.display = 'none';
    document.getElementById('codexScreen').style.display = 'flex';
    this.state = 'codex';
    document.querySelectorAll('#codexTabs .tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('#codexTabs .tab-btn[data-tab="building"]').classList.add('active');
    this.renderCodex('building');
  },
  closeCodex() {
    document.getElementById('codexScreen').style.display = 'none';
    document.getElementById('mainMenu').style.display = 'flex';
    this.state = 'menu';
  },
  renderCodex(tab) {
    const list = document.getElementById('codexList');
    list.innerHTML = '';
    if (tab === 'building') {
      const items = Object.entries(UNIT_TYPES).filter(([t,c]) => c.isBuilding);
      items.sort((a,b) => a[1].cost - b[1].cost);
      for (const [type, cfg] of items) {
        list.appendChild(this.createCodexItem(type, 'unit', cfg.name, cfg.desc, this.buildUnitStats(cfg)));
      }
    } else if (tab === 'character') {
      const items = Object.entries(UNIT_TYPES).filter(([t,c]) => !c.isBuilding && !c.hero);
      items.sort((a,b) => a[1].cost - b[1].cost);
      for (const [type, cfg] of items) {
        list.appendChild(this.createCodexItem(type, 'unit', cfg.name, cfg.desc, this.buildUnitStats(cfg)));
      }
    } else if (tab === 'hero') {
      const items = Object.entries(UNIT_TYPES).filter(([t,c]) => c.hero);
      items.sort((a,b) => a[1].cost - b[1].cost);
      for (const [type, cfg] of items) {
        list.appendChild(this.createCodexItem(type, 'unit', cfg.name, cfg.desc, this.buildUnitStats(cfg)));
      }
    } else if (tab === 'monster') {
      const items = Object.entries(MONSTER_TYPES).sort((a,b) => a[1].gold - b[1].gold);
      for (const [type, cfg] of items) {
        list.appendChild(this.createCodexItem(type, 'monster', cfg.name, cfg.desc, this.buildMonsterStats(cfg)));
      }
    }
  },
  buildUnitStats(cfg) {
    const stats = [`💰${cfg.cost}`, `❤️${cfg.hp}`];
    if (cfg.hero) {
      const s = cfg.stars || 1;
      stats.push('🦸' + '⭐'.repeat(s) + '·整局限1');
    }
    if (cfg.canAttack) {
      if (cfg.flame) {
        stats.push(`🔥${cfg.atk}/秒`, `🎯${cfg.range}格`, `🧭自动转向`);
      } else if (cfg.freeze) {
        stats.push(`⚔️${cfg.atk}`, `🎯${cfg.range}格`, `⚡${cfg.fireRate}/秒`);
        if (cfg.aoe) stats.push('💥十字AOE');
        if (cfg.pierce) stats.push('🏹直线穿透');
        stats.push(`❄️减速${Math.round((1-cfg.freeze.slowFactor)*100)}%·${cfg.freeze.duration}秒`);
      } else if (cfg.chain) {
        const pct = cfg.chain.falloff.map(f => Math.round(f * 100) + '%').join('/');
        stats.push(`⚔️${cfg.atk}`, `🎯${cfg.range}格`, `⚡${cfg.fireRate}/秒`);
        stats.push(`⚡连锁${cfg.chain.jumps}次`, `📉${pct}`);
      } else {
        const atkVal = cfg.atk;
        stats.push(`⚔️${atkVal}`, `🎯${cfg.range}格`, `⚡${cfg.fireRate}/秒`);
        if (cfg.fan) stats.push('🪓扇形3格');
        if (cfg.spread) stats.push('💢5发扇形');
        if (cfg.heal) stats.push(`💚+${cfg.heal}/次`, cfg.cure ? '🩹治1个·解血疫' : '🩹自身+1格');
        if (cfg.plagueImmune) stats.push('🛡️免疫血疫');
        if (cfg.repair) stats.push(`🔧+${cfg.repair}/秒`, `🏗️修3*3`);
        if (cfg.burn) stats.push(`🔥地面${cfg.burn.groundDur}秒`, `🩸${cfg.burn.dps}/秒·${cfg.burn.debuffDur}秒`);
      }
    } else if (cfg.heal) {
      stats.push(`💚+${cfg.heal}/秒`, `🎯${cfg.range}格`);
    }
    return stats;
  },
  buildMonsterStats(cfg) {
    const catLabel = cfg.category === 'zombie' ? '🧟丧尸' : cfg.category === 'monster' ? '👹怪兽' : cfg.category === 'raider' ? '🏴‍☠️劫掠者' : '未知';
    const stats = [`🏷️${catLabel}`, `❤️${cfg.hp}`, `⚔️${cfg.atk}`, `🏃${cfg.speed}格/秒`, `💰${cfg.gold}`];
    if (cfg.flying) stats.push('🦅飞行');
    if (cfg.ranged) stats.push(`🎯远程${cfg.rangedRange}格`);
    if (cfg.spawn) stats.push(`🤰召唤${cfg.spawn.count}只/${cfg.spawn.interval}秒`);
    if (cfg.warcry) stats.push(`📢战吼${cfg.warcry.damage}伤·眩晕${cfg.warcry.stunDur}秒/${cfg.warcry.interval}秒`);
    if (cfg.plague) stats.push('🩸血疫·7/秒·传染');
    return stats;
  },
  drawCodexIcon(canvas, type, kind) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cx = canvas.width / 2, cy = canvas.height / 2 + 4;
    let inst;
    if (kind === 'unit') {
      inst = new Unit(type, 0, 0);
    } else {
      inst = new Monster(type, 0);
    }
    inst.x = cx; inst.y = cy;
    inst.hp = inst.maxHp; // 满血量，不显示血条
    inst.hitFlash = 0;
    inst.draw(ctx);
  },
  createCodexItem(type, kind, name, desc, stats) {
    const div = document.createElement('div');
    div.className = 'codex-item';
    const iconWrap = document.createElement('div');
    iconWrap.className = 'codex-icon';
    const canvas = document.createElement('canvas');
    canvas.width = 56; canvas.height = 56;
    iconWrap.appendChild(canvas);
    const info = document.createElement('div');
    info.className = 'codex-info';
    info.innerHTML = `
      <div class="codex-name">${name}</div>
      <div class="codex-desc">${desc}</div>
      <div class="codex-stats">${stats.map(s => `<span>${s}</span>`).join('')}</div>`;
    div.appendChild(iconWrap);
    div.appendChild(info);
    // 绘制立绘（延迟到 DOM 插入后）
    setTimeout(() => this.drawCodexIcon(canvas, type, kind), 0);
    return div;
  },

  renderShop(tab) {
    document.getElementById('shopHonor').textContent = Save.meta.honor;
    const list = document.getElementById('upgradeList');
    list.innerHTML = '';
    const t = tab || this.shopTab || 'building';
    this.shopTab = t;

    // 经济天赋（全局，每个分页都显示）
    for (const upg of UPGRADES) {
      list.appendChild(this.createUpgradeItem(upg, Save.meta.upgrades[upg.id] || 0));
    }

    // 按分页筛选单位升级项
    for (const [type, fields] of Object.entries(UNIT_UPGRADE_FIELDS)) {
      const cfg = UNIT_TYPES[type];
      if (t === 'building') {
        if (!cfg.isBuilding) continue;
      } else if (t === 'character') {
        if (cfg.isBuilding || cfg.hero) continue;
      } else if (t === 'hero') {
        if (!cfg.hero) continue;
      }
      const row = document.createElement('div');
      row.className = 'unit-upgrade-row';
      const nameDiv = document.createElement('div');
      nameDiv.className = 'unit-upgrade-name';
      const ncv = document.createElement('canvas');
      ncv.width = 36; ncv.height = 36;
      ncv.style.display = 'block'; ncv.style.margin = '0 auto';
      drawUnitVector(ncv.getContext('2d'), type, 18, 22, 14, false);
      nameDiv.appendChild(ncv);
      const nspan = document.createElement('span');
      nspan.textContent = cfg.name;
      nameDiv.appendChild(nspan);
      row.appendChild(nameDiv);
      const fieldsDiv = document.createElement('div');
      fieldsDiv.className = 'unit-upgrade-fields';
      for (const field of fields) {
        const upgId = unitUpgradeId(type, field.key);
        const lvl = (Save.meta.unitUpgrades[type] || {})[field.key] || 0;
        fieldsDiv.appendChild(this.createCompactUpgrade(type, field, lvl, upgId));
      }
      row.appendChild(fieldsDiv);
      list.appendChild(row);
    }

    list.querySelectorAll('.upgrade-btn').forEach(btn => {
      btn.addEventListener('click', () => this.buyUpgrade(btn.dataset.id));
    });
  },

  createUpgradeItem(upg, lvl, id) {
    const upgId = id || upg.id;
    const maxed = lvl >= upg.max;
    const cost = maxed ? 0 : upgradeCost(upg, lvl);
    const canAfford = Save.meta.honor >= cost;
    const div = document.createElement('div');
    div.className = 'upgrade-item';
    div.innerHTML = `
      <div class="upgrade-icon">${upg.icon}</div>
      <div class="upgrade-info">
        <div class="upgrade-name">${upg.name}</div>
        <div class="upgrade-desc">${upg.desc}</div>
        <div class="upgrade-level">等级 ${lvl}/${upg.max}</div>
      </div>
      <button class="upgrade-btn ${maxed?'maxed':''}" ${maxed||!canAfford?'disabled':''} data-id="${upgId}">
        ${maxed ? '已满级' : '⭐'+cost}
      </button>`;
    return div;
  },

  // 紧凑升级项：图标 + 等级 + 增量 + 按钮
  createCompactUpgrade(type, field, lvl, id) {
    const maxed = lvl >= field.max;
    const cost = maxed ? 0 : upgradeCost(field, lvl);
    const canAfford = Save.meta.honor >= cost;
    // 计算下一级属性增量（读取字段定义中的 add，各角色可能不同）
    const incText = '+' + field.add;
    const div = document.createElement('div');
    div.className = 'compact-upgrade';
    div.innerHTML = `
      <span class="cu-icon">${field.icon}</span>
      <span class="cu-lvl">${lvl}/${field.max}</span>
      <span class="cu-inc" title="${field.desc}">${maxed ? '—' : incText}</span>
      <button class="upgrade-btn cu-btn ${maxed?'maxed':''}" ${maxed||!canAfford?'disabled':''} data-id="${id}">
        ${maxed ? '满' : '⭐'+cost}
      </button>`;
    return div;
  },

  buyUpgrade(id) {
    // 全局升级（经济天赋）
    const globalUpg = UPGRADES.find(u => u.id === id);
    if (globalUpg) {
      const lvl = Save.meta.upgrades[id] || 0;
      if (lvl >= globalUpg.max) return;
      const cost = upgradeCost(globalUpg, lvl);
      if (Save.meta.honor < cost) return;
      Save.meta.honor -= cost;
      Save.meta.upgrades[id] = lvl + 1;
      Save.applyUpgrades();
      Save.save();
      this.renderShop();
      this.refreshMenu();
      this.showToast(globalUpg.name + ' 升级成功！');
      return;
    }
    // 单位升级
    if (id.startsWith('unit_')) {
      const parts = id.split('_');
      const type = parts[1];
      const key = parts[2];
      const fields = UNIT_UPGRADE_FIELDS[type];
      if (!fields) return;
      const field = fields.find(f => f.key === key);
      if (!field) return;
      const up = Save.meta.unitUpgrades[type] || {};
      const lvl = up[key] || 0;
      if (lvl >= field.max) return;
      const cost = upgradeCost(field, lvl);
      if (Save.meta.honor < cost) return;
      Save.meta.honor -= cost;
      Save.meta.unitUpgrades[type] = { ...up, [key]: lvl + 1 };
      Save.applyUpgrades();
      Save.save();
      this.renderShop();
      this.refreshMenu();
      this.showToast(UNIT_TYPES[type].name + ' ' + field.name + ' 升级成功！');
    }
  },

  // ---------- 暂停/保存 ----------
  pause() {
    if (this.state !== 'playing') return;
    this.state = 'paused';
    document.getElementById('pauseScreen').style.display = 'flex';
  },
  resume() {
    if (this.state !== 'paused') return;
    document.getElementById('pauseScreen').style.display = 'none';
    this.state = 'playing';
    this.lastTime = performance.now();
  },
  quitToMenu() {
    document.getElementById('pauseScreen').style.display = 'none';
    document.getElementById('endScreen').style.display = 'none';
    this.showMainMenu();
  },
  saveGame() {
    Save.game = {
      gold: this.gold,
      baseHp: this.baseHp,
      levelId: this.levelId,
      wave: this.wave,
      waveActive: this.waveActive,
      units: this.units.filter(u=>u.alive).map(u => ({ type:u.type, col:u.col, row:u.row, hp:u.hp, totalSpent:u.totalSpent, battleLvl:u.battleLvl, battleBranch:u.battleBranch })),
      placedHeroes: [...this.placedHeroes] // 保存已部署过的英雄（含已被摧毁的）
    };
    Save.save();
    this.refreshMenu();
    this.showToast('游戏已保存！');
  },

  // ---------- 存档导入/导出 ----------
  openSaveManager() {
    // 如果正在游戏中，先保存当前进度
    if (this.state === 'playing' || this.state === 'paused') {
      Save.game = {
        gold: this.gold,
        baseHp: this.baseHp,
        levelId: this.levelId,
        wave: this.wave,
        waveActive: this.waveActive,
        units: this.units.filter(u=>u.alive).map(u => ({ type:u.type, col:u.col, row:u.row, hp:u.hp, totalSpent:u.totalSpent, battleLvl:u.battleLvl, battleBranch:u.battleBranch })),
        placedHeroes: [...this.placedHeroes]
      };
      Save.save();
    }
    const json = JSON.stringify({ meta: Save.meta, game: Save.game }, null, 2);
    document.getElementById('exportSaveText').value = json;
    this.hideAllOverlays();
    document.getElementById('exportSaveScreen').style.display = 'flex';
  },

  openImportSave() {
    document.getElementById('importSaveText').value = '';
    this.hideAllOverlays();
    document.getElementById('importSaveScreen').style.display = 'flex';
  },

  closeSaveManager() {
    if (this.state === 'playing' || this.state === 'paused') {
      // 游戏中返回暂停界面
      document.getElementById('importSaveScreen').style.display = 'none';
      document.getElementById('exportSaveScreen').style.display = 'none';
      if (this.state === 'paused') document.getElementById('pauseScreen').style.display = 'flex';
    } else {
      this.showMainMenu();
    }
  },

  copySaveJson() {
    const ta = document.getElementById('exportSaveText');
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand('copy');
    } catch(e) { ok = false; }
    // 降级：现代 API
    if (!ok && navigator.clipboard) {
      navigator.clipboard.writeText(ta.value).then(() => {
        this.showToast('已复制到剪贴板！');
      }).catch(() => {
        this.showToast('复制失败，请手动选择文本复制');
      });
    } else {
      this.showToast(ok ? '已复制到剪贴板！' : '请手动 Ctrl+C 复制');
    }
  },

  doImportSave() {
    const text = document.getElementById('importSaveText').value.trim();
    if (!text) { this.showToast('请先粘贴存档 JSON'); return; }
    let data;
    try {
      data = JSON.parse(text);
    } catch(e) {
      this.showToast('JSON 格式错误，无法解析');
      return;
    }
    if (!data || typeof data !== 'object' || !data.meta) {
      this.showToast('存档数据不完整（缺少 meta 字段）');
      return;
    }
    // 校验并恢复 meta
    const m = data.meta || {};
    Save.meta.honor = typeof m.honor === 'number' ? m.honor : 0;
    Save.meta.bestWaves = m.bestWaves && typeof m.bestWaves === 'object' ? m.bestWaves : {};
    Save.meta.upgrades = m.upgrades && typeof m.upgrades === 'object' ? m.upgrades : {};
    Save.meta.unitUpgrades = m.unitUpgrades && typeof m.unitUpgrades === 'object' ? m.unitUpgrades : {};
    Save.meta.unlockedLevel = typeof m.unlockedLevel === 'number' ? m.unlockedLevel : 1;
    // 恢复游戏存档（可能为 null）
    Save.game = data.game || null;
    Save.applyUpgrades();
    Save.save();
    this.showToast('存档导入成功！');
    this.refreshMenu();
    setTimeout(() => this.closeSaveManager(), 600);
  },

  // ---------- 游戏循环 ----------
  updateHUD() {
    document.getElementById('goldText').textContent = this.gold;
    document.getElementById('lifeText').textContent = Math.max(0, Math.floor(this.baseHp));
    document.getElementById('waveText').textContent = this.wave + '/' + CONFIG.totalWaves;
    this.updateBuildBar();
  },

  showToast(msg) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => el.classList.remove('show'), 1500);
  },

  showWaveNotice(text) {
    const el = document.getElementById('waveNotice');
    el.textContent = text;
    el.style.opacity = '1';
    setTimeout(() => { el.style.opacity = '0'; }, 1500);
  },

  startNextWave() {
    if (this.wave >= CONFIG.totalWaves) { this.win(); return; }
    this.wave++;
    this.waveActive = true;
    const waveCfg = this.levelCfg.waves[this.wave-1];
    this.spawnQueue = [];
    for (const group of waveCfg) {
      if (group.type === 'ratnest') {
        // 鼠穴：在波次开始时直接生成在地图边缘的随机格子（不进入普通刷怪队列）
        for (let i = 0; i < group.count; i++) {
          const edge = this.randomEdgeCell();
          const nest = new Monster('ratnest', edge.col, {
            hp: this.levelCfg.hpMul, atk: this.levelCfg.atkMul, speed: this.levelCfg.speedMul
          });
          nest.row = edge.row;
          nest.targetRow = edge.row;
          nest.moveProgress = 1;
          const ec = cellCenter(edge.col, edge.row);
          nest.x = ec.x; nest.y = ec.y;
          this.monsters.push(nest);
        }
        continue;
      }
      for (let i = 0; i < group.count; i++) {
        // 随机列生成
        const col = Math.floor(Math.random() * CONFIG.cols);
        this.spawnQueue.push({ type: group.type, col, time: group.delay + i * group.interval });
      }
    }
    this.spawnQueue.sort((a,b) => a.time - b.time);
    this.spawnTimer = 0;
    this.showWaveNotice('第 ' + this.wave + ' 波');
    this.updateHUD();
  },

  // 随机返回地图边缘的一个格子（上沿/左沿/右沿，避开底行基地所在行）
  randomEdgeCell() {
    const edges = [];
    for (let c = 0; c < CONFIG.cols; c++) edges.push({ col: c, row: 0 }); // 上沿
    for (let r = 1; r < CONFIG.rows - 1; r++) {
      edges.push({ col: 0, row: r });            // 左沿
      edges.push({ col: CONFIG.cols - 1, row: r }); // 右沿
    }
    return edges[Math.floor(Math.random() * edges.length)];
  },

  bindEvents() {
    const cv = this.canvas;
    const getCell = (e) => {
      const p = clientToCanvas(e);
      return pxToCell(p.x, p.y);
    };
    const onTap = (e) => {
      if (this.state !== 'playing') return;
      e.preventDefault();
      // 集火模式：点击怪物设定集火目标
      if (this.focusMode) {
        const p = clientToCanvas(e);
        let target = null, bestD = Infinity;
        for (const m of this.monsters) {
          if (!m.alive) continue;
          const d = Math.hypot(m.x - p.x, m.y - p.y);
          if (d < bestD && d <= (m.cfg.size || 16) + 12) {
            bestD = d;
            target = m;
          }
        }
        if (target) {
          this.focusTarget = target;
          this.focusMode = false;
          document.getElementById('focusHint').style.display = 'none';
          document.getElementById('focusBtn').classList.add('active');
          this.showToast('集火目标：' + target.cfg.name);
        } else {
          this.showToast('未点中敌人，请点击怪物');
        }
        return;
      }
      const cell = getCell(e);
      if (!cell) return;
      this.handleCellTap(cell);
    };
    cv.addEventListener('click', onTap);
    cv.addEventListener('touchstart', (e) => { if (e.touches.length) onTap(e.touches[0]); }, { passive: false });

    document.getElementById('moveBtn').addEventListener('click', () => this.enterMoveMode());
    document.getElementById('sellBtn').addEventListener('click', () => this.sellUnit());
    document.getElementById('closeBtn').addEventListener('click', () => this.hideInfoPanel());
    document.getElementById('upgradeBtn').addEventListener('click', () => this.handleUpgradeBtn());

    // 百科标签切换（一次性绑定）
    document.querySelectorAll('#codexTabs .tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#codexTabs .tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.renderCodex(btn.dataset.tab);
      });
    });

    // 升级商店标签切换
    document.querySelectorAll('#shopTabs .tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#shopTabs .tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.renderShop(btn.dataset.tab);
      });
    });
  },

  handleCellTap(cell) {
    const { col, row } = cell;

    // 移动模式：角色移动到相邻空格
    if (this.moveMode && this.selectedUnit && !this.selectedUnit.isBuilding) {
      const u = this.selectedUnit;
      const dc = Math.abs(col - u.col);
      const dr = Math.abs(row - u.row);
      // 点击自身：取消移动模式
      if (dc === 0 && dr === 0) {
        this.moveMode = false;
        document.getElementById('moveHint').style.display = 'none';
        this.showInfoPanel(u);
        return;
      }
      if (dc + dr === 1 && !this.getUnit(col, row) && !this.getEnemyBuildingAt(col, row)) {
        if (this.gold < CONFIG.moveCost) { this.showToast('金币不足！'); return; }
        this.gold -= CONFIG.moveCost;
        u.col = col; u.row = row;
        const c = cellCenter(col, row);
        u.x = c.x; u.y = c.y;
        this.buildableCells = null;
        this.moveMode = false;
        document.getElementById('moveHint').style.display = 'none';
        this.updateHUD();
        this.updateBuildBar();
        this.showInfoPanel(u);
        return;
      } else {
        this.showToast('只能移动到相邻空格');
        return;
      }
    }

    // 建造模式
    if (this.selectedBuildType) {
      const cfg = UNIT_TYPES[this.selectedBuildType];
      // 英雄：整局只能部署一个
      if (cfg.hero && this.placedHeroes.has(this.selectedBuildType)) {
        this.showToast(cfg.name + ' 已部署过，本局无法再次放置！');
        return;
      }
      // 基地格子不能建造
      if (col === CONFIG.baseCol && row === CONFIG.baseRow) {
        this.showToast('不能建在基地上！');
        return;
      }
      if (this.getUnit(col, row)) {
        this.showToast('该格已有单位！');
        return;
      }
      if (this.getEnemyBuildingAt(col, row)) {
        this.showToast('该格被敌方建筑占据！');
        return;
      }
      // 放置范围限制：基地4格内 / 前哨站2格内 / 医院2格内（曼哈顿距离）
      if (!this.canBuildAt(col, row)) {
        this.showToast('需在基地4格、前哨站或医院2格范围内！');
        return;
      }
      if (this.gold < cfg.cost) { this.showToast('金币不足！'); return; }
      this.gold -= cfg.cost;
      this.units.push(new Unit(this.selectedBuildType, col, row));
      if (cfg.hero) this.placedHeroes.add(this.selectedBuildType);
      this.selectedBuildType = null;
      this.buildableCells = null;
      this.updateHUD();
      this.updateBuildBar();
      this.showToast(cfg.name + ' 已部署');
      return;
    }

    // 选中单位
    const unit = this.getUnit(col, row);
    if (unit) {
      this.selectedUnit = unit;
      this.selectedBuildType = null;
      this.moveMode = false;
      document.getElementById('moveHint').style.display = 'none';
      this.updateBuildBar();
      this.showInfoPanel(unit);
    } else {
      this.selectedUnit = null;
      this.moveMode = false;
      this.hideInfoPanel();
      document.getElementById('moveHint').style.display = 'none';
    }
  },

  showInfoPanel(unit) {
    const panel = document.getElementById('infoPanel');
    const info = document.getElementById('unitInfo');
    const cfg = unit.cfg;
    const up = Save.meta.unitUpgrades[unit.type] || {};
    const hpLvl = up.hp || 0, atkLvl = up.atk || 0, rateLvl = up.rate || 0;

    info.innerHTML = '';

    // 标题：矢量图标 + 名称（与战斗画布同源）
    const titleRow = document.createElement('div');
    titleRow.style.cssText = 'display:flex;align-items:center;gap:6px;margin-bottom:6px;';
    const tcv = document.createElement('canvas');
    tcv.width = 28; tcv.height = 28;
    drawUnitVector(tcv.getContext('2d'), unit.type, 14, 17, 12, false);
    titleRow.appendChild(tcv);
    const tspan = document.createElement('span');
    tspan.style.cssText = 'font-size:14px;font-weight:bold;color:#ffd700;';
    tspan.textContent = cfg.name + (cfg.hero ? ' ' + '⭐'.repeat(cfg.stars || 1) : '');
    titleRow.appendChild(tspan);
    info.appendChild(titleRow);

    // 属性网格
    const attrDiv = document.createElement('div');
    attrDiv.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:2px 12px;font-size:12px;line-height:1.7;';
    let html = `<span>❤️ 生命</span><span>${Math.ceil(unit.hp)} / ${unit.maxHp}</span>`;
    if (cfg.canAttack) {
      if (cfg.flame) {
        const flameDps = Math.round(unit.atk * (1 + unit.fireRate));
        html += `<span>🔥 灼烧</span><span>${flameDps}/秒${atkLvl > 0 || rateLvl > 0 ? ` <small style="color:#4ade80;">(强化中)</small>` : ''}</span>`;
        html += `<span>🎯 射程</span><span>${unit.range.toFixed(1)} 格</span>`;
        html += `<span>🧭 模式</span><span style="color:#f97316;">自动转向</span>`;
      } else {
        const atkVal = Math.round(unit.atk);
        html += `<span>⚔️ 攻击</span><span>${atkVal}${atkLvl > 0 ? ` <small style="color:#4ade80;">(+${atkLvl}级)</small>` : ''}</span>`;
        html += `<span>🎯 射程</span><span>${unit.range.toFixed(1)} 格</span>`;
        html += `<span>⚡ 攻速</span><span>${unit.fireRate.toFixed(2)}/秒${rateLvl > 0 ? ` <small style="color:#4ade80;">(+${rateLvl}级)</small>` : ''}</span>`;
      }
      if (cfg.aoe) html += `<span>💥 范围</span><span style="color:#f97316;">十字AOE</span>`;
      if (cfg.spread) html += `<span>🎯 模式</span><span style="color:#f59e0b;">5发扇形</span>`;
      if (cfg.pierce) html += `<span>🏹 穿透</span><span style="color:#14b8a6;">直线穿透</span>`;
      if (cfg.fan) html += `<span>🪓 扇形</span><span style="color:#b45309;">连续3格·自动选向</span>`;
      if (cfg.freeze) html += `<span>❄️ 冰冻</span><span style="color:#38bdf8;">减速${Math.round((1-cfg.freeze.slowFactor)*100)}% ${cfg.freeze.duration}秒</span>`;
      if (cfg.chain) {
        const pct = cfg.chain.falloff.map(f => Math.round(f * 100) + '%').join('/');
        html += `<span>⚡ 连锁</span><span style="color:#a855f7;">传导${cfg.chain.jumps}次 · 相邻${cfg.chain.range}格</span>`;
        html += `<span>📉 衰减</span><span style="color:#c084fc;">${pct}</span>`;
      }
      // 军医：同时显示治疗属性
      if (cfg.heal) {
        const healPerSec = Math.round(unit.heal * unit.fireRate * 10) / 10;
        html += `<span>💚 治疗</span><span>+${healPerSec}/秒${rateLvl > 0 ? ` <small style="color:#4ade80;">(+${rateLvl}级)</small>` : ''}</span>`;
        html += `<span>🩹 目标</span><span style="color:#06b6d4;">自身+1个最低血量</span>`;
      }
      // 工程师：修复属性
      if (cfg.repair) {
        html += `<span>🔧 修复</span><span>+${cfg.repair}/秒</span>`;
        html += `<span>🏗️ 目标</span><span style="color:#84cc16;">3*3范围·血量最低建筑</span>`;
      }
      // 火法师：燃烧属性
      if (cfg.burn) {
        html += `<span>🔥 地面</span><span style="color:#f97316;">燃烧 ${cfg.burn.groundDur} 秒</span>`;
        html += `<span>🩸 灼烧</span><span style="color:#ef4444;">${cfg.burn.dps}/秒 · ${cfg.burn.debuffDur}秒</span>`;
      }
    } else if (unit.type === 'hospital') {
      const healPerSec = Math.round(unit.heal * unit.fireRate * 10) / 10;
      html += `<span>💚 治疗</span><span>+${healPerSec}/秒${rateLvl > 0 ? ` <small style="color:#4ade80;">(+${rateLvl}级)</small>` : ''}</span>`;
      html += `<span>🎯 范围</span><span>${cfg.range} 格</span>`;
      html += `<span>🩹 目标</span><span style="color:#22c55e;">最多2个最低血量</span>`;
    } else {
      html += `<span>🧱 功能</span><span>阻挡怪物前进</span>`;
    }
    if (hpLvl > 0) html += `<span>❤️ 强化</span><span style="color:#4ade80;">生命 +${hpLvl}级</span>`;
    attrDiv.innerHTML = html;
    info.appendChild(attrDiv);

    // 花费信息
    const costDiv = document.createElement('div');
    costDiv.style.cssText = 'font-size:10px;color:#94a3b8;margin-top:5px;';
    costDiv.textContent = `部署花费 💰${cfg.cost} · 出售回收 💰${unit.sellValue}`;
    info.appendChild(costDiv);

    // 战斗内等级信息
    const upgradeProfile = getBattleUpgradeProfile(unit);
    const upgBtn = document.getElementById('upgradeBtn');
    if (upgradeProfile) {
      const lvlDiv = document.createElement('div');
      lvlDiv.style.cssText = 'font-size:11px;color:#fbbf24;margin-top:4px;';
      let lvlText = `战斗等级：${'★'.repeat(unit.battleLvl)}${'☆'.repeat(3 - unit.battleLvl)}`;
      if (unit.battleBranch) {
        const br = upgradeProfile.branches.find(b => b.id === unit.battleBranch);
        if (br) lvlText += ` · ${br.name}`;
      }
      lvlDiv.textContent = lvlText;
      info.appendChild(lvlDiv);

      const cost = getBattleUpgradeCost(cfg);
      if (unit.battleLvl >= 3) {
        upgBtn.textContent = '已满级';
        upgBtn.style.display = 'block';
        upgBtn.disabled = true;
        upgBtn.style.opacity = '0.5';
      } else {
        const need = unit.battleLvl === 1 ? cost.toLv2 : cost.toLv3;
        upgBtn.textContent = unit.battleLvl === 1
          ? `升级 → Lv2 (💰${need})`
          : `选择专精 → Lv3 (💰${need})`;
        upgBtn.style.display = 'block';
        upgBtn.disabled = false;
        upgBtn.style.opacity = '1';
      }
    } else {
      upgBtn.style.display = 'none';
    }

    const moveBtn = document.getElementById('moveBtn');
    moveBtn.style.display = unit.isBuilding ? 'none' : 'block';
    moveBtn.textContent = `移动 (💰${CONFIG.moveCost})`;
    document.getElementById('sellBtn').textContent = `出售 (+💰${unit.sellValue})`;
    panel.style.display = 'block';
  },

  hideInfoPanel() {
    document.getElementById('infoPanel').style.display = 'none';
  },

  // 升级按钮：Lv1→Lv2 直接升，Lv2→Lv3 弹出分支选择
  handleUpgradeBtn() {
    const unit = this.selectedUnit;
    if (!unit) return;
    if (unit.battleLvl >= 3) return;
    if (unit.battleLvl === 1) {
      if (unit.battleUpgrade()) {
        this.showToast('升级成功！Lv1 → Lv2');
        this.updateHUD();
        this.updateBuildBar();
        this.showInfoPanel(unit);
      }
      return;
    }
    // Lv2→Lv3：显示分支选择
    const profile = getBattleUpgradeProfile(unit);
    if (!profile) return;
    const info = document.getElementById('unitInfo');
    // 移除已有分支选择
    const old = document.getElementById('branchSelect');
    if (old) old.remove();
    const sel = document.createElement('div');
    sel.id = 'branchSelect';
    sel.style.cssText = 'margin-top:8px;padding-top:8px;border-top:1px solid rgba(255,255,255,0.15);';
    sel.innerHTML = '<div style="font-size:12px;color:#fbbf24;margin-bottom:6px;">选择专精方向：</div>';
    for (const br of profile.branches) {
      const btn = document.createElement('button');
      btn.style.cssText = 'display:block;width:100%;margin:4px 0;padding:6px 8px;font-size:11px;background:rgba(245,158,11,0.25);border:1px solid #f59e0b;border-radius:5px;color:#fff;cursor:pointer;text-align:left;';
      btn.innerHTML = `<b style="color:#fbbf24;">${br.name}</b> <span style="color:#cbd5e1;font-size:10px;">${br.desc}</span>`;
      btn.onclick = () => {
        if (unit.battleUpgrade(br.id)) {
          this.showToast(`专精「${br.name}」已激活！Lv2 → Lv3`);
          this.updateHUD();
          this.updateBuildBar();
          this.showInfoPanel(unit);
        }
      };
      sel.appendChild(btn);
    }
    const cancel = document.createElement('button');
    cancel.textContent = '取消';
    cancel.style.cssText = 'display:block;width:100%;margin-top:4px;padding:4px;font-size:10px;background:rgba(255,255,255,0.1);border:none;border-radius:4px;color:#94a3b8;cursor:pointer;';
    cancel.onclick = () => sel.remove();
    sel.appendChild(cancel);
    info.appendChild(sel);
  },

  enterMoveMode() {
    if (!this.selectedUnit || this.selectedUnit.isBuilding) return;
    if (this.gold < CONFIG.moveCost) { this.showToast('金币不足！'); return; }
    this.moveMode = true;
    this.hideInfoPanel();
    document.getElementById('moveHint').style.display = 'block';
  },

  // 集火模式切换：点击按钮进入选目标模式，再点按钮取消集火
  toggleFocusMode() {
    if (this.focusMode) {
      // 取消选目标模式
      this.focusMode = false;
      document.getElementById('focusHint').style.display = 'none';
    } else if (this.focusTarget) {
      // 已有集火目标 → 取消集火
      this.focusTarget = null;
      document.getElementById('focusBtn').classList.remove('active');
      this.showToast('已取消集火');
    } else {
      // 进入选目标模式
      if (this.monsters.filter(m => m.alive).length === 0) {
        this.showToast('当前没有敌人可集火');
        return;
      }
      this.focusMode = true;
      this.hideInfoPanel();
      document.getElementById('focusHint').style.display = 'block';
    }
  },

  sellUnit() {
    if (!this.selectedUnit) return;
    const u = this.selectedUnit;
    this.gold += u.sellValue;
    u.alive = false;
    this.units = this.units.filter(x => x !== u);
    this.selectedUnit = null;
    this.hideInfoPanel();
    this.buildableCells = null; // 出售后重建可建造范围缓存
    this.updateHUD();
    this.updateBuildBar();
    this.showToast('已出售 +💰' + u.sellValue);
  },

  onUnitDestroyed(unit) {
    // 单位被摧毁，从列表移除
    if (this.selectedUnit === unit) {
      this.selectedUnit = null;
      this.hideInfoPanel();
    }
  },

  loop(ts) {
    const dt = Math.min(0.05, (ts - this.lastTime) / 1000 || 0);
    this.lastTime = ts;
    if (this.state === 'playing') this.update(dt * this.gameSpeed);
    this.render();
    requestAnimationFrame(this.loop.bind(this));
  },

  toggleSpeed() {
    this.gameSpeed = this.gameSpeed === 1 ? 2 : 1;
    const btn = document.getElementById('speedBtn');
    if (btn) btn.textContent = this.gameSpeed === 1 ? '1x' : '2x';
    this.showToast('游戏速度: ' + this.gameSpeed + 'x');
  },

  update(dt) {
    // 生成怪物
    if (this.waveActive && this.spawnQueue.length > 0) {
      this.spawnTimer += dt;
      while (this.spawnQueue.length > 0 && this.spawnQueue[0].time <= this.spawnTimer) {
        const s = this.spawnQueue.shift();
        this.monsters.push(new Monster(s.type, s.col, {
          hp: this.levelCfg.hpMul, atk: this.levelCfg.atkMul, speed: this.levelCfg.speedMul
        }));
      }
    }

    // 单位
    const unitCountBefore = this.units.length;
    for (const u of this.units) u.update(dt);
    this.units = this.units.filter(u => u.alive);
    if (this.units.length !== unitCountBefore) this.buildableCells = null;

    // 怪物
    for (const m of this.monsters) m.update(dt);
    this.monsters = this.monsters.filter(m => m.alive);
    // 集火目标死亡则自动清除
    if (this.focusTarget && !this.focusTarget.alive) {
      this.focusTarget = null;
      const fb = document.getElementById('focusBtn');
      if (fb) fb.classList.remove('active');
      this.showToast('集火目标已被击杀');
    }

    // 天气系统：每6秒切换一次天气
    this.weatherTimer += dt;
    if (this.weatherTimer >= 6) {
      this.weatherTimer = 0;
      const r = Math.random();
      if (r < 0.1) {
        // 轻度污染：随机3个格子出现毒气
        this.weather = 'light';
        for (let i = 0; i < 3; i++) {
          const c = Math.floor(Math.random() * CONFIG.cols);
          const rw = Math.floor(Math.random() * CONFIG.rows);
          const existing = this.poisonCells.find(p => p.col === c && p.row === rw);
          if (existing) existing.remaining = 6;
          else this.poisonCells.push({ col: c, row: rw, remaining: 6, maxTime: 6, dps: 25 });
        }
        this.showToast('☁️ 轻度污染天气！随机区域出现毒气');
      } else if (r < 0.2) {
        // 重度污染：随机2个2*2区域出现毒气
        this.weather = 'heavy';
        for (let i = 0; i < 2; i++) {
          const c = Math.floor(Math.random() * (CONFIG.cols - 1));
          const rw = Math.floor(Math.random() * (CONFIG.rows - 1));
          for (let dc = 0; dc < 2; dc++) {
            for (let dr = 0; dr < 2; dr++) {
              const cc = c + dc, rr = rw + dr;
              const existing = this.poisonCells.find(p => p.col === cc && p.row === rr);
              if (existing) existing.remaining = 6;
              else this.poisonCells.push({ col: cc, row: rr, remaining: 6, maxTime: 6, dps: 25 });
            }
          }
        }
        this.showToast('☁️ 重度污染天气！大片区域出现毒气');
      } else {
        this.weather = 'normal';
      }
    }

    // 燃烧地面结算：经过的怪物 / 站在燃烧格上的单位获得燃烧 debuff
    for (const b of this.burningCells) {
      b.remaining -= dt;
      if (b.remaining <= 0) continue;
      // 怪物经过燃烧格
      for (const m of this.monsters) {
        if (!m.alive) continue;
        const mc = pxToCell(m.x, m.y);
        if (mc && mc.col === b.col && mc.row === b.row) {
          m.burnTimer = Math.max(m.burnTimer, b.debuffDur);
          m.burnDps = Math.max(m.burnDps, b.dps);
        }
      }
      // 单位（角色/建筑）站在燃烧格上
      for (const u of this.units) {
        if (!u.alive) continue;
        if (u.col === b.col && u.row === b.row) {
          u.burnTimer = Math.max(u.burnTimer, b.debuffDur);
          u.burnDps = Math.max(u.burnDps, b.dps);
        }
      }
    }
    this.burningCells = this.burningCells.filter(b => b.remaining > 0);

    // 毒气结算：玩家角色扣血；非丧尸类怪物（如蝙蝠怪）也扣血；建筑和丧尸免疫
    // 医院2格范围内的角色受到保护，免疫毒气
    const hospitals = this.units.filter(u => u.alive && u.type === 'hospital');
    const protectedByHospital = (col, row) => {
      return hospitals.some(h => Math.abs(h.col - col) + Math.abs(h.row - row) <= 2);
    };
    for (const p of this.poisonCells) {
      p.remaining -= dt;
      if (p.remaining <= 0) continue;
      for (const u of this.units) {
        if (!u.alive || u.isBuilding) continue; // 建筑免疫
        if (u.col === p.col && u.row === p.row) {
          if (protectedByHospital(u.col, u.row)) continue; // 医院保护范围内免疫
          u.takeDamage(p.dps * dt);
        }
      }
      for (const m of this.monsters) {
        if (!m.alive) continue;
        if (m.category === 'zombie') continue; // 丧尸免疫毒气
        if (m.col === p.col && m.row === p.row) {
          m.takeDamage(p.dps * dt);
        }
      }
    }
    this.poisonCells = this.poisonCells.filter(p => p.remaining > 0);

    // 投射物
    for (const p of this.projectiles) p.update(dt);
    this.projectiles = this.projectiles.filter(p => p.alive);

    // 特效
    for (const e of this.effects) e.update(dt);
    this.effects = this.effects.filter(e => e.alive);

    // 检查波次结束
    if (this.waveActive && this.spawnQueue.length === 0 && this.monsters.length === 0) {
      this.waveActive = false;
      const bonus = 30 + this.wave * 10;
      this.gold += bonus;
      const honorMul = this.levelCfg.honorMul || 1;
      let honor = Math.round(this.wave * honorMul);
      if (this.wave === CONFIG.totalWaves) honor += Math.round(10 * honorMul);
      Save.meta.honor += honor;
      this.honorEarned += honor;
      const lvlId = this.levelCfg.id;
      if (this.wave > (Save.meta.bestWaves[lvlId] || 0)) Save.meta.bestWaves[lvlId] = this.wave;
      Save.save();
      this.flashNotice('波次完成 +💰' + bonus + '  ⭐+' + honor, '#ffd700');
      this.updateHUD();
      this.updateBuildBar();
      if (this.wave < CONFIG.totalWaves) {
        setTimeout(() => { if (this.state === 'playing' && !this.waveActive) this.startNextWave(); }, 2500);
      } else {
        setTimeout(() => this.win(), 1500);
      }
    }
  },

  flashNotice(text, color) {
    const el = document.getElementById('waveNotice');
    el.textContent = text;
    el.style.textShadow = '0 0 12px ' + color + ', 0 2px 4px rgba(0,0,0,0.8)';
    el.style.opacity = '1';
    setTimeout(() => { el.style.opacity = '0'; }, 1200);
  },

  win() {
    this.state = 'won';
    document.getElementById('hud').style.display = 'none';
    document.getElementById('buildBar').style.display = 'none';
    document.getElementById('buildTabs').style.display = 'none';
    this.hideInfoPanel();
    Save.clearGame();
    // 解锁下一关
    const next = this.levelId + 1;
    const curUnlocked = Save.meta.unlockedLevel || 1;
    if (next > curUnlocked && next <= LEVELS.length) {
      Save.meta.unlockedLevel = next;
      Save.save();
    }
    const el = document.getElementById('endTitle');
    el.textContent = '🏆 胜利！';
    el.style.background = 'linear-gradient(90deg, #ffd700, #22c55e)';
    el.style.webkitBackgroundClip = 'text'; el.style.webkitTextFillColor = 'transparent';
    const unlockMsg = (next <= LEVELS.length && next > curUnlocked) ? `<br>🎉 解锁新关卡：${LEVELS[next-1].name}` : '';
    document.getElementById('endMsg').innerHTML = `你成功守护了基地！<br>本局获得功勋点：<span style="color:#fbbf24;">⭐${this.honorEarned}</span><br>累计功勋点：⭐${Save.meta.honor}${unlockMsg}`;
    document.getElementById('endScreen').style.display = 'flex';
  },

  lose() {
    this.state = 'lost';
    document.getElementById('hud').style.display = 'none';
    document.getElementById('buildBar').style.display = 'none';
    document.getElementById('buildTabs').style.display = 'none';
    this.hideInfoPanel();
    Save.clearGame();
    const el = document.getElementById('endTitle');
    el.textContent = '💀 基地沦陷';
    el.style.background = 'linear-gradient(90deg, #ef4444, #f97316)';
    el.style.webkitBackgroundClip = 'text'; el.style.webkitTextFillColor = 'transparent';
    document.getElementById('endMsg').innerHTML = `基地被摧毁了！你坚持到了第 ${this.wave} 波。<br>本局获得功勋点：<span style="color:#fbbf24;">⭐${this.honorEarned}</span><br>去升级商店强化后再战吧！`;
    document.getElementById('endScreen').style.display = 'flex';
  },

  // ---------- 渲染 ----------
  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, CW, CV);
    if (this.state === 'menu' || this.state === 'shop') return;

    this.drawGrid(ctx);
    this.drawBase(ctx);

    // 医院保护光圈（2格范围，持续脉动）
    for (const u of this.units) {
      if (!u.alive || u.type !== 'hospital') continue;
      const hc = cellCenter(u.col, u.row);
      const r = 2 * CONFIG.cellW;
      const t = Date.now() / 1000;
      const pulse = 0.6 + Math.sin(t * 2) * 0.4;
      ctx.save();
      // 外圈实线光环
      ctx.strokeStyle = `rgba(34,197,94,${0.7 * pulse})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(hc.x, hc.y, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 天气指示器（右上角）
    if (this.weather !== 'normal') {
      ctx.save();
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'right';
      if (this.weather === 'light') {
        ctx.fillStyle = 'rgba(132,204,22,0.9)';
        ctx.fillText('☁️ 轻度污染', CW - 10, CONFIG.topOffset - 8);
      } else if (this.weather === 'heavy') {
        ctx.fillStyle = 'rgba(220,38,38,0.9)';
        ctx.fillText('☁️ 重度污染', CW - 10, CONFIG.topOffset - 8);
      }
      ctx.restore();
    }

    // 毒气格：绿色半透明 + 脉动粒子
    for (const p of this.poisonCells) {
      const c = cellCenter(p.col, p.row);
      const alpha = 0.25 + Math.sin(Date.now() / 200) * 0.08;
      ctx.save();
      ctx.fillStyle = `rgba(101,163,13,${alpha})`;
      ctx.fillRect(c.x - CONFIG.cellW / 2, c.y - CONFIG.cellH / 2, CONFIG.cellW, CONFIG.cellH);
      // 毒气粒子（小圆点随机漂浮）
      ctx.fillStyle = 'rgba(132,204,22,0.5)';
      for (let i = 0; i < 4; i++) {
        const t = (Date.now() / 1000 + i * 1.7) % 2;
        const px = c.x + Math.sin(t * 3 + i) * 12;
        const py = c.y - (t * 20) + Math.cos(t * 2 + i) * 8;
        ctx.beginPath();
        ctx.arc(px, py, 2 + t, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // 选中单位的生效/攻击范围
    if (this.selectedUnit) {
      const su = this.selectedUnit;
      if (su.cfg.flame) {
        // 火焰塔：显示四方向直线射程预览
        const dirs = [[0,-1],[0,1],[-1,0],[1,0]];
        ctx.strokeStyle = 'rgba(249,115,22,0.7)';
        ctx.fillStyle = 'rgba(249,115,22,0.12)';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([6, 4]);
        for (const [dc, dr] of dirs) {
          const tx = su.x + dc * su.range * CONFIG.cellW;
          const ty = su.y + dr * su.range * CONFIG.cellH;
          ctx.beginPath();
          ctx.moveTo(su.x, su.y);
          ctx.lineTo(tx, ty);
          ctx.stroke();
        }
        ctx.setLineDash([]);
      } else if (su.canAttack) {
        // 攻击单位：青色范围
        ctx.strokeStyle = 'rgba(78,205,196,0.7)';
        ctx.fillStyle = 'rgba(78,205,196,0.12)';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.arc(su.x, su.y, su.range * CONFIG.cellW, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
        ctx.setLineDash([]);
      } else if (su.type === 'hospital') {
        // 医院：绿色治疗范围
        ctx.strokeStyle = 'rgba(34,197,94,0.7)';
        ctx.fillStyle = 'rgba(34,197,94,0.12)';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.arc(su.x, su.y, su.range * CONFIG.cellW, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
        ctx.setLineDash([]);
      }
      // 选中高亮描边
      ctx.strokeStyle = 'rgba(255,215,0,0.9)';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.arc(su.x, su.y, 22, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 移动模式高亮相邻格
    if (this.moveMode && this.selectedUnit) {
      const u = this.selectedUnit;
      const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
      for (const [dc, dr] of dirs) {
        const nc = u.col + dc, nr = u.row + dr;
        if (nc < 0 || nc >= CONFIG.cols || nr < 0 || nr >= CONFIG.rows) continue;
        if (this.getUnit(nc, nr)) continue;
        if (nc === CONFIG.baseCol && nr === CONFIG.baseRow) continue;
        const x = nc * CONFIG.cellW;
        const y = nr * CONFIG.cellH + CONFIG.topOffset;
        ctx.fillStyle = 'rgba(78,205,196,0.35)';
        ctx.fillRect(x, y, CONFIG.cellW, CONFIG.cellH);
      }
    }

    // 单位
    for (const u of this.units) u.draw(ctx);

    // 怪物
    for (const m of this.monsters) m.draw(ctx);
    // 集火目标标记：红色脉动圆环
    if (this.focusTarget && this.focusTarget.alive) {
      const ft = this.focusTarget;
      const r = (ft.cfg.size || 16) + 8 + Math.sin(Date.now() / 150) * 3;
      ctx.save();
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(ft.x, ft.y, r, 0, Math.PI * 2);
      ctx.stroke();
      // 十字准星
      ctx.beginPath();
      ctx.moveTo(ft.x - r - 4, ft.y); ctx.lineTo(ft.x - r + 2, ft.y);
      ctx.moveTo(ft.x + r - 2, ft.y); ctx.lineTo(ft.x + r + 4, ft.y);
      ctx.moveTo(ft.x, ft.y - r - 4); ctx.lineTo(ft.x, ft.y - r + 2);
      ctx.moveTo(ft.x, ft.y + r - 2); ctx.lineTo(ft.x, ft.y + r + 4);
      ctx.stroke();
      ctx.restore();
    }

    // 投射物
    for (const p of this.projectiles) p.draw(ctx);

    // 特效
    for (const e of this.effects) e.draw(ctx);

    // 建造预览
    if (this.selectedBuildType && this.hoverCell) this.drawBuildPreview(ctx);
  },

  drawGrid(ctx) {
    for (let r = 0; r < CONFIG.rows; r++) {
      for (let c = 0; c < CONFIG.cols; c++) {
        const x = c * CONFIG.cellW;
        const y = r * CONFIG.cellH + CONFIG.topOffset;
        const isBase = (c === CONFIG.baseCol && r === CONFIG.baseRow);
        if (isBase) continue;
        ctx.fillStyle = (c + r) % 2 === 0 ? '#2d6a4f' : '#40916c';
        ctx.fillRect(x, y, CONFIG.cellW, CONFIG.cellH);
        ctx.strokeStyle = 'rgba(0,0,0,0.15)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x+0.5, y+0.5, CONFIG.cellW-1, CONFIG.cellH-1);
      }
    }
    // 选中建造类型时，高亮所有可放置位置（使用预计算缓存）
    if (this.selectedBuildType) {
      const highlightCell = (c, r) => {
        if (c === CONFIG.baseCol && r === CONFIG.baseRow) return;
        if (this.getUnit(c, r)) return;
        const x = c * CONFIG.cellW;
        const y = r * CONFIG.cellH + CONFIG.topOffset;
        ctx.fillStyle = 'rgba(78,205,196,0.25)';
        ctx.fillRect(x, y, CONFIG.cellW, CONFIG.cellH);
        ctx.strokeStyle = 'rgba(78,205,196,0.7)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4,3]);
        ctx.strokeRect(x+1, y+1, CONFIG.cellW-2, CONFIG.cellH-2);
        ctx.setLineDash([]);
      };
      if (this.selectedBuildType === 'outpost') {
        // 前哨站：高亮地图上所有空格
        for (let r = 0; r < CONFIG.rows; r++) {
          for (let c = 0; c < CONFIG.cols; c++) highlightCell(c, r);
        }
      } else {
        if (!this.buildableCells) this.recomputeBuildableCells();
        for (const key of this.buildableCells) {
          const [c, r] = key.split(',').map(Number);
          highlightCell(c, r);
        }
      }
    }
  },

  drawBase(ctx) {
    const c = cellCenter(CONFIG.baseCol, CONFIG.baseRow);
    const bx = c.x, by = c.y;
    // 基地格子底色
    ctx.fillStyle = '#475569';
    ctx.fillRect(CONFIG.baseCol*CONFIG.cellW, CONFIG.baseRow*CONFIG.cellH+CONFIG.topOffset, CONFIG.cellW, CONFIG.cellH);
    // 阴影
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(bx, by+14, 22, 6, 0, 0, Math.PI*2);
    ctx.fill();
    // 城堡主体
    ctx.fillStyle = '#64748b';
    ctx.fillRect(bx-20, by-6, 40, 22);
    ctx.fillStyle = '#475569';
    for (let i = 0; i < 4; i++) ctx.fillRect(bx-20 + i*10, by-12, 7, 6);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(bx-5, by+2, 10, 14);
    // 旗帜
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(bx-1, by-22, 2, 11);
    ctx.beginPath();
    ctx.moveTo(bx+1, by-22); ctx.lineTo(bx+9, by-18); ctx.lineTo(bx+1, by-14);
    ctx.fill();
    // 标签
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🏰基地', bx, by-26);
    // 血条
    const ratio = Math.max(0, this.baseHp / CONFIG.baseHp);
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(bx-24, by+16, 48, 5);
    ctx.fillStyle = ratio > 0.5 ? '#22c55e' : ratio > 0.25 ? '#eab308' : '#ef4444';
    ctx.fillRect(bx-24, by+16, 48 * ratio, 5);
  },

  drawBuildPreview(ctx) {
    const { col, row } = this.hoverCell;
    const x = col * CONFIG.cellW;
    const y = row * CONFIG.cellH + CONFIG.topOffset;
    const isBase = (col === CONFIG.baseCol && row === CONFIG.baseRow);
    const occupied = !!this.getUnit(col, row) || !!this.getEnemyBuildingAt(col, row);
    const inRange = this.canBuildAt(col, row);
    const canBuild = !isBase && !occupied && inRange;
    ctx.fillStyle = canBuild ? 'rgba(78,205,196,0.3)' : 'rgba(239,68,68,0.3)';
    ctx.fillRect(x, y, CONFIG.cellW, CONFIG.cellH);
    if (canBuild) {
      const c = cellCenter(col, row);
      const cfg = UNIT_TYPES[this.selectedBuildType];
      ctx.globalAlpha = 0.7;
      drawUnitVector(ctx, this.selectedBuildType, c.x, c.y, 20, false);
      ctx.globalAlpha = 1;
      // 射程预览
      if (cfg.range > 0) {
        if (cfg.flame) {
          // 火焰塔：四方向直线
          const dirs = [[0,-1],[0,1],[-1,0],[1,0]];
          ctx.strokeStyle = 'rgba(249,115,22,0.5)';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([5,4]);
          for (const [dc, dr] of dirs) {
            ctx.beginPath();
            ctx.moveTo(c.x, c.y);
            ctx.lineTo(c.x + dc*cfg.range*CONFIG.cellW, c.y + dr*cfg.range*CONFIG.cellH);
            ctx.stroke();
          }
          ctx.setLineDash([]);
        } else {
          ctx.strokeStyle = 'rgba(78,205,196,0.4)';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([5,4]);
          ctx.beginPath();
          ctx.arc(c.x, c.y, cfg.range * CONFIG.cellW, 0, Math.PI*2);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }
    }
  }
};

// 鼠标移动追踪
document.addEventListener('mousemove', (e) => {
  if (!Game.canvas) return;
  const p = clientToCanvas(e);
  Game.hoverCell = pxToCell(p.x, p.y);
});

window.addEventListener('load', () => Game.init());
