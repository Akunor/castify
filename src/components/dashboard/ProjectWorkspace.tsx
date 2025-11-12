'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { Document, DocumentProjectLink } from '@/types/document';
import type { Podcast } from '@/types/podcast';
import type { Project } from '@/types/project';

type ProjectFilter = 'all' | 'unassigned' | string;

interface WorkspaceError {
  message: string;
  hint?: string;
}

function formatBytes(bytes: number): string {
  if (!bytes || Number.isNaN(bytes)) return '—';
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let index = 0;

  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }

  return `${value.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

function getProjectIds(linkedProjects?: DocumentProjectLink[]): string[] {
  if (!Array.isArray(linkedProjects)) return [];
  return linkedProjects
    .map((link) => link?.project_id)
    .filter((id): id is string => Boolean(id));
}

export function ProjectWorkspace() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);

  const [selectedProjectFilter, setSelectedProjectFilter] =
    useState<ProjectFilter>('all');
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
    null
  );
  const [selectedPodcastId, setSelectedPodcastId] = useState<string | null>(
    null
  );

  const [isAssigning, setIsAssigning] = useState(false);
  const [assignmentSelection, setAssignmentSelection] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<WorkspaceError | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [reprocessState, setReprocessState] = useState<{
    status: 'idle' | 'loading' | 'success' | 'error';
    message?: string;
  }>({ status: 'idle' });
  const [reprocessDocumentId, setReprocessDocumentId] = useState<string | null>(
    null
  );

  const fetchWorkspaceData = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    try {
      const [projectsRes, documentsRes, podcastsRes] = await Promise.all([
        fetch('/api/projects'),
        fetch('/api/documents'),
        fetch('/api/podcasts?status=completed'),
      ]);

      if (!projectsRes.ok) {
        throw new Error('Failed to load projects');
      }
      if (!documentsRes.ok) {
        throw new Error('Failed to load documents');
      }
      if (!podcastsRes.ok) {
        throw new Error('Failed to load podcasts');
      }

      const [projectsData, documentsData, podcastsData] = await Promise.all([
        projectsRes.json(),
        documentsRes.json(),
        podcastsRes.json(),
      ]);

      setProjects(Array.isArray(projectsData) ? projectsData : []);
      setDocuments(Array.isArray(documentsData) ? documentsData : []);
      setPodcasts(Array.isArray(podcastsData) ? podcastsData : []);
    } catch (err) {
      console.error('[ProjectWorkspace] fetch error', err);
      setError({
        message:
          err instanceof Error ? err.message : 'Unable to load workspace data',
        hint: 'Try reloading the page or refreshing the workspace.',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshWorkspace = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await fetchWorkspaceData();
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchWorkspaceData]);

  useEffect(() => {
    fetchWorkspaceData();
  }, [fetchWorkspaceData]);

  const projectDocumentCounts = useMemo(() => {
    const counts = new Map<string, number>();
    documents.forEach((doc) => {
      const links = getProjectIds(doc.project_documents);
      links.forEach((projectId) => {
        counts.set(projectId, (counts.get(projectId) || 0) + 1);
      });
    });
    return counts;
  }, [documents]);

  const projectPodcastCounts = useMemo(() => {
    const counts = new Map<string, number>();
    podcasts.forEach((podcast) => {
      if (podcast.project_id) {
        counts.set(
          podcast.project_id,
          (counts.get(podcast.project_id) || 0) + 1
        );
      }
    });
    return counts;
  }, [podcasts]);

  const filteredDocuments = useMemo(() => {
    if (selectedProjectFilter === 'all') {
      return documents;
    }
    if (selectedProjectFilter === 'unassigned') {
      return documents.filter(
        (doc) => getProjectIds(doc.project_documents).length === 0
      );
    }
    return documents.filter((doc) =>
      getProjectIds(doc.project_documents).includes(selectedProjectFilter)
    );
  }, [documents, selectedProjectFilter]);

  const filteredPodcasts = useMemo(() => {
    if (selectedProjectFilter === 'all') {
      return podcasts;
    }
    if (selectedProjectFilter === 'unassigned') {
      return podcasts.filter((podcast) => !podcast.project_id);
    }
    return podcasts.filter(
      (podcast) => podcast.project_id === selectedProjectFilter
    );
  }, [podcasts, selectedProjectFilter]);

  useEffect(() => {
    if (
      filteredDocuments.length > 0 &&
      !filteredDocuments.some((doc) => doc.id === selectedDocumentId)
    ) {
      setSelectedDocumentId(filteredDocuments[0].id);
    }
    if (filteredDocuments.length === 0) {
      setSelectedDocumentId(null);
    }
  }, [filteredDocuments, selectedDocumentId]);

  useEffect(() => {
    if (
      filteredPodcasts.length > 0 &&
      !filteredPodcasts.some((pod) => pod.id === selectedPodcastId)
    ) {
      setSelectedPodcastId(filteredPodcasts[0].id);
    }
    if (filteredPodcasts.length === 0) {
      setSelectedPodcastId(null);
    }
  }, [filteredPodcasts, selectedPodcastId]);

  const selectedDocument = useMemo(
    () => filteredDocuments.find((doc) => doc.id === selectedDocumentId) ?? null,
    [filteredDocuments, selectedDocumentId]
  );

  const selectedPodcast = useMemo(
    () => filteredPodcasts.find((pod) => pod.id === selectedPodcastId) ?? null,
    [filteredPodcasts, selectedPodcastId]
  );

  useEffect(() => {
    if (selectedDocumentId !== reprocessDocumentId) {
      setReprocessState({ status: 'idle' });
      setReprocessDocumentId(selectedDocumentId);
    }
  }, [selectedDocumentId, reprocessDocumentId]);

  const openAssignmentModal = useCallback(
    (projectId: string) => {
      const initialSelection = documents
        .filter((doc) =>
          getProjectIds(doc.project_documents).includes(projectId)
        )
        .map((doc) => doc.id);
      setAssignmentSelection(initialSelection);
      setActionError(null);
      setIsAssigning(true);
    },
    [documents]
  );

  const toggleDocumentSelection = (documentId: string) => {
    setAssignmentSelection((prev) =>
      prev.includes(documentId)
        ? prev.filter((id) => id !== documentId)
        : [...prev, documentId]
    );
  };

  const handleAssignmentSubmit = async () => {
    if (typeof selectedProjectFilter !== 'string') return;
    setActionError(null);
    try {
      const response = await fetch(
        `/api/projects/${selectedProjectFilter}/documents`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ documentIds: assignmentSelection }),
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to update project documents');
      }

      setIsAssigning(false);
      await refreshWorkspace();
    } catch (err) {
      console.error('[ProjectWorkspace] assignment error', err);
      setActionError(
        err instanceof Error ? err.message : 'Unable to update documents'
      );
    }
  };

  const handleCloseAssignment = () => {
    setAssignmentSelection([]);
    setIsAssigning(false);
  };

  const renderProjectList = () => {
    if (projects.length === 0 && documents.length === 0) {
      return (
        <p className="text-sm text-foreground/60">
          No projects or documents yet. Create a project and upload documents to
          get started.
        </p>
      );
    }

    return (
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => setSelectedProjectFilter('all')}
          className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
            selectedProjectFilter === 'all'
              ? 'border-foreground bg-foreground text-background'
              : 'border-foreground/10 hover:border-foreground/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-medium">All documents</span>
            <span className="text-xs opacity-80">{documents.length}</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setSelectedProjectFilter('unassigned')}
          className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
            selectedProjectFilter === 'unassigned'
              ? 'border-foreground bg-foreground text-background'
              : 'border-foreground/10 hover:border-foreground/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-medium">Unassigned</span>
            <span className="text-xs opacity-80">
              {
                documents.filter(
                  (doc) => getProjectIds(doc.project_documents).length === 0
                ).length
              }
            </span>
          </div>
        </button>

        {projects.map((project) => {
          const isActive = selectedProjectFilter === project.id;
          const docCount = projectDocumentCounts.get(project.id) || 0;
          const podcastCount = projectPodcastCounts.get(project.id) || 0;
          return (
            <button
              key={project.id}
              type="button"
              onClick={() => setSelectedProjectFilter(project.id)}
              className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                isActive
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-foreground/10 hover:border-foreground/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{project.name}</span>
                <span className="text-xs opacity-80">{docCount}</span>
              </div>
              {project.description && (
                <p
                  className={`mt-1 text-xs ${
                    isActive ? 'text-background/80' : 'text-foreground/60'
                  }`}
                >
                  {project.description}
                </p>
              )}
              {podcastCount > 0 && (
                <p
                  className={`mt-1 text-[10px] uppercase tracking-wide ${
                    isActive ? 'text-background/70' : 'text-foreground/50'
                  }`}
                >
                  {podcastCount} podcast{podcastCount === 1 ? '' : 's'}
                </p>
              )}
            </button>
          );
        })}
      </div>
    );
  };

  const handleReprocessDocument = useCallback(
    async (documentId: string) => {
      setReprocessDocumentId(documentId);
      setReprocessState({ status: 'loading' });
      try {
        const response = await fetch(`/api/documents/${documentId}/reprocess`, {
          method: 'POST',
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || 'Failed to re-run parser');
        }

        const data = await response.json().catch(() => ({}));

        setReprocessState({
          status: 'success',
          message: data.message || 'Parser re-run started.',
        });

        await refreshWorkspace();
      } catch (err) {
        console.error('[ProjectWorkspace] reprocess error', err);
        setReprocessState({
          status: 'error',
          message:
            err instanceof Error ? err.message : 'Unable to re-run parser right now',
        });
      }
    },
    [refreshWorkspace]
  );

  const canShowReprocessButton =
    !!selectedDocument &&
    (!selectedDocument.content ||
      selectedDocument.content.trim().length === 0 ||
      selectedDocument.status === 'error');

  const isReprocessingSelectedDocument =
    !!selectedDocument &&
    reprocessDocumentId === selectedDocument.id &&
    reprocessState.status === 'loading';

  const reprocessFeedback =
    !!selectedDocument &&
    reprocessDocumentId === selectedDocument.id &&
    reprocessState.status !== 'idle'
      ? reprocessState
      : null;

  const isReprocessButtonDisabled =
    !selectedDocument ||
    selectedDocument.status === 'processing' ||
    isReprocessingSelectedDocument;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Project workspace</h2>
          <p className="text-sm text-foreground/60">
            Organise documents into projects and review generated audio.
          </p>
        </div>
        <Button
          type="button"
          onClick={refreshWorkspace}
          disabled={isRefreshing || isLoading}
          variant="outline"
          className="cursor-pointer"
        >
          {isRefreshing ? 'Refreshing…' : 'Refresh'}
        </Button>
      </div>

      {error && (
        <Card className="border-red-500/40 bg-red-500/5">
          <CardHeader>
            <CardTitle className="text-red-600">{error.message}</CardTitle>
            {error.hint && (
              <CardDescription className="text-red-500">
                {error.hint}
              </CardDescription>
            )}
          </CardHeader>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)_320px]">
        <Card>
          <CardHeader>
            <CardTitle>Projects</CardTitle>
            <CardDescription>
              Select a project to view its documents and audio.
            </CardDescription>
          </CardHeader>
          <CardContent>{isLoading ? <p>Loading…</p> : renderProjectList()}</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Documents</CardTitle>
            <CardDescription>
              {selectedProjectFilter === 'all'
                ? 'All documents you have uploaded.'
                : selectedProjectFilter === 'unassigned'
                ? 'Documents that are not currently assigned to a project.'
                : 'Documents linked to this project.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedProjectFilter !== 'all' &&
              selectedProjectFilter !== 'unassigned' &&
              projects.some((project) => project.id === selectedProjectFilter) && (
                <div className="mb-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() =>
                      openAssignmentModal(selectedProjectFilter as string)
                    }
                  >
                    Manage documents
                  </Button>
                </div>
              )}

            {filteredDocuments.length === 0 ? (
              <p className="text-sm text-foreground/60">
                {isLoading
                  ? 'Loading documents…'
                  : 'No documents available for this view.'}
              </p>
            ) : (
              <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                {filteredDocuments.map((doc) => {
                  const isActive = doc.id === selectedDocumentId;
                  const projectIds = getProjectIds(doc.project_documents);
                  return (
                    <button
                      key={doc.id}
                      type="button"
                      onClick={() => setSelectedDocumentId(doc.id)}
                      className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                        isActive
                          ? 'border-foreground bg-foreground text-background'
                          : 'border-foreground/10 hover:border-foreground/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium truncate">
                          {doc.original_name}
                        </span>
                        <span
                          className={`ml-2 text-[10px] uppercase tracking-wide ${
                            isActive ? 'text-background/70' : 'text-foreground/50'
                          }`}
                        >
                          {doc.status}
                        </span>
                      </div>
                      <div
                        className={`mt-1 text-xs ${
                          isActive ? 'text-background/80' : 'text-foreground/60'
                        }`}
                      >
                        {formatBytes(doc.size)} •{' '}
                        {projectIds.length > 0
                          ? `${projectIds.length} project${
                              projectIds.length === 1 ? '' : 's'
                            }`
                          : 'Unassigned'}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Document preview</CardTitle>
              <CardDescription>
                Review document metadata and processed content.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {!selectedDocument ? (
                <p className="text-sm text-foreground/60 font-bold">
                  Select a document to view its details.
                </p>
              ) : (
                <>
                  <div>
                    <p className="font-semibold text-sm">
                      {selectedDocument.original_name}
                    </p>
                    <p className="text-xs text-foreground/60">
                      {selectedDocument.mime_type}
                    </p>
                  </div>
                  {canShowReprocessButton && (
                    <div className="flex flex-col gap-2 rounded-lg border border-foreground/10 bg-foreground/5 p-3 text-xs">
                      <p className="text-foreground/70">
                        This document has no parsed content yet or previously hit an
                        error. Re-run the parser to try again.
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          type="button"
                          size="sm"
                          className="cursor-pointer"
                          onClick={() =>
                            selectedDocument &&
                            handleReprocessDocument(selectedDocument.id)
                          }
                          disabled={isReprocessButtonDisabled}
                        >
                          {isReprocessingSelectedDocument
                            ? 'Re-running parser…'
                            : 'Re-run parser'}
                        </Button>
                        {reprocessFeedback && (
                          <span
                            className={`text-xs ${
                              reprocessFeedback.status === 'error'
                                ? 'text-red-500'
                                : 'text-foreground/60'
                            }`}
                          >
                            {reprocessFeedback.message}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-lg border border-foreground/10 p-2">
                      <p className="text-foreground/60">Status</p>
                      <p className="font-medium capitalize">
                        {selectedDocument.status}
                      </p>
                    </div>
                    <div className="rounded-lg border border-foreground/10 p-2">
                      <p className="text-foreground/60">Size</p>
                      <p className="font-medium">
                        {formatBytes(selectedDocument.size)}
                      </p>
                    </div>
                    <div className="col-span-2 rounded-lg border border-foreground/10 p-2">
                      <p className="text-foreground/60">Projects</p>
                      <p className="font-medium">
                        {(() => {
                          const links = getProjectIds(
                            selectedDocument.project_documents
                          );
                          if (links.length === 0) return 'Unassigned';
                          const names = projects
                            .filter((project) => links.includes(project.id))
                            .map((project) => project.name);
                          return names.join(', ') || `${links.length} project(s)`;
                        })()}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground/60">
                      Parsed content
                    </p>
                    <div className="max-h-48 overflow-y-auto rounded-lg border border-foreground/10 bg-foreground/5 p-3 text-sm whitespace-pre-wrap">
                      {selectedDocument.content
                        ? selectedDocument.content
                        : 'No parsed content available yet.'}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Generated audio</CardTitle>
              <CardDescription>
                Listen to completed podcasts for the current filter.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {filteredPodcasts.length === 0 ? (
                <p className="text-sm text-foreground/60">
                  {selectedProjectFilter === 'unassigned'
                    ? 'No podcasts without a project.'
                    : 'No completed podcasts for this selection yet.'}
                </p>
              ) : (
                <>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {filteredPodcasts.map((podcast) => {
                      const isActive = podcast.id === selectedPodcastId;
                      return (
                        <button
                          key={podcast.id}
                          type="button"
                          onClick={() => setSelectedPodcastId(podcast.id)}
                          className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                            isActive
                              ? 'border-foreground bg-foreground text-background'
                              : 'border-foreground/10 hover:border-foreground/40'
                          }`}
                        >
                          <p className="font-medium truncate">
                            {podcast.name || 'Untitled podcast'}
                          </p>
                          <p
                            className={`mt-1 text-xs ${
                              isActive
                                ? 'text-background/80'
                                : 'text-foreground/60'
                            }`}
                          >
                            {podcast.duration
                              ? `${Math.round(podcast.duration)}s`
                              : podcast.status}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                  {selectedPodcast ? (
                    <>
                      {selectedPodcast.audio_url ? (
                        <audio
                          controls
                          className="w-full"
                          src={selectedPodcast.audio_url}
                        >
                          Your browser does not support the audio element.
                        </audio>
                      ) : (
                        <p className="text-sm text-foreground/60">
                          Audio will appear once processing finishes.
                        </p>
                      )}
                      {selectedPodcast.transcript && (
                        <div>
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground/60">
                            Transcript
                          </p>
                          <div className="max-h-32 overflow-y-auto rounded-lg border border-foreground/10 bg-foreground/5 p-3 text-sm whitespace-pre-wrap">
                            {selectedPodcast.transcript}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-foreground/60">
                      Select a podcast to preview audio and transcript.
                    </p>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {isAssigning && typeof selectedProjectFilter === 'string' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-lg rounded-lg border border-foreground/20 bg-background p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Assign documents</h3>
                <p className="text-sm text-foreground/60">
                  Choose which documents belong to this project.
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                className="cursor-pointer"
                onClick={handleCloseAssignment}
              >
                Close
              </Button>
            </div>

            {actionError && (
              <p className="mb-3 text-sm text-red-500">{actionError}</p>
            )}

            <div className="max-h-72 overflow-y-auto pr-1">
              {documents.length === 0 ? (
                <p className="text-sm text-foreground/60">
                  Upload documents before assigning them to a project.
                </p>
              ) : (
                <div className="space-y-2">
                  {documents.map((doc) => {
                    const isChecked = assignmentSelection.includes(doc.id);
                    return (
                      <label
                        key={doc.id}
                        className="flex cursor-pointer items-start gap-3 rounded-lg border border-foreground/10 p-3 text-sm hover:border-foreground/40"
                      >
                        <input
                          type="checkbox"
                          className="mt-1"
                          checked={isChecked}
                          onChange={() => toggleDocumentSelection(doc.id)}
                        />
                        <div className="flex-1">
                          <p className="font-medium">{doc.original_name}</p>
                          <p className="text-xs text-foreground/60">
                            {doc.status} • {formatBytes(doc.size)}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                onClick={handleCloseAssignment}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="cursor-pointer"
                onClick={handleAssignmentSubmit}
                disabled={documents.length === 0}
              >
                Save changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

