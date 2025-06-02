import React from "react";

const SelectModal = ({ show, onClose, onChange, onSubmit, data }) => {
  if (!show) return null;

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
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Select Employee</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
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
                <label htmlFor="priority" className="form-label">
                  Priority
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="priority"
                  name="priority"
                  value={data.priority}
                  onChange={onChange}
                  required
                />
              </div>

              <div className="d-flex justify-content-end gap-2">
                <button className="btn btn-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Select
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectModal;
