import React, { useState } from "react";
import { toast } from "react-toastify";
import UpdateOuterAnnouncement from "./UpdateOuterAnnouncement";
import { useAppContext } from "../../contextApi/context";
import { CreateOuterAnnouncement } from "../../Utils/service/apiService";
const OuterAnnouncement = () => {
  const { store } = useAppContext();
  const [announcementData, setAnnouncementData] = useState({
    announcement: "",
  });
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(""); // State to manage validation error message

  const emojis = [
    "😊", "😂", "😍", "😎", "🤔", "🥺", "💯", "🎉", "👍", "🙏",
    "❤️", "💙", "💚", "💛", "💜", "🧡", "🤍", "🤎",
    "⚽", "🏀", "🏈", "⚾", "🎾", "🏐", "🏉", "🎱", "🎮", "🎲",
    "🌞", "🌈", "🌧️", "⛅", "🌨️", "❄️", "🌬️", "🌪️", "🌟", "🌙",
    "🚗", "🚕", "🚙", "🚌", "🚎", "🏎️", "🚓", "🚑", "🚒", "🚐",
    "🎵", "🎶", "🎤", "🎧", "🎼", "🎷", "🎸", "🎻", "🥁", "🎺",
    "🎬", "📽️", "🍿", "🎥", "📺", "📷", "📸", "📡", "🎮", "🎧",
    "💻", "🖥️", "📱", "📞", "📡", "💾", "🖱️", "🖲️", "⌨️", "💻",
    "🎁", "💌", "🎉", "🎊", "🎈", "🧧", "🧸", "🛍️", "📦",
    "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "0️⃣"
  ];

  const handleEmojiClick = (emoji) => {
    setAnnouncementData((prev) => ({
      ...prev,
      announcement: prev.announcement + emoji,
    }));
    setError(""); 
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAnnouncementData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleCreateAnnouncement = async () => {
    setIsLoading(true);
    const { announcement } = announcementData;
    if (!announcement.trim()) {
      setError("Please enter a valid announcement.");
      setIsLoading(false);
      return;
    }

    const data = { announcement };

    try {
      await CreateOuterAnnouncement(store, data);
      toast.success("Announcement created successfully!");
      setAnnouncementData({ announcement: "" });
    } catch (error) {
      if (error.response && error.response.data && error.response.data.errMessage) {
        toast.error(error.response.data.errMessage);
      } else {
        toast.error("Failed to create announcement. Please try again.");
      }
      console.error("Error creating announcement:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container my-5 p-5">
      <div className="col">
        <div className="row">
          <div className="col-6">
          <h3 className="fw-bold text-center text-uppercase text-white p-3 rounded announcement_header">
        Create Outer Announcement
      </h3>
      {isLoading && (
        <div className="text-center my-3">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}
      <div className="mt-4">
        <div className="mb-3">
          <div className="d-flex">
            <input
              type="text"
              id="announcement"
              name="announcement"
              className="form-control fw-bold"
              style={{
                
                border: error ? "2px solid red" : "2px solid #3E5879",
              }}
              value={announcementData.announcement}
              onChange={handleChange}
              placeholder="Enter Outer Announcement"
            />
            <button
              type="button"
              className="btn btn-info ms-2"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <h5 className="fw-bold text-dark">Choose Emojis 😊</h5>
            </button>
          </div>

          {/* Show Validation Message Below Input Field */}
          {error && <small className="text-danger">{error}</small>}

          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div className="emoji-picker mt-2">
              <div className="emoji-grid">
                {emojis.map((emoji, index) => (
                  <button
                    key={index}
                    className="btn btn-light emoji-button"
                    style={{ fontSize: "1.5rem", margin: "5px" }}
                    onClick={() => handleEmojiClick(emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="text-center">
          <button className="btn btn-primary" onClick={handleCreateAnnouncement} disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Outer Announcement"}
          </button>
        </div>
      </div>
          </div>
          <div className="col-6">
          <UpdateOuterAnnouncement/>
          </div>
        </div>
      </div>
    
      
    </div>
  );
};

export default OuterAnnouncement
