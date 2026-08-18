import type { InterviewTurn } from '../types/interview'
import { Card } from './Card'

type InterviewTranscriptProps = {
  turns: InterviewTurn[]
}

export function InterviewTranscript({ turns }: InterviewTranscriptProps) {
  return (
    <Card className="mb-6">
      <h2 className="text-sm font-semibold text-slate-900">面试记录</h2>
      <ol className="mt-4 space-y-4">
        {turns.map((turn) => (
          <li key={turn.round} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-700">第 {turn.round} 轮</span>
              <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-slate-500 ring-1 ring-slate-200">
                {turn.question.competency}
              </span>
            </div>
            <p className="mt-2 text-[11px] font-medium text-slate-400">面试官</p>
            <p className="mt-1 text-sm leading-6 text-slate-800">{turn.question.question}</p>
            <p className="mt-3 text-[11px] font-medium text-slate-400">你的回答</p>
            <p className="mt-1 text-sm leading-6 text-slate-600 break-words">{turn.answer}</p>
          </li>
        ))}
      </ol>
    </Card>
  )
}
