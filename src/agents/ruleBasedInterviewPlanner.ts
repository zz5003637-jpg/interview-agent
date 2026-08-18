import type { InterviewConfig, InterviewPlan, InterviewQuestion } from '../types/interview'
import { pickQuestionForCompetency } from '../data/interviewQuestions'

const PM_KEYWORDS = ['产品经理', 'product manager', '产品', 'pm']
const AI_KEYWORDS = ['ai', '人工智能', '大模型', 'llm', 'rag', 'agent']
const DATA_KEYWORDS = ['数据', 'sql', '指标', '分析', 'a/b test', 'ab test', '留存', '转化']
const TECH_KEYWORDS: Record<string, string[]> = {
  'Spring Boot': ['spring boot', 'springboot'],
  Vue: ['vue', 'vue.js', 'vue3'],
  Java: ['java'],
  Python: ['python'],
  React: ['react'],
  TypeScript: ['typescript'],
}

function containsAny(text: string, keywords: string[]): boolean {
  const lower = text.toLowerCase()
  return keywords.some((keyword) => lower.includes(keyword.toLowerCase()))
}

function countAiSignals(text: string): number {
  const lower = text.toLowerCase()
  return AI_KEYWORDS.filter((keyword) => lower.includes(keyword.toLowerCase())).length
}

function detectCompetencies(config: InterviewConfig): string[] {
  const combined = `${config.jobTitle} ${config.jobDescription}`
  const competencies: string[] = ['项目经验', '沟通表达']

  if (containsAny(combined, PM_KEYWORDS)) {
    competencies.push('产品思维', '需求分析')
  } else {
    competencies.push('产品思维')
  }

  if (containsAny(combined, DATA_KEYWORDS)) {
    competencies.push('数据分析')
  }

  if (containsAny(combined, AI_KEYWORDS)) {
    competencies.push('AI 知识')
  }

  if (config.difficulty !== 'basic') {
    competencies.push('场景分析')
  }

  return prioritizeCompetencies([...new Set(competencies)], combined)
}

function prioritizeCompetencies(competencies: string[], combined: string): string[] {
  const aiSignalCount = countAiSignals(combined)
  const isPmRole = containsAny(combined, PM_KEYWORDS)
  const ordered: string[] = []

  if (aiSignalCount >= 2) {
    ordered.push('AI 知识')
  }

  if (isPmRole) {
    for (const item of ['产品思维', '需求分析', '数据分析']) {
      if (competencies.includes(item) && !ordered.includes(item)) {
        ordered.push(item)
      }
    }
  }

  for (const item of competencies) {
    if (!ordered.includes(item)) {
      ordered.push(item)
    }
  }

  return ordered
}

function detectHighlights(resume: string): string[] {
  const highlights: string[] = []
  const lower = resume.toLowerCase()

  for (const [label, keywords] of Object.entries(TECH_KEYWORDS)) {
    if (keywords.some((k) => lower.includes(k))) {
      highlights.push(`具备 ${label} 相关技术经历`)
    }
  }

  if (containsAny(resume, ['负责', '主导', '带领', '团队'])) {
    highlights.push('简历中体现了项目负责或协作经历')
  }

  if (containsAny(resume, ['用户', '需求', '产品'])) {
    highlights.push('简历中涉及用户或产品相关工作')
  }

  if (highlights.length === 0) {
    highlights.push('简历提供了基本背景和经历信息')
  }

  return highlights.slice(0, 4)
}

function buildStrategy(config: InterviewConfig, competencies: string[]): string {
  const focus = competencies.slice(0, 4).join('、')
  const difficultyNote =
    config.difficulty === 'basic'
      ? '以基础概念和项目经历为主，逐步建立回答节奏。'
      : config.difficulty === 'comprehensive'
        ? '覆盖多个能力维度，结合场景与案例进行考察。'
        : '增加反事实、决策冲突和深度追问，检验综合判断力。'

  return `围绕「${focus}」展开 5 轮结构化面试。${difficultyNote}`
}

function selectFirstQuestion(config: InterviewConfig, competencies: string[]): InterviewQuestion {
  const usedIds = new Set<string>()
  const competency =
    config.difficulty === 'basic'
      ? '自我介绍'
      : competencies.includes('项目经验')
        ? '项目经验'
        : competencies[0]

  const question = pickQuestionForCompetency(
    competency,
    config.difficulty,
    usedIds,
    'main',
  )

  if (question) return question

  return {
    id: 'planner-fallback-01',
    question: '请先做个自我介绍，并说明你为什么对这个岗位感兴趣。',
    competency: '自我介绍',
    difficulty: config.difficulty,
    type: 'main',
  }
}

export function generateRuleBasedInterviewPlan(config: InterviewConfig): InterviewPlan {
  const competencies = detectCompetencies(config)
  const candidateHighlights = detectHighlights(config.resume)
  const strategy = buildStrategy(config, competencies)
  const firstQuestion = selectFirstQuestion(config, competencies)

  return {
    competencies,
    candidateHighlights,
    strategy,
    firstQuestion,
    plannerSource: 'rule',
  }
}
