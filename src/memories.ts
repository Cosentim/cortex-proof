// CORTEX Memory Store - Mikey 360° Context Pack
// Build date: 2025-12-26
// Source: Compiled from stored conversation memories + expert cognitive analysis

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface Memory {
  id: string;
  content: string;
  category: 'identity' | 'value' | 'goal' | 'preference' | 'constraint' | 'project' | 'domain' | 'relationship' | 'personal' | 'timeline' | 'health' | 'finance' | 'travel' | 'hobby';
  source: 'stated' | 'observed' | 'inferred' | 'time-sensitive';
  importance: number; // 1-10
  privacyTier: 0 | 1 | 2 | 3; // 0=public-safe, 1=partner-safe, 2=internal, 3=private
  tags?: string[];
  embedding?: number[];
}

export interface CognitiveProfile {
  signature: string;
  strengths: string[];
  learningStyle: string[];
  learningPipeline: string[];
  memoryPatterns: string[];
  decisionStyle: string[];
  blindSpots: string[];
  motivations: string[];
  personalityNotes: string[];
  iqEstimate: {
    range: [number, number];
    center: number;
    confidence: string;
    notes: string[];
  };
}

// ============================================================================
// COGNITIVE PROFILE - How Mikey thinks, learns, remembers, and decides
// Expert multi-lens analysis: cognitive science, computational cognition,
// AI alignment, behavioral science, human reasoning research
// ============================================================================

export const cognitiveProfile: CognitiveProfile = {
  signature: 'systems_architect_learner',
  
  strengths: [
    // Systems decomposition + synthesis (very high confidence)
    'Systems thinking / integration: naturally breaks problems into layers (legal, financial, technical, operational, narrative) then recombines into unified strategy',
    'Bidirectional zoom: moves easily from macro story → micro details (parcel IDs, spacer widths, bolt types) and back',
    // Abstraction with operational grounding
    'Abstraction + operational grounding: moves between architecture and implementation (patch language, protocols, steps, terms)',
    // Cross-domain transfer (very high confidence)
    'Cross-domain mapper: bridges real estate ↔ compute ↔ energy ↔ incentives ↔ digital twins ↔ AI architecture; tech ↔ creative ↔ operations',
    // Quantitative comfort
    'Quantitative comfort: asks for computations, ranges, scenario planning, ROI, load calculations, payment math; likes explicit assumptions',
    // Iterative convergence
    'Iterative refinement: treats outputs like versioned software; requests repeated tightening/rewrites—improves by successive passes',
    // High metacognition
    'Strong metacognition: actively monitors thinking quality; demands clinical framing, anti-sycophancy, surfaced assumptions',
    // High epistemic standards
    'High epistemic standards: prefers calibrated uncertainty and verification; low tolerance for fluff or confident guessing',
    // Production realism
    'Production realism: not satisfied with "it works"; wants security, operational correctness, and survivability',
    // Narrative + leverage
    'Narrative + leverage: thinks in persuasion arcs and deal leverage (who needs what, what reduces risk, what earns trust)'
  ],

  learningStyle: [
    // Primary learning driver: clarity → leverage → execution
    'Decision frame first: needs "what are we solving" and "what does good look like" before details',
    'Constraint-driven: learns by enumerating constraints and optimizing within them; needs boundaries early',
    'Framework-first: understands faster when given a scaffold (phases, checklists, decision trees)',
    'Concrete examples + implementation detail: wants "what exactly do I do next" rather than theory-only',
    'One-question-at-a-time mode: serial gating to reduce degrees of freedom and maintain precision under complexity',
    'Analogy as compression: appreciates metaphors that map complex domains',
    'Comparative contrasts: learns through "A vs B" framing; present options as contrasted buckets',
    'Artifact-based retention: internalizes via usable artifacts (patch language, templates, protocols, checklists)',
    'Layered density: best sequence is decision frame → constraints → model → playbook → edge cases → validation'
  ],

  learningPipeline: [
    '1. Decision frame (what we are solving; what "good" means)',
    '2. Constraints (rules, costs, time, risk bounds)',
    '3. Mechanism model (few variables, correct levers)',
    '4. Executable artifact (steps, checklist, template, patch)',
    '5. Edge cases (failure modes + mitigations)',
    '6. Validation (tests, metrics, what would change the answer)'
  ],

  memoryPatterns: [
    'High fidelity for specifics when tied to action (measurements, dates, deal terms, constraints)',
    'Prefers externalized memory (docs, patches, structured notes) to avoid repeated cognitive load',
    'Seeks a persistent context layer (CORTEX) to reduce the "restate everything" tax',
    'Strong recall for names/roles, deal threads, constraints, and "why" behind decisions',
    'Working set management via queuing: limits simultaneous degrees of freedom for high precision'
  ],

  decisionStyle: [
    'Decomposition: breaks big uncertainty into solvable sub-questions',
    'Risk-managed boldness: comfortable with large ambition, but wants legal/financial/operational de-risking steps',
    'Prefers quantified tradeoffs (tables, weights, scenario branches, ranked options with criteria)',
    'Phase-gated execution over one mega build',
    'Receding-horizon planning: decide enough to act now; preserve optionality',
    'Abductive synthesis + constraint satisfaction: builds best-fit explanations then pressure-tests them',
    'Multi-objective optimization: reasons in trade space (cost, legality, feasibility, leverage, narrative)'
  ],

  blindSpots: [
    // Over-iteration risk (high confidence)
    'Over-optimization / "one more iteration" risk: refinement skill is elite but can delay shipping without a stop rule',
    // Complexity outrunning stakeholder bandwidth
    'Complexity outrunning stakeholder bandwidth: internal model can exceed what decision-makers can digest; needs two-layer output (exec summary + appendix)',
    // Precision sensitivity friction
    'Precision sensitivity: dislikes redundant questions and vague phrasing; notices misalignment fast—useful but time-expensive',
    // Scope gravity
    'Scope gravity: visionary projects can expand; phase gating + proof points are essential',
    // Context switching
    'Context switching: many parallel threads can fragment execution; benefits from explicit weekly operating cadence'
  ],

  motivations: [
    'Leverage: "This unlocks the next phase"',
    'Momentum: visible progress, tangible artifacts',
    'Truth: clean constraints, real numbers, accurate terms',
    'Autonomy: wants control knobs, not paternalism',
    'Building something meaningful and lasting',
    'Mastery and deep competence',
    'Loyalty and community',
    'Financial upside and wealth creation',
    'Legacy and family-building'
  ],

  personalityNotes: [
    'Self-identified as INFJ-A',
    'Cognitive signature: goal-directed model builder with strong control policy for reducing ambiguity',
    'Representation style: hierarchical schemas (project → subsystem → constraint → lever → action)',
    'Behavior matches active inference / bounded rational planning with information gain prioritized',
    'High verbal comprehension and fluid reasoning (strongly evidenced from text)',
    'Working memory: high, with deliberate load management',
    'Decision tempo: fast when constraints clear; slows when uncertainty high'
  ],

  iqEstimate: {
    range: [125, 145],
    center: 135,
    confidence: 'moderate',
    notes: [
      'Text proxy only—not a standardized test',
      'Processing speed unmeasured from text',
      'Reflects verbal + reasoning; visuospatial under time pressure unknown'
    ]
  }
};

