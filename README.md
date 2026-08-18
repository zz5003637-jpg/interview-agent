# InterviewAgent

面向求职者的 AI 面试模拟器 MVP。输入目标岗位、JD 和简历，完成 5 轮结构化模拟面试，并生成能力评估报告。

## 功能

- **首页**：填写岗位、JD、简历与难度
- **面试页**：5 轮问答，自适应追问（规则引擎），侧边栏历史记录
- **报告页**：综合得分、能力维度、优势/改进/建议、完整面试记录
- **AI 面试规划**：通过 Vercel API 调用 DeepSeek（失败时自动降级为规则引擎）

## 技术栈

- React 19 + TypeScript + Vite 8
- Tailwind CSS 4
- HashRouter（兼容 GitHub Pages）
- Vercel Serverless（`api/planner.js`）作为 LLM 代理

## 本地开发

```bash
npm install
npm run dev
```

浏览器打开 `http://localhost:5173`。

本地使用 LLM 规划需配置 `public/llm-proxy.json`：

```json
{
  "proxyUrl": "https://你的-vercel-域名.vercel.app/api/planner"
}
```

`proxyUrl` 为空时自动使用规则引擎规划，无需 API Key。

## 脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 本地开发 |
| `npm run build` | 生产构建（输出 `dist/`） |
| `npm run preview` | 预览构建结果 |
| `npm run lint` | Oxlint 检查 |
| `npm run verify` | 运行 Agent 逻辑验证 |
| `npm run verify:planner` | 验证 LLM Planner 映射逻辑 |

PowerShell 联调 API：

```powershell
.\scripts\test-planner-api.ps1 -ProxyUrl "https://你的域名.vercel.app/api/planner"
```

## 部署架构

```
GitHub Pages          Vercel
(静态前端)            (API 代理)
     │                    │
     │  POST /api/planner │
     └───────────────────►│──► DeepSeek API
```

### 1. Vercel（API 代理）

```powershell
npx vercel login
npx vercel deploy --prod --yes
```

在 Vercel Dashboard 配置环境变量（Production）：

| 变量 | DeepSeek 示例 |
|------|----------------|
| `LLM_API_KEY` | `sk-...` |
| `LLM_API_BASE_URL` | `https://api.deepseek.com` |
| `LLM_MODEL` | `deepseek-chat` |
| `ALLOWED_ORIGINS` | `http://localhost:5173,https://用户名.github.io` |

详见 `api/README.md`。

### 2. GitHub Pages（前端）

1. 推送代码到 GitHub
2. Settings → Pages → Source 选 **GitHub Actions**
3. 更新 `public/llm-proxy.json` 中的 `proxyUrl`
4. `push` 到 `main`/`master` 触发 `.github/workflows/deploy.yml`

## 项目结构

```
src/
  pages/          Home、Interview、Report
  agents/         Planner、Interviewer、Evaluator
  services/       interviewEngine、LLM Provider
api/
  planner.js      Vercel 服务端 LLM 代理
public/
  llm-proxy.json  前端代理地址（不含 Key）
```

## Agent 说明

| Agent | 实现 | 说明 |
|-------|------|------|
| Interview Planner | LLM + 规则降级 | 生成能力维度、策略与第一题 |
| Adaptive Interviewer | 规则引擎 | 追问、换能力、加深难度 |
| Evaluator | 规则引擎 | 基于回答与规划维度打分 |

## License

Private MVP — 仅供学习与演示。
