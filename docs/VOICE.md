# AIOS Voice and Content Guidelines

This guide defines the product voice, style rules, and terminology standards for the AIOS platform, documentation, and user interface.

---

## 1. Core Principles

- **Plain and Direct**: State exactly what the product does, what input is required, and what output is generated.
- **Specific**: Use concrete numbers and technical terminology (e.g., "512-token overlap", "Neo4j 3-hop traversal", "FastAPI async worker") instead of vague abstractions.
- **Active Voice**: Write in active voice. The user or the system takes the action.
- **Zero Hype**: Never exaggerate performance, speed, or capabilities. State actual behavior, including constraints and latency boundaries.
- **Honest Limitations**: State requirements clearly (e.g., "Requires local Ollama instance or valid OpenAI API key"). Mark unfinished features as "Coming soon" or omit them.

---

## 2. Banned Words and Phrases

The following words and hype phrases are strictly prohibited across UI copy, documentation, commit messages, and metadata:

- revolution / revolutionize
- unleash
- supercharge
- next-gen / next-generation
- cutting-edge
- seamless / seamlessly
- effortless / effortlessly
- game-changing / game changer
- empower / empowering
- unlock
- elevate
- "in today's fast-paced world"
- "AI-powered" as a standalone unsubstantiated claim
- "recruiter-grade"
- "10x" / "10x faster"
- "enterprise-grade" (unless backed by documented SOC-2 / ISO certification)
- lorem ipsum

---

## 3. Punctuation Rules

- **No Em Dashes or En Dashes**: Do not use `—` (em dash) or `–` (en dash) as punctuation in visible UI text, README, or documentation.
- **Allowed Replacements**: Use periods, commas, colons, or parentheses.
- **Hyphens**: Use a standard ASCII hyphen `-` only inside compound words (e.g., "multi-agent", "real-time") and numerical ranges (e.g., "150-300ms", "pages 10-12").

---

## 4. Numbers, Metrics, and Data

- Every metric shown in production must derive from real database queries or active telemetry endpoints.
- In demo or seeded states, all non-live data must be labeled as "Sample data".
- Do not show decorative live badges, invented customer counts, or unverified star ratings.
- Remove fake placeholder identities such as "Acme Corp", "My Startup", or "John Doe". Display authenticated user information or real workspace identifiers.
