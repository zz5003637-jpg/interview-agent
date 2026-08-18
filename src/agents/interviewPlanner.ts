import { generateLlmInterviewPlan } from './llmInterviewPlanner'
import { generateRuleBasedInterviewPlan } from './ruleBasedInterviewPlanner'
import type { InterviewConfig, InterviewPlan } from '../types/interview'
import { resolveLlmProvider } from '../services/llm/createLlmProvider'

function isDevEnvironment(): boolean {
  return typeof import.meta !== 'undefined' && import.meta.env?.DEV === true
}

function logPlannerSource(source: InterviewPlan['plannerSource']) {
  if (!isDevEnvironment()) return
  if (source === 'llm') {
    console.info('Planner: LLM')
  } else {
    console.info('Planner: Rule-based fallback')
  }
}

export async function generateInterviewPlan(
  config: InterviewConfig,
): Promise<InterviewPlan> {
  const provider = await resolveLlmProvider()

  if (provider.isAvailable()) {
    try {
      const llmPlan = await generateLlmInterviewPlan(config, provider)
      logPlannerSource('llm')
      return llmPlan
    } catch {
      // Fall through to rule-based planner.
    }
  }

  const rulePlan = generateRuleBasedInterviewPlan(config)
  logPlannerSource('rule')
  return rulePlan
}
