import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import SliderImageDelete from "./SliderImageDelete";
import {
  addOuterImage,
  updateOuterImage,
} from "../../../Utils/service/apiService";
import { useAppContext } from "../../../contextApi/context";
import "../Images.css";

const CreateImage = () => {
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [validationMessage, setValidationMessage] = useState("");
  const [sliderImages, setSliderImages] = useState([]);
  const { store, showLoader, hideLoader } = useAppContext();

  const fetchSliderImages = () => {
    updateOuterImage(store.user)
      .then((res) => {
        const imageData = res?.data ?? [];
        setSliderImages(imageData);
      })
      .catch((err) => {
        toast.error("Failed to load slider images.");
      });
  };

  useEffect(() => {
    fetchSliderImages();
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
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
    setValidationMessage("");
  };

  const handleAddImage = () => {
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
      const docBase = reader.result;
      const base64Image = docBase.split(",")[1];

      const data = {
        data: [
          {
            docBase: base64Image,
            isActive: true,
            text: "Some description text for the slider image",
            headingText: "Main heading for the slider",
          },
        ],
      };

      addOuterImage(data, true)
        .then((response) => {
          setFile(null);
          setImagePreview(null);
          setValidationMessage("");
          fetchSliderImages();
          hideLoader(); // ✅ hideLoader on success
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
          hideLoader(); // ✅ hideLoader on error
        });
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

        <SliderImageDelete
          sliderImages={sliderImages}
          refreshImages={fetchSliderImages}
        />
      </div>
    </div>
  );
};

export default CreateImage;
