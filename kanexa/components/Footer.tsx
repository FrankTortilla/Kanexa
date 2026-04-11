import Link from 'next/link'
import Image from 'next/image'
import { COMPANY } from '@/lib/constants'

const FOOTER_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/#services' },
  { label: 'About', href: '/#about' },
  { label: 'FAQ', href: '/faq' },
]

export function Footer() {
  return (
    <footer className="border-t border-kanexa-border bg-kanexa-bg">
      <div className="container-page py-12">
        <div className="grid items-center gap-8 md:grid-cols-3">
          {/* Left: logo */}
          <div className="flex items-center md:justify-start">
            <Image
              src="/logo-full.png"
              alt="Kanexa Freight"
              width={180}
              height={40}
              className="h-10 w-auto"
            />
          </div>

          {/* Center: nav */}
          <nav className="flex flex-wrap items-center justify-start gap-x-6 gap-y-2 md:justify-center">
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-kanexa-muted transition-colors hover:text-kanexa-text"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right: powered by */}
          <a
            href="https://www.fenichey.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 transition-opacity hover:opacity-80 md:justify-end"
          >
            <span className="text-xs text-kanexa-muted">Powered by</span>
            <Image
              src="/fenichey-logo.png"
              alt="Fenichey"
              width={84}
              height={24}
              className="h-6 w-auto"
            />
          </a>
        </div>

        {/* Compliance strip */}
        <div className="mt-10 border-t border-kanexa-border pt-6">
          <p className="text-xs text-kanexa-muted">
            MC# {COMPANY.mc} · DOT# {COMPANY.dot} · BMC-84 Bond #
            {COMPANY.bondNumber} · FMCSA #{COMPANY.fmcsa} · Licensed &amp;
            Bonded
          </p>
          <p className="mt-2 text-xs text-kanexa-muted">
            © 2026 {COMPANY.legalName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
