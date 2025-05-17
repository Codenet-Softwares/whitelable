import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  updateInnerImage,
  deleteInnerImage,
  activeInactiveInnerImage,
} from "../../../Utils/service/apiService";
import { useAppContext } from "../../../contextApi/context";

const UpdateInnerImage = () => {
  const { store } = useAppContext();
  const [innerImages, setInnerImages] = useState([]);

  useEffect(() => {
    fetchInnerImages();
  }, []);

  const fetchInnerImages = async () => {
    try {
      const response = await updateInnerImage(store.user);
      setInnerImages(response.data || []);
    } catch (error) {
      toast.error("Failed to fetch inner images.");
    }
  };

  const handleDelete = async (imageId) => {
    try {
      await deleteInnerImage(imageId);
      toast.success("Image deleted successfully.");
      fetchInnerImages();
    } catch (error) {
      toast.error("Failed to delete the image. Please try again.");
    }
  };

  const handleToggleActiveStatus = async (imageId, currentStatus) => {
    const newStatus = !currentStatus;

    // Optimistically update UI
    const updatedImages = innerImages.map((img) =>
      img.imageId === imageId ? { ...img, isActive: newStatus } : img
    );
    setInnerImages(updatedImages);

    try {
      await activeInactiveInnerImage(imageId, { isActive: newStatus });
      toast.success(`Image ${newStatus ? "activated" : "deactivated"} successfully.`);
    } catch (error) {
      toast.error("Failed to update image status. Please try again.");
      fetchInnerImages(); // Re-sync in case of failure
    }
  };

  return (
    <div className="mt-3">
      <div className="card shadow-sm">
        <div className="card_header">
          <h3 className="mb-0 fw-bold text-center text-uppercase p-2 text-white">
            Inner Images
          </h3>
        </div>
        <div className="card-body">
          {innerImages.length === 0 ? (
            <div className="text-center text-danger fw-bold">No Images Available.</div>
          ) : (
            <div className="row">
              {innerImages.map((image, index) => (
                <div key={image.imageId} className="col-md-4 col-sm-4 mb-4">
                  <div className="card">
                    <img
                      src={image.image}
                      alt={`Inner Image ${index + 1}`}
                      className="card-img-top"
                      style={{ height: "150px", objectFit: "cover" }}
                    />
                    <div className="card-body text-center">
                      <p className="card-text">
                        Status:{" "}
                        <span style={{ color: image.isActive ? "green" : "red" }}>
                          {image.isActive ? "Active" : "Inactive"}
                        </span>
                      </p>
                      <div className="d-flex justify-content-center my-3">
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`flexSwitch-${image.imageId}`}
                            checked={image.isActive}
                            onChange={() =>
                              handleToggleActiveStatus(image.imageId, image.isActive)
                            }
                          />
                          <label
                            className="form-check-label"
                            htmlFor={`flexSwitch-${image.imageId}`}
                          ></label>
                        </div>
                      </div>
                      <button
                        className="btn btn-danger mt-2"
                        onClick={() => handleDelete(image.imageId)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpdateInnerImage;
