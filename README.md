# Encore — Culture-Informed Event Experiences

Encore is a culture-informed event planning application that helps organizers transform an initial event brief into a structured, actionable event concept.

By combining cultural signals from the **Qloo API** with a local rule-based planning engine, Encore generates event concepts with music direction, food suggestions, activities, schedules, budget allocations, and organizer checklists.

Organizers can refine generated concepts, inspect the Decision Trace, and export a professionally designed event blueprint as a PDF.

## Table of Contents

- [Features](#features)
- [How It Works](#how-it-works)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Configure Environment Variables](#configure-environment-variables)
- [Run the Application Locally](#run-the-application-locally)
- [Using Encore](#using-encore)
- [Production Build](#production-build)
- [Deploy to Render](#deploy-to-render)
- [API Endpoints](#api-endpoints)
- [Troubleshooting](#troubleshooting)
- [Security](#security)
- [Limitations](#limitations)
- [License](#license)

## Features

### 1. Event Brief

Provide the information needed to plan an event, including:

- Event name
- Event type
- Target audience
- Location
- Budget level
- Desired atmosphere
- Cultural or music interest

### 2. Qloo Cultural Intelligence

Encore queries the Qloo API for relevant cultural entities and uses the returned signals as inspiration for event planning.

For example, an Afrobeats-focused brief may retrieve relevant artist recommendations that inform the proposed music direction.

### 3. Event Concept Generation

Encore's local planning engine transforms the event brief and available cultural signals into a structured plan that can include:

- Event title and concept
- Audience fit
- Cultural rationale
- Music direction
- Food suggestions
- Activities
- Event schedule
- Budget allocations
- Atmosphere direction
- Organizer checklist

### 4. Interactive Refinement

Organizers can refine the generated plan, including requests to:

- Make the event more affordable
- Add more networking
- Create a more relaxed atmosphere
- Strengthen the Ghanaian cultural identity

### 5. Decision Trace

The Decision Trace presents the relationship between the event brief, cultural signals, creative decisions, and proposed attendee experience.

### 6. PDF Event Blueprint

Export the generated plan as a designed PDF document for review, sharing, and further planning.

## How It Works

1. The organizer completes the event brief.
2. The frontend sends the brief to the Express backend.
3. The backend requests relevant cultural information from Qloo.
4. Encore's local planning engine combines the brief and available cultural signals to construct the event concept.
5. The frontend displays the concept and Decision Trace.
6. The organizer can refine the plan and export the event blueprint.

**Architecture overview**

```text
Organizer
   |
   v
React + Vite Frontend
   |
   v
Node.js + Express Backend
   |
   +----> Qloo Hackathon API
   |
   v
Local Event Planning Engine
   |
   v
Event Concept + Decision Trace
   |
   v
Interactive Results + PDF Export
```

Encore uses a local rule-based planning engine; it does not require a paid LLM API to generate its event concepts.

## Technology Stack

| Technology | Purpose |
|---|---|
| React | User interface |
| Vite | Frontend development server and production build |
| JavaScript | Application logic |
| Node.js | Backend runtime |
| Express | HTTP API and production web server |
| Qloo API | Cultural intelligence and entity recommendations |
| jsPDF | PDF blueprint generation |
| Git and GitHub | Version control and source hosting |
| Render | Production hosting |

## Project Structure

```text
Encore/
├── backend/
│   ├── src/
│   │   ├── server.js
│   │   ├── qloo.js
│   │   └── eventPlanner.js
│   ├── .env
│   ├── .gitignore
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── src/
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   ├── package-lock.json
│   └── dist/                 # Generated during production build
│
├── .env.example
├── .gitignore
├── LICENSE
└── README.md
```

The `dist/` directory is generated during the frontend production build and generally should not be committed to Git.

## Prerequisites

Install the following before running Encore locally:

- **Node.js:** Use a supported Node.js LTS release compatible with the project's dependencies.
- **npm:** Included with Node.js.
- **Git:** Required to clone the repository.
- **Qloo API key:** A valid key authorized for the Qloo hackathon API.
- **Code editor:** Visual Studio Code is recommended.

Verify your installations:

```bash
node --version
npm --version
git --version
```

## Getting Started

### 1. Clone the repository

Replace the URL below with your repository URL if it changes.

```bash
git clone https://github.com/A-Kiwams/Encore.git
cd Encore
```

### 2. Install backend dependencies

From the repository root:

```bash
npm install --prefix backend
```

### 3. Install frontend dependencies

```bash
npm install --prefix frontend
```

### 4. Configure environment variables

Create a file named `.env` inside the `backend/` directory.

The path should be:

```text
Encore/backend/.env
```

Add the following configuration:

```dotenv
QLOO_API_KEY=your_actual_qloo_api_key
QLOO_BASE_URL=https://hackathon.api.qloo.com
PORT=3000
```

Replace `your_actual_qloo_api_key` with your own authorized Qloo hackathon API key.

**Never commit the real key to GitHub.** Keep it in your local backend environment file or your hosting provider's private environment settings.

If you already have a working `backend/.env`, preserve it rather than overwriting it.

### 5. Verify `.gitignore`

Ensure that your repository excludes secret environment files and generated dependencies.

Recommended entries:

```gitignore
node_modules/
.env
.env.*
!.env.example
dist/
.DS_Store
```

The `.env.example` file should contain placeholder values only.

## Run the Application Locally

Encore uses two development servers during local development: one for the backend and one for the frontend.

### Terminal 1 — Start the backend

From the repository root:

```bash
cd backend
npm start
```

If your backend package defines a different development script, use the script listed in `backend/package.json`.

The backend should start on the configured port, typically:

```text
http://localhost:3000
```

Check the health endpoint, if enabled:

```text
http://localhost:3000/api/health
```

A successful response confirms that the backend is reachable.

### Terminal 2 — Start the frontend

Open a second terminal at the repository root:

```bash
cd frontend
npm run dev
```

Vite will print a local development URL, usually:

```text
http://localhost:5173
```

Open that URL in your browser.

The frontend's Vite configuration proxies `/api` requests to the backend at `http://localhost:3000`. Make sure the backend is running while using the frontend.

## Using Encore

1. Open the application in your browser.
2. Complete the event brief.
3. Choose the audience, location, budget, atmosphere, and cultural interest.
4. Generate the event concept.
5. Review the event recommendations and Qloo cultural signals.
6. Inspect the Decision Trace.
7. Use the refinement controls to adapt the concept.
8. Export the event blueprint as a PDF.

If cultural recommendations cannot be retrieved, check the backend logs and verify the Qloo API configuration.

## Production Build

The production setup builds the React frontend and serves the resulting static files through the Express backend.

From the repository root, run:

```bash
npm install --prefix backend
npm install --include=dev --prefix frontend
npm run build --prefix frontend
```

The frontend build should create:

```text
frontend/dist/
```

The backend's production server should serve the files in that directory and provide the API endpoints under `/api/`.

Start the backend:

```bash
npm start --prefix backend
```

Open:

```text
http://localhost:3000
```

The root URL should load the Encore interface in production mode. The API health endpoint, when enabled, should be available at `/api/health`.

## Deploy to Render

Encore can be deployed as a single Render Web Service, with the frontend and backend hosted together.

### 1. Connect the repository

1. Sign in to Render.
2. Select **New → Web Service**.
3. Connect the public Encore GitHub repository.
4. Configure the service as follows.

### 2. Configure the build

| Setting | Value |
|---|---|
| Runtime | Node |
| Root Directory | Leave blank |
| Build Command | See below |
| Start Command | `npm start --prefix backend` |

Build command:

```bash
npm install --prefix backend && npm install --include=dev --prefix frontend && npm run build --prefix frontend
```

The `--include=dev` option ensures that Vite and other frontend development dependencies are installed for the build.

### 3. Configure environment variables

In the Render service's Environment settings, add:

| Variable | Value |
|---|---|
| `QLOO_API_KEY` | Your private Qloo hackathon API key |
| `QLOO_BASE_URL` | `https://hackathon.api.qloo.com` |
| `NODE_ENV` | `production` |

Render provides the `PORT` environment variable for web services. The Express application should listen on `process.env.PORT || 3000`.

Do not place the actual API key in GitHub, the frontend, or the README.

### 4. Deploy and test

Create the service or deploy the latest commit.

After deployment, test:

- The public application URL loads.
- Event generation works.
- Qloo recommendations are returned.
- Refinement and Decision Trace work.
- PDF export completes successfully.

If you change the source code, commit and push your changes to GitHub, then trigger a new deployment if automatic deployment is not enabled.

## API Endpoints

The backend exposes API routes for application health, Qloo recommendations, event briefs, and event generation.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Backend health check, if enabled |
| GET | `/api/qloo/test` | Test Qloo connectivity |
| GET | `/api/qloo/recommendations` | Retrieve cultural recommendations |
| POST | `/api/events/brief` | Submit or process an event brief |
| POST | `/api/events/generate` | Generate an event concept |

The exact request and response schemas depend on the implementation in `backend/src/server.js` and `backend/src/qloo.js`.

Example event generation request:

```http
POST /api/events/generate
Content-Type: application/json
```

The request body should contain the event brief fields expected by the backend, such as event name, event type, audience, location, budget, atmosphere, and cultural tag.

Example request body:

```json
{
  "eventName": "Accra Creative Night",
  "eventType": "Networking event",
  "audience": "Young professionals and creatives",
  "location": "Accra, Ghana",
  "budget": "Moderate",
  "atmosphere": "Energetic, colorful, welcoming",
  "culturalTag": "urn:tag:genre:music:afrobeats"
}
```

This example illustrates the intended input structure. If your frontend uses different field names or defaults, follow the actual request body in the current implementation.

## Troubleshooting

### `vite: not found`

Ensure frontend development dependencies are installed:

```bash
npm install --include=dev --prefix frontend
npm run build --prefix frontend
```

On Render, confirm the build command includes `--include=dev`.

### `ENOENT: package.json not found`

Make sure Render's Root Directory is blank when using the repository-root build commands. Confirm that both `backend/package.json` and `frontend/package.json` are present in GitHub.

### Qloo returns an error

Verify that:

- `QLOO_API_KEY` is configured correctly.
- `QLOO_BASE_URL` is `https://hackathon.api.qloo.com`.
- The API key is valid and authorized for the hackathon API.
- The backend is using the correct request headers and endpoint parameters.

Never print the full API key in application logs.

### The frontend loads, but API requests fail

Confirm that the backend is running, the frontend uses the correct `/api` paths, and the Express server registers API routes before its frontend catch-all route.

For production, verify that `frontend/dist` exists and the Express static-file path resolves to the correct directory.

### PDF export fails

Check the browser console for errors and verify that `jspdf` is installed in the frontend dependencies.

Run:

```bash
npm install --prefix frontend
npm run build --prefix frontend
```

### The first request to Render is slow

Free hosting instances may spin down after inactivity. The first request can take longer while the service starts again.

## Security

- Keep the Qloo API key on the backend.
- Never commit `.env` files or real credentials.
- Do not expose the key through frontend environment variables, browser code, or client-side requests.
- Store production secrets in Render's private environment settings.
- If a key is accidentally exposed, revoke or rotate it promptly.
- Validate and sanitize incoming event briefs before processing them.

## Limitations

- Cultural recommendations depend on the availability and response of the Qloo API.
- Generated schedules, activities, and recommendations should be reviewed by the organizer before the event is executed.

## License

This project is distributed under the MIT License. See the [`LICENSE`](LICENSE) file for details.
