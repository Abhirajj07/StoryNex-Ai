# StoryNex AI 🎬📖
### AI-Powered Comic Script & Dialogue Generator

**StoryNex AI** transforms raw story ideas into structured, panel-by-panel comic scripts with character-consistent dialogue, speech-style delivery cues, and model-agnostic image prompts ready for any generative image engine (Midjourney, DALL·E 3, Nano Banana, Stable Diffusion, etc.).

---

## 🌟 Key Features

- **🪄 Story-Aware Auto Character Extraction**: Automatically parses your premise to discover characters, assigning visual descriptions, personality traits, speech styles, vocabulary tiers, and relationship dynamics.
- **✨ AI Story Refinement**: 1-click narrative enhancer that tightens visual pacing, escalates tension, and sharpens comic panel beats.
- **🎭 Persistent Character Voice**: Multi-turn voice profiles ensure characters maintain their distinct speech patterns, emotional quirks, and interpersonal dynamics throughout the entire story.
- **💬 10 Comic Delivery Styles**: Visual speech bubbles with custom delivery indicators (Shout, Whisper, Thought Cloud, Sarcastic, Muttered, Cold, Trembling, Excited, Narration).
- **🔄 Surgical Single-Panel Regeneration**: Re-roll scene beats, dialogue lines, or both on any individual panel while preserving surrounding context continuity.
- **🎨 Model-Agnostic Image Prompts**: Clean, copy-paste-ready descriptive prompts tailored for any image model.
- **📁 Multi-Format Export**: One-click export to Screenplay Markdown (`.md`), Structured JSON (`.json`), or Batch Image Prompts (`.txt`).
- **⚡ Dual Engine (Live AI + Instant Offline Demo)**: Works out of the box with an intelligent offline simulation engine, and connects seamlessly to Groq API (`llama-3.3-70b-versatile`, `llama-3.1-8b-instant`, etc.) for real LLM inference.
- **💾 LocalStorage Persistence**: Automatically persists all projects, characters, and panels locally.

---

## 🚀 Quick Start

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/Abhirajj07/StoryNex-Ai.git
cd StoryNex-Ai
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Production Build
```bash
npm run build
```

---

## ☁️ Deploy to Vercel

### Method 1: Vercel CLI
```bash
npm i -g vercel
vercel
```

### Method 2: Vercel Web Dashboard
1. Go to [vercel.com/new](https://vercel.com/new).
2. Connect your GitHub account and select the **`StoryNex-Ai`** repository.
3. Keep default settings (Framework: **Vite**, Root Directory: `./`, Output Directory: `dist`).
4. Click **Deploy**!

---

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript + Vite 8
- **Icons**: Lucide React
- **Styling**: Vanilla CSS Design System with Glassmorphism & Comic Aesthetics
- **LLM Provider**: Groq API (OpenAI-compatible) + Intelligent Offline Simulation Engine
- **Deployment**: Vercel

---

## 📄 License
MIT License. Created for creators, comic artists, writers, and storytellers.
