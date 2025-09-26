"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import Image from "next/image";

interface PageGeneratorProps {
  projectId: Id<"projects">;
  onComplete: () => void;
}

const PAGE_TYPES = [
  { value: "title", label: "Title Page", description: "Cover page with title and main characters" },
  { value: "chapter", label: "Chapter Page", description: "Chapter title and introduction" },
  { value: "action", label: "Action Scene", description: "Fight scenes, battles, or intense moments" },
  { value: "dialogue", label: "Dialogue Scene", description: "Character conversations and interactions" },
  { value: "establishing", label: "Establishing Shot", description: "Setting the scene and environment" },
  { value: "emotional", label: "Emotional Scene", description: "Dramatic or emotional moments" },
  { value: "ending", label: "Ending Page", description: "Chapter or story conclusion" },
];

export function PageGenerator({ projectId, onComplete }: PageGeneratorProps) {
  const [currentPageType, setCurrentPageType] = useState("");
  const [currentDescription, setCurrentDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentPageId, setCurrentPageId] = useState<Id<"pages"> | null>(null);

  const generatePage = useMutation(api.pages.generatePageOptions);
  const selectOption = useMutation(api.pages.selectOption);
  const pages = useQuery(api.pages.list, { projectId });
  const generationStatus = useQuery(
    api.pages.getGenerationStatus,
    currentPageId ? { pageId: currentPageId } : "skip"
  );

  const handleGeneratePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPageType || !currentDescription.trim()) return;

    setIsGenerating(true);
    try {
      const pageId = await generatePage({
        projectId,
        pageType: currentPageType,
        description: currentDescription.trim(),
      });
      setCurrentPageId(pageId);
    } catch (error) {
      console.error("Failed to generate page:", error);
      alert("Failed to generate page. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectOption = async (optionIndex: number) => {
    if (!currentPageId) return;

    try {
      await selectOption({
        pageId: currentPageId,
        optionIndex,
      });
      
      // Reset form for next page
      setCurrentPageType("");
      setCurrentDescription("");
      setCurrentPageId(null);
    } catch (error) {
      console.error("Failed to select option:", error);
      alert("Failed to select option. Please try again.");
    }
  };

  const handleComplete = () => {
    onComplete();
  };

  const currentPage = pages?.find(page => page._id === currentPageId);
  const hasGeneratedPages = pages && pages.length > 0;

  return (
    <div className="space-y-8">
      {/* Progress indicator */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-4 text-center">
          Generate Your Manga Pages
        </h2>
        <div className="text-center text-gray-300 mb-4">
          Pages created: {pages?.length || 0}
        </div>
        {hasGeneratedPages && (
          <button
            onClick={handleComplete}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
          >
            View All Pages & Export
          </button>
        )}
      </div>

      {/* Page generation form */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6">
          Create Next Page
        </h3>
        
        <form onSubmit={handleGeneratePage} className="space-y-6">
          <div>
            <label htmlFor="pageType" className="block text-sm font-medium text-gray-200 mb-2">
              Page Type *
            </label>
            <select
              id="pageType"
              value={currentPageType}
              onChange={(e) => setCurrentPageType(e.target.value)}
              className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            >
              <option value="">Select page type</option>
              {PAGE_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label} - {type.description}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-200 mb-2">
              Page Description *
            </label>
            <textarea
              id="description"
              value={currentDescription}
              onChange={(e) => setCurrentDescription(e.target.value)}
              placeholder="Describe what should happen on this page... What characters are present? What's the action or dialogue? What's the mood?"
              className="w-full h-24 px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={!currentPageType || !currentDescription.trim() || isGenerating}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
          >
            {isGenerating ? "Generating..." : "Generate 3 Options"}
          </button>
        </form>
      </div>

      {/* Generation status */}
      {generationStatus && (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <h3 className="text-lg font-bold text-white mb-4">Generation Status</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Status:</span>
              <span className="text-white capitalize">{generationStatus.status}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Progress:</span>
              <span className="text-white">{generationStatus.progress}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${generationStatus.progress}%` }}
              />
            </div>
            {generationStatus.error && (
              <div className="text-red-400 text-sm mt-2">
                Error: {generationStatus.error}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Generated options */}
      {currentPage && currentPage.generatedOptions.length > 0 && (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-6 text-center">
            Choose Your Favorite
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {currentPage.generatedOptions.map((option, index) => (
              <div
                key={index}
                className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                  option.selected
                    ? "border-purple-500 ring-2 ring-purple-500"
                    : "border-white/30 hover:border-white/50"
                }`}
                onClick={() => handleSelectOption(index)}
              >
                <Image
                  src={option.imageUrl}
                  alt={`Option ${index + 1}`}
                  width={400}
                  height={256}
                  className="w-full h-64 object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-3">
                  <p className="text-white text-sm">{option.prompt}</p>
                  {option.selected && (
                    <div className="absolute top-2 right-2 bg-purple-500 text-white text-xs px-2 py-1 rounded">
                      Selected
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
