/**
 * High-reliability, cross-browser clipboard copy utility with automatic fallback.
 * Solves asynchronous clipboard focus and permission delays on first click across all desktop and mobile browsers.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;

  // 1. Ensure window has focus if feasible
  if (typeof window !== "undefined" && typeof window.focus === "function") {
    try {
      window.focus();
    } catch {
      // Ignore
    }
  }

  // 2. Try Modern Async Clipboard API if available and document has focus
  if (
    typeof navigator !== "undefined" &&
    navigator.clipboard &&
    typeof navigator.clipboard.writeText === "function"
  ) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Async clipboard failed (e.g. document not focused, iframe, or permission denied).
      // Fall through immediately to DOM execCommand fallback.
    }
  }

  // 3. Reliable Synchronous DOM Selection Fallback (execCommand)
  if (typeof document !== "undefined") {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;

      // Crucial styling for cross-browser selection without scrolling or layout shift
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.position = "fixed";
      textArea.style.width = "2em";
      textArea.style.height = "2em";
      textArea.style.padding = "0";
      textArea.style.border = "none";
      textArea.style.outline = "none";
      textArea.style.boxShadow = "none";
      textArea.style.background = "transparent";
      textArea.style.opacity = "0.01"; // Non-zero opacity ensures rendering engine marks it as selectable
      textArea.style.zIndex = "-1";

      document.body.appendChild(textArea);
      textArea.focus({ preventScroll: true });
      textArea.select();

      // Required for mobile devices / iOS Safari
      textArea.setSelectionRange(0, text.length);

      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);

      if (successful) return true;
    } catch (err) {
      console.error("DOM fallback copy failed:", err);
    }
  }

  return false;
}
