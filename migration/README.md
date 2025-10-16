
# Migration: Employee Review App (Next.js)

This project migrates the static CEO Review app to a modern, scalable Next.js (React) platform with Firebase integration.

## Features
- Next.js (React, TypeScript, Tailwind, ESLint)
- Firebase Auth & Firestore integration
- Modular folder structure: pages, components, utils, styles
- Static export ready for Firebase Hosting

## Getting Started
1. Install dependencies:
	```bash
	npm install
	```
2. Add your Firebase config to `.env.local` (see example in repo).
3. Run the development server:
	```bash
	npm run dev
	```
4. Open [http://localhost:3000](http://localhost:3000)

## Example: Firestore Integration
- See `src/app/page.tsx` for fetching reviews from Firestore
- See `src/components/ReviewCard.tsx` for displaying review details

## Migration Steps
1. Scaffold Next.js project (done)
2. Set up Firebase integration (done)
3. Add modular folder structure (done)
4. Integrate Firestore and Auth into app logic
5. Migrate legacy data and UI components
6. Test and deploy to Firebase Hosting

## Folder Structure
- `src/app/` — App pages
- `src/components/` — Reusable UI components
- `src/firebase/` — Firebase config
- `src/utils/` — Utility functions
- `src/styles/` — Global and component styles

## Environment Variables
See `.env.local` for required Firebase config keys.

## License
MIT
