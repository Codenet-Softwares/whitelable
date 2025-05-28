import React, { useState } from "react";
import { toast } from "react-toastify";
import UpdateGifSlider from "./UpdateGifSlider";
import { useAppContext } from "../../../contextApi/context";
import { gifSliderImage } from "../../../Utils/service/apiService";
// import "./Images.css"
const AddGameGif = () => {
  const [file, setFile] = useState(null);
  const [gifPreview, setGifPreview] = useState(null);
  const [validationMessage, setValidationMessage] = useState(""); // State for validation message
  const { showLoader, hideLoader } = useAppContext();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    // Reset validation message when file changes
    setValidationMessage("");

    const reader = new FileReader();
    reader.onloadend = () => {
      setGifPreview(reader.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleRemoveGif = () => {
    setFile(null);
    setGifPreview(null);
    setValidationMessage(""); // Reset validation message when the GIF is removed
  };

  const handleUploadGif = async () => {
    showLoader();

    if (!file) {
      setValidationMessage("Please select a GIF to upload.");
      hideLoader();

      return;
    }

    if (!file.type.startsWith("image/gif")) {
      setValidationMessage("Please select a valid GIF file.");
      hideLoader();

      return;
    }

    // const maxFileSize = 5 * 1024 * 1024; // 5MB
    // if (file.size > maxFileSize) {
    //   setValidationMessage("File size exceeds the 5MB limit.");
    //   return;
    // }

    //   auth.showLoader();

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Gif = reader.result.split(",")[1];

      const data = {
        data: [
          {
            docBase: base64Gif,
            isActive: true,
          },
        ],
      };

      try {
        const response = await gifSliderImage(data);
        console.log("response===========>", response);
        setFile(null);
        setGifPreview(null);
        setValidationMessage(""); // Reset validation message after successful upload
      } catch (error) {
        if (
          error.response &&
          error.response.data &&
          error.response.data.errMessage
        ) {
          toast.error(error.response.data.errMessage); // Display the backend error message
        } else {
          toast.error("Failed to upload the GIF. Please try again."); // Fallback error message
        }
        console.error(error);
      }
      hideLoader();
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
          <h4 className="fw-bold">Choose GIF</h4>
          <i className="fas fa-plus-circle"></i>
          {gifPreview && (
            <img
              src={gifPreview}
              alt="GIF Preview"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "8px",
                position: "absolute",
                top: 0,
                left: 0,
              }}
            />
          )}
        </div>
        {/* Display validation error message */}
        {validationMessage && (
          <div
            style={{
              color: "#FF0000",
              marginTop: "10px",
              fontSize: "14px",
              textAlign: "center",
            }}
          >
            {validationMessage}
          </div>
        )}
        {gifPreview && (
          <div
            onClick={handleRemoveGif}
            style={{
              cursor: "pointer",
              color: "#FF0000",
              marginTop: "10px",
            }}
          >
            <i className="fas fa-times"></i> Remove GIF
          </div>
        )}
        <input
          id="file-input"
          type="file"
          accept="image/gif"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
      </div>
      <div className="text-center">
        <button className="btn btn-primary" onClick={handleUploadGif}
        style={{ backgroundColor: "#0d6efd", borderColor: "#0d6efd" }}
        >
          Upload GIF
        </button>
      </div>
      <UpdateGifSlider />
    </div>
  );
};

export default AddGameGif;
