import { useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { interviewEngine } from './services/interviewEngine'
import { HomePage } from './pages/HomePage'
import { InterviewPage } from './pages/InterviewPage'
import { ReportPage } from './pages/ReportPage'
import {
  TOTAL_ROUNDS,
  type InterviewConfig,
  type InterviewPlan,
  type InterviewQuestion,
  type InterviewReport,
  type InterviewTurn,
} from './types/interview'

export default function App() {
  const [config, setConfig] = useState<InterviewConfig | null>(null)
  const [plan, setPlan] = useState<InterviewPlan | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState<InterviewQuestion | null>(null)
  const [turns, setTurns] = useState<InterviewTurn[]>([])
  const [report, setReport] = useState<InterviewReport | null>(null)

  function resetInterviewSession() {
    setPlan(null)
    setCurrentQuestion(null)
    setTurns([])
    setReport(null)
  }

  async function handleStart(nextConfig: InterviewConfig) {
    const interviewPlan = await interviewEngine.generatePlan(nextConfig)
    setConfig(nextConfig)
    setPlan(interviewPlan)
    setCurrentQuestion(interviewPlan.firstQuestion)
    setTurns([])
    setReport(null)
  }

  function handleSubmitAnswer(answer: string) {
    if (!config || !plan || !currentQuestion) return

    const trimmed = answer.trim()
    if (!trimmed) return

    const turn: InterviewTurn = {
      round: turns.length + 1,
      question: currentQuestion,
      answer: trimmed,
    }

    const newTurns = [...turns, turn]
    setTurns(newTurns)

    if (newTurns.length >= TOTAL_ROUNDS) {
      setReport(
        interviewEngine.evaluate({
          config,
          plan,
          turns: newTurns,
        }),
      )
      return
    }

    const decision = interviewEngine.decideNextQuestion({
      plan,
      currentQuestion,
      currentAnswer: trimmed,
      questionHistory: newTurns.map((item) => item.question),
      answerHistory: newTurns.map((item) => item.answer),
      currentRound: newTurns.length,
      difficulty: config.difficulty,
    })

    setCurrentQuestion(decision.nextQuestion)
  }

  function handleRestart() {
    setConfig(null)
    resetInterviewSession()
  }

  async function handleRetry() {
    if (!config) return
    const interviewPlan = await interviewEngine.generatePlan(config)
    setPlan(interviewPlan)
    setCurrentQuestion(interviewPlan.firstQuestion)
    setTurns([])
    setReport(null)
  }

  return (
    <Routes>
      <Route path="/" element={<HomePage onStart={handleStart} />} />
      <Route
        path="/interview"
        element={
          <InterviewPage
            config={config}
            plan={plan}
            currentQuestion={currentQuestion}
            turns={turns}
            onSubmitAnswer={handleSubmitAnswer}
          />
        }
      />
      <Route
        path="/report"
        element={
          <ReportPage
            config={config}
            plan={plan}
            turns={turns}
            report={report}
            onRestart={handleRestart}
            onRetry={handleRetry}
          />
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
