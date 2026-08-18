const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:4173',
  'http://127.0.0.1:5173',
]

const MAX_JOB_TITLE = 100
const MAX_JOB_DESCRIPTION = 10000
const MAX_RESUME = 10000
const VALID_DIFFICULTIES = new Set(['basic', 'comprehensive', 'hard', 'difficult'])
const VALID_QUESTION_DIFFICULTIES = new Set(['basic', 'comprehensive', 'hard'])
const VALID_TYPES = new Set(['main', 'follow_up', 'deep_dive'])
const LLM_TIMEOUT_MS = 25000

const INTERVIEW_PLANNER_SYSTEM_PROMPT = `你是一名资深招聘经理和 AI 面试设计专家。

你的任务是根据候选人的目标岗位、岗位 JD、个人简历和面试难度，设计一场约 5 轮的结构化模拟面试计划。

你必须遵守以下原则：

1. 综合分析 JD 的职责（responsibilities）、任职要求（requirements）、简历中的项目与技能，生成最相关的 3～5 个能力维度（competencies）。
2. 不要对所有岗位套用同一套能力列表。能力名称使用简洁中文，例如：产品思维、需求分析、用户研究、数据分析、项目经验、AI 知识、沟通表达、场景分析。
3. candidateHighlights 必须严格来自简历原文信息，只能概括或引用简历中已经出现的内容。
4. 禁止虚构候选人没有的经历、项目、公司、职级、数据、用户规模、业绩、技术栈。如果没有明确证据，不要生成。
5. strategy 需要说明：本次面试重点、需要验证哪些能力、哪些经历值得深挖、以及当前难度下的考察方式。
6. firstQuestion 必须与岗位和简历相关，能验证一个重要能力，并符合面试难度。避免空泛的「请介绍一下你自己」，优先生成有区分度的问题。
7. 只输出合法 JSON，不要输出 Markdown、解释性文字或代码块标记。`

const DIFFICULTY_LABELS = {
  basic: '基础',
  comprehensive: '综合',
  hard: '困难',
}

class LlmUpstreamError extends Error {
  constructor(statusCode, message = 'Planner service unavailable') {
    super(message)
    this.name = 'LlmUpstreamError'
    this.statusCode = statusCode
  }
}

function getAllowedOrigins() {
  const fromEnv = process.env.ALLOWED_ORIGINS?.split(',').map((item) => item.trim()).filter(Boolean)
  const origins = fromEnv && fromEnv.length > 0 ? [...fromEnv] : [...DEFAULT_ALLOWED_ORIGINS]

  if (process.env.GITHUB_PAGES_ORIGIN?.trim()) {
    origins.push(process.env.GITHUB_PAGES_ORIGIN.trim())
  }

  return [...new Set(origins)]
}

function resolveCorsOrigin(requestOrigin) {
  if (!requestOrigin) return null
  const allowed = getAllowedOrigins()
  return allowed.includes(requestOrigin) ? requestOrigin : null
}

function applyCorsHeaders(headers, requestOrigin) {
  const allowedOrigin = resolveCorsOrigin(requestOrigin)
  if (!allowedOrigin) return headers

  return {
    ...headers,
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  }
}

function normalizeDifficulty(value) {
  if (value === 'difficult') return 'hard'
  if (value === 'basic' || value === 'comprehensive' || value === 'hard') return value
  return null
}

function parseRequestBody(body) {
  if (typeof body === 'string') {
    try {
      return JSON.parse(body)
    } catch {
      return null
    }
  }
  return body
}

function validatePlannerRequest(body) {
  const payload = parseRequestBody(body)
  if (!payload || typeof payload !== 'object') return null

  const jobTitle = typeof payload.jobTitle === 'string' ? payload.jobTitle.trim() : ''
  const jobDescription =
    typeof payload.jobDescription === 'string' ? payload.jobDescription.trim() : ''
  const resume = typeof payload.resume === 'string' ? payload.resume.trim() : ''
  const difficultyRaw = typeof payload.difficulty === 'string' ? payload.difficulty.trim() : ''

  if (!jobTitle || !jobDescription || !resume || !difficultyRaw) return null
  if (!VALID_DIFFICULTIES.has(difficultyRaw)) return null

  const difficulty = normalizeDifficulty(difficultyRaw)
  if (!difficulty) return null
  if (jobTitle.length > MAX_JOB_TITLE) return null
  if (jobDescription.length > MAX_JOB_DESCRIPTION) return null
  if (resume.length > MAX_RESUME) return null

  return { jobTitle, jobDescription, resume, difficulty }
}

function buildInterviewPlannerUserPrompt(request) {
  return [
    '请根据以下信息生成面试计划 JSON：',
    '',
    `目标岗位：${request.jobTitle}`,
    `面试难度：${DIFFICULTY_LABELS[request.difficulty]}（${request.difficulty}）`,
    '',
    '岗位 JD：',
    request.jobDescription,
    '',
    '候选人简历：',
    request.resume,
    '',
    '输出 JSON 结构：',
    '{',
    '  "competencies": [',
    '    { "name": "能力名称", "priority": 1, "reason": "为什么考察该能力" }',
    '  ],',
    '  "candidateHighlights": ["必须来自简历的亮点，不可虚构"],',
    '  "strategy": "面试策略说明",',
    '  "firstQuestion": {',
    '    "id": "llm-first-question",',
    '    "question": "第一道题",',
    '    "competency": "对应能力",',
    '    "difficulty": "basic | comprehensive | hard",',
    '    "type": "main | follow_up | deep_dive"',
    '  }',
    '}',
  ].join('\n')
}

