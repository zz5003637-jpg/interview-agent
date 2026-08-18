import type { InterviewQuestion as InterviewQuestionType } from '../types/interview'
import { Card } from './Card'

type InterviewQuestionProps = {
  question: InterviewQuestionType
}

function typeLabel(question: InterviewQuestionType): string | null {
  if (question.type === 'follow_up') return 'Follow-up'
  if (question.type === 'deep_dive') return 'Deep Dive'
  return null
}

export function InterviewQuestion({ question }: InterviewQuestionProps) {
  const label = typeLabel(question)

  return (
    <Card>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        AI Interviewer
      </p>
      <p className="mt-2 text-[15px] leading-7 text-slate-800">{question.question}</p>
      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
          当前考察能力：{question.competency}
        </span>
        {label ? (
          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
            {label}
          </span>
        ) : null}
      </div>
    </Card>
  )
}
