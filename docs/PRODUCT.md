# RL Stats Companion — Product Requirements

## Problem Statement

Rocket League players want to track their performance, analyze trends, and improve their game. After Psyonix disabled BakkesMod for online play with the EAC update, players lost access to their primary stats tracking tool. The new official Stats API provides live match data, but there's no official app to consume it. Players need a reliable, local, privacy-respecting way to:

1. See live match stats in real-time
2. Build a personal match history
3. Analyze performance trends over time
4. Understand their gameplay patterns without relying on external services

## Target Users

- **Primary**: Rocket League players on Windows (Competitive/Casual, any rank)
- **Secondary**: Content creators who want match data for overlays or analysis
- **Tertiary**: Coaches/analysts who review player performance

## User Stories

### Live Match
- "When I enter a match, I want to see my teammates' and opponents' current stats so I can adapt my playstyle"
- "During the match, I want to see the score, time, and key events as they happen"
- "After a goal, I want to know who scored, how fast, and who assisted"

### History
- "After playing, I want to see a list of all my matches with basic stats"
- "I want to filter my history by date, result, or game mode"
- "I want to search for matches against specific players"

### Match Detail
- "I want to see a timeline of how the match progressed"
- "I want to compare my stats with other players in that match"
- "I want to see every goal with details like speed and impact location"

### Analytics
- "I want to know if I'm improving over the week"
- "I want to see my win rate and average stats"
- "I want to know my best streaks and peak performances"
- "I want to see when I play best (time of day patterns)"

### General
- "I want the app to start automatically when I open my PC"
- "I want my data to stay on my computer, not sent anywhere"
- "I want to be able to export my data if needed"
- "I want the app to update itself when there's a new version"

## Features by Version

### V0.1 — Technical Prototype
- [ ] TCP connection to RL Stats API
- [ ] Event parsing (all known event types)
- [ ] Console output of events
- [ ] SQLite schema and basic persistence
- [ ] Save matches and events
- [ ] Replay test with captured data

### V0.2 — Alpha
- [ ] Tauri shell with React frontend
- [ ] Live match dashboard (basic)
- [ ] Match history list
- [ ] Basic match detail view
- [ ] Settings panel
- [ ] Error handling and logs

### V0.3 — Beta
- [ ] Match detail with timeline
- [ ] Player comparison
- [ ] Basic analytics (day/session)
- [ ] Manual update check
- [ ] Data export
- [ ] Windows installer

### V1.0 — Public Release
- [ ] Auto-updater with one-click
- [ ] Full analytics (day, week, month, session)
- [ ] Performance charts and trends
- [ ] Data import/export
- [ ] Onboarding flow
- [ ] Comprehensive documentation
- [ ] CI/CD pipeline
- [ ] Signed releases

### V1.1
- [ ] Estimated advanced metrics (distance, boost used)
- [ ] Streak tracking
- [ ] Time-of-day performance heatmap
- [ ] Advanced filters in history
- [ ] Performance optimizations

### V1.2
- [ ] Beta channel support
- [ ] Opt-in crash reporting
- [ ] Enhanced data retention controls
- [ ] Keyboard shortcuts
- [ ] Tray icon with quick stats

### V2.0 (Future)
- [ ] Optional cloud sync (encrypted)
- [ ] Rank/MMR integration (external API, opt-in)
- [ ] Replay file analysis
- [ ] Overlay mode (transparent, always-on-top)
- [ ] Multi-language support
- [ ] Plugin system for custom metrics

## Non-Functional Requirements

### Performance
- App startup: < 3 seconds
- Live event latency: < 100ms from game to UI
- History load (100 matches): < 500ms
- Analytics query (30 days): < 1 second

### Reliability
- Handle connection drops gracefully
- Never lose data on crash (WAL + transactions)
- Recover from invalid game data
- Work offline (no internet required)

### Security
- Local-only by default
- No telemetry without explicit opt-in
- Signed updates only
- Data never leaves device unless user exports

### Usability
- One-time setup (Stats API INI config)
- Auto-detect Rocket League install
- Clear error messages in Spanish
- Accessible (keyboard nav, screen reader, reduced motion)

## Success Metrics

- Time to first match captured: < 5 minutes after install
- Daily active users (DAU) / Monthly active users (MAU) ratio: > 30%
- Average sessions per week: > 3
- Update adoption rate (within 7 days): > 70%
- GitHub stars: meaningful community engagement
- Issues response time: < 48 hours for bugs

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| RL Stats API changes/breaks | Medium | High | Graceful degradation, unknown event handling, community alerts |
| EAC flags the app | Low | Critical | Only reads network data, no memory hooks, transparent about behavior |
| Low adoption | Medium | High | Open source, community-driven, solve real pain point |
| Data corruption | Low | High | WAL mode, backups, transactions, data validation |
| Windows-only limits audience | High | Medium | Clear positioning, future cross-platform considered |

## Competitive Landscape

- **BakkesMod**: Feature-rich but disabled online with EAC
- **Tracker Network (rocketleague.tracker.network)**: Web-based, requires manual lookup, no live data
- **RLStats.net**: Similar to Tracker, web-based
- **Community overlays (InGameRank, etc.)**: Single-purpose, not comprehensive
- **RL Stats Companion positioning**: Local-first, comprehensive, privacy-focused, live + historical

## Monetization

**None in V1-V2.** The app is fully open-source and free.

Future considerations (only if sustainable):
- Optional cloud sync subscription (encrypted)
- Donations via GitHub Sponsors
- Merchandise (very future)
