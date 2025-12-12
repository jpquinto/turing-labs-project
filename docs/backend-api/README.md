# Turing Labs Backend API Documentation

This project contains the OpenAPI specification for the Turing Labs backend API, rendered as an interactive documentation website using [Zudoku](https://zudoku.dev/).

## Overview

The Turing Labs backend API provides endpoints for managing taste testing trials, participants, recipes, and submissions. It includes features for:

- **Trial Management** - Create and manage sensory testing trials
- **Participant Management** - Add participants with unique codes
- **Recipe Management** - Define recipes with ingredient compositions
- **Submissions** - Collect sensory evaluation scores and feedback
- **Voice Memos** - Upload and transcribe participant feedback
- **Authentication** - Secure API access via Auth0 JWT tokens

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
npm install
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the documentation.

### Build

Build the static documentation site:

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
docs/backend-api/
├── apis/
│   └── openapi.yaml          # Complete OpenAPI 3.0.3 specification
├── pages/                     # Custom documentation pages
├── public/                    # Static assets (logos, images)
├── zudoku.config.tsx          # Zudoku configuration
├── package.json
└── README.md
```

## API Documentation

The OpenAPI specification (`apis/openapi.yaml`) contains:

### Endpoints

| Resource | Methods | Description |
|----------|---------|-------------|
| `/user` | POST | Create new user |
| `/participant` | GET, POST | List and create participants |
| `/participant/{id}` | GET, PUT, DELETE | Manage individual participants |
| `/recipe` | GET, POST | List and create recipes |
| `/recipe/{id}` | GET, PUT, DELETE | Manage individual recipes |
| `/trial` | GET, POST | List and create trials |
| `/trial/{id}` | GET, PUT, DELETE | Manage individual trials |
| `/submission` | GET, POST | List and create submissions |
| `/submission/{id}` | GET, PUT, DELETE | Manage individual submissions |
| `/voice-memo` | POST | Upload voice memos |
| `/transcribe` | POST | Transcribe voice memos |

### Authentication

Most endpoints require JWT authentication via Auth0:

```bash
Authorization: Bearer <your-jwt-token>
```

The `/user` endpoint uses webhook authentication with a shared secret.

### Query Parameters

Several GET endpoints support filtering:

- `/participant?trial_id=<uuid>` - Filter participants by trial
- `/recipe?trial_id=<uuid>` - Filter recipes by trial
- `/submission?trial_id=<uuid>` - Filter submissions by trial
- `/submission?participant_id=<uuid>` - Filter submissions by participant

## Making Changes

### Updating the API Specification

1. Edit `apis/openapi.yaml` to add/modify endpoints
2. Follow OpenAPI 3.0.3 specification format
3. Test changes locally with `npm run dev`
4. Commit and push changes

### Adding Custom Pages

Create new `.mdx` files in the `pages/` directory and reference them in `zudoku.config.tsx`.

### Customizing Branding

- Update logos in `public/` directory
- Modify `zudoku.config.tsx` for navigation and branding

## Deployment

The documentation can be deployed to:

- **Vercel** - Connect your Git repository
- **Netlify** - Drag and drop the `dist/` folder
- **AWS S3 + CloudFront** - Upload static build
- **GitHub Pages** - Configure in repository settings

Example deployment commands:

```bash
# Build for production
npm run build

# The static site will be in the dist/ directory
```

## Resources

- [Zudoku Documentation](https://zudoku.dev/docs/)
- [OpenAPI Specification](https://swagger.io/specification/)
- [Backend API Gateway URL](https://z0u3xpkz59.execute-api.us-west-2.amazonaws.com/dev)

## License

© 2024 Turing Labs. All rights reserved.
