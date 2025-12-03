# Lunar Waves 🌑🌊

**Focus & Chill Ambient Tool**

Lunar Waves is a web application designed to help you enter a state of deep flow. It combines visual ambiance, auditory masking (Brown Noise), and structured time management (Pomodoro), augmented by Google's Gemini AI for task strategy.

## ✨ Features

- **Ambient Visualizer**: A soothing, canvas-based wave animation that reacts to the audio state.
- **Brown Noise Generator**: Integrated Web Audio API implementation of Brown Noise with a low-pass filter to mask distractions.
- **Pomodoro Timer**: Customizable Focus (25m) and Break (5m) intervals.
- **AI Focus Strategy**: Uses the Gemini API to break down complex tasks into 3 actionable steps.
- **Glassmorphism UI**: A modern, dark-themed interface built with Tailwind CSS.

## 🚀 Getting Started

### Prerequisites

You need a Google Gemini API Key to use the "Smart Focus" feature.

### Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/your-username/lunar-waves.git
   ```

2. Create a `.env` file in the root (if using a build system) or ensure your environment injects `process.env.API_KEY`.

3. Serve the application. Since this project uses ES Modules and CDNs via `importmap`, you can run it using any static file server.
   
   Example with `serve`:
   ```bash
   npx serve .
   ```
   Or simply open with the "Live Server" extension in VS Code.

## 🛠️ Tech Stack

- **Core**: React 19, TypeScript
- **Styling**: Tailwind CSS
- **AI**: Google GenAI SDK (`@google/genai`)
- **Icons**: Lucide React, Google Fonts (Space Mono)
- **Audio**: Native Web Audio API

## 📄 License

MIT
