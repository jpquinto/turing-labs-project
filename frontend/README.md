# Turing Labs Frontend

A modern Next.js frontend for the Turing Labs trial management system, built with React, TypeScript, and shadcn/ui components.

## Overview

This frontend application provides a comprehensive interface for managing taste test trials, recipes, participants, and submissions for sugar reduction experiments.

## Features

- **Dashboard**: Overview of all system entities
- **Trials Management**: Create and monitor taste test trials
- **Recipe Management**: View and manage sugar reduction recipe formulations
- **Participant Tracking**: Monitor participant progress and assignments
- **Submissions**: Review and analyze taste test submissions
- **Testing Session Interface**: Interactive interface for conducting taste tests (inspired by the testing-session-interface.html mockup)

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **UI Components**: shadcn/ui (Radix UI + Tailwind CSS)
- **Styling**: Tailwind CSS v4
- **HTTP Client**: Axios
- **Fonts**: Geist Sans & Geist Mono

## Project Structure

```
frontend/
├── app/                          # Next.js app directory
│   ├── layout.tsx               # Root layout with navigation
│   ├── page.tsx                 # Dashboard home page
│   ├── trials/
│   │   ├── page.tsx            # Trials list
│   │   └── [trial_id]/
│   │       ├── page.tsx        # Trial detail
│   │       └── session/
│   │           └── page.tsx    # Testing session interface
│   ├── recipes/
│   │   ├── page.tsx            # Recipes list
│   │   └── [recipe_id]/
│   │       └── page.tsx        # Recipe detail
│   ├── participants/
│   │   ├── page.tsx            # Participants list
│   │   └── [participant_id]/
│   │       └── page.tsx        # Participant detail
│   └── submissions/
│       ├── page.tsx            # Submissions list
│       └── [submission_id]/
│           └── page.tsx        # Submission detail
├── components/
│   ├── Navigation.tsx           # Main navigation component
│   └── ui/                      # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── badge.tsx
│       ├── input.tsx
│       ├── table.tsx
│       └── separator.tsx
├── types/                       # TypeScript type definitions
│   ├── trial.ts
│   ├── recipe.ts
│   ├── participant.ts
│   ├── submission.ts
│   ├── user.ts
│   └── index.ts
├── lib/
│   └── utils.ts                 # Utility functions
└── actions/                     # Next.js server actions for API calls
    ├── trials/
    │   ├── get_trial.ts
    │   ├── get_trials.ts
    │   ├── create_trial.ts
    │   └── index.ts
    ├── recipes/
    │   ├── get_recipe.ts
    │   ├── get_recipes.ts
    │   ├── get_recipes_by_trial.ts
    │   ├── create_recipe.ts
    │   └── index.ts
    ├── participants/
    │   ├── get_participant.ts
    │   ├── get_participants.ts
    │   ├── get_participant_by_code.ts
    │   ├── create_participant.ts
    │   └── index.ts
    └── submissions/
        ├── get_submission.ts
        ├── get_submissions.ts
        ├── get_submissions_by_trial.ts
        ├── get_submissions_by_recipe.ts
        ├── get_submissions_by_participant.ts
        ├── create_submission.ts
        ├── update_submission.ts
        └── index.ts
```

## Database Schema

The frontend is built around the following entities:

### Trial
- `trial_id`: Unique identifier
- `status`: Trial status (e.g., active, completed)
- `trial_date`: Date of the trial

### Recipe
- `recipe_id`: Unique identifier
- `trial_id`: Associated trial
- `recipe_name`: Name of the recipe
- `sugar`: Sugar amount in grams
- `stevia_extract`: Stevia extract amount in grams
- `allulose`: Allulose amount in grams
- `citric_acid`: Citric acid amount in grams
- `target_sugar_reduction_percent`: Target sugar reduction percentage
- `target_cost_per_unit`: Target cost per unit
- `prediction`: Optional AI prediction

### Participant
- `participant_id`: Unique identifier
- `trial_id`: Associated trial
- `code`: Participant code
- `tasks_assigned`: Number of tasks assigned
- `tasks_completed`: Number of tasks completed

### Submission
- `submission_id`: Unique identifier
- `recipe_id`: Associated recipe
- `trial_id`: Associated trial
- `participant_id`: Associated participant
- `score`: Rating score (1-10)
- `status`: Draft or saved
- `notes`: Optional text notes
- `voice_memo_key`: Optional voice recording reference
- `last_updated`: Timestamp of last update

### User
- `user_id`: Unique identifier
- `first_name`: User's first name
- `last_name`: User's last name

## Getting Started

### Prerequisites

