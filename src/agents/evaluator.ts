import type { EvaluationContext, InterviewReport } from '../types/interview'
import { CORE_COMPETENCIES } from '../types/interview'

const CASE_KEYWORDS = ['项目', '用户', '数据', '指标', '结果', '转化', '留存']
const USER_KEYWORDS = ['用户', '需求', '场景']
const DATA_KEYWORDS = ['数据', '指标', '转化', '留存', '分析']
const STRUCTURED_KEYWORDS = ['首先', '其次', '最后', '原因', '目标', '方案', '结果']

function containsAny(text: string, keywords: string[]): boolean {
  const lower = text.toLowerCase()
  return keywords.some((keyword) => lower.includes(keyword.toLowerCase()))
}

function clampScore(score: number): number {
  return Math.min(100, Math.max(0, Math.round(score)))
}

function scoreAnswer(answer: string): number {
  let score = 70

  if (answer.length < 30) score -= 5
  if (answer.length > 80) score += 3
  if (containsAny(answer, CASE_KEYWORDS)) score += 3
  if (containsAny(answer, STRUCTURED_KEYWORDS)) score += 2

  return clampScore(score)
}

function scoreCompetency(
  competency: string,
  turns: EvaluationContext['turns'],
  defaultScore: number,
): number {
  const related = turns.filter((t) => t.question.competency === competency)
  if (related.length === 0) return defaultScore

  const total = related.reduce((sum, t) => sum + scoreAnswer(t.answer), 0)
  return clampScore(total / related.length)
}

function generateStrengths(turns: EvaluationContext['turns']): string[] {
  const strengths: string[] = []
  const allAnswers = turns.map((t) => t.answer).join(' ')
  const avgLength =
    turns.reduce((sum, t) => sum + t.answer.length, 0) / (turns.length || 1)

  if (avgLength >= 60) {
    strengths.push('项目经历描述完整，能够展开关键细节。')
  }

  if (containsAny(allAnswers, USER_KEYWORDS)) {
    strengths.push('具备一定的用户需求意识，回答中能关联用户场景。')
  }

  if (containsAny(allAnswers, DATA_KEYWORDS)) {
    strengths.push('具备一定的数据分析意识，能提及指标或数据判断。')
  }

  if (containsAny(allAnswers, STRUCTURED_KEYWORDS)) {
    strengths.push('沟通表达结构较好，能按逻辑展开论述。')
  }

  if (containsAny(allAnswers, ['产品', '方案', '优先级'])) {
    strengths.push('产品思维较清晰，能围绕问题给出判断。')
  }

  if (strengths.length === 0) {
    strengths.push('完成了全部面试轮次，具备基本的面试应答能力。')
  }

  return strengths.slice(0, 3)
}

function generateImprovements(
  competencyScores: InterviewReport['competencyScores'],
): string[] {
  const sorted = [...competencyScores].sort((a, b) => a.score - b.score)
  const improvements: string[] = []

  const labelMap: Record<string, string> = {
    'AI 知识': 'AI 技术基础',
    数据分析: '数据指标意识',
    产品思维: '产品判断深度',
    项目经验: '案例量化表达',
    沟通表达: '结构化表达',
  }

  for (const item of sorted.slice(0, 2)) {
    if (item.score < 80) {
      improvements.push(labelMap[item.competency] ?? `${item.competency}仍有提升空间`)
    }
  }

  if (improvements.length === 0 && sorted[0]) {
    improvements.push(
      `${labelMap[sorted[0].competency] ?? sorted[0].competency}可以进一步结合具体案例和数据来支撑观点。`,
    )
  }

  return improvements.slice(0, 3)
}

function generateAdvice(
  competencyScores: InterviewReport['competencyScores'],
  priorityImprovement: string,
): string[] {
  const advice: string[] = []
  const lowest = [...competencyScores].sort((a, b) => a.score - b.score)[0]

  advice.push(
    `建议重点加强${priorityImprovement}，并在回答产品问题时增加具体的数据指标和业务结果。`,
  )

  if (lowest?.competency === 'AI 知识') {
    advice.push('系统学习大模型、RAG 与 Agent 的基础概念，并准备 1～2 个 AI 产品案例。')
  }

  if (lowest?.competency === '数据分析') {
    advice.push('练习用「指标—基线—变化—结论」结构说明数据驱动的决策过程。')
  }

  advice.push('每个项目准备一个 60 秒版本：背景、你的判断、行动、指标与复盘。')

  return advice.slice(0, 4)
}

function generatePerformanceSummary(
  competencyScores: InterviewReport['competencyScores'],
  strongest: string,
  weakest: string,
): string {
  const strongLabels = competencyScores
    .filter((item) => item.score >= 80)
    .map((item) => item.competency)

  const weakLabels = competencyScores
    .filter((item) => item.score < 75)
    .map((item) => item.competency)

  if (strongLabels.length > 0 && weakLabels.length > 0) {
    return `本次面试中，你在${strongLabels.slice(0, 2).join('和')}方面表现较好，但在${weakLabels.slice(0, 2).join('和')}方面仍有提升空间。`
  }

  if (strongLabels.length > 0) {
    return `本次面试中，你在${strongest}方面表现突出，整体回答较为完整，建议继续保持用数据和结果支撑结论。`
  }

  return `本次面试中，${weakest}是当前最需要优先提升的方向，建议下一轮重点补强相关案例与表达结构。`
}

export function generateInterviewReport(context: EvaluationContext): InterviewReport {
  const { turns, plan } = context
  const defaultScore = 72

  const competencyList =
    plan.competencies.length >= 3 ? plan.competencies : [...CORE_COMPETENCIES]

  const competencyScores = competencyList
    .map((competency) => ({
      competency,
      score: scoreCompetency(competency, turns, defaultScore),
    }))
    .sort((a, b) => b.score - a.score)

  const overallScore = clampScore(
    competencyScores.reduce((sum, item) => sum + item.score, 0) /
      competencyScores.length,
  )

  const strongestCompetency = competencyScores[0]?.competency ?? '项目经验'
  const priorityImprovement =
    competencyScores[competencyScores.length - 1]?.competency ?? '产品思维'

  const strengths = generateStrengths(turns)
  const improvements = generateImprovements(competencyScores)
  const advice = generateAdvice(competencyScores, priorityImprovement)
  const summary = generatePerformanceSummary(
    competencyScores,
    strongestCompetency,
    priorityImprovement,
  )

  return {
    overallScore,
    summary,
    competencyScores,
    strengths,
    improvements,
    advice,
    strongestCompetency,
    priorityImprovement,
  }
}
