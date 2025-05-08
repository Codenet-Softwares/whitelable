import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
// import "bootstrap/dist/css/bootstrap.min.css";
import { getInnerAnnouncement,deleteInnerAnnouncement } from "../../Utils/service/apiService";
import { useAppContext } from "../../contextApi/context";
import "./Announcement.css"

const UpdateInnerAnnouncement = () => {
  const { store } = useAppContext();
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    // auth.showLoader();
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await getInnerAnnouncement(store.user);  
      setAnnouncements(response.data.data || []);  
    } catch (error) {
      toast.error("Failed to fetch inner announcements.");
      console.error("Error fetching inner announcements:", error);
    }finally {
      // auth.hideLoader();
    }
  };

  const handleDelete = async (announceId) => {
    // auth.showLoader();
    try {
      await deleteInnerAnnouncement(store.user, announceId);  
      toast.success("Inner Announcement deleted successfully!");
      fetchAnnouncements(); 
    } catch (error) {
      toast.error("Failed to delete the inner announcement. Please try again.");
      console.error("Error deleting inner announcement:", error);
    }finally {
      // auth.hideLoader();
    }
  };

  return (
    <div className="container">
      <div className="card shadow-sm">
  
          <h3 className="mb-0 fw-bold text-center text-uppercase announcement_header text-white p-3 rounded">Update Inner Announcement</h3>
   
        <div className="card-body">
          {announcements.length === 0 ? (
            <div className="text-center text-danger fw-bold">No Inner Announcements Available.</div>
          ) : (
            <div className="row">
              {announcements.map((announcement) => (
                <div key={announcement.announceId} className="col mb-4">
                  <div className="card">
                    <div className="card-body text-center">
                      <h5 className="card-title">{announcement.announcement || "No Title"}</h5> 
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
}

export default UpdateInnerAnnouncement
