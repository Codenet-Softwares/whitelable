import React, { useState } from "react";
import { toast } from "react-toastify";
import { useAppContext } from "../../../contextApi/context";
import { addInnerImage } from "../../../Utils/service/apiService";
import UpdateInnerImage from "./UpdateInnerImage";
import "../Images.css";

const CreateInnerImage = () => {
    const [file, setFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [validationMessage, setValidationMessage] = useState(""); // State for validation message
  const { store, } = useAppContext();
  
    const handleFileChange = (e) => {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
  
      // Reset validation message when file changes
      setValidationMessage("");
  
      // Create an image preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    };
  
    const handleRemoveImage = () => {
      setFile(null);
      setImagePreview(null);
      setValidationMessage(""); // Reset validation message when the image is removed
    };
  
    const handleUploadImage = async () => {
      // Validation before upload
      if (!file) {
        setValidationMessage("Please select an image to upload.");
        return;
      }
  
      if (!file.type.startsWith("image/")) {
        setValidationMessage("Please select a valid image file (e.g., PNG, JPG, JPEG).");
        return;
      }
  
      const maxFileSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxFileSize) {
        setValidationMessage("File size exceeds the 5MB limit.");
        return;
      }
  
    //   auth.showLoader();
  
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result.split(",")[1]; // Get the base64 part of the image
  
        const data = {
          data: [
            {
              docBase: base64Image,
              isActive: true,
            },
          ],
        };
  
        try {
          const response = await addInnerImage(store.user, data);
          toast.success("Image uploaded successfully!");
          setFile(null);
          setImagePreview(null);
          setValidationMessage(""); // Reset validation message after successful upload
        } catch (error) {
          toast.error("Failed to upload the image. Please try again.");
        } finally {
        //   auth.hideLoader();
        }
      };
  
      reader.readAsDataURL(file);
    };
  
    return (
      <div className="container p-5">
          <div className="" >
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
              {/* Display validation error message */}
              {validationMessage && (
                <div
                  className="validation_msg"
                >
                  {validationMessage}
                </div>
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
              <button className="btn btn-primary" onClick={handleUploadImage}>
                Upload Image
              </button>
            </div>
          </div>
          <UpdateInnerImage/>
      </div>
    );
  };

export default CreateInnerImage
