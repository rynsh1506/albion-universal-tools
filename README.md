<div align="center">
  
  <h1>👑 Avalonian Tools</h1>
  <p><strong>The Ultimate Companion App for Albion Online.</strong></p>

  <p>
    <a href="https://github.com/rynsh1506/avalonian-tools/releases">
      <img src="https://img.shields.io/github/v/release/rynsh1506/avalonian-tools?style=for-the-badge&color=ffd700&label=Latest%20Release" alt="Release">
    </a>
    <img src="https://img.shields.io/badge/Platform-Windows%20%7C%20Linux-2ea44f?style=for-the-badge" alt="Platforms">
    <img src="https://img.shields.io/badge/Framework-Tauri%20v2-ffc131?style=for-the-badge&logo=tauri&logoColor=white" alt="Tauri">
    <img src="https://img.shields.io/badge/UI-React%20%7C%20Tailwind-61dafb?style=for-the-badge&logo=react&logoColor=black" alt="React">
  </p>

  <p>
    <i>Formerly <b>Crafting Master Pro</b>, now reborn with a sleek, modern UI using Tauri and React, while keeping its powerful core engine.</i>
  </p>
</div>

---

## ✨ Features (v1.0.0 - The Rebirth)

- **⚡ Blazing Fast Local DB**: Powered by Rust & SQLite. Item searches and filtering are instant, with zero lag or stutter.
- **🎨 Premium UI/UX**: A sleek, dark-mode native interface featuring smooth animations and keyboard navigation experience.
- **📈 Advanced Crafting Calculator**: Calculate true profit margins with dynamic Item Values, Return Rate (RRR), Focus costs, and market fees.
- **🤖 CI/CD Automation**: Fully automated build pipeline. New `.exe` and `.deb` files are generated directly via GitHub Actions.

## 🚀 Download & Install

You don't need to build it yourself!
Head over to the **[Releases Page](../../releases)** to download the latest compiled version:

- **Windows**: Download the `.exe` installer.
- **Linux (Debian/Ubuntu/Pop!\_OS)**: Download the `.deb` package.

---

## 🛠️ Tech Stack

This project leverages a modern, high-performance stack:

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, DaisyUI, Framer Motion
- **Backend**: Rust, Tauri v2, SQLite (rusqlite)
- **DevOps**: GitHub Actions (Automated CI/CD Builds)

---

## 💻 Local Development

Want to compile the app yourself or contribute?

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Rust](https://rustup.rs/)
- System dependencies for Tauri (See [Tauri Prerequisites](https://tauri.app/v1/guides/getting-started/prerequisites))

### Setup & Run

1. Clone the repository:

```bash
git clone https://github.com/rynsh1506/avalonian-tools.git
cd albion-universal-tools
```

2. Install frontend dependencies:

```bash
npm install
```

3. Run the development server (This will compile the Rust backend and launch the app):

```bash
npm run tauri dev
```

### Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/)
- [Tauri Extension](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode)
- [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)

---

## 🗺️ Roadmap (Upcoming Features)

- [ ] **Salvage Calculator**: Maximize your silver from unwanted items.

- [ ] **Integrated Market Sniffer**: Wraps and embeds a proven, pre-existing Albion packet sniffer directly into the app as a background process.

- [ ] **Smart Local Injection**: The Rust backend acts as a process controller (toggling the sniffer ON/OFF via UI) and instantly pipes the intercepted market data into your local SQLite database.

- [ ] **AI Market Analyzer**: Smart algorithms to detect profitable market flips and predict price trends based on your freshly injected local data.

---

<div align="center">
<i>Craft smarter, not harder. ⚒️</i>
</div>
