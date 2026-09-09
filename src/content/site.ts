export const site = {
  companyName: 'Cumulative Labs',
  tagline: 'Intelligence That Compounds.',
  canonicalUrl: 'https://cumulativelabs.com',
  contact: {
    email: 'accounts@cumulativelabs.ai',
  },
  seo: {
    title: 'Cumulative Labs — Intelligence That Compounds.',
    description:
      'Cumulative Labs is developing AI research systems around durable, verified knowledge. League Vector is our first applied proving ground, in development.',
  },
  navigation: [
    { label: 'Work', href: '#work' },
    { label: 'Why Cumulative', href: '#mission' },
    { label: 'Approach', href: '#approach' },
    { label: 'Principles', href: '#principles' },
    { label: 'Contact', href: '#contact' },
  ],
  hero: {
    eyebrow: 'Cumulative intelligence, built to endure',
    headline: ['Intelligence', 'That', 'Compounds.'],
    body: 'Cumulative Labs is developing AI research systems designed to preserve verified knowledge—so each new task can build on useful findings from the last.',
    support: 'Our first applied proving ground: League Vector, a dynasty fantasy football product in development.',
    primaryAction: { label: 'See What We’re Building', href: '#work' },
    secondaryAction: { label: 'Contact the Lab', href: '#contact' },
  },
  mission: {
    label: 'Why Cumulative Intelligence',
    headline: ['Good Work Should', 'Carry Forward.'],
    body: 'A useful conclusion can outlast the task that produced it. We’re exploring how to preserve findings that survive scrutiny, keep them traceable, and make them available to future work.',
  },
  whyCumulative: {
    contrasts: [
      {
        title: 'Starting over',
        body: 'Evidence is reviewed, but its conclusion is disconnected from the next task.',
        tone: 'fragmented',
      },
      {
        title: 'Building forward',
        body: 'A supported finding stays available, with its limits, for the next task to use or revise.',
        tone: 'structured',
      },
    ],
  },
  approach: {
    label: 'Our Approach',
    headline: 'From signal to knowledge that survives.',
    stages: [
      {
        number: '01',
        title: 'Explore',
        body: 'Search broadly for evidence, possibilities, and new questions.',
        icon: 'compass',
      },
      {
        number: '02',
        title: 'Challenge',
        body: 'Pressure-test assumptions and competing explanations.',
        icon: 'challenge',
      },
      {
        number: '03',
        title: 'Verify',
        body: 'Evaluate claims against available evidence.',
        icon: 'verify',
      },
      {
        number: '04',
        title: 'Preserve',
        body: 'Retain useful findings in a durable, traceable form.',
        icon: 'preserve',
      },
      {
        number: '05',
        title: 'Improve',
        body: 'Use what survives to inform the next cycle of work.',
        icon: 'improve',
      },
    ],
  },
  work: {
    label: 'What We’re Building',
    headline: ['One Research Mission.', 'Two Layers of Work.'],
    intro: 'Our underlying research explores how knowledge can endure. League Vector is our first applied product for testing that idea in a changing decision environment.',
    systems: [
      {
        title: 'Private Research System',
        descriptor: 'Cumulative Labs Research',
        status: 'Active Research',
        body: 'An environment we’re developing to help AI research build on retained evidence.',
        detail: 'The goal is to preserve useful findings, keep them traceable, and make them available to future work.',
      },
      {
        title: 'League Vector',
        descriptor: 'First Applied Proving Ground',
        status: 'In Development',
        body: 'A dynasty fantasy football product in development, focused on evidence, uncertainty, and changing player value.',
        detail: 'We’re testing whether cumulative intelligence can support better-informed decisions over time.',
      },
    ],
  },
  example: {
    label: 'How the Idea Works',
    headline: 'A conclusion can change. The learning can stay.',
    scenario: 'Suppose a research team is comparing two routes for a delivery. An early report favors Route A. A later report reveals a closure.',
    stages: [
      { title: 'New evidence', body: 'A road-closure report challenges the original route choice.' },
      { title: 'Claim evaluated', body: 'Check whether the report applies to this route and delivery date.' },
      { title: 'Conclusion revised', body: 'If the closure is confirmed, Route A is no longer the supported choice.' },
      { title: 'Finding retained', body: 'Keep the updated conclusion with its evidence and date limits.' },
      { title: 'Future work can use it', body: 'The next route review can use that finding—and check whether it still holds.' },
    ],
    caption: 'Illustrative example of the cumulative-intelligence concept. This hypothetical scenario is not a product demonstration or a claim of autonomous improvement or production-scale performance.',
  },
  principles: {
    label: 'Our Principles',
    headline: 'The standards behind the work.',
    items: [
      {
        title: 'Evidence Over Confidence',
        body: 'Claims should be supported, challenged, and traceable.',
        icon: 'evidence',
      },
      {
        title: 'Knowledge That Survives',
        body: 'Useful discoveries should remain available beyond the task that produced them.',
        icon: 'layers',
      },
      {
        title: 'Improvement You Can Measure',
        body: 'Improvement should be demonstrated rather than assumed.',
        icon: 'measure',
      },
      {
        title: 'Built for the Long Term',
        body: 'Each completed cycle should leave future work in a stronger position.',
        icon: 'cycle',
      },
      {
        title: 'Integrity in Every Cycle',
        body: 'Be explicit about uncertainty, evidence, limitations, and what has actually been demonstrated.',
        icon: 'integrity',
      },
    ],
  },
  closing: {
    headline: [
      'Intelligence That Compounds.',
      'A Direction Worth',
      'Building Toward.',
    ],
    body: 'Interested in research collaboration or what we’re building? Get in touch with Cumulative Labs.',
    actionLabel: 'Contact Cumulative Labs',
  },
  footer: {
    copyright: '© 2026 Cumulative Labs. All rights reserved.',
    signature: 'Research in progress. Built for the long term.',
  },
} as const;

export const contactHref = `mailto:${site.contact.email}`;
