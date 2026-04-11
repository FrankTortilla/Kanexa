'use client'

import { motion } from 'framer-motion'
import { FileEdit, Search, Truck, type LucideIcon } from 'lucide-react'
import { HOW_STEPS, type HowStep } from '@/lib/constants'

const ICONS: Record<HowStep['icon'], LucideIcon> = {
  FileEdit,
  Search,
  Truck,
}

export function HowItWorks() {
  return (
    <div className="relative">
      {/* Connecting line (desktop only) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-0 right-0 top-6 hidden h-px bg-kanexa-gold/30 md:block"
      />

      <ol className="relative grid gap-8 md:grid-cols-3 md:gap-10">
        {HOW_STEPS.map((step, i) => {
          const Icon = ICONS[step.icon]
          return (
            <motion.li
              key={step.number}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.35,
                ease: 'easeOut',
                delay: i * 0.08,
              }}
              className="relative"
            >
              {/* Number badge */}
              <div className="relative z-10 inline-flex h-12 w-12 items-center justify-center rounded border border-kanexa-gold bg-kanexa-bg text-base font-bold tracking-tight text-kanexa-gold">
                {step.number}
              </div>
              <div className="mt-5 flex items-center gap-3">
                <Icon size={18} className="text-kanexa-gold" />
                <h3 className="text-lg font-bold tracking-tight text-kanexa-text">
                  {step.title}
                </h3>
              </div>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-kanexa-muted">
                {step.description}
              </p>
            </motion.li>
          )
        })}
      </ol>
    </div>
  )
}
