/** Touch / mobile browsers (Android Chrome, MIUI, tablets). */
export function isMobileBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) return true;
  return navigator.maxTouchPoints > 0 && window.matchMedia("(max-width: 1024px)").matches;
}

export type DownloadPdfResult = "download" | "view";

async function waitForPrintLayout(): Promise<void> {
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
  await new Promise((r) => setTimeout(r, 150));
}

async function savePdfBlob(blob: Blob, filename: string, mobile: boolean): Promise<DownloadPdfResult> {
  const url = URL.createObjectURL(blob);
  try {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    if (mobile) {
      // Programmatic `download` is unreliable on Android; open the PDF viewer instead.
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    }
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return mobile ? "view" : "download";
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 120_000);
  }
}

/** Render `#print-area` (or any element) to PDF with mobile-friendly fallbacks. */
export async function downloadPdfFromElement(
  element: HTMLElement,
  filename: string,
  options?: { margin?: number },
): Promise<DownloadPdfResult> {
  const mobile = isMobileBrowser();
  const scale = mobile ? 1 : 2;
  const margin = options?.margin ?? 10;

  element.scrollIntoView({ block: "start" });
  window.scrollTo(0, 0);

  document.body.classList.add("printing");
  try {
    await waitForPrintLayout();

    const { default: html2pdf } = await import("html2pdf.js");
    const blob = (await html2pdf()
      .set({
        margin,
        filename,
        image: { type: "jpeg", quality: mobile ? 0.85 : 0.95 },
        html2canvas: {
          scale,
          useCORS: true,
          backgroundColor: "#ffffff",
          scrollY: -window.scrollY,
          scrollX: -window.scrollX,
          logging: false,
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["avoid-all", "css", "legacy"] },
      })
      .from(element)
      .outputPdf("blob")) as Blob;

    return await savePdfBlob(blob, filename, mobile);
  } finally {
    document.body.classList.remove("printing");
  }
}
