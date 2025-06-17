import { useEffect } from "react";
import { popupContainer } from "../assets/popup.css";

interface PopupMessageProps {
  message: string;
  onClose: () => void;
  theme?: "light" | "dark" | "sepia";
}

export default function PopupMessage({ message, onClose }: PopupMessageProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return <div className={popupContainer}>{message}</div>;
}
