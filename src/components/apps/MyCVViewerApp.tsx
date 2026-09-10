import {
  Show,
  createEffect,
  createSignal,
  onCleanup,
  onMount,
  type JSX,
} from "solid-js";
import type {
  PDFDocumentLoadingTask,
  PDFDocumentProxy,
  RenderTask,
} from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

const PDF_URL = "/pdf/myCV.pdf";

export default function MyCVViewer(): JSX.Element {
  const [page, setPage] = createSignal(1);
  const [numPages, setNumPages] = createSignal(0);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);
  const [ready, setReady] = createSignal(false);
  /** Bumped on container resize so the current page re-renders at the new width. */
  const [sizeTick, setSizeTick] = createSignal(0);

  let canvasRef: HTMLCanvasElement | undefined;
  let containerRef: HTMLDivElement | undefined;
  let pdfDoc: PDFDocumentProxy | null = null;
  let renderTask: RenderTask | null = null;
  let loadingTask: PDFDocumentLoadingTask | null = null;

  const cancelRender = () => {
    if (renderTask) {
      renderTask.cancel();
      renderTask = null;
    }
  };

  /** pdf.js v5+/v6: PDFDocumentProxy has cleanup(), not destroy(). */
  const releaseDoc = (doc: PDFDocumentProxy | null) => {
    if (!doc) return;
    if (typeof doc.cleanup === "function") {
      void doc.cleanup();
    }
  };

  const renderPage = async (pageNum: number) => {
    if (!pdfDoc || !canvasRef) return;

    cancelRender();

    try {
      const pdfPage = await pdfDoc.getPage(pageNum);
      const containerWidth = containerRef?.clientWidth || canvasRef.parentElement?.clientWidth || 600;
      const unscaled = pdfPage.getViewport({ scale: 1 });
      const scale = Math.max(0.5, (containerWidth - 16) / unscaled.width);
      const viewport = pdfPage.getViewport({ scale });
      const canvas = canvasRef;
      const context = canvas.getContext("2d");
      if (!context) return;

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      renderTask = pdfPage.render({
        canvasContext: context,
        viewport,
        canvas,
      });
      await renderTask.promise;
      renderTask = null;
    } catch (err) {
      const name = err && typeof err === "object" && "name" in err ? String(err.name) : "";
      if (name === "RenderingCancelledException") return;
      setError(err instanceof Error ? err.message : "Failed to render page");
    }
  };

  onMount(() => {
    let cancelled = false;
    let resizeTimer: number | undefined;

    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

        loadingTask = pdfjs.getDocument({ url: PDF_URL });
        const doc = await loadingTask.promise;
        loadingTask = null;
        if (cancelled) {
          releaseDoc(doc);
          return;
        }

        pdfDoc = doc;
        setNumPages(doc.numPages);
        setPage(1);
        setLoading(false);
        setReady(true);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load PDF");
        setLoading(false);
      }
    })();

    const ro = new ResizeObserver(() => {
      if (resizeTimer !== undefined) window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        setSizeTick((n) => n + 1);
      }, 80);
    });
    if (containerRef) ro.observe(containerRef);

    onCleanup(() => {
      cancelled = true;
      if (resizeTimer !== undefined) window.clearTimeout(resizeTimer);
      ro.disconnect();
      cancelRender();
      loadingTask?.destroy();
      loadingTask = null;
      releaseDoc(pdfDoc);
      pdfDoc = null;
    });
  });

  createEffect(() => {
    if (!ready()) return;
    const pageNum = page();
    sizeTick(); // re-render when container size changes
    void renderPage(pageNum);
  });

  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(numPages() || p, p + 1));

  return (
    <div class="flex h-full min-h-0 flex-col bg-neutral-900 text-white">
      <div class="flex shrink-0 flex-wrap items-center gap-2 border-b border-white/10 px-3 py-2 text-sm">
        <button
          type="button"
          class="rounded bg-white/10 px-3 py-1 disabled:opacity-40"
          disabled={loading() || !!error() || page() <= 1}
          onClick={goPrev}
        >
          Prev
        </button>
        <button
          type="button"
          class="rounded bg-white/10 px-3 py-1 disabled:opacity-40"
          disabled={loading() || !!error() || page() >= numPages()}
          onClick={goNext}
        >
          Next
        </button>
        <span class="tabular-nums text-white/80">
          Page {numPages() ? page() : "–"} / {numPages() || "–"}
        </span>
        <a
          href={PDF_URL}
          download
          class="ml-auto rounded bg-white/15 px-3 py-1 hover:bg-white/25"
        >
          Download
        </a>
      </div>

      <div ref={containerRef} class="min-h-0 flex-1 overflow-auto p-2">
        <Show when={loading()}>
          <p class="p-4 text-center text-white/70">Loading CV…</p>
        </Show>
        <Show when={error()}>
          {(msg) => (
            <div class="flex flex-col items-center gap-3 p-6 text-center">
              <p class="text-red-300">{msg()}</p>
              <a
                href={PDF_URL}
                download
                class="rounded bg-white/15 px-3 py-1.5 hover:bg-white/25"
              >
                Download PDF
              </a>
            </div>
          )}
        </Show>
        <Show when={!loading() && !error()}>
          <canvas ref={canvasRef} class="mx-auto block max-w-full bg-white" />
        </Show>
      </div>
    </div>
  );
}
