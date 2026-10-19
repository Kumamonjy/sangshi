// 最终处理：
// 1) calculateDamage 函数内的 attackPower 多行块
// 2) calculateDamage 函数内的 defense 多行块
// 3) AI 评估中 char.attack 变体（3处）

const fs = require('fs');
const FILE_PATH = 'e:\\project_jy\\sangshi\\src\\stores\\gameStore.ts';
let src = fs.readFileSync(FILE_PATH, 'utf-8');
const replaced = [];

function lineAt(text, pos) {
  let line = 1;
  for (let i = 0; i < pos; i++) if (text.charCodeAt(i) === 10) line++;
  return line;
}

// 模式 A：calculateDamage 内的 attackPower（带 baseAttack fallback，多行 if）
//   let attackPower = attacker.attack || attackerTemplate?.baseAttack || 20
//   <空行/注释>
//   if (attacker.attackBoost) {
//     attackPower = Math.floor(attackPower * (1 + attacker.attackBoost / 100))
//   }
const reCalcAtk = /([ \t]+)let attackPower = attacker\.attack \|\| attackerTemplate\?\.baseAttack \|\| 20[ \t]*\r?\n(?:[ \t]*(?:\/\/[^\r\n]*)?\r?\n)*[ \t]+if \(attacker\.attackBoost\) \{\r?\n[ \t]+attackPower = Math\.floor\(attackPower \* \(1 \+ attacker\.attackBoost \/ 100\)\)[ \t]*\r?\n[ \t]+\}[ \t]*(\r?\n)?/g;

let m;
while ((m = reCalcAtk.exec(src)) !== null) {
  const line = lineAt(src, m.index);
  const indent = m[1];
  const newline = m[2] || '\n';
  const replacement = `${indent}const attackPower = computeAttackPower(attacker)${newline}`;
  replaced.push({ line, type: 'calculateDamage_attack' });
  src = src.slice(0, m.index) + replacement + src.slice(m.index + m[0].length);
  reCalcAtk.lastIndex = m.index + replacement.length;
}

// 模式 B：calculateDamage 内的 defense（多行 if）
//   let defense = target.defense || 5
//   <空行/注释>
//   if (target.isDefending) {
//     defense = Math.floor(defense * 1.2)
//   }
//   <空行/注释>
//   if (target.defenseReduction) {
//     defense = Math.floor(defense * (1 - target.defenseReduction / 100))
//   }
//   <空行/注释>
//   if (target.defenseReductionPermanent) {
//     defense = Math.floor(defense * (1 - target.defenseReductionPermanent / 100))
//   }
const reCalcDef = /([ \t]+)let defense = target\.defense \|\| 5[ \t]*\r?\n(?:[ \t]*(?:\/\/[^\r\n]*)?\r?\n)*[ \t]+if \(target\.isDefending\) \{\r?\n[ \t]+defense = Math\.floor\(defense \* 1\.2\)[ \t]*\r?\n[ \t]+\}[ \t]*\r?\n(?:[ \t]*(?:\/\/[^\r\n]*)?\r?\n)*[ \t]+if \(target\.defenseReduction\) \{\r?\n[ \t]+defense = Math\.floor\(defense \* \(1 \- target\.defenseReduction \/ 100\)\)[ \t]*\r?\n[ \t]+\}[ \t]*\r?\n(?:[ \t]*(?:\/\/[^\r\n]*)?\r?\n)*[ \t]+if \(target\.defenseReductionPermanent\) \{\r?\n[ \t]+defense = Math\.floor\(defense \* \(1 \- target\.defenseReductionPermanent \/ 100\)\)[ \t]*\r?\n[ \t]+\}[ \t]*(\r?\n)?/g;

while ((m = reCalcDef.exec(src)) !== null) {
  const line = lineAt(src, m.index);
  const indent = m[1];
  const newline = m[2] || '\n';
  const replacement = `${indent}const defense = computeDefensePower(target)${newline}`;
  replaced.push({ line, type: 'calculateDamage_defense' });
  src = src.slice(0, m.index) + replacement + src.slice(m.index + m[0].length);
  reCalcDef.lastIndex = m.index + replacement.length;
}

// 模式 C：AI 评估中 char.attack 变体（单行 if）
//   let attackPower = char.attack || (charTemplate?.baseAttack || 20)
//   if (char.attackBoost) attackPower = Math.floor(...)
const reCharAtk = /([ \t]+)let attackPower = char\.attack \|\| \(charTemplate\?\.baseAttack \|\| 20\)[ \t]*\r?\n[ \t]+if \(char\.attackBoost\) attackPower = Math\.floor\(attackPower \* \(1 \+ char\.attackBoost \/ 100\)\)[ \t]*(\r?\n)?/g;

while ((m = reCharAtk.exec(src)) !== null) {
  const line = lineAt(src, m.index);
  const indent = m[1];
  const newline = m[2] || '\n';
  // 这里 computeAttackPower(attacker) 需要变量名 char，所以是 computeAttackPower(char)
  const replacement = `${indent}const attackPower = computeAttackPower(char)${newline}`;
  replaced.push({ line, type: 'AI_eval_attack' });
  src = src.slice(0, m.index) + replacement + src.slice(m.index + m[0].length);
  reCharAtk.lastIndex = m.index + replacement.length;
}

fs.writeFileSync(FILE_PATH, src, 'utf-8');
console.log('本轮替换数:', replaced.length);
for (const r of replaced) {
  console.log(`  行 ${String(r.line).padStart(5)}  ${r.type}`);
}
