import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { FaqAccordion } from '@/components/FaqAccordion'
import { LegalDisclosure } from '@/components/LegalDisclosure'
import { FAQ_ITEMS, PRIVACY_SECTIONS, TERMS_SECTIONS } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'FAQ',
  description:
    'Answers to common questions about freight brokerage with Kanexa — services, compliance, tracking, and claims.',
}

export default function FaqPage() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-kanexa-border">
        <div className="container-page py-20 lg:py-24">
          <div className="max-w-3xl">
            <span className="eyebrow">Frequently asked questions</span>
            <h1 className="text-4xl font-bold tracking-tight text-kanexa-text md:text-5xl">
              Answers before you call.
            </h1>
            <p className="mt-5 text-base leading-relaxed text-kanexa-muted md:text-lg">
              The questions shippers ask most. If you don&rsquo;t see what
              you&rsquo;re looking for, dispatch is one phone call away.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ accordion */}
      <section className="section">
        <div className="container-page">
          <div className="mx-auto max-w-4xl">
            <FaqAccordion items={FAQ_ITEMS} />
          </div>
        </div>
      </section>

      {/* Legal */}
      <section className="border-t border-kanexa-border bg-kanexa-surface">
        <div className="container-page py-16">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-6 text-xs font-medium uppercase tracking-[0.2em] text-kanexa-gold">
              Legal
            </h2>
            <div className="space-y-4">
              <LegalDisclosure
                title="Terms of Service"
                lastUpdated="April 2026"
                sections={TERMS_SECTIONS}
              />
              <LegalDisclosure
                title="Privacy Policy"
                lastUpdated="April 2026"
                sections={PRIVACY_SECTIONS}
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-kanexa-border">
        <div className="container-page py-16">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-kanexa-text md:text-3xl">
                Still have questions?
              </h2>
              <p className="mt-2 text-sm text-kanexa-muted">
                Reach dispatch directly or request a quote in under a minute.
              </p>
            </div>
            <Link href="/#quote" className="btn-primary">
              Get a quote
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
