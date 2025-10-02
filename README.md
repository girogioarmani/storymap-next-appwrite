# StoryMap - Agile User Story Mapping

A modern web application for creating and managing user story maps the agile way. Built with Next.js, Appwrite, and shadcn/ui.

## Features

- 🔐 Email authentication with Appwrite
- 🗺️ Interactive story mapping interface
- 🎨 Modern UI with shadcn/ui and Tailwind CSS
- 📱 Responsive design
- 🌙 Dark mode support

## Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, React
- **Backend**: Appwrite (self-hosted or cloud)
- **UI**: shadcn/ui, Tailwind CSS, Lucide Icons
- **State Management**: React Hooks

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Appwrite instance (local or cloud)

### Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Appwrite:**
   
   Update `.env.local` with your Appwrite settings:
   ```env
   NEXT_PUBLIC_APPWRITE_ENDPOINT=http://localhost/v1
   NEXT_PUBLIC_APPWRITE_PROJECT=your-project-id-here
   ```

3. **Set up Appwrite project:**
   - Create a new project in your Appwrite console
   - Enable Email/Password authentication
   - Copy your project ID to `.env.local`

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── app/                  # Next.js app directory
│   ├── sign-in/         # Sign in page
│   ├── sign-up/         # Sign up page
│   └── page.tsx         # Main story map page
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   ├── auth-provider.tsx
│   └── navbar.tsx
├── lib/                # Utilities
│   └── appwrite.ts     # Appwrite client config
└── public/             # Static assets
```

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## TODO

- [ ] Add email verification flow
- [ ] Implement drag-and-drop for stories
- [ ] Add database persistence with Appwrite
- [ ] Create collaborative features
- [ ] Add export/import functionality
- [ ] Implement real-time updates

## License

MIT
