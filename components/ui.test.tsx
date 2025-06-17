import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import UI from "./ui";

describe("UI Component", () => {
  describe("rendering", () => {
    it("should render the main heading", () => {
      render(<UI />);

      expect(
        screen.getByRole("heading", { name: "Better Reader View" }),
      ).toBeInTheDocument();
    });

    it("should render placeholder text", () => {
      render(<UI />);

      expect(
        screen.getByText(
          "This is a placeholder for the Better Reader View UI.",
        ),
      ).toBeInTheDocument();
    });

    it("should render coming soon message", () => {
      render(<UI />);

      expect(
        screen.getByText("More features will be added soon!"),
      ).toBeInTheDocument();
    });
  });

  describe("structure", () => {
    it("should render all expected elements", () => {
      render(<UI />);

      expect(screen.getByRole("heading")).toBeInTheDocument();
      expect(
        screen.getAllByText(/This is a placeholder|More features/),
      ).toHaveLength(2);
    });

    it("should use correct heading level", () => {
      render(<UI />);

      const heading = screen.getByRole("heading", {
        name: "Better Reader View",
      });
      expect(heading.tagName).toBe("H1");
    });
  });

  describe("accessibility", () => {
    it("should have accessible heading structure", () => {
      render(<UI />);

      const headings = screen.getAllByRole("heading");
      expect(headings).toHaveLength(1);
      expect(headings[0]).toHaveAccessibleName("Better Reader View");
    });
  });
});
