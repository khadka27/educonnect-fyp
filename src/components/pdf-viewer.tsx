"use client";

import { useState } from "react";
import {
  Eye,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "src/components/ui/dialog";

interface PdfViewerProps {
  fileUrl: string;
  title: string;
}

export default function PdfViewer({ fileUrl, title }: PdfViewerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1);

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 2.5));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.5));
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-900/30"
        >
          <Eye size={16} className="mr-2" />
          View PDF
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl w-[95vw] h-[90vh] p-0 bg-white dark:bg-gray-900">
        <div className="flex flex-col h-full">
          <DialogHeader className="px-4 py-3 border-b border-emerald-100 dark:border-emerald-900/50 flex flex-row items-center justify-between">
            <DialogTitle className="text-emerald-800 dark:text-emerald-200 truncate pr-4">
              {title}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <div className="text-sm text-emerald-600 dark:text-emerald-400 mr-2">
                Page {currentPage} of {totalPages || "?"}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={handleZoomOut}
                disabled={scale <= 0.5}
                className="h-8 w-8 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-900/30"
              >
                <ZoomOut size={16} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleZoomIn}
                disabled={scale >= 2.5}
                className="h-8 w-8 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-900/30"
              >
                <ZoomIn size={16} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrevPage}
                disabled={currentPage <= 1}
                className="h-8 w-8 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-900/30"
              >
                <ChevronLeft size={16} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleNextPage}
                disabled={currentPage >= totalPages}
                className="h-8 w-8 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-900/30"
              >
                <ChevronRight size={16} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                asChild
                className="h-8 w-8 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-900/30"
              >
                <a
                  href={fileUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Download size={16} />
                </a>
              </Button>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-800 p-4">
            <div className="h-full flex items-center justify-center">
              <iframe
                src={`${fileUrl}#page=${currentPage}&zoom=${scale * 100}`}
                title={`PDF Viewer: ${title}`}
                className="w-full h-full border-0 rounded-md shadow-md"
                onLoad={(e) => {
                  // This is a simplified approach - in a real app you might need
                  // to use a PDF.js library to get accurate page counts
                  try {
                    const iframe = e.currentTarget;
                    const iframeDoc =
                      iframe.contentDocument || iframe.contentWindow?.document;
                    if (iframeDoc) {
                      // This is a very rough estimation and won't work reliably
                      // A proper implementation would use PDF.js to get the actual page count
                      setTotalPages(Math.max(totalPages, 1));
                    }
                  } catch (error) {
                    console.error("Error accessing iframe content:", error);
                  }
                }}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
