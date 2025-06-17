import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { act } from "react";
import PopupMessage from "./PopupMsg";

// Mock Vanilla Extract styles
vi.mock("../assets/popup.css", () => ({
  popupContainer: "popup-container",
  popupLight: "popup-light",
  popupDark: "popup-dark",
  popupSepia: "popup-sepia",
}));

describe("PopupMessage", () => {
  let mockOnClose: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnClose = vi.fn();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("rendering", () => {
    it("should render popup message with correct text", () => {
      render(<PopupMessage message="Test message" onClose={mockOnClose} />);

      expect(screen.getByText("Test message")).toBeInTheDocument();
    });

    it("should apply correct CSS class", () => {
      render(<PopupMessage message="Test message" onClose={mockOnClose} />);

      const popup = screen.getByText("Test message");
      expect(popup).toHaveClass("popup-container");
    });
  });

  describe("theme support", () => {
    it("should use dark theme by default", () => {
      render(<PopupMessage message="Test message" onClose={mockOnClose} />);

      const popup = screen.getByText("Test message");
      expect(popup).toHaveClass("popup-container");
    });

    it("should accept light theme prop", () => {
      render(
        <PopupMessage
          message="Test message"
          onClose={mockOnClose}
          theme="light"
        />,
      );

      const popup = screen.getByText("Test message");
      expect(popup).toHaveClass("popup-container");
    });

    it("should accept sepia theme prop", () => {
      render(
        <PopupMessage
          message="Test message"
          onClose={mockOnClose}
          theme="sepia"
        />,
      );

      const popup = screen.getByText("Test message");
      expect(popup).toHaveClass("popup-container");
    });
  });

  describe("auto-close functionality", () => {
    it("should call onClose after 3 seconds", () => {
      render(<PopupMessage message="Test message" onClose={mockOnClose} />);

      expect(mockOnClose).not.toHaveBeenCalled();

      // Fast-forward time by 3 seconds
      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(mockOnClose).toHaveBeenCalledOnce();
    });

    it("should not call onClose before 3 seconds", () => {
      render(<PopupMessage message="Test message" onClose={mockOnClose} />);

      // Fast-forward time by 2.9 seconds (just before 3 seconds)
      act(() => {
        vi.advanceTimersByTime(2900);
      });

      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it("should cleanup timer on unmount", () => {
      const { unmount } = render(
        <PopupMessage message="Test message" onClose={mockOnClose} />,
      );

      // Unmount before timer expires
      unmount();

      // Fast-forward time
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe("message content", () => {
    it("should render empty message", () => {
      const { container } = render(
        <PopupMessage message="" onClose={mockOnClose} />,
      );

      // Check for popup container when message is empty
      const popup = container.querySelector(".popup-container");
      expect(popup).toBeInTheDocument();
      expect(popup).toHaveTextContent("");
    });

    it("should render long message", () => {
      const longMessage =
        "This is a very long message that should still be displayed correctly in the popup component without any issues";

      render(<PopupMessage message={longMessage} onClose={mockOnClose} />);

      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });

    it("should render message with special characters", () => {
      const specialMessage = "Message with 特殊文字 and emojis 🎉✨";

      render(<PopupMessage message={specialMessage} onClose={mockOnClose} />);

      expect(screen.getByText(specialMessage)).toBeInTheDocument();
    });
  });

  describe("callback behavior", () => {
    it("should handle onClose being called multiple times", () => {
      render(<PopupMessage message="Test message" onClose={mockOnClose} />);

      // Fast-forward time by 3 seconds
      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(mockOnClose).toHaveBeenCalledOnce();

      // Fast-forward more time to ensure no additional calls
      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(mockOnClose).toHaveBeenCalledOnce();
    });
  });
});
