# AIOS Production Launch Audit (Phase 1)

> **Status**: Audit Completed. Awaiting User Approval before Proceeding to Phase 2 (Implementation).

## 1. Executive Summary

This audit evaluates the AIOS web application against the **10 Hard Rules** and **4 Launch Gates** required for public production readiness. The audit crawled every route, page component, design token, navigation element, metadata definition, and configuration file in the repository.

A total of **255 specific violations** were cataloged across 42 files. All violations have been mapped to concrete remediation steps in the table below.

### Violations Breakdown by Category

| Rule / Gate | Description | Count |
| :--- | :--- | :--- |
| **Rule 1 (Colors)** | Scope enforcement | 90 |
| **Rule 3 (No Emojis)** | Scope enforcement | 67 |
| **Rule 2 (Radius)** | Scope enforcement | 33 |
| **Rule 8 (Dashes)** | Scope enforcement | 19 |
| **Rule 6 & 7 (Fake Stats/Live)** | Scope enforcement | 11 |
| **Rule 10 (Placeholders)** | Scope enforcement | 10 |
| **Gate B (Favicon Set)** | Scope enforcement | 7 |
| **Rule 1 (Gradients)** | Scope enforcement | 6 |
| **Gate A (Custom Domain)** | Scope enforcement | 4 |
| **Gate D (Legal Pages)** | Scope enforcement | 3 |
| **Rule 4 (Motion)** | Scope enforcement | 3 |
| **Gate C (Metadata / Branding)** | Scope enforcement | 2 |

---

## 2. Comprehensive Violation Table

