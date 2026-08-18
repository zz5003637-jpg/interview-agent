import { Link } from 'react-router-dom'

export function AppHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-700 text-[13px] font-semibold tracking-tight text-white">
            IA
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-slate-900">
            InterviewAgent
          </span>
        </Link>
      </div>
    </header>
  )
}
