import React from "react";

const FinalizeModal = ({ show, onClose, onChange, onSubmit, data }) => {
  if (!show) return null; // Don't render if not visible

  return (
    <div
      className="modal fade show"
      style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
      tabIndex="-1"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="modal-dialog"
        role="document"
        onClick={(e) => e.stopPropagation()} // Prevent modal close on content click
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Finalize Employee</h5>
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onSubmit();
              }}
            >
              <div className="mb-3">
                <label htmlFor="remarks" className="form-label">
                  Remarks
                </label>
                <textarea
                  id="remarks"
                  name="remarks"
                  className="form-control"
                  value={data.remarks}
                  onChange={onChange}
                  rows={3}
                />
              </div>

              <div className="d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Finalize
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinalizeModal;