| File | Line | Rule / Gate | Violation Description | Proposed Remediation |
| :--- | :--- | :--- | :--- | :--- |
| `frontend/index.html` | 4 | Gate A (Custom Domain) | Missing canonical URL `<link rel="canonical" href="...">` | Add canonical link tag referencing `PUBLIC_SITE_URL` |
| `frontend/index.html` | 5 | Gate B (Favicon Set) | Missing `<link>` tags for apple-touch-icon, manifest, and favicon.ico | Add complete `<link>` tags in `<head>` |
| `frontend/index.html` | 7 | Rule 8 (Dashes) | Em dash in title or description meta tag | Replace with colon or hyphen |
| `frontend/index.html` | 8 | Rule 8 (Dashes) | Em dash in title or description meta tag | Replace with colon or hyphen |
| `frontend/index.html` | 13 | Gate C (Metadata / Branding) | Missing Open Graph and Twitter card meta tags and 1200x630 OG image | Add `og:title`, `og:description`, `og:image`, `twitter:card`, `twitter:image` and generate `public/og-image.png` |
| `frontend/public/apple-touch-icon.png` | 0 | Gate B (Favicon Set) | Missing `apple-touch-icon.png` (180x180) | Generate 180x180 PNG touch icon |
| `frontend/public/favicon.ico` | 0 | Gate B (Favicon Set) | Missing multi-resolution `favicon.ico` (16, 32, 48px) | Generate standard `favicon.ico` file |
| `frontend/public/favicon.svg` | 0 | Gate B (Favicon Set) | Missing `favicon.svg` with dark/light scheme support | Generate SVG mark with `#5EEAD4` teal accent and prefers-color-scheme light/dark styling |
| `frontend/public/icon-192.png` | 0 | Gate B (Favicon Set) | Missing standard PWA web manifest icon `icon-192.png` | Generate 192x192 PNG web app icon |
| `frontend/public/icon-512.png` | 0 | Gate B (Favicon Set) | Missing standard PWA web manifest icon `icon-512.png` | Generate 512x512 PNG web app icon |
| `frontend/public/robots.txt` | 1 | Gate A (Custom Domain) | Robots.txt missing Sitemap directive and not excluding authenticated app routes | Update robots.txt with `Sitemap: https://${PUBLIC_SITE_URL}/sitemap.xml` and Disallow private routes (/dashboard, /playground, /agents, etc.) |
| `frontend/public/site.webmanifest` | 0 | Gate B (Favicon Set) | Missing `site.webmanifest` | Create `site.webmanifest` with theme_color `#0B0C0E` and background_color `#0B0C0E` |
| `frontend/public/sitemap.xml` | 0 | Gate A (Custom Domain) | Missing `sitemap.xml` file | Generate standard `sitemap.xml` indexing public pages (`/`, `/login`, `/register`, `/privacy`, `/terms`) |
| `frontend/src/App.tsx` | 68 | Gate D (Legal Pages) | Missing `/privacy` and `/terms` routes in application router | Create `PrivacyPage.tsx` and `TermsPage.tsx` and register routes in `App.tsx` |
| `frontend/src/components/auth/RoleGuard.tsx` | 42 | Rule 2 (Radius) | Pill-shaped `rounded-full` on button/badge/tab/chip | Change to `rounded` or `rounded-md` (enforce 6px max 8px radius) |
| `frontend/src/components/common/AICopilotWidget.tsx` | 42 | Rule 3 (No Emojis) | Emoji symbol(s): 👋 | Replace with corresponding Lucide icon (e.g. CheckCircle, Zap, Shield, Crown) or plain text |
| `frontend/src/components/common/AICopilotWidget.tsx` | 99 | Rule 3 (No Emojis) | Emoji symbol(s): 🕸 | Replace with corresponding Lucide icon (e.g. CheckCircle, Zap, Shield, Crown) or plain text |
| `frontend/src/components/common/AICopilotWidget.tsx` | 104 | Rule 3 (No Emojis) | Emoji symbol(s): 📝 | Replace with corresponding Lucide icon (e.g. CheckCircle, Zap, Shield, Crown) or plain text |
| `frontend/src/components/common/AICopilotWidget.tsx` | 104 | Rule 6 & 7 (Fake Stats/Live) | Hardcoded live status / fake compliance label `SOC-2` | Replace with real health API telemetry check or remove unverified claim |
| `frontend/src/components/common/AICopilotWidget.tsx` | 109 | Rule 3 (No Emojis) | Emoji symbol(s): ⚡ ➔ | Replace with corresponding Lucide icon (e.g. CheckCircle, Zap, Shield, Crown) or plain text |
| `frontend/src/components/common/AICopilotWidget.tsx` | 114 | Rule 3 (No Emojis) | Emoji symbol(s): 📊 | Replace with corresponding Lucide icon (e.g. CheckCircle, Zap, Shield, Crown) or plain text |
| `frontend/src/components/common/AICopilotWidget.tsx` | 119 | Rule 3 (No Emojis) | Emoji symbol(s): 📚 | Replace with corresponding Lucide icon (e.g. CheckCircle, Zap, Shield, Crown) or plain text |
| `frontend/src/components/common/AICopilotWidget.tsx` | 124 | Rule 3 (No Emojis) | Emoji symbol(s): 🔍 | Replace with corresponding Lucide icon (e.g. CheckCircle, Zap, Shield, Crown) or plain text |
| `frontend/src/components/common/AICopilotWidget.tsx` | 129 | Rule 3 (No Emojis) | Emoji symbol(s): 🛠 | Replace with corresponding Lucide icon (e.g. CheckCircle, Zap, Shield, Crown) or plain text |
| `frontend/src/components/common/AICopilotWidget.tsx` | 129 | Rule 6 & 7 (Fake Stats/Live) | Hardcoded live status / fake compliance label `SOC-2` | Replace with real health API telemetry check or remove unverified claim |
| `frontend/src/components/common/ActivityTimelinePanel.tsx` | 40 | Rule 1 (Colors) | Tailwind color class `text-indigo-400` | Replace with neutral zinc/gray (`text-zinc-400`, `bg-zinc-800`) or primary/teal token |
| `frontend/src/components/common/ActivityTimelinePanel.tsx` | 41 | Rule 1 (Colors) | Tailwind color class `bg-indigo-500` | Replace with neutral zinc/gray (`text-zinc-400`, `bg-zinc-800`) or primary/teal token |
| `frontend/src/components/common/ActivityTimelinePanel.tsx` | 84 | Rule 1 (Colors) | Tailwind color class `text-purple-400` | Replace with neutral zinc/gray (`text-zinc-400`, `bg-zinc-800`) or primary/teal token |
| `frontend/src/components/common/ActivityTimelinePanel.tsx` | 85 | Rule 1 (Colors) | Tailwind color class `bg-purple-500` | Replace with neutral zinc/gray (`text-zinc-400`, `bg-zinc-800`) or primary/teal token |
| `frontend/src/components/common/ActivityTimelinePanel.tsx` | 189 | Rule 1 (Gradients) | Gradient usage `bg-gradient-to` | Replace with solid neutral background/text color |
| `frontend/src/components/common/ActivityTimelinePanel.tsx` | 203 | Rule 2 (Radius) | Pill-shaped `rounded-full` on button/badge/tab/chip | Change to `rounded` or `rounded-md` (enforce 6px max 8px radius) |
| `frontend/src/components/common/BackgroundMedia.tsx` | 73 | Rule 4 (Motion) | Canvas particle network and window scroll parallax listener | Remove dynamic canvas animation and scroll parallax; use static abstract svg/grid with neutral scrim |
| `frontend/src/components/common/BackgroundMedia.tsx` | 74 | Rule 4 (Motion) | Canvas particle network and window scroll parallax listener | Remove dynamic canvas animation and scroll parallax; use static abstract svg/grid with neutral scrim |
| `frontend/src/components/common/BackgroundMedia.tsx` | 235 | Rule 4 (Motion) | Canvas particle network and window scroll parallax listener | Remove dynamic canvas animation and scroll parallax; use static abstract svg/grid with neutral scrim |
| `frontend/src/components/common/CommandPalette.tsx` | 83 | Rule 3 (No Emojis) | Emoji symbol(s): ⌘ | Replace with corresponding Lucide icon (e.g. CheckCircle, Zap, Shield, Crown) or plain text |
| `frontend/src/components/common/CommandPalette.tsx` | 92 | Rule 3 (No Emojis) | Emoji symbol(s): ⌘ | Replace with corresponding Lucide icon (e.g. CheckCircle, Zap, Shield, Crown) or plain text |
| `frontend/src/components/common/CommandPalette.tsx` | 117 | Rule 3 (No Emojis) | Emoji symbol(s): ⌘ | Replace with corresponding Lucide icon (e.g. CheckCircle, Zap, Shield, Crown) or plain text |
| `frontend/src/components/common/CommandPalette.tsx` | 142 | Rule 3 (No Emojis) | Emoji symbol(s): ⌘ | Replace with corresponding Lucide icon (e.g. CheckCircle, Zap, Shield, Crown) or plain text |
| `frontend/src/components/common/CommandPalette.tsx` | 370 | Rule 8 (Dashes) | Em/En dash `—` used as punctuation | Rewrite sentence using colon, comma, period, or hyphen for compound words |
| `frontend/src/components/common/CommandPalette.tsx` | 378 | Rule 8 (Dashes) | Em/En dash `—` used as punctuation | Rewrite sentence using colon, comma, period, or hyphen for compound words |
| `frontend/src/components/common/CommandPalette.tsx` | 378 | Rule 10 (Placeholders) | Placeholder identity/email `sarah.chen@aios.ai` | Use authenticated user name/email or dynamic workspace title |
| `frontend/src/components/common/CommandPalette.tsx` | 386 | Rule 8 (Dashes) | Em/En dash `—` used as punctuation | Rewrite sentence using colon, comma, period, or hyphen for compound words |
| `frontend/src/components/common/CommandPalette.tsx` | 386 | Rule 10 (Placeholders) | Placeholder identity/email `alex.rivera@aios.ai` | Use authenticated user name/email or dynamic workspace title |
| `frontend/src/components/common/CommandPalette.tsx` | 394 | Rule 8 (Dashes) | Em/En dash `—` used as punctuation | Rewrite sentence using colon, comma, period, or hyphen for compound words |
| `frontend/src/components/common/CommandPalette.tsx` | 394 | Rule 10 (Placeholders) | Placeholder identity/email `system-bot@aios.internal` | Use authenticated user name/email or dynamic workspace title |
| `frontend/src/components/common/CommandPalette.tsx` | 404 | Rule 3 (No Emojis) | Emoji symbol(s): ➔ | Replace with corresponding Lucide icon (e.g. CheckCircle, Zap, Shield, Crown) or plain text |
| `frontend/src/components/common/CommandPalette.tsx` | 467 | Rule 3 (No Emojis) | Emoji symbol(s): ⌘ | Replace with corresponding Lucide icon (e.g. CheckCircle, Zap, Shield, Crown) or plain text |
| `frontend/src/components/common/CommandPalette.tsx` | 476 | Rule 3 (No Emojis) | Emoji symbol(s): ⌘ | Replace with corresponding Lucide icon (e.g. CheckCircle, Zap, Shield, Crown) or plain text |
| `frontend/src/components/common/CommandPalette.tsx` | 485 | Rule 3 (No Emojis) | Emoji symbol(s): ⌘ | Replace with corresponding Lucide icon (e.g. CheckCircle, Zap, Shield, Crown) or plain text |
| `frontend/src/components/common/CommandPalette.tsx` | 681 | Rule 3 (No Emojis) | Emoji symbol(s): ⌘ | Replace with corresponding Lucide icon (e.g. CheckCircle, Zap, Shield, Crown) or plain text |
| `frontend/src/components/common/KeyboardShortcutsModal.tsx` | 16 | Rule 3 (No Emojis) | Emoji symbol(s): ⌘ | Replace with corresponding Lucide icon (e.g. CheckCircle, Zap, Shield, Crown) or plain text |
| `frontend/src/components/common/KeyboardShortcutsModal.tsx` | 17 | Rule 3 (No Emojis) | Emoji symbol(s): ⌘ | Replace with corresponding Lucide icon (e.g. CheckCircle, Zap, Shield, Crown) or plain text |
| `frontend/src/components/common/KeyboardShortcutsModal.tsx` | 31 | Rule 1 (Colors) | Tailwind color class `text-purple-400` | Replace with neutral zinc/gray (`text-zinc-400`, `bg-zinc-800`) or primary/teal token |
| `frontend/src/components/common/KeyboardShortcutsModal.tsx` | 31 | Rule 1 (Colors) | Tailwind color class `border-purple-500` | Replace with neutral zinc/gray (`text-zinc-400`, `bg-zinc-800`) or primary/teal token |
| `frontend/src/components/common/KeyboardShortcutsModal.tsx` | 31 | Rule 1 (Colors) | Tailwind color class `bg-purple-500` | Replace with neutral zinc/gray (`text-zinc-400`, `bg-zinc-800`) or primary/teal token |
| `frontend/src/components/common/NotificationCenter.tsx` | 91 | Rule 1 (Colors) | Tailwind color class `text-purple-400` | Replace with neutral zinc/gray (`text-zinc-400`, `bg-zinc-800`) or primary/teal token |
| `frontend/src/components/common/NotificationCenter.tsx` | 122 | Rule 2 (Radius) | Pill-shaped `rounded-full` on button/badge/tab/chip | Change to `rounded` or `rounded-md` (enforce 6px max 8px radius) |
| `frontend/src/components/common/OnboardingModal.tsx` | 125 | Rule 2 (Radius) | Pill-shaped `rounded-full` on button/badge/tab/chip | Change to `rounded` or `rounded-md` (enforce 6px max 8px radius) |
| `frontend/src/components/common/ProfileDropdown.tsx` | 201 | Rule 3 (No Emojis) | Emoji symbol(s): ⌘ | Replace with corresponding Lucide icon (e.g. CheckCircle, Zap, Shield, Crown) or plain text |
| `frontend/src/components/common/SkeletonLoader.tsx` | 41 | Rule 2 (Radius) | Pill-shaped `rounded-full` on button/badge/tab/chip | Change to `rounded` or `rounded-md` (enforce 6px max 8px radius) |
| `frontend/src/components/common/SkeletonLoader.tsx` | 48 | Rule 2 (Radius) | Pill-shaped `rounded-full` on button/badge/tab/chip | Change to `rounded` or `rounded-md` (enforce 6px max 8px radius) |
| `frontend/src/components/common/ToastContainer.tsx` | 47 | Rule 3 (No Emojis) | Emoji symbol(s): ✓ | Replace with corresponding Lucide icon (e.g. CheckCircle, Zap, Shield, Crown) or plain text |
| `frontend/src/components/common/ToastContainer.tsx` | 52 | Rule 1 (Colors) | Tailwind color class `text-indigo-400` | Replace with neutral zinc/gray (`text-zinc-400`, `bg-zinc-800`) or primary/teal token |
| `frontend/src/components/common/ToastContainer.tsx` | 54 | Rule 1 (Colors) | Tailwind color class `text-purple-400` | Replace with neutral zinc/gray (`text-zinc-400`, `bg-zinc-800`) or primary/teal token |
| `frontend/src/components/layouts/Navbar.tsx` | 148 | Rule 10 (Placeholders) | Placeholder identity/email `Acme` | Use authenticated user name/email or dynamic workspace title |
| `frontend/src/components/layouts/Navbar.tsx` | 162 | Rule 10 (Placeholders) | Placeholder identity/email `My Startup` | Use authenticated user name/email or dynamic workspace title |
| `frontend/src/components/layouts/Navbar.tsx` | 250 | Rule 1 (Colors) | Tailwind color class `text-purple-400` | Replace with neutral zinc/gray (`text-zinc-400`, `bg-zinc-800`) or primary/teal token |
| `frontend/src/components/layouts/Navbar.tsx` | 283 | Rule 3 (No Emojis) | Emoji symbol(s): ⌘ | Replace with corresponding Lucide icon (e.g. CheckCircle, Zap, Shield, Crown) or plain text |
| `frontend/src/components/layouts/Navbar.tsx` | 305 | Rule 3 (No Emojis) | Emoji symbol(s): ⌘ | Replace with corresponding Lucide icon (e.g. CheckCircle, Zap, Shield, Crown) or plain text |
| `frontend/src/pages/AgentBuilderPage.tsx` | 103 | Rule 1 (Colors) | Purple/indigo hex `#c084fc` | Replace with neutral graphite token (`#71717A` / `#27272A`) or teal accent (`#5EEAD4`) |
| `frontend/src/pages/AgentBuilderPage.tsx` | 203 | Rule 1 (Colors) | Purple/indigo hex `#c084fc` | Replace with neutral graphite token (`#71717A` / `#27272A`) or teal accent (`#5EEAD4`) |
| `frontend/src/pages/AgentBuilderPage.tsx` | 328 | Rule 1 (Colors) | Purple/indigo hex `#6366f1` | Replace with neutral graphite token (`#71717A` / `#27272A`) or teal accent (`#5EEAD4`) |
| `frontend/src/pages/AgentBuilderPage.tsx` | 532 | Rule 1 (Colors) | Purple/indigo hex `#6366f1` | Replace with neutral graphite token (`#71717A` / `#27272A`) or teal accent (`#5EEAD4`) |
| `frontend/src/pages/AgentBuilderPage.tsx` | 668 | Rule 3 (No Emojis) | Emoji symbol(s): ✓ | Replace with corresponding Lucide icon (e.g. CheckCircle, Zap, Shield, Crown) or plain text |
| `frontend/src/pages/AgentBuilderPage.tsx` | 769 | Rule 3 (No Emojis) | Emoji symbol(s): ⌘ | Replace with corresponding Lucide icon (e.g. CheckCircle, Zap, Shield, Crown) or plain text |
| `frontend/src/pages/AgentBuilderPage.tsx` | 878 | Rule 1 (Colors) | Tailwind color class `text-purple-300` | Replace with neutral zinc/gray (`text-zinc-400`, `bg-zinc-800`) or primary/teal token |
| `frontend/src/pages/AgentBuilderPage.tsx` | 878 | Rule 1 (Colors) | Tailwind color class `border-purple-500` | Replace with neutral zinc/gray (`text-zinc-400`, `bg-zinc-800`) or primary/teal token |
| `frontend/src/pages/AgentBuilderPage.tsx` | 878 | Rule 1 (Colors) | Tailwind color class `bg-purple-500` | Replace with neutral zinc/gray (`text-zinc-400`, `bg-zinc-800`) or primary/teal token |
| `frontend/src/pages/AgentBuilderPage.tsx` | 914 | Rule 1 (Colors) | Tailwind color class `text-purple-400` | Replace with neutral zinc/gray (`text-zinc-400`, `bg-zinc-800`) or primary/teal token |
| `frontend/src/pages/AgentBuilderPage.tsx` | 975 | Rule 1 (Colors) | Tailwind color class `border-purple-500` | Replace with neutral zinc/gray (`text-zinc-400`, `bg-zinc-800`) or primary/teal token |
| `frontend/src/pages/AgentBuilderPage.tsx` | 975 | Rule 1 (Colors) | Tailwind color class `bg-purple-500` | Replace with neutral zinc/gray (`text-zinc-400`, `bg-zinc-800`) or primary/teal token |
| `frontend/src/pages/AgentBuilderPage.tsx` | 978 | Rule 1 (Colors) | Tailwind color class `bg-purple-500` | Replace with neutral zinc/gray (`text-zinc-400`, `bg-zinc-800`) or primary/teal token |
| `frontend/src/pages/AgentBuilderPage.tsx` | 989 | Rule 1 (Colors) | Tailwind color class `text-purple-400` | Replace with neutral zinc/gray (`text-zinc-400`, `bg-zinc-800`) or primary/teal token |
| `frontend/src/pages/AgentBuilderPage.tsx` | 1039 | Rule 2 (Radius) | Pill-shaped `rounded-full` on button/badge/tab/chip | Change to `rounded` or `rounded-md` (enforce 6px max 8px radius) |
| `frontend/src/pages/AgentMarketplacePage.tsx` | 125 | Rule 2 (Radius) | Pill-shaped `rounded-full` on button/badge/tab/chip | Change to `rounded` or `rounded-md` (enforce 6px max 8px radius) |
| `frontend/src/pages/AgentsPage.tsx` | 78 | Rule 1 (Colors) | Tailwind color class `bg-purple-500` | Replace with neutral zinc/gray (`text-zinc-400`, `bg-zinc-800`) or primary/teal token |
| `frontend/src/pages/AgentsPage.tsx` | 79 | Rule 1 (Colors) | Tailwind color class `border-purple-500` | Replace with neutral zinc/gray (`text-zinc-400`, `bg-zinc-800`) or primary/teal token |
| `frontend/src/pages/AgentsPage.tsx` | 80 | Rule 1 (Colors) | Tailwind color class `text-purple-400` | Replace with neutral zinc/gray (`text-zinc-400`, `bg-zinc-800`) or primary/teal token |
| `frontend/src/pages/AgentsPage.tsx` | 86 | Rule 3 (No Emojis) | Emoji symbol(s): ✓ | Replace with corresponding Lucide icon (e.g. CheckCircle, Zap, Shield, Crown) or plain text |
| `frontend/src/pages/AgentsPage.tsx` | 105 | Rule 3 (No Emojis) | Emoji symbol(s): ✓ | Replace with corresponding Lucide icon (e.g. CheckCircle, Zap, Shield, Crown) or plain text |
| `frontend/src/pages/AgentsPage.tsx` | 120 | Rule 10 (Placeholders) | Placeholder identity/email `Acme Corp` | Use authenticated user name/email or dynamic workspace title |
| `frontend/src/pages/AgentsPage.tsx` | 123 | Rule 3 (No Emojis) | Emoji symbol(s): ✓ | Replace with corresponding Lucide icon (e.g. CheckCircle, Zap, Shield, Crown) or plain text |
| `frontend/src/pages/AgentsPage.tsx` | 141 | Rule 3 (No Emojis) | Emoji symbol(s): ✓ | Replace with corresponding Lucide icon (e.g. CheckCircle, Zap, Shield, Crown) or plain text |
| `frontend/src/pages/AgentsPage.tsx` | 159 | Rule 3 (No Emojis) | Emoji symbol(s): ✓ | Replace with corresponding Lucide icon (e.g. CheckCircle, Zap, Shield, Crown) or plain text |
| `frontend/src/pages/AgentsPage.tsx` | 177 | Rule 3 (No Emojis) | Emoji symbol(s): ✓ | Replace with corresponding Lucide icon (e.g. CheckCircle, Zap, Shield, Crown) or plain text |
| `frontend/src/pages/AgentsPage.tsx` | 299 | Rule 3 (No Emojis) | Emoji symbol(s): 🏆 | Replace with corresponding Lucide icon (e.g. CheckCircle, Zap, Shield, Crown) or plain text |
| `frontend/src/pages/AgentsPage.tsx` | 378 | Rule 3 (No Emojis) | Emoji symbol(s): ⚡ | Replace with corresponding Lucide icon (e.g. CheckCircle, Zap, Shield, Crown) or plain text |
| `frontend/src/pages/AgentsPage.tsx` | 429 | Rule 2 (Radius) | Pill-shaped `rounded-full` on button/badge/tab/chip | Change to `rounded` or `rounded-md` (enforce 6px max 8px radius) |
| `frontend/src/pages/AgentsPage.tsx` | 435 | Rule 2 (Radius) | Pill-shaped `rounded-full` on button/badge/tab/chip | Change to `rounded` or `rounded-md` (enforce 6px max 8px radius) |
| `frontend/src/pages/AgentsPage.tsx` | 441 | Rule 2 (Radius) | Pill-shaped `rounded-full` on button/badge/tab/chip | Change to `rounded` or `rounded-md` (enforce 6px max 8px radius) |
| `frontend/src/pages/AgentsPage.tsx` | 455 | Rule 1 (Colors) | Tailwind color class `text-purple-300` | Replace with neutral zinc/gray (`text-zinc-400`, `bg-zinc-800`) or primary/teal token |
| `frontend/src/pages/AgentsPage.tsx` | 456 | Rule 1 (Colors) | Tailwind color class `text-purple-400` | Replace with neutral zinc/gray (`text-zinc-400`, `bg-zinc-800`) or primary/teal token |
| `frontend/src/pages/AgentsPage.tsx` | 511 | Rule 1 (Gradients) | Gradient usage `bg-gradient-to` | Replace with solid neutral background/text color |
| `frontend/src/pages/ApiExplorerPage.tsx` | 260 | Rule 8 (Dashes) | Em/En dash `—` used as punctuation | Rewrite sentence using colon, comma, period, or hyphen for compound words |
| `frontend/src/pages/ApiExplorerPage.tsx` | 432 | Rule 1 (Colors) | Tailwind color class `text-purple-400` | Replace with neutral zinc/gray (`text-zinc-400`, `bg-zinc-800`) or primary/teal token |
| `frontend/src/pages/ApiExplorerPage.tsx` | 482 | Rule 1 (Colors) | Tailwind color class `text-purple-400` | Replace with neutral zinc/gray (`text-zinc-400`, `bg-zinc-800`) or primary/teal token |
| `frontend/src/pages/ApiExplorerPage.tsx` | 499 | Rule 1 (Colors) | Tailwind color class `text-purple-400` | Replace with neutral zinc/gray (`text-zinc-400`, `bg-zinc-800`) or primary/teal token |
| `frontend/src/pages/ApiExplorerPage.tsx` | 576 | Rule 1 (Colors) | Tailwind color class `to-indigo-600` | Replace with neutral zinc/gray (`text-zinc-400`, `bg-zinc-800`) or primary/teal token |
| `frontend/src/pages/ApiExplorerPage.tsx` | 576 | Rule 1 (Colors) | Tailwind color class `to-indigo-500` | Replace with neutral zinc/gray (`text-zinc-400`, `bg-zinc-800`) or primary/teal token |
| `frontend/src/pages/ApiExplorerPage.tsx` | 576 | Rule 1 (Gradients) | Gradient usage `bg-gradient-to` | Replace with solid neutral background/text color |
| `frontend/src/pages/AutoDevPage.tsx` | 98 | Rule 1 (Colors) | Tailwind color class `text-indigo-400` | Replace with neutral zinc/gray (`text-zinc-400`, `bg-zinc-800`) or primary/teal token |
| `frontend/src/pages/AutoDevPage.tsx` | 118 | Rule 1 (Colors) | Tailwind color class `text-purple-400` | Replace with neutral zinc/gray (`text-zinc-400`, `bg-zinc-800`) or primary/teal token |
| `frontend/src/pages/BillingPage.tsx` | 122 | Rule 2 (Radius) | Pill-shaped `rounded-full` on button/badge/tab/chip | Change to `rounded` or `rounded-md` (enforce 6px max 8px radius) |
| `frontend/src/pages/BillingPage.tsx` | 125 | Rule 2 (Radius) | Pill-shaped `rounded-full` on button/badge/tab/chip | Change to `rounded` or `rounded-md` (enforce 6px max 8px radius) |
| `frontend/src/pages/BillingPage.tsx` | 236 | Rule 2 (Radius) | Pill-shaped `rounded-full` on button/badge/tab/chip | Change to `rounded` or `rounded-md` (enforce 6px max 8px radius) |
| `frontend/src/pages/BillingPage.tsx` | 237 | Rule 2 (Radius) | Pill-shaped `rounded-full` on button/badge/tab/chip | Change to `rounded` or `rounded-md` (enforce 6px max 8px radius) |
| `frontend/src/pages/BillingPage.tsx` | 252 | Rule 2 (Radius) | Pill-shaped `rounded-full` on button/badge/tab/chip | Change to `rounded` or `rounded-md` (enforce 6px max 8px radius) |
| `frontend/src/pages/BillingPage.tsx` | 253 | Rule 2 (Radius) | Pill-shaped `rounded-full` on button/badge/tab/chip | Change to `rounded` or `rounded-md` (enforce 6px max 8px radius) |
| `frontend/src/pages/BillingPage.tsx` | 268 | Rule 2 (Radius) | Pill-shaped `rounded-full` on button/badge/tab/chip | Change to `rounded` or `rounded-md` (enforce 6px max 8px radius) |
| `frontend/src/pages/BillingPage.tsx` | 269 | Rule 2 (Radius) | Pill-shaped `rounded-full` on button/badge/tab/chip | Change to `rounded` or `rounded-md` (enforce 6px max 8px radius) |
| `frontend/src/pages/DashboardPage.tsx` | 173 | Rule 6 & 7 (Fake Stats/Live) | Hardcoded live status / fake compliance label `Streaming Live` | Replace with real health API telemetry check or remove unverified claim |
| `frontend/src/pages/GraphRAGPage.tsx` | 95 | Rule 1 (Colors) | Tailwind color class `text-purple-400` | Replace with neutral zinc/gray (`text-zinc-400`, `bg-zinc-800`) or primary/teal token |
| `frontend/src/pages/GraphRAGPage.tsx` | 99 | Rule 1 (Colors) | Purple/indigo hex `#818cf8` | Replace with neutral graphite token (`#71717A` / `#27272A`) or teal accent (`#5EEAD4`) |
| `frontend/src/pages/GraphRAGPage.tsx` | 99 | Rule 1 (Colors) | Tailwind color class `text-indigo-400` | Replace with neutral zinc/gray (`text-zinc-400`, `bg-zinc-800`) or primary/teal token |
| `frontend/src/pages/GraphRAGPage.tsx` | 468 | Rule 2 (Radius) | Pill-shaped `rounded-full` on button/badge/tab/chip | Change to `rounded` or `rounded-md` (enforce 6px max 8px radius) |
| `frontend/src/pages/GraphRAGPage.tsx` | 525 | Rule 3 (No Emojis) | Emoji symbol(s): ✓ | Replace with corresponding Lucide icon (e.g. CheckCircle, Zap, Shield, Crown) or plain text |
| `frontend/src/pages/GraphRAGPage.tsx` | 580 | Rule 1 (Colors) | Tailwind color class `text-purple-400` | Replace with neutral zinc/gray (`text-zinc-400`, `bg-zinc-800`) or primary/teal token |
| `frontend/src/pages/GraphRAGPage.tsx` | 587 | Rule 1 (Colors) | Tailwind color class `text-purple-300` | Replace with neutral zinc/gray (`text-zinc-400`, `bg-zinc-800`) or primary/teal token |
| `frontend/src/pages/GraphRAGPage.tsx` | 655 | Rule 1 (Colors) | Purple/indigo hex `#6366f1` | Replace with neutral graphite token (`#71717A` / `#27272A`) or teal accent (`#5EEAD4`) |
| `frontend/src/pages/GraphRAGPage.tsx` | 660 | Rule 1 (Colors) | Purple/indigo hex `#4f46e5` | Replace with neutral graphite token (`#71717A` / `#27272A`) or teal accent (`#5EEAD4`) |
| `frontend/src/pages/GraphRAGPage.tsx` | 661 | Rule 1 (Colors) | Purple/indigo hex `#a5b4fc` | Replace with neutral graphite token (`#71717A` / `#27272A`) or teal accent (`#5EEAD4`) |
| `frontend/src/pages/GraphRAGPage.tsx` | 681 | Rule 8 (Dashes) | Em/En dash `—` used as punctuation | Rewrite sentence using colon, comma, period, or hyphen for compound words |
| `frontend/src/pages/KnowledgeManagementPage.tsx` | 36 | Rule 3 (No Emojis) | Emoji symbol(s): 🐱 | Replace with corresponding Lucide icon (e.g. CheckCircle, Zap, Shield, Crown) or plain text |
| `frontend/src/pages/KnowledgeManagementPage.tsx` | 37 | Rule 3 (No Emojis) | Emoji symbol(s): 💬 | Replace with corresponding Lucide icon (e.g. CheckCircle, Zap, Shield, Crown) or plain text |
| `frontend/src/pages/KnowledgeManagementPage.tsx` | 38 | Rule 3 (No Emojis) | Emoji symbol(s): 📁 | Replace with corresponding Lucide icon (e.g. CheckCircle, Zap, Shield, Crown) or plain text |
| `frontend/src/pages/KnowledgeManagementPage.tsx` | 39 | Rule 3 (No Emojis) | Emoji symbol(s): 📝 | Replace with corresponding Lucide icon (e.g. CheckCircle, Zap, Shield, Crown) or plain text |
| `frontend/src/pages/KnowledgeManagementPage.tsx` | 40 | Rule 3 (No Emojis) | Emoji symbol(s): 📘 | Replace with corresponding Lucide icon (e.g. CheckCircle, Zap, Shield, Crown) or plain text |
| `frontend/src/pages/LandingPage.tsx` | 222 | Rule 10 (Placeholders) | Placeholder identity/email `Acme` | Use authenticated user name/email or dynamic workspace title |
| `frontend/src/pages/LandingPage.tsx` | 780 | Gate D (Legal Pages) | Footer lacks real links to `/privacy` and `/terms` | Add functional navigation links to `/privacy` and `/terms` in footer |
| `frontend/src/pages/LandingPage.tsx` | 808 | Rule 6 & 7 (Fake Stats/Live) | Hardcoded live status / fake compliance label `All systems operational` | Replace with real health API telemetry check or remove unverified claim |
| `frontend/src/pages/ModelManagementPage.tsx` | 83 | Rule 1 (Colors) | Tailwind color class `border-indigo-500` | Replace with neutral zinc/gray (`text-zinc-400`, `bg-zinc-800`) or primary/teal token |
| `frontend/src/pages/ModelManagementPage.tsx` | 83 | Rule 1 (Colors) | Tailwind color class `bg-indigo-500` | Replace with neutral zinc/gray (`text-zinc-400`, `bg-zinc-800`) or primary/teal token |
| `frontend/src/pages/ModelManagementPage.tsx` | 83 | Rule 1 (Colors) | Tailwind color class `text-indigo-300` | Replace with neutral zinc/gray (`text-zinc-400`, `bg-zinc-800`) or primary/teal token |
| `frontend/src/pages/ModelManagementPage.tsx` | 94 | Rule 1 (Colors) | Tailwind color class `text-indigo-400` | Replace with neutral zinc/gray (`text-zinc-400`, `bg-zinc-800`) or primary/teal token |
| `frontend/src/pages/ModelManagementPage.tsx` | 103 | Rule 3 (No Emojis) | Emoji symbol(s): 🟢 | Replace with corresponding Lucide icon (e.g. CheckCircle, Zap, Shield, Crown) or plain text |
| `frontend/src/pages/ModelManagementPage.tsx` | 117 | Rule 3 (No Emojis) | Emoji symbol(s): 🔶 | Replace with corresponding Lucide icon (e.g. CheckCircle, Zap, Shield, Crown) or plain text |
| `frontend/src/pages/ModelManagementPage.tsx` | 130 | Rule 3 (No Emojis) | Emoji symbol(s): 🔵 | Replace with corresponding Lucide icon (e.g. CheckCircle, Zap, Shield, Crown) or plain text |
| `frontend/src/pages/ModelManagementPage.tsx` | 143 | Rule 3 (No Emojis) | Emoji symbol(s): ⚡ | Replace with corresponding Lucide icon (e.g. CheckCircle, Zap, Shield, Crown) or plain text |
| `frontend/src/pages/ModelManagementPage.tsx` | 144 | Rule 1 (Colors) | Purple/indigo hex `#8b5cf6` | Replace with neutral graphite token (`#71717A` / `#27272A`) or teal accent (`#5EEAD4`) |
| `frontend/src/pages/ModelManagementPage.tsx` | 156 | Rule 3 (No Emojis) | Emoji symbol(s): 🤝 | Replace with corresponding Lucide icon (e.g. CheckCircle, Zap, Shield, Crown) or plain text |
| `frontend/src/pages/ModelManagementPage.tsx` | 169 | Rule 3 (No Emojis) | Emoji symbol(s): 🔀 | Replace with corresponding Lucide icon (e.g. CheckCircle, Zap, Shield, Crown) or plain text |
| `frontend/src/pages/ModelManagementPage.tsx` | 181 | Rule 3 (No Emojis) | Emoji symbol(s): 🦙 | Replace with corresponding Lucide icon (e.g. CheckCircle, Zap, Shield, Crown) or plain text |
| `frontend/src/pages/ModelManagementPage.tsx` | 194 | Rule 3 (No Emojis) | Emoji symbol(s): 🖥 | Replace with corresponding Lucide icon (e.g. CheckCircle, Zap, Shield, Crown) or plain text |
| `frontend/src/pages/ModelManagementPage.tsx` | 335 | Rule 8 (Dashes) | Em/En dash `–` used as punctuation | Rewrite sentence using colon, comma, period, or hyphen for compound words |
| `frontend/src/pages/ModelManagementPage.tsx` | 572 | Rule 8 (Dashes) | Em/En dash `—` used as punctuation | Rewrite sentence using colon, comma, period, or hyphen for compound words |
| `frontend/src/pages/ModelManagementPage.tsx` | 579 | Rule 8 (Dashes) | Em/En dash `—` used as punctuation | Rewrite sentence using colon, comma, period, or hyphen for compound words |
| `frontend/src/pages/ModelManagementPage.tsx` | 586 | Rule 8 (Dashes) | Em/En dash `—` used as punctuation | Rewrite sentence using colon, comma, period, or hyphen for compound words |
| `frontend/src/pages/ModelManagementPage.tsx` | 593 | Rule 8 (Dashes) | Em/En dash `—` used as punctuation | Rewrite sentence using colon, comma, period, or hyphen for compound words |
| `frontend/src/pages/ModelManagementPage.tsx` | 623 | Rule 8 (Dashes) | Em/En dash `–` used as punctuation | Rewrite sentence using colon, comma, period, or hyphen for compound words |
| `frontend/src/pages/ModelManagementPage.tsx` | 647 | Rule 8 (Dashes) | Em/En dash `–` used as punctuation | Rewrite sentence using colon, comma, period, or hyphen for compound words |
| `frontend/src/pages/ModelManagementPage.tsx` | 666 | Rule 1 (Colors) | Tailwind color class `text-indigo-400` | Replace with neutral zinc/gray (`text-zinc-400`, `bg-zinc-800`) or primary/teal token |
| `frontend/src/pages/NotFoundPage.tsx` | 18 | Rule 2 (Radius) | Pill-shaped `rounded-full` on button/badge/tab/chip | Change to `rounded` or `rounded-md` (enforce 6px max 8px radius) |
| `frontend/src/pages/PlaygroundPage.tsx` | 129 | Rule 1 (Colors) | Tailwind color class `text-violet-400` | Replace with neutral zinc/gray (`text-zinc-400`, `bg-zinc-800`) or primary/teal token |
| `frontend/src/pages/PlaygroundPage.tsx` | 129 | Rule 1 (Colors) | Tailwind color class `bg-violet-500` | Replace with neutral zinc/gray (`text-zinc-400`, `bg-zinc-800`) or primary/teal token |
| `frontend/src/pages/PlaygroundPage.tsx` | 129 | Rule 1 (Colors) | Tailwind color class `to-purple-500` | Replace with neutral zinc/gray (`text-zinc-400`, `bg-zinc-800`) or primary/teal token |
| `frontend/src/pages/PlaygroundPage.tsx` | 129 | Rule 1 (Colors) | Tailwind color class `from-violet-500` | Replace with neutral zinc/gray (`text-zinc-400`, `bg-zinc-800`) or primary/teal token |
| `frontend/src/pages/PlaygroundPage.tsx` | 129 | Rule 1 (Colors) | Tailwind color class `border-violet-500` | Replace with neutral zinc/gray (`text-zinc-400`, `bg-zinc-800`) or primary/teal token |
| `frontend/src/pages/PlaygroundPage.tsx` | 136 | Rule 1 (Colors) | Tailwind color class `text-purple-400` | Replace with neutral zinc/gray (`text-zinc-400`, `bg-zinc-800`) or primary/teal token |
| `frontend/src/pages/PlaygroundPage.tsx` | 270 | Rule 1 (Colors) | Tailwind color class `border-indigo-500` | Replace with neutral zinc/gray (`text-zinc-400`, `bg-zinc-800`) or primary/teal token |
| `frontend/src/pages/PlaygroundPage.tsx` | 270 | Rule 1 (Colors) | Tailwind color class `bg-indigo-950` | Replace with neutral zinc/gray (`text-zinc-400`, `bg-zinc-800`) or primary/teal token |
| `frontend/src/pages/PlaygroundPage.tsx` | 271 | Rule 1 (Colors) | Tailwind color class `border-indigo-500` | Replace with neutral zinc/gray (`text-zinc-400`, `bg-zinc-800`) or primary/teal token |
| `frontend/src/pages/PlaygroundPage.tsx` | 271 | Rule 1 (Colors) | Tailwind color class `text-indigo-300` | Replace with neutral zinc/gray (`text-zinc-400`, `bg-zinc-800`) or primary/teal token |
| `frontend/src/pages/PlaygroundPage.tsx` | 273 | Rule 1 (Colors) | Tailwind color class `text-indigo-400` | Replace with neutral zinc/gray (`text-zinc-400`, `bg-zinc-800`) or primary/teal token |
| `frontend/src/pages/PlaygroundPage.tsx` | 279 | Rule 1 (Colors) | Tailwind color class `text-indigo-200` | Replace with neutral zinc/gray (`text-zinc-400`, `bg-zinc-800`) or primary/teal token |
| `frontend/src/pages/PlaygroundPage.tsx` | 279 | Rule 1 (Colors) | Tailwind color class `border-indigo-500` | Replace with neutral zinc/gray (`text-zinc-400`, `bg-zinc-800`) or primary/teal token |
| `frontend/src/pages/PlaygroundPage.tsx` | 284 | Rule 3 (No Emojis) | Emoji symbol(s): ➔ | Replace with corresponding Lucide icon (e.g. CheckCircle, Zap, Shield, Crown) or plain text |
| `frontend/src/pages/PlaygroundPage.tsx` | 285 | Rule 1 (Colors) | Tailwind color class `border-purple-400` | Replace with neutral zinc/gray (`text-zinc-400`, `bg-zinc-800`) or primary/teal token |
| `frontend/src/pages/PlaygroundPage.tsx` | 285 | Rule 1 (Colors) | Tailwind color class `text-purple-300` | Replace with neutral zinc/gray (`text-zinc-400`, `bg-zinc-800`) or primary/teal token |
| `frontend/src/pages/PlaygroundPage.tsx` | 285 | Rule 1 (Colors) | Tailwind color class `bg-purple-500` | Replace with neutral zinc/gray (`text-zinc-400`, `bg-zinc-800`) or primary/teal token |
| `frontend/src/pages/PlaygroundPage.tsx` | 288 | Rule 3 (No Emojis) | Emoji symbol(s): ➔ | Replace with corresponding Lucide icon (e.g. CheckCircle, Zap, Shield, Crown) or plain text |
| `frontend/src/pages/PlaygroundPage.tsx` | 292 | Rule 3 (No Emojis) | Emoji symbol(s): ➔ | Replace with corresponding Lucide icon (e.g. CheckCircle, Zap, Shield, Crown) or plain text |
| `frontend/src/pages/PlaygroundPage.tsx` | 297 | Rule 1 (Colors) | Tailwind color class `border-indigo-500` | Replace with neutral zinc/gray (`text-zinc-400`, `bg-zinc-800`) or primary/teal token |
| `frontend/src/pages/PlaygroundPage.tsx` | 909 | Rule 1 (Colors) | Tailwind color class `text-indigo-400` | Replace with neutral zinc/gray (`text-zinc-400`, `bg-zinc-800`) or primary/teal token |
| `frontend/src/pages/PlaygroundPage.tsx` | 977 | Rule 1 (Colors) | Tailwind color class `text-purple-400` | Replace with neutral zinc/gray (`text-zinc-400`, `bg-zinc-800`) or primary/teal token |
| `frontend/src/pages/PlaygroundPage.tsx` | 1000 | Rule 2 (Radius) | Pill-shaped `rounded-full` on button/badge/tab/chip | Change to `rounded` or `rounded-md` (enforce 6px max 8px radius) |
| `frontend/src/pages/PlaygroundPage.tsx` | 1027 | Rule 1 (Colors) | Tailwind color class `text-indigo-400` | Replace with neutral zinc/gray (`text-zinc-400`, `bg-zinc-800`) or primary/teal token |
| `frontend/src/pages/PlaygroundPage.tsx` | 1095 | Rule 1 (Colors) | Tailwind color class `text-purple-400` | Replace with neutral zinc/gray (`text-zinc-400`, `bg-zinc-800`) or primary/teal token |
| `frontend/src/pages/PlaygroundPage.tsx` | 1118 | Rule 1 (Colors) | Tailwind color class `text-purple-400` | Replace with neutral zinc/gray (`text-zinc-400`, `bg-zinc-800`) or primary/teal token |
| `frontend/src/pages/PlaygroundPage.tsx` | 1200 | Rule 2 (Radius) | Pill-shaped `rounded-full` on button/badge/tab/chip | Change to `rounded` or `rounded-md` (enforce 6px max 8px radius) |
| `frontend/src/pages/PromptStudioPage.tsx` | 111 | Rule 6 & 7 (Fake Stats/Live) | Hardcoded live status / fake compliance label `SOC-2` | Replace with real health API telemetry check or remove unverified claim |
| `frontend/src/pages/PromptStudioPage.tsx` | 130 | Rule 6 & 7 (Fake Stats/Live) | Hardcoded live status / fake compliance label `SOC-2` | Replace with real health API telemetry check or remove unverified claim |
| `frontend/src/pages/PromptStudioPage.tsx` | 138 | Rule 6 & 7 (Fake Stats/Live) | Hardcoded live status / fake compliance label `SOC-2` | Replace with real health API telemetry check or remove unverified claim |
| `frontend/src/pages/PromptStudioPage.tsx` | 160 | Rule 6 & 7 (Fake Stats/Live) | Hardcoded live status / fake compliance label `SOC-2` | Replace with real health API telemetry check or remove unverified claim |
| `frontend/src/pages/PromptStudioPage.tsx` | 237 | Rule 10 (Placeholders) | Placeholder identity/email `Acme Corp` | Use authenticated user name/email or dynamic workspace title |
| `frontend/src/pages/PromptStudioPage.tsx` | 358 | Rule 10 (Placeholders) | Placeholder identity/email `Acme Health` | Use authenticated user name/email or dynamic workspace title |
| `frontend/src/pages/PromptStudioPage.tsx` | 718 | Rule 2 (Radius) | Pill-shaped `rounded-full` on button/badge/tab/chip | Change to `rounded` or `rounded-md` (enforce 6px max 8px radius) |
| `frontend/src/pages/PromptStudioPage.tsx` | 747 | Rule 2 (Radius) | Pill-shaped `rounded-full` on button/badge/tab/chip | Change to `rounded` or `rounded-md` (enforce 6px max 8px radius) |
| `frontend/src/pages/PromptStudioPage.tsx` | 788 | Rule 1 (Colors) | Tailwind color class `text-purple-400` | Replace with neutral zinc/gray (`text-zinc-400`, `bg-zinc-800`) or primary/teal token |
| `frontend/src/pages/PromptStudioPage.tsx` | 788 | Rule 1 (Colors) | Tailwind color class `border-purple-500` | Replace with neutral zinc/gray (`text-zinc-400`, `bg-zinc-800`) or primary/teal token |
| `frontend/src/pages/PromptStudioPage.tsx` | 788 | Rule 1 (Colors) | Tailwind color class `bg-purple-500` | Replace with neutral zinc/gray (`text-zinc-400`, `bg-zinc-800`) or primary/teal token |
| `frontend/src/pages/PromptStudioPage.tsx` | 832 | Rule 1 (Colors) | Tailwind color class `text-indigo-400` | Replace with neutral zinc/gray (`text-zinc-400`, `bg-zinc-800`) or primary/teal token |
| `frontend/src/pages/PromptStudioPage.tsx` | 832 | Rule 1 (Colors) | Tailwind color class `bg-indigo-500` | Replace with neutral zinc/gray (`text-zinc-400`, `bg-zinc-800`) or primary/teal token |
| `frontend/src/pages/PromptStudioPage.tsx` | 837 | Rule 2 (Radius) | Pill-shaped `rounded-full` on button/badge/tab/chip | Change to `rounded` or `rounded-md` (enforce 6px max 8px radius) |
| `frontend/src/pages/PromptStudioPage.tsx` | 849 | Rule 8 (Dashes) | Em/En dash `—` used as punctuation | Rewrite sentence using colon, comma, period, or hyphen for compound words |
| `frontend/src/pages/PromptStudioPage.tsx` | 924 | Rule 1 (Gradients) | Gradient usage `bg-gradient-to` | Replace with solid neutral background/text color |
| `frontend/src/pages/PromptStudioPage.tsx` | 1001 | Rule 2 (Radius) | Pill-shaped `rounded-full` on button/badge/tab/chip | Change to `rounded` or `rounded-md` (enforce 6px max 8px radius) |
| `frontend/src/pages/PromptStudioPage.tsx` | 1004 | Rule 2 (Radius) | Pill-shaped `rounded-full` on button/badge/tab/chip | Change to `rounded` or `rounded-md` (enforce 6px max 8px radius) |
| `frontend/src/pages/PromptStudioPage.tsx` | 1054 | Rule 8 (Dashes) | Em/En dash `—` used as punctuation | Rewrite sentence using colon, comma, period, or hyphen for compound words |
| `frontend/src/pages/PromptStudioPage.tsx` | 1104 | Rule 2 (Radius) | Pill-shaped `rounded-full` on button/badge/tab/chip | Change to `rounded` or `rounded-md` (enforce 6px max 8px radius) |
| `frontend/src/pages/PromptStudioPage.tsx` | 1310 | Rule 1 (Colors) | Tailwind color class `to-indigo-600` | Replace with neutral zinc/gray (`text-zinc-400`, `bg-zinc-800`) or primary/teal token |
| `frontend/src/pages/PromptStudioPage.tsx` | 1310 | Rule 1 (Gradients) | Gradient usage `bg-gradient-to` | Replace with solid neutral background/text color |
| `frontend/src/pages/PromptStudioPage.tsx` | 1325 | Rule 1 (Colors) | Tailwind color class `text-indigo-400` | Replace with neutral zinc/gray (`text-zinc-400`, `bg-zinc-800`) or primary/teal token |
| `frontend/src/pages/RegisterPage.tsx` | 150 | Gate D (Legal Pages) | Sign-up form lacks explicit agreement notice linking to Terms and Privacy Policy | Add explicit legal notice: 'By creating an account you agree to the Terms of Service and Privacy Policy' |
| `frontend/src/pages/ServerErrorPage.tsx` | 25 | Rule 2 (Radius) | Pill-shaped `rounded-full` on button/badge/tab/chip | Change to `rounded` or `rounded-md` (enforce 6px max 8px radius) |
| `frontend/src/pages/SettingsPage.tsx` | 526 | Rule 8 (Dashes) | Em/En dash `—` used as punctuation | Rewrite sentence using colon, comma, period, or hyphen for compound words |
| `frontend/src/pages/SettingsPage.tsx` | 634 | Rule 2 (Radius) | Pill-shaped `rounded-full` on button/badge/tab/chip | Change to `rounded` or `rounded-md` (enforce 6px max 8px radius) |
| `frontend/src/pages/SettingsPage.tsx` | 639 | Rule 2 (Radius) | Pill-shaped `rounded-full` on button/badge/tab/chip | Change to `rounded` or `rounded-md` (enforce 6px max 8px radius) |
| `frontend/src/pages/SettingsPage.tsx` | 737 | Rule 8 (Dashes) | Em/En dash `—` used as punctuation | Rewrite sentence using colon, comma, period, or hyphen for compound words |
| `frontend/src/pages/SettingsPage.tsx` | 773 | Rule 1 (Colors) | Tailwind color class `text-purple-400` | Replace with neutral zinc/gray (`text-zinc-400`, `bg-zinc-800`) or primary/teal token |
| `frontend/src/pages/SettingsPage.tsx` | 773 | Rule 1 (Colors) | Tailwind color class `border-purple-500` | Replace with neutral zinc/gray (`text-zinc-400`, `bg-zinc-800`) or primary/teal token |
| `frontend/src/pages/SettingsPage.tsx` | 773 | Rule 1 (Colors) | Tailwind color class `bg-purple-500` | Replace with neutral zinc/gray (`text-zinc-400`, `bg-zinc-800`) or primary/teal token |
| `frontend/src/pages/SettingsPage.tsx` | 844 | Rule 3 (No Emojis) | Emoji symbol(s): ✕ | Replace with corresponding Lucide icon (e.g. CheckCircle, Zap, Shield, Crown) or plain text |
| `frontend/src/pages/SettingsPage.tsx` | 982 | Rule 1 (Colors) | Tailwind color class `to-indigo-600` | Replace with neutral zinc/gray (`text-zinc-400`, `bg-zinc-800`) or primary/teal token |
| `frontend/src/pages/SettingsPage.tsx` | 982 | Rule 1 (Gradients) | Gradient usage `bg-gradient-to` | Replace with solid neutral background/text color |
| `frontend/src/pages/SettingsPage.tsx` | 1009 | Rule 1 (Colors) | Tailwind color class `text-purple-400` | Replace with neutral zinc/gray (`text-zinc-400`, `bg-zinc-800`) or primary/teal token |
| `frontend/src/pages/SettingsPage.tsx` | 1009 | Rule 1 (Colors) | Tailwind color class `border-purple-500` | Replace with neutral zinc/gray (`text-zinc-400`, `bg-zinc-800`) or primary/teal token |
| `frontend/src/pages/SettingsPage.tsx` | 1009 | Rule 1 (Colors) | Tailwind color class `bg-purple-500` | Replace with neutral zinc/gray (`text-zinc-400`, `bg-zinc-800`) or primary/teal token |
| `frontend/src/pages/SettingsPage.tsx` | 1019 | Rule 1 (Colors) | Tailwind color class `text-purple-400` | Replace with neutral zinc/gray (`text-zinc-400`, `bg-zinc-800`) or primary/teal token |
| `frontend/src/pages/SettingsPage.tsx` | 1019 | Rule 3 (No Emojis) | Emoji symbol(s): 👑 | Replace with corresponding Lucide icon (e.g. CheckCircle, Zap, Shield, Crown) or plain text |
| `frontend/src/pages/SettingsPage.tsx` | 1020 | Rule 3 (No Emojis) | Emoji symbol(s): 🛡 | Replace with corresponding Lucide icon (e.g. CheckCircle, Zap, Shield, Crown) or plain text |
| `frontend/src/pages/SettingsPage.tsx` | 1021 | Rule 3 (No Emojis) | Emoji symbol(s): 💻 | Replace with corresponding Lucide icon (e.g. CheckCircle, Zap, Shield, Crown) or plain text |
| `frontend/src/pages/SettingsPage.tsx` | 1022 | Rule 3 (No Emojis) | Emoji symbol(s): 📊 | Replace with corresponding Lucide icon (e.g. CheckCircle, Zap, Shield, Crown) or plain text |
| `frontend/src/pages/SettingsPage.tsx` | 1023 | Rule 3 (No Emojis) | Emoji symbol(s): 👁 | Replace with corresponding Lucide icon (e.g. CheckCircle, Zap, Shield, Crown) or plain text |
| `frontend/src/pages/SettingsPage.tsx` | 1087 | Rule 1 (Colors) | Tailwind color class `text-purple-400` | Replace with neutral zinc/gray (`text-zinc-400`, `bg-zinc-800`) or primary/teal token |
| `frontend/src/pages/SettingsPage.tsx` | 1087 | Rule 3 (No Emojis) | Emoji symbol(s): 👑 | Replace with corresponding Lucide icon (e.g. CheckCircle, Zap, Shield, Crown) or plain text |
| `frontend/src/pages/SettingsPage.tsx` | 1088 | Rule 3 (No Emojis) | Emoji symbol(s): 🛡 | Replace with corresponding Lucide icon (e.g. CheckCircle, Zap, Shield, Crown) or plain text |
| `frontend/src/pages/SettingsPage.tsx` | 1089 | Rule 3 (No Emojis) | Emoji symbol(s): 💻 | Replace with corresponding Lucide icon (e.g. CheckCircle, Zap, Shield, Crown) or plain text |
| `frontend/src/pages/SettingsPage.tsx` | 1090 | Rule 3 (No Emojis) | Emoji symbol(s): 📊 | Replace with corresponding Lucide icon (e.g. CheckCircle, Zap, Shield, Crown) or plain text |
| `frontend/src/pages/SettingsPage.tsx` | 1091 | Rule 3 (No Emojis) | Emoji symbol(s): 👁 | Replace with corresponding Lucide icon (e.g. CheckCircle, Zap, Shield, Crown) or plain text |
| `frontend/src/pages/SettingsPage.tsx` | 1138 | Rule 3 (No Emojis) | Emoji symbol(s): ✕ | Replace with corresponding Lucide icon (e.g. CheckCircle, Zap, Shield, Crown) or plain text |
| `frontend/src/pages/SettingsPage.tsx` | 1175 | Rule 3 (No Emojis) | Emoji symbol(s): 👑 | Replace with corresponding Lucide icon (e.g. CheckCircle, Zap, Shield, Crown) or plain text |
| `frontend/src/pages/SettingsPage.tsx` | 1176 | Rule 3 (No Emojis) | Emoji symbol(s): 🛡 | Replace with corresponding Lucide icon (e.g. CheckCircle, Zap, Shield, Crown) or plain text |
| `frontend/src/pages/SettingsPage.tsx` | 1177 | Rule 3 (No Emojis) | Emoji symbol(s): 💻 | Replace with corresponding Lucide icon (e.g. CheckCircle, Zap, Shield, Crown) or plain text |
| `frontend/src/pages/SettingsPage.tsx` | 1178 | Rule 3 (No Emojis) | Emoji symbol(s): 📊 | Replace with corresponding Lucide icon (e.g. CheckCircle, Zap, Shield, Crown) or plain text |
| `frontend/src/pages/SettingsPage.tsx` | 1179 | Rule 3 (No Emojis) | Emoji symbol(s): 👁 | Replace with corresponding Lucide icon (e.g. CheckCircle, Zap, Shield, Crown) or plain text |
| `frontend/src/pages/SettingsPage.tsx` | 1246 | Rule 6 & 7 (Fake Stats/Live) | Hardcoded live status / fake compliance label `SOC-2` | Replace with real health API telemetry check or remove unverified claim |
| `frontend/src/pages/SettingsPage.tsx` | 1251 | Rule 6 & 7 (Fake Stats/Live) | Hardcoded live status / fake compliance label `SOC-2` | Replace with real health API telemetry check or remove unverified claim |
| `frontend/src/pages/SettingsPage.tsx` | 1311 | Rule 1 (Colors) | Tailwind color class `text-purple-400` | Replace with neutral zinc/gray (`text-zinc-400`, `bg-zinc-800`) or primary/teal token |
| `frontend/src/pages/SettingsPage.tsx` | 1312 | Rule 1 (Colors) | Tailwind color class `bg-purple-500` | Replace with neutral zinc/gray (`text-zinc-400`, `bg-zinc-800`) or primary/teal token |
| `frontend/src/pages/SettingsPage.tsx` | 1520 | Rule 6 & 7 (Fake Stats/Live) | Hardcoded live status / fake compliance label `SOC-2` | Replace with real health API telemetry check or remove unverified claim |
| `frontend/src/pages/SettingsPage.tsx` | 1584 | Rule 1 (Colors) | Tailwind color class `text-purple-400` | Replace with neutral zinc/gray (`text-zinc-400`, `bg-zinc-800`) or primary/teal token |
| `frontend/src/pages/VerifyEmailPage.tsx` | 60 | Rule 2 (Radius) | Pill-shaped `rounded-full` on button/badge/tab/chip | Change to `rounded` or `rounded-md` (enforce 6px max 8px radius) |
| `frontend/src/store/useBillingStore.ts` | 97 | Rule 10 (Placeholders) | Placeholder identity/email `My Startup` | Use authenticated user name/email or dynamic workspace title |
| `vercel.json` | 5 | Gate A (Custom Domain) | Missing host redirect from `*.vercel.app` to primary custom domain | Add redirects block forcing canonical host domain over HTTPS |
| `vercel.json` | 23 | Gate C (Metadata / Branding) | Vercel toolbar/feedback overlay not explicitly disabled for production | Add header/configuration to disable Vercel toolbar injection in production |

