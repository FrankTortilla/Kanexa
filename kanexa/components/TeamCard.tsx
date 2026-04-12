'use client'

import { motion } from 'framer-motion'
import type { TeamMember } from '@/lib/constants'

interface Props {
  member: TeamMember
}

export function TeamCard({ member }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="rounded border border-kanexa-border bg-kanexa-card p-6"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded border border-kanexa-border bg-kanexa-surface text-base font-bold tracking-tight text-kanexa-gold">
        {member.initials}
      </div>
      <h3 className="mt-5 text-lg font-bold tracking-tight text-kanexa-text">
        {member.name}
      </h3>
      <p className="mt-1 text-sm text-kanexa-gold">{member.title}</p>
      <p className="mt-3 text-sm leading-relaxed text-kanexa-muted">
        {member.bio}
      </p>
    </motion.div>
  )
}
