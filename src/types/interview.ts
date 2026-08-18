export type Difficulty = 'basic' | 'comprehensive' | 'hard'

export type QuestionType = 'main' | 'follow_up' | 'deep_dive'

export interface InterviewQuestion {
  id: string
  question: string
  competency: string
  difficulty: Difficulty
  type: QuestionType
}

export interface InterviewConfig {
  jobTitle: string
  jobDescription: string
  resume: string
  difficulty: Difficulty
}

export interface InterviewPlan {
  competencies: string[]
  candidateHighlights: string[]
  strategy: string
  firstQuestion: InterviewQuestion
  plannerSource?: 'llm' | 'rule'
}

export type DecisionAction = 'follow_up' | 'switch_competency' | 'increase_difficulty'

export interface NextQuestionDecision {
  nextQuestion: InterviewQuestion
  reason: string
  action: DecisionAction
  competency: string
}

export interface InterviewTurn {
  round: number
  question: InterviewQuestion
  answer: string
}

export interface InterviewReport {
  overallScore: number
  summary: string
  competencyScores: {
    competency: string
    score: number
  }[]
  strengths: string[]
  improvements: string[]
  advice: string[]
  strongestCompetency: string
  priorityImprovement: string
}

export interface InterviewContext {
  plan: InterviewPlan
  currentQuestion: InterviewQuestion
  currentAnswer: string
  questionHistory: InterviewQuestion[]
  answerHistory: string[]
  currentRound: number
  difficulty: Difficulty
}

export interface EvaluationContext {
  config: InterviewConfig
  plan: InterviewPlan
  turns: InterviewTurn[]
}

export const TOTAL_ROUNDS = 5

export const MAX_ANSWER_LENGTH = 500

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  basic: '基础',
  comprehensive: '综合',
  hard: '困难',
}

export const CORE_COMPETENCIES = [
  '产品思维',
  '项目经验',
  'AI 知识',
  '数据分析',
  '沟通表达',
] as const
