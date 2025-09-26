"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

interface PageGalleryProps {
  projectId: string;
  onBackToGenerator: () => void;
}

export function PageGallery({ projectId, onBackToGenerator }: PageGalleryProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'zip'>('pdf');
  const [pages, setPages] = useState<Array<{
    id: string;
    pageType: string;
    description: string;
    generatedOptions: Array<{ imageUrl: string; prompt: string; selected: boolean }>;
    selectedImage?: string;
    order: number;
  }>>([]);

  // Fetch pages
  const fetchPages = useCallback(async () => {
    try {
      const response = await fetch(`/api/pages?projectId=${projectId}`);
      if (response.ok) {
        const data = await response.json();
        setPages(data);
      }
    } catch (error) {
      console.error('Error fetching pages:', error);
    }
  }, [projectId]);

  useEffect(() => {
    fetchPages();
  }, [projectId, fetchPages]);

  const handleExport = async () => {
    if (!pages || pages.length === 0) return;

    setIsExporting(true);
    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          format: exportFormat,
        }),
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const result = await response.json();
      
      if (exportFormat === 'pdf') {
        // For PDF, we'll need to implement client-side PDF generation
        // For now, just show success message
        alert(`Export completed! ${result.pageCount} pages ready for PDF export.`);
      } else {
        // For ZIP, we'll need to implement client-side ZIP generation
        // For now, just show success message
        alert(`Export completed! ${result.pageCount} pages ready for ZIP export.`);
      }
    } catch (error) {
      console.error("Export failed:", error);
      alert("Export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const selectedPages = pages?.filter(page => page.selectedImage) || [];
  const hasSelectedPages = selectedPages.length > 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Your Manga Pages
            </h2>
            <p className="text-gray-300">
              {selectedPages.length} pages ready for export
            </p>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={onBackToGenerator}
              className="bg-white/20 hover:bg-white/30 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200"
            >
              Add More Pages
            </button>
            
            {hasSelectedPages && (
              <div className="flex gap-2">
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value as 'pdf' | 'zip')}
                  className="px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="pdf">PDF</option>
                  <option value="zip">ZIP</option>
                </select>
                
                <button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
                >
                  {isExporting ? "Exporting..." : `Export ${exportFormat.toUpperCase()}`}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pages grid */}
      {pages && pages.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pages.map((page) => (
            <div
              key={page.id}
              className={`bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20 ${
                page.selectedImage ? 'ring-2 ring-green-500' : 'opacity-60'
              }`}
            >
              <div className="mb-4">
                <h3 className="text-lg font-bold text-white capitalize">
                  {page.pageType} Page
                </h3>
                <p className="text-sm text-gray-300">
                  Order: {page.order + 1}
                </p>
              </div>

              {page.selectedImage ? (
                <div className="space-y-4">
                  <Image
                    src={page.selectedImage}
                    alt={`${page.pageType} page`}
                    width={400}
                    height={192}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <div className="text-sm text-gray-300">
                    <p className="font-medium text-white mb-1">Description:</p>
                    <p>{page.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-400 text-sm">Selected</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {page.generatedOptions.length > 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-400 mb-2">Generated options available</p>
                      <p className="text-sm text-gray-500">
                        Go back to generator to select an option
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-400 mb-2">Generating...</p>
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 text-center">
          <h3 className="text-xl font-bold text-white mb-4">
            No pages generated yet
          </h3>
          <p className="text-gray-300 mb-6">
            Start creating your manga pages by going back to the generator.
          </p>
          <button
            onClick={onBackToGenerator}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
          >
            Start Generating Pages
          </button>
        </div>
      )}

      {/* Export summary */}
      {hasSelectedPages && (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <h3 className="text-lg font-bold text-white mb-4">Export Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-300">Total Pages:</span>
              <span className="text-white ml-2">{pages?.length || 0}</span>
            </div>
            <div>
              <span className="text-gray-300">Selected Pages:</span>
              <span className="text-green-400 ml-2">{selectedPages.length}</span>
            </div>
            <div>
              <span className="text-gray-300">Ready for Export:</span>
              <span className="text-green-400 ml-2">Yes</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
