#!/usr/bin/env node

/**
 * add-changelog.mjs — Prepend a new entry to src/data/changelog.js.
 *
 * Usage:
 *   node scripts/add-changelog.mjs "Title Here" "Description here."
 *   node scripts/add-changelog.mjs --title "Title" --desc "Description" [--date 2026-08-22] [--author "Dev"]
 *
 * npm script shortcut (after adding to package.json):
 *   npm run changelog -- "Title Here" "Description here."
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CHANGELOG_PATH = resolve(__dirname, '..', 'src', 'data', 'changelog.js');
const ENV_LOCAL_PATH = resolve(__dirname, '..', '.env.local');

// Load .env.local if it exists
try {
  const envContent = readFileSync(ENV_LOCAL_PATH, 'utf-8');
  envContent.split('\n').forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      // Remove surrounding quotes if present
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  });
} catch (err) {
  // Ignore if file doesn't exist
}

// Default author config
const DEFAULT_AUTHOR = 'Dev';
const DEFAULT_AVATAR =
  'https://api.dicebear.com/9.x/initials/svg?seed=AA&radius=50&backgroundColor=F4B942&textColor=000000';

function printHelp() {
  console.log(`
Usage:
  node scripts/add-changelog.mjs "Title" "Description"
  node scripts/add-changelog.mjs --title "Title" --desc "Description" [--date YYYY-MM-DD] [--author "Name"]

Auto-Generate with AI (Requires GEMINI_API_KEY env variable):
  node scripts/add-changelog.mjs --ai
  
  (Or just set the key and run the script without title/desc, it will fallback to AI automatically)
`);
}

async function generateWithAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('[Error] GEMINI_API_KEY environment variable is missing.');
    console.error('To use AI generation, get a free key from Google AI Studio and put it in .env.local');
    process.exit(1);
  }

  console.log('Fetching git changes...');
  let diff = '';
  try {
    // Try to get uncommitted changes first
    diff = execSync('git diff HEAD').toString().trim();
    if (!diff) {
      // Fallback to the latest commit if working tree is clean
      diff = execSync('git diff HEAD~1 HEAD').toString().trim();
    }
  } catch (err) {
    console.error('[Error] Failed to read git diff. Are you in a git repository with commits?');
    process.exit(1);
  }

  if (!diff) {
    console.error('[Error] No git changes found to generate a changelog for.');
    process.exit(1);
  }

  console.log('Asking Gemini AI to draft the changelog...');
  const prompt = `You are a technical writer writing a product changelog. Analyze this git diff and write a short, user-friendly changelog entry. 
The title should be a catchy, concise summary of the main feature or fix. 
The description should be 1-2 sentences explaining what changed and how it benefits the user (avoid overly technical code details).
Return ONLY a valid JSON object with exactly two keys: "title" and "desc". No markdown formatting or backticks around the JSON.

Git diff:
${diff.substring(0, 10000)} // Truncating just in case it's massive
`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.7
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API responded with status: ${response.status}\nResponse: ${errorText}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) throw new Error('No text returned from Gemini');

    const result = JSON.parse(text);
    return { title: result.title, desc: result.desc };
  } catch (err) {
    console.error('[Error] AI Generation failed:', err.message);
    process.exit(1);
  }
}

async function parseArgs(argv) {
  const args = argv.slice(2);
  let title = '';
  let desc = '';
  let date = new Date().toISOString().slice(0, 10);
  let author = DEFAULT_AUTHOR;
  let forceAi = false;

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--title':
      case '-t': title = args[++i] || ''; break;
      case '--desc':
      case '-d': desc = args[++i] || ''; break;
      case '--date': date = args[++i] || date; break;
      case '--author':
      case '-a': author = args[++i] || author; break;
      case '--ai': forceAi = true; break;
      case '--help':
      case '-h':
        printHelp();
        process.exit(0);
        break;
      default:
        if (!title) title = args[i];
        else if (!desc) desc = args[i];
        break;
    }
  }

  // Fallback to AI if requested or if title/desc are missing
  if (forceAi || (!title && process.env.GEMINI_API_KEY)) {
    const generated = await generateWithAI();
    title = generated.title;
    desc = generated.desc;
  } else if (!title) {
    console.error('[Error] Title and description are required. (Provide GEMINI_API_KEY to auto-generate)');
    printHelp();
    process.exit(1);
  }

  return { title, desc, date, author };
}

function buildEntry({ title, desc, date, author }) {
  const esc = (s) => (s || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  return [
    '  {',
    `    date: '${esc(date)}',`,
    `    title: '${esc(title)}',`,
    '    description:',
    `      '${esc(desc)}',`,
    '    author: {',
    `      name: '${esc(author)}',`,
    `      avatarUrl: '${DEFAULT_AVATAR}',`,
    '    },',
    '  }',
  ].join('\n');
}

async function run() {
  const { title, desc, date, author } = await parseArgs(process.argv);
  const entry = buildEntry({ title, desc, date, author });

  const src = readFileSync(CHANGELOG_PATH, 'utf-8');
  const openBracket = src.indexOf('[');
  
  if (openBracket === -1) {
    console.error('[Error] Could not find the changelog array in', CHANGELOG_PATH);
    process.exit(1);
  }

  const before = src.slice(0, openBracket + 1);
  const after = src.slice(openBracket + 1);
  const updated = `${before}\n${entry},${after}`;

  writeFileSync(CHANGELOG_PATH, updated, 'utf-8');

  console.log(`Changelog entry added!`);
  console.log(`  Date:        ${date}`);
  console.log(`  Title:       ${title}`);
  console.log(`  Description: ${desc}`);
}

run();
