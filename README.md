<p align="center">
  <img src="https://img.shields.io/badge/Status-Active-22c55e?style=for-the-badge" alt="status" />
  <img src="https://img.shields.io/badge/License-MIT-0ea5e9?style=for-the-badge" alt="license" />
  <img src="https://img.shields.io/badge/Contributions-Welcome-ec4899?style=for-the-badge" alt="contributions" />
</p>

<h1 align="center">🛡️ Safe Ally</h1>
<p align="center"><i>A comprehensive, secure solution to help victims of domestic abuse and violence.</i></p>

---

## 📚 Table of Contents
- [🔎 Problem](#-problem)
- [✅ Solution](#-solution)
- [🎛️ Features](#-features)
- [🧰 Tech Stack](#-tech-stack)
- [🎬 Demo](#-demo)
- [🖼️ Screenshots](#-screenshots)
- [🗺️ Future Enhancements](#-future-enhancements)
- [📄 License](#-license)
- [👤 Author](#-author)

---

## 🔎 Problem
Domestic abuse survivors often lack access to **safe, discreet, and reliable tools** that provide both privacy and immediate support.  
Existing resources are often **text-heavy, non-interactive**, and fail to ensure **security, empathy, and discretion**—critical needs for victims seeking help.

---

## ✅ Solution
**Safe Ally** is built as a **stealth, privacy-first application** that combines **security, empathy, and functionality**.  
It not only provides critical resources but also **protects users from detection**, offers **empathetic AI support**, and helps them **plan, document, and connect safely** in times of crisis.

---

## 🎛️ Features

<p>
  <img alt="Privacy-first" src="https://img.shields.io/badge/Privacy-First-f59e0b?style=for-the-badge" />
  <img alt="Empathy" src="https://img.shields.io/badge/Empathetic_AI-22c55e?style=for-the-badge" />
  <img alt="Security" src="https://img.shields.io/badge/Secure_Storage-6366f1?style=for-the-badge" />
</p>

### ✨ Core Features
- 🕵️ **Stealth Unlock**  
  On load, the app shows a disguised “dummy” screen.  
  - Unlock with a discreet, user-known gesture.  
  - Secret exit button leaves without trace.  
  - *Implementation:* TTL tokens in session storage, route protection, and authentication.

- 📓 **Private Journaling**  
  Create private journals with text, videos, audio, and images.  
  - Entries are **time-stamped** and can be exported as **CSV/PDF**.  
  - *Implementation:* Firebase Cloud Storage + secure rules for media.

- 🗂️ **File Vault**  
  Secure storage for sensitive files in a hierarchical folder structure.  
  - Upload, download, and delete files easily.  
  - *Implementation:* Firebase Storage + Firestore for folder hierarchy.

- 🤖 **Empathetic Chatbot**  
  A memory- and context-aware AI companion that:  
  - Provides abuse shelter info  
  - Helps build escape plans  
  - Offers legal guidance  
  - Remembers past interactions  
  - *Implementation:* LangChain + Gemini API; Firestore vector DB + Groq API for embeddings; deployed with Firebase Cloud Functions.

- 📞 **Emergency Contact**  
  Store a trusted contact and trigger email/SMS during emergencies.  
  - *Implementation:* Email.js for emails; Firebase Cloud Functions for triggers.

- 🧭 **Miscellaneous**  
  - Secure **Login/Register/Forgot/Edit Password**  
  - Interactive app tour  
  - Educational **Power & Control Wheel** for awareness

---

## 🧰 Tech Stack

<p>
  <img alt="React" src="https://img.shields.io/badge/Frontend-React-0A66C2?style=for-the-badge" />
  <img alt="TypeScript" src="https://img.shields.io/badge/Language-TypeScript-0A66C2?style=for-the-badge" />
  <img alt="Tailwind" src="https://img.shiel
