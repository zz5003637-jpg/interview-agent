# InterviewAgent Vercel Proxy 部署脚本
# 用法:
#   1. 先登录: npx vercel login
#   2. 设置环境变量 (在 Vercel Dashboard 或):
#      npx vercel env add LLM_API_KEY production
#   3. 运行: .\scripts\deploy-vercel.ps1

$ErrorActionPreference = "Stop"

Write-Host "==> 检查 Vercel CLI 登录状态..."
npx vercel whoami
if ($LASTEXITCODE -ne 0) {
  Write-Host "请先运行: npx vercel login"
  exit 1
}

Write-Host "==> 部署 API Proxy 到 Vercel (production)..."
npx vercel deploy --prod --yes

if ($LASTEXITCODE -ne 0) {
  Write-Host "部署失败"
  exit 1
}

Write-Host ""
Write-Host "==> 部署完成。请将以下 URL 填入 public/llm-proxy.json:"
Write-Host "    https://YOUR-PROJECT.vercel.app/api/planner"
Write-Host ""
Write-Host "然后在 Vercel 设置环境变量:"
Write-Host "  LLM_API_KEY, GITHUB_PAGES_ORIGIN, ALLOWED_ORIGINS"
Write-Host "执行 npm run build 并推送 GitHub Pages。"
