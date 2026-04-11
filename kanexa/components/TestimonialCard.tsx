'use client'

import { motion } from 'framer-motion'
import type { Testimonial } from '@/lib/constants'

interface Props {
  testimonial: Testimonial
  index?: number
}

export function TestimonialCard({ testimonial, index = 0 }: Props) {
  return (
    <motion.figure
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, ease: 'easeOut', delay: index * 0.08 }}
      className="flex h-full flex-col rounded border border-kanexa-border bg-kanexa-card p-6"
    >
      <div
        aria-hidden="true"
        className="text-3xl font-bold leading-none text-kanexa-gold"
      >
        “
      </div>
      <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-kanexa-text">
        {testimonial.quote}
      </blockquote>
      <figcaption className="mt-6 border-t border-kanexa-border pt-4">
        <div className="text-sm font-medium text-kanexa-text">
          {testimonial.name}
        </div>
        <div className="text-xs text-kanexa-muted">
          {testimonial.role} · {testimonial.company}
        </div>
      </figcaption>
    </motion.figure>
  )
}
