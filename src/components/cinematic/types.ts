export interface ChapterData {
  id: string;
  index: number;
  navLabel: string;
  headlineLine1: string;
  headlineLine2: string;
  paragraph: string;
  ctaText: string;
  ctaRoute: string;
}

export const CHAPTERS: ChapterData[] = [
  {
    id: 'gateway',
    index: 0,
    navLabel: 'GATEWAY',
    headlineLine1: 'WE KEEP PERSONAL DATA',
    headlineLine2: 'OUT OF YOUR LLM',
    paragraph:
      'ZeroLeak AI finds Aadhaar, PAN, GSTIN, Voter ID and Passport numbers locally, sends only masked text to the model, and restores the real values on your side.',
    ctaText: 'OPEN LIVE DEMO',
    ctaRoute: '/demo',
  },
  {
    id: 'detect',
    index: 1,
    navLabel: 'DETECT',
    headlineLine1: 'FIND EVERY',
    headlineLine2: 'SENSITIVE VALUE',
    paragraph:
      'Pattern checks and a named-entity model find identifiers, names and addresses in your documents before anything leaves your network.',
    ctaText: 'EXPLORE DATASET',
    ctaRoute: '/dataset',
  },
  {
    id: 'mask',
    index: 2,
    navLabel: 'MASK',
    headlineLine1: 'REPLACE IT WITH',
    headlineLine2: 'SAFE PLACEHOLDERS',
    paragraph:
      'Each sensitive value becomes a placeholder like <PERSON_1> or <PAN_1>. The model sees the structure, never the identity.',
    ctaText: 'SEE THE PAYLOAD',
    ctaRoute: '/demo',
  },
  {
    id: 'forward',
    index: 3,
    navLabel: 'FORWARD',
    headlineLine1: 'SEND ONLY',
    headlineLine2: 'MASKED TEXT',
    paragraph:
      'Only the sanitized prompt is forwarded to the LLM, and every outbound payload is logged for audit.',
    ctaText: 'VIEW AUDIT LOG',
    ctaRoute: '/audit',
  },
  {
    id: 'reinsert',
    index: 4,
    navLabel: 'REINSERT',
    headlineLine1: 'RESTORE THE REAL',
    headlineLine2: 'VALUES LOCALLY',
    paragraph:
      "Placeholders in the model's response are swapped back for the real values inside your environment.",
    ctaText: 'TRY IT LIVE',
    ctaRoute: '/demo',
  },
  {
    id: 'proof',
    index: 5,
    navLabel: 'PROOF',
    headlineLine1: 'PROOF YOU CAN',
    headlineLine2: 'VERIFY',
    paragraph:
      'Statutory telemetry and leakage benchmarks verified through on-premises cryptographic audit trails.',
    ctaText: 'VIEW METRICS',
    ctaRoute: '/metrics',
  },
];
