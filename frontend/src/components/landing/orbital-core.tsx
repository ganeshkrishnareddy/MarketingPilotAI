"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

const modules = [
  { label: "CONTENT", angle: 0, color: "from-cyan-400 to-blue-500" },
  { label: "SEO", angle: 51, color: "from-violet-400 to-purple-500" },
  { label: "SOCIAL", angle: 102, color: "from-blue-400 to-indigo-500" },
  { label: "ADS", angle: 153, color: "from-sky-400 to-cyan-500" },
  { label: "CRM", angle: 204, color: "from-indigo-400 to-violet-500" },
  { label: "AUTOMATION", angle: 255, color: "from-purple-400 to-pink-500" },
  { label: "ANALYTICS", angle: 306, color: "from-blue-500 to-cyan-400" },
]

interface OrbitalCoreProps {
  mouseX: number
  mouseY: number
}

export function OrbitalCore({ mouseX, mouseY }: OrbitalCoreProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const tiltX = mouseY * 0.02
  const tiltY = mouseX * 0.02

  return (
    <div
      className="relative mx-auto h-[420px] w-[420px] md:h-[520px] md:w-[520px]"
      style={{
        perspective: "1000px",
        transformStyle: "preserve-3d",
      }}
    >
      {/* Rotating container */}
      <motion.div
        className="absolute inset-0"
        style={{
          transformStyle: "preserve-3d",
          transform: `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
        }}
        animate={{
          rotateY: [0, 360],
        }}
        transition={{
          duration: 120,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {/* Central core */}
        <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
          <motion.div
            className="relative"
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {/* Outer glow */}
            <div className="absolute -inset-8 rounded-full bg-gradient-to-r from-cyan-500/20 via-blue-500/10 to-violet-500/20 blur-2xl" />
            {/* Core glow */}
            <div className="absolute -inset-4 rounded-full bg-gradient-to-br from-cyan-400/30 to-blue-600/30 blur-xl" />
            {/* Core body */}
            <div className="relative flex h-28 w-28 items-center justify-center rounded-full border border-cyan-400/30 bg-gradient-to-br from-[#0c1a3a] to-[#0a0f20] shadow-[0_0_60px_rgba(56,189,248,0.25),inset_0_0_30px_rgba(56,189,248,0.1)] md:h-36 md:w-36">
              <div className="text-center">
                <div className="text-xl font-black tracking-tighter text-white md:text-2xl">
                  V360
                </div>
                <div className="text-[9px] font-semibold uppercase tracking-[0.2em] text-cyan-400/80">
                  AI Core
                </div>
              </div>
              {/* Inner ring */}
              <div className="absolute inset-2 animate-spin rounded-full border border-cyan-400/10 border-t-cyan-400/40" />
            </div>
          </motion.div>
        </div>

        {/* Orbiting modules */}
        {modules.map((mod, i) => {
          const radius = 190
          const rad = (mod.angle * Math.PI) / 180
          const x = Math.cos(rad) * radius
          const y = Math.sin(rad) * radius

          return (
            <motion.div
              key={mod.label}
              className="absolute left-1/2 top-1/2 z-20"
              style={{
                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 * i, duration: 0.6 }}
            >
              {/* Connection line */}
              <svg
                className="pointer-events-none absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2"
                width={radius * 2 + 20}
                height={radius * 2 + 20}
                style={{
                  left: `calc(50% - ${x / 2}px)`,
                  top: `calc(50% - ${y / 2}px)`,
                }}
              >
                <line
                  x1={radius + 10}
                  y1={radius + 10}
                  x2={radius + 10 - x}
                  y2={radius + 10 - y}
                  stroke="rgba(56,189,248,0.12)"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
              </svg>

              {/* Module card */}
              <motion.div
                className="flex h-14 w-20 flex-col items-center justify-center rounded-xl border border-white/10 bg-[#0c1a3a]/80 shadow-lg shadow-cyan-950/20 backdrop-blur-md md:h-16 md:w-24"
                whileHover={{ scale: 1.1, y: -4 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <span className="text-[9px] font-bold uppercase tracking-wider text-white/90 md:text-[10px]">
                  {mod.label}
                </span>
                <div className={`mt-1 h-0.5 w-6 rounded-full bg-gradient-to-r ${mod.color} opacity-60`} />
              </motion.div>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Ambient glow behind everything */}
      <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-br from-cyan-500/5 via-transparent to-violet-500/5 blur-3xl" />
    </div>
  )
}
