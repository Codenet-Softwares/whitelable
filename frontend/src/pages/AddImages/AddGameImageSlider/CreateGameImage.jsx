import React, { useState } from "react";
import { toast } from "react-toastify";
import { useAppContext } from "../../../contextApi/context";
import { gameSliderImage } from "../../../Utils/service/apiService";
import UpdateGameSlider from "./UpdateGameSlider";
import "../Images.css";

const CreateGameImage = () => {
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [validationMessage, setValidationMessage] = useState("");
  const [refreshImages, setRefreshImages] = useState(false); // 🔁 refresh trigger
  const { showLoader, hideLoader } = useAppContext();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setValidationMessage("");

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleRemoveImage = () => {
    setFile(null);
    setImagePreview(null);
    setValidationMessage("");
  };

  const handleUploadImage = () => {
    showLoader();

    if (!file) {
      setValidationMessage("Please select an image to upload.");
      hideLoader();

      return;
    }

    if (!file.type.startsWith("image/")) {
      setValidationMessage("Please select a valid image file.");
      hideLoader();

      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Image = reader.result.split(",")[1];
      const data = {
        data: [
          {
            docBase: base64Image,
            isActive: true,
          },
        ],
      };

      gameSliderImage(data, true)
        .then(() => {
          toast.success("Image uploaded successfully!");
          setFile(null);
          setImagePreview(null);
          setValidationMessage("");
          setRefreshImages((prev) => !prev);
          hideLoader();
        })
        .catch((error) => {
          if (
            error.response &&
            error.response.data &&
            error.response.data.errMessage
          ) {
            toast.error(error.response.data.errMessage);
          } else {
            toast.error("Failed to upload the image. Please try again.");
          }
          hideLoader();
        });
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="container p-5">
      <div className="mb-4 text-center">
        <div
          className="choose_image"
          onClick={() => document.getElementById("file-input").click()}
        >
          <h4 className="fw-bold">Choose Image</h4>
          <i className="fas fa-plus-circle"></i>
          {imagePreview && (
            <img
              className="image_size"
              src={imagePreview}
              alt="Image Preview"
            />
          )}
        </div>

        {validationMessage && (
          <div className="validation_msg">{validationMessage}</div>
        )}

        {imagePreview && (
          <div
            className="image_preview"
            onClick={handleRemoveImage}
            style={{ cursor: "pointer", color: "#FF0000", marginTop: "10px" }}
          >
            <i className="fas fa-times"></i> Remove Image
          </div>
        )}

        <input
          id="file-input"
          type="file"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
      </div>
      <div className="text-center">
        <button className="btn btn-primary" onClick={handleUploadImage}>
          Upload Image
        </button>
      </div>
      <UpdateGameSlider key={refreshImages} /> {/* 🔁 Refreshes child */}
    </div>
  );
};

export default CreateGameImage;
