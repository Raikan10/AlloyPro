# AlloyPro: Industrial AI Copilot 🛠️⚡

AlloyPro is a next-generation industrial-grade AI assistant designed for field engineers and manufacturing environments. It combines high-performance voice and vision AI with an Augmented Reality (AR) HUD to provide real-time guidance, technical documentation access, and automated reporting.

Built with **Gemini Live API** and **LiveKit**, AlloyPro offers a seamless "eyes-on, hands-free" experience for complex technical workflows.

---

## 🚀 Key Features

- **Multimodal AR HUD**: A technical "Heads-Up Display" (HUD) overlay that identifies parts, provides step-by-step procedures, and visualizes system status.
- **Voice-First Interaction**: Real-time conversation with an AI agent that understands technical context and engineering terminology.
- **Computer Vision**: Live video analysis to identify machinery parts (Part ID), detect anomalies, and verify completed steps.
- **Industrial Workflows**: Pre-configured states for:
  - **Idle**: System standby and monitoring.
  - **Part ID**: Real-time identification of components.
  - **Procedure**: Guided execution of maintenance tasks.
  - **Reporting**: Automated generation of technical service reports.
- **Hands-Free Operation**: Optimized for mobile and field use with voice-controlled camera toggles and cockpit controls.

---

## 🏗️ Architecture

AlloyPro is composed of three main components:

1.  **Agent (`/agent`)**: A Python-based LiveKit Agent powered by the Gemini Live API for real-time multimodal reasoning.
2.  **Frontend (`/frontend`)**: A Next.js 15 application featuring the AlloyPro HUD, AR Viewport, and Cockpit controls.
3.  **AlloyPro V1 (`/alloyprov1`)**: A specialized Vite/React prototype focusing on the core HUD experience.

---

## 🛠️ Tech Stack

- **AI**: Google Gemini Live API (Multimodal)
- **Real-time**: LiveKit Agents & SDKs
- **Frontend**: Next.js 15, React, Tailwind CSS, Radix UI, Framer Motion
- **Agent**: Python, `livekit-agents`
- **Design**: Industrial-themed "Cockpit" UI with AR-inspired components

---

## 🏁 Getting Started

### Prerequisites

- **Python 3.10+** (for the Agent)
- **Node.js 18+** & **pnpm** (for the Frontend)
- **LiveKit Cloud Account**: [Sign up for free](https://cloud.livekit.io/)
- **Google AI Studio API Key**: [Get a Gemini API Key](https://aistudio.google.com/)

### 1. Set up the Agent

```bash
cd agent
uv sync
cp .env.example .env.local
# Add your LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET, and GOOGLE_API_KEY
```

Run the agent:
```bash
uv run agent.py dev
```

### 2. Set up the Frontend

```bash
cd frontend
pnpm install
cp .env.example .env.local
# Add your LiveKit credentials
```

Run the frontend:
```bash
pnpm dev
```

### 3. Usage

1. Open `http://localhost:3000` in your browser.
2. Grant camera and microphone permissions.
3. Click "Start Session" to connect to the AlloyPro AI Copilot.
4. Use the "Cockpit" controls or voice commands to navigate between Part ID, Procedure, and Reporting modes.

---

## 🔧 Customization

- **Agent Persona**: Modify `agent/agent.py` to adjust the AI's technical expertise and personality.
- **HUD Components**: Customize the AR interface in `frontend/components/alloypro/`.
- **System Theme**: Adjust colors and industrial atoms in `frontend/components/alloypro/IndustrialAtoms.tsx`.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ by the AlloyPro team using [LiveKit](https://livekit.io) and [Gemini](https://deepmind.google/technologies/gemini/).
