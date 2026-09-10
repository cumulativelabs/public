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
    body: 'Starting with a supported conclusion leaves more room to investigate what has changed.',
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
    intro: 'An underlying research effort and its first applied product.',
    systems: [
      {
        title: 'Private Research System',
        descriptor: 'Cumulative Labs Research',
        status: 'Active Research',
        body: 'An environment we’re developing to study cumulative intelligence.',
        detail: '',
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
    scenario: 'Suppose a team is choosing a delivery route, then planning another delivery a week later.',
    stages: [
      { title: 'Task 1 · Discover', body: 'An early report favors Route A. A closure notice challenges that choice.' },
      { title: 'Check and revise', body: 'The team confirms the closure applies to the route and delivery date, ruling out A.' },
      { title: 'Retain the finding', body: 'It saves that conclusion with the source notice, review date, and affected dates.' },
      { title: 'Task 2 · Reuse', body: 'A week later, the team retrieves the finding and checks the notice is still current and covers the new delivery date. It reuses the prior analysis.' },
      { title: 'Update again', body: 'Without repeating the completed analysis, it investigates changes. A new reopening notice makes A eligible; it revises the finding with that source.' },
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
        body: 'Retained findings should include their sources and limits.',
        icon: 'layers',
      },
      {
        title: 'Improvement You Can Measure',
        body: 'Improvement should be demonstrated rather than assumed.',
        icon: 'measure',
      },
      {
        title: 'Built for the Long Term',
        body: 'Favor durable understanding over short-lived gains.',
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
      'That’s What We’re',
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
