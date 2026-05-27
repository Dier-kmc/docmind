"use client"

import { useState } from "react"
import { Document as PDFDocument, Page, pdfjs } from "react-pdf"
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import "react-pdf/dist/Page/AnnotationLayer.css"
import "react-pdf/dist/Page/TextLayer.css"

// Worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

interface Props {
  fileUrl: string
  fileName: string
}

export function PdfViewer({ fileUrl, fileName }: Props) {
  const [numPages,    setNumPages]    = useState<number>(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [scale,       setScale]       = useState(1.0)
  const [error,       setError]       = useState(false)

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
        <FileText size={32} className="opacity-40" />
        <p className="text-sm">
          Cannot preview this file • Impossible d'afficher ce fichier
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-muted/20">

      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-background shrink-0">
        <p className="text-xs font-medium text-muted-foreground truncate max-w-[160px]">
          {fileName}
        </p>
        <div className="flex items-center gap-1">
          {/* Zoom */}
          <Button
            variant="ghost" size="icon"
            className="h-7 w-7"
            onClick={() => setScale((s) => Math.max(0.5, s - 0.2))}
          >
            <ZoomOut size={13} />
          </Button>
          <span className="text-[11px] text-muted-foreground w-10 text-center">
            {Math.round(scale * 100)}%
          </span>
          <Button
            variant="ghost" size="icon"
            className="h-7 w-7"
            onClick={() => setScale((s) => Math.min(2, s + 0.2))}
          >
            <ZoomIn size={13} />
          </Button>

          {/* Pages */}
          {numPages > 0 && (
            <>
              <div className="w-px h-4 bg-border mx-1" />
              <Button
                variant="ghost" size="icon"
                className="h-7 w-7"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                <ChevronLeft size={13} />
              </Button>
              <span className="text-[11px] text-muted-foreground w-14 text-center">
                {currentPage} / {numPages}
              </span>
              <Button
                variant="ghost" size="icon"
                className="h-7 w-7"
                disabled={currentPage >= numPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                <ChevronRight size={13} />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* PDF content */}
      <div className="flex-1 overflow-auto flex justify-center p-4 scrollbar-none">
        <PDFDocument
          file={fileUrl}
          onLoadSuccess={({ numPages: n }) => setNumPages(n)}
          onLoadError={() => setError(true)}
          loading={
            <div className="flex items-center justify-center h-40">
              <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          }
        >
          <Page
            pageNumber={currentPage}
            scale={scale}
            renderTextLayer
            renderAnnotationLayer
            className="shadow-lg rounded-lg overflow-hidden scrollbar-none"
          />
        </PDFDocument>
      </div>
    </div>
  )
}