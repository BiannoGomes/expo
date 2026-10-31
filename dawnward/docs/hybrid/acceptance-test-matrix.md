# Acceptance test matrix: first slice (Soul · Communication)

**Types:** U = server unit, I = server integration (real Postgres), B = browser end to end (Playwright), A = axe, M = manual or device.

| # | Requirement | Type | Pass condition |
|---|---|---|---|
| 1 | The catalog is valid at startup | U | All three missions parse. Option ids are unique. Every mission has a completion state. |
| 2 | Beginning twice resumes | I | The second `POST /attempts` returns the same attempt id |
| 3 | A step can't be skipped | I | Completing with a required step unanswered returns 409 |
| 4 | A stale step write is refused | I | Writing step 2 when the server is at step 3 returns 409 with the current state |
| 5 | Replays are harmless | I | The same `requestKey` twice gives one answer record and one event |
| 6 | Completion emits one event | I | Completing twice gives one `mission_completed` and one star |
| 7 | The system unlock is correct | U, I | After all 3 missions: one moon. After 2: no moon. |
| 8 | Crisis stops the mission | I | A crisis phrase in a rehearse step gives the crisis text; the attempt is paused; the answer is not stored as evidence |
| 9 | Unsafe plans are refused gently | U | Unsafe pattern list gives 422 with a supportive message |
| 10 | Users are isolated | I | User B gets 404 on user A's attempt, experiment and discoveries |
| 11 | Export includes everything | I | Every new table appears |
| 12 | Delete removes everything | I | Zero rows after deleting the account |
| 13 | Pause sends nothing to the model | I | Paused: no model call; template text used |
| 14 | The AI can't invent ids | U | Mock output with an unknown `missionId` is rejected; the fallback is shown |
| 15 | Three taps to a mission | B | Explore, a mission, Begin: the first step is shown |
| 16 | Reflect stays two taps | B | From any place: Reflect, then typing works |
| 17 | Save before advance | B | With the network failing, the step stays and the words are kept; retry works |
| 18 | Resume after reload | B | Reloading mid-mission returns to the same step, with the draft |
| 19 | The discovery appears | B | After the close step, a new star shows, with its "why" in the journey log |
| 20 | No game layer | B | Toggle off: no animations or discoveries shown; data is intact; toggling on restores it |
| 21 | Text view complete | B | The whole slice can be done in text view without WebGL |
| 22 | Reduced motion | B | No camera flight; transitions under 100 ms |
| 23 | Accessibility | A | 0 axe violations: Explore, quest steps, close, journey log |
| 24 | Nothing overlaps | B | At the seven directive viewports |
| 25 | No forbidden patterns | B | No "streak", "score", "rank" or countdown text anywhere (grep plus page text) |
| 26 | Real devices | M | iPhone and mid-range Android: frame times, VoiceOver and TalkBack through the slice (D6) |
