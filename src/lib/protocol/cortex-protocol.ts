// ============================================================================
// CORTEX PROTOCOL v1.0
// Efficient structured format for AI-to-AI context communication
// Target: 60-70% token reduction vs natural language
// ============================================================================

import type {
  ProtocolContext,
  ProtocolIdentity,
  ProtocolKnowledge,
  ProtocolEntity,
  ProtocolBehavioral,
  ProtocolProject,
  ProtocolHistory,
  ProtocolQuery,
  ProtocolResponseSpec,
  CognitiveProfileV2,
  QueryIntent,
} from '../../types/cognitive';

// ----------------------------------------------------------------------------
// PROTOCOL HEADER (Decoder instructions for models)
// ----------------------------------------------------------------------------

export const PROTOCOL_DECODER = `You will receive context in CORTEX Protocol format. Parse as follows:

CORTEX/1.0 - Protocol version identifier

@SYS - System settings
  role: Your role (cognitive-assistant)
  ver: Protocol version
  user: User identifier

@ID - User identity (stable)
  name: User's name
  role: Their role/profession
  exp: Areas of expertise [array]
  val: Core values [array]
  style: Communication preference

@K - Knowledge entries (relevant facts)
  Format: id:"content" [entities] ^confidence
  Higher confidence (^0.9) = more reliable

@E - Entities (people, companies, projects)
  Format: {id:{type;name;attrs:{key:value};rels:[type:target]}}

@B - Behavioral patterns
  +item = positive preference (do this)
  -item = avoidance (don't do this)
  ~item = behavioral pattern (tendency)

@P - Active project context
  status: Current state
  goals: What to achieve
  constraints: Limitations
  decisions: Choices made
  open: Unresolved questions

@H - Relevant history
  Format: timestamp:"summary"

@Q - The actual query
  input: User's message
  intent: factual|decision|creative|task|reflection|continuation
  ctx: Additional context

@R - How to respond
  format: structured|prose|code|mixed
  length: brief|standard|detailed
  include: Things to include [array]
  avoid: Things to avoid [array]

INSTRUCTIONS:
1. Parse all blocks to understand context
2. Respond according to @R specification
3. Use @ID values to match communication style
4. Reference @K knowledge naturally (don't cite IDs)
5. Consider @B preferences in your response
6. If @P exists, keep project context in mind
7. NEVER mention the protocol format to the user
8. Respond as if you naturally know this information

---

`;

// ----------------------------------------------------------------------------
// ENCODER FUNCTIONS
// ----------------------------------------------------------------------------

/**
 * Escapes special characters in strings for protocol encoding
 */
