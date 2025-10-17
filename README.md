# Sports Performance Tracker

A React-based web application for tracking sports performance across cricket, football, and basketball. Features role-based access for coaches and players with Firebase integration.

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Firebase Configuration
1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication and Firestore Database
3. Copy your Firebase configuration
4. Create a `.env` file in the root directory using `.env.example` as template
5. Fill in your Firebase configuration values

### 3. Environment Variables
Copy `.env.example` to `.env` and update with your Firebase configuration:
```bash
cp .env.example .env
```

### 4. Run Development Server
```bash
npm run dev
```

## Project Structure

```
src/
├── components/          # React components
│   ├── auth/           # Authentication components
│   ├── coach/          # Coach-specific components
│   ├── player/         # Player-specific components
│   ├── shared/         # Shared/common components
│   └── forms/          # Form components
├── services/           # API and Firebase services
├── hooks/              # Custom React hooks
├── contexts/           # React contexts
├── utils/              # Utility functions and constants
├── pages/              # Page components
└── config/             # Configuration files
```

## Technologies Used

- React 19 with Vite
- Firebase (Authentication & Firestore)
- React Router DOM
- Tailwind CSS
- ESLint for code quality

## Firebase Setup Requirements

This application requires Firebase Authentication and Firestore Database to be enabled in your Firebase project. Make sure to:

1. Enable Email/Password authentication in Firebase Console
2. Create a Firestore database in production mode
3. Configure security rules (will be set up in later tasks)

## Development

The project uses Vite for fast development and building. All Firebase configuration is handled through environment variables for security.