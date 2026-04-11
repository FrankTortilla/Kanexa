'use client'

import { motion } from 'framer-motion'
import { STATS } from '@/lib/constants'

export function StatsBand() {
  return (
    <section className="border-y border-kanexa-border bg-kanexa-surface">
      <div className="container-page grid grid-cols-2 gap-x-8 gap-y-10 py-14 md:grid-cols-4">
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.35,
              ease: 'easeOut',
              delay: i * 0.08,
            }}
            className="text-center md:text-left"
          >
            <div className="text-3xl font-bold tracking-tight text-kanexa-gold md:text-4xl">
              {stat.value}
            </div>
            <div className="mt-1 text-xs uppercase tracking-[0.16em] text-kanexa-muted">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
