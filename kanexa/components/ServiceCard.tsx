'use client'

import { motion } from 'framer-motion'
import {
  ArrowRightLeft,
  Building2,
  Package,
  Shield,
  Truck,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import type { Service } from '@/lib/constants'

const ICONS: Record<Service['icon'], LucideIcon> = {
  Truck,
  Package,
  ArrowRightLeft,
  Shield,
  Zap,
  Building2,
}

interface Props {
  service: Service
}

export function ServiceCard({ service }: Props) {
  const Icon = ICONS[service.icon]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="flex h-full flex-col rounded border border-kanexa-border bg-kanexa-card p-6 transition-colors hover:border-kanexa-gold/40"
    >
      <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded border border-kanexa-border bg-kanexa-surface text-kanexa-gold">
        <Icon size={20} />
      </div>
      <h3 className="text-lg font-bold tracking-tight text-kanexa-text">
        {service.name}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-kanexa-muted">
        {service.description}
      </p>
    </motion.div>
  )
}
