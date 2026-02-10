# Stellium Frontend Development Workflow

## Overview

This document explains the branch structure and development workflow for the Stellium frontend application.

---

## Branch Structure

We use three branches to separate concerns:

### `main` - Production
- **Purpose:** Live production web app
- **Deploys to:** Amplify PROD project
- **API:** Production API (set via `REACT_APP_SERVER_URL` in Amplify)
- **Contains:** Public web app only

### `mainDev` - Development/Staging
- **Purpose:** Feature development and testing
- **Deploys to:** Amplify STAGING project (optional) or run locally
- **API:** Development API (set via `.env` locally or Amplify env vars)
- **Contains:** Public web app with latest features

### `dev` - Admin App
- **Purpose:** Admin functionality for managing users, celebrities, and data
- **Deploys to:** Existing Amplify dev project
- **API:** Both dev and prod APIs (runtime toggle via EnvironmentDropdown)
- **Contains:** Full admin app with:
  - `/admin` route with AdminPage
  - EnvironmentContext for switching between dev/prod APIs
  - User management, celebrity management, relationship management

---

## Development Workflow

### Adding New Features

```
1. Create feature branch from mainDev
   git checkout mainDev
   git checkout -b feature/my-new-feature

2. Develop and test locally
   npm start  (uses REACT_APP_SERVER_URL from .env → dev API)

3. Merge to mainDev
   git checkout mainDev
   git merge feature/my-new-feature

4. Validate on staging (if Amplify staging set up)
   Push to origin/mainDev → Amplify builds staging site

5. Deploy to production
   git checkout main
   git merge mainDev
   git push origin main → Amplify builds production site
```

### Syncing Features to Admin App

When you want the admin app to have the latest web app features:

```
git checkout dev
git merge mainDev
# Resolve any conflicts (keep admin-specific code)
git push origin dev
```

---

## Environment Configuration

### Local Development (.env file)

```
REACT_APP_SERVER_URL=https://your-dev-api.com
REACT_APP_GOOGLE_API_KEY=your-google-key
```

Running `npm start` uses these values.

### Amplify Environment Variables

| Amplify Project | Branch | REACT_APP_SERVER_URL | REACT_APP_SERVER_URL_PROD |
|-----------------|--------|---------------------|--------------------------|
| Production | main | `https://your-prod-api.com` | - |
| Staging | mainDev | `https://your-dev-api.com` | - |
| Admin | dev | `https://your-dev-api.com` | `https://your-prod-api.com` |

The admin app uses both env vars to enable runtime switching between dev and prod data.

---

## Temporary Site Access Protection (Pre-Launch Validation)

Date completed: February 10, 2026

To protect pre-launch testing, branch-level access control was enabled in AWS Amplify Hosting for both public branches:

- `mainDev`: Password protected
- `main`: Password protected

This keeps both environments gated while still using separate environment-specific API endpoints via existing Amplify environment variables.

### Rollout Sequence Used

1. Enabled Amplify access control on `mainDev`
2. Validated password prompt and full app behavior on `mainDev`
3. Enabled Amplify access control on `main`
4. Merged `mainDev -> main`
5. Validated `main` deployment behind password protection

### Launch Toggle (When Ready to Go Public)

1. Go to Amplify Console -> App -> Hosting -> Access control
2. Set `main` branch access from password protected to publicly viewable
3. Save and confirm production URL is publicly reachable

Keep `mainDev` password protected for ongoing internal testing unless intentionally changed.

---

## Which Data Do I See?

The data you see depends on which API URL the app is configured to use:

| API | Data |
|-----|------|
| Dev API | Dev database, test users, test data |
| Prod API | Production database, real users, real data |

- **Local development:** Uses whatever is in your `.env` file
- **Amplify deployments:** Uses the env vars set in each Amplify project
- **Admin app:** Can toggle at runtime using the EnvironmentDropdown

---

## Quick Reference

| Task | Command |
|------|---------|
| Start local dev server | `npm start` |
| Switch to mainDev | `git checkout mainDev` |
| Create feature branch | `git checkout -b feature/name` |
| Deploy to production | Merge mainDev → main, push |
| Sync features to admin | Merge mainDev → dev, push |
| Access admin app | Go to deployed dev URL, navigate to `/admin` |
