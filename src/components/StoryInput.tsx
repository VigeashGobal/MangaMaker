"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface StoryInputProps {
  onStorySubmit: (projectId: Id<"projects">) => void;
}

export function StoryInput({ onStorySubmit }: StoryInputProps) {
  const [storySummary, setStorySummary] = useState("");
  const [genre, setGenre] = useState("");
  const [style, setStyle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createProject = useMutation(api.projects.create);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storySummary.trim()) return;

    setIsSubmitting(true);
    try {
      // For now, using a mock userId. In production, you'd implement proper auth
      const userId = "user-" + Date.now();
      
      const projectId = await createProject({
        storySummary: storySummary.trim(),
        genre: genre.trim() || undefined,
        style: style.trim() || undefined,
        userId,
      });

      onStorySubmit(projectId);
    } catch (error) {
      console.error("Failed to create project:", error);
      alert("Failed to create project. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">
        Tell Us Your Story
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="story" className="block text-sm font-medium text-gray-200 mb-2">
            Story Summary *
          </label>
          <textarea
            id="story"
            value={storySummary}
            onChange={(e) => setStorySummary(e.target.value)}
            placeholder="Describe your manga story... What's the main plot? Who are the characters? What's the setting?"
            className="w-full h-32 px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="genre" className="block text-sm font-medium text-gray-200 mb-2">
              Genre (Optional)
            </label>
            <select
              id="genre"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Select a genre</option>
              <option value="action">Action</option>
              <option value="romance">Romance</option>
              <option value="fantasy">Fantasy</option>
              <option value="sci-fi">Sci-Fi</option>
              <option value="horror">Horror</option>
              <option value="comedy">Comedy</option>
              <option value="drama">Drama</option>
              <option value="mystery">Mystery</option>
              <option value="slice-of-life">Slice of Life</option>
              <option value="supernatural">Supernatural</option>
            </select>
          </div>

          <div>
            <label htmlFor="style" className="block text-sm font-medium text-gray-200 mb-2">
              Art Style (Optional)
            </label>
            <select
              id="style"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Select a style</option>
              <option value="shonen">Shonen</option>
              <option value="shoujo">Shoujo</option>
              <option value="seinen">Seinen</option>
              <option value="josei">Josei</option>
              <option value="kodomomuke">Kodomomuke</option>
              <option value="realistic">Realistic</option>
              <option value="chibi">Chibi</option>
              <option value="vintage">Vintage</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={!storySummary.trim() || isSubmitting}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Creating Project..." : "Start Creating Manga"}
        </button>
      </form>
    </div>
  );
}
