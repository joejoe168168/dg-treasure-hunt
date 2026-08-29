# Release and rollback guide

## Release checks

1. Install with `npm ci` using Node.js 20 or newer.
2. Run `npm run check` and `npm run build`.
3. Run `npm run test:functional`, `npm run test:visual`, `npm run test:chests` and `npm run test:performance`.
4. Test V1 at `/` on desktop and mobile in morning and night modes.
5. Verify the deployment environment has the intended Vercel Blob token, or confirm local-only leaderboard fallback.
6. Review `PRIVACY.md` and replace the deployment-owner placeholder information.
7. Record known limitations in `CHANGELOG.md`.

## Staging

Deploy the production build to a non-public preview URL first. Do not reuse the production leaderboard store for destructive tests. Complete one three-chest Quick Hunt and one full sixteen-chest automated playthrough before promotion.

## Rollback

1. Identify the last approved Git tag or deployment.
2. Redeploy that immutable revision through the hosting provider.
3. Do not overwrite or delete `leaderboard.json` during an application rollback.
4. Verify `/`, `/v2/` and `/api/leaderboard` independently.
5. Record the reason and affected release in `CHANGELOG.md`.

Creating a release commit or tag remains a user-approved action; the development agent must not create one automatically.
