# RL Stats — Documentation Index

> Central index for all project documentation.

---

## Quick Start

New to the project? Read in this order:

1. **[PRODUCT.md](./PRODUCT.md)** — What we're building and why
2. **[AGENTS.md](../AGENTS.md)** — How we work (coding standards, conventions, security rules)
3. **[DESIGN.md](./DESIGN.md)** — How it looks (design system, screens, visual specs)
4. **[ARCHITECTURE.md](./ARCHITECTURE.md)** — How it's built (system design, data flow, database schema)

Then dive into implementation:

5. **[IMPLEMENTATION.md](./IMPLEMENTATION.md)** — Development guide (setup, patterns, testing, git workflow)
6. **[FRONTEND_GUIDE.md](./FRONTEND_GUIDE.md)** — Frontend specifics (React, TypeScript, Tauri integration)
7. **[UI_COMPONENTS.md](./UI_COMPONENTS.md)** — Component specs (58 components, icons, animations, Tailwind config)
8. **[USER_FLOWS.md](./USER_FLOWS.md)** — User experience (personas, journeys, wireframes, accessibility)

Reference:

9. **[SECURITY.md](./SECURITY.md)** — Security architecture, privacy policy, threat model
10. **[CHANGELOG.md](./CHANGELOG.md)** — Version history and planned features

---

## Documentation Map

| Document | Purpose | Audience | Lines |
|----------|---------|----------|-------|
| **AGENTS.md** | Agent guide, conventions, build commands | All contributors | ~200 |
| **PRODUCT.md** | Requirements, user stories, roadmap | Product, Devs | ~150 |
| **DESIGN.md** | Design system, screens, visual specs | Designers, Devs | ~400 |
| **ARCHITECTURE.md** | System architecture, data flow, DB schema | Architects, Devs | ~500 |
| **IMPLEMENTATION.md** | Development guide, patterns, testing | Backend Devs | ~1,700 |
| **FRONTEND_GUIDE.md** | React/TS patterns, Tauri integration | Frontend Devs | ~2,900 |
| **UI_COMPONENTS.md** | 58 component specs, icons, animations | UI Devs, Designers | ~2,500 |
| **USER_FLOWS.md** | Personas, journeys, wireframes, edge cases | UX, Product, Devs | ~3,200 |
| **SECURITY.md** | Threat model, privacy policy, security rules | Security, Devs | ~200 |
| **CHANGELOG.md** | Version history | All | ~50 |

**Total: ~12,000 lines of documentation**

---

## Decision Log

Key architectural decisions are recorded in [AGENTS.md](../AGENTS.md) under "Key Decisions (ADRs)".

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-05-02 | Tauri over Electron | Smaller binaries, better security, Rust backend |
| 2026-05-02 | Rust over Go (Wails) | Better parsing, memory safety |
| 2026-05-02 | React + web UI over native Rust UI | Faster dev, better charts, design flexibility |
| 2026-05-02 | SQLite over embedded NoSQL | Structured data, migrations, query flexibility |
| 2026-05-02 | Local-first over cloud | Privacy, zero server costs, works offline |
| 2026-05-02 | No MMR/rank in V1 | API doesn't provide it; external sources risky |
| 2026-05-02 | shadcn/ui primitives | Accessible, customizable, Tailwind-native |

---

## Contributing to Documentation

- All docs are in Markdown
- Spanish for user-facing content, English for technical terms
- Keep docs in sync with code changes
- Update CHANGELOG.md when adding features
- Update AGENTS.md when changing conventions

---

## External Resources

- [Rocket League Stats API Docs](https://www.rocketleague.com/en/developer/stats-api)
- [Tauri Documentation](https://tauri.app/)
- [Tauri Updater Plugin](https://tauri.app/plugin/updater/)
- [Rust Book](https://doc.rust-lang.org/book/)
- [AGENTS.md Spec](https://agents.md/)
- [DESIGN.md Spec](https://stitch.withgoogle.com/docs/design-md/overview)
