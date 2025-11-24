import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import workerSrc from "pdfjs-dist/build/pdf.worker.mjs?url";
import { convertFileSrc } from "@tauri-apps/api/core";

pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

export default function PdfViewer({ path }: { path: string }) {
  const [numPages, setNumPages] = useState<number>(0);

  const url = convertFileSrc(path);
  console.log(url);

  return (
    <div>
      <Document file={url} onLoadSuccess={(pdf) => setNumPages(pdf.numPages)}>
        {Array.from({ length: numPages }, (_, i) => (
          <Page key={i} pageNumber={i + 1} />
        ))}
      </Document>
    </div>
  );
}
