import { bossImageUrl, useBossSpritesPreload } from '../hooks/useBossSprites'
import { passThreshold, questionCount } from '../config'

interface Props {
  playerId: string
  onIdChange: (v: string) => void
  onStart: () => void
  loading: boolean
}

export function HomeScreen({ playerId, onIdChange, onStart, loading }: Props) {
  const { loaded, ready } = useBossSpritesPreload()

  return (
    <>
      <p className="subtitle">
        通关门槛：答对 {passThreshold} / {questionCount} 题 · 关主图已预载 {loaded} / 100
      </p>
      <div className="row">
        <input
          className="input-id"
          placeholder="输入 ID（会写入表格）"
          value={playerId}
          onChange={(e) => onIdChange(e.target.value)}
          maxLength={64}
          autoComplete="username"
        />
      </div>
      <div className="row" style={{ marginTop: 20 }}>
        <button
          type="button"
          className="btn btn-primary"
          disabled={loading || !playerId.trim() || !ready}
          onClick={onStart}
        >
          {loading ? '连接中…' : ready ? '开始闯关' : '图片加载中…'}
        </button>
      </div>
      <div className="boss-frame" style={{ marginTop: 24 }}>
        <img src={bossImageUrl(0)} width={112} height={112} alt="关主预览" />
      </div>
    </>
  )
}
