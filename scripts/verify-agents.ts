import { decideNextQuestion } from '../src/agents/adaptiveInterviewer'
import { generateInterviewReport } from '../src/agents/evaluator'
import { generateRuleBasedInterviewPlan } from '../src/agents/ruleBasedInterviewPlanner'
import { FALLBACK_QUESTION } from '../src/data/interviewQuestions'
import type { InterviewPlan, InterviewQuestion } from '../src/types/interview'

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message)
}

const pmConfig = {
  jobTitle: '产品经理',
  jobDescription: '负责产品需求分析、用户研究、数据分析和 AI 产品设计。',
  resume: '参与过校园失物招领系统项目。',
  difficulty: 'comprehensive' as const,
}

const plainConfig = {
  jobTitle: '运营专员',
  jobDescription: '负责内容运营和用户沟通。',
  resume: '有新媒体运营经验。',
  difficulty: 'comprehensive' as const,
}

const aiPmConfig = {
  jobTitle: 'AI 产品经理',
  jobDescription: '负责大模型、RAG、Agent 产品设计，需要数据分析和用户研究能力。',
  resume: '参与过 AI 助手项目。',
  difficulty: 'comprehensive' as const,
}

const pmPlan = generateRuleBasedInterviewPlan(pmConfig)
assert(pmPlan.competencies.includes('产品思维'), 'PM plan should include 产品思维')
assert(pmPlan.competencies.includes('需求分析'), 'PM plan should include 需求分析')
assert(pmPlan.competencies.includes('数据分析'), 'PM plan should include 数据分析')
assert(pmPlan.competencies.includes('AI 知识'), 'PM plan with AI JD should include AI 知识')

const plainPlan = generateRuleBasedInterviewPlan(plainConfig)
assert(!plainPlan.competencies.includes('AI 知识'), 'Plain JD should not include AI 知识')

const aiPlan = generateRuleBasedInterviewPlan(aiPmConfig)
assert(aiPlan.competencies[0] === 'AI 知识', 'AI PM plan should prioritize AI 知识')

const projectQuestion: InterviewQuestion = {
  id: 'project-basic-01',
  question: '请介绍一个你负责过的项目。',
  competency: '项目经验',
  difficulty: 'comprehensive',
  type: 'main',
}

const shortDecision = decideNextQuestion({
  plan: pmPlan,
  currentQuestion: projectQuestion,
  currentAnswer: '我做过一个失物招领系统。',
  questionHistory: [projectQuestion],
  answerHistory: ['我做过一个失物招领系统。'],
  currentRound: 1,
  difficulty: 'comprehensive',
})
assert(shortDecision.action === 'follow_up', 'Short answer should trigger follow_up')
assert(
  shortDecision.nextQuestion.question.includes('失物招领'),
  'Follow-up should reference project mention',
)

const normalAnswer =
  '我负责了需求分析和功能设计，主要针对校园用户发布和查找失物的需求设计了失物发布、搜索和认领功能。'
const normalDecision = decideNextQuestion({
  plan: pmPlan,
  currentQuestion: projectQuestion,
  currentAnswer: normalAnswer,
  questionHistory: [projectQuestion],
  answerHistory: [normalAnswer],
  currentRound: 1,
  difficulty: 'comprehensive',
})
assert(normalDecision.action === 'switch_competency', 'Normal answer should switch competency')

const deepAnswer =
  '我首先通过用户访谈和问卷确定主要问题，然后分析用户发布、搜索和认领三个核心流程。上线后通过发布成功率、搜索转化率和认领完成率判断功能效果，并根据数据进一步优化搜索流程，最终提升了用户满意度和认领效率。'
const deepDecision = decideNextQuestion({
  plan: pmPlan,
  currentQuestion: projectQuestion,
  currentAnswer: deepAnswer,
  questionHistory: [projectQuestion],
  answerHistory: [deepAnswer],
  currentRound: 1,
  difficulty: 'comprehensive',
})
assert(deepDecision.action === 'increase_difficulty', 'Deep answer should increase difficulty')

const emptyUsedPlan: InterviewPlan = {
  competencies: ['项目经验'],
  candidateHighlights: [],
  strategy: 'test',
  firstQuestion: projectQuestion,
}

let history: InterviewQuestion[] = []
for (let i = 0; i < 20; i++) {
  const decision = decideNextQuestion({
    plan: emptyUsedPlan,
    currentQuestion: history.at(-1) ?? projectQuestion,
    currentAnswer: '测试回答内容足够长以触发切换逻辑，包含用户需求和项目设计。',
    questionHistory: history,
    answerHistory: [],
    currentRound: history.length,
    difficulty: 'comprehensive',
  })
  assert(decision.nextQuestion?.question, 'Decision must return a question')
  history = [...history, decision.nextQuestion]
}

assert(FALLBACK_QUESTION.question.length > 0, 'Fallback question must exist')

const report = generateInterviewReport({
  config: pmConfig,
  plan: pmPlan,
  turns: [{ round: 1, question: projectQuestion, answer: deepAnswer }],
})

const reportAgain = generateInterviewReport({
  config: pmConfig,
  plan: pmPlan,
  turns: [{ round: 1, question: projectQuestion, answer: deepAnswer }],
})

assert(report.overallScore === reportAgain.overallScore, 'Report scores must be deterministic')
assert(report.strongestCompetency.length > 0, 'Report must include strongest competency')

console.log('All agent verification checks passed.')
