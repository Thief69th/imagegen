// components/ActiveToolArea.tsx
'use client';

import { ToolConfig, ToolType } from '@/lib/types';
import { getToolConfig } from '@/lib/toolConfigs';
import UniversalImageTool from './tools/UniversalImageTool';
import MultiImageCompressor from './tools/MultiImageCompressor';
import RemoveBackground from './tools/RemoveBackground';
import MergeImages from './tools/MergeImages';
import SplitImage from './tools/SplitImage';
import CollageMaker from './tools/CollageMaker';
import ImageWatermark from './tools/ImageWatermark';
import SocialMediaTool from './tools/SocialMediaTool';

interface ActiveToolAreaProps {
  activeTool: ToolType | null;
}

// Map tool types to their dedicated components (fallback to UniversalImageTool)
const TOOL_COMPONENTS: Partial<Record<ToolType, React.ComponentType<any>>> = {
  'compress-bulk': MultiImageCompressor,
  'remove-background': RemoveBackground,
  'merge-images': MergeImages,
  'split-image': SplitImage,
  'collage-maker': CollageMaker,
  'add-watermark': ImageWatermark,
  'social-media': SocialMediaTool,
  // Add more dedicated components as you build them
};

export default function ActiveToolArea({ activeTool }: ActiveToolAreaProps) {
  if (!activeTool) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Select a tool from the sidebar to get started
      </div>
    );
  }

  const toolConfig = getToolConfig(activeTool);
  if (!toolConfig) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold mb-2">Tool Not Found</h2>
        <p className="text-muted-foreground">The selected tool configuration is missing.</p>
      </div>
    );
  }

  // Use dedicated component if available, otherwise fallback to UniversalImageTool
  const DedicatedComponent = TOOL_COMPONENTS[activeTool];
  
  if (DedicatedComponent) {
    return <DedicatedComponent toolConfig={toolConfig} />;
  }

  // Fallback to UniversalImageTool with proper props
  return (
    <UniversalImageTool
      toolType={activeTool}
      title={toolConfig.name}
      description={toolConfig.description}
      isBulk={toolConfig.supportsBulk}
      acceptedTypes={toolConfig.acceptedTypes}
    />
  );
}
