import type { InterviewConfig, InterviewPlan, InterviewQuestion, QuestionType } from '../types/interview'
import type { LLMProvider, LlmPlannerResponse } from '../services/llm/llmProvider'

const VALID_DIFFICULTIES = new Set(['basic', 'comprehensive', 'hard'])
const VALID_TYPES = new Set<QuestionType>(['main', 'follow_up', 'deep_dive'])

function isHighlightSupportedByResume(highlight: string, resume: string): boolean {
  const normalizedHighlight = highlight.trim()
  if (!normalizedHighlight) return false

  if (resume.includes(normalizedHighlight)) {
    return true
  }

  const fragments = normalizedHighlight
    .split(/[，,、；;。]/)
    .map((part) => part.trim())
    .filter((part) => part.length >= 4)

  return fragments.some((fragment) => resume.includes(fragment))
}

function sanitizeHighlights(highlights: string[], resume: string): string[] {
  const unique = [...new Set(highlights.map((item) => item.trim()).filter(Boolean))]
  const supported = unique.filter((item) => isHighlightSupportedByResume(item, resume))

  if (supported.length > 0) {
    return supported.slice(0, 4)
  }

  const resumeLines = resume
    .split(/\n+/)
    .map((line) => line.trim())
    .filter((line) => line.length >= 8)

  return resumeLines.slice(0, 3)
}

function normalizeQuestion(
  payload: LlmPlannerResponse['firstQuestion'],
  config: InterviewConfig,
): InterviewQuestion {
  const difficulty = VALID_DIFFICULTIES.has(payload.difficulty)
    ? payload.difficulty
    : config.difficulty
  const type = VALID_TYPES.has(payload.type) ? payload.type : 'main'

  return {
    id: payload.id?.trim() || 'llm-first-question',
    question: payload.question?.trim() || '',
    competency: payload.competency?.trim() || '项目经验',
    difficulty,
    type,
  }
}

function mapLlmResponseToPlan(
  response: LlmPlannerResponse,
  config: InterviewConfig,
): InterviewPlan {
  const competencies = [...response.competencies]
    .sort((a, b) => a.priority - b.priority)
    .map((item) => item.name.trim())
    .filter(Boolean)

  if (competencies.length === 0) {
    throw new Error('LLM planner returned empty competencies')
  }

  const firstQuestion = normalizeQuestion(response.firstQuestion, config)
  if (!firstQuestion.question) {
    throw new Error('LLM planner returned empty first question')
  }

  const candidateHighlights = sanitizeHighlights(
    response.candidateHighlights ?? [],
    config.resume,
  )

  return {
    competencies: [...new Set(competencies)].slice(0, 5),
    candidateHighlights,
    strategy: response.strategy?.trim() || '围绕岗位核心能力展开结构化面试。',
    firstQuestion,
    plannerSource: 'llm',
  }
}

export async function generateLlmInterviewPlan(
  config: InterviewConfig,
  provider: LLMProvider,
): Promise<InterviewPlan> {
  const parsed = await provider.generatePlannerResponse(config)
  return mapLlmResponseToPlan(parsed, config)
}
