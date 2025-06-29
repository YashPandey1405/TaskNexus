import { useEffect, useRef, useState } from "react";

const ModalForm = ({
  title = "Edit",
  label = "Content",
  defaultValue = "",
  onSubmit,
  onClose,
}) => {
  const modalRef = useRef(null);
  const [inputValue, setInputValue] = useState(defaultValue);

  useEffect(() => {
    const modalInstance = new bootstrap.Modal(modalRef.current);
    modalInstance.show();

    const handleHidden = () => {
      onClose?.();
    };

    modalRef.current.addEventListener("hidden.bs.modal", handleHidden);
    return () => {
      modalRef.current.removeEventListener("hidden.bs.modal", handleHidden);
    };
  }, []);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSubmit(inputValue);
    const modal = bootstrap.Modal.getInstance(modalRef.current);
    modal.hide(); // Close modal manually after submission
  };

  return (
    <div className="modal fade" tabIndex="-1" ref={modalRef}>
      <div className="modal-dialog">
        <form className="modal-content" onSubmit={handleFormSubmit}>
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
            />
          </div>
          <div className="modal-body">
            <label className="form-label">{label}</label>
            <textarea
              className="form-control"
              rows="4"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              required
            />
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalForm;
