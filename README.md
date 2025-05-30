# WebCrafterPros

AI-powered website generation platform that transforms business conversations into professional websites in minutes.

## Features

- **AI Website Generation**: Create custom websites through natural conversation
- **Image Integration**: Upload business photos that are prominently featured in all designs
- **Multiple Design Variants**: Choose from three unique website styles
- **Instant Deployment**: Deploy websites with custom domain support
- **Business Intelligence**: Track user preferences and conversion analytics
- **Universal Compatibility**: Works for any business type or industry

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: PostgreSQL with Drizzle ORM
- **AI**: OpenAI GPT integration
- **Analytics**: Custom business intelligence tracking
- **Deployment**: Cloud-ready with health endpoints

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- OpenAI API key

### Environment Variables

```bash
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
OPENAI_API_KEY=your_openai_api_key_here
PORT=5000
NODE_ENV=production
SESSION_SECRET=your_session_secret_here
```

### Installation

```bash
# Install dependencies
npm install

# Set up database
npm run db:push

# Development
npm run dev

# Production build
npm run build
npm start
```

## Deployment

### Docker

```bash
docker build -t webcrafterpros .
docker run -p 5000:5000 --env-file .env webcrafterpros
```

### DigitalOcean/Cloud Platforms

The application includes:
- Health endpoints (`/health`, `/api/health`)
- Dynamic port binding
- Production-ready build scripts
- Proper environment variable handling

## API Endpoints

- `GET /health` - Health check for load balancers
- `POST /api/websites` - Create new website
- `POST /api/upload` - Upload business images
- `GET /api/websites/:id` - Retrieve website data
- `POST /api/deploy-website` - Deploy website live

## License

MIT License

## Support

For deployment assistance or custom features, contact the WebCrafterPros team.