# Setu - AI Meeting Assistant

## Overview

Setu is an intelligent meeting application that leverages AI agents to enhance real-time communication. The platform enables users to host meetings where an AI agent seamlessly joins the room, actively participates in the conversation, and provides post-meeting insights through automated summaries.

## Key Features

### 🤖 AI Agent Participation
- **Smart Listening**: The AI agent joins meetings and listens to all participants in real-time
- **Contextual Responses**: Responds intelligently during the call based on conversation context
- **Natural Interaction**: Participates as a meeting member, contributing to discussions and clarifications

### 🎤 Real-Time Meeting Capabilities
- **High-Quality Video & Audio**: Crystal-clear communication powered by Stream.io
- **Multi-participant Support**: Support for multiple participants in unified meeting rooms
- **Stable Connections**: Reliable WebRTC infrastructure for consistent call quality

### 📝 Automated Meeting Summaries
- **Post-Call Analysis**: Automatically generates comprehensive meeting summaries after calls end
- **Key Insights**: Extracts important topics, decisions, and action items
- **AI-Powered Extraction**: Uses Google GenAI to create intelligent, contextual summaries

### 🔐 User Management & Authentication
- **Secure Authentication**: Integrated authentication system with Better Auth
- **User Profiles**: Personalized user experience with profile management
- **Session Management**: Secure session handling for meeting participants

### 💾 Data Persistence
- **Meeting Records**: Store meeting data and summaries in PostgreSQL
- **User Data**: Maintain user profiles and meeting history
- **ORM Support**: Drizzle ORM for efficient database operations

### ⚙️ Background Processing
- **Workflow Automation**: Inngest integration for background tasks
- **Asynchronous Processing**: Handle heavy AI operations without blocking the UI
- **Scheduled Tasks**: Automated processing of meeting data and summaries

## Technology Stack

- **Frontend**: Next.js, React, TypeScript, Radix UI, Tailwind CSS
- **Backend**: Next.js API Routes, tRPC for type-safe API calls
- **Database**: PostgreSQL with Drizzle ORM
- **Real-Time Communication**: Stream.io SDK (video, audio, messaging)
- **AI & ML**: Google GenAI for intelligent responses and summaries
- **Workflow Engine**: Inngest for background job orchestration
- **Authentication**: Better Auth (Polar)
- **Styling**: Radix UI components, Tailwind CSS

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database
- Stream.io API keys
- Google GenAI API key
- Inngest account (optional, for background job processing)

### Installation

1. Clone the repository and install dependencies:
```bash
npm install
```

2. Set up environment variables in `.env`:
```env
# Database
DATABASE_URL=your_postgresql_url

# Stream.io
NEXT_PUBLIC_STREAM_API_KEY=your_stream_api_key
STREAM_API_SECRET=your_stream_secret

# Google GenAI
GOOGLE_GENAI_API_KEY=your_genai_api_key

# Authentication
BETTER_AUTH_SALT=your_auth_salt
BETTER_AUTH_SECRET=your_auth_secret
```

3. Push database schema:
```bash
npm run db:push
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Sync database schema with Drizzle
- `npm run db:studio` - Open Drizzle Studio for database management
- `npm run dev:webhook` - Start ngrok for webhook testing
- `npm run dev:inngest` - Start Inngest local development server

## Project Structure

```
src/
├── app/              # Next.js app directory and routes
├── components/       # Reusable React components
├── modules/          # Business logic modules
├── lib/              # Utility functions and helpers
├── db/               # Database schema and migrations
├── trpc/             # tRPC router definitions
├── inngest/          # Background workflow definitions
├── hooks/            # Custom React hooks
└── constants.ts      # Application constants
```

## How It Works

1. **Meeting Creation**: Users create or join a meeting room
2. **AI Agent Initialization**: AI agent automatically joins the room
3. **Real-Time Participation**: AI listens and responds during the conversation
4. **Call Completion**: Meeting ends when all participants leave
5. **Summary Generation**: Inngest processes the meeting recording and calls Google GenAI to generate a summary
6. **Results Delivery**: Summary and insights are made available to meeting participants

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is private and proprietary.