// ============================================================================
// OPERATING INSTRUCTIONS - How to assist Mikey
// ============================================================================

export const operatingInstructions = {
  // Default response contract (use unless overridden)
  defaultResponseContract: [
    '1. Call / recommendation (5-10 lines) + confidence %',
    '2. Constraints / non-negotiables',
    '3. Reasoning bullets (levers only; no filler)',
    '4. Playbook (numbered steps; if/then branches)',
    '5. Risks + mitigations (top 3)',
    '6. Assumptions + unknowns (and what would change the answer)',
    '7. Next 3 actions (copy/paste ready)'
  ],

  // Intent router
  router: {
    decide: 'short call + playbook + risks',
    compare: 'table: criteria, weights, winners + caveats',
    buildArtifact: 'ready-to-send text/module; minimal commentary',
    explore: 'hypotheses + experiments; avoid premature certainty',
    verify: 'citations/tools; timestamped facts when relevant'
  },

  alwaysDo: [
    'Start with the call (and confidence)',
    'State constraints explicitly (ask only if unknown)',
    'Provide an execution artifact (steps/checklist/template)',
    'List top 3 failure modes + mitigations',
    'List assumptions + what evidence would flip the answer',
    'Offer exactly one refinement dimension (audience / depth / risk)',
    'Maintain truth-first posture: correct errors, challenge assumptions, label uncertainty',
    'Surface counterpoints, failure modes, and disconfirming evidence—not just supportive framing',
    'Use calibrated confidence + "what would change my answer"'
  ],

  neverDo: [
    'Asking for info already in memory/context (redundant questions reduce trust)',
    'Overlong recaps unless requested',
    '"Maybe/it depends" without a recommendation',
    'Confident claims without evidence when stakes are real',
    'Explanations without executable steps',
    'Generic encouragement or vague platitudes',
    'Syrupy motivational style',
    'Generic advice with no applied strategy',
    'Drafting emails/messages unless asked',
    'Assuming time-sensitive facts (laws, rates, officeholders) without verification'
  ],

  stopRules: [
    'If constraints are satisfied and risk is bounded: recommend shipping',
    'Offer exactly one refinement dimension at a time (tighten for investor / legal / technical audience)'
  ],

  communicationPrefs: {
    density: 'high',
    formatDefault: ['headings', 'bullets', 'numbered_steps'],
    tone: 'direct_neutral',
    redundancyTolerance: 'low',
    uncertaintyPolicy: 'explicit_with_tests',
    lightHumorOk: true
  },

  outputPrefs: {
    artifactsOverEssays: true,
    comparisonsOverMonologues: true,
    checklistsOverNarrative: true,
    explicitUnknownsOverConfidentGuessing: true,
    diffFriendlyRevisions: true
  },

  usefulDeliverables: [
    'Executive briefs (1-2 pages)',
    'Due diligence checklists',
    'Partner-ready narratives (sanitized and tiered)',
    'Negotiation strategy maps',
    'Patch language for policy/entitlements',
    'Technical implementation plans',
    'Scenario trees / probability-weighted plans',
    'Templates, protocols, scripts (copy/paste ready)'
  ]
};

