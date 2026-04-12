'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import type { LegalSection } from '@/lib/constants'
import { cn } from '@/lib/cn'

interface Props {
  title: string
  lastUpdated: string
  sections: LegalSection[]
}

export function LegalDisclosure({ title, lastUpdated, sections }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border border-kanexa-border bg-kanexa-card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left transition-colors hover:bg-kanexa-surface"
      >
        <div>
          <div className="text-base font-bold tracking-tight text-kanexa-text">
            {title}
          </div>
          <div className="mt-1 text-xs text-kanexa-muted">
            Last updated {lastUpdated}
          </div>
        </div>
        <ChevronRight
          size={18}
          className={cn(
            'flex-none text-kanexa-gold transition-transform duration-300',
            open && 'rotate-90'
          )}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="space-y-6 border-t border-kanexa-border px-6 py-6">
              {sections.map((s) => (
                <div key={s.heading}>
                  <h3 className="text-sm font-bold tracking-tight text-kanexa-text">
                    {s.heading}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-kanexa-muted">
                    {s.body}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
