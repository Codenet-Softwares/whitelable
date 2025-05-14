import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  getGameSliderImage,
  deleteGameCreatedImage,
  activeInactiveGameImage,
} from "../../../Utils/service/apiService";
import { useAppContext } from "../../../contextApi/context";

const UpdateGameSlider = () => {
  const { store } = useAppContext();
  const [sliderImages, setSliderImages] = useState([]);

  useEffect(() => {
    fetchSliderImages();
  }, []);

  const fetchSliderImages = async () => {
    try {
      const response = await getGameSliderImage(store.user);
      setSliderImages(response.data || []);
    } catch (error) {
      toast.error("Failed to fetch slider images.");
      console.error("Error fetching images:", error);
    }
  };

  const handleDelete = async (imageId) => {
    try {
      await deleteGameCreatedImage(imageId);
      fetchSliderImages(); // Refresh after delete
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Failed to delete the image. Please try again.");
    }
  };

  const handleToggleActiveStatus = async (imageId, currentStatus) => {
    const newStatus = !currentStatus;

    // Optimistically update UI
    const updatedImages = sliderImages.map((img) =>
      img.imageId === imageId ? { ...img, isActive: newStatus } : img
    );
    setSliderImages(updatedImages);
console.log("Image ID==========>",updatedImages)
    try {
      await activeInactiveGameImage(imageId, { isActive: newStatus });
      toast.success(
        `Image ${newStatus ? "activated" : "deactivated"} successfully.`
      );
    } catch (error) {
      toast.error("Failed to update image status. Please try again.");
    }
  };

  return (
    <div className="mt-3">
      <div className="card shadow-sm">
        <div className="card_header">
          <h3 className="mb-0 fw-bold text-center text-uppercase p-2 text-white">
            Game Slider
          </h3>
        </div>
        <div className="card-body">
          {sliderImages.length === 0 ? (
            <div className="text-center text-danger fw-bold">
              No Slider Images Available.
            </div>
          ) : (
            <div className="row">
              {sliderImages.map((image, index) => (
                <div key={image.imageId} className="col-md-4 col-sm-4 mb-4">
                  <div className="card">
                    <img
                      src={image.image}
                      alt={`Slider ${index + 1}`}
                      className="card-img-top"
                      style={{ height: "150px", objectFit: "cover" }}
                    />
                    <div className="card-body text-center">
                      <p className="card-text">
                        Status:{" "}
                        <span
                          style={{
                            color: image.isActive ? "green" : "red",
                          }}
                        >
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
                              handleToggleActiveStatus(
                                image.imageId,
                                image.isActive
                              )
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

export default UpdateGameSlider;
