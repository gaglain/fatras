import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PageLoader } from "./page-loader";

describe("PageLoader", () => {
  it("renders with default message", () => {
    render(<PageLoader />);
    expect(screen.getByText("Chargement...")).toBeInTheDocument();
  });

  it("renders with custom message", () => {
    render(<PageLoader message="Loading data..." />);
    expect(screen.getByText("Loading data...")).toBeInTheDocument();
  });

  it("renders without message when empty string", () => {
    const { container } = render(<PageLoader message="" />);
    expect(container.querySelector("p")).toBeNull();
  });

  it("applies fullScreen class", () => {
    const { container } = render(<PageLoader fullScreen />);
    expect(container.firstChild).toHaveClass("min-h-screen");
  });

  it("applies custom className", () => {
    const { container } = render(<PageLoader className="my-custom" />);
    expect(container.firstChild).toHaveClass("my-custom");
  });
});
