import type { InterviewConfig } from '../../types/interview'
import type { LLMProvider, LlmPlannerResponse } from './llmProvider'

const DEFAULT_TIMEOUT_MS = 15000

interface PlannerProxySuccessResponse {
  success: true
  data: LlmPlannerResponse
}

interface PlannerProxyErrorResponse {
  success: false
  error: string
}

type PlannerProxyResponse = PlannerProxySuccessResponse | PlannerProxyErrorResponse

export class ProxyLlmProvider implements LLMProvider {
  readonly name = 'proxy'
  private readonly proxyUrl: string

  constructor(proxyUrl: string) {
    this.proxyUrl = proxyUrl
  }

  isAvailable(): boolean {
    return this.proxyUrl.length > 0
  }

  async generatePlannerResponse(config: InterviewConfig): Promise<LlmPlannerResponse> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS)

    try {
      const response = await fetch(this.proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobTitle: config.jobTitle,
          jobDescription: config.jobDescription,
          resume: config.resume,
          difficulty: config.difficulty,
        }),
        signal: controller.signal,
      })

      const payload = (await response.json()) as PlannerProxyResponse

      if (!response.ok || !payload.success) {
        throw new Error('Planner service unavailable')
      }

      if (!payload.data) {
        throw new Error('Planner service unavailable')
      }

      return payload.data
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Planner service unavailable')
      }
      throw error
    } finally {
      clearTimeout(timeoutId)
    }
  }
}
