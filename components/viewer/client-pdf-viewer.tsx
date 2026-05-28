"use client"

import dynamic from "next/dynamic"

// 🎯 CORRECTION : On mappe explicitement l'export nommé vers la clé 'default' attendue par React
const LazyPdfViewer = dynamic(
  () => import("./pdf-viewer").then((mod) => ({ default: mod.PdfViewer })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    ),
  }
)

interface ClientPdfViewerProps {
  fileUrl: string
  fileName: string
}

export function ClientPdfViewer({ fileUrl, fileName }: ClientPdfViewerProps) {
  return <LazyPdfViewer fileUrl={fileUrl} fileName={fileName} />
}