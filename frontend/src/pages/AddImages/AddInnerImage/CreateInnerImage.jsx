import React, { useState } from "react";
import { toast } from "react-toastify";
import { useAppContext } from "../../../contextApi/context";
import { addInnerImage } from "../../../Utils/service/apiService";
import UpdateInnerImage from "./UpdateInnerImage";
import "../Images.css";

const CreateInnerImage = () => {
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [validationMessage, setValidationMessage] = useState("");
  const [refreshImages, setRefreshImages] = useState(false); // <-- NEW
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
      setValidationMessage(
        "Please select a valid image file (e.g., PNG, JPG, JPEG)."
      );
      hideLoader();

      return;
    }

    const maxFileSize = 5 * 1024 * 1024;
    if (file.size > maxFileSize) {
      setValidationMessage("File size exceeds the 5MB limit.");
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

      addInnerImage(data, true)
        .then((response) => {
          setFile(null);
          setImagePreview(null);
          setValidationMessage("");

          // Trigger child to refetch images
          setRefreshImages((prev) => !prev);
          hideLoader();
        })
        .catch((error) => {
          toast.error(
            error?.response?.data?.errMessage || "Failed to upload the image."
          );
          hideLoader();
        });
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="container p-5">
      <div className="">
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
              style={{
                cursor: "pointer",
                color: "#FF0000",
                marginTop: "10px",
              }}
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
          <button className="btn btn-primary" onClick={handleUploadImage}
           style={{ backgroundColor: "#0d6efd", borderColor: "#0d6efd" }}
          >
            Upload Image
          </button>
        </div>
      </div>

      {/* Pass refreshImages as key to trigger child re-render */}
      <UpdateInnerImage key={refreshImages} />
    </div>
  );
};

export default CreateInnerImage;
