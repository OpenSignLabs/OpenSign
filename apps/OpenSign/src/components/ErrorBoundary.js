import React, { Component } from "react";

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true
    };
  }

  componentDidCatch(error, info) {
    console.log(error);
    console.log(info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-2">
          <div
            style={{
              height: "100vh",
              display: "flex",

              flexFlow: "column"
            }}
          >
            <h1
              style={{
                fontSize: "2em",
                fontFamily: "sans-serif",
                textShadow: "0 0 20px black"
              }}
            >
              Something went wrong.
            </h1>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
