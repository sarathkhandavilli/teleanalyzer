# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is currently not compatible with SWC. See [this issue](https://github.com/vitejs/vite-plugin-react/issues/428) for tracking the progress.

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Deploying to Netlify via GitHub

These steps will guide you to push this repository to GitHub and connect it to Netlify for automatic deployments.

1. Create a new GitHub repository (do not initialize with README/license). Note the repository URL (e.g. https://github.com/<you>/<repo>.git).

2. From your project folder open PowerShell and run:

```powershell
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```

3. In Netlify (https://app.netlify.com):
	- Click "Add new site" → "Import from Git".
	- Connect your GitHub account and select the repository.
	- For "Build command" enter: `npm run build`
	- For "Publish directory" enter: `dist`
	- Click "Deploy site". Netlify will build and publish automatically on pushes to `main`.

4. Environment variables: set any API keys or runtime variables in Netlify site settings → Build & deploy → Environment.

Notes:
- This repo uses Vite; the production build outputs to `dist` which Netlify serves.
- We include a `netlify.toml` with the build command and publish directory so Netlify auto-detects settings.
