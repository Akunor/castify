import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SignOutButton } from '@/components/auth/sign-out-button'
import { DocumentUpload } from '@/components/documents/DocumentUpload'
import { ProjectForm } from '@/components/projects/ProjectForm'
import { PodcastGenerate } from '@/components/podcasts/PodcastGenerate'

export default async function Dashboard() {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/auth/login')
  }

  // Get user statistics
  const { data: documents } = await supabase
    .from('documents')
    .select('id')
    .eq('user_id', user.id)

  const { data: projects } = await supabase
    .from('projects')
    .select('id')
    .eq('user_id', user.id)

  const { data: podcasts } = await supabase
    .from('podcasts')
    .select('id')
    .eq('user_id', user.id)

  const documentsCount = documents?.length || 0
  const projectsCount = projects?.length || 0
  const podcastsCount = podcasts?.length || 0

  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation */}
      <nav className="border-b border-foreground/10 bg-background">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">Castify</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-foreground/60">
              {user.email}
            </div>
            <SignOutButton />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-foreground/60 mt-2">
            Welcome back! Here&apos;s an overview of your content.
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Documents
              </CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-foreground/60"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{documentsCount}</div>
              <p className="text-xs text-foreground/60 mt-1">
                Total documents uploaded
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Projects
              </CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-foreground/60"
              >
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projectsCount}</div>
              <p className="text-xs text-foreground/60 mt-1">
                Active projects
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Podcasts
              </CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-foreground/60"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <polygon points="10 8 16 12 10 16 10 8"></polygon>
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{podcastsCount}</div>
              <p className="text-xs text-foreground/60 mt-1">
                Podcasts generated
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="hover:border-foreground/20 transition-colors">
            <CardHeader>
              <CardTitle>Upload Document</CardTitle>
              <CardDescription>
                Add a new document to convert into a podcast
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DocumentUpload />
            </CardContent>
          </Card>

          <Card className="hover:border-foreground/20 transition-colors">
            <CardHeader>
              <CardTitle>Create Project</CardTitle>
              <CardDescription>
                Group multiple documents into a project
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProjectForm />
            </CardContent>
          </Card>

          <Card className="hover:border-foreground/20 transition-colors">
            <CardHeader>
              <CardTitle>Generate Podcast</CardTitle>
              <CardDescription>
                Create a new podcast from your documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PodcastGenerate />
            </CardContent>
          </Card>
        </div>

        {/* Empty State */}
        {documentsCount === 0 && projectsCount === 0 && podcastsCount === 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-center">Get Started</CardTitle>
              <CardDescription className="text-center">
                You don&apos;t have any content yet. Upload your first document to get started!
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </main>
    </div>
  )
}

