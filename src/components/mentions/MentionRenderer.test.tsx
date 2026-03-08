import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MentionRenderer } from "./MentionRenderer";

describe("MentionRenderer", () => {
  it("renders null for empty content", () => {
    const { container } = render(<MentionRenderer content="" />);
    expect(container.innerHTML).toBe("");
  });

  it("renders plain text without modifications", () => {
    render(<MentionRenderer content="Hello world" />);
    expect(screen.getByText("Hello world")).toBeInTheDocument();
  });

  it("renders structured mentions as styled chips", () => {
    render(<MentionRenderer content="Hi @[John Doe](abc-123)!" />);
    expect(screen.getByText("@John Doe")).toBeInTheDocument();
    expect(screen.getByText("@John Doe")).toHaveAttribute("data-user-id", "abc-123");
  });

  it("renders multiple structured mentions", () => {
    render(<MentionRenderer content="@[Alice](1) and @[Bob](2)" />);
    expect(screen.getByText("@Alice")).toBeInTheDocument();
    expect(screen.getByText("@Bob")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <MentionRenderer content="test" className="custom-class" />
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });
});