- Node.js 20+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install
```

### Environment Variables

Create a `.env.local` file:

```env
# Backend API URL for server actions
BACKEND_API_URL=https://your-api-gateway-url.amazonaws.com/prod

# Or for local development:
# BACKEND_API_URL=http://localhost:3001
```

### Development

```bash
# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## API Integration

The frontend communicates with a backend REST API using **Next.js Server Actions**. All API calls are organized in the `actions/` directory:

### Server Actions Structure

Each entity has its own folder with dedicated server actions:

**Trials** (`actions/trials/`):
- `getTrial` - Get a single trial by ID
- `getTrials` - List all trials
- `createTrial` - Create a new trial

**Recipes** (`actions/recipes/`):
- `getRecipe` - Get a single recipe by ID and trial ID (composite key)
- `getRecipes` - List all recipes
- `getRecipesByTrial` - Get all recipes for a specific trial
- `createRecipe` - Create a new recipe

**Participants** (`actions/participants/`):
- `getParticipant` - Get a single participant by ID
- `getParticipants` - List all participants
- `getParticipantByCode` - Get a participant by their code
- `createParticipant` - Create a new participant

**Submissions** (`actions/submissions/`):
- `getSubmission` - Get a single submission by ID and recipe ID (composite key)
- `getSubmissions` - List all submissions
- `getSubmissionsByTrial` - Get all submissions for a specific trial
- `getSubmissionsByRecipe` - Get all submissions for a specific recipe
- `getSubmissionsByParticipant` - Get all submissions for a specific participant
- `createSubmission` - Create a new submission
- `updateSubmission` - Update an existing submission

### Environment Variables

Server actions use the `BACKEND_API_URL` environment variable to connect to the API:

```env
BACKEND_API_URL=https://your-api-gateway-url.amazonaws.com/prod
```

### Note on Composite Keys

Some entities (Recipes, Submissions) use composite primary keys in DynamoDB:
- **Recipe**: `recipe_id` + `trial_id`
- **Submission**: `submission_id` + `recipe_id`

Detail pages for these entities currently require both keys. Users should navigate to these pages from parent entities (e.g., view a recipe from within a trial view) to ensure all required keys are available.

## Key Pages

### Dashboard (`/`)
Central hub showing quick access to all main entities with overview cards.

### Trials List (`/trials`)
Browse all trials with status indicators and date information.

### Trial Detail (`/trials/[trial_id]`)
View detailed trial information including:
- Associated recipes
- Submissions progress
- Participant statistics
- Option to start a testing session

### Testing Session (`/trials/[trial_id]/session`)
Interactive interface for conducting taste tests, featuring:
- Recipe tabs for easy navigation
- Participant selection
- Score sliders (1-10 rating)
- Text notes input
- Real-time progress tracking
- Based on the design from `testing-session-interface.html`

### Recipes List (`/recipes`)
Browse all recipe formulations with ingredient breakdowns.

### Recipe Detail (`/recipes/[recipe_id]`)
Detailed recipe view showing:
- Formulation details
- Target metrics
- AI predictions
- Associated submissions

### Participants List (`/participants`)
Table view of all participants with progress tracking.

### Participant Detail (`/participants/[participant_id]`)
Individual participant view showing:
- Task completion progress
- Associated trial
- All submissions
- Average scores

### Submissions List (`/submissions`)
Comprehensive list of all submissions with filtering options (all/saved/drafts).

### Submission Detail (`/submissions/[submission_id]`)
Detailed submission view including:
- Score visualization
- Related entities (participant, recipe, trial)
- Notes and voice memo (if available)
- Metadata

## Design System

### Colors
- Primary: Blue (used for CTAs and interactive elements)
- Status badges: Green (completed), Gray (pending), Blue (active)
- Background: Zinc palette for light/dark modes

### Components
All UI components follow the shadcn/ui design system, ensuring:
- Consistent styling
- Accessibility compliance
- Dark mode support
- Responsive design

### Typography
- Headings: Geist Sans
- Monospace (IDs, codes): Geist Mono
- Body: Geist Sans

## Future Enhancements

- [ ] Real-time updates with WebSockets
- [ ] Voice memo recording and playback
- [ ] Advanced filtering and search
- [ ] Data visualization charts
- [ ] Export functionality
- [ ] Authentication integration
- [ ] Offline support
- [ ] Mobile app version

## Contributing

When adding new features:
1. Create types in the `types/` directory
2. Add API functions in `lib/api.ts`
3. Use shadcn/ui components for consistency
4. Follow the established page structure pattern
5. Ensure responsive design
6. Add proper error handling

## License

This project is part of the Turing Labs take-home assessment.
