import React, { useState } from "react";
import { toast } from "react-toastify";
import { useAppContext } from "../../../contextApi/context";
import { gameSliderImage } from "../../../Utils/service/apiService";
import UpdateGameSlider from "./UpdateGameSlider";
const CreateGameImage = () => {
    const [file, setFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [validationMessage, setValidationMessage] = useState(""); // State for validation message
  const { store } = useAppContext();
  
    const handleFileChange = (e) => {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
  
      // Reset validation message when a new file is selected
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
      setValidationMessage(""); // Reset validation message when the image is removed
    };
  
    const handleUploadImage = async () => {
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
  
      const reader = new FileReader();
      reader.onloadend = async () => {
        // auth.showLoader(); 
  
        const base64Image = reader.result.split(",")[1];
  
        const data = {
          data: [
            {
              docBase: base64Image,
              isActive: true,
            },
          ],
        };
  
        try {
          const response = await gameSliderImage(store.user, data);
  
          toast.success("Image uploaded successfully!");
          setFile(null);
          setImagePreview(null);
          setValidationMessage(""); 
        } catch (error) {
          if (error.response && error.response.data && error.response.data.errMessage) {
            toast.error(error.response.data.errMessage);
          } else {
            toast.error("Failed to upload the image. Please try again.");
          }
          console.error(error);
        } finally {
        //   auth.hideLoader(); 
        }
      };
  
      reader.readAsDataURL(file);
    };
  
    return (
      <div className="container p-5">
          <div>
            <div className="mb-4 text-center">
              <div
              className="choose_image"
                onClick={() => document.getElementById("file-input").click()}>
                <h4 className="fw-bold">Choose Image</h4>
                <i className="fas fa-plus-circle"></i>
                {imagePreview && (
                  <img
                  className="image_size"
                    src={imagePreview}
                    alt="Image Preview"/>
                )}
              </div>
  
              {/* Show validation message below the image selection */}
              {validationMessage && (
                <div
                className="validation_msg">
                  {validationMessage}
                </div>
              )}
  
              {imagePreview && (
                <div
                  onClick={handleRemoveImage}
                  className="image_preview" 
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
        <UpdateGameSlider/>
      </div>
    );
}

export default CreateGameImage
