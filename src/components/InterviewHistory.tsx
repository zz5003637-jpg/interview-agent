import type { InterviewTurn } from '../types/interview'
import { Card } from './Card'

type InterviewHistoryProps = {
  turns: InterviewTurn[]
}

export function InterviewHistory({ turns }: InterviewHistoryProps) {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-slate-900">已答记录</h2>
      {turns.length === 0 ? (
        <Card>
          <p className="text-sm leading-6 text-slate-500">
            提交回答后，本轮问答会出现在这里。
          </p>
        </Card>
      ) : (
        <ol className="space-y-3">
          {turns.map((turn) => (
            <li key={turn.round}>
              <Card className="p-4 sm:p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-slate-700">
                    第 {turn.round} 轮
                  </span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                    {turn.question.competency}
                  </span>
                </div>
                <div className="mt-3">
                  <p className="text-[11px] font-medium text-slate-400">面试官</p>
                  <p className="mt-1 text-sm leading-6 text-slate-800">
                    {turn.question.question}
                  </p>
                </div>
                <div className="mt-3 border-t border-slate-100 pt-3">
                  <p className="text-[11px] font-medium text-slate-400">你的回答</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600 break-words">
                    {turn.answer}
                  </p>
                </div>
              </Card>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