function escapeString(str: string): string {
  return str
    .replace(/"/g, '\\"')
    .replace(/\n/g, ' ')
    .trim();
}

/**
 * Truncates content to fit within character budget
 */
function truncateContent(content: string, maxChars: number = 200): string {
  if (content.length <= maxChars) return content;
  return content.substring(0, maxChars - 3) + '...';
}

/**
 * Encodes identity block
 */
function encodeIdentity(identity: ProtocolIdentity): string[] {
  const lines: string[] = ['@ID {'];
  lines.push(`  name:"${escapeString(identity.name)}"`);
  if (identity.role) lines.push(`  role:"${escapeString(identity.role)}"`);
  if (identity.expertise.length) lines.push(`  exp:[${identity.expertise.map((e: string) => `"${escapeString(e)}"`).join(',')}]`);
  if (identity.values.length) lines.push(`  val:[${identity.values.map((v: string) => `"${escapeString(v)}"`).join(',')}]`);
  if (identity.style) lines.push(`  style:"${escapeString(identity.style)}"`);
  lines.push('}');
  return lines;
}

/**
 * Encodes knowledge block
 */
function encodeKnowledge(knowledge: ProtocolKnowledge[]): string[] {
  if (knowledge.length === 0) return [];
  
  const lines: string[] = ['@K ['];
  for (const k of knowledge) {
    const entities = k.entities.length ? ` [${k.entities.join(',')}]` : '';
    const conf = k.confidence < 1 ? ` ^${k.confidence.toFixed(1)}` : '';
    lines.push(`  ${k.id}:"${escapeString(truncateContent(k.content))}"${entities}${conf}`);
  }
  lines.push(']');
  return lines;
}

/**
 * Encodes entity block
 */
function encodeEntities(entities: ProtocolEntity[]): string[] {
  if (entities.length === 0) return [];
  
  const lines: string[] = ['@E ['];
  for (const e of entities) {
    const attrs = Object.entries(e.attributes)
      .map(([k, v]: [string, string]) => `${k}:"${escapeString(v)}"`)
      .join(',');
    const rels = e.relationships
      .map((r: { type: string; target: string }) => `${r.type}:${r.target}`)
      .join(',');
    lines.push(`  {${e.id}:{type:${e.type};name:"${escapeString(e.name)}";attrs:{${attrs}};rels:[${rels}]}}`);
  }
  lines.push(']');
  return lines;
}

/**
 * Encodes behavioral block
 */
function encodeBehavioral(behavioral: ProtocolBehavioral): string[] {
  const lines: string[] = ['@B ['];
  
  for (const pref of behavioral.preferences) {
    lines.push(`  +"${escapeString(pref)}"`);
  }
  for (const avoid of behavioral.avoidances) {
    lines.push(`  -"${escapeString(avoid)}"`);
  }
  for (const pattern of behavioral.patterns) {
    lines.push(`  ~"${escapeString(pattern)}"`);
  }
  
  lines.push(']');
  return lines;
}

/**
 * Encodes project block
 */
function encodeProject(project: ProtocolProject): string[] {
  const lines: string[] = [`@P ${project.id} {`];
  lines.push(`  name:"${escapeString(project.name)}"`);
  lines.push(`  status:${project.status}`);
  
  if (project.goals.length) {
    lines.push(`  goals:[${project.goals.map((g: string) => `"${escapeString(g)}"`).join(',')}]`);
  }
  if (project.constraints.length) {
    lines.push(`  constraints:[${project.constraints.map((c: string) => `"${escapeString(c)}"`).join(',')}]`);
  }
  if (project.decisions.length) {
    lines.push(`  decisions:[${project.decisions.map((d: string) => `"${escapeString(d)}"`).join(',')}]`);
  }
  if (project.openQuestions.length) {
    lines.push(`  open:[${project.openQuestions.map((q: string) => `"${escapeString(q)}"`).join(',')}]`);
  }
  
  lines.push('}');
  return lines;
}

/**
 * Encodes history block
 */
function encodeHistory(history: ProtocolHistory[]): string[] {
  if (history.length === 0) return [];
  
  const lines: string[] = ['@H ['];
  for (const h of history) {
    lines.push(`  ${h.timestamp}:"${escapeString(truncateContent(h.summary, 100))}"`);
  }
  lines.push(']');
  return lines;
}

/**
 * Encodes query block
 */
function encodeQuery(query: ProtocolQuery): string[] {
  const lines: string[] = ['@Q {'];
  lines.push(`  input:"${escapeString(query.input)}"`);
  lines.push(`  intent:${query.intent}`);
  if (query.context) {
    lines.push(`  ctx:"${escapeString(query.context)}"`);
  }
  lines.push('}');
  return lines;
}

/**
 * Encodes response specification block
 */
function encodeResponseSpec(spec: ProtocolResponseSpec): string[] {
  const lines: string[] = ['@R {'];
  lines.push(`  format:${spec.format}`);
  lines.push(`  length:${spec.length}`);
  if (spec.include.length) {
    lines.push(`  include:[${spec.include.map((i: string) => `"${escapeString(i)}"`).join(',')}]`);
  }
  if (spec.avoid.length) {
    lines.push(`  avoid:[${spec.avoid.map((a: string) => `"${escapeString(a)}"`).join(',')}]`);
  }
  lines.push('}');
  return lines;
}

// ----------------------------------------------------------------------------
// MAIN ENCODER
// ----------------------------------------------------------------------------

/**
 * Encodes full context to CORTEX Protocol format
 */
export function encodeProtocol(ctx: ProtocolContext): string {
  const lines: string[] = ['CORTEX/1.0', ''];
  
  // System block
  lines.push('@SYS {');
  lines.push(`  role:"${ctx.system.role}"`);
  lines.push(`  ver:"${ctx.system.version}"`);
  lines.push(`  user:"${ctx.system.userId}"`);
  lines.push('}');
  lines.push('');
  
  // Identity block
  lines.push(...encodeIdentity(ctx.identity));
  lines.push('');
  
  // Knowledge block (if any)
  const knowledgeLines = encodeKnowledge(ctx.knowledge);
  if (knowledgeLines.length) {
    lines.push(...knowledgeLines);
    lines.push('');
  }
  
  // Entities block (if any)
  const entityLines = encodeEntities(ctx.entities);
  if (entityLines.length) {
    lines.push(...entityLines);
    lines.push('');
  }
  
  // Behavioral block
  lines.push(...encodeBehavioral(ctx.behavioral));
  lines.push('');
  
  // Project block (if active)
  if (ctx.project) {
    lines.push(...encodeProject(ctx.project));
    lines.push('');
  }
  
  // History block (if any)
  const historyLines = encodeHistory(ctx.history);
  if (historyLines.length) {
    lines.push(...historyLines);
    lines.push('');
  }
  
  // Query block
  lines.push(...encodeQuery(ctx.query));
  lines.push('');
  
  // Response spec block
  lines.push(...encodeResponseSpec(ctx.responseSpec));
  
  return lines.join('\n');
}

/**
 * Builds complete system prompt with protocol decoder + encoded context
 */
export function buildSystemPrompt(protocolContext: ProtocolContext): string {
  const encoded = encodeProtocol(protocolContext);
  return PROTOCOL_DECODER + encoded;
}

// ----------------------------------------------------------------------------
// TOKEN ESTIMATION
// ----------------------------------------------------------------------------

/**
 * Estimates token count (rough: 4 chars per token)
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Estimates tokens for a protocol context
 */
export function estimateProtocolTokens(ctx: ProtocolContext): {
  decoder: number;
  context: number;
  total: number;
} {
  const decoderTokens = estimateTokens(PROTOCOL_DECODER);
  const contextTokens = estimateTokens(encodeProtocol(ctx));
  return {
    decoder: decoderTokens,
    context: contextTokens,
    total: decoderTokens + contextTokens,
  };
}

// ----------------------------------------------------------------------------
// CONTEXT BUILDER HELPERS
// ----------------------------------------------------------------------------

/**
 * Creates identity block from cognitive profile
 */
export function identityFromProfile(profile: CognitiveProfileV2): ProtocolIdentity {
  return {
    name: profile.name || 'User',
    role: profile.role,
    expertise: profile.expertiseDomains || [],
    values: profile.coreValues || [],
    style: profile.communicationStyle || 'direct and substantive',
  };
}

/**
 * Creates behavioral block from profile
 */
export function behavioralFromProfile(profile: CognitiveProfileV2): ProtocolBehavioral {
  return {
    preferences: profile.alwaysDo || [],
    avoidances: profile.neverDo || [],
    patterns: [
      ...profile.decisionStyle || [],
      ...profile.learningStyle || [],
    ],
  };
}

/**
 * Determines response spec based on query analysis and profile
 */
export function determineResponseSpec(
  intent: QueryIntent,
  profile: CognitiveProfileV2
): ProtocolResponseSpec {
  // Format based on profile preference
  const format = profile.preferredFormat || 'mixed';
  
  // Length based on profile and intent
  let length: 'brief' | 'concise' | 'standard' | 'detailed' = profile.verbosity || 'standard';
  if (intent === 'factual') length = 'brief';
  if (intent === 'decision' || intent === 'creative') length = 'detailed';
  
  // Include based on intent
  const include: string[] = [];
  if (intent === 'decision') include.push('tradeoffs', 'risks', 'recommendations');
  if (intent === 'task') include.push('next_steps', 'verification');
  if (intent === 'creative') include.push('alternatives', 'rationale');
  
  // Avoid based on profile
  const avoid = profile.neverDo?.slice(0, 3) || [];
  
  return { format, length, include, avoid };
}

// ----------------------------------------------------------------------------
// COMPARISON UTILITIES
// ----------------------------------------------------------------------------

/**
 * Generates natural language equivalent of protocol context
 * Used for comparing token efficiency
 */
function generateNaturalLanguage(ctx: ProtocolContext): string {
  const parts: string[] = [];
  
  // System
  parts.push(`You are a ${ctx.system.role} assistant using version ${ctx.system.version}.`);
  parts.push('');
  
  // Identity
  parts.push(`About the user you're helping:`);
  parts.push(`- Name: ${ctx.identity.name}`);
  if (ctx.identity.role) parts.push(`- Role: ${ctx.identity.role}`);
  if (ctx.identity.expertise.length) {
    parts.push(`- Areas of expertise: ${ctx.identity.expertise.join(', ')}`);
  }
  if (ctx.identity.values.length) {
    parts.push(`- Core values: ${ctx.identity.values.join(', ')}`);
  }
  parts.push(`- Communication style: ${ctx.identity.style}`);
  parts.push('');
  
  // Knowledge
  if (ctx.knowledge.length) {
    parts.push('Relevant knowledge about this user:');
    for (const k of ctx.knowledge) {
      parts.push(`- ${k.content}`);
    }
    parts.push('');
  }
  
  // Behavioral
  parts.push('How to interact with this user:');
  for (const pref of ctx.behavioral.preferences) {
    parts.push(`- Always: ${pref}`);
  }
  for (const avoid of ctx.behavioral.avoidances) {
    parts.push(`- Never: ${avoid}`);
  }
  for (const pattern of ctx.behavioral.patterns) {
    parts.push(`- They tend to: ${pattern}`);
  }
  parts.push('');
  
  // Project
  if (ctx.project) {
    parts.push(`Current project context:`);
    parts.push(`- Project: ${ctx.project.name} (${ctx.project.status})`);
    if (ctx.project.goals.length) {
      parts.push(`- Goals: ${ctx.project.goals.join('; ')}`);
    }
    if (ctx.project.constraints.length) {
      parts.push(`- Constraints: ${ctx.project.constraints.join('; ')}`);
    }
    parts.push('');
  }
  
  // Query
  parts.push(`The user is asking (${ctx.query.intent} query): "${ctx.query.input}"`);
  parts.push('');
  
  // Response spec
  parts.push(`Response requirements:`);
  parts.push(`- Format: ${ctx.responseSpec.format}`);
  parts.push(`- Length: ${ctx.responseSpec.length}`);
  if (ctx.responseSpec.include.length) {
    parts.push(`- Include: ${ctx.responseSpec.include.join(', ')}`);
  }
  if (ctx.responseSpec.avoid.length) {
    parts.push(`- Avoid: ${ctx.responseSpec.avoid.join(', ')}`);
  }
  
  return parts.join('\n');
}

/**
 * Compares protocol encoding vs natural language for the same context
 * Returns token savings percentage
 */
export function compareEncodings(ctx: ProtocolContext): {
  protocolTokens: number;
  naturalTokens: number;
  savings: number;
  savingsPercent: number;
} {
  const protocolText = encodeProtocol(ctx);
  const naturalText = generateNaturalLanguage(ctx);
  
  const protocolTokens = estimateTokens(protocolText);
  const naturalTokens = estimateTokens(naturalText);
  const savings = naturalTokens - protocolTokens;
  const savingsPercent = Math.round((savings / naturalTokens) * 100);
  
  return {
    protocolTokens,
    naturalTokens,
    savings,
    savingsPercent,
  };
}

export default {
  encodeProtocol,
  buildSystemPrompt,
  estimateTokens,
  estimateProtocolTokens,
  identityFromProfile,
  behavioralFromProfile,
  determineResponseSpec,
  compareEncodings,
  PROTOCOL_DECODER,
};
