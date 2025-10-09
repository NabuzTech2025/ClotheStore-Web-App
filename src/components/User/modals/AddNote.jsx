import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { BsArrowLeft } from "react-icons/bs";
import { HiArrowLongLeft } from "react-icons/hi2";
import { currentLanguage } from "../../../utils/helper/lang_translate";

const AddNoteModel = ({ show, handleClose, onSave, orderNote }) => {
  const [note, setNote] = useState(orderNote || "");
  const [isFirstTimeEntry, setIsFirstTimeEntry] = useState(false);

  // Track if this is the first time entering text
  useEffect(() => {
    if (show) {
      // Check if orderNote is empty or null/undefined - indicates first time
      setIsFirstTimeEntry(!orderNote || orderNote.trim() === "");
      setNote(orderNote || "");
    }
  }, [show, orderNote]);

  const handleSave = () => {
    onSave(note); // Pass the note to parent component
    handleClose(); // Close modal after save
  };

  const handleCancel = () => {
    if (isFirstTimeEntry) {
      // If it's first time entry, clear the note
      setNote("");
      onSave(""); // Clear the note in parent component too
    } else {
      // If not first time, keep the original note
      setNote(orderNote || "");
    }
    handleClose();
  };

  const handleBackButton = () => {
    if (isFirstTimeEntry) {
      // If it's first time entry, clear the note
      setNote("");
      onSave(""); // Clear the note in parent component too
    } else {
      // If not first time, keep the original note
      setNote(orderNote || "");
    }
    handleClose();
  };

  const handleNoteChange = (e) => {
    setNote(e.target.value);
    // Once user starts typing for the first time, it's no longer first time entry
    if (isFirstTimeEntry && e.target.value.trim() !== "") {
      setIsFirstTimeEntry(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={handleCancel} // Use handleCancel for the modal's onHide
      backdrop="static"
      keyboard={true}
      centered
      size="md"
    >
      <Modal.Header>
        <button
          type="button"
          onClick={handleBackButton}
          style={{
            border: "1px solid #d1d5db",
            borderRadius: "50%",
            backgroundColor: "transparent",
            width: "35px",
            height: "35px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            marginRight: "10px",
          }}
        >
          <BsArrowLeft size={18} />
        </button>
        <Modal.Title className="modal-title text-2xl">
          {currentLanguage.add} {currentLanguage.note}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="">
          <textarea
            style={{
              width: "100%",
              border: "1px solid #ccc",
              borderRadius: "4px",
              padding: "10px",
              fontSize: "14px",
              fontFamily: "inherit",
              resize: "vertical",
              outline: "none",
              marginBottom: "15px",
            }}
            cols={20}
            rows={5}
            placeholder="Enter your note here..."
            value={note}
            onChange={handleNoteChange}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
            }}
          >
            <button
              type="button"
              style={{
                backgroundColor: "transparent",
                color: "black",
                border: "none",
                borderRadius: "4px",
                fontSize: "20px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "color 0.2s ease",
                padding: "5px 10px",
              }}
              onClick={handleCancel}
            >
              {currentLanguage.cancel}
            </button>
            <button
              type="button"
              style={{
                backgroundColor: "transparent",
                color: "black",
                border: "none",
                borderRadius: "4px",
                fontSize: "20px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "color 0.2s ease",
                padding: "5px 10px",
              }}
              onClick={handleSave}
            >
              {orderNote ? currentLanguage.update : currentLanguage.save}
            </button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default AddNoteModel;
