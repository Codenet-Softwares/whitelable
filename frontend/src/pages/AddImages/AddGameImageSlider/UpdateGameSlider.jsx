import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
// import "bootstrap/dist/css/bootstrap.min.css";
// import { FaTrashAlt } from "react-icons/fa";
import { useAppContext } from "../../../contextApi/context";
import { getGameSliderImage,deleteGameCreatedImage,activeInactiveGameImage } from "../../../Utils/service/apiService";
const UpdateGameSlider = () => {
  const { store } = useAppContext();
    const [sliderImages, setSliderImages] = useState([]);
  
    // Fetch slider images on component mount
    useEffect(() => {
    //   auth.showLoader();
      fetchSliderImages();
    }, []);
  
    const fetchSliderImages = async () => {
      try {
        const response = await getGameSliderImage(store.user);
        setSliderImages(response.data.data || []);
      } catch (error) {
        toast.error("Failed to fetch slider images.");
        console.error("Error fetching images:", error);
      }
      finally {
        // auth.hideLoader();
      }
    };
  
    const handleDelete = async (imageId) => {
    //   auth.showLoader();
      try {
        await deleteGameCreatedImage(store.user, imageId);
        toast.success("Image deleted successfully!");
        fetchSliderImages();
      } catch (error) {
        toast.error("Failed to delete the image. Please try again.");
        console.error("Error deleting image:", error);
      } finally {
        // auth.hideLoader();
      }
      
    };
  
    const handleToggleActiveStatus = async (imageId, currentStatus) => {
    //   auth.showLoader();
  
      const newStatus = !currentStatus;
  
      try {
        const response = await activeInactiveGameImage(
          store.user,
          imageId,
          newStatus
        );
  
        if (response && response.status === 200) {
          setSliderImages((prev) =>
            prev.map((image) =>
              image.imageId === imageId
                ? { ...image, isActive: newStatus }
                : image
            )
          );
          toast.success(
            `Image ${newStatus ? "activated" : "deactivated"} successfully.`
          );
        } else {
          toast.error("Failed to update image status. Please try again.");
        }
      } catch (error) {
        toast.error("Failed to update image status. Please try again.");
        console.error("API Error:", error);
      } finally {
        // auth.hideLoader();
      }
    };
  
    return (
      <div className="mt-3">
        <div className="card shadow-sm">
          <div
            className="card_header">
            <h3 className="mb-0 fw-bold text-center text-uppercase p-2 text-white">Game Slider</h3>
          </div>
          <div className="card-body"  style={{ background: "#E1D1C7" }}>
            {sliderImages.length === 0 ? (
              <div className="text-center text-danger fw-bold">No Slider Images Available.</div>
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
                          {/* <FaTrashAlt /> */}
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

export default UpdateGameSlider
