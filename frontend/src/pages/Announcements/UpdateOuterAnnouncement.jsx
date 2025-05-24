import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useAppContext } from "../../contextApi/context";
import { getOuterAnnouncement, deleteOuterAnnouncement } from "../../Utils/service/apiService";

const UpdateOuterAnnouncement = ({ refreshTrigger }) => {
  const { store } = useAppContext();
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    fetchAnnouncements();
  }, [refreshTrigger]); // 👈 re-run fetch when trigger changes

  const fetchAnnouncements = async () => {
    try {
      const response = await getOuterAnnouncement(store.user);
      setAnnouncements(response.data || []);
    } catch (error) {
      toast.error("Failed to fetch announcements.");
      console.error("Error fetching announcements:", error);
    }
  };

  const handleDelete = async (announceId) => {
  try {
    await deleteOuterAnnouncement(announceId); 
    fetchAnnouncements();
  } catch (error) {
    toast.error("Failed to delete the announcement. Please try again.");
    console.error("Error deleting announcement:", error);
  }
};


  return (
    <div className="container">
      <div className="card shadow-sm">
        <h3 className="mb-0 fw-bold text-center text-uppercase p-3 announcement_header rounded text-white">
          Update Outer Announcement
        </h3>
        <div className="card-body">
          {announcements.length === 0 ? (
            <div className="text-center text-danger fw-bold">
              No Announcements Available.
            </div>
          ) : (
            <div className="row">
              {announcements.map((announcement) => (
                <div key={announcement.announceId} className="col mb-4">
                  <div className="card">
                    <div className="card-body text-center">
                      <h5 className="card-title">
                        {announcement.announcement || "No Title"}
                      </h5>
                      <button
                        className="btn btn-danger mt-2"
                        onClick={() => handleDelete(announcement.announceId)}
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

export default UpdateOuterAnnouncement;
