# OrganizeNow 🚀

<div align="center">
  <img src="public/favicon-new.svg" alt="OrganizeNow Logo" width="120" height="120">
  
  ### Your All-in-One Productivity Workspace
  
  A modern, feature-rich productivity platform built with Next.js 15, TypeScript, and Supabase. Manage tasks, notes, passwords, whiteboards, and more - all in one beautiful interface.

  [![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=flat-square&logo=next.js)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
  [![Supabase](https://img.shields.io/badge/Supabase-2.39-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)
</div>

---

## ✨ Features

### 📋 **Task Management**
- Create, edit, and organize tasks with ease
- Priority levels and due dates
- Task notifications and reminders
- Calendar view for deadline tracking
- Real-time updates across devices

### 📝 **Rich Notes Editor**
- Notion-style block editor powered by BlockNote
- Markdown support
- Rich text formatting (bold, italic, lists, code blocks)
- Drag-and-drop organization
- Theme-aware (light/dark mode)
- AI-powered content assistance

### 🎨 **Visual Whiteboards**
- Infinite canvas for brainstorming
- Drag-and-drop content blocks
- Excalidraw integration for drawing
- Collaborative workspace
- Export and share boards

### 🔐 **Password Vault**
- Secure password storage with encryption
- Password generator
- Search and organize credentials
- Encrypted using crypto-js
- Password strength indicators

### 🎯 **Dashboard**
- Beautiful overview of all your content
- Quick access to boards, tasks, and notes
- Activity statistics
- Customizable layout

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v3.4 + PostCSS
- **UI Components**: Custom components + Radix UI primitives
- **Icons**: Lucide React + React Icons
- **State Management**: Redux Toolkit + Zustand
- **Drag & Drop**: @dnd-kit
- **Rich Text**: BlockNote + TipTap
- **Drawing**: Excalidraw
- **Calendar**: React Big Calendar

### **Backend**
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Custom JWT + Supabase Auth
- **Storage**: Supabase Storage
- **Real-time**: Supabase Realtime subscriptions
- **Email**: Resend
- **AI**: Google Gemini AI

### **Security**
- bcryptjs for password hashing
- crypto-js for encryption
- JWT tokens for auth
- Environment variable protection

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Supabase account (free tier works great!)
- Google Gemini API key (optional, for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/VinayakPaka/OrganizeNow.git
   cd organize-now
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # JWT Secret for Authentication
   JWT_SECRET=your_secure_jwt_secret_here

   # Encryption Key for Password Vault
   ENCRYPTION_KEY=your_32_character_encryption_key

   # Google Gemini AI (Optional)
   GEMINI_API_KEY=your_gemini_api_key

   # Email Service (Optional)
   RESEND_API_KEY=your_resend_api_key
   ```


4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
organize-now/
├── public/                          # Static assets
│   ├── DrawKit Vector Illustration/ # Illustrations
│   └── favicon.svg                  # Logo
├── src/
│   ├── app/                         # Next.js App Router pages
│   │   ├── api/                     # API routes
│   │   │   ├── auth/               # Authentication endpoints
│   │   │   ├── ai/                 # AI processing endpoints
│   │   │   ├── boards/             # Board management
│   │   │   ├── tasks/              # Task management
│   │   │   ├── pages/              # Notes management
│   │   │   └── passwords/          # Password vault
│   │   ├── auth/                   # Auth pages (login/signup)
│   │   ├── dashboard/              # Main dashboard
│   │   ├── board/[id]/            # Individual board view
│   │   ├── tasks/                  # Tasks page
│   │   ├── notes/                  # Notes page
│   │   ├── vault/                  # Password vault page
│   │   ├── calendar/               # Calendar view
│   │   └── whiteboards/            # Whiteboards page
│   ├── components/                 # React components
│   │   ├── auth/                   # Auth components
│   │   ├── board/                  # Board components
│   │   ├── tasks/                  # Task components
│   │   ├── notes/                  # Note editor components
│   │   ├── vault/                  # Password components
│   │   ├── calendar/               # Calendar components
│   │   ├── layout/                 # Layout components (Sidebar)
│   │   ├── dashboard/              # Dashboard components
│   │   ├── ai/                     # AI chat components
│   │   └── ui/                     # Reusable UI components
│   ├── contexts/                   # React contexts
│   │   └── ThemeContext.tsx       # Theme management
│   ├── hooks/                      # Custom React hooks
│   ├── lib/                        # Utility libraries
│   │   ├── ai/                     # AI integration
│   │   ├── auth/                   # Auth utilities
│   │   ├── db/                     # Database utilities
│   │   ├── email/                  # Email service
│   │   ├── storage/                # File storage
│   │   └── utils/                  # Helper functions
│   ├── store/                      # Redux store
│   │   └── slices/                 # Redux slices
│   ├── styles/                     # Global styles
│   └── types/                      # TypeScript types
├── .env.example                    # Example environment variables
├── next.config.js                  # Next.js configuration
├── tailwind.config.js              # Tailwind configuration
├── tsconfig.json                   # TypeScript configuration
└── package.json                    # Dependencies
```

---

## 🎨 Design System

### Colors
- **Primary**: Purple (`#7C3AED` - purple-600)
- **Secondary**: Yellow (`#EAB308` - yellow-500)
- **Backgrounds**: White / Dark gradients
- **Accents**: Gradient blobs with blur effects

### Typography
- **Logo**: "Organize" in bold + "Now" in cursive italic (yellow)
- **Headings**: Bold, dark text
- **Body**: Gray-600 for light mode, Gray-300 for dark mode

### Components
- Rounded corners (2xl, 3xl)
- Soft shadows
- Smooth transitions
- Glass morphism effects
- Animated decorative elements

---

## 🔐 Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Encryption**: AES encryption for sensitive data
- **Row Level Security**: Supabase RLS policies
- **Environment Variables**: Sensitive keys protected
- **HTTPS Only**: Force secure connections in production
- **CORS Protection**: Configured API endpoints
- **Input Validation**: Zod schema validation


---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Supabase](https://supabase.com/) - Open source Firebase alternative
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [BlockNote](https://www.blocknotejs.org/) - Block-based editor
- [Excalidraw](https://excalidraw.com/) - Virtual whiteboard
- [DrawKit](https://drawkit.com/) - Beautiful illustrations
- [Lucide](https://lucide.dev/) - Icon library

---

<div align="center">
  Made with ❤️ by the VinayakPaka
</div>
