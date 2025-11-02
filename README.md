# Castify

## Project Description

Castify is a webapp that allows people to upload documents, either individually or as projects, and uses an LLM + text-to-speech system to create 'Podcasts' based on the document(s). This is perfect for busy people that need to consume the content of documents and want it in a more digestible format for when they are on the move or too busy to sit down and read a document.

---

## Technical Architecture Outline

### **1. Technology Stack**

#### Full-Stack Framework
- **Framework**: Next.js 14+ (App Router)
- **Runtime**: Node.js (v18+ recommended)
- **Language**: TypeScript (recommended) or JavaScript

#### Backend (Next.js API Routes)
- **API**: Next.js API Routes + Route Handlers
- **Database**: Supabase (PostgreSQL with built-in auth & storage)
- **Authentication**: Supabase Auth (built-in)
- **File Storage**: Supabase Storage
- **AI/LLM**: OpenAI API (GPT-4 for content summarization/conversion)
- **Text-to-Speech**: OpenAI TTS API or ElevenLabs API
- **Server Actions**: Next.js Server Actions (for mutations)

#### Frontend (Next.js)
- **UI Library**: Tailwind CSS + shadcn/ui
- **State Management**: React Server Components + React Query / SWR
- **HTTP Client**: Fetch API or Axios
- **Forms**: React Hook Form + Zod validation
- **Audio Player**: react-audio-player or custom component

#### DevOps
- **Package Manager**: npm or yarn
- **Build Tool**: Next.js (built-in)
- **Version Control**: Git
- **Deployment**: Vercel (recommended) or other platforms

---

### **2. Project Structure**

```
Castify/
├── app/                          # Next.js App Router
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── signup/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── documents/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── projects/
│   │   │   ├── page.tsx
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx
│   │   │   └── new/
│   │   │       └── page.tsx
│   │   └── podcasts/
│   │       ├── page.tsx
│   │       ├── [id]/
│   │       │   └── page.tsx
│   │       └── generate/
│   │           └── page.tsx
│   ├── api/
│   │   ├── auth/
│   │   │   ├── callback/
│   │   │   │   └── route.ts
│   │   │   └── refresh/
│   │   │       └── route.ts
│   │   ├── documents/
│   │   │   ├── upload/
│   │   │   │   └── route.ts
│   │   │   ├── [id]/
│   │   │   │   └── route.ts
│   │   │   └── route.ts
│   │   ├── projects/
│   │   │   ├── [id]/
│   │   │   │   ├── route.ts
│   │   │   │   └── documents/
│   │   │   │       └── route.ts
│   │   │   └── route.ts
│   │   └── podcasts/
│   │       ├── generate/
│   │       │   └── route.ts
│   │       ├── [id]/
│   │       │   ├── route.ts
│   │       │   └── status/
│   │       │       └── route.ts
│   │       └── route.ts
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   ├── loading.tsx               # Loading UI
│   └── error.tsx                 # Error UI
│
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── SignupForm.tsx
│   │   └── ProtectedRoute.tsx
│   ├── documents/
│   │   ├── DocumentUpload.tsx
│   │   ├── DocumentList.tsx
│   │   ├── DocumentCard.tsx
│   │   └── DocumentPreview.tsx
│   ├── projects/
│   │   ├── ProjectCard.tsx
│   │   ├── ProjectForm.tsx
│   │   ├── ProjectList.tsx
│   │   └── AddDocumentDialog.tsx
│   ├── podcasts/
│   │   ├── PodcastPlayer.tsx
│   │   ├── PodcastList.tsx
│   │   ├── PodcastCard.tsx
│   │   ├── PodcastGenerate.tsx
│   │   └── PodcastStatus.tsx
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Footer.tsx
│   │   └── DashboardLayout.tsx
│   └── ui/                       # shadcn/ui components
│       ├── button.tsx
│       ├── input.tsx
│       ├── modal.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       └── ...
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts            # Supabase browser client
│   │   ├── server.ts            # Supabase server client
│   │   └── middleware.ts        # Supabase auth middleware
│   ├── services/
│   │   ├── aiService.ts         # OpenAI LLM integration
│   │   ├── ttsService.ts        # Text-to-speech
│   │   ├── fileParser.ts        # PDF/DOCX/TXT parsing
│   │   ├── documentProcessor.ts
│   │   └── audioService.ts
│   ├── actions/
│   │   ├── auth.ts              # Server actions for auth
│   │   ├── documents.ts         # Server actions for documents
│   │   ├── projects.ts          # Server actions for projects
│   │   └── podcasts.ts          # Server actions for podcasts
│   ├── validations/
│   │   └── schemas.ts           # Zod schemas
│   └── utils/
│       ├── helpers.ts
│       └── constants.ts
│
├── hooks/
│   ├── useAuth.ts
│   ├── useDocuments.ts
│   ├── useProjects.ts
│   ├── usePodcasts.ts
│   └── useSupabase.ts
│
├── types/
│   ├── database.ts              # Supabase generated types
│   ├── document.ts
│   ├── project.ts
│   ├── podcast.ts
│   └── auth.ts
│
├── public/
│   ├── images/
│   └── icons/
│
├── supabase/
│   ├── migrations/
│   │   ├── 20240101000000_initial_schema.sql
│   │   └── ...
│   └── functions/               # Edge Functions (optional)
│       └── generate-podcast/
│
├── .env.local
├── .env.example
├── .gitignore
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

### **3. Database Schema (Supabase PostgreSQL)**

**Note**: Supabase uses PostgreSQL with Row Level Security (RLS). User authentication is handled by Supabase Auth.

```sql
-- Documents table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size BIGINT NOT NULL,
  storage_path TEXT NOT NULL,  -- Supabase Storage path
  status TEXT NOT NULL DEFAULT 'uploaded', -- uploaded, processing, processed, error
  content TEXT,  -- Extracted text content
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project-Document join table
CREATE TABLE project_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, document_id)
);

