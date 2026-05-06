import { Component, type ReactNode } from "react";
import i18n from "i18next";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
            <h2 className="text-xl font-bold text-text-primary">{i18n.t("common:errorBoundary.title")}</h2>
            <p className="text-sm text-text-secondary">
              {i18n.t("common:errorBoundary.description")}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-lg bg-accent-primary px-4 py-2 text-sm font-medium text-white hover:bg-accent-primary/90"
            >
              {i18n.t("common:buttons.reload")}
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
