export const COMPANY = {
  name: 'Kanexa',
  legalName: 'Kanexa Freight',
  parent: 'Fenichey',
  phone: '(203) 646-6709',
  phoneHref: 'tel:+12036466709',
  email: 'steve@kanexagroup.com',
  emailHref: 'mailto:steve@kanexagroup.com',
  city: 'Wichita',
  state: 'KS',
  hours: 'Mon–Fri 6am–8pm CT · Sat 7am–3pm CT',
  dispatch: '24/7 dispatch line available',
  mc: '830765',
  dot: '2418074',
  fmcsa: '228318',
  bondNumber: '15135',
}

export const NAV_LINKS: { label: string; href: string }[] = [
  { label: 'Services', href: '/#services' },
  { label: 'About', href: '/#about' },
  { label: 'FAQ', href: '/faq' },
]

export type ServiceId =
  | 'ftl'
  | 'ltl'
  | 'intermodal'
  | 'specialized'
  | 'expedited'
  | 'government'

export interface Service {
  id: ServiceId
  name: string
  description: string
  icon:
    | 'Truck'
    | 'Package'
    | 'ArrowRightLeft'
    | 'Shield'
    | 'Zap'
    | 'Building2'
}

export const SERVICES: Service[] = [
  {
    id: 'ftl',
    name: 'Full Truckload (FTL)',
    description:
      'Dedicated trailers moving direct from origin to destination with no intermediate handling.',
    icon: 'Truck',
  },
  {
    id: 'ltl',
    name: 'Less Than Truckload (LTL)',
    description:
      'Cost-efficient shared-trailer freight for shipments that do not fill an entire truck.',
    icon: 'Package',
  },
  {
    id: 'intermodal',
    name: 'Intermodal',
    description:
      'Container-on-rail service that lowers cost and emissions on long-haul lanes.',
    icon: 'ArrowRightLeft',
  },
  {
    id: 'specialized',
    name: 'Specialized / Heavy Haul',
    description:
      'Permitted, escorted moves for oversize, overweight, and high-value freight.',
    icon: 'Shield',
  },
  {
    id: 'expedited',
    name: 'Expedited Freight',
    description:
      'Time-critical moves with team drivers and direct dispatch for the tightest windows.',
    icon: 'Zap',
  },
  {
    id: 'government',
    name: 'Government Freight',
    description:
      'Compliant transportation for federal, state, and defense contractors.',
    icon: 'Building2',
  },
]

export const STATS: { value: string; label: string }[] = [
  { value: '10,000+', label: 'Loads delivered' },
  { value: '48', label: 'States covered' },
  { value: '98%', label: 'On-time rate' },
  { value: '8+', label: 'Years in freight' },
]

export interface HowStep {
  number: string
  title: string
  description: string
  icon: 'FileEdit' | 'Search' | 'Truck'
}

export const HOW_STEPS: HowStep[] = [
  {
    number: '01',
    title: 'Submit your load',
    description:
      'Fill out our quote form with origin, destination, type, and timeline.',
    icon: 'FileEdit',
  },
  {
    number: '02',
    title: 'We find your carrier',
    description:
      'We source vetted, compliant carriers and negotiate your rate.',
    icon: 'Search',
  },
  {
    number: '03',
    title: 'Your freight moves',
    description:
      'We coordinate pickup, monitor transit, and confirm delivery.',
    icon: 'Truck',
  },
]

export interface Differentiator {
  title: string
  description: string
  icon: 'BadgeCheck' | 'Headset' | 'Activity'
}

export const DIFFERENTIATORS: Differentiator[] = [
  {
    title: 'DOT & FMCSA compliant',
    description:
      'Bonded, insured, and audited. Every carrier we book is vetted for authority, insurance, and safety scores before dispatch.',
    icon: 'BadgeCheck',
  },
  {
    title: 'Dedicated account managers',
    description:
      'One point of contact who knows your lanes and your team. No call center, no ticket queues, no handoffs.',
    icon: 'Headset',
  },
  {
    title: 'Real-time load visibility',
    description:
      'Live GPS tracking with proactive ETA updates pushed to your inbox so you can plan dock time with confidence.',
    icon: 'Activity',
  },
]

export interface Testimonial {
  quote: string
  name: string
  role: string
  company: string
}

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      'Kanexa took over our outbound freight and our on-time rate jumped from 89 to 98 percent in the first quarter. Their dispatch team is reachable on a Sunday night, which matters when production is on the line.',
    name: 'Eleanor Vance',
    role: 'VP of Supply Chain',
    company: 'Industrial manufacturer',
  },
  {
    quote:
      'We move oversize equipment on tight federal timelines. Kanexa handles permitting and escorts without us having to chase anyone. Documentation arrives clean every time.',
    name: 'Daniel Okafor',
    role: 'Logistics Manager',
    company: 'Defense subcontractor',
  },
  {
    quote:
      'For a small business shipping LTL into the Midwest, Kanexa made the lanes that used to be a headache feel routine. Pricing is transparent and the rep knows our SKUs by heart.',
    name: 'Hannah Whitfield',
    role: 'Operations Lead',
    company: 'E-commerce brand',
  },
]

