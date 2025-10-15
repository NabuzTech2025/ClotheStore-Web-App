import { useEffect } from "react";

const MobileZoomFix = () => {
  useEffect(() => {
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );

    if (isMobile) {
      // Prevent zoom on input focus
      const preventZoomOnFocus = () => {
        const viewport = document.querySelector("meta[name=viewport]");
        if (!viewport) return;

        const originalContent = viewport.getAttribute("content");

        // When input is focused, temporarily allow zoom then disable it
        const handleFocusIn = (e) => {
          if (
            e.target.tagName === "INPUT" ||
            e.target.tagName === "SELECT" ||
            e.target.tagName === "TEXTAREA"
          ) {
            viewport.setAttribute(
              "content",
              "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
            );
          }
        };

        const handleFocusOut = () => {
          viewport.setAttribute("content", originalContent);
        };

        document.addEventListener("focusin", handleFocusIn);
        document.addEventListener("focusout", handleFocusOut);

        // Cleanup function for these listeners
        return () => {
          document.removeEventListener("focusin", handleFocusIn);
          document.removeEventListener("focusout", handleFocusOut);
        };
      };

      const cleanupFocusListeners = preventZoomOnFocus();

      // Additional fix: prevent page zoom on load
      const fixInitialZoom = () => {
        const viewport = document.querySelector("meta[name=viewport]");
        if (viewport) {
          // Force reset
          viewport.setAttribute(
            "content",
            "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"
          );
        }

        // Reset body zoom
        document.body.style.zoom = "1";
        document.documentElement.style.zoom = "1";

        const root = document.getElementById("root");
        if (root) {
          root.style.zoom = "1";
        }

        window.scrollTo(0, 0);
      };

      fixInitialZoom();
      setTimeout(fixInitialZoom, 100);
      setTimeout(fixInitialZoom, 300);

      window.addEventListener("pageshow", fixInitialZoom);

      return () => {
        window.removeEventListener("pageshow", fixInitialZoom);
        if (cleanupFocusListeners) {
          cleanupFocusListeners();
        }
      };
    }
  }, []);

  return null; // This component doesn't render anything
};

export default MobileZoomFix;
