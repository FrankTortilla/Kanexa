'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import type { FaqItem } from '@/lib/constants'
import { cn } from '@/lib/cn'

interface Props {
  items: FaqItem[]
}

export function FaqAccordion({ items }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  // Group by category preserving order
  const grouped = items.reduce<
    Record<string, { item: FaqItem; index: number }[]>
  >((acc, item, index) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push({ item, index })
    return acc
  }, {})

  return (
    <div className="space-y-12">
      {Object.entries(grouped).map(([category, entries]) => (
        <div key={category}>
          <h2 className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-kanexa-gold">
            {category}
          </h2>
          <div className="divide-y divide-kanexa-border border border-kanexa-border bg-kanexa-card">
            {entries.map(({ item, index }) => {
              const isOpen = openIndex === index
              return (
                <div key={item.question}>
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left transition-colors hover:bg-kanexa-surface"
                  >
                    <span className="text-sm font-medium text-kanexa-text md:text-base">
                      {item.question}
                    </span>
                    <ChevronRight
                      size={18}
                      className={cn(
                        'flex-none text-kanexa-gold transition-transform duration-300',
                        isOpen && 'rotate-90'
                      )}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="overflow-hidden"
                      >
                        <p className="px-6 pb-6 pr-12 text-sm leading-relaxed text-kanexa-muted">
                          {item.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
