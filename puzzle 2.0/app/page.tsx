"use client"

import type React from "react"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import confetti from "canvas-confetti"

const GRID = 10
const TILES = GRID * GRID
// Use the user's provided Source URL directly (as requested)
const IMAGE_URL = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/images-pRFQkMJeHMvHbFuYAhel3DEM4oykT5.jpeg"

// Utility: derangement (random permutation with no fixed points)
function derangement(n: number): number[] {
  const arr = Array.from({ length: n }, (_, i) => i)
  // Fisher-Yates shuffle
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  // Fix any fixed points by swapping with next index
  for (let i = 0; i < n; i++) {
    if (arr[i] === i) {
      const j = (i + 1) % n
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
  }
  return arr
}

function tileStyle(tileId: number): React.CSSProperties {
  const col = (tileId - 1) % GRID
  const row = Math.floor((tileId - 1) / GRID)
  const x = (col / (GRID - 1)) * 100
  const y = (row / (GRID - 1)) * 100
  return {
    backgroundImage: `url('${IMAGE_URL}')`,
    backgroundSize: `${GRID * 100}% ${GRID * 100}%`,
    backgroundPosition: `${x}% ${y}%`,
    backgroundRepeat: "no-repeat",
  }
}

// Small synth “boing” on wrong
function playBoing(volume = 0.5) {
  try {
    const w = window as unknown as { __ctx?: AudioContext }
    const Ctor = (window as any).AudioContext || (window as any).webkitAudioContext
    if (!Ctor) return
    const ctx = w.__ctx ?? new Ctor()
    w.__ctx = ctx
    if (ctx.state === "suspended") void ctx.resume()

    const t0 = ctx.currentTime
    const dur = 0.35
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = "sine"
    osc.frequency.setValueAtTime(650, t0)
    osc.frequency.exponentialRampToValueAtTime(180, t0 + 0.12)
    osc.frequency.exponentialRampToValueAtTime(420, t0 + 0.18)
    osc.frequency.exponentialRampToValueAtTime(120, t0 + 0.35)
    gain.gain.setValueAtTime(0.0001, t0)
    gain.gain.exponentialRampToValueAtTime(volume, t0 + 0.03)
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur)
    osc.connect(gain).connect(ctx.destination)
    osc.start(t0)
    osc.stop(t0 + dur + 0.02)
  } catch {}
}

