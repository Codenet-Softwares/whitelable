import React from "react";

const ReusableModal = ({
  isOpen,
  onClose,
  title,
  bodyContent,
  onOpenNested,
}) => {
  return (
    <div
      className={`modal fade ${isOpen ? "show d-block" : ""}`}
      tabIndex="-1"
      role="dialog"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      aria-labelledby="modalTitle"
      aria-hidden={!isOpen}
    >
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content" style={{ width: "800px" }}>
          <div className="modal-header">
            <h5 className="modal-title" id="modalTitle">
              {title}
            </h5>
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body" style={{ width: "800px" }}>
            {bodyContent}
            {onOpenNested && (
              <button
                type="button"
                className="btn btn-primary mt-3"
                onClick={onOpenNested}
              >
                Open Next Modal
              </button>
            )}
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReusableModal;
