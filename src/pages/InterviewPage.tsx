import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { AppHeader } from '../components/AppHeader'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { DifficultyBadge } from '../components/DifficultyBadge'
import { InterviewHistory } from '../components/InterviewHistory'
import { InterviewQuestion } from '../components/InterviewQuestion'
import { PlanSummary } from '../components/PlanSummary'
import { ProgressBar } from '../components/ProgressBar'
import {
  DIFFICULTY_LABELS,
  MAX_ANSWER_LENGTH,
  TOTAL_ROUNDS,
  type InterviewConfig,
  type InterviewPlan,
  type InterviewQuestion as InterviewQuestionType,
  type InterviewTurn,
} from '../types/interview'

type InterviewPageProps = {
  config: InterviewConfig | null
  plan: InterviewPlan | null
  currentQuestion: InterviewQuestionType | null
  turns: InterviewTurn[]
  onSubmitAnswer: (answer: string) => void
}

export function InterviewPage({
  config,
  plan,
  currentQuestion,
  turns,
  onSubmitAnswer,
}: InterviewPageProps) {
  const navigate = useNavigate()
  const [answer, setAnswer] = useState('')
  const [emptyError, setEmptyError] = useState(false)
  const [lengthError, setLengthError] = useState(false)

  useEffect(() => {
    if (turns.length >= TOTAL_ROUNDS) {
      navigate('/report')
    }
  }, [navigate, turns.length])

  if (!config || !plan || !currentQuestion) {
    return <Navigate to="/" replace />
  }

  if (turns.length >= TOTAL_ROUNDS) {
    return null
  }

  const currentRound = turns.length + 1
  const progress = (turns.length / TOTAL_ROUNDS) * 100
  const charCount = answer.length
  const isOverLimit = charCount > MAX_ANSWER_LENGTH

  function handleSubmit() {
    const trimmed = answer.trim()
    if (!trimmed) {
      setEmptyError(true)
      setLengthError(false)
      return
    }

    if (trimmed.length > MAX_ANSWER_LENGTH) {
      setLengthError(true)
      setEmptyError(false)
      return
    }

    setEmptyError(false)
    setLengthError(false)
    onSubmitAnswer(trimmed)
    setAnswer('')
  }

  return (
    <div className="min-h-svh bg-slate-50">
      <AppHeader />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)]">
          <div className="min-w-0 space-y-5">
            <Card>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-500">InterviewAgent</p>
                  <h1 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
                    {config.jobTitle} 模拟面试
                  </h1>
                  <p className="mt-1 text-sm text-slate-500">
                    {DIFFICULTY_LABELS[config.difficulty]}难度
                  </p>
                </div>
                <DifficultyBadge difficulty={config.difficulty} />
              </div>
              <div className="mt-5 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">
                  第 {currentRound} / {TOTAL_ROUNDS} 轮
                </span>
              </div>
              <div className="mt-3">
                <ProgressBar value={progress} />
              </div>
            </Card>

            {turns.length === 0 ? <PlanSummary plan={plan} /> : null}

            <InterviewQuestion question={currentQuestion} />

            <Card>
              <label
                htmlFor="answer"
                className="mb-2 block text-sm font-medium text-slate-800"
              >
                你的回答
              </label>
              <textarea
                id="answer"
                value={answer}
                onChange={(event) => {
                  setAnswer(event.target.value)
                  if (emptyError && event.target.value.trim()) {
                    setEmptyError(false)
                  }
                  if (lengthError && event.target.value.length <= MAX_ANSWER_LENGTH) {
                    setLengthError(false)
                  }
                }}
                rows={8}
                maxLength={MAX_ANSWER_LENGTH + 50}
                placeholder="结合具体项目、判断依据和结果来回答"
                className={`w-full max-w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm leading-6 text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-700 focus:ring-2 focus:ring-blue-100 ${
                  emptyError || lengthError || isOverLimit
                    ? 'border-red-400'
                    : 'border-slate-200'
                }`}
              />
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                <div>
                  {emptyError ? (
                    <p className="text-sm text-red-600">请先输入回答后再提交。</p>
                  ) : null}
                  {lengthError || isOverLimit ? (
                    <p className="text-sm text-red-600">回答不能超过 500 个字符。</p>
                  ) : null}
                </div>
                <p
                  className={`text-xs tabular-nums ${
                    isOverLimit ? 'text-red-600' : 'text-slate-400'
                  }`}
                >
                  {charCount} / {MAX_ANSWER_LENGTH}
                </p>
              </div>
              <div className="mt-4 flex justify-end">
                <Button
                  onClick={handleSubmit}
                  disabled={isOverLimit}
                  className="min-w-32"
                >
                  {currentRound >= TOTAL_ROUNDS ? '提交并查看报告 →' : '提交回答 →'}
                </Button>
              </div>
            </Card>
          </div>

          <InterviewHistory turns={turns} />
        </div>
      </main>
    </div>
  )
}