export interface TeamMember {
  initials: string
  name: string
  title: string
  bio: string
}

export const TEAM: TeamMember[] = [
  {
    initials: 'MD',
    name: 'Marcus Dillard',
    title: 'Director of Operations',
    bio: 'Twelve years coordinating cross-country freight for manufacturing and defense clients. Owns dispatch and on-time performance.',
  },
  {
    initials: 'PR',
    name: 'Priya Ramaswamy',
    title: 'Compliance & Claims Lead',
    bio: 'Background in FMCSA regulatory affairs. Manages bonding, insurance verification, and claims from intake through settlement.',
  },
  {
    initials: 'JT',
    name: 'Jordan Tanaka',
    title: 'Senior Account Manager',
    bio: 'Single point of contact for enterprise shippers. Knows every lane, every commodity, and every dock window by heart.',
  },
]

export interface ValueItem {
  title: string
  description: string
  icon: 'ShieldCheck' | 'Eye' | 'HeartHandshake'
}

export const VALUES: ValueItem[] = [
  {
    title: 'Reliability',
    description:
      'Loads move when we say they will. If something changes, you hear it from us first.',
    icon: 'ShieldCheck',
  },
  {
    title: 'Transparency',
    description:
      'No mystery fees, no fine print. Quotes are itemized and tracking is shared the moment a carrier accepts.',
    icon: 'Eye',
  },
  {
    title: 'Partnership',
    description:
      'We treat shippers as long-term partners, not transactions. Account managers learn your business.',
    icon: 'HeartHandshake',
  },
]

export interface FaqItem {
  category: string
  question: string
  answer: string
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    category: 'Getting started',
    question: 'What is a freight broker and how does Kanexa work?',
    answer:
      'A freight broker connects shippers with vetted motor carriers and manages the move end to end. Kanexa sources capacity, negotiates rates, books the carrier, tracks the load, and resolves any issues that come up so you only ever deal with one team.',
  },
  {
    category: 'Getting started',
    question: 'How do I request a quote?',
    answer:
      'Use the quote form on this site or call dispatch directly at (203) 646-6709. Most quotes are returned within an hour during business hours and the same day for after-hours requests.',
  },
  {
    category: 'Getting started',
    question: 'How quickly can you move my freight?',
    answer:
      'Standard pickups are scheduled within 24 to 48 hours. Expedited service can dispatch the same day depending on origin and equipment availability. Tell us your deadline and we will work backwards from it.',
  },
  {
    category: 'Getting started',
    question: 'What info do I need ready when I call?',
    answer:
      'Have origin and destination zip codes, freight type and weight, commodity description, pickup date, and any special handling needs like liftgate or hazmat. The more we know up front, the faster we can confirm a rate.',
  },
  {
    category: 'Services & shipments',
    question: "What's the difference between FTL and LTL?",
    answer:
      'Full truckload (FTL) dedicates an entire trailer to one shipment with no intermediate stops, which is faster and reduces handling. Less-than-truckload (LTL) shares trailer space with other shippers and is more cost-effective for smaller loads.',
  },
  {
    category: 'Services & shipments',
    question: 'Do you handle hazmat?',
    answer:
      'Yes. We work with hazmat-certified carriers and require proper documentation, placarding, and driver endorsements before dispatch. Reach out and we will confirm the requirements for your commodity.',
  },
  {
    category: 'Services & shipments',
    question: 'Can you move oversize or overweight loads?',
    answer:
      'Specialized and heavy haul is a core service. We handle permitting, route surveys, pilot car coordination, and equipment selection from step-deck through multi-axle RGN trailers.',
  },
  {
    category: 'Services & shipments',
    question: 'Do you ship to all 48 states?',
    answer:
      'Yes. We cover all 48 contiguous states directly with our vetted carrier network. Alaska and Hawaii are available through partner carriers on a project basis.',
  },
  {
    category: 'Services & shipments',
    question: 'Can Kanexa handle government contract freight?',
    answer:
      'We move freight for federal, state, and defense contractors and are familiar with DTMO, GSA, and SDDC routing requirements. Cleared driver options are available for sensitive shipments on request.',
  },
  {
    category: 'Services & shipments',
    question: 'What is intermodal shipping?',
    answer:
      'Intermodal moves freight using a combination of truck and rail in a single 53-foot container. It typically lowers fuel costs and emissions on long-haul lanes while maintaining reliable transit times.',
  },
  {
    category: 'Trust & compliance',
    question: 'Is Kanexa licensed and bonded?',
    answer:
      'Yes. Kanexa operates under MC# 830765 and DOT# 2418074, with a $100,000 BMC-84 surety bond (#15135) issued through Southwest Marine and General Insurance Company.',
  },
  {
    category: 'Trust & compliance',
    question: 'What insurance do you carry?',
    answer:
      'Every carrier in our network is vetted for active auto liability and cargo insurance before dispatch. We can provide certificates of insurance naming your company as the shipper or consignee on request.',
  },
  {
    category: 'Trust & compliance',
    question: 'How do I track my shipment?',
    answer:
      'You receive live GPS tracking links and proactive ETA updates from your account manager. We push status changes the moment they happen, so you are never waiting for an answer when planning dock time.',
  },
  {
    category: 'Trust & compliance',
    question: 'What happens if freight is damaged?',
    answer:
      'Notify dispatch immediately and document the damage on the BOL at delivery. Our compliance team manages the claims process directly with the carrier from intake through settlement so you never have to chase paperwork.',
  },
]

