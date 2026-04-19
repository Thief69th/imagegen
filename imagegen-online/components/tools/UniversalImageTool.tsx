// components/tools/UniversalImageTool.tsx
'use client';

import { useState, useCallback } from 'react';
import { ToolType, ProcessingOptions } from '@/lib/types';
import { useImageProcessor } from '@/lib/hooks/useImageProcessor';
import { ResizeSettings } from './settings/ResizeSettings';
import { ConvertSettings } from './settings/ConvertSettings';
import { CompressSettings } from './settings/CompressSettings';
import { EffectsSettings } from './settings/EffectsSettings';
import { DownloadButton } from '@/components/ui/DownloadButton';
import { FileUploader } from '@/components/ui/FileUploader';
import { ImagePreview } from '@/components/ui/ImagePreview';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { Alert } from '@/components/ui/Alert';

interface UniversalImageToolProps {
  toolType: ToolType;
  title: string;
  description: string;
  isBulk?: boolean;
  acceptedTypes?: string[];
}

export default function UniversalImageTool({
  toolType,
  title,
  description,
  isBulk = true,
  acceptedTypes
}: UniversalImageToolProps) {
  const [options, setOptions] = useState<ProcessingOptions>({});
  
  const {
    files,
    results,
    processing,
    progress,
    error,
    addFiles,
    removeFile,
    clearAll,
    processAll
  } = useImageProcessor({ 
    isBulk, 
    acceptedTypes: acceptedTypes || ['image/*'] 
  });

  const handleProcess = useCallback(async () => {
    await processAll(options, toolType);
  }, [options, toolType, processAll]);

  const getSettingsComponent = () => {
    switch (toolType) {
      case 'resize':
        return <ResizeSettings options={options} onChange={setOptions} />;
      case 'convert':
        return <ConvertSettings options={options} onChange={setOptions} />;
      case 'compress':
        return <CompressSettings options={options} onChange={setOptions} />;
      case 'effects':
      case 'rotate':
      case 'flip':
        return <EffectsSettings options={options} onChange={setOptions} toolType={toolType} />;
      default:
        return <EffectsSettings options={options} onChange={setOptions} toolType={toolType} />;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>

      {/* Error Alert */}
      {error && <Alert variant="destructive">{error}</Alert>}

      {/* File Uploader */}
      <FileUploader
        onFilesSelected={addFiles}
        isBulk={isBulk}
        acceptedTypes={acceptedTypes}
        disabled={processing}
      />

      {/* Image Previews */}
      {files.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {files.map(file => (
            <ImagePreview
              key={file.id}
              file={file}
              onRemove={() => removeFile(file.id)}
              showRemove={!processing}
            />
          ))}
        </div>
      )}

      {/* Settings Panel */}
      {files.length > 0 && (
        <div className="p-4 border rounded-lg space-y-4">
          <h3 className="font-semibold">Settings</h3>
          {getSettingsComponent()}
        </div>
      )}

      {/* Action Buttons */}
      {files.length > 0 && (
        <div className="flex flex-wrap gap-3 justify-center">
          <Button
            onClick={handleProcess}
            disabled={processing || files.some(f => f.loading || f.error)}
            size="lg"
          >
            {processing ? `Processing ${progress}%...` : `Process ${files.length} Image${files.length > 1 ? 's' : ''}`}
          </Button>
          
          {(results.length > 0 || files.length > 0) && (
            <Button variant="outline" onClick={clearAll} disabled={processing}>
              Clear All
            </Button>
          )}
        </div>
      )}

      {/* Progress Bar */}
      {processing && <Progress value={progress} className="w-full" />}

      {/* Results & Download */}
      {results.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Results ({results.length})</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {results.map((result, index) => (
              <div key={index} className="space-y-2 text-center">
                <img 
                  src={result.url} 
                  alt={result.name}
                  className="w-full h-32 object-cover rounded border"
                />
                <p className="text-sm truncate">{result.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(result.size / 1024).toFixed(1)} KB
                </p>
                <DownloadButton 
                  url={result.url} 
                  filename={result.name}
                  size="sm"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
