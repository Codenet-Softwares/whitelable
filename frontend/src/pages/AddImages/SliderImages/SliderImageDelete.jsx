import React from "react";
import { toast } from "react-toastify";
import {
  deleteOuterImage,
  activeInactiveImage,
} from "../../../Utils/service/apiService";
import "../Images.css";

const SliderImageDelete = ({ sliderImages, refreshImages }) => {
  const handleDelete = async (imageId) => {
    try {
      await deleteOuterImage(imageId);
      refreshImages();
    } catch (error) {
      toast.error("Failed to delete the image. Please try again.");
    }
  };

const handleToggleActiveStatus = async (imageId, currentStatus) => {
  const newStatus = !currentStatus;

  // Optimistically update UI
  const updatedImages = sliderImages.map((image) =>
    image.imageId === imageId ? { ...image, isActive: newStatus } : image
  );

  try {
    await activeInactiveImage(imageId, { isActive: newStatus });
    toast.success(
      `Image ${newStatus ? "activated" : "deactivated"} successfully.`
    );
    refreshImages(); // Optional: re-sync with backend
  } catch (error) {
    toast.error("Failed to update image status. Please try again.");
  }
};


  return (
    <div className="mt-3">
      <div className="card shadow-sm">
        <div className="card_header">
          <h3 className="mb-0 fw-bold text-center text-uppercase p-2 text-white">
            Outer Images
          </h3>
        </div>
        <div className="card-body">
          <div
            className="card-container"
            style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}
          >
            {sliderImages.length === 0 ? (
              <div
                className="text-center text-danger fw-bold"
                style={{ width: "100%" }}
              >
                No Images Available.
              </div>
            ) : (
              sliderImages.map((slider) => (
                <div
                  key={slider.imageId}
                  className="card"
                  style={{
                    width: "385px",
                    border: "2px solid #3E5879",
                    borderRadius: "10px",
                    backgroundColor: "#f8f9fa",
                  }}
                >
                  <div className="card-body text-center">
                    <img
                      src={slider.image}
                      alt="Slider"
                      style={{
                        width: "100%",
                        height: "200px",
                        objectFit: "cover",
                        borderRadius: "8px",
                      }}
                    />
                  </div>
                  <div className="card-body text-center">
                    <p className="card-text mb-2">
                      Status:{" "}
                      <span
                        style={{ color: slider.isActive ? "green" : "red" }}
                      >
                        {slider.isActive ? "Active" : "Inactive"}
                      </span>
                    </p>
                    <div className="d-flex justify-content-center mb-3">
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`flexSwitch-${slider.imageId}`}
                          checked={slider.isActive}
                          onChange={() =>
                            handleToggleActiveStatus(
                              slider.imageId,
                              slider.isActive
                            )
                          }
                        />
                        <label
                          className="form-check-label"
                          htmlFor={`flexSwitch-${slider.imageId}`}
                        ></label>
                      </div>
                    </div>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(slider.imageId)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SliderImageDelete;
