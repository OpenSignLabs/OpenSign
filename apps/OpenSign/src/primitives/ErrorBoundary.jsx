import { Component } from "react";

/**
 * Catches rendering errors so a failing widget cannot blank the whole page.
 * The fallback offers a reload instead of leaving the user with a white screen.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Keep the error visible in the console for diagnosis.
    console.error("Unhandled UI error:", error, info?.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="flex min-h-screen items-center justify-center bg-base-200 p-6">
        <div className="max-w-md rounded-box border border-base-300 bg-base-100 p-6 text-center shadow">
          <h1 className="mb-2 text-lg font-semibold text-base-content">
            Something went wrong
          </h1>
          <p className="mb-4 text-sm text-base-content/70">
            The page could not be rendered. Your work is saved on the server;
            reload to continue.
          </p>
          <button
            type="button"
            className="op-btn op-btn-primary"
            onClick={() => window.location.reload()}
          >
            Reload
          </button>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
