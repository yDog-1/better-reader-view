import { useEffect } from "react";

interface PopupMessageProps {
  message: string;
  onClose: () => void;
}

export default function PopupMessage({ message, onClose }: PopupMessageProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const popupStyle: React.CSSProperties = {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    color: "white",
    padding: "30px 50px",
    borderRadius: "10px",
    zIndex: "9999",
    fontSize: "24px",
    textAlign: "center",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
  };

  return <div style={popupStyle}>{message}</div>;
}