---

## 3. Implementation Plan by Phase

### Phase 2: Visual System Cleanup
- **Purge Purple/Indigo**: Replace all 93 instances of `#7c3aed`, `#8b5cf6`, `text-indigo-400`, `bg-purple-500`, etc. with Graphite palette tokens (`#71717A`, `#27272A`, `#18181B`) and Ice Teal (`#5EEAD4` / `var(--accent)`).
- **Flatten Gradients**: Remove 6 non-approved gradients (e.g. `bg-gradient-to-r`, `text-transparent bg-clip-text`) from tabs, headings, and buttons.
- **Normalize Border Radius**: Strip `rounded-full` from buttons, badges, chips, and tabs across 33 components, standardizing on `rounded` (6px) or `rounded-md` (8px). Preserve circular radius strictly on avatars and status indicator dots.
- **Eliminate Emojis**: Replace 67 emojis (`👋`, `🕸️`, `📝`, `⚡`, `📊`, `👑`, `🛡️`, `✓`, `🏆`) with crisp Lucide icons at standard 16px/14px stroke.
- **Static Abstract Media**: Refactor `BackgroundMedia.tsx` to remove dynamic canvas particle networks (`requestAnimationFrame`) and scroll-event listeners (`window.scrollY`). Replace with a static abstract SVG grid pattern overlaid with neutral gradient scrim.

