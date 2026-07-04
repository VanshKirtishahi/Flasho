<div align="center">

<img src="https://res.cloudinary.com/dvywvz9xn/image/upload/v1783150141/ChatGPT_Image_Jul_4_2026_12_58_04_PM_dngifb.png" width="900" alt="Flasho logo placeholder"/>

# ⚡ Flasho

### 🚀 Book trusted service professionals. Anytime, anywhere.

*A technology-powered service marketplace connecting customers with verified agencies for reliable home and office services — transparent pricing, fast booking, trusted pros.*

<br/>

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-Build-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-Styling-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth/Storage-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-Realtime-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)
[![Razorpay](https://img.shields.io/badge/RazorpayX-Payouts-0C2451?style=for-the-badge&logo=razorpay&logoColor=white)](https://razorpay.com/)
[![OneSignal](https://img.shields.io/badge/OneSignal-Push%20Notifications-E54A4A?style=for-the-badge&logo=onesignal&logoColor=white)](https://onesignal.com/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)]()

<br/>

[✨ Features](#-features) •
[🏗️ Architecture](#️-architecture) •
[🚀 Quick Start](#-quick-start) •
[📂 Modules](#-module-breakdown) •
[📸 Screenshots](#-screenshots)

</div>

---

## 📖 About The Project

**Flasho** is a technology-powered **service marketplace** that connects customers with verified service agencies for reliable home and office services. The platform simplifies service booking, ensures transparent pricing, and delivers fast access to trusted professionals — while creating new business opportunities for service providers.

Under the hood, it's built as a **multi-module monorepo** — instead of cramming everything into one app, the platform is split into purpose-built pieces that all talk to a shared backend:

- 🌐 A public-facing **portfolio site** and booking interface for customers.
- 🧑‍💼 An internal **Super Admin dashboard** for day-to-day platform operations and KYC verifications.
- 🏢 A dedicated **Franchise Admin panel** for partner agencies to manage their local workforce.
- 📱 A mobile **Worker App** (Flutter) for professionals to receive localized job alerts.
- ⚙️ A single **Node.js REST API** powering all of the above.

> 💡 *This decoupled structure makes it easy to scale, deploy, and maintain each part independently. For example, updating the franchise portal does not require bringing down the public customer site.*

---

## ✨ Features

<table>
<tr>
<td width="50%" valign="top">

### 🌐 Customer Experience
- Browse a nested catalog of home services
- Transparent, upfront pricing models
- Fast, secure service booking flow

</td>
<td width="50%" valign="top">

### 🧑‍💼 Super Admin Dashboard
- Automated RazorpayX 1-click settlements
- Approve/Reject KYC documents via Supabase
- Send global push notifications via OneSignal

</td>
</tr>
<tr>
<td width="50%" valign="top">

### 🏢 Franchise Admin
- Onboard local independent professionals
- Track bookings & revenue by geographical location
- Monitor live professional ratings and feedback

</td>
<td width="50%" valign="top">

### ⚙️ Backend API Engine
- Real-time location tracking via Socket.io
- Secure dynamic payouts via Razorpay API
- Role-based Access Control (Super Admin vs Agency)
- Centralized Axios client with automatic token injection

</td>
</tr>
</table>

---

## 🏗️ Architecture

```mermaid
flowchart TD
    A[🌐 Flasho_Portfolio<br/>React + Vite] -->|REST| D[⚙️ Backend API<br/>Node.js + Express]
    B[🧑‍💼 Super Admin<br/>React + Vite] -->|REST + Axios Interceptors| D
    C[🏢 Franchise Admin<br/>React + Vite] -->|REST + Axios Interceptors| D
    M[📱 Worker App<br/>Flutter] -->|REST + Socket.io| D
    D --> E[(🗄️ MongoDB Atlas)]
    D --> F[(🟢 Supabase Auth & Storage)]
    D --> H[💳 RazorpayX & Payment Gateway]
    D --> I[🔔 OneSignal Push API]
    D <-->|Real-time Geo-Tracking| J[📡 Socket.io Server]