export interface LegalSection {
  heading: string
  body: string
}

export const TERMS_SECTIONS: LegalSection[] = [
  {
    heading: '1. Acceptance of terms',
    body: 'By accessing the Kanexa website or engaging Kanexa for freight brokerage services, you agree to be bound by these terms. If you do not agree, please discontinue use of the site and our services.',
  },
  {
    heading: '2. Services provided',
    body: 'Kanexa is a licensed freight broker operating under MC# 830765 and DOT# 2418074. We arrange transportation of freight by motor carrier but do not own or operate the equipment used to move shipments.',
  },
  {
    heading: '3. Shipper responsibilities',
    body: 'Shippers are responsible for accurate descriptions of freight, proper packaging, and truthful weight and dimension information. Misrepresentations may result in rate adjustments, claims, or cancellation.',
  },
  {
    heading: '4. Rates and payment',
    body: 'Quoted rates are valid for the timeframe specified at quote and assume the freight matches its description. Invoices are due net 30 unless otherwise agreed in writing. Late accounts may incur a finance charge.',
  },
  {
    heading: '5. Liability',
    body: 'Carrier liability for cargo loss or damage is limited to the terms of the carrier’s applicable tariff and the Carmack Amendment. Kanexa is not liable for delays, indirect damages, or consequential losses.',
  },
  {
    heading: '6. Claims',
    body: 'Cargo claims must be submitted in writing within nine months of delivery. Note any visible damage on the bill of lading at delivery and notify Kanexa immediately so we can preserve your rights with the carrier.',
  },
  {
    heading: '7. Governing law',
    body: 'These terms are governed by the laws of the State of Kansas without regard to its conflict of law provisions. Disputes will be resolved in the state or federal courts located in Sedgwick County, Kansas.',
  },
  {
    heading: '8. Updates to terms',
    body: 'Kanexa may update these terms from time to time. Continued use of our services after updates constitutes acceptance. Last updated April 2026.',
  },
]

export const PRIVACY_SECTIONS: LegalSection[] = [
  {
    heading: '1. Information we collect',
    body: 'We collect information you provide directly, such as your name, company, contact details, and freight details when you request a quote or contact us. We also collect basic site analytics like page views and referrers.',
  },
  {
    heading: '2. How we use information',
    body: 'We use your information to respond to inquiries, prepare quotes, book and track shipments, manage billing, and improve our services. We never sell your personal information to third parties.',
  },
  {
    heading: '3. Information sharing',
    body: 'We share shipment information with the carriers and partners necessary to move your freight and with service providers that help us operate our business, such as accounting and email tools, under appropriate confidentiality terms.',
  },
  {
    heading: '4. Data retention',
    body: 'We retain customer and shipment records for as long as needed to provide services and meet legal, accounting, and regulatory requirements. You can request deletion of your contact information at any time.',
  },
  {
    heading: '5. Cookies and analytics',
    body: 'Our website uses essential cookies and standard analytics to understand how visitors use the site. You can control cookies through your browser settings without affecting your ability to request a quote.',
  },
  {
    heading: '6. Your rights',
    body: 'You can request access to, correction of, or deletion of your personal information by emailing steve@kanexagroup.com. We will respond within a reasonable timeframe and in accordance with applicable law.',
  },
  {
    heading: '7. Updates to this policy',
    body: 'We may update this policy from time to time as our practices evolve. Last updated April 2026.',
  },
]