### Phase 3: Copy, Content & Voice
- **Voice Guide (`docs/VOICE.md`)**: Establish a plain, active-voice, hype-free product voice guide.
- **Punctuation Cleanliness**: Eliminate all em dashes (`—`) and en dashes (`–`) across 19 user-visible locations in `index.html`, `CommandPalette.tsx`, `SettingsPage.tsx`, etc., converting to periods, colons, or parentheses.
- **Landing Page Overhaul**: Restructure `LandingPage.tsx` per launch requirements:
  - Clear one-sentence hero value statement and primary call-to-action.
  - Three concrete capability sections with actual product screenshot mockups.
  - SVG architecture flow diagram.
  - Production open-source tech stack.
  - Honest FAQ addressing current self-hosted and cloud boundaries.
  - Remove fake pricing tiers, fake 99.99% uptime guarantees, fake customer logos, and testimonials.
- **Real Identity & Telemetry**: Remove mock placeholders ('Acme Corp', 'My Startup', fake user emails) from `Navbar.tsx`, `CommandPalette.tsx`, and `PromptStudioPage.tsx`. Wire `SystemHealthPopover.tsx` to live `/healthz` API endpoint.

### Phase 4: Domain, Favicons & Metadata (Gates A - C)
- **Custom Domain Integration (Gate A)**: Read `PUBLIC_SITE_URL` from environment configuration; inject into canonical links, `sitemap.xml`, and `robots.txt`. Add `vercel.json` redirect rule for canonical domain host.
- **Full Favicon Suite (Gate B)**: Generate `favicon.svg` (adaptive light/dark scheme), multi-size `favicon.ico`, `apple-touch-icon.png` (180x180), `icon-192.png`, `icon-512.png`, and `site.webmanifest` in `frontend/public/`.
- **SEO & Social Cards (Gate C)**: Generate crisp typographic Open Graph image `og-image.png` (1200x630). Add Open Graph and Twitter Card tags in `index.html`. Disable Vercel toolbar injection in production.
- **Custom Error Handlers**: Wire `/404` and `/500` error route components with retry actions.

