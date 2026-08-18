# InterviewAgent 联调脚本 — 测试已部署的 /api/planner

param(
  [Parameter(Mandatory = $true)]
  [string]$ProxyUrl
)

function Normalize-ProxyUrl([string]$url) {
  $trimmed = $url.Trim()
  if ($trimmed -match '^(https?://)(.+)$') {
    $scheme = $matches[1]
    $rest = $matches[2] -replace '/+', '/'
    return "$scheme$rest"
  }
  return $trimmed -replace '/+', '/'
}

$ProxyUrl = Normalize-ProxyUrl $ProxyUrl

$body = @{
  jobTitle = "产品经理"
  jobDescription = "负责用户研究、需求分析、产品设计和数据分析。"
  resume = "参与校园失物招领管理系统项目，负责需求分析和产品设计。"
  difficulty = "comprehensive"
} | ConvertTo-Json -Compress

Write-Host "POST $ProxyUrl"
try {
  $response = Invoke-RestMethod -Method Post -Uri $ProxyUrl -ContentType "application/json" -Body $body -MaximumRedirection 5
  $response | ConvertTo-Json -Depth 10
} catch {
  $web = $_.Exception.Response
  if ($web) {
    $status = [int]$web.StatusCode
    $reader = New-Object System.IO.StreamReader($web.GetResponseStream())
    $errorBody = $reader.ReadToEnd()
    Write-Host "HTTP $status"
    Write-Host $errorBody
  } else {
    Write-Host $_.Exception.Message
  }
  exit 1
}
