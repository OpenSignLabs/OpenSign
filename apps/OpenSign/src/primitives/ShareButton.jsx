import { useCallback, useState } from "react";
import ModalUi from "./ModalUi";

function useShare({ title, text, url }) {
  const [error, setError] = useState(null);
  const isSupported = typeof navigator !== "undefined" && !!navigator.share;

  const share = useCallback(async () => {
    if (!isSupported) {
      setError(new Error("Web Share API not supported"));
      return;
    }
    try {
      await navigator.share({ title, text, url });
    } catch (err) {
      // User may have cancelled, or another error occurred
      setError(err);
    }
  }, [isSupported, title, text, url]);

  return { share, isSupported, error };
}

/**
 * A customizable ShareButton component.
 * If `children` are provided, they are used as the trigger element;
 * otherwise, a default share button is rendered.
 *
 * @param {object} props
 * @param {string} props.title - Title for sharing
 * @param {string} props.text - Text for sharing
 * @param {string} props.url   - URL to share
 * @param {string} [props.className] - Optional styling class
 * @param {React.ReactNode} [props.children] - Custom trigger element
 */
export default function ShareButton({ title, text, url, className, children }) {
  const { share, isSupported, error } = useShare({ title, text, url });
  const [isPopupOpen, setPopupOpen] = useState(false);

  // Native Web Share API supported
  if (isSupported) {
    return (
      <button
        onClick={share}
        className={className}
        aria-label="Share this page"
      >
        {children || "🔗 Share"}
      </button>
    );
  }

  // Fallback: trigger opens popup
  const subject = encodeURIComponent(title || text);
  const body = encodeURIComponent(`${text}\n\n${url}`);

  return (
    <>
      {/* React Fragment */}
      <button
        onClick={() => setPopupOpen(true)}
        className={className}
        aria-label="Open share options"
      >
        {children || "🔗 Share"}
      </button>
      {isPopupOpen && (
        <ModalUi
          isOpen
          title={
            <>
              <i className="fa-solid fa-share-from-square"></i> Share
            </>
          }
          handleClose={() => setPopupOpen(false)}
        >
          {error && <p style={{ color: "red" }}>Error: {error.message}</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 justify-items-start text-lg p-[20px]">
            {/* Copy Link */}
            <button
              onClick={() => navigator.clipboard.writeText(url)}
              className="m-2 op-btn op-btn-primary op-btn-outline op-btn-xs md:op-btn-sm w-[190px]"
            >
              <i className="fa-solid fa-clipboard fa-lg"></i> Copy to clipboard
            </button>
            {/* Twitter */}
            <button
              onClick={() =>
                window.open(
                  `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
                  "_blank",
                  "noopener"
                )
              }
              className="m-2 op-btn op-btn-primary op-btn-outline op-btn-xs md:op-btn-sm w-[190px]"
            >
              <i className="fa-brands fa-square-x-twitter fa-lg"></i> Share on
              Twitter
            </button>

            {/* Facebook */}
            <button
              onClick={() =>
                window.open(
                  `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
                  "_blank",
                  "noopener"
                )
              }
              className="m-2 op-btn op-btn-primary op-btn-outline op-btn-xs md:op-btn-sm w-[190px]"
            >
              <i className="fa-brands fa-square-facebook fa-lg"></i> Share on
              Facebook
            </button>

            {/* WhatsApp */}
            <button
              onClick={() =>
                window.open(
                  `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`,
                  "_blank",
                  "noopener"
                )
              }
              className="m-2 op-btn op-btn-primary op-btn-outline op-btn-xs md:op-btn-sm w-[190px]"
            >
              <i className="fa-brands fa-square-whatsapp fa-lg"></i> Share on
              WhatsApp
            </button>

            {/* Gmail (Web) */}
            <button
              onClick={() =>
                window.open(
                  `https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`,
                  "_blank",
                  "noopener"
                )
              }
              className="m-2 op-btn op-btn-primary op-btn-outline op-btn-xs md:op-btn-sm w-[190px]"
            >
              <i className="fa-solid fa-envelope fa-lg"></i> Share via Gmail
            </button>

            {/* Microsoft Teams */}
            <button
              onClick={() =>
                window.open(
                  `https://teams.microsoft.com/l/share?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
                  "_blank",
                  "noopener"
                )
              }
              className="m-2 op-btn op-btn-primary op-btn-outline op-btn-xs md:op-btn-sm w-[190px]"
            >
              <i className="fa-brands fa-microsoft fa-lg"></i> Share on Teams
            </button>

            {/* Outlook Web */}
            <button
              onClick={() =>
                window.open(
                  `https://outlook.live.com/owa/?path=/mail/action/compose&subject=${subject}&body=${body}`,
                  "_blank",
                  "noopener"
                )
              }
              className="m-2 op-btn op-btn-primary op-btn-outline op-btn-xs md:op-btn-sm w-[190px]"
            >
              <i className="fa-solid fa-envelope-open-text fa-lg"></i> Share via
              Outlook
            </button>
          </div>
        </ModalUi>
      )}
    </>
  );
}
