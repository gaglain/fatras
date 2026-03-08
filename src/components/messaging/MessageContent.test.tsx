import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MessageContent } from "./MessageContent";

describe("MessageContent", () => {
  it("renders plain text", () => {
    render(<MessageContent content="Hello world" />);
    expect(screen.getByText("Hello world")).toBeInTheDocument();
  });

  it("renders structured mention in white bold", () => {
    render(<MessageContent content="Hi @[John](abc)!" />);
    const mention = screen.getByText("@John");
    expect(mention).toBeInTheDocument();
    expect(mention).toHaveClass("text-white", "font-semibold");
  });

  it("renders multiple structured mentions", () => {
    render(<MessageContent content="@[Alice](1) and @[Bob](2)" />);
    expect(screen.getByText("@Alice")).toHaveClass("text-white");
    expect(screen.getByText("@Bob")).toHaveClass("text-white");
  });

  it("renders surrounding text correctly with mentions", () => {
    render(<MessageContent content="Before @[Name](id) after" />);
    expect(screen.getByText("Before")).toBeInTheDocument();
    expect(screen.getByText("@Name")).toBeInTheDocument();
    expect(screen.getByText("after")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <MessageContent content="test" className="my-class" />
    );
    expect(container.firstChild).toHaveClass("my-class");
  });
});
