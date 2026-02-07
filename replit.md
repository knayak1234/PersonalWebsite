# Dr. Kishora Nayak's Academic Portfolio

## Overview

This is a professional academic portfolio website for Dr. Kishora Nayak, Assistant Professor in Physics at Panchayat College, Bargarh. The application showcases his research in experimental high-energy physics, particularly focusing on QCD Phase Diagram studies and Quark-Gluon Plasma research. The website features an interactive chatbot powered by OpenAI for answering questions about Dr. Nayak's research and academic work.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state
- **Build Tool**: Vite for development and production builds
- **UI Components**: Radix UI primitives with custom styling

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **AI Integration**: OpenAI API for chatbot functionality
- **Session Management**: In-memory storage (development) with planned PostgreSQL persistence

### Deployment Strategy
- **Platform**: Vercel (configured via vercel.json)
- **Root Directory**: Client folder for frontend deployment
- **Environment**: Development and production configurations
- **Database**: Neon Database (PostgreSQL) via @neondatabase/serverless

## Key Components

### Core Pages
1. **Homepage**: Complete academic portfolio with sections for about, research, publications, teaching, and contact
2. **Admin Page**: Administrative interface for managing contact form submissions
3. **404 Page**: Custom not-found page

### Interactive Features
- **AI Chatbot**: Comprehensive research assistant with knowledge base about Dr. Nayak's work
- **Contact Form**: Professional contact system with form validation and admin management
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Animation System**: Custom animations for enhanced user experience

### UI Components
- **Navigation**: Smooth scrolling navigation with active section highlighting
- **Hero Section**: Professional introduction with downloadable CV
- **Research Showcase**: Interactive research area displays with progress indicators
- **Publications Display**: Formatted academic publications with DOI links
- **Teaching Portfolio**: Course listings and administrative roles

## Data Flow

### Contact Form Flow
1. User fills contact form with validation
2. Data sent to `/api/contact` endpoint
3. Validated using Zod schemas
4. Stored in database via Drizzle ORM
5. Admin can view and manage submissions

### Chatbot Flow
1. User asks question about Dr. Nayak's research
2. Query processed against comprehensive knowledge base
3. If no match, OpenAI API called for enhanced response
4. Response delivered with research context and citations

### Content Management
- Static content stored in component files
- Research knowledge base in dedicated server module
- Asset management through attached_assets directory
- Admin interface for message management

## External Dependencies

### Core Dependencies
- **React Ecosystem**: React, React DOM, React Query
- **UI Framework**: Radix UI components, Tailwind CSS
- **Database**: Drizzle ORM, PostgreSQL via Neon
- **AI Services**: OpenAI API for chatbot functionality
- **Form Handling**: React Hook Form with Zod validation
- **Date Handling**: date-fns for timestamp management

### Development Tools
- **Build Tools**: Vite, esbuild for production builds
- **TypeScript**: Full type safety across frontend and backend
- **Development**: tsx for TypeScript execution
- **Linting**: ESLint configuration for code quality

## Deployment Strategy

### Environment Configuration
- **Development**: Local development with hot reload
- **Production**: Vercel deployment with automatic builds
- **Database**: Neon PostgreSQL for persistence
- **Environment Variables**: Secure handling of API keys and database URLs

### Build Process
1. Frontend built with Vite to dist/public
2. Backend bundled with esbuild to dist/
3. Database migrations via Drizzle Kit
4. Vercel handles deployment and serving

### Database Management
- **Schema**: Defined in shared/schema.ts
- **Migrations**: Managed via Drizzle Kit
- **Development**: In-memory storage fallback
- **Production**: PostgreSQL via Neon Database

## Changelog

```
Changelog:
- July 01, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```