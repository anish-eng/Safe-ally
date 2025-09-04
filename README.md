

<h1 align="center"> Safe Ally</h1>
<p align="center"><i>A comprehensive, secure solution to help victims of domestic abuse and violence.</i></p>

---

## 🔎 Problem
Domestic abuse survivors often lack access to **safe, discreet, and reliable tools** that provide both privacy and immediate support.  
Existing resources are often **text-heavy, non-interactive**, and fail to ensure **security, empathy, and discretion**—critical needs for victims seeking help.
There are many existing resources on the internet to help victims find domestic abuse shelters, helpline numbers, etc but very few that can help them live through their
existing solution until they can seek specialised help. 

---

## ✅ Solution
**Safe Ally** is built as a **stealth, privacy-first application** that combines **security, empathy, and functionality**.  
It not only provides critical resources but also **protects users from detection**, offers **empathetic AI support**, and helps them **plan, document, and connect safely** in times of crisis.
It doesn't just provide static information, but provides functional features that helps solve practical problems that victims face, like lack of a centralised document storage space (File Vault), ability to privately journal thoughts and also save media like photos, videos, and also an empathetic chatbot which is personalised and remembers a user's previous chats.

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
  - Secret exit button leaves the main dashboard without leaving a trace and it cannot be accessed again without unlocking the app once more.  
  - *Implementation:* TTL tokens in session storage, route protection, and authentication.

- 📓 **Private Journaling**  
  - Create private journals with text, videos, audio, and images.  
  - Entries are **time-stamped** and can be exported as **CSV/PDF**.  
  - *Implementation:* Firebase Cloud Storage + secure rules for media.

- 🗂️ **File Vault**  
  - Secure storage for sensitive files in a hierarchical folder structure.  
  - Upload, download, and delete files easily.  
  - *Implementation:* Firebase Storage for storing files  + Firestore for folder hierarchy.

- 🤖 **Empathetic Chatbot**  
  - Provides abuse shelter info  
  - Helps build escape plans  
  - Offers legal guidance  
  - Remembers past interactions and chat history and customises its interactions based on that.
  - *Implementation:* LangChain + Gemini API; Firestore vector DB + Groq API for embeddings; deployed with Firebase Cloud Functions.

- 📞 **Emergency Contact**  
  - Store a trusted contact and trigger email/SMS during emergencies.  
  - *Implementation:* Email.js for emails; Firebase Cloud Functions for triggers.

- 🧭 **Miscellaneous**  
  - Secure **Login/Register/Forgot/Edit Password**  
  - Interactive app tour using ReactTour library. 
  - Educational **Power & Control Wheel** for awareness and explanation of the benefits of the app. 

---

## 🧰 Tech Stack

React.js, Langchain, Google Firebase, Cloud functions

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

