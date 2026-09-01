# Movo

**[🚀 View Live Site](https://movo-alpha.vercel.app/)**

Movo is a modern web application designed to solve the friction of discovering and watching media online. It provides a clean, premium alternative to cluttered streaming sites—a seamless, responsive interface where users can easily browse trending movies, track TV show episodes, and instantly launch a full-screen video player.

By integrating directly with TMDB for rich metadata and using a fast React/Tailwind frontend, Movo delivers an app-like cinematic experience right in the browser.

---

## Features

- **Extensive Media Library:** Powered by the TMDB API to fetch thousands of movies and TV shows, complete with cast details, trailers, and similar recommendations.
- **Cinematic Player:** A built-in, mobile-optimized player (powered by CineSrc with VidSrc fallback) that tracks watch progress and supports cross-browser full-screen viewing.
- **TV Show Support:** Dedicated episode and season browsing for binge-watching.
- **AI-Powered Changelogs:** Features a custom internal script (`npm run changelog`) that reads Git commits and automatically writes release notes using the Google Gemini AI.
- **Premium UI:** Dark-mode focused, glassmorphic design built with Tailwind CSS and Shadcn UI components.

---

## Tech Stack

- **Framework:** React 19 + Vite
- **Styling:** Tailwind CSS v4, custom CSS variables, and Shadcn UI
- **Icons:** Tabler Icons & Lucide React
- **Data/Backend:** TMDB API (Data) + Supabase (Database/Auth)
- **Tools:** Node.js (for automation scripts), ESLint

---

## Setup Pipeline

Follow these steps to get the project running on your local machine:

### 1. Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### 2. Clone and Install
Clone the repository and install the dependencies:
```bash
git clone https://github.com/aglcode/movo.git
cd movie_site
npm install
```

### 3. Environment Variables
Create a `.env.local` file in the root of your project and configure your API keys. You will need:
```env
# Required for the AI changelog generator script
GEMINI_API_KEY="your_google_gemini_api_key_here"

# (Add your TMDB / Supabase keys here if required by the app)
```

### 4. Run the Development Server
Start Vite's local development server:
```bash
npm run dev
```
Your app will now be running on `http://localhost:5173`.

---

## Available Scripts

- `npm run dev`: Starts the local development server.
- `npm run build`: Bundles the app into static files for production.
- `npm run preview`: Boot up a local web server to preview your production build.
- `npm run lint`: Runs ESLint to catch syntax and style errors.
- `npm run changelog`: Automatically generates a changelog entry from your uncommitted Git changes using the Gemini AI API, and adds it to `src/data/changelog.js`.

---

> **Note on the Video Player:** The embedded player uses third-party providers. If controls are unresponsive on mobile, ensure you are testing on an actual touch device, as the app includes specialized logic to hide overlays and allow native browser video controls to take over.
