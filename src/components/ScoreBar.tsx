type ScoreBarProps = {
  label: string
  score: number
}

export function ScoreBar({ label, score }: ScoreBarProps) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4">
        <span className="text-sm text-slate-700">{label}</span>
        <span className="text-sm font-semibold tabular-nums text-slate-900">
          {score}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-blue-700"
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </div>
    </div>
  )
}
