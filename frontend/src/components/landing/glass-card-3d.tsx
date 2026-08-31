"use client"

import { motion } from "framer-motion"
import { ReactNode } from "react"

interface GlassCard3DProps {
  children: ReactNode
  className?: string
  hover?: boolean
  delay?: number
}

export function GlassCard3D({
  children,
  className = "",
  hover = true,
  delay = 0,
}: GlassCard3DProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay }}
      whileHover={
        hover
          ? {
              y: -6,
              rotateX: 2,
              rotateY: -2,
              transition: { type: "spring", stiffness: 300, damping: 20 },
            }
          : undefined
      }
      className={`relative rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-xl ${className}`}
      style={{ transformStyle: "preserve-3d" }}
    >
      {/* Top edge highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      {children}
    </motion.div>
  )
}
