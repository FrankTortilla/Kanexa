'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { NAV_LINKS } from '@/lib/constants'
import { cn } from '@/lib/cn'

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 w-full border-b transition-colors',
          scrolled
            ? 'border-kanexa-border bg-kanexa-bg/80 backdrop-blur'
            : 'border-transparent bg-transparent'
        )}
      >
        <div className="container-page flex h-16 items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-3"
            aria-label="Kanexa home"
          >
            <Image
              src="/logo-monogram.png"
              alt=""
              width={40}
              height={40}
              className="h-10 w-auto"
              priority
            />
            <span className="text-base font-bold tracking-tight text-kanexa-text">
              Kanexa
            </span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-kanexa-muted transition-colors hover:text-kanexa-text"
              >
                {link.label}
              </Link>
            ))}
            <Link href="/#quote" className="btn-primary px-4 py-2">
              Get a quote
            </Link>
          </nav>

          <button
            type="button"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="rounded border border-kanexa-border p-2 text-kanexa-text md:hidden"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="overflow-hidden border-t border-kanexa-border bg-kanexa-bg md:hidden"
            >
              <nav className="container-page flex flex-col gap-1 py-4">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="rounded px-2 py-3 text-sm text-kanexa-text hover:bg-kanexa-surface"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile sticky CTA */}
      <Link
        href="/#quote"
        className="btn-primary fixed inset-x-4 bottom-4 z-40 md:hidden"
      >
        Get a quote
      </Link>
    </>
  )
}
