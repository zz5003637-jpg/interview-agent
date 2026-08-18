import type { InterviewConfig } from '../../types/interview'

export interface LlmPlannerCompetency {
  name: string
  priority: number
  reason: string
}

export interface LlmPlannerQuestionPayload {
  id: string
  question: string
  competency: string
  difficulty: InterviewConfig['difficulty']
  type: 'main' | 'follow_up' | 'deep_dive'
}

export interface LlmPlannerResponse {
  competencies: LlmPlannerCompetency[]
  candidateHighlights: string[]
  strategy: string
  firstQuestion: LlmPlannerQuestionPayload
}

export interface LLMProvider {
  readonly name: string
  isAvailable(): boolean
  generatePlannerResponse(config: InterviewConfig): Promise<LlmPlannerResponse>
}
