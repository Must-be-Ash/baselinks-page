# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal Linktree-style application for Ash Nouruzi (DevRel at Coinbase Developer Platform) built with:
- **Next.js 15** with React 19 and TypeScript
- **Tailwind CSS** for styling with custom CSS classes
- **shadcn/ui** components library with Radix UI primitives
- **Coinbase Developer Platform (CDP)** integration for cryptocurrency donations
- **Base network** for low-fee ETH transactions

## Common Commands

```bash
# Development
npm run dev          # Start development server on localhost:3000
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run Next.js linting

# Package management
npm install          # Install dependencies (also has pnpm-lock.yaml)
```

## Architecture & Key Components

### Core Structure
- `app/` - Next.js App Router structure
  - `layout.tsx` - Root layout with CDPProvider wrapper
  - `page.tsx` - Main linktree page with profile, links, and donation section
  - `globals.css` - Custom CSS with Tailwind base styles

### Key Components
- `components/CDPProvider.tsx` - Coinbase Developer Platform configuration and provider
- `components/SupportButton.tsx` - Complete cryptocurrency donation system with:
  - Email-based authentication (no wallet required)
  - OTP verification flow
  - ETH donation functionality on Base network
  - Transaction status tracking
- `components/ui/` - shadcn/ui components (accordion, button, card, etc.)

### Styling Architecture
- **Tailwind CSS** with custom configuration in `tailwind.config.ts`
- **CSS Variables** for theming (HSL color system)
- **Custom CSS classes** in `app/globals.css` for specific linktree styling
- **shadcn/ui** design system with Radix UI primitives

### CDP Integration
- Project ID: `03058f87-eb78-4ebc-8bb8-f8aeed57cefa`
- Donation address: `0xeDeE7Ee27e99953ee3E99acE79a6fbc037E31C0D`
- Network: Base mainnet (chainId: 8453)
- Authentication: Email + OTP (no external wallet required)

### Configuration Files
- `next.config.mjs` - ESLint and TypeScript build errors ignored, images unoptimized
- `components.json` - shadcn/ui configuration with path aliases
- `tsconfig.json` - TypeScript config with `@/*` path mapping
- TypeScript target: ES6, strict mode enabled

### Dependencies
Key libraries:
- `@coinbase/cdp-core` & `@coinbase/cdp-hooks` - Coinbase platform integration
- `@radix-ui/*` - Comprehensive UI primitive components
- `lucide-react` - Icon library
- `next-themes` - Theme management
- `zod` - Schema validation
- `react-hook-form` with `@hookform/resolvers` - Form handling

## Development Notes

- SSR considerations: CDPProvider has client-side mounting protection
- Error handling: Build errors and lint errors are ignored in config
- Styling: Mix of Tailwind utilities and custom CSS classes
- State management: React hooks with CDP hooks for crypto functionality
- Form validation: Zod schemas with react-hook-form integration