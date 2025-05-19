import React from "react";

export const ContainerWrapper = ({ children }) => (
  <div className="container-fluid py-5 bg-light min-vh-100">
    <div className="row justify-content-center">
      <div className="col-lg-10 col-xl-9">{children}</div>
    </div>
  </div>
);

export const BootstrapCard = ({
  title,
  onBack,
  children,
  headerVariant = "primary",
}) => (
  <div className="card shadow-sm border-0 text-white text-uppercase">
    <div
      className={`card-header bg-${headerVariant} text-white d-flex align-items-center`}
    >
      {onBack && (
        <button className="btn btn-outline-light btn-sm me-3" onClick={onBack}>
          <i className="fas fa-arrow-left"></i>
        </button>
      )}
      <h5 className="mb-0 w-100 text-center text-white">
        <i className="fas fa-user-shield me-2"></i>
        {title}
      </h5>
    </div>
    <div className="card-body bg-white text-white">{children}</div>
  </div>
);
export const InfoRow = ({ icon, label, value }) => (
  <div className="d-flex align-items-center justify-content-center mb-3">
    <i
      className={`fas fa-${icon} text-${icon === "user-tie" ? "info" : "success"} fs-5 me-2`}
    ></i>
    <strong className="me-1 text-muted">{label}:</strong>
    <span className="fw-semibold text-dark">{value}</span>
  </div>
);

export const ToggleSwitch = ({ label, icon, checked, onChange, id, name }) => (
  <div className="form-check form-switch mb-3">
    <input
      className="form-check-input"
      type="checkbox"
      role="switch"
      name={name} // Make sure this is passed
      id={id}
      checked={checked}
      onChange={onChange}
    />
    <label className="form-check-label" htmlFor={id}>
      <i className={`fas fa-${icon} me-2 text-secondary`}></i>
      {label}
    </label>
  </div>
);

export const IconButton = ({
  label,
  icon,
  onClick,
  variant = "primary",
  outline = false,
}) => (
  <button
    className={`btn btn-${
      outline ? `outline-${variant}` : variant
    } rounded-pill px-4`}
    onClick={onClick}
  >
    <i className={`fas fa-${icon} me-2`}></i>
    {label}
  </button>
);
