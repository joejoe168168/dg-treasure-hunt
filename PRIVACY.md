# Privacy and leaderboard data

DG Treasure Hunt is designed to work locally without an account.

## Data stored on the player's device

- Player-entered display name and local top scores.
- Game settings, including audio, camera, language, quality and online-score preference.
- Tutorial completion.
- Recent question IDs and correct/incorrect totals by broad learning topic.

This data remains in the browser's local storage. Clearing site data removes it.

## Optional online leaderboard

Online leaderboard use can be turned off in Pause & Settings. When it is off, no score submission or leaderboard download is attempted.

When enabled, a completed or auto-saved run sends:

- The player-selected display name.
- Score, elapsed time and selected difficulty.
- The server adds the calendar date.

The game does not request an email address, school identifier, precise location, camera, microphone or advertising identifier. Players should use a nickname rather than a full legal name.

The public leaderboard keeps up to 50 best entries. An entry may remain until replaced or removed by the deployment administrator. The deployment owner can delete the `leaderboard.json` object in the configured Vercel Blob store. A self-service deletion endpoint is not yet implemented.

## Safeguards

- Display names are normalized and limited to 14 characters.
- Score, elapsed time and difficulty are validated server-side.
- Remote leaderboard fields are rendered as text, not HTML.
- Cross-origin score submission is not enabled.

## School deployment note

Before a public school deployment, the school or deployment owner should provide its contact details, retention period and deletion-request procedure here.
