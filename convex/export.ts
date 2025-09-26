import { mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";

export const generatePDF = action({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args): Promise<{
    pdfUrl: string;
    pageCount: number;
    pages: Array<{
      id: Id<"pages">;
      type: string;
      imageUrl: string;
      order: number;
    }>;
  }> => {
    // Get all pages for the project
    const pages = await ctx.runQuery(api.pages.list, { projectId: args.projectId });
    
    // Filter only pages with selected images
    const selectedPages = pages.filter((page: any) => page.selectedImage);
    
    if (selectedPages.length === 0) {
      throw new Error("No pages with selected images found");
    }

    try {
      // Import jsPDF dynamically
      const { jsPDF } = await import("jspdf");
      
      // Create new PDF document
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Sort pages by order
      const sortedPages = selectedPages.sort((a: any, b: any) => a.order - b.order);

      for (let i = 0; i < sortedPages.length; i++) {
        const page = sortedPages[i];
        
        if (i > 0) {
          pdf.addPage();
        }

        try {
          // Download image
          const response = await fetch(page.selectedImage!);
          const blob = await response.blob();
          const imageData = await blobToBase64(blob);
          
          // Add image to PDF
          const imgWidth = 210; // A4 width in mm
          const imgHeight = 297; // A4 height in mm
          
          pdf.addImage(imageData, 'JPEG', 0, 0, imgWidth, imgHeight);
          
          // Add page number
          pdf.setFontSize(12);
          pdf.text(`Page ${i + 1}`, 10, 20);
          
        } catch (error) {
          console.error(`Failed to add page ${i + 1} to PDF:`, error);
          // Add placeholder text
          pdf.setFontSize(16);
          pdf.text(`Page ${i + 1}: ${page.pageType}`, 20, 150);
          pdf.text(`Description: ${page.description}`, 20, 170);
        }
      }

      // Generate PDF blob
      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      
      return {
        pdfUrl,
        pageCount: selectedPages.length,
        pages: sortedPages.map((page: any) => ({
          id: page._id,
          type: page.pageType,
          imageUrl: page.selectedImage,
          order: page.order,
        })),
      };
    } catch (error) {
      console.error("PDF generation failed:", error);
      throw new Error("Failed to generate PDF");
    }
  },
});

export const generateZIP = action({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args): Promise<{
    zipUrl: string;
    pageCount: number;
    pages: Array<{
      id: Id<"pages">;
      type: string;
      imageUrl: string;
      order: number;
    }>;
  }> => {
    // Get all pages for the project
    const pages = await ctx.runQuery(api.pages.list, { projectId: args.projectId });
    
    // Filter only pages with selected images
    const selectedPages = pages.filter((page: any) => page.selectedImage);
    
    if (selectedPages.length === 0) {
      throw new Error("No pages with selected images found");
    }

    try {
      // Import JSZip dynamically
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();

      // Sort pages by order
      const sortedPages = selectedPages.sort((a: any, b: any) => a.order - b.order);

      for (let i = 0; i < sortedPages.length; i++) {
        const page = sortedPages[i];
        
        try {
          // Download image
          const response = await fetch(page.selectedImage!);
          const blob = await response.blob();
          
          // Add image to ZIP
          const fileName = `page_${String(i + 1).padStart(3, '0')}_${page.pageType}.jpg`;
          zip.file(fileName, blob);
          
        } catch (error) {
          console.error(`Failed to add page ${i + 1} to ZIP:`, error);
        }
      }

      // Generate ZIP blob
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const zipUrl = URL.createObjectURL(zipBlob);
      
      return {
        zipUrl,
        pageCount: selectedPages.length,
        pages: sortedPages.map((page: any) => ({
          id: page._id,
          type: page.pageType,
          imageUrl: page.selectedImage,
          order: page.order,
        })),
      };
    } catch (error) {
      console.error("ZIP generation failed:", error);
      throw new Error("Failed to generate ZIP");
    }
  },
});

// Helper function to convert blob to base64
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]); // Remove data:image/jpeg;base64, prefix
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}