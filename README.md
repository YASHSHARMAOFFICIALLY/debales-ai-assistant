# Debales AI Multi tenant Assistant

A product-style multi tenant AI assistant built for the Debales AI Full Stack Developer internship assignment.

The app has a tenant scoped chat product, server side authorization, simulated integrations, real AI provider support, and an admin only dashboard whose layout and widgets are rendered from MongoDB configuration.

![Next.js](https://img.shields.io/badge/Next.js-App%20Router-black?logo=nextdotjs)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwindcss&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)
![TanStack Query](https://img.shields.io/badge/TanStack-Query-FF4154?logo=reactquery&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-Validation-3E67B1)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)

## What This Project Shows

- Multi tenant project model with project-scoped product instances, users, conversations, and messages.
- Server side authorization for project access and admin-only dashboard access.
- Layered backend: access rules, services, route handlers, client hooks, and UI.
- Chat product with conversations, messages, loading states, and integration step lines.
- MongoDB driven admin dashboard where changing a database document, or using the admin config editor, changes the dashboard UI.
- Admin only integration toggles for Shopify-style and CRM-style signals.
- Chat polish: avatars, timestamps, lightweight markdown rendering, and typewriter reveal for new assistant replies.
- Controlled AI flow through the service layer with Gemini/OpenRouter support and safe fallback behavior.
- Clean local setup with seed data, Docker support, tests, and a clear README.

## Feature Map

| Feature | What it demonstrates | Main files |
| --- | --- | --- |
| Project list | Current user only sees projects they can access | `src/components/project-list.tsx`, `src/lib/services/projects.ts` |
| Tenant workspace | Project slug loads tenant-scoped product instances | `src/app/projects/[projectSlug]/page.tsx`, `src/app/api/projects/[projectSlug]/route.ts` |
| Chat product | Conversations, new chat, messages, step lines, loading and error states | `src/components/chat-workspace.tsx`, `src/lib/services/conversations.ts` |
| Controlled AI flow | Service builds prompt from tenant, product, recent messages, and integration facts | `src/lib/services/ai.ts`, `src/lib/services/conversations.ts` |
| Integration simulation | Shopify-style and CRM-style mock signals, toggleable per product instance | `src/lib/services/integrations.ts`, `src/lib/models.ts` |
| Admin integration toggles | Admin-only UI updates `productinstances.integrations` through a protected route | `src/components/chat-workspace.tsx`, `src/app/api/projects/[projectSlug]/product-instances/[productInstanceId]/integrations/route.ts` |
| Admin dashboard renderer | MongoDB `dashboardconfigs.sections.widgets` controls layout and content | `src/components/admin-dashboard.tsx`, `src/lib/services/dashboard.ts` |
| Admin dashboard editor | Admin can edit MongoDB-backed dashboard config from the UI | `src/components/admin-dashboard.tsx`, `src/app/api/projects/[projectSlug]/admin/dashboard/route.ts` |
| Demo authentication | Seeded users, signed session cookie, quick user switching | `src/components/shell.tsx`, `src/lib/services/auth.ts`, `src/lib/auth/jwt.ts` |
| Optional Google OAuth | Real OAuth path with allow-list support | `src/app/api/auth/google/*`, `src/lib/auth/google.ts` |

## Demo Flow

1. Open the app.
2. Select `Acme Retail`.
3. Use the chat product to send a message.
4. Watch the assistant add step lines for tenant analysis and integration checks.
5. Open the admin dashboard as `demo-admin`.
6. Edit the `dashboardconfigs` document in MongoDB, or use the dashboard config editor at the bottom of the admin page.
7. Refresh the admin dashboard and see the UI change without a code change.

## Tech Stack

| Area | Technology |
| --- | --- |
| Framework | Next.js App Router |
| UI | React, TypeScript, Tailwind CSS |
| Server State | TanStack Query |
| API | Next.js Route Handlers |
| Database | MongoDB, Mongoose |
| Validation | Zod |
| AI Providers | Gemini or OpenRouter |
| Testing | Vitest |
| Local Deployment | Docker / Docker Compose |

## Run Locally

Install dependencies:

```bash
npm install
```

Create an environment file:

```bash
cp .env.example .env
```

Start MongoDB locally, then seed the database:

```bash
npm run seed
```

Start the app:

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

Important: `npm run seed` resets the demo collections before inserting sample data. Do not run it against a database that contains production or important personal data.

## Docker Setup

You can run the app and MongoDB with Docker:

```bash
docker compose up --build
```

Then seed MongoDB from another terminal:

```bash
MONGODB_URI=mongodb://127.0.0.1:27017/debales_ai_assignment npm run seed
```

Open:

```txt
http://localhost:3000
```

## Environment Variables

```bash
MONGODB_URI=mongodb://127.0.0.1:27017/debales_ai_assignment

APP_URL=http://localhost:3000
AUTH_JWT_SECRET=replace-with-a-long-random-secret
DEMO_USER_ID=demo-admin
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_ALLOWED_EMAILS=
GOOGLE_DEFAULT_PROJECT_SLUG=acme-retail

AI_PROVIDER=gemini
GEMINI_API_KEY=
GEMINI_MODEL=gemini-1.5-flash

OPENROUTER_API_KEY=
OPENROUTER_MODEL=google/gemini-2.0-flash-exp:free
```

For Vercel, use `.env.vercel.example` as the checklist and add the values in:

```txt
Vercel Project -> Settings -> Environment Variables
```

Minimum required Vercel variables:

```bash
MONGODB_URI=
AUTH_JWT_SECRET=
APP_URL=
DEMO_USER_ID=demo-admin
AI_PROVIDER=gemini
GEMINI_API_KEY=
GEMINI_MODEL=gemini-1.5-flash
```

`APP_URL` must be the deployed Vercel URL, for example:

```txt
https://your-project.vercel.app
```

`AUTH_JWT_SECRET` signs the session cookie. Use a long random value outside local development.

Google OAuth is optional. If `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set, the header shows a Google login button and starts the OAuth flow. If credentials are not configured, the Google button is hidden and the demo login remains available. New Google users receive member access to `GOOGLE_DEFAULT_PROJECT_SLUG` unless `GOOGLE_ALLOWED_EMAILS` is set. When `GOOGLE_ALLOWED_EMAILS` is set, only those comma-separated emails receive project access.

AI keys are optional for local review. If no key is configured, the app uses a deterministic fallback response from `src/lib/services/ai.ts`. If a Gemini or OpenRouter key is provided, the service layer calls the real provider and handles rate-limit responses.

## Seeded Demo Data

The seed script creates two projects:

| Project | Slug | Purpose |
| --- | --- | --- |
| Acme Retail | `acme-retail` | Main tenant with Shopify-style and CRM-style integrations enabled |
| Orbit Services | `orbit-services` | Secondary tenant with CRM enabled and Shopify disabled |

Seeded users:

| User | Role |
| --- | --- |
| `demo-admin` | Admin for Acme Retail, member for Orbit Services |
| `demo-member` | Member for Acme Retail |

The header button switches between the seeded demo users.

## Project Structure

```txt
src/
  app/
    api/               Next.js Route Handlers
    projects/          Dynamic tenant pages
    layout.tsx         Root app layout and query provider wrapper
    page.tsx           Project picker
  components/          Client UI components and rendered app surfaces
  lib/
    auth/              JWT and Google OAuth helpers
    access.ts          Pure access rules
    client/            Fetch functions and TanStack Query hooks
    services/          Business logic, data access, integrations, AI flow
    db.ts              MongoDB connection
    models.ts          Mongoose models
    schemas.ts         Zod schemas and DTO types
    serializers.ts     Mongoose document to DTO mapping
scripts/
  seed.ts              Demo data seeding
```

Important component boundaries:

- `src/components/project-list.tsx` renders the project picker.
- `src/components/chat-workspace.tsx` renders the tenant chat product and admin-only integration toggles.
- `src/components/admin-dashboard.tsx` renders the config-driven admin dashboard and the admin config editor.
- `src/components/shell.tsx` renders the app shell, demo user switch, Google login button, and project navigation.

## Backend Architecture

The backend follows the required layer order:

```txt
Access rules -> Services -> Route Handlers -> Client Hooks -> UI
```

- `src/lib/access.ts` contains pure role checks such as project access and admin access.
- `src/lib/services/*` contains business logic and database access.
- `src/app/api/**/route.ts` files are thin route handlers.
- `src/lib/client/hooks.ts` exposes TanStack Query hooks.
- UI components only call hooks. They do not import Mongoose models or query MongoDB directly.

Every tenant/session page is explicitly dynamic with:

```ts
export const dynamic = "force-dynamic";
```

### Request Flow Examples

Chat message:

```txt
UI form submit
-> useSendMessage()
-> POST /api/projects/:projectSlug/conversations/:conversationId/messages
-> Zod validates params/body
-> getCurrentUser()
-> sendMessage() service
-> assertProjectAccess()
-> verify conversation belongs to project + product instance
-> buildIntegrationContext()
-> generateAssistantReply()
-> save conversation
-> return serialized DTO
```

Admin dashboard read:

```txt
Admin page
-> useDashboard()
-> GET /api/projects/:projectSlug/admin/dashboard
-> Zod validates params
-> getCurrentUser()
-> getDashboardConfig() service
-> assertAdminAccess()
-> read dashboardconfigs by projectId
-> render sections/widgets from MongoDB
```

Admin dashboard edit:

```txt
Dashboard Config Editor
-> useUpdateDashboard()
-> PATCH /api/projects/:projectSlug/admin/dashboard
-> Zod validates title/subtitle/sections/widgets
-> assertAdminAccess()
-> update dashboardconfigs document
-> TanStack Query updates cached dashboard
-> UI re-renders from saved config
```

Integration toggle:

```txt
Admin clicks Shopify/CRM toggle
-> useUpdateProductIntegrations()
-> PATCH /api/projects/:projectSlug/product-instances/:productInstanceId/integrations
-> Zod validates booleans
-> assertAdminAccess()
-> update productinstances.integrations
-> workspace query invalidates
-> next chat message reflects new toggles
```

## API Routes

| Route | Method | Purpose |
| --- | --- | --- |
| `/api/me` | `GET` | Return current user |
| `/api/me` | `POST` | Switch seeded demo user |
| `/api/auth/config` | `GET` | Tell UI whether Google OAuth is configured |
| `/api/auth/google` | `GET` | Start Google OAuth |
| `/api/auth/google/callback` | `GET` | Complete Google OAuth |
| `/api/auth/logout` | `POST` | Clear session |
| `/api/projects` | `GET` | List projects available to current user |
| `/api/projects/[projectSlug]` | `GET` | Load tenant workspace and product instances |
| `/api/projects/[projectSlug]/conversations` | `GET` | List tenant conversations |
| `/api/projects/[projectSlug]/conversations` | `POST` | Create tenant conversation |
| `/api/projects/[projectSlug]/conversations/[conversationId]` | `GET` | Load one conversation |
| `/api/projects/[projectSlug]/conversations/[conversationId]/messages` | `POST` | Send user message and create assistant reply |
| `/api/projects/[projectSlug]/admin/dashboard` | `GET` | Load admin-only dashboard config |
| `/api/projects/[projectSlug]/admin/dashboard` | `PATCH` | Update admin-only dashboard config |
| `/api/projects/[projectSlug]/product-instances/[productInstanceId]/integrations` | `PATCH` | Admin-only integration toggle update |

## Multi-tenant Model

`Project` is the tenant boundary.

All important data is scoped through a project:

- `ProductInstance.projectId`
- `Conversation.projectId`
- `Conversation.productInstanceId`
- `DashboardConfig.projectId`
- `User.projectRoles[]`

Before returning or changing tenant data, services check the current user on the server. The UI never decides whether access is allowed.

## Database Collections

| Collection | Purpose | Tenant relationship |
| --- | --- | --- |
| `projects` | Tenant records such as Acme Retail and Orbit Services | Root tenant boundary |
| `users` | Seeded/demo or Google users with project roles | `projectRoles[].projectId` |
| `productinstances` | Product installed for a project, including integration toggles and shell nav | `projectId` |
| `conversations` | Chat threads and embedded messages | `projectId`, `productInstanceId` |
| `dashboardconfigs` | Admin dashboard layout, sections, and widgets | `projectId` |

The important security rule is that tenant data is always queried through `projectId`, and services check the user's role before returning or mutating it.

## Architecture Decisions

- `Project` is the tenant boundary. All product instances, conversations, messages, and dashboard configs are queried through the project.
- JWT session cookies identify the current user. Server services still enforce project and admin access for every tenant read.
- Client routes and UI never decide whether a user can open a project or admin dashboard.
- Conversations are checked against both `projectId` and `productInstanceId` before messages are appended.
- The admin dashboard config is a separate collection so layout/content can change without deploying code.
- AI calls are isolated in the service layer so provider choice, rate-limit behavior, and fallback logic stay outside the UI.

## Admin Dashboard Config

The required config-driven UI lives in the `dashboardconfigs` collection.

The admin page reads this document:

```txt
dashboardconfigs -> sections -> widgets
```

The renderer supports these widget types:

- `metric`
- `list`
- `status`

The admin config editor can update dashboard title, subtitle, section title, section description, column count, and widget content. This editor still writes to the same MongoDB config document, so the dashboard remains database-driven.

Example dashboard config:

```json
{
  "projectId": "ObjectId(...)",
  "title": "Acme Retail Admin Console",
  "subtitle": "This entire dashboard body is rendered from MongoDB config.",
  "sections": [
    {
      "id": "health",
      "title": "Tenant Health",
      "columns": 3,
      "widgets": [
        {
          "id": "active-users",
          "type": "metric",
          "label": "Active users",
          "value": "42",
          "helper": "+8 this week",
          "tone": "moss"
        },
        {
          "id": "risk",
          "type": "status",
          "label": "Commerce sync",
          "status": "healthy",
          "detail": "Shopify-style mock sync enabled"
        }
      ]
    }
  ]
}
```

## How To Prove The Admin Dashboard Is Config-driven

1. Run the app.
2. Login as `demo-admin`.
3. Open `/projects/acme-retail/admin`.
4. Open MongoDB Compass or `mongosh`.
5. Edit the `dashboardconfigs` document for Acme Retail.
6. Refresh only the admin dashboard.
7. The dashboard changes without changing code.

Example edit:

```js
db.dashboardconfigs.updateOne(
  { title: "Acme Retail Admin Console" },
  {
    $set: {
      "sections.0.widgets.0.label": "Active teammates",
      "sections.0.widgets.0.value": "57"
    }
  }
)
```

This is the required proof for the walkthrough video.

## Integrations

The app simulates two integrations:

- Shopify-style commerce data
- CRM-style pipeline data

Integration toggles are stored on each product instance:

```txt
productinstances.integrations.shopify
productinstances.integrations.crm
```

The chat flow reflects those toggles. If an integration is enabled, the service adds mock facts to the AI context. If it is disabled, the step line clearly says it is disabled.

Admins can toggle integrations directly from the chat workspace. The toggle route is server-protected and updates:

```txt
productinstances.integrations
```

The integration service uses richer mock signals and classifies the user's question as commerce, CRM, or mixed intent before selecting facts for the AI prompt.

## AI Behavior

AI calls are controlled by `src/lib/services/ai.ts`.

The UI does not call an AI provider directly. The conversation service builds the tenant context, integration facts, and recent messages, then decides whether to call Gemini/OpenRouter or use the fallback.

Rate limits are handled with a clear fallback message when the provider returns `429`.

## Authentication

The app supports two authentication paths:

- Demo login for assignment review.
- Google OAuth for a more realistic login flow.

Both paths issue a signed JWT session cookie named `session`. The server reads that cookie, resolves the user, and then applies project/admin authorization rules.

Demo users:

- `demo-admin`
- `demo-member`

The header includes a demo user switch so reviewers can quickly test admin/member behavior.

Google OAuth:

- Start route: `/api/auth/google`
- Callback route: `/api/auth/google/callback`
- Logout route: `/api/auth/logout`
- JWT helper: `src/lib/auth/jwt.ts`
- Google helper: `src/lib/auth/google.ts`

To enable Google OAuth locally:

1. Create OAuth credentials in Google Cloud Console.
2. Add this redirect URI:

```txt
http://localhost:3000/api/auth/google/callback
```

3. Set:

```bash
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
APP_URL=http://localhost:3000
AUTH_JWT_SECRET=your-long-random-secret
```

Authorization is still enforced on the server:

- Members can open projects they belong to.
- Only admins can open the project admin dashboard.

## Bonus Features Included

- Config-driven product shell navigation from `productinstances.shellNav`.
- Admin UI for editing MongoDB-backed dashboard sections and widgets.
- Admin UI for toggling product integrations.
- Unit tests for pure access rules and Zod schemas.
- `data-testid` attributes on main UI regions.
- Real AI provider support with fallback and rate-limit handling.
- Docker support for local review.

## Verification

Run tests:

```bash
npm run test
```

Build the app:

```bash
npm run build
```

Current verification:

- `npm run test` passes.
- `npm run build` passes.
- Build output shows app routes as dynamic server-rendered routes.

## Submission Notes

For the final submission, include:

- Git repository or zip.
- This README.
- A 5-10 minute video walkthrough.
- In the video, show a MongoDB edit to the `dashboardconfigs` document and refresh the admin dashboard.
- Mention that the chat/product area is normal React routing, while the admin dashboard is the required MongoDB config-driven surface.
