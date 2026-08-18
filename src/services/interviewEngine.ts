import { decideNextQuestion } from '../agents/adaptiveInterviewer'
import { generateInterviewPlan } from '../agents/interviewPlanner'
import { generateInterviewReport } from '../agents/evaluator'
import type {
  EvaluationContext,
  InterviewConfig,
  InterviewContext,
  InterviewPlan,
  InterviewReport,
  NextQuestionDecision,
} from '../types/interview'

export interface InterviewEngine {
  generatePlan(config: InterviewConfig): Promise<InterviewPlan>
  decideNextQuestion(context: InterviewContext): NextQuestionDecision
  evaluate(context: EvaluationContext): InterviewReport
}

export const interviewEngine: InterviewEngine = {
  generatePlan: generateInterviewPlan,
  decideNextQuestion,
  evaluate: generateInterviewReport,
}