export default function Page() {
  // Mapping: clicking index i makes index prankMap[i] wobble/reveal
  const [prankMap, setPrankMap] = useState<number[]>(() => derangement(TILES))

  // Locked (permanently revealed) positions
  const [locked, setLocked] = useState<boolean[]>(() => Array(TILES).fill(false))

  // The next tile we need to reveal (by its target position index + 1)
  const [nextToReveal, setNextToReveal] = useState<number>(1)

  // Visual feedback state
  const [wobbleIndex, setWobbleIndex] = useState<number | null>(null)
  const [pulseIndex, setPulseIndex] = useState<number | null>(null)
  const [wrongIndex, setWrongIndex] = useState<number | null>(null)
  const [justPlacedIndex, setJustPlacedIndex] = useState<number | null>(null)
  const [completed, setCompleted] = useState<boolean>(false)

  // Peek animation toggle
  const [peek, setPeek] = useState<boolean>(false)

  // Confetti when completed
  useEffect(() => {
    if (!completed) return
    const duration = 1500
    const end = Date.now() + duration
    const tick = () => {
      confetti({
        particleCount: 8 + Math.floor(Math.random() * 10),
        spread: 70,
        startVelocity: 35,
        origin: { y: 0.6, x: Math.random() * 0.8 + 0.1 },
        colors: ["#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#a855f7", "#ec4899"],
      })
      if (Date.now() < end) requestAnimationFrame(tick)
    }
    tick()
  }, [completed])

  const reset = () => {
    setPrankMap(derangement(TILES))
    setLocked(Array(TILES).fill(false))
    setNextToReveal(1)
    setWobbleIndex(null)
    setPulseIndex(null)
    setWrongIndex(null)
    setJustPlacedIndex(null)
    setCompleted(false)
  }

  const peekNow = useCallback(() => {
    setPeek(true)
    // Hide after ~1.2s; individual tiles have staggered delay
    setTimeout(() => setPeek(false), 1400)
  }, [])

  // Auto-peek once on first mount to “display the hidden picture”
  useEffect(() => {
    const t = setTimeout(() => {
      peekNow()
    }, 450)
    return () => clearTimeout(t)
  }, [peekNow])

  // Click behavior: click i -> j wobble, reveal mapping; if j is the next needed index, lock it
  const handleCellClick = (i: number) => {
    if (completed) return

    const j = prankMap[i]

    // Always wobble and quick pulse the mapped cell to expose mapping
    setWobbleIndex(j)
    setPulseIndex(j)
    setTimeout(() => setWobbleIndex((idx) => (idx === j ? null : idx)), 350)
    setTimeout(() => setPulseIndex((idx) => (idx === j ? null : idx)), 450)

    const needIndex = nextToReveal - 1
    const hasStarted = nextToReveal > 1 // after the first tile is correctly revealed

    if (j === needIndex && !locked[j]) {
      // Correct: permanently reveal tile j+1 (tile number nextToReveal)
      setLocked((prev) => {
        const next = [...prev]
        next[j] = true
        return next
      })
      setJustPlacedIndex(j)
      setTimeout(() => setJustPlacedIndex(null), 500)

      const nextN = nextToReveal + 1
      if (nextN > TILES) {
        setCompleted(true)
      } else {
        setNextToReveal(nextN)
      }
    } else {
      // Wrong click
      playBoing(0.6)
      setWrongIndex(j)

      if (hasStarted) {
        // After first correct reveal, any wrong click resets the entire puzzle
        setTimeout(() => {
          setWrongIndex((idx) => (idx === j ? null : idx))
          reset()
        }, 420)
      } else {
        // Before starting (nextToReveal === 1), allow probing without reset
        setTimeout(() => setWrongIndex((idx) => (idx === j ? null : idx)), 450)
      }
    }
  }

  const gridIndices = useMemo(() => Array.from({ length: TILES }, (_, i) => i), [])

  return (
    <main className="min-h-screen w-full bg-gradient-to-b from-pink-100 via-amber-100 to-sky-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <header className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-fuchsia-600 drop-shadow-sm">
            {"ശ്രീരാജരാജേശ്വരി puzzle"}
          </h1>
          {/* <p className="mt-2 text-sm md:text-base text-fuchsia-700/80">
            Click any cell: a different cell wobbles&#44; revealing the mapping. Place tiles in order 1 → 100 by
            clicking the cell that maps to the needed position.
          </p> */}
          <div className="mt-3 flex items-center justify-center gap-3 flex-wrap">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 shadow-sm">
              <span className="text-xs md:text-sm font-semibold text-emerald-700">Next position:</span>
              <span className="text-base md:text-lg font-black text-emerald-600 drop-shadow">#{nextToReveal}</span>
            </div>
            <Button
              variant="outline"
              onClick={peekNow}
              className="border-fuchsia-300 text-fuchsia-700 hover:bg-fuchsia-50 rounded-full bg-transparent"
            >
              Peek picture
            </Button>
            <Button
              onClick={reset}
              className="bg-fuchsia-500 hover:bg-fuchsia-600 text-white font-bold rounded-full px-5"
            >
              New Mapping
            </Button>
          </div>
        </header>

        <section
          className={[
            "mx-auto grid",
            "grid-cols-10", // rows auto-flow
            "gap-[2px] sm:gap-1 md:gap-1", // decreased gaps for 10×10
            "p-2 sm:p-3 md:p-3",
            "rounded-2xl bg-white/70 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.25)]",
          ].join(" ")}
          aria-label="10 by 10 mapping puzzle grid"
        >
          {gridIndices.map((idx) => {
            const isLocked = locked[idx]
            const isWobble = wobbleIndex === idx
            const isPulse = pulseIndex === idx
            const isWrong = wrongIndex === idx
            const isJustPlaced = justPlacedIndex === idx
            const showImage = isLocked

            const row = Math.floor(idx / GRID)
            const col = idx % GRID

            return (
              <button
                key={idx}
                type="button"
                aria-label={`Grid cell ${idx + 1}`}
                className={[
                  "relative aspect-square rounded-lg overflow-hidden border-2", // thinner borders for dense grid
                  isLocked ? "border-emerald-300" : "border-fuchsia-300/80",
                  "bg-gradient-to-br from-amber-200 via-pink-200 to-violet-200",
                  "transition-transform duration-150 ease-[cubic-bezier(.2,.8,.2,1)]",
                  !isLocked ? "hover:-translate-y-[1px] hover:scale-[1.01] hover:rotate-[0.5deg]" : "",
                  !isLocked ? "cursor-hand" : "cursor-default",
                  isWobble ? "animate-wiggle" : "",
                  isWrong ? "animate-shake" : "",
                  isJustPlaced ? "animate-pop" : "",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400",
                ].join(" ")}
                onClick={() => handleCellClick(idx)}
              >
                {/* Hidden cover (until locked) */}
                {!showImage && (
                  <div className="absolute inset-0 grid place-items-center">
                    <div className="text-base md:text-lg font-extrabold text-fuchsia-700 drop-shadow-sm">?</div>
                  </div>
                )}

                {/* Revealed image for the correct tile piece when locked */}
                {showImage && (
                  <div
                    className={["absolute inset-0 rounded-[6px] animate-flipin ring-2 ring-emerald-300 shadow"].join(
                      " ",
                    )}
                    style={tileStyle(idx + 1)}
                  />
                )}

                {/* Mapping pulse indicator */}
                {isPulse && (
                  <div className="pointer-events-none absolute inset-0 rounded-lg ring-2 ring-fuchsia-400 animate-pulse" />
                )}

                {/* Peek overlay piece: shows image briefly with a staggered wave */}
                {peek && (
                  <div
                    className="pointer-events-none absolute inset-0 rounded-[6px] animate-peek will-change-transform will-change-opacity"
                    style={{
                      ...tileStyle(idx + 1),
                      animationDelay: `${(row + col) * 30}ms`,
                    }}
                    aria-hidden
                  />
                )}
              </button>
            )
          })}
        </section>

        {/* Success overlay */}
        {completed && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-sm">
            <div className="mx-4 max-w-lg w-full rounded-3xl bg-gradient-to-br from-emerald-100 via-pink-100 to-amber-100 p-8 text-center shadow-2xl border-4 border-emerald-300">
              <h2 className="text-3xl md:text-4xl font-extrabold text-emerald-700 drop-shadow">
                You survived the chaos!
              </h2>
              <p className="mt-2 text-emerald-800/80">Mapping mastered. Tiles tamed. Confetti unleashed.</p>
              <div className="mt-6">
                <Button
                  size="lg"
                  onClick={reset}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-full"
                >
                  Play again
                </Button>
              </div>
              <div aria-hidden className="mt-6 text-xs text-emerald-700/70">
                p.s. Every click reveals a secret link 🤪
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Global animations and cursor */}
      <style jsx global>{`
      .cursor-hand {
        cursor: url('/images/tiny-hand.png') 8 2, pointer;
      }
      @keyframes wiggle {
        0%, 100% { transform: rotate(-2deg); }
        50% { transform: rotate(2deg); }
      }
      .animate-wiggle { animation: wiggle 0.35s ease-in-out 0s 2; }
      @keyframes shake {
        10%, 90% { transform: translateX(-1px); }
        20%, 80% { transform: translateX(2px); }
        30%, 50%, 70% { transform: translateX(-4px); }
        40%, 60% { transform: translateX(4px); }
      }
      .animate-shake { animation: shake 0.45s ease-in-out; }
      @keyframes pop {
        0% { transform: scale(0.9); }
        60% { transform: scale(1.08); }
        100% { transform: scale(1); }
      }
      .animate-pop { animation: pop 0.28s ease-out; }
      @keyframes flipin {
        0% { transform: rotateY(90deg); opacity: 0.2; }
        100% { transform: rotateY(0deg); opacity: 1; }
      }
      .animate-flipin {
        animation: flipin 0.22s ease-out;
        transform-style: preserve-3d;
        backface-visibility: hidden;
      }
      /* Peek wave that briefly reveals each piece, with per-tile stagger via animationDelay */
      @keyframes peekPiece {
        0% { opacity: 0; transform: scale(0.96) rotate(-0.5deg); }
        12% { opacity: 1; transform: scale(1) rotate(0deg); }
        80% { opacity: 1; }
        100% { opacity: 0; transform: scale(1.02) rotate(0.5deg); }
      }
      .animate-peek {
        animation: peekPiece 1.2s cubic-bezier(.2,.8,.2,1) forwards;
      }
    `}</style>
    </main>
  )
}
