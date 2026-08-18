import type { Difficulty, InterviewQuestion, QuestionType } from '../types/interview'

export const FALLBACK_QUESTION: InterviewQuestion = {
  id: 'fallback-01',
  question: '请进一步介绍一下你在这个项目中的具体贡献。',
  competency: '项目经验',
  difficulty: 'comprehensive',
  type: 'follow_up',
}

export const questionBank: Record<string, InterviewQuestion[]> = {
  自我介绍: [
    {
      id: 'intro-basic-01',
      question: '请先做个自我介绍，并说明你为什么对这个岗位感兴趣。',
      competency: '自我介绍',
      difficulty: 'basic',
      type: 'main',
    },
    {
      id: 'intro-basic-02',
      question: '结合你的背景，说说你最想从这个岗位获得什么成长？',
      competency: '自我介绍',
      difficulty: 'basic',
      type: 'main',
    },
    {
      id: 'intro-comp-01',
      question: '请用 2 分钟介绍你的职业路径，以及它与目标岗位的关联。',
      competency: '自我介绍',
      difficulty: 'comprehensive',
      type: 'main',
    },
    {
      id: 'intro-comp-follow-01',
      question: '你刚才的自我介绍里，哪一段经历最能证明你适合这个岗位？',
      competency: '自我介绍',
      difficulty: 'comprehensive',
      type: 'follow_up',
    },
    {
      id: 'intro-hard-01',
      question: '如果只能保留简历里的一项经历来争取这个岗位，你会选哪一项？为什么？',
      competency: '自我介绍',
      difficulty: 'hard',
      type: 'deep_dive',
    },
  ],
  项目经验: [
    {
      id: 'project-basic-01',
      question: '请介绍一个你负责过的项目。',
      competency: '项目经验',
      difficulty: 'basic',
      type: 'main',
    },
    {
      id: 'project-basic-02',
      question: '你最近参与过的一个项目是什么？你在其中具体负责哪些工作？',
      competency: '项目经验',
      difficulty: 'basic',
      type: 'main',
    },
    {
      id: 'project-basic-03',
      question: '请描述一个你从零到一参与过的产品或功能，以及最终结果。',
      competency: '项目经验',
      difficulty: 'basic',
      type: 'main',
    },
    {
      id: 'project-comp-01',
      question: '请介绍一个你主导或深度参与的项目：目标、你的方案、以及可量化的结果。',
      competency: '项目经验',
      difficulty: 'comprehensive',
      type: 'main',
    },
    {
      id: 'project-comp-follow-01',
      question: '你在这个项目中具体负责了哪些决策？这些决策带来了什么影响？',
      competency: '项目经验',
      difficulty: 'comprehensive',
      type: 'follow_up',
    },
    {
      id: 'project-comp-follow-02',
      question: '这个项目遇到的最大挑战是什么？你当时是如何解决的？',
      competency: '项目经验',
      difficulty: 'comprehensive',
      type: 'follow_up',
    },
    {
      id: 'project-hard-01',
      question: '请用两分钟讲清楚你最能代表自己能力的项目，并给出可验证的结果。',
      competency: '项目经验',
      difficulty: 'hard',
      type: 'deep_dive',
    },
    {
      id: 'project-hard-02',
      question: '假设面试官质疑你的项目贡献被夸大，你会如何回应并提供证据？',
      competency: '项目经验',
      difficulty: 'hard',
      type: 'deep_dive',
    },
  ],
  产品思维: [
    {
      id: 'product-basic-01',
      question: '结合这份 JD，你认为这个岗位最核心的 2～3 项职责是什么？',
      competency: '产品思维',
      difficulty: 'basic',
      type: 'main',
    },
    {
      id: 'product-basic-02',
      question: '当需求描述不清晰时，你会怎么推进，而不是卡住等待？',
      competency: '产品思维',
      difficulty: 'basic',
      type: 'main',
    },
    {
      id: 'product-comp-01',
      question: '如果重新设计这个产品，你会优先解决哪个用户问题？为什么？',
      competency: '产品思维',
      difficulty: 'comprehensive',
      type: 'main',
    },
    {
      id: 'product-comp-02',
      question: '你如何评估一个功能值不值得做？请给出你常用的分析框架。',
      competency: '产品思维',
      difficulty: 'comprehensive',
      type: 'main',
    },
    {
      id: 'product-comp-follow-01',
      question: '你刚才提到的方案，如果资源只有原来的一半，你会如何调整优先级？',
      competency: '产品思维',
      difficulty: 'comprehensive',
      type: 'follow_up',
    },
    {
      id: 'product-hard-01',
      question: '如果用户访谈结果与业务数据得出的结论不一致，你会如何判断应该相信哪一方？',
      competency: '产品思维',
      difficulty: 'hard',
      type: 'deep_dive',
    },
    {
      id: 'product-hard-02',
      question: '如果资源只剩现在的一半，你会砍掉什么、保留什么？请说明取舍逻辑。',
      competency: '产品思维',
      difficulty: 'hard',
      type: 'deep_dive',
    },
  ],
  'AI 知识': [
    {
      id: 'ai-basic-01',
      question: '你目前对 AI 或大模型在产品中的应用有哪些了解？',
      competency: 'AI 知识',
      difficulty: 'basic',
      type: 'main',
    },
    {
      id: 'ai-basic-02',
      question: '请举例说明你见过或参与过的一个 AI 功能，以及它的价值边界。',
      competency: 'AI 知识',
      difficulty: 'basic',
      type: 'main',
    },
    {
      id: 'ai-comp-01',
      question: '如果要为现有产品设计一个 AI 助手功能，你会如何定义它的能力边界？',
      competency: 'AI 知识',
      difficulty: 'comprehensive',
      type: 'main',
    },
    {
      id: 'ai-comp-02',
      question: 'RAG 和 Fine-tuning 分别适合解决什么问题？你会如何选择？',
      competency: 'AI 知识',
      difficulty: 'comprehensive',
      type: 'main',
    },
    {
      id: 'ai-comp-follow-01',
      question: '你刚才提到的 AI 方案，如何评估它的效果是否真正提升了用户体验？',
      competency: 'AI 知识',
      difficulty: 'comprehensive',
      type: 'follow_up',
    },
    {
      id: 'ai-hard-01',
      question: '如果 AI 功能上线后用户满意度上升但核心业务指标没有变化，你会如何诊断？',
      competency: 'AI 知识',
      difficulty: 'hard',
      type: 'deep_dive',
    },
    {
      id: 'ai-hard-02',
      question: '设计一个 Agent 工作流时，你会如何平衡自动化程度与可控性？',
      competency: 'AI 知识',
      difficulty: 'hard',
      type: 'deep_dive',
    },
  ],
  数据分析: [
    {
      id: 'data-basic-01',
      question: '你通常用哪些指标来衡量一个功能或产品的表现？',
      competency: '数据分析',
      difficulty: 'basic',
      type: 'main',
    },
    {
      id: 'data-basic-02',
      question: '请描述一次你通过数据发现问题并推动改进的经历。',
      competency: '数据分析',
      difficulty: 'basic',
      type: 'main',
    },
    {
      id: 'data-comp-01',
      question: '如果用户反馈和业务指标发生冲突，你会如何判断优先级并做决策？',
      competency: '数据分析',
      difficulty: 'comprehensive',
      type: 'main',
    },
    {
      id: 'data-comp-02',
      question: '你如何设计 A/B 测试来验证一个产品改动的价值？',
      competency: '数据分析',
      difficulty: 'comprehensive',
      type: 'main',
    },
    {
      id: 'data-comp-follow-01',
      question: '你刚才提到的指标，如果连续两周没有改善，下一步你会做什么？',
      competency: '数据分析',
      difficulty: 'comprehensive',
      type: 'follow_up',
    },
    {
      id: 'data-hard-01',
      question: '请设计一套指标体系，用来衡量这个岗位的核心工作是否真正做成了。',
      competency: '数据分析',
      difficulty: 'hard',
      type: 'deep_dive',
    },
    {
      id: 'data-hard-02',
      question: '当数据样本量不足时，你还会相信统计结论吗？你会如何补充判断？',
      competency: '数据分析',
      difficulty: 'hard',
      type: 'deep_dive',
    },
  ],
  沟通表达: [
    {
      id: 'comm-basic-01',
      question: '描述一次你需要向非技术人员解释复杂方案的经历。',
      competency: '沟通表达',
      difficulty: 'basic',
      type: 'main',
    },
    {
      id: 'comm-basic-02',
      question: '如果录用你，你希望在前 3 个月重点补齐哪一项能力？为什么？',
      competency: '沟通表达',
      difficulty: 'basic',
      type: 'main',
    },
    {
      id: 'comm-comp-01',
      question: '描述一次跨团队协作中的分歧。你当时怎么处理，最后学到了什么？',
      competency: '沟通表达',
      difficulty: 'comprehensive',
      type: 'main',
    },
    {
      id: 'comm-comp-02',
      question: '当研发、设计和业务三方意见不一致时，你如何推动达成共识？',
      competency: '沟通表达',
      difficulty: 'comprehensive',
      type: 'main',
    },
    {
      id: 'comm-comp-follow-01',
      question: '你刚才提到的那次分歧，如果重来一次你会改变什么沟通方式？',
      competency: '沟通表达',
      difficulty: 'comprehensive',
      type: 'follow_up',
    },
    {
      id: 'comm-hard-01',
      question: '如果你必须在 30 秒内说服 CEO 支持你的方案，你会怎么说？',
      competency: '沟通表达',
      difficulty: 'hard',
      type: 'deep_dive',
    },
  ],
  场景分析: [
    {
      id: 'scene-basic-01',
      question: '假设你刚接手一个用户活跃度下降的产品，你会从哪几步开始分析？',
      competency: '场景分析',
      difficulty: 'basic',
      type: 'main',
    },
    {
      id: 'scene-comp-01',
      question: '针对这份 JD，你认为上任 30 天最该先解决的问题是什么？依据是什么？',
      competency: '场景分析',
      difficulty: 'comprehensive',
      type: 'main',
    },
    {
      id: 'scene-comp-02',
      question: '如果竞品突然推出类似功能并获得好评，你会如何评估是否需要跟进？',
      competency: '场景分析',
      difficulty: 'comprehensive',
      type: 'main',
    },
    {
      id: 'scene-hard-01',
      question: '公司决定砍掉你正在负责的核心功能，你会如何向团队和用户解释并平稳过渡？',
      competency: '场景分析',
      difficulty: 'hard',
      type: 'deep_dive',
    },
    {
      id: 'scene-hard-02',
      question: '如果必须在一个月内上线 MVP，但技术方案存在明显风险，你会如何决策？',
      competency: '场景分析',
      difficulty: 'hard',
      type: 'deep_dive',
    },
  ],
}

