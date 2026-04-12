'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle, AlertCircle } from 'lucide-react'

interface QuoteFormValues {
  origin: string
  destination: string
  freightType: string
  weightLbs: string
  commodity: string
  pickupDate: string
  fullName: string
  company: string
  email: string
  phone: string
}

export function QuoteForm() {
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<QuoteFormValues>({ mode: 'onTouched' })

  const onSubmit = async (data: QuoteFormValues) => {
    setSubmitting(true)
    setSubmitError(null)
    try {
      const res = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json.error ?? 'Something went wrong. Please try again.')
      }
      setSubmitted(true)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="rounded border border-kanexa-border bg-kanexa-card p-10 text-center"
      >
        <div className="mx-auto mb-5 inline-flex h-14 w-14 items-center justify-center rounded border border-kanexa-gold/30 bg-kanexa-surface text-kanexa-gold">
          <CheckCircle size={26} />
        </div>
        <h3 className="text-2xl font-bold tracking-tight text-kanexa-text">
          Thanks — your request is in.
        </h3>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-kanexa-muted">
          A Kanexa account manager will reach out within one business hour with
          a quote and next steps. For anything urgent, call dispatch at
          (203) 646-6709.
        </p>
      </motion.div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded border border-kanexa-border bg-kanexa-card p-6 md:p-10"
    >
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="label" htmlFor="origin">
            Origin
          </label>
          <input
            id="origin"
            className="input"
            placeholder="Wichita, KS"
            {...register('origin', { required: 'Required' })}
          />
          {errors.origin && (
            <p className="mt-1 text-sm text-red-400">{errors.origin.message}</p>
          )}
        </div>
        <div>
          <label className="label" htmlFor="destination">
            Destination
          </label>
          <input
            id="destination"
            className="input"
            placeholder="Dallas, TX"
            {...register('destination', { required: 'Required' })}
          />
          {errors.destination && (
            <p className="mt-1 text-sm text-red-400">
              {errors.destination.message}
            </p>
          )}
        </div>
        <div>
          <label className="label" htmlFor="freightType">
            Freight type
          </label>
          <select
            id="freightType"
            className="input"
            {...register('freightType', { required: 'Required' })}
          >
            <option value="">Select an option</option>
            <option value="ftl">Full Truckload (FTL)</option>
            <option value="ltl">Less Than Truckload (LTL)</option>
            <option value="intermodal">Intermodal</option>
            <option value="specialized">Specialized / Heavy Haul</option>
            <option value="expedited">Expedited Freight</option>
            <option value="government">Government Freight</option>
          </select>
          {errors.freightType && (
            <p className="mt-1 text-sm text-red-400">
              {errors.freightType.message}
            </p>
          )}
        </div>
        <div>
          <label className="label" htmlFor="weightLbs">
            Weight (lbs)
          </label>
          <input
            id="weightLbs"
            className="input"
            inputMode="numeric"
            placeholder="24000"
            {...register('weightLbs', {
              required: 'Required',
              pattern: { value: /^[0-9,]+$/, message: 'Numbers only' },
            })}
          />
          {errors.weightLbs && (
            <p className="mt-1 text-sm text-red-400">
              {errors.weightLbs.message}
            </p>
          )}
        </div>
        <div>
          <label className="label" htmlFor="commodity">
            Commodity
          </label>
          <input
            id="commodity"
            className="input"
            placeholder="Palletized auto parts"
            {...register('commodity', { required: 'Required' })}
          />
          {errors.commodity && (
            <p className="mt-1 text-sm text-red-400">
              {errors.commodity.message}
            </p>
          )}
        </div>
        <div>
          <label className="label" htmlFor="pickupDate">
            Pickup date
          </label>
          <input
            id="pickupDate"
            type="date"
            className="input"
            {...register('pickupDate', { required: 'Required' })}
          />
          {errors.pickupDate && (
            <p className="mt-1 text-sm text-red-400">
              {errors.pickupDate.message}
            </p>
          )}
        </div>
        <div>
          <label className="label" htmlFor="fullName">
            Full name
          </label>
          <input
            id="fullName"
            className="input"
            placeholder="Jordan Mitchell"
            {...register('fullName', { required: 'Required' })}
          />
          {errors.fullName && (
            <p className="mt-1 text-sm text-red-400">
              {errors.fullName.message}
            </p>
          )}
        </div>
        <div>
          <label className="label" htmlFor="company">
            Company
          </label>
          <input
            id="company"
            className="input"
            placeholder="Acme Manufacturing"
            {...register('company', { required: 'Required' })}
          />
          {errors.company && (
            <p className="mt-1 text-sm text-red-400">
              {errors.company.message}
            </p>
          )}
        </div>
        <div>
          <label className="label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="input"
            placeholder="jordan@acme.com"
            {...register('email', {
              required: 'Required',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Enter a valid email',
              },
            })}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
          )}
        </div>
        <div>
          <label className="label" htmlFor="phone">
            Phone
          </label>
          <input
            id="phone"
            type="tel"
            className="input"
            placeholder="(555) 555-5555"
            {...register('phone', { required: 'Required' })}
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-400">{errors.phone.message}</p>
          )}
        </div>
      </div>

      {submitError && (
        <div className="mt-6 flex items-start gap-3 rounded border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      <div className="mt-6">
        <button
          type="submit"
          disabled={submitting}
          className="btn-primary w-full md:w-auto disabled:opacity-60"
        >
          {submitting ? 'Submitting…' : 'Request quote'}
          <ArrowRight size={14} />
        </button>
      </div>
    </form>
  )
}
