# GitHub Dashboard

A web app that shows my GitHub profile, language breakdown, and repositories using live data from the GitHub API.

**Live demo:** https://github-dashboard-brown.vercel.app

## Features
- Fetches profile data from the GitHub REST API
- Language breakdown across all public repos, shown as percentage bars
- Repository list with links and main language
- Error handling for API failures and rate limits
- Dark theme, deployed on Vercel

## Built with
React, Vite, JavaScript, CSS, GitHub REST API

## Run it locally
1. Clone the repo
2. Run `npm install`
3. Run `npm run dev`
4. Open http://localhost:5173

## What I learned
- Fetching and combining data from multiple API endpoints with `fetch` and `Promise.all`
- Managing state with React hooks (`useState`, `useEffect`)
- Handling API errors and GitHub's unauthenticated rate limit
- Deploying a Vite app to Vercel from GitHubgit