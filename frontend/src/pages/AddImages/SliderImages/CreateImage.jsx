import React, { useState } from "react";
// import { useAuth } from "../../../Utils/Auth";
import { toast } from "react-toastify";
import SliderImageDelete from "./SliderImageDelete";
import { addOuterImage } from "../../../Utils/service/apiService";
import { useAppContext } from "../../../contextApi/context";
import "../Images.css";
const CreateImage = () => {
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [validationMessage, setValidationMessage] = useState(""); // State for validation message
  const { store } = useAppContext();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    // Reset validation message when file changes
    setValidationMessage("");

    const fileReader = new FileReader();
    fileReader.onloadend = () => {
      setImagePreview(fileReader.result);
    };
    fileReader.readAsDataURL(selectedFile);
  };

  const handleRemoveImage = () => {
    setFile(null);
    setImagePreview(null);
    setValidationMessage(""); // Reset validation message when the image is removed
  };

  const handleAddImage = async () => {
    // Validation before upload
    if (!file) {
      setValidationMessage("Please select an image to upload.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setValidationMessage("Please select a valid image file.");
      return;
    }

    // const maxFileSize = 5 * 1024 * 1024;
    // if (file.size > maxFileSize) {
    //   setValidationMessage("File size exceeds the 5MB limit.");
    //   return;
    // }

    // auth.showLoader();

    const reader = new FileReader();
    reader.onloadend = async () => {
      const docBase = reader.result;
      const base64Image = docBase.split(",")[1];

      const data = {
        data: [
          {
            docBase: base64Image,
            isActive: true,
          },
        ],
      };

      try {
        const response = await addOuterImage(store.user, data);

        toast.success("Image uploaded successfully!");
        setFile(null);
        setImagePreview(null);
        setValidationMessage(""); // Reset validation message after successful upload
      } catch (error) {
        if (
          error.response &&
          error.response.data &&
          error.response.data.errMessage
        ) {
          toast.error(error.response.data.errMessage);
        } else {
          toast.error("Failed to upload the image. Please try again.");
        }
      } finally {
        store.hideLoader();
      }
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="container p-5">
      <div className="col">
        <div className="mb-4 text-center">
          <div
            className="choose_image"
            onClick={() => document.getElementById("file-input").click()}
          >
            <h4 className="fw-bold">Choose Image</h4>
            <i className="fas fa-plus-circle"></i>
            {/* Display the image preview if available */}
            {imagePreview && (
              <img
                className="image_size"
                src={imagePreview}
                alt="Image Preview"
              />
            )}
          </div>

          {/* Display validation error message */}
          {validationMessage && (
            <div className="validation_msg">{validationMessage}</div>
          )}

          {/* Cross button outside the box */}
          {imagePreview && (
            <div className="image_preview" onClick={handleRemoveImage}>
              <i className="fas fa-times"></i>
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
          <button className="btn btn-primary" onClick={handleAddImage}>
            Upload Image
          </button>
        </div>
        <SliderImageDelete />
      </div>
    </div>
  );
};

export default CreateImage;
