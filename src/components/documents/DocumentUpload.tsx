'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface DocumentUploadProps {
  onUploadSuccess?: () => void;
}

export function DocumentUpload({ onUploadSuccess }: DocumentUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setSuccess(false);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Upload failed');
      }

      setSuccess(true);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Refresh the page after a short delay to show updated stats
      setTimeout(() => {
        if (onUploadSuccess) {
          onUploadSuccess();
        } else {
          window.location.reload();
        }
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsUploading(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <Input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt,.md"
        onChange={handleFileChange}
        className="hidden"
        disabled={isUploading}
      />
      <Button
        onClick={handleButtonClick}
        disabled={isUploading}
        className="w-full cursor-pointer"
        variant="outline"
      >
        {isUploading ? 'Uploading...' : 'Upload Document'}
      </Button>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
      {success && (
        <p className="text-sm text-green-500">Document uploaded successfully!</p>
      )}
    </div>
  );
}