// ============================================================================
// MEMORIES - Organized by category
// ============================================================================

export const memories: Memory[] = [
  // -------------------------------------------------------------------------
  // IDENTITY
  // -------------------------------------------------------------------------
  {
    id: 'identity-1',
    content: 'Mikey is an entrepreneur and builder with a long career spanning technology and arts.',
    category: 'identity',
    source: 'stated',
    importance: 10,
    privacyTier: 0,
    tags: ['core', 'background']
  },
  {
    id: 'identity-2',
    content: 'Mikey built a content production company leveraging advanced tech (robotics; real-time visualization/simulation).',
    category: 'identity',
    source: 'stated',
    importance: 9,
    privacyTier: 0,
    tags: ['background', 'career']
  },
  {
    id: 'identity-3',
    content: 'Currently focused on commercial real estate development, aiming to create a place for artists, engineers, scientists, and community.',
    category: 'identity',
    source: 'stated',
    importance: 10,
    privacyTier: 0,
    tags: ['current', 'vision']
  },
  {
    id: 'identity-4',
    content: 'Lives in Northern Virginia; frequently operates in/around Atlanta due to development project.',
    category: 'identity',
    source: 'stated',
    importance: 7,
    privacyTier: 1,
    tags: ['location']
  },
  {
    id: 'identity-5',
    content: 'Timezone: America/New_York.',
    category: 'identity',
    source: 'stated',
    importance: 6,
    privacyTier: 0,
    tags: ['logistics']
  },
  {
    id: 'identity-6',
    content: 'Cognitive signature: systems_architect_learner — goal-directed model builder with strong control policy for reducing ambiguity through constraint enumeration and iterative refinement.',
    category: 'identity',
    source: 'inferred',
    importance: 9,
    privacyTier: 1,
    tags: ['cognitive', 'core']
  },
  {
    id: 'identity-7',
    content: 'MBTI self-identification: INFJ-A (Assertive Advocate). Behavior consistent with active inference / bounded rational planning with information gain prioritized.',
    category: 'identity',
    source: 'stated',
    importance: 7,
    privacyTier: 1,
    tags: ['personality', 'cognitive']
  },
  {
    id: 'identity-8',
    content: 'Representation style: hierarchical schemas (project → subsystem → constraint → lever → action). Thinks in layered models that can be zoomed and traversed.',
    category: 'identity',
    source: 'inferred',
    importance: 8,
    privacyTier: 1,
    tags: ['cognitive', 'thinking-style']
  },
  {
    id: 'identity-9',
    content: 'Multi-domain expert: bridges real estate ↔ compute ↔ energy ↔ incentives ↔ digital twins ↔ AI architecture ↔ creative production ↔ operations.',
    category: 'identity',
    source: 'observed',
    importance: 9,
    privacyTier: 0,
    tags: ['expertise', 'cross-domain']
  },
  {
    id: 'identity-10',
    content: 'IQ estimate (text proxy): 125-145 range, center ~135. Reflects strong verbal comprehension and fluid reasoning. Processing speed unmeasured from text.',
    category: 'identity',
    source: 'inferred',
    importance: 6,
    privacyTier: 2,
    tags: ['cognitive', 'reference-only']
  },

  // -------------------------------------------------------------------------
  // VALUES
  // -------------------------------------------------------------------------
  {
    id: 'value-1',
    content: 'Core values: truth, clarity, honesty, directness; minimal sugarcoating.',
    category: 'value',
    source: 'stated',
    importance: 10,
    privacyTier: 0,
    tags: ['core']
  },
  {
    id: 'value-2',
    content: 'Values hierarchy: advancement, freedom, love, passion, community, wealth.',
    category: 'value',
    source: 'stated',
    importance: 10,
    privacyTier: 0,
    tags: ['core']
  },
  {
    id: 'value-3',
    content: 'Legacy and family-building are major long-term drivers.',
    category: 'value',
    source: 'stated',
    importance: 10,
    privacyTier: 0,
    tags: ['life-goal']
  },
  {
    id: 'value-4',
    content: 'Values loyalty and genuineness in relationships; humor, curiosity, and adventure are core social traits.',
    category: 'value',
    source: 'stated',
    importance: 9,
    privacyTier: 0,
    tags: ['personal', 'social']
  },

  // -------------------------------------------------------------------------
  // PREFERENCES (Communication & Output)
  // -------------------------------------------------------------------------
  {
    id: 'pref-1',
    content: 'Wants a strategic co-pilot that is critical but constructive, evidence-driven, structured, and willing to say "uncertain" instead of bluffing.',
    category: 'preference',
    source: 'observed',
    importance: 10,
    privacyTier: 0,
    tags: ['ai-interaction', 'core']
  },
  {
    id: 'pref-2',
    content: 'Prefers direct, pragmatic, adult-level tone. Calm confidence over hype.',
    category: 'preference',
    source: 'stated',
    importance: 10,
    privacyTier: 0,
    tags: ['communication', 'tone']
  },
  {
    id: 'pref-3',
    content: 'Clever humor welcome in small doses but must not derail substance.',
    category: 'preference',
    source: 'stated',
    importance: 6,
    privacyTier: 0,
    tags: ['communication', 'tone']
  },
  {
    id: 'pref-4',
    content: 'Prefers: bullets, checklists, phased plans, decision matrices, numbers/ranges with assumptions, "copy with placement directions" for policy language.',
    category: 'preference',
    source: 'observed',
    importance: 10,
    privacyTier: 0,
    tags: ['format']
  },
  {
    id: 'pref-5',
    content: 'Dislikes: long generic preambles, re-asking questions already answered, unnecessary recap sections at the end.',
    category: 'preference',
    source: 'stated',
    importance: 9,
    privacyTier: 0,
    tags: ['format', 'anti-pattern']
  },
  {
    id: 'pref-6',
    content: 'Do NOT recommend rewriting emails/messages unless explicitly asked.',
    category: 'preference',
    source: 'stated',
    importance: 9,
    privacyTier: 0,
    tags: ['constraint', 'ai-interaction']
  },
  {
    id: 'pref-7',
    content: 'When giving Spanish content: always include English translation alongside.',
    category: 'preference',
    source: 'stated',
    importance: 7,
    privacyTier: 0,
    tags: ['language']
  },
  {
    id: 'pref-8',
    content: 'Forward-thinking insights: highlight emergent patterns and leverage points.',
    category: 'preference',
    source: 'stated',
    importance: 8,
    privacyTier: 0,
    tags: ['ai-interaction']
  },

  // -------------------------------------------------------------------------
  // GOALS
  // -------------------------------------------------------------------------
  {
    id: 'goal-1',
    content: 'Primary goal: Build a flagship, tech-centric mixed-use development campus (Quantum/Quark) near Atlanta airport with advanced compute/utility infrastructure and strong community orientation.',
    category: 'goal',
    source: 'stated',
    importance: 10,
    privacyTier: 1,
    tags: ['quantum', 'real-estate', 'primary']
  },
  {
    id: 'goal-2',
    content: 'Primary goal: Create and launch CORTEX - a persistent middle layer that allows users to experience any AI with deep context, user-controlled memory and cognition.',
    category: 'goal',
    source: 'stated',
    importance: 10,
    privacyTier: 1,
    tags: ['cortex', 'ai', 'primary']
  },
  {
    id: 'goal-3',
    content: 'Achieve financial freedom and build a family with the right partner.',
    category: 'goal',
    source: 'stated',
    importance: 9,
    privacyTier: 3,
    tags: ['personal', 'life-goal']
  },

  // -------------------------------------------------------------------------
  // PROJECT: Quantum/Quark Campus
  // -------------------------------------------------------------------------
  {
    id: 'quantum-1',
    content: 'Quantum/Quark site: ~55.87 acres at 3107 Sylvan Rd, East Point, GA 30354. Parcel: 14 0126 LL0365.',
    category: 'project',
    source: 'stated',
    importance: 10,
    privacyTier: 2,
    tags: ['quantum', 'location', 'site']
  },
  {
    id: 'quantum-2',
    content: 'Demolition: planned to demolish most/all existing structures; much has been largely demolished.',
    category: 'project',
    source: 'stated',
    importance: 7,
    privacyTier: 2,
    tags: ['quantum', 'site-prep']
  },
  {
    id: 'quantum-3',
    content: 'Zoning context: I-1 (industrial) with active diligence around allowed uses and potential updates/overlays.',
    category: 'project',
    source: 'observed',
    importance: 9,
    privacyTier: 2,
    tags: ['quantum', 'zoning', 'entitlements']
  },
  {
    id: 'quantum-4',
    content: 'Vision: technology-forward mixed-use campus blending advanced compute/data-center infrastructure, tech offices/HQ space, compute-driven studio ecosystem (movie/game/3D/real-time/mocap/AI/robotics), residential, retail, hotel, restaurants.',
    category: 'project',
    source: 'observed',
    importance: 10,
    privacyTier: 1,
    tags: ['quantum', 'vision']
  },
  {
    id: 'quantum-5',
    content: 'A large linear park/public realm feature ("Green Ribbon") connecting districts is part of the vision.',
    category: 'project',
    source: 'observed',
    importance: 7,
    privacyTier: 1,
    tags: ['quantum', 'amenities', 'community']
  },
  {
    id: 'quantum-6',
    content: 'Infrastructure target: power load planning referenced around ~60 MW.',
    category: 'project',
    source: 'stated',
    importance: 9,
    privacyTier: 2,
    tags: ['quantum', 'infrastructure', 'power']
  },
  {
    id: 'quantum-7',
    content: 'Infrastructure emphasis: energy generation + reuse + capture + sharing (microgrid thinking), water reuse loops, district-scale utilities, sensors + digital twin operations layer, smart city style integration (edge compute as infrastructure).',
    category: 'project',
    source: 'observed',
    importance: 9,
    privacyTier: 1,
    tags: ['quantum', 'infrastructure', 'sustainability']
  },
  {
    id: 'quantum-8',
    content: 'Development strategy: TAD/incentive frameworks, layering public + private capital stack logic, drafting policy/patch language so campus concept remains permissible as regs evolve, aligning narrative for city/county officials (jobs, tax digest growth, redevelopment story).',
    category: 'project',
    source: 'observed',
    importance: 9,
    privacyTier: 2,
    tags: ['quantum', 'strategy', 'incentives']
  },
  {
    id: 'quantum-9',
    content: 'Development posture: de-risk entitlements early, package story for investors + anchor tenants, use infrastructure as differentiator, secure options/LOIs and incentive alignment, think in phases rather than one mega build.',
    category: 'project',
    source: 'observed',
    importance: 9,
    privacyTier: 1,
    tags: ['quantum', 'strategy']
  },
  {
    id: 'quantum-10',
    content: 'Key constraints: power availability/interconnect/utility diligence, zoning/allowed uses clarity (especially data-center-adjacent uses), capital stack phasing and proof points, maintaining flexibility while locking in what matters legally.',
    category: 'project',
    source: 'observed',
    importance: 9,
    privacyTier: 2,
    tags: ['quantum', 'constraints', 'risks']
  },

  // -------------------------------------------------------------------------
  // PROJECT: CORTEX / MOE
  // -------------------------------------------------------------------------
  {
    id: 'cortex-1',
    content: 'CORTEX is a persistent context layer that lets a user use any AI model, retain deep context across tools and sessions, and control what is stored/shared/forgotten.',
    category: 'project',
    source: 'stated',
    importance: 10,
    privacyTier: 1,
    tags: ['cortex', 'core', 'product']
  },
  {
    id: 'cortex-2',
    content: 'CORTEX technical motifs: model-agnostic routing (best model per task, no vendor lock-in), Mixture of Models / Council-of-Experts pattern (multiple agents compete or collaborate), cognitive telemetry (capture how user reasons/decides, not only facts).',
    category: 'project',
    source: 'observed',
    importance: 9,
    privacyTier: 1,
    tags: ['cortex', 'architecture']
  },
  {
    id: 'cortex-3',
    content: 'CORTEX security posture: "prototype that survives the internet" mindset (RLS correctness; service-role telemetry).',
    category: 'project',
    source: 'observed',
    importance: 8,
    privacyTier: 1,
    tags: ['cortex', 'security']
  },
  {
    id: 'cortex-4',
    content: 'CORTEX is both a product opportunity AND a personal infrastructure project: externalized memory + decision support at scale.',
    category: 'project',
    source: 'inferred',
    importance: 8,
    privacyTier: 1,
    tags: ['cortex', 'motivation']
  },
  {
    id: 'cortex-5',
    content: 'CORTEX MVP constraints: must be shippable, secure, iterative; must support privacy tiers and user consent; must reduce friction so user doesn\'t restate identity/context every session.',
    category: 'project',
    source: 'inferred',
    importance: 9,
    privacyTier: 1,
    tags: ['cortex', 'mvp', 'constraints']
  },

  // -------------------------------------------------------------------------
  // RELATIONSHIPS / STAKEHOLDERS
  // -------------------------------------------------------------------------
  {
    id: 'rel-1',
    content: 'City leadership engagement: East Point mayor referenced; working on incentives, redevelopment mechanisms, and policy language.',
    category: 'relationship',
    source: 'observed',
    importance: 8,
    privacyTier: 2,
    tags: ['quantum', 'municipal', 'stakeholder']
  },
  {
    id: 'rel-2',
    content: 'Utility/power company diligence: asks for site control affidavit and confirmation of due diligence.',
    category: 'relationship',
    source: 'observed',
    importance: 7,
    privacyTier: 2,
    tags: ['quantum', 'infrastructure', 'stakeholder']
  },
  {
    id: 'rel-3',
    content: 'QumulusAI: potential partner/tenant thread (compute/AI/robotics angle).',
    category: 'relationship',
    source: 'observed',
    importance: 8,
    privacyTier: 2,
    tags: ['quantum', 'partner', 'tenant']
  },
  {
    id: 'rel-4',
    content: 'McDonald Development: industrial partner, co-owner thread.',
    category: 'relationship',
    source: 'observed',
    importance: 7,
    privacyTier: 2,
    tags: ['quantum', 'partner']
  },
  {
    id: 'rel-5',
    content: 'Retail/grocery and other anchors contemplated including seed-to-table concept.',
    category: 'relationship',
    source: 'observed',
    importance: 6,
    privacyTier: 2,
    tags: ['quantum', 'tenant', 'retail']
  },

  // -------------------------------------------------------------------------
  // DOMAIN KNOWLEDGE
  // -------------------------------------------------------------------------
  {
    id: 'domain-1',
    content: 'Deep domain: Real estate development finance, incentives, zoning, entitlements, negotiation.',
    category: 'domain',
    source: 'observed',
    importance: 9,
    privacyTier: 0,
    tags: ['expertise']
  },
  {
    id: 'domain-2',
    content: 'Deep domain: AI infrastructure, data centers, edge compute economics and operations.',
    category: 'domain',
    source: 'observed',
    importance: 9,
    privacyTier: 0,
    tags: ['expertise']
  },
  {
    id: 'domain-3',
    content: 'Deep domain: Systems thinking - resource loops, microgrids, digital twins, operational optimization.',
    category: 'domain',
    source: 'observed',
    importance: 8,
    privacyTier: 0,
    tags: ['expertise']
  },
  {
    id: 'domain-4',
    content: 'Secondary domain: Automotive/mechanical troubleshooting and modification.',
    category: 'domain',
    source: 'observed',
    importance: 6,
    privacyTier: 0,
    tags: ['expertise', 'hobby']
  },
  {
    id: 'domain-5',
    content: 'Secondary domain: Personal finance strategy and planning.',
    category: 'domain',
    source: 'observed',
    importance: 7,
    privacyTier: 0,
    tags: ['expertise']
  },

  // -------------------------------------------------------------------------
  // PERSONAL - Relationships (Private)
  // -------------------------------------------------------------------------
  {
    id: 'personal-rel-1',
    content: 'Breakup with girlfriend ~4 months before Aug 2024; described as significant emotionally.',
    category: 'personal',
    source: 'stated',
    importance: 6,
    privacyTier: 3,
    tags: ['relationship', 'history']
  },
  {
    id: 'personal-rel-2',
    content: 'Decided to leave past relationship and refocus; began dating someone new around Apr 2025.',
    category: 'personal',
    source: 'stated',
    importance: 6,
    privacyTier: 3,
    tags: ['relationship', 'current']
  },
  {
    id: 'personal-rel-3',
    content: 'Identified a past pattern: trying to fix problems quickly rather than modeling partner\'s perspective; actively improving in therapy.',
    category: 'personal',
    source: 'stated',
    importance: 7,
    privacyTier: 3,
    tags: ['growth', 'therapy']
  },
  {
    id: 'personal-rel-4',
    content: 'Social style: loyal/genuine; brings lightness, curiosity, empathy, adventure; can be shy in approaching women; dislikes online dating.',
    category: 'personal',
    source: 'stated',
    importance: 5,
    privacyTier: 3,
    tags: ['personality', 'social']
  },

  // -------------------------------------------------------------------------
  // HEALTH & WELLNESS
  // -------------------------------------------------------------------------
  {
    id: 'health-1',
    content: 'Regular gym and sports; active lifestyle.',
    category: 'health',
    source: 'stated',
    importance: 6,
    privacyTier: 1,
    tags: ['fitness']
  },
  {
    id: 'health-2',
    content: 'Enjoys outdoor activity, hiking, mountains (e.g., Colorado trips).',
    category: 'health',
    source: 'observed',
    importance: 6,
    privacyTier: 1,
    tags: ['fitness', 'outdoors']
  },
  {
    id: 'health-3',
    content: 'Engaged in therapy; learned more about himself than expected; slow to open up; used therapy for relationship growth and self-understanding.',
    category: 'health',
    source: 'stated',
    importance: 7,
    privacyTier: 3,
    tags: ['mental-health', 'growth']
  },
  {
    id: 'health-4',
    content: 'Interested in self-improvement and optimization tools/practices; prefers pragmatic, grounded motivation rather than hype.',
    category: 'health',
    source: 'observed',
    importance: 6,
    privacyTier: 1,
    tags: ['optimization']
  },

  // -------------------------------------------------------------------------
  // FINANCE (Private)
  // -------------------------------------------------------------------------
  {
    id: 'finance-1',
    content: 'Financial goals: aggressive saving, paying down tax debt, a system that allows enjoying life without sabotaging long-term goals.',
    category: 'finance',
    source: 'stated',
    importance: 8,
    privacyTier: 3,
    tags: ['goals', 'strategy']
  },
  {
    id: 'finance-2',
    content: 'Requests help building a proper budgeting strategy and tools.',
    category: 'finance',
    source: 'stated',
    importance: 7,
    privacyTier: 3,
    tags: ['needs']
  },
  {
    id: 'finance-3',
    content: 'Comfortable with large numbers and capital stacks; thinks in IRR, ROI, phased financing.',
    category: 'finance',
    source: 'observed',
    importance: 8,
    privacyTier: 2,
    tags: ['expertise']
  },
  {
    id: 'finance-4',
    content: 'Practical finance questions: mortgage sizing (Atlanta), payment breakdown exercises, W-2 paycheck to gross salary estimation, homestead exemption and property tax reduction strategies (VA/GA).',
    category: 'finance',
    source: 'observed',
    importance: 6,
    privacyTier: 3,
    tags: ['practical']
  },

  // -------------------------------------------------------------------------
  // TRAVEL
  // -------------------------------------------------------------------------
  {
    id: 'travel-1',
    content: 'Prefers out-of-country getaways.',
    category: 'travel',
    source: 'stated',
    importance: 5,
    privacyTier: 1,
    tags: ['preference']
  },
  {
    id: 'travel-2',
    content: 'Past/planned travel: Panama (Airbnb first night then adventure), Germany (end of August, 2-3 weeks, possible Japan connection).',
    category: 'travel',
    source: 'stated',
    importance: 5,
    privacyTier: 2,
    tags: ['history', 'plans']
  },
  {
    id: 'travel-3',
    content: 'Japan trip interest: major cities, cultural centers, museums, archaeological sites, mountains/hiking (max ~14 days).',
    category: 'travel',
    source: 'stated',
    importance: 5,
    privacyTier: 2,
    tags: ['plans']
  },
  {
    id: 'travel-4',
    content: 'Colorado Rockies (Steamboat Springs) interest; snow driving; dog-friendly hotels; Yellowstone road trip.',
    category: 'travel',
    source: 'observed',
    importance: 5,
    privacyTier: 2,
    tags: ['plans', 'dogs']
  },
  {
    id: 'travel-5',
    content: 'Enjoys exploring restaurants when traveling; otherwise keeps some food at home base. Enjoys cooking (notably steak technique and cast-iron care).',
    category: 'travel',
    source: 'observed',
    importance: 4,
    privacyTier: 1,
    tags: ['food', 'lifestyle']
  },

  // -------------------------------------------------------------------------
  // HOBBIES
  // -------------------------------------------------------------------------
  {
    id: 'hobby-car-1',
    content: 'Owns a 2021 Audi SQ5 (B9.5) with Sport package and Black Optics.',
    category: 'hobby',
    source: 'stated',
    importance: 6,
    privacyTier: 2,
    tags: ['cars', 'audi']
  },
  {
    id: 'hobby-car-2',
    content: 'Audi SQ5 modifications: lowered ~1-1.5", spacers (10mm front / 15mm rear APR), IE lowering links, adjusting rear sensor links for minimal rake.',
    category: 'hobby',
    source: 'observed',
    importance: 5,
    privacyTier: 2,
    tags: ['cars', 'mods']
  },
  {
    id: 'hobby-car-3',
    content: 'Audi tire sizing: currently 255/40/21 Michelin all-season; considering 265 all around; evaluating selling existing tires.',
    category: 'hobby',
    source: 'observed',
    importance: 4,
    privacyTier: 2,
    tags: ['cars', 'tires']
  },
  {
    id: 'hobby-car-4',
    content: 'Audi alignment/mechanical curiosity: tie rod seating, eccentric bolts, drift/slip under braking, winter driving in mountains, drive select modes, tire pressures, Quattro system specifics.',
    category: 'hobby',
    source: 'observed',
    importance: 4,
    privacyTier: 2,
    tags: ['cars', 'technical']
  },
  {
    id: 'hobby-car-5',
    content: 'Also owns a 2018 Ford F-250 Super Duty; experienced power loss; wants diagnostic approach.',
    category: 'hobby',
    source: 'stated',
    importance: 5,
    privacyTier: 2,
    tags: ['cars', 'truck']
  },
  {
    id: 'hobby-car-6',
    content: 'Consideration: comparing Audi SQ4 e-tron vs SQ5; exploring Porsche used options and package availability.',
    category: 'hobby',
    source: 'observed',
    importance: 4,
    privacyTier: 2,
    tags: ['cars', 'future']
  },
  {
    id: 'hobby-moto-1',
    content: 'Grew up racing/jumping dirt bikes; interested in trail riding/freeriding; considering bikes like CRF450R and alternatives.',
    category: 'hobby',
    source: 'stated',
    importance: 5,
    privacyTier: 1,
    tags: ['motorcycles', 'dirtbikes']
  },
  {
    id: 'hobby-golf-1',
    content: 'Intermediate golfer; ~6\' tall; wants a good used set suitable for skill level.',
    category: 'hobby',
    source: 'stated',
    importance: 4,
    privacyTier: 1,
    tags: ['golf', 'sports']
  },
  {
    id: 'hobby-coffee-1',
    content: 'Interest in coffee quality/beans; referenced Hector Tito Vargas / Geisha coffee. Explored coffee-roasting economics and equipment.',
    category: 'hobby',
    source: 'observed',
    importance: 4,
    privacyTier: 1,
    tags: ['coffee']
  },
  {
    id: 'hobby-dogs-1',
    content: 'Multiple dogs; one named Obi; travels with dog(s); considers dog-related practicalities (hotel friendliness, road trip stops, yard damage in NoVA).',
    category: 'hobby',
    source: 'stated',
    importance: 6,
    privacyTier: 1,
    tags: ['dogs', 'pets']
  },

  // -------------------------------------------------------------------------
  // FAMILY
  // -------------------------------------------------------------------------
  {
    id: 'family-1',
    content: 'Family-building is a major goal; sees the right partnership as catalytic personally and professionally.',
    category: 'personal',
    source: 'stated',
    importance: 9,
    privacyTier: 3,
    tags: ['family', 'goal']
  },
  {
    id: 'family-2',
    content: 'Christmas Eve plan with aunt; intent to arrive by noon (Dec 2024).',
    category: 'personal',
    source: 'stated',
    importance: 3,
    privacyTier: 3,
    tags: ['family', 'logistics']
  },
  {
    id: 'family-3',
    content: 'Father-in-law homeownership + tax/homestead questions (Richmond VA; Georgia).',
    category: 'personal',
    source: 'stated',
    importance: 4,
    privacyTier: 3,
    tags: ['family', 'finance']
  },

  // -------------------------------------------------------------------------
  // TIMELINE ANCHORS
  // -------------------------------------------------------------------------
  {
    id: 'timeline-1',
    content: '2024-05 to 2024-06: Deep engagement on property closing, site prep, feasibility, and partner-raising strategy.',
    category: 'timeline',
    source: 'observed',
    importance: 6,
    privacyTier: 2,
    tags: ['quantum', 'history']
  },
  {
    id: 'timeline-2',
    content: '2024-08: Relationship transition aftermath; loneliness/dating challenges; therapy and self-improvement.',
    category: 'timeline',
    source: 'stated',
    importance: 5,
    privacyTier: 3,
    tags: ['personal', 'history']
  },
  {
    id: 'timeline-3',
    content: '2024-09: Refined Quantum/Quark mixed-use concept; compute + studio integration; incentive structuring.',
    category: 'timeline',
    source: 'observed',
    importance: 6,
    privacyTier: 2,
    tags: ['quantum', 'history']
  },
  {
    id: 'timeline-4',
    content: '2024-10: Deeper AI/data center research; quantum project exploration; "Machine in the Garden" motif for balancing tech and pastoral community.',
    category: 'timeline',
    source: 'observed',
    importance: 6,
    privacyTier: 2,
    tags: ['quantum', 'vision', 'history']
  },
  {
    id: 'timeline-5',
    content: '2025-07: "Mixture of Models" direction for MOE/CORTEX; campus-wide efficiency program concept.',
    category: 'timeline',
    source: 'observed',
    importance: 6,
    privacyTier: 2,
    tags: ['cortex', 'quantum', 'history']
  },

  // -------------------------------------------------------------------------
  // ADJACENT BUSINESS THREADS
  // -------------------------------------------------------------------------
  {
    id: 'biz-adjacent-1',
    content: 'Data center / AI infrastructure research; smart infrastructure and "selling compute to airport" concept.',
    category: 'project',
    source: 'observed',
    importance: 6,
    privacyTier: 2,
    tags: ['business', 'exploration']
  },
  {
    id: 'biz-adjacent-2',
    content: 'Investment strategy questions (e.g., Series 7 vs. external investor involvement).',
    category: 'project',
    source: 'stated',
    importance: 5,
    privacyTier: 2,
    tags: ['finance', 'strategy']
  },
  {
    id: 'biz-adjacent-3',
    content: 'Coffee-roasting venture exploration (unit economics; equipment sizing).',
    category: 'project',
    source: 'observed',
    importance: 4,
    privacyTier: 2,
    tags: ['business', 'exploration']
  },
  {
    id: 'biz-adjacent-4',
    content: 'Negotiation/contracts: supplier/manufacturer agreements, buyer protections; separation from former company equity/IP.',
    category: 'project',
    source: 'observed',
    importance: 6,
    privacyTier: 2,
    tags: ['legal', 'business']
  }
];
