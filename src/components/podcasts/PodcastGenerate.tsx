'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Document } from '@/types/document';
import type { Project } from '@/types/project';

interface PodcastGenerateProps {
  onSuccess?: () => void;
}

export function PodcastGenerate({ onSuccess }: PodcastGenerateProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<string[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchDocumentsAndProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [docsRes, projsRes] = await Promise.all([
        fetch('/api/documents'),
        fetch('/api/projects'),
      ]);

      if (!docsRes.ok) throw new Error('Failed to fetch documents');
      if (!projsRes.ok) throw new Error('Failed to fetch projects');

      const [docs, projs] = await Promise.all([
        docsRes.json(),
        projsRes.json(),
      ]);

      // Show all documents, but only allow selecting processed ones
      // Filter out error documents
      const validDocs = Array.isArray(docs) 
        ? docs.filter((d: Document) => d.status !== 'error')
        : [];
      setDocuments(validDocs);
      setProjects(Array.isArray(projs) ? projs : []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load documents and projects');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchDocumentsAndProjects();
    }
  }, [isOpen, fetchDocumentsAndProjects]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const payload: any = {};
      
      if (selectedProjectId) {
        payload.projectId = selectedProjectId;
      } else if (selectedDocumentIds.length > 0) {
        payload.documentIds = selectedDocumentIds;
      } else {
        throw new Error('Please select at least one document or a project');
      }

      if (name.trim()) {
        payload.name = name.trim();
      }

      if (description.trim()) {
        payload.description = description.trim();
      }

      const response = await fetch('/api/podcasts/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate podcast');
      }

      const data = await response.json();
      
      // Reset form
      setSelectedDocumentIds([]);
      setSelectedProjectId('');
      setName('');
      setDescription('');
      setIsOpen(false);

      // Show success message
      alert(`Podcast generation started! ${data.message || ''}`);

      if (onSuccess) {
        onSuccess();
      } else {
        window.location.reload();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setSelectedDocumentIds([]);
    setSelectedProjectId('');
    setName('');
    setDescription('');
    setError(null);
    setIsOpen(false);
  };

  const handleDocumentToggle = (docId: string) => {
    const doc = documents.find((d) => d.id === docId);
    // Only allow selecting processed documents
    if (!doc || doc.status !== 'processed') {
      return;
    }
    
    setSelectedDocumentIds((prev) => {
      if (prev.includes(docId)) {
        return prev.filter((id) => id !== docId);
      } else {
        return [...prev, docId];
      }
    });
    // Clear project selection when selecting documents
    if (selectedProjectId) {
      setSelectedProjectId('');
    }
  };

  const handleProjectSelect = (projectId: string) => {
    setSelectedProjectId(projectId);
    // Clear document selection when selecting project
    setSelectedDocumentIds([]);
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="w-full cursor-pointer"
      >
        Generate Podcast
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background border border-foreground/10 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Generate Podcast</h2>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={fetchDocumentsAndProjects}
                disabled={isLoading}
                className="text-xs"
              >
                {isLoading ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Select Source */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Select Source *
                </label>
                
                {/* Project Selection */}
                {projects.length > 0 && (
                  <div className="mb-3">
                    <label className="text-xs text-foreground/60 mb-1 block">
                      Or select a project:
                    </label>
                    <select
                      value={selectedProjectId}
                      onChange={(e) => handleProjectSelect(e.target.value)}
                      className="flex h-10 w-full rounded-lg border border-foreground/20 bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
                      disabled={isSubmitting}
                    >
                      <option value="">-- Select a project --</option>
                      {projects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Document Selection */}
                {documents.length > 0 && (
                  <div>
                    <label className="text-xs text-foreground/60 mb-1 block">
                      {selectedProjectId ? 'Select individual documents (optional):' : 'Select documents:'}
                    </label>
                    <div className="border border-foreground/10 rounded-lg p-3 max-h-48 overflow-y-auto">
                      {documents.length === 0 ? (
                        <p className="text-sm text-foreground/60">
                          No documents available. Upload documents first.
                        </p>
                      ) : (
                        documents.map((doc) => {
                          const isProcessed = doc.status === 'processed';
                          const isProcessing = doc.status === 'processing';
                          const canSelect = isProcessed && !selectedProjectId && !isSubmitting;
                          
                          return (
                            <label
                              key={doc.id}
                              className={`flex items-center space-x-2 p-2 rounded ${
                                canSelect ? 'hover:bg-foreground/5 cursor-pointer' : 'cursor-not-allowed opacity-60'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={selectedDocumentIds.includes(doc.id)}
                                onChange={() => handleDocumentToggle(doc.id)}
                                disabled={!canSelect || isSubmitting || !!selectedProjectId}
                                className="rounded"
                              />
                              <span className="text-sm flex-1">{doc.original_name}</span>
                              {isProcessing && (
                                <span className="text-xs text-foreground/40">(Processing...)</span>
                              )}
                              {!isProcessed && !isProcessing && (
                                <span className="text-xs text-foreground/40">(Not ready)</span>
                              )}
                            </label>
                          );
                        })
                      )}
                    </div>
                    {documents.filter((d) => d.status === 'processed').length === 0 && documents.length > 0 && (
                      <p className="text-xs text-foreground/60 mt-2">
                        No processed documents available yet. Documents are being processed in the background.
                      </p>
                    )}
                  </div>
                )}

                {documents.length === 0 && projects.length === 0 && (
                  <p className="text-sm text-foreground/60">
                    No documents or projects available. Please upload documents first.
                  </p>
                )}
              </div>

              {/* Optional: Podcast Name */}
              <div>
                <label htmlFor="podcast-name" className="block text-sm font-medium mb-2">
                  Podcast Name (optional)
                </label>
                <Input
                  id="podcast-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Leave empty for auto-generated name"
                  disabled={isSubmitting}
                />
              </div>

              {/* Optional: Description */}
              <div>
                <label htmlFor="podcast-description" className="block text-sm font-medium mb-2">
                  Description (optional)
                </label>
                <textarea
                  id="podcast-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter podcast description"
                  rows={3}
                  className="flex w-full rounded-lg border border-foreground/20 bg-transparent px-3 py-2 text-sm placeholder:text-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isSubmitting}
                />
              </div>

              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}

              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    (selectedDocumentIds.length === 0 && !selectedProjectId)
                  }
                  className="cursor-pointer"
                >
                  {isSubmitting ? 'Generating...' : 'Generate Podcast'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

