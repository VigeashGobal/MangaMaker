# MangaMaker

A web application that helps you create manga pages from story ideas using AI image generation.

## Features

- **Story Input**: Enter your manga story summary with genre and style preferences
- **Page Generation**: Create different types of manga pages (title, action, dialogue, etc.)
- **AI Integration**: Generate 3 variations for each page using OpenAI DALL-E 3
- **Page Selection**: Choose your favorite variation for each page
- **Export**: Download all selected pages as PDF or ZIP

## Tech Stack

- **Frontend**: Next.js 14 with TypeScript and Tailwind CSS
- **Backend**: Convex for real-time database and serverless functions
- **AI**: OpenAI DALL-E 3 for image generation
- **Export**: jsPDF for PDF generation, JSZip for ZIP files
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or pnpm
- Convex account
- OpenAI API key (optional)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd MangaMaker
```

2. Install dependencies:
```bash
npm install
```

3. Set up Convex:
```bash
npx convex dev --configure
```

4. Create environment variables:
```bash
cp .env.example .env.local
```

5. Add your environment variables to `.env.local`:
```
NEXT_PUBLIC_CONVEX_URL=your_convex_url_here
CONVEX_DEPLOYMENT=your_convex_deployment_here
OPENAI_API_KEY=your_openai_api_key_here
```

6. Start the development server:
```bash
npm run dev
```

7. In another terminal, start Convex:
```bash
npx convex dev
```

## Usage

1. **Enter Story**: Describe your manga story, select genre and art style
2. **Generate Pages**: Choose page type and describe what should happen
3. **Select Options**: Pick your favorite from 3 generated variations
4. **Export**: Download all selected pages as PDF or ZIP

## Environment Variables

- `NEXT_PUBLIC_CONVEX_URL`: Your Convex deployment URL
- `CONVEX_DEPLOYMENT`: Your Convex deployment name
- `OPENAI_API_KEY`: OpenAI API key for image generation (optional - falls back to mock images)

## Deployment

### Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push to main

### Convex

1. Deploy to production:
```bash
npx convex deploy
```

## Project Structure

```
src/
├── app/                 # Next.js app directory
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page
├── components/         # React components
│   ├── ConvexClientProvider.tsx
│   ├── StoryInput.tsx
│   ├── PageGenerator.tsx
│   └── PageGallery.tsx
convex/                 # Convex backend
├── schema.ts          # Database schema
├── projects.ts        # Project management
├── pages.ts           # Page generation
└── export.ts          # Export functionality
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details