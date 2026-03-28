import type { Choice, Question } from '../types'
import { bossImageUrl } from '../hooks/useBossSprites'

interface Props {
  index: number
  total: number
  current: Question
  onPick: (c: Choice) => void
}

export function QuizScreen({ index, total, current, onPick }: Props) {
  const labels: { key: Choice; text: string }[] = [
    { key: 'A', text: current.A },
    { key: 'B', text: current.B },
    { key: 'C', text: current.C },
    { key: 'D', text: current.D },
  ]

  return (
    <>
      <div className="hud">
        <span>
          关卡 <strong>{index + 1}</strong> / {total}
        </span>
        <span>
          题号 <strong>{current.questionNo}</strong>
        </span>
      </div>
      <div className="boss-frame">
        <img
          src={bossImageUrl(index)}
          width={112}
          height={112}
          alt={`关主 ${index + 1}`}
        />
      </div>
      <div className="question-box">{current.question}</div>
      <div className="choices">
        {labels.map(({ key, text }) => (
          <button
            type="button"
            key={key}
            className="choice-btn"
            onClick={() => onPick(key)}
          >
            <strong>[{key}]</strong> {text}
          </button>
        ))}
      </div>
    </>
  )
}
