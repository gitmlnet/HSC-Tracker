# Deployment notes

## GitHub Pages (pending — not live yet)

The repository already has `.github/workflows/deploy.yml`, which builds `dist/` and publishes it with `actions/deploy-pages@v4`.

One repository setting is required and cannot be changed by the connected GitHub token:

1. Open **https://github.com/gitmlnet/HSC-Tracker/settings/pages**
2. Under **Build and deployment → Source**, choose **GitHub Actions**.
3. Save.

After that, the workflow can be run from this branch:

```bash
gh workflow run deploy.yml --ref arena/06ece2f2-hsc-tracker
gh run list --workflow "Deploy to GitHub Pages" --limit 3
```

The published URL will be:

`https://gitmlnet.github.io/HSC-Tracker/`

The build is subpath-safe: `vite.config.ts` uses `base: "./"`, `index.html` uses relative manifest/icon links, and the service worker derives its scope from its own URL. Verified locally by serving `dist/` at `/HSC-Tracker/` — index, manifest, service worker, icons and hashed assets all returned 200 with correct content types.

Note: there is a separate older Pages site at `https://gitmlnet.github.io/daily/`. This project should use its own `HSC-Tracker` Pages site so both can coexist.

## Live deployment (Vercel)

Vercel project `hsc-study-planner` is connected to this GitHub repository and deployed the branch manually:

`https://hsc-study-planner-nine.vercel.app`

Always use the stable project alias above (`hsc-study-planner-nine.vercel.app`). Vercel's per-deployment URLs such as `hsc-study-planner-xxxx.vercel-be18.vercel.app` are protected by this team's SSO policy and redirect to a Vercel login page; that is why a deployment link can look blank while the alias works.

If the alias ever shows a sign-in wall, use GitHub Pages instead. Automatic git-push deployments are currently disabled on that Vercel project, so publish a new deployment there after code changes if needed.
