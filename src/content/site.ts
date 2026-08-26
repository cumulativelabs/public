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
      'Cumulative Labs builds systems in which verified knowledge survives, accumulates, and improves every future cycle.',
  },
  navigation: [
    { label: 'Mission', href: '#mission' },
    { label: 'Approach', href: '#approach' },
    { label: 'Work', href: '#work' },
    { label: 'Principles', href: '#principles' },
    { label: 'Contact', href: '#contact' },
  ],
  hero: {
    eyebrow: 'Cumulative intelligence, built to endure',
    headline: ['Intelligence', 'That', 'Compounds.'],
    body: 'We build systems in which verified knowledge survives, accumulates, and improves every future cycle.',
    primaryAction: { label: 'Explore Our Work', href: '#work' },
    secondaryAction: { label: 'Our Mission', href: '#mission' },
  },
  mission: {
    label: 'Our Mission',
    headline: ['Intelligence Should', 'Not Reset.'],
    body: 'Today’s intelligent systems can produce extraordinary work, yet much of what they learn disappears when the task ends. Cumulative Labs is building systems designed to preserve verified knowledge, carry it forward, and use it to improve every future cycle.',
  },
  whyCumulative: {
    label: 'Why Cumulative',
    headline: 'Progress should survive the moment that produced it.',
    contrasts: [
      {
        title: 'Most intelligence starts over.',
        body: 'Valuable evidence is produced, reviewed, and then disconnected from the next cycle of work. Progress becomes difficult to preserve, evaluate, and build upon.',
        tone: 'fragmented',
      },
      {
        title: 'We believe intelligence should accumulate.',
        body: 'Each verified result should strengthen what comes next—creating systems that become more capable through durable, evidence-backed learning.',
        tone: 'structured',
      },
    ],
  },
  approach: {
    label: 'Our Approach',
    headline: 'Knowledge that survives becomes intelligence that grows.',
    stages: [
      {
        number: '01',
        title: 'Explore',
        body: 'We explore widely to surface possibilities and new questions.',
        icon: 'compass',
      },
      {
        number: '02',
        title: 'Challenge',
        body: 'We challenge assumptions and pressure-test ideas.',
        icon: 'challenge',
      },
      {
        number: '03',
        title: 'Verify',
        body: 'We evaluate claims against evidence, separating signal from noise and bias.',
        icon: 'verify',
      },
      {
        number: '04',
        title: 'Preserve',
        body: 'We retain verified knowledge in a durable, traceable form.',
        icon: 'preserve',
      },
      {
        number: '05',
        title: 'Improve',
        body: 'We use what survives to strengthen the next cycle of work.',
        icon: 'improve',
      },
    ],
  },
  work: {
    label: 'What We’re Building',
    headline: ['Two Systems.', 'One Mission.'],
    intro: 'Our systems are designed to turn fragmented information into durable knowledge and better decisions.',
    systems: [
      {
        title: 'Private Research System',
        descriptor: 'A Cumulative Labs System',
        status: 'Active Research',
        body: 'An operating environment for evidence-driven, cumulative intelligence.',
        detail: 'It is designed to preserve evidence, evaluate work, and support improvement across repeated cycles.',
        visual: 'rings',
      },
      {
        title: 'League Vector',
        descriptor: 'Built by Cumulative Labs',
        status: 'In Development',
        body: 'Our first applied system—bringing deeper, evidence-driven intelligence to dynasty fantasy sports.',
        visual: 'network',
      },
    ],
  },
  provingGround: {
    label: 'Our First Proving Ground',
    headline: 'Complex decisions. Changing evidence. Measurable outcomes.',
    body: 'Sports decisions involve uncertainty, changing evidence, competing time horizons, and measurable outcomes. That makes League Vector an ideal environment for testing whether cumulative intelligence can improve real decisions over time.',
    support: 'League Vector is the first applied environment for the broader Cumulative Labs mission.',
  },
  principles: {
    label: 'Our Principles',
    headline: 'The standards behind every cycle.',
    items: [
      {
        title: 'Evidence Over Confidence',
        body: 'Claims should be supported, challenged, and traceable.',
        icon: 'evidence',
      },
      {
        title: 'Knowledge That Survives',
        body: 'Useful discoveries should remain available beyond the session that produced them.',
        icon: 'layers',
      },
      {
        title: 'Improvement You Can Measure',
        body: 'A system should demonstrate that it is getting better—not merely claim that it is.',
        icon: 'measure',
      },
      {
        title: 'Built for the Long Term',
        body: 'Each completed cycle should strengthen the cycles that follow.',
        icon: 'cycle',
      },
      {
        title: 'Integrity in Every Cycle',
        body: 'We design for honesty, transparency, and responsibility at every step.',
        icon: 'integrity',
      },
    ],
  },
  closing: {
    headline: [
      'The Next Generation of Intelligence',
      'Will Not Simply Be More Powerful.',
      'It Will Remember What It Proves.',
    ],
    actionLabel: 'Contact Cumulative Labs',
  },
  footer: {
    copyright: '© 2026 Cumulative Labs. All rights reserved.',
    signature: 'Cycle complete. Knowledge retained.',
  },
} as const;

export const contactHref = `mailto:${site.contact.email}`;
