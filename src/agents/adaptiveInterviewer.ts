import {
  FALLBACK_QUESTION,
  pickQuestionForCompetency,
  pickQuestion,
} from '../data/interviewQuestions'
import type {
  DecisionAction,
  Difficulty,
  InterviewContext,
  InterviewQuestion,
  NextQuestionDecision,
} from '../types/interview'

const PROJECT_KEYWORDS = [
  '项目',
  '负责',
  '用户',
  '需求',
  '功能',
  '设计',
  '数据',
  '指标',
  '系统',
  '产品',
  '平台',
]

const DEEP_ANSWER_KEYWORDS = ['用户', '需求', '数据', '指标', '结果']

function containsAny(text: string, keywords: string[]): boolean {
  const lower = text.toLowerCase()
  return keywords.some((keyword) => lower.includes(keyword.toLowerCase()))
}

function countKeywordMatches(text: string, keywords: string[]): number {
  return keywords.filter((keyword) => text.includes(keyword)).length
}

function getUsedIds(questionHistory: InterviewQuestion[]): Set<string> {
  return new Set(questionHistory.map((q) => q.id))
}

function getRecentQuestionTexts(questionHistory: InterviewQuestion[], rounds = 2): string[] {
  return questionHistory.slice(-rounds).map((q) => q.question)
}

function extractProjectMention(answer: string): string | null {
  const patterns = [
    /(?:做过|参与|负责|开发)(?:一个|了)?(.{2,20}?)(?:系统|项目|平台|产品)/,
    /(.{2,15})(?:系统|项目|平台)/,
  ]
  for (const pattern of patterns) {
    const match = answer.match(pattern)
    if (match?.[1]?.trim()) return match[1].trim()
  }
  return null
}

function buildDynamicFollowUp(
  currentQuestion: InterviewQuestion,
  answer: string,
  difficulty: Difficulty,
  usedIds: Set<string>,
): InterviewQuestion {
  const mention = extractProjectMention(answer)
  if (mention) {
    return {
      id: `follow-up-dynamic-${currentQuestion.id}-${mention.slice(0, 8)}`,
      question: `你刚才提到了${mention}，可以具体介绍一下你在这个项目中负责的工作吗？`,
      competency: currentQuestion.competency,
      difficulty,
      type: 'follow_up',
    }
  }

  const bankFollowUp = pickQuestion(
    currentQuestion.competency,
    difficulty,
    'follow_up',
    usedIds,
  )
  if (bankFollowUp) return bankFollowUp

  return {
    id: `follow-up-generic-${currentQuestion.id}`,
    question: '可以进一步说明你在这个经历中的具体职责和成果吗？',
    competency: currentQuestion.competency,
    difficulty,
    type: 'follow_up',
  }
}

function isCompleteAnswer(answer: string): boolean {
  return answer.length >= 30 && containsAny(answer, PROJECT_KEYWORDS)
}

function isDeepAnswer(answer: string): boolean {
  const deepCount = countKeywordMatches(answer, DEEP_ANSWER_KEYWORDS)
  const bonusCount = countKeywordMatches(answer, [
    '转化',
    '流程',
    '分析',
    '优化',
    '判断',
    '访谈',
  ])
  return answer.length >= 100 && (deepCount >= 3 || (deepCount >= 2 && bonusCount >= 2))
}

function pickNextCompetency(
  competencies: string[],
  currentCompetency: string,
  questionHistory: InterviewQuestion[],
): string {
  const recentCompetencies = questionHistory.slice(-2).map((q) => q.competency)
  const candidates = competencies.filter((c) => c !== '需求分析' && c !== '自我介绍')

  const preferred = candidates.filter(
    (c) => c !== currentCompetency && !recentCompetencies.includes(c),
  )
  if (preferred.length > 0) return preferred[0]

  const alternate = candidates.filter((c) => c !== currentCompetency)
  if (alternate.length > 0) return alternate[0]

  return candidates[0] ?? currentCompetency
}

function pickDeepQuestion(
  competencies: string[],
  currentCompetency: string,
  difficulty: Difficulty,
  usedIds: Set<string>,
  recentTexts: string[],
): InterviewQuestion {
  const orderedCompetencies = [
    currentCompetency,
    ...competencies.filter((c) => c !== currentCompetency),
  ]

  for (const competency of orderedCompetencies) {
    const deep = pickQuestion(competency, difficulty, 'deep_dive', usedIds)
    if (deep && !recentTexts.includes(deep.question)) {
      return deep
    }
  }

  for (const competency of orderedCompetencies) {
    const main = pickQuestionForCompetency(competency, difficulty, usedIds, 'main')
    if (main && !recentTexts.includes(main.question)) {
      return main
    }
  }

  return FALLBACK_QUESTION
}

function pickSwitchQuestion(
  planCompetencies: string[],
  currentCompetency: string,
  questionHistory: InterviewQuestion[],
  difficulty: Difficulty,
  usedIds: Set<string>,
  preferDeep: boolean,
): InterviewQuestion {
  const recentTexts = getRecentQuestionTexts(questionHistory)
  const nextCompetency = pickNextCompetency(
    planCompetencies,
    currentCompetency,
    questionHistory,
  )

  const preferType = preferDeep ? 'deep_dive' : 'main'
  const nextQuestion =
    pickQuestionForCompetency(nextCompetency, difficulty, usedIds, preferType) ??
    pickQuestionForCompetency(nextCompetency, difficulty, usedIds) ??
    pickDeepQuestion(planCompetencies, currentCompetency, difficulty, usedIds, recentTexts)

  if (!recentTexts.includes(nextQuestion.question)) {
    return nextQuestion
  }

  return pickDeepQuestion(planCompetencies, currentCompetency, difficulty, usedIds, recentTexts)
}

function decideAction(answer: string): DecisionAction {
  if (answer.length < 30) return 'follow_up'
  if (isDeepAnswer(answer)) return 'increase_difficulty'
  if (isCompleteAnswer(answer)) return 'switch_competency'
  return 'switch_competency'
}

export function decideNextQuestion(context: InterviewContext): NextQuestionDecision {
  const { plan, currentQuestion, currentAnswer, questionHistory, difficulty } = context

  const usedIds = getUsedIds(questionHistory)
  const action = decideAction(currentAnswer)

  if (action === 'follow_up') {
    const nextQuestion = buildDynamicFollowUp(
      currentQuestion,
      currentAnswer,
      difficulty,
      usedIds,
    )
    return {
      nextQuestion,
      reason: '上一轮回答信息较少，因此继续深入了解当前能力维度。',
      action: 'follow_up',
      competency: nextQuestion.competency,
    }
  }

  if (action === 'increase_difficulty') {
    const recentTexts = getRecentQuestionTexts(questionHistory)
    const deepQuestion = pickDeepQuestion(
      plan.competencies,
      currentQuestion.competency,
      difficulty,
      usedIds,
      recentTexts,
    )

    return {
      nextQuestion: deepQuestion,
      reason: '上一轮回答较为完整，因此提高问题深度进行追问。',
      action: 'increase_difficulty',
      competency: deepQuestion.competency,
    }
  }

  const nextQuestion = pickSwitchQuestion(
    plan.competencies,
    currentQuestion.competency,
    questionHistory,
    difficulty,
    usedIds,
    false,
  )

  const nextCompetency = nextQuestion.competency

  return {
    nextQuestion,
    reason: `上一轮回答已覆盖「${currentQuestion.competency}」，切换到「${nextCompetency}」维度。`,
    action: 'switch_competency',
    competency: nextCompetency,
  }
}
