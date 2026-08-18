import type { InterviewPlan } from '../types/interview'
import { Card } from './Card'

type PlanSummaryProps = {
  plan: InterviewPlan
}

export function PlanSummary({ plan }: PlanSummaryProps) {
  const sourceLabel =
    plan.plannerSource === 'llm' ? 'AI 规划' : plan.plannerSource === 'rule' ? '规则引擎' : null

  return (
    <Card className="bg-blue-50/50 border-blue-100">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-900">面试计划</h2>
        {sourceLabel ? (
          <span className="rounded-full bg-white px-2.5 py-0.5 text-[11px] font-medium text-blue-700 ring-1 ring-blue-200">
            {sourceLabel}
          </span>
        ) : null}
      </div>
      <p className="mt-3 text-sm leading-7 text-slate-600">{plan.strategy}</p>
      {plan.candidateHighlights.length > 0 ? (
        <ul className="mt-3 space-y-1.5">
          {plan.candidateHighlights.slice(0, 4).map((item) => (
            <li key={item} className="flex gap-2 text-sm text-slate-600">
              <span className="text-blue-500">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {plan.competencies.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {plan.competencies.map((item) => (
            <span
              key={item}
              className="rounded-md bg-white px-2 py-0.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200"
            >
              {item}
            </span>
          ))}
        </div>
      ) : null}
    </Card>
  )
}
