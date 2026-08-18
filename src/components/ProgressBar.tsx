type ProgressBarProps = {
  value: number
}

export function ProgressBar({ value }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value))

  return (
    <div
      className="h-2 w-full overflow-hidden rounded-full bg-slate-100"
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full bg-blue-700 transition-[width] duration-300"
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}
