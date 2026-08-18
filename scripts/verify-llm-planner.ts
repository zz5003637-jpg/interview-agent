import { generateInterviewPlan } from '../src/agents/interviewPlanner'
import { generateLlmInterviewPlan } from '../src/agents/llmInterviewPlanner'
import type { InterviewConfig } from '../src/types/interview'
import type { LLMProvider, LlmPlannerResponse } from '../src/services/llm/llmProvider'

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message)
}

class ValidLlmProvider implements LLMProvider {
  readonly name = 'valid-test'
  isAvailable(): boolean {
    return true
  }
  async generatePlannerResponse(_config: InterviewConfig): Promise<LlmPlannerResponse> {
    return {
      competencies: [
        { name: '项目经验', priority: 1, reason: '简历包含失物招领系统项目' },
        { name: '产品思维', priority: 2, reason: 'JD 强调产品设计' },
        { name: '数据分析', priority: 3, reason: 'JD 提到数据分析' },
      ],
      candidateHighlights: ['参与校园失物招领管理系统项目', '负责需求分析和产品设计'],
      strategy: '重点验证项目落地、产品思维与数据分析能力。',
      firstQuestion: {
        id: 'llm-first-question',
        question:
          '你在校园失物招领管理系统中负责的需求分析和产品设计，具体解决了哪些核心用户问题？',
        competency: '项目经验',
        difficulty: 'comprehensive',
        type: 'main',
      },
    }
  }
}

class InvalidJsonLlmProvider implements LLMProvider {
  readonly name = 'invalid-json-test'
  isAvailable(): boolean {
    return true
  }
  async generatePlannerResponse(_config: InterviewConfig): Promise<LlmPlannerResponse> {
    throw new Error('Planner service unavailable')
  }
}

class FabricatedHighlightProvider implements LLMProvider {
  readonly name = 'fabricated-highlight-test'
  isAvailable(): boolean {
    return true
  }
  async generatePlannerResponse(_config: InterviewConfig): Promise<LlmPlannerResponse> {
    return {
      competencies: [{ name: 'AI 知识', priority: 1, reason: 'JD 强调 LLM' }],
      candidateHighlights: ['负责过百万用户产品', '参与校园失物招领系统项目'],
      strategy: '测试亮点过滤',
      firstQuestion: {
        id: 'llm-first-question',
        question: '请介绍你在 RAG 产品设计中的具体实践。',
        competency: 'AI 知识',
        difficulty: 'comprehensive',
        type: 'main',
      },
    }
  }
}

const pmConfig = {
  jobTitle: '产品经理',
  jobDescription: '负责用户研究、需求分析、产品设计和数据分析。',
  resume:
    '参与校园失物招领管理系统项目，负责需求分析、产品设计和功能开发。',
  difficulty: 'comprehensive' as const,
}

const aiConfig = {
  jobTitle: 'AI 产品经理',
  jobDescription: '负责 LLM、RAG、Agent 产品设计。',
  resume: '参与过 AI 助手项目，了解大模型应用。',
  difficulty: 'comprehensive' as const,
}

const llmPlan = await generateLlmInterviewPlan(pmConfig, new ValidLlmProvider())
assert(llmPlan.plannerSource === 'llm', 'LLM planner should mark source as llm')
assert(
  llmPlan.firstQuestion.question.includes('失物招领'),
  'First question should relate to resume project',
)
assert(
  llmPlan.candidateHighlights.some((item) => item.includes('失物招领')),
  'Highlights should come from resume',
)

const aiPlan = await generateLlmInterviewPlan(
  aiConfig,
  new (class implements LLMProvider {
    readonly name = 'ai-test'
    isAvailable() {
      return true
    }
    async generatePlannerResponse(_config: InterviewConfig): Promise<LlmPlannerResponse> {
      return {
        competencies: [
          { name: 'AI 知识', priority: 1, reason: 'JD 强调 LLM 与 RAG' },
          { name: '产品思维', priority: 2, reason: '岗位为 AI 产品经理' },
        ],
        candidateHighlights: ['参与过 AI 助手项目'],
        strategy: '重点考察 AI 产品能力',
        firstQuestion: {
          id: 'llm-first-question',
          question: '请介绍你在 AI 助手项目中的产品设计思路。',
          competency: 'AI 知识',
          difficulty: 'comprehensive',
          type: 'main',
        },
      }
    }
  })(),
)
assert(aiPlan.competencies.includes('AI 知识'), 'AI role should include AI 知识 in competencies')

const fabricatedPlan = await generateLlmInterviewPlan(
  pmConfig,
  new FabricatedHighlightProvider(),
)
assert(
  !fabricatedPlan.candidateHighlights.some((item) => item.includes('百万用户')),
  'Fabricated highlights must be filtered out',
)

let fallbackTriggered = false
try {
  await generateLlmInterviewPlan(pmConfig, new InvalidJsonLlmProvider())
} catch {
  fallbackTriggered = true
}
assert(fallbackTriggered, 'Invalid planner response should throw for fallback')

const orchestratedPlan = await generateInterviewPlan(pmConfig)
assert(
  orchestratedPlan.plannerSource === 'rule',
  'Without proxy URL, orchestrator should use rule-based planner',
)

console.log('All LLM planner verification checks passed.')
