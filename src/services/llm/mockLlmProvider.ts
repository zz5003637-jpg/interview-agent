import type { LLMProvider, LlmPlannerResponse } from './llmProvider'
import type { InterviewConfig } from '../../types/interview'

export class LlmProviderNotConfiguredError extends Error {
  constructor(message = 'LLM provider is not configured') {
    super(message)
    this.name = 'LlmProviderNotConfiguredError'
  }
}

export class MockLlmProvider implements LLMProvider {
  readonly name = 'mock'

  isAvailable(): boolean {
    return false
  }

  async generatePlannerResponse(_config: InterviewConfig): Promise<LlmPlannerResponse> {
    throw new LlmProviderNotConfiguredError(
      'Mock LLM provider does not call external APIs. Configure llm-proxy.json or use rule-based planner.',
    )
  }
}

export const mockLlmProvider = new MockLlmProvider()
