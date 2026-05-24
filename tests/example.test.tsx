import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

describe("Example Test", () => {
  it("should render correctly", () => {
    render(<div>Hello World</div>);
    expect(screen.getByText("Hello World")).toBeInTheDocument();
  });
});
