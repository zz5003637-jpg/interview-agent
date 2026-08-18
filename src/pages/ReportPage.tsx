import { Navigate, useNavigate } from 'react-router-dom'
import { AppHeader } from '../components/AppHeader'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { DifficultyBadge } from '../components/DifficultyBadge'
import { InterviewTranscript } from '../components/InterviewTranscript'
import { ScoreBar } from '../components/ScoreBar'
import {
  DIFFICULTY_LABELS,
  TOTAL_ROUNDS,
  type InterviewConfig,
  type InterviewPlan,
  type InterviewReport,
  type InterviewTurn,
} from '../types/interview'

type ReportPageProps = {
  config: InterviewConfig | null
  plan: InterviewPlan | null
  turns: InterviewTurn[]
  report: InterviewReport | null
  onRestart: () => void
  onRetry: () => void | Promise<void>
}

export function ReportPage({
  config,
  plan,
  turns,
  report,
  onRestart,
  onRetry,
}: ReportPageProps) {
  const navigate = useNavigate()

  if (!config || !plan || !report || turns.length < TOTAL_ROUNDS) {
    return <Navigate to="/" replace />
  }

  const plannerLabel =
    plan.plannerSource === 'llm'
      ? 'AI 面试规划'
      : plan.plannerSource === 'rule'
        ? '规则引擎规划'
        : '智能评估'

  function handleRestart() {
    onRestart()
    navigate('/')
  }

  async function handleRetry() {
    await onRetry()
    navigate('/interview')
  }

  return (
    <div className="min-h-svh bg-slate-50">
      <AppHeader />
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-blue-700">面试报告</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
              {config.jobTitle}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              {DIFFICULTY_LABELS[config.difficulty]}难度 · 共 {TOTAL_ROUNDS} 轮 · {plannerLabel}
            </p>
          </div>
          <DifficultyBadge difficulty={config.difficulty} />
        </div>

        <Card className="mb-6 flex flex-col items-center justify-center py-10 text-center">
          <p className="text-sm text-slate-500">综合得分</p>
          <p className="mt-2 text-7xl font-semibold tracking-tight text-slate-900">
            {report.overallScore}
          </p>
          <p className="mt-2 text-sm text-slate-400">满分 100</p>
        </Card>

        <Card className="mb-6">
          <h2 className="text-sm font-semibold text-slate-900">面试表现总结</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">{report.summary}</p>
        </Card>

        <Card className="mb-6">
          <h2 className="text-sm font-semibold text-slate-900">能力评估</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <HighlightStat label="最强能力" value={report.strongestCompetency} />
            <HighlightStat
              label="优先提升"
              value={report.priorityImprovement}
              tone="amber"
            />
          </div>
          <div className="mt-5 space-y-4">
            {report.competencyScores.map((item) => (
              <ScoreBar key={item.competency} label={item.competency} score={item.score} />
            ))}
          </div>
        </Card>

        <div className="grid gap-6 md:grid-cols-3">
          <InsightCard title="优势" items={report.strengths} icon="check" />
          <InsightCard title="待改进" items={report.improvements} icon="dot" />
          <InsightCard title="面试建议" items={report.advice} icon="dot" />
        </div>

        <InterviewTranscript turns={turns} />

        <div className="mt-8 flex flex-wrap justify-end gap-3">
          <Button variant="secondary" onClick={handleRestart}>
            重新开始面试
          </Button>
          <Button onClick={handleRetry}>再次挑战</Button>
        </div>
      </main>
    </div>
  )
}

function HighlightStat({
  label,
  value,
  tone = 'blue',
}: {
  label: string
  value: string
  tone?: 'blue' | 'amber'
}) {
  const toneClass =
    tone === 'amber' ? 'bg-amber-50 text-amber-800' : 'bg-blue-50 text-blue-800'

  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className={`mt-2 inline-flex rounded-lg px-2.5 py-1 text-sm font-semibold ${toneClass}`}>
        {value}
      </p>
    </div>
  )
}

function InsightCard({
  title,
  items,
  icon,
}: {
  title: string
  items: string[]
  icon: 'check' | 'dot'
}) {
  return (
    <Card>
      <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-sm leading-6 text-slate-600">
            <span className="shrink-0 text-slate-400">{icon === 'check' ? '✓' : '•'}</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </Card>
  )
}
