"use client";

import { useState } from "react";
import { StoryInput } from "@/components/StoryInput";
import { PageGenerator } from "@/components/PageGenerator";
import { PageGallery } from "@/components/PageGallery";
export default function Home() {
  const [currentStep, setCurrentStep] = useState<'story' | 'generator' | 'gallery'>('story');
  const [projectId, setProjectId] = useState<string | null>(null);

  const handleStorySubmit = (newProjectId: string) => {
    setProjectId(newProjectId);
    setCurrentStep('generator');
  };

  const handleGeneratorComplete = () => {
    setCurrentStep('gallery');
  };

  const handleBackToGenerator = () => {
    setCurrentStep('generator');
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">MangaMaker</h1>
          <p className="text-xl text-gray-300">Create your manga from story to pages</p>
        </div>

        <div className="max-w-4xl mx-auto">
          {currentStep === 'story' && (
            <StoryInput onStorySubmit={handleStorySubmit} />
          )}
          
          {currentStep === 'generator' && projectId && (
            <PageGenerator 
              projectId={projectId} 
              onComplete={handleGeneratorComplete}
            />
          )}
          
          {currentStep === 'gallery' && projectId && (
            <PageGallery 
              projectId={projectId} 
              onBackToGenerator={handleBackToGenerator}
            />
          )}
        </div>
      </div>
    </main>
  );
}