-- Podcasts table
CREATE TABLE podcasts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  audio_url TEXT,  -- Supabase Storage URL
  duration INTEGER,  -- in seconds
  status TEXT NOT NULL DEFAULT 'pending',  -- pending, processing, completed, error
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Podcast-Document join table
CREATE TABLE podcast_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  podcast_id UUID NOT NULL REFERENCES podcasts(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(podcast_id, document_id)
);

-- Row Level Security (RLS) Policies
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE podcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE podcast_documents ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own documents" ON documents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents" ON documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents" ON documents
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents" ON documents
  FOR DELETE USING (auth.uid() = user_id);

-- Similar policies for other tables...
CREATE POLICY "Users can view own projects" ON projects
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own project documents" ON project_documents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_documents.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view own podcasts" ON podcasts
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own podcast documents" ON podcast_documents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM podcasts
      WHERE podcasts.id = podcast_documents.podcast_id
      AND podcasts.user_id = auth.uid()
    )
  );

-- Indexes for performance
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_podcasts_user_id ON podcasts(user_id);
CREATE INDEX idx_project_documents_project_id ON project_documents(project_id);
CREATE INDEX idx_project_documents_document_id ON project_documents(document_id);
CREATE INDEX idx_podcast_documents_podcast_id ON podcast_documents(podcast_id);
```

**Storage Buckets** (in Supabase Storage):
- `documents` - Uploaded document files
- `podcasts` - Generated audio files

---

### **4. Core Features & Implementation Flow**

#### **4.1 User Authentication** (Supabase Auth)
- **Register**: Email/password signup with Supabase Auth
- **Login**: Supabase handles JWT tokens automatically
- **Session Management**: Automatic session handling via Supabase client
- **Protected Routes**: Next.js middleware with Supabase auth check
- **OAuth**: Built-in support for Google, GitHub, etc. (optional)

#### **4.2 Document Upload**
- **Individual Upload**: Single document upload via Supabase Storage
- **Supported Formats**: PDF, DOCX, TXT, MD
- **Storage**: Supabase Storage buckets
- **Upload Flow**: Client → Next.js API Route → Supabase Storage
- **Parsing**: Extract text using libraries (pdf-parse, mammoth, etc.)
- **Status Tracking**: Upload → Processing → Processed

#### **4.3 Project Management**
- **Create Project**: Name and description
- **Add Documents**: Associate multiple documents
- **List/View**: CRUD operations for projects

#### **4.4 Podcast Generation** (Core Feature)
**Workflow:**
1. User selects document(s) or project from dashboard
2. Click "Generate Podcast" button
3. **API Trigger**: POST to `/api/podcasts/generate`
4. **Document Processing**:
   - Fetch documents from Supabase (with RLS)
   - Download files from Supabase Storage
   - Parse/extract text from documents (pdf-parse, mammoth, etc.)
   - Combine if multiple documents
5. **LLM Processing**:
   - Send extracted text to OpenAI GPT-4 via `aiService`
   - Prompt: "Convert this document into a podcast-style conversation between two hosts discussing the key points naturally and engagingly"
   - Receive conversational transcript
6. **Text-to-Speech**:
   - Send transcript to TTS API (OpenAI or ElevenLabs)
   - Generate audio file (MP3/WAV)
7. **Storage & Save**:
   - Upload audio file to Supabase Storage `podcasts` bucket
   - Create podcast record in Supabase DB
   - Update status to "completed"
8. **User Notification**: Return podcast ID and audio URL
9. **Async Option**: Use Next.js API route with background processing for long generations

#### **4.5 Podcast Playback**
- **Audio Player**: Web-based player
- **List Podcasts**: User's generated podcasts
- **Download**: Option to download audio files

---

### **5. Key API Endpoints & Server Actions**

#### **Authentication** (Supabase Client + Server Actions)
- Supabase Auth handled client-side with hooks
- `lib/actions/auth.ts`: Server actions for auth operations
- Supabase automatically provides: signUp, signIn, signOut, etc.

#### **Documents** (API Routes in `app/api/documents/`)
- `POST /api/documents/upload` - Upload document via Supabase Storage
- `GET /api/documents` - List user documents (from Supabase DB)
- `GET /api/documents/[id]` - Get document details
- `DELETE /api/documents/[id]` - Delete document & storage file
- `POST /api/documents/[id]/reprocess` - Re-extract text content

#### **Projects** (API Routes in `app/api/projects/`)
- `POST /api/projects` - Create project
- `GET /api/projects` - List user projects
- `GET /api/projects/[id]` - Get project with documents
- `PUT /api/projects/[id]` - Update project
- `DELETE /api/projects/[id]` - Delete project
- `POST /api/projects/[id]/documents` - Add/remove documents from project

#### **Podcasts** (API Routes in `app/api/podcasts/`)
- `POST /api/podcasts/generate` - Generate podcast from documents/project
- `GET /api/podcasts` - List user podcasts
- `GET /api/podcasts/[id]` - Get podcast details & audio URL
- `DELETE /api/podcasts/[id]` - Delete podcast & audio file
- `GET /api/podcasts/[id]/status` - Check generation status

#### **Server Actions** (Recommended for mutations)
- `lib/actions/documents.ts`: createDocument, updateDocument, deleteDocument
- `lib/actions/projects.ts`: createProject, updateProject, deleteProject
- `lib/actions/podcasts.ts`: generatePodcast, deletePodcast

---

### **6. Environment Variables** (`.env.local`)

```env
# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key  # Server-side only

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key