### Phase 5: Legal Pages (Gate D)
- **Privacy Policy (`/privacy`)**: Draft exhaustive, GDPR and India DPDP Act 2023 compliant policy covering data collection, third-party model processors (OpenAI, Anthropic, Google), vector stores (Qdrant, Neo4j), retention, and export.
- **Terms of Service (`/terms`)**: Draft commercial terms addressing AI output disclaimers, Bring-Your-Own-Key (BYOK) responsibility, acceptable use, and limitation of liability.
- **Placeholders**: Use `[[FILL_ME]]` strictly for legal entity name, jurisdiction, and official contact email, cataloged in `MANUAL_ACTIONS.md`.
- **Form Consent**: Link legal pages in footer, login/signup forms, and OAuth dialogs.

### Phase 6: Automated Launch Guard
- Create `scripts/launch-check.mjs` verifying zero purple/indigo colors, zero rounded-full on controls, zero emojis, zero em/en dashes, zero banned buzzwords, valid favicons, and legal routes.
- Add `npm run launch:check` script in `frontend/package.json`.
- Add launch guard check to CI workflow (`.github/workflows/ci.yml`).

### Phase 7 & 8: Verification & Launch Checklist
- Validate accessibility (WCAG AA contrast, keyboard navigation, visible focus).
- Verify desktop (1280px) and mobile (375px) responsive layouts in the browser.
- Produce `LAUNCH_CHECKLIST.md` with Pass/Fail evidence.