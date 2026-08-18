# InterviewAgent LLM Planner Proxy

Deploy `api/planner.js` to Vercel (single serverless function, no sub-imports).

## Vercel environment variables

- `LLM_API_KEY` — required, server-side only (DeepSeek: from [platform.deepseek.com](https://platform.deepseek.com))
- `LLM_API_BASE_URL` — optional, default `https://api.openai.com/v1`
- `LLM_MODEL` — optional, default `gpt-4o-mini`
- `ALLOWED_ORIGINS` — comma-separated browser origins
- `GITHUB_PAGES_ORIGIN` — optional, e.g. `https://yourname.github.io`

### DeepSeek

| Variable | Value |
|----------|-------|
| `LLM_API_KEY` | Your DeepSeek API key (`sk-...`) |
| `LLM_API_BASE_URL` | `https://api.deepseek.com` |
| `LLM_MODEL` | `deepseek-chat` |

`https://api.deepseek.com/v1` also works. Do not append `/chat/completions`.

## Endpoint

`POST /api/planner`

## Frontend configuration

Set `public/llm-proxy.json`:

```json
{
  "proxyUrl": "https://YOUR-VERCEL-DOMAIN.vercel.app/api/planner"
}
```

Never put API keys in this file.
