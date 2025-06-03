import type React from "react";
import { useEffect } from "react";

interface PopupMessageProps {
	message: string;
	onClose: () => void;
}

const PopupMessage: React.FC<PopupMessageProps> = ({ message, onClose }) => {
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
};

export default PopupMessage;
