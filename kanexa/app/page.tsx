import {
  Activity,
  ArrowRight,
  BadgeCheck,
  Eye,
  HeartHandshake,
  Headset,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react'
import Link from 'next/link'
import { ServiceCard } from '@/components/ServiceCard'
import { StatsBand } from '@/components/StatsBand'
import { HowItWorks } from '@/components/HowItWorks'
import { TestimonialCard } from '@/components/TestimonialCard'
import { TeamCard } from '@/components/TeamCard'
import { QuoteForm } from '@/components/QuoteForm'
import {
  COMPANY,
  DIFFERENTIATORS,
  SERVICES,
  TEAM,
  TESTIMONIALS,
  VALUES,
} from '@/lib/constants'

const DIFF_ICONS: Record<string, LucideIcon> = {
  BadgeCheck,
  Headset,
  Activity,
}

const VALUE_ICONS: Record<string, LucideIcon> = {
  ShieldCheck,
  Eye,
  HeartHandshake,
}

export default function HomePage() {
  return (
    <>
      {/* 1. HERO */}
      <section className="relative overflow-hidden border-b border-kanexa-border">
        {/* Route-line SVG background */}
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full text-kanexa-border"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <defs>
            <pattern
              id="route-grid"
              width="80"
              height="80"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 80 0 L 0 0 0 80"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#route-grid)" />
          <path
            d="M -20 240 Q 280 60 540 220 T 1100 180"
            fill="none"
            stroke="#C9A84C"
            strokeOpacity="0.35"
            strokeWidth="1.5"
            strokeDasharray="6 8"
          />
          <path
            d="M -20 360 Q 320 200 600 340 T 1200 300"
            fill="none"
            stroke="#C9A84C"
            strokeOpacity="0.18"
            strokeWidth="1"
            strokeDasharray="4 10"
          />
        </svg>
        <div
          className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-kanexa-bg to-transparent"
          aria-hidden="true"
        />

        <div className="container-page relative py-24 lg:py-36">
          <div className="max-w-3xl">
            <span className="eyebrow">
              Freight brokerage · {COMPANY.city}, {COMPANY.state}
            </span>
            <h1 className="text-4xl font-bold leading-[1.05] tracking-tight text-kanexa-text md:text-6xl">
              Moving what matters.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-kanexa-muted md:text-lg">
              Kanexa moves FTL, LTL, intermodal, specialized, expedited, and
              government freight across 48 states. One account manager. One
              promise: your load arrives when we say it will.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link href="#quote" className="btn-primary">
                Get a quote
                <ArrowRight size={14} />
              </Link>
              <Link href="#services" className="btn-ghost">
                Our services
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. STATS */}
      <StatsBand />

      {/* 3. SERVICES */}
      <section id="services" className="section scroll-mt-16">
        <div className="container-page">
          <div className="mb-14 max-w-2xl">
            <span className="eyebrow">What we move</span>
            <h2 className="text-3xl font-bold tracking-tight text-kanexa-text md:text-4xl">
              Six lanes of capacity, one team behind every load.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-kanexa-muted">
              From a single pallet to a permitted oversize move, our dispatch
              team books vetted carriers and tracks the freight from pickup to
              proof of delivery.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section className="section border-t border-kanexa-border bg-kanexa-surface">
        <div className="container-page">
          <div className="mb-14 max-w-2xl">
            <span className="eyebrow">How it works</span>
            <h2 className="text-3xl font-bold tracking-tight text-kanexa-text md:text-4xl">
              Three steps from request to proof of delivery.
            </h2>
          </div>
          <HowItWorks />
        </div>
      </section>

      {/* 5. WHY KANEXA */}
      <section className="section">
        <div className="container-page">
          <div className="mb-14 max-w-2xl">
            <span className="eyebrow">Why Kanexa</span>
            <h2 className="text-3xl font-bold tracking-tight text-kanexa-text md:text-4xl">
              Built for shippers who can&rsquo;t afford a missed delivery.
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {DIFFERENTIATORS.map((diff) => {
              const Icon = DIFF_ICONS[diff.icon]
              return (
                <div
                  key={diff.title}
                  className="rounded border border-kanexa-border bg-kanexa-card p-6"
                >
                  <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded border border-kanexa-border bg-kanexa-surface text-kanexa-gold">
                    <Icon size={20} />
                  </div>
                  <h3 className="text-lg font-bold tracking-tight text-kanexa-text">
                    {diff.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-kanexa-muted">
                    {diff.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* 6. TESTIMONIALS */}
      <section className="section border-t border-kanexa-border bg-kanexa-surface">
        <div className="container-page">
          <div className="mb-12 max-w-2xl">
            <span className="eyebrow">What shippers say</span>
            <h2 className="text-3xl font-bold tracking-tight text-kanexa-text md:text-4xl">
              The kind of freight partner you actually call back.
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <TestimonialCard key={t.name} testimonial={t} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* 7. ABOUT */}
      <section id="about" className="section scroll-mt-16">
        <div className="container-page">
          <div className="grid gap-12 md:grid-cols-2">
            <div>
              <span className="eyebrow">About Kanexa</span>
              <h2 className="text-3xl font-bold tracking-tight text-kanexa-text md:text-4xl">
                A freight broker that picks up the phone.
              </h2>
            </div>
            <div className="space-y-5 text-base leading-relaxed text-kanexa-muted">
              <p>
                Kanexa was founded on one idea: shippers deserve a freight
                broker who treats their loads like their own. We started in
                regional manufacturing lanes and have grown into a nationwide
                agency moving freight for enterprise shippers, government
                contractors, and small businesses alike.
              </p>
              <p>
                Today we operate as a licensed and bonded brokerage with active
                FMCSA authority and a vetted carrier network spanning every
                contiguous state. Our promise has not changed: when something
                goes sideways on a load, you hear it from us first — and we
                already have a plan.
              </p>
            </div>
          </div>

          {/* Team */}
          <div className="mt-16">
            <h3 className="mb-8 text-xs font-medium uppercase tracking-[0.2em] text-kanexa-gold">
              The team
            </h3>
            <div className="grid gap-6 md:grid-cols-3">
              {TEAM.map((member) => (
                <TeamCard key={member.name} member={member} />
              ))}
            </div>
          </div>

          {/* Values */}
          <div className="mt-16">
            <h3 className="mb-8 text-xs font-medium uppercase tracking-[0.2em] text-kanexa-gold">
              Core values
            </h3>
            <div className="grid gap-6 md:grid-cols-3">
              {VALUES.map((v) => {
                const Icon = VALUE_ICONS[v.icon]
                return (
                  <div
                    key={v.title}
                    className="rounded border border-kanexa-border bg-kanexa-card p-6"
                  >
                    <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded border border-kanexa-border bg-kanexa-surface text-kanexa-gold">
                      <Icon size={20} />
                    </div>
                    <h4 className="text-lg font-bold tracking-tight text-kanexa-text">
                      {v.title}
                    </h4>
                    <p className="mt-2 text-sm leading-relaxed text-kanexa-muted">
                      {v.description}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 8. QUOTE FORM */}
      <section
        id="quote"
        className="section scroll-mt-16 border-t border-kanexa-border bg-kanexa-surface"
      >
        <div className="container-page">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <span className="eyebrow">Get a quote</span>
            <h2 className="text-3xl font-bold tracking-tight text-kanexa-text md:text-4xl">
              Tell us about your load.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-kanexa-muted">
              Most quotes are returned within an hour during business hours.
              For anything urgent, call dispatch at{' '}
              <a
                href={COMPANY.phoneHref}
                className="text-kanexa-gold transition-colors hover:text-kanexa-gold-light"
              >
                {COMPANY.phone}
              </a>
              .
            </p>
          </div>
          <div className="mx-auto max-w-3xl">
            <QuoteForm />
          </div>
        </div>
      </section>

      {/* 9. CONTACT STRIP */}
      <section className="border-t border-kanexa-border bg-kanexa-bg">
        <div className="container-page py-14">
          <div className="grid gap-8 md:grid-cols-3">
            <a
              href={COMPANY.phoneHref}
              className="flex items-start gap-4 transition-colors hover:text-kanexa-gold-light"
            >
              <div className="inline-flex h-10 w-10 flex-none items-center justify-center rounded border border-kanexa-border bg-kanexa-card text-kanexa-gold">
                <Phone size={18} />
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.16em] text-kanexa-muted">
                  Phone
                </div>
                <div className="mt-1 text-sm font-medium text-kanexa-text">
                  {COMPANY.phone}
                </div>
              </div>
            </a>
            <a
              href={COMPANY.emailHref}
              className="flex items-start gap-4 transition-colors hover:text-kanexa-gold-light"
            >
              <div className="inline-flex h-10 w-10 flex-none items-center justify-center rounded border border-kanexa-border bg-kanexa-card text-kanexa-gold">
                <Mail size={18} />
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.16em] text-kanexa-muted">
                  Email
                </div>
                <div className="mt-1 break-all text-sm font-medium text-kanexa-text">
                  {COMPANY.email}
                </div>
              </div>
            </a>
            <div className="flex items-start gap-4">
              <div className="inline-flex h-10 w-10 flex-none items-center justify-center rounded border border-kanexa-border bg-kanexa-card text-kanexa-gold">
                <MapPin size={18} />
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.16em] text-kanexa-muted">
                  Headquarters
                </div>
                <div className="mt-1 text-sm font-medium text-kanexa-text">
                  {COMPANY.city}, {COMPANY.state}
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 border-t border-kanexa-border pt-6">
            <p className="text-xs text-kanexa-muted">
              {COMPANY.hours} · {COMPANY.dispatch}
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
