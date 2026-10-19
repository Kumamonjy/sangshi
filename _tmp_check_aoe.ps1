$path = 'e:\project_jy\sangshi\src\stores\gameStore.ts'
$lines = Get-Content $path -Encoding UTF8

# 找到所有 "else if (skillId === 'xxx') {" 的行，记录技能 ID 与行号
$skillBranches = @()
for ($i = 0; $i -lt $lines.Length; $i++) {
  if ($lines[$i] -match "else if \(skillId === '([^']+)'\) \{") {
    $skillBranches += @{ id = $matches[1]; start = $i + 1 }
  }
}
# 为每个分支找到下一个分支的开始行，作为其末端
for ($i = 0; $i -lt $skillBranches.Count; $i++) {
  if ($i + 1 -lt $skillBranches.Count) {
    $skillBranches[$i]['end'] = $skillBranches[$i + 1].start - 1
  } else {
    $skillBranches[$i]['end'] = $lines.Length
  }
}

$aoeSkills = @(
  'shui_man_jin_shan', 'mo_ying_jian_guang', 'tian_beng_di_lie',
  'da_di_zhong_ji', 'mo_lian_gui_shou', 'zi_bao_du_ye',
  'lian_yu_huo_hai', 'fushi_nianye', 'terror_scream',
  'yuan_cheng_dao_dan', 'qian_li_bing_feng', 'throw_grenade',
  'zhi_yu_zhi_guang', 'ku_lou_xue_shou_yin', 'wang_zhe_zhi_qi',
  'liu_hun_kong_zhou'
)

foreach ($id in $aoeSkills) {
  $b = $skillBranches | Where-Object { $_.id -eq $id }
  if (-not $b) {
    Write-Host "$id  -> NOT FOUND"
    continue
  }
  $startL = $b.start
  $endL = $b.end
  $block = ($lines[($startL - 1)..($endL - 1)]) -join "`n"
  $hasObstacle = $block -match 'obstacle'
  $kw = if ($hasObstacle) { '有' } else { '无' }
  Write-Host "$id  L$startL-L$endL  障碍物=$kw"
}
