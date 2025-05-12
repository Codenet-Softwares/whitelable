import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  getGifSlider,
  deleteCreateGif,
  activeInactiveGameGif,
} from "../../../Utils/service/apiService";
import { useAppContext } from "../../../contextApi/context";

const UpdateGifSlider = () => {
  const { store } = useAppContext();
  const [gifImages, setGifImages] = useState([]);

  useEffect(() => {
    fetchGifImages();
  }, []);

  const fetchGifImages = async () => {
    try {
      const response = await getGifSlider(store.user);
      setGifImages(response.data || []);
    } catch (error) {
      toast.error("Failed to fetch GIF slider images.");
    }
  };

  const handleDelete = async (imageId) => {
    try {
      await deleteCreateGif(imageId);
      fetchGifImages(); // 🔁 Refresh after delete
    } catch (error) {
      toast.error("Failed to delete the GIF. Please try again.");
    }
  };

  const handleToggleActiveStatus = async (imageId, currentStatus) => {
    if (!imageId) {
      toast.error("Invalid image ID.");
      return;
    }

    const newStatus = !currentStatus;
    const body = { isActive: newStatus };

    try {
      const response = await activeInactiveGameGif(imageId, body);

      if (response && response.status === 200) {
        // Optimistic UI update
        setGifImages((prev) =>
          prev.map((gif) =>
            gif.imageId === imageId ? { ...gif, isActive: newStatus } : gif
          )
        );
        toast.success(`GIF ${newStatus ? "activated" : "deactivated"} successfully.`);
      }
    } catch (error) {
      toast.error("Failed to update GIF status. Please try again.");
    }
  };

  return (
    <div className="mt-3">
      <div className="card shadow-sm">
        <div className="card_header">
          <h3 className="mb-0 fw-bold text-center text-uppercase p-2 text-white">
            GIF Slider
          </h3>
        </div>
        <div className="card-body">
          {gifImages.length === 0 ? (
            <div className="text-center text-danger fw-bold">
              No GIF Images Available.
            </div>
          ) : (
            <div className="row">
              {gifImages.map((gif, index) => (
                <div key={gif.imageId} className="col-md-6 col-sm-6 mb-4">
                  <div className="card">
                    <img
                      src={gif.url}
                      alt={`GIF ${index + 1}`}
                      className="card-img-top"
                      style={{ height: "150px", objectFit: "cover" }}
                    />
                    <div className="card-body text-center">
                      <p className="card-text">
                        Status:{" "}
                        <span
                          style={{
                            color: gif.isActive ? "green" : "red",
                          }}
                        >
                          {gif.isActive ? "Active" : "Inactive"}
                        </span>
                      </p>
                      <div className="d-flex justify-content-center my-3">
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`flexSwitch-${gif.imageId}`}
                            checked={gif.isActive}
                            onChange={() =>
                              handleToggleActiveStatus(
                                gif.imageId,
                                gif.isActive
                              )
                            }
                          />
                          <label
                            className="form-check-label"
                            htmlFor={`flexSwitch-${gif.imageId}`}
                          ></label>
                        </div>
                      </div>
                      <button
                        className="btn btn-danger mt-2"
                        onClick={() => handleDelete(gif.imageId)}
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

export default UpdateGifSlider;