function extractJsonObject(text) {
  const trimmed = text.trim()
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fenced?.[1]) return fenced[1].trim()

  const start = trimmed.indexOf('{')
  const end = trimmed.lastIndexOf('}')
  if (start >= 0 && end > start) return trimmed.slice(start, end + 1)

  return trimmed
}

async function callPlannerLlm(request) {
  const apiKey = process.env.LLM_API_KEY
  const apiBaseUrl = process.env.LLM_API_BASE_URL ?? 'https://api.openai.com/v1'
  const model = process.env.LLM_MODEL ?? 'gpt-4o-mini'

  if (!apiKey) {
    throw new LlmUpstreamError(500, 'Planner service unavailable')
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), LLM_TIMEOUT_MS)

  try {
    const upstream = await fetch(`${apiBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        max_tokens: 2000,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: INTERVIEW_PLANNER_SYSTEM_PROMPT },
          { role: 'user', content: buildInterviewPlannerUserPrompt(request) },
        ],
      }),
      signal: controller.signal,
    })

    if (upstream.status === 401 || upstream.status === 403) {
      throw new LlmUpstreamError(500, 'Planner service unavailable')
    }
    if (upstream.status === 429) {
      throw new LlmUpstreamError(503, 'Planner service unavailable')
    }
    if (!upstream.ok) {
      throw new LlmUpstreamError(500, 'Planner service unavailable')
    }

    const payload = await upstream.json()
    const content = payload?.choices?.[0]?.message?.content
    if (!content) {
      throw new LlmUpstreamError(502, 'Planner service unavailable')
    }

    return JSON.parse(extractJsonObject(content))
  } catch (error) {
    if (error instanceof LlmUpstreamError) throw error
    if (error instanceof Error && error.name === 'AbortError') {
      throw new LlmUpstreamError(504, 'Planner request timed out')
    }
    throw new LlmUpstreamError(500, 'Planner service unavailable')
  } finally {
    clearTimeout(timeoutId)
  }
}

function validatePlannerResponse(data) {
  if (!data || typeof data !== 'object') return null
  if (!Array.isArray(data.competencies) || !Array.isArray(data.candidateHighlights)) return null
  if (data.competencies.length < 3 || data.competencies.length > 5) return null
  if (typeof data.strategy !== 'string' || !data.strategy.trim()) return null
  if (!data.firstQuestion || typeof data.firstQuestion !== 'object') return null

  const question = data.firstQuestion
  if (!question.question?.trim() || !question.competency?.trim()) return null

  const competencies = data.competencies
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const name = typeof item.name === 'string' ? item.name.trim() : ''
      const reason = typeof item.reason === 'string' ? item.reason.trim() : ''
      const priority = typeof item.priority === 'number' ? item.priority : 0
      if (!name) return null
      return { name, priority, reason }
    })
    .filter(Boolean)

  if (competencies.length < 3 || competencies.length > 5) return null

  const candidateHighlights = data.candidateHighlights
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean)

  const difficulty =
    question.difficulty && VALID_QUESTION_DIFFICULTIES.has(question.difficulty)
      ? question.difficulty
      : 'comprehensive'
  const type = question.type && VALID_TYPES.has(question.type) ? question.type : 'main'

  return {
    competencies,
    candidateHighlights,
    strategy: data.strategy.trim(),
    firstQuestion: {
      id: typeof question.id === 'string' && question.id.trim() ? question.id.trim() : 'llm-first-question',
      question: question.question.trim(),
      competency: question.competency.trim(),
      difficulty,
      type,
    },
  }
}

function getRequestOrigin(headers) {
  const origin = headers?.origin
  return typeof origin === 'string' ? origin : undefined
}

function sendJson(res, status, body, requestOrigin) {
  const headers = applyCorsHeaders({ 'Content-Type': 'application/json' }, requestOrigin)
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value)
  }
  res.status(status).json(body)
}

export default async function handler(req, res) {
  const requestOrigin = getRequestOrigin(req.headers)

  try {
    if (req.method === 'OPTIONS') {
      const headers = applyCorsHeaders({}, requestOrigin)
      for (const [key, value] of Object.entries(headers)) {
        res.setHeader(key, value)
      }
      return res.status(204).end()
    }

    if (req.method !== 'POST') {
      return sendJson(res, 405, { success: false, error: 'Method not allowed' }, requestOrigin)
    }

    const validatedRequest = validatePlannerRequest(req.body)
    if (!validatedRequest) {
      return sendJson(res, 400, { success: false, error: 'Invalid request' }, requestOrigin)
    }

    const llmData = await callPlannerLlm(validatedRequest)
    const validatedResponse = validatePlannerResponse(llmData)

    if (!validatedResponse) {
      return sendJson(res, 502, { success: false, error: 'Planner service unavailable' }, requestOrigin)
    }

    return sendJson(res, 200, { success: true, data: validatedResponse }, requestOrigin)
  } catch (error) {
    if (error instanceof LlmUpstreamError) {
      return sendJson(res, error.statusCode, { success: false, error: error.message }, requestOrigin)
    }

    console.error('[planner] handler error')
    return sendJson(res, 500, { success: false, error: 'Planner service unavailable' }, requestOrigin)
  }
}