export function getQuestionsByCompetency(
  competency: string,
  difficulty: Difficulty,
  type?: QuestionType,
): InterviewQuestion[] {
  const pool = questionBank[competency] ?? []
  return pool.filter((q) => {
    if (type && q.type !== type) return false
    if (difficulty === 'hard') return q.difficulty === 'hard' || q.difficulty === 'comprehensive'
    if (difficulty === 'comprehensive')
      return q.difficulty === 'comprehensive' || q.difficulty === 'basic'
    return q.difficulty === 'basic'
  })
}

export function pickQuestion(
  competency: string,
  difficulty: Difficulty,
  type: QuestionType,
  usedIds: Set<string>,
): InterviewQuestion | null {
  const candidates = getQuestionsByCompetency(competency, difficulty, type)
  const available = candidates.filter((q) => !usedIds.has(q.id))
  if (available.length > 0) return available[0]

  const fallbackCandidates = getQuestionsByCompetency(competency, difficulty).filter(
    (q) => !usedIds.has(q.id),
  )
  if (fallbackCandidates.length > 0) return fallbackCandidates[0]

  const anyAvailable = (questionBank[competency] ?? []).filter((q) => !usedIds.has(q.id))
  return anyAvailable[0] ?? null
}

export function pickQuestionForCompetency(
  competency: string,
  difficulty: Difficulty,
  usedIds: Set<string>,
  preferType?: QuestionType,
): InterviewQuestion | null {
  if (preferType) {
    const preferred = pickQuestion(competency, difficulty, preferType, usedIds)
    if (preferred) return preferred
  }
  return pickQuestion(competency, difficulty, 'main', usedIds)
}
