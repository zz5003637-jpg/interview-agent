import { DIFFICULTY_LABELS, type Difficulty } from '../types/interview'

type DifficultyBadgeProps = {
  difficulty: Difficulty
}

const toneClass: Record<Difficulty, string> = {
  basic: 'bg-slate-100 text-slate-700',
  comprehensive: 'bg-blue-50 text-blue-800',
  hard: 'bg-amber-50 text-amber-800',
}

export function DifficultyBadge({ difficulty }: DifficultyBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${toneClass[difficulty]}`}
    >
      {DIFFICULTY_LABELS[difficulty]}
    </span>
  )
}