# Text-to-Speech (Optional - can use OpenAI TTS)
ELEVENLABS_API_KEY=your-elevenlabs-key

# File Upload Limits
MAX_FILE_SIZE=10485760  # 10MB in bytes
ALLOWED_MIME_TYPES=application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown

# Optional: Development
NODE_ENV=development
```

---

### **7. Development Phases**

#### **Phase 1: MVP Foundation** (Week 1-2)
- [ ] Setup Next.js project with TypeScript
- [ ] Configure Supabase project (database + storage + auth)
- [ ] Run database migrations and setup RLS policies
- [ ] Implement Supabase authentication (signup, login, protected routes)
- [ ] Basic UI layout with shadcn/ui + Tailwind CSS
- [ ] Setup project structure and routing

#### **Phase 2: Document Management** (Week 3)
- [ ] Implement file upload to Supabase Storage
- [ ] Document parsing service (PDF, DOCX, TXT, MD)
- [ ] Document listing with RLS
- [ ] Document CRUD operations
- [ ] Project CRUD operations with document associations

#### **Phase 3: Core AI Integration** (Week 4-5)
- [ ] OpenAI API integration for LLM
- [ ] Document-to-transcript conversion service
- [ ] TTS API integration (OpenAI or ElevenLabs)
- [ ] Podcast generation API route and workflow
- [ ] Status tracking and error handling
- [ ] Background job processing (optional: Bull or similar)

#### **Phase 4: Audio & Playback** (Week 6)
- [ ] Audio player component
- [ ] Podcast listing with RLS
- [ ] Download functionality from Supabase Storage
- [ ] Streaming support for audio files
- [ ] Progress indicators for generation

#### **Phase 5: Polish & Testing** (Week 7-8)
- [ ] Form validation with Zod + React Hook Form
- [ ] Error handling and user feedback
- [ ] Loading states and UX improvements
- [ ] Performance optimization (caching, pagination)
- [ ] Security review (RLS policies, input sanitization)
- [ ] Testing (unit, integration)
- [ ] Documentation and deployment

---

### **8. Package Dependencies**

#### **Main Dependencies**
```json
{
  "dependencies": {
    "next": "^14.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@supabase/supabase-js": "^2.39.0",
    "@supabase/ssr": "^0.1.0",
    
    "openai": "^4.20.0",
    "pdf-parse": "^1.1.1",
    "mammoth": "^1.6.0",
    
    "react-hook-form": "^7.49.0",
    "zod": "^3.22.0",
    "@hookform/resolvers": "^3.3.0",
    
    "@tanstack/react-query": "^5.17.0",
    "react-audio-player": "^0.17.0",
    
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    
    "lucide-react": "^0.300.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "@types/node": "^20.11.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@types/react-audio-player": "^0.17.0",
    "@types/pdf-parse": "^1.1.4",
    
    "eslint": "^8.56.0",
    "eslint-config-next": "^14.1.0"
  }
}
```

**Key Packages:**
- `next`: Full-stack React framework with App Router
- `@supabase/supabase-js`: Supabase client library
- `@supabase/ssr`: Supabase SSR helpers for Next.js
- `openai`: OpenAI API for LLM and TTS
- `react-hook-form` + `zod`: Form validation
- `@tanstack/react-query`: Server state management
- `tailwindcss` + `shadcn/ui`: UI framework

---

### **9. Important Considerations**

#### **Security**
- **Row Level Security (RLS)**: Supabase RLS policies enforce user data isolation
- **Supabase Auth**: Built-in secure authentication (no manual JWT management)
- **File Upload Validation**: Type, size, and content validation in API routes
- **Rate Limiting**: Implement via Next.js middleware or Supabase
- **Input Sanitization**: Validate all inputs with Zod schemas
- **SQL Injection Prevention**: Supabase client handles parameterized queries
- **Environment Variables**: Secure handling with Next.js `.env.local`

#### **Performance**
- **Async Podcast Generation**: Use Next.js API routes with background processing
- **Server Components**: Leverage RSC for faster initial loads
- **Supabase CDN**: Storage files served via CDN
- **Pagination**: Implement with Supabase `.range()` queries
- **Caching**: Use React Query + Next.js caching strategies
- **Streaming**: Server-side streaming for long podcast generations

#### **Cost Optimization**
- **LLM Token Usage**: Optimize prompts, use streaming for responses
- **TTS Character Limits**: Monitor usage with OpenAI/ElevenLabs quotas
- **Supabase Storage**: Monitor usage against free tier limits
- **OpenAI API**: Use appropriate models for cost vs quality trade-off

#### **Scalability**
- **Background Jobs**: Use Vercel Edge Functions or external queue (Bull/BullMQ)
- **Database Scaling**: Supabase handles PostgreSQL scaling automatically
- **Database Indexing**: Add indexes for frequent queries (user_id, status, etc.)
- **Caching**: Implement Redis or Vercel KV for session/data caching
- **Storage**: Supabase Storage scales with usage

---

### **10. Next Steps**

1. **Create Supabase Project**: Sign up at supabase.com and create a new project
2. **Initialize Next.js Project**: `npx create-next-app@latest castify --typescript --tailwind --app`
3. **Install Dependencies**: `npm install @supabase/supabase-js @supabase/ssr openai pdf-parse mammoth react-hook-form zod @tanstack/react-query react-audio-player lucide-react`
4. **Setup Supabase**:
   - Run database migrations
   - Configure storage buckets
   - Enable Row Level Security
5. **Configure Environment**: Setup `.env.local` with Supabase and OpenAI keys
6. **Build Foundation**: Start with authentication using Supabase Auth
7. **Iterate**: Follow development phases above

---

## Getting Started

### Prerequisites
- Node.js v18+
- npm or yarn
- OpenAI API key (for LLM/TTS)
- Supabase account (free tier available)

### Quick Start
```bash
# Initialize Next.js project
npx create-next-app@latest castify --typescript --tailwind --app

# Navigate to project
cd castify

# Install dependencies
npm install @supabase/supabase-js @supabase/ssr openai pdf-parse mammoth react-hook-form zod @hookform/resolvers @tanstack/react-query react-audio-player lucide-react class-variance-authority clsx tailwind-merge

# Install TypeScript types
npm install -D @types/react-audio-player @types/pdf-parse

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your keys

# Run development server
# User will run: npm run dev
```

### Supabase Setup
1. Create project at https://supabase.com
2. Go to SQL Editor and run the schema from Section 3
3. Go to Storage and create two buckets: `documents` and `podcasts`
4. Configure RLS policies in Authentication → Policies

### Deployment
- **Recommended**: Deploy to Vercel for seamless Next.js integration
- Connect to your Supabase project
- Environment variables are set in Vercel dashboard

---

**This outline provides a comprehensive roadmap for building the Castify prototype with Next.js and Supabase. Start with Phase 1 and iterate through each phase systematically!**