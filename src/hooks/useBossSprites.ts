import { useEffect, useMemo, useState } from 'react'

const BOSS_COUNT = 100
const SIZE = 112

/** DiceBear pixel-art PNG，每关不同 seed */
export function bossImageUrl(index: number): string {
  const seed = `arcade-boss-${index % BOSS_COUNT}`
  return `https://api.dicebear.com/9.x/pixel-art/png?seed=${encodeURIComponent(seed)}&size=${SIZE}`
}

export function useBossSpritesPreload(): { loaded: number; ready: boolean } {
  const urls = useMemo(
    () => Array.from({ length: BOSS_COUNT }, (_, i) => bossImageUrl(i)),
    [],
  )
  const [loaded, setLoaded] = useState(0)

  useEffect(() => {
    let alive = true
    let done = 0
    const bump = () => {
      done += 1
      if (alive) setLoaded(done)
    }
    for (const src of urls) {
      const img = new Image()
      img.onload = bump
      img.onerror = bump
      img.src = src
    }
    return () => {
      alive = false
    }
  }, [urls])

  return { loaded, ready: loaded >= BOSS_COUNT }
}
