import { useState, type FormEvent, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppHeader } from '../components/AppHeader'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import {
  DIFFICULTY_LABELS,
  type Difficulty,
  type InterviewConfig,
} from '../types/interview'

type HomePageProps = {
  onStart: (config: InterviewConfig) => Promise<void>
}

type FormErrors = {
  jobTitle?: string
  jobDescription?: string
  resume?: string
}

const difficulties: Difficulty[] = ['basic', 'comprehensive', 'hard']

export function HomePage({ onStart }: HomePageProps) {
  const navigate = useNavigate()
  const [jobTitle, setJobTitle] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [resume, setResume] = useState('')
  const [difficulty, setDifficulty] = useState<Difficulty>('comprehensive')
  const [errors, setErrors] = useState<FormErrors>({})
  const [isStarting, setIsStarting] = useState(false)
  const [startError, setStartError] = useState<string | null>(null)

  function validate(): FormErrors {
    const nextErrors: FormErrors = {}
    if (!jobTitle.trim()) nextErrors.jobTitle = '请填写目标岗位'
    if (!jobDescription.trim()) nextErrors.jobDescription = '请填写岗位 JD'
    if (!resume.trim()) nextErrors.resume = '请填写个人简历'
    return nextErrors
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setIsStarting(true)
    setStartError(null)
    try {
      await onStart({
        jobTitle: jobTitle.trim(),
        jobDescription: jobDescription.trim(),
        resume: resume.trim(),
        difficulty,
      })
      navigate('/interview')
    } catch {
      setStartError('面试准备失败，请检查网络后重试。')
    } finally {
      setIsStarting(false)
    }
  }

  return (
    <div className="min-h-svh bg-slate-50">
      <AppHeader />
      <main className="mx-auto max-w-2xl px-6 py-12">
        <p className="text-sm font-medium text-blue-700">AI 面试模拟</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
          InterviewAgent
        </h1>
        <p className="mt-3 max-w-xl text-[15px] leading-7 text-slate-600">
          面向求职者的 AI 面试官模拟器。输入目标岗位、JD 和简历，完成 5
          轮结构化模拟面试，并在结束后查看能力评估报告。
        </p>

        <Card className="mt-8">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <Field id="jobTitle" label="目标岗位" error={errors.jobTitle}>
              <input
                id="jobTitle"
                value={jobTitle}
                onChange={(event) => setJobTitle(event.target.value)}
                placeholder="例如：AI 产品经理"
                className={inputClass(Boolean(errors.jobTitle))}
              />
            </Field>

            <Field id="jobDescription" label="岗位 JD" error={errors.jobDescription}>
              <textarea
                id="jobDescription"
                value={jobDescription}
                onChange={(event) => setJobDescription(event.target.value)}
                placeholder="粘贴岗位职责、任职要求和关键能力"
                rows={6}
                className={inputClass(Boolean(errors.jobDescription))}
              />
            </Field>

            <Field id="resume" label="个人简历" error={errors.resume}>
              <textarea
                id="resume"
                value={resume}
                onChange={(event) => setResume(event.target.value)}
                placeholder="粘贴你的经历、项目和成果"
                rows={6}
                className={inputClass(Boolean(errors.resume))}
              />
            </Field>

            <fieldset>
              <legend className="mb-2 text-sm font-medium text-slate-800">
                面试难度
              </legend>
              <div className="grid grid-cols-3 gap-2">
                {difficulties.map((item) => {
                  const selected = item === difficulty
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setDifficulty(item)}
                      className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${
                        selected
                          ? 'border-blue-700 bg-blue-50 text-blue-800'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {DIFFICULTY_LABELS[item]}
                    </button>
                  )
                })}
              </div>
            </fieldset>

            <Button type="submit" className="h-11 w-full" disabled={isStarting}>
              {isStarting ? 'AI 正在规划面试…' : '开始 AI 面试'}
            </Button>
            {startError ? (
              <p className="text-center text-sm text-red-600">{startError}</p>
            ) : null}
          </form>
        </Card>
      </main>
    </div>
  )
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string
  label: string
  error?: string
  children: ReactNode
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-slate-800">
        {label}
      </label>
      {children}
      {error ? <p className="mt-1.5 text-sm text-red-600">{error}</p> : null}
    </div>
  )
}

function inputClass(hasError: boolean) {
  return `w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-700 focus:ring-2 focus:ring-blue-100 ${
    hasError ? 'border-red-400' : 'border-slate-200'
  }`
}
