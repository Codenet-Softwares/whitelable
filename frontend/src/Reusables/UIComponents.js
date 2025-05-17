import React from "react";

export const ContainerWrapper = ({ children }) => (
  <div className="container-fluid py-5 bg-light min-vh-100">
    <div className="row justify-content-center">
      <div className="col-lg-10 col-xl-9">{children}</div>
    </div>
  </div>
);

export const BootstrapCard = ({ title, onBack, children, headerVariant = "primary" }) => (
  <div className="card shadow-sm border-0 text-white">
    <div className={`card-header bg-${headerVariant} text-white d-flex align-items-center`}> 
      {onBack && (
        <button className="btn btn-outline-light btn-sm me-3" onClick={onBack}>
          <i className="fas fa-arrow-left"></i>
        </button>
      )}
      <h5 className="mb-0 w-100 text-center text-white">
        <i className="fas fa-user-shield me-2"></i>{title}
      </h5>
    </div>
    <div className="card-body bg-white text-white">{children}</div>
  </div>
);

export const InfoRow = ({ icon, label, value }) => (
  <div className="d-flex align-items-center mb-2 text-dark">
    <span className="me-2">
      <i className={`fas fa-${icon} text-${icon === "user-tie" ? "info" : "primary"}`}></i>
    </span>
    <strong className="me-2">{label}:</strong>
    <span>{value}</span>
  </div>
);

export const ToggleSwitch = ({ label, icon, checked, onChange, id }) => (
  <div className="form-check form-switch mb-3">
    <input
      className="form-check-input"
      type="checkbox"
      role="switch"
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

export const IconButton = ({ label, icon, onClick, variant = "primary", outline = false }) => (
  <button className={`btn btn-${outline ? `outline-${variant}` : variant} rounded-pill px-4`} onClick={onClick}>
    <i className={`fas fa-${icon} me-2`}></i>{label}
  </button>
);