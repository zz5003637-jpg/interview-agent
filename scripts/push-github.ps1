# InterviewAgent — 推送到 GitHub 并启用 Pages
# 在本机 PowerShell 运行（需能访问 github.com）:
#   .\scripts\push-github.ps1

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

$RepoName = "interview-agent"
$DefaultOwner = "zz5003637-jpg"

Write-Host "==> 项目目录: $Root"
Write-Host "==> 目标仓库: $DefaultOwner/$RepoName"
Write-Host ""

# 1. 确认已提交
$status = git status --porcelain
if ($status) {
  Write-Host "存在未提交更改，请先 commit。"
  git status --short
  exit 1
}

# 2. 分支 main
$branch = git branch --show-current
if ($branch -ne "main") {
  git branch -M main
}

# 3. 配置 remote
$remoteUrl = "https://github.com/$DefaultOwner/$RepoName.git"
$existing = git remote get-url origin 2>$null
if (-not $existing) {
  git remote add origin $remoteUrl
  Write-Host "已添加 remote: $remoteUrl"
} elseif ($existing -ne $remoteUrl) {
  Write-Host "当前 origin: $existing"
  $confirm = Read-Host "是否改为 $remoteUrl ? (y/n)"
  if ($confirm -eq "y") {
    git remote set-url origin $remoteUrl
  }
}

# 4. 创建 GitHub 仓库（需要 GitHub CLI）
$gh = Get-Command gh -ErrorAction SilentlyContinue
if (-not $gh) {
  $ghPath = "${env:ProgramFiles}\GitHub CLI\gh.exe"
  if (Test-Path $ghPath) { $gh = $ghPath }
}

if ($gh) {
  Write-Host "==> 检查 GitHub 登录..."
  & $gh auth status
  if ($LASTEXITCODE -ne 0) {
    Write-Host "请先运行: gh auth login"
    exit 1
  }

  Write-Host "==> 创建仓库（若已存在会跳过）..."
  & $gh repo create $RepoName --public --source=. --remote=origin --push 2>&1
  if ($LASTEXITCODE -ne 0) {
    Write-Host "创建失败或仓库已存在，尝试直接 push..."
    git push -u origin main
  }
} else {
  Write-Host "未检测到 gh CLI。"
  Write-Host "请先在 GitHub 网页创建空仓库: https://github.com/new"
  Write-Host "  名称: $RepoName"
  Write-Host "  不要勾选「Add a README」"
  Write-Host ""
  Write-Host "然后运行:"
  Write-Host "  git push -u origin main"
  exit 0
}

if ($LASTEXITCODE -eq 0) {
  Write-Host ""
  Write-Host "==> 推送成功!"
  Write-Host ""
  Write-Host "下一步 — 启用 GitHub Pages:"
  Write-Host "  1. 打开 https://github.com/$DefaultOwner/$RepoName/settings/pages"
  Write-Host "  2. Source 选「GitHub Actions」"
  Write-Host "  3. 打开 Actions 页，等待「Deploy to GitHub Pages」工作流完成"
  Write-Host ""
  Write-Host "Pages 地址（项目站）:"
  Write-Host "  https://$DefaultOwner.github.io/$RepoName/"
  Write-Host ""
  Write-Host "Vercel CORS — 在 Vercel 添加环境变量后 Redeploy:"
  Write-Host "  GITHUB_PAGES_ORIGIN=https://$DefaultOwner.github.io"
  Write-Host "  ALLOWED_ORIGINS=http://localhost:5173,http://localhost:4173,https://$DefaultOwner.github.io"
}
