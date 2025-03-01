import React from "react";
import "../styles/ErrorDialogBox.css";
import Button from "./Button";

const ErrorDialogBox = ({ isOpen, title, message, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="dialog-overlay">
      <div className="error-dialog-box">
        <h2>{title}</h2>
        <div className="dialog-content">{message}</div>
        <Button variant="danger" onClick={onClose}>Close</Button>
      </div>
    </div>
  );
};

export default ErrorDialogBox;

// Example usage

// const [errorOpen, setErrorOpen] = useState(false);

// return (
//   <div className="container">
//     <Button variant="danger" onClick={() => setErrorOpen(true)}>Show Error</Button>

//     <ErrorDialog 
//       isOpen={errorOpen} 
//       title="Error Occurred" 
//       message="Something went wrong. Please try again." 
//       onClose={() => setErrorOpen(false)} 
//     />
//   </div>
// );