import React from "react";
import "../styles/DialogBox.css";
import Button from "./Button";

const DialogBox = ({ isOpen, title, children, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="dialog-overlay">
      <div className="dialog-box">
        <h2>{title}</h2>
        <div className="dialog-content">{children}</div>
        <Button variant="light" onClick={onClose}>Close</Button>
      </div>
    </div>
  );
};
export default DialogBox;
//Example usage
// 
// const [isOpen, setIsOpen] = useState(false);

// // Function to return dynamic content
// const renderDialogContent = () => (
//   <div>
//     <p>Your quiz is ready to download!</p>
//     <Button variant="dark" >Download</Button>
//   </div>
// );

// return (
//   <div className="container">
//     <Button variant="dark" onClick={() => setIsOpen(true)}>Open Dialog</Button>

//     <DialogBox isOpen={isOpen} title="Quiz Generated" onClose={() => setIsOpen(false)}>
//       {renderDialogContent()}
//     </DialogBox>
//   </div>
// );
