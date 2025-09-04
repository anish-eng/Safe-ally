<p align="center">
  <img src="https://img.shields.io/badge/Status-Active-22c55e?style=for-the-badge" alt="status" />
  <img src="https://img.shields.io/badge/License-MIT-0ea5e9?style=for-the-badge" alt="license" />
  <img src="https://img.shields.io/badge/Contributions-Welcome-ec4899?style=for-the-badge" alt="contributions" />
</p>

<h1 align="center">🛡️ Safe Ally</h1>
<p align="center"><i>A comprehensive, secure solution to help victims of domestic abuse and violence.</i></p>

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

- 🕵️ **Stealth Unlock**  
  - On load, the app shows a disguised “dummy” screen.  
  - Unlock with a discreet, user-known gesture.  
  - Secret exit button leaves without trace.  
  - *Implementation:* TTL tokens in session storage, route protection, and authentication.

- 📓 **Private Journaling**  
  - Create private journals with text, videos, audio, and images.  
  - Entries are **time-stamped** and can be exported as **CSV/PDF**.  
  - *Implementation:* Firebase Cloud Storage + secure rules for media.

- 🗂️ **File Vault**  
  - Secure storage for sensitive files in a hierarchical folder structure.  
  - Upload, download, and delete files easily.  
  - *Implementation:* Firebase Storage + Firestore for folder hierarchy.

- 🤖 **Empathetic Chatbot**  
  - Provides abuse shelter info  
  - Helps build escape plans  
  - Offers legal guidance  
  - Remembers past interactions  
  - *Implementation:* LangChain + Gemini API; Firestore vector DB + Groq API for embeddings; deployed with Firebase Cloud Functions.

- 📞 **Emergency Contact**  
  - Store a trusted contact and trigger email/SMS during emergencies.  
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
  <img alt="Tailwind" src="https://img.shields.io/badge/UI-Tailwind_CSS-0A66C2?style=for-the-badge" />
  <img alt="Firebase" src="https://img.shields.io/badge/Backend-Firebase-0A66C2?style=for-the-badge" />
  <img alt="LangChain" src="https://img.shields.io/badge/AI-LangChain-0A66C2?style=for-the-badge" />
  <img alt="Gemini" src="https://img.shields.io/badge/AI-Gemini_API-0A66C2?style=for-the-badge" />
  <img alt="Groq" src="https://img.shields.io/badge/Vector-Groq_API-0A66C2?style=for-the-badge" />
  <img alt="Firestore" src="https://img.shields.io/badge/Database-Cloud_Firestore-0A66C2?style=for-the-badge" />
</p>

---

## 🎬 Demo
[▶ Watch the demo](REPLACE_WITH_YOUTUBE_OR_VIMEO_LINK)

---

## 🖼️ Screenshots

<p align="center">
  <img src="assets/screenshot-1.png" alt="Screenshot 1" width="900" />
</p>

<p align="center">
  <img src="assets/screenshot-2.png" alt="Screenshot 2" width="900" />
</p>

<p align="center">
  <img src="assets/screenshot-3.gif" alt="Animated demo" width="900" />
</p>

---

## 🗺️ Future Enhancements
- [ ] **Offline-first support** for journaling & file vault  
- [ ] **Mobile app version** (React Native/Flutter)  
- [ ] **Integration with local shelters & hotlines**  
- [ ] **Voice-driven chatbot** for accessibility  
- [ ] **Multi-language support**  
- [ ] **Advanced AI-powered legal document builder**

---

## 📄 License
Licensed under **MIT**.

---

## 👤 Author
**Anish Ajith Kamath**  
[LinkedIn](https://www.linkedin.com/in/anishajithkamath) • [GitHub](https://github.com/anishkamath)  

---

