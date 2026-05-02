import React, { useEffect, useRef, useState } from 'react';
import './profile.css'
import { User, TriangleAlert, Camera, Trash2, X } from 'lucide-react';
import Button from '../../components/Button';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Loading from "../../components/Loading";
import api from "../../utils/axios.js";
import axios from "axios";

const Profile = ({ setIsAuthenticated }) => {
  const [user, setUser] = useState(null);
  let navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    async function fetchUser(params) {
      setLoading(true);
      try {
        let res = await api.get(`/checkme`);

        if (res.data?.user) {
          setUser(res.data.user);
        }
        setLoading(false);
      } catch (error) {
        console.log(error);

        if (error.response?.status === 401) {
          setIsAuthenticated(false);
          navigate("/login");
        } else {
          toast.error("Something Went Wrong! Please Try again Later!");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  // Upload profile photo to Cloudinary and save URL to backend
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setUploading(true);
    try {
      // Upload to Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "sirpam ui builder");

      const cloudRes = await axios.post(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD}/image/upload`,
        formData
      );

      const photoUrl = cloudRes.data?.secure_url;
      if (!photoUrl) {
        toast.error("Upload failed. Try again.");
        return;
      }

      // Save the Cloudinary URL to backend
      await api.put("/users/update-photo", { profilePhoto: photoUrl });

      // Update local state
      setUser((prev) => ({ ...prev, profilePhoto: photoUrl }));
      toast.success("Profile photo updated!");
    } catch (err) {
      console.log(err);
      toast.error("Failed to update profile photo");
    } finally {
      setUploading(false);
    }
  };

  // Remove profile photo
  const confirmRemovePhoto = async () => {
    setShowRemoveConfirm(false);
    try {
      await api.delete("/users/remove-photo");
      setUser((prev) => ({ ...prev, profilePhoto: null }));
      toast.success("Profile photo removed!");
    } catch (err) {
      console.log(err);
      toast.error("Failed to remove profile photo");
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure want to delete your account?")) {
      setLoading(true);
      try {
        let res = await api.delete(`/users/del`, {
          data: {
            userId: user?.userId
          }
        });

        toast.success(res.data.message);
        setIsAuthenticated(false);
        navigate("/login");
      } catch (error) {
        console.log(error);
        console.log(error.response);
        toast.error("Something Went Wrong! Please Try again Later!");
      } finally {
        setLoading(false);
      }
    }
  }

  if (loading) {
    return (
      <div className="profile-container">
        <Loading />
      </div>
    );
  }

  return (
    <>
      {/* Custom Confirmation Modal */}
      {showRemoveConfirm && (
        <div className="confirm-overlay" onClick={() => setShowRemoveConfirm(false)}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <button className="confirm-close" onClick={() => setShowRemoveConfirm(false)}>
              <X size={18} />
            </button>
            <div className="confirm-icon">
              <Trash2 size={24} />
            </div>
            <h3 className="confirm-title">Are you sure want to Remove Profile Photo?</h3>
            <p className="confirm-desc">Your profile will show your name initial instead.</p>
            <div className="confirm-actions">
              <button className="confirm-btn confirm-btn-cancel" onClick={() => setShowRemoveConfirm(false)}>Cancel</button>
              <button className="confirm-btn confirm-btn-remove" onClick={confirmRemovePhoto}>Remove</button>
            </div>
          </div>
        </div>
      )}

      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-image">
            <div className="profile-avatar-wrapper" onClick={() => fileInputRef.current?.click()}>
              {user?.profilePhoto ? (
                <img src={user.profilePhoto} alt={user.name} className="profile-avatar-photo" />
              ) : (
                <div className="profile-avatar-initials">
                  <h1>{user?.name.split(" ").length === 2 ? user?.name.split(" ")[0][0] + user?.name.split(" ")[1][0] : user?.name.split(" ")[0][0]}</h1>
                </div>
              )}
              <div className="profile-avatar-overlay">
                <Camera size={20} color="white" />
              </div>
              {uploading && <div className="profile-avatar-uploading">Uploading...</div>}
            </div>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              hidden
              onChange={handlePhotoUpload}
            />
            <h3>{user?.name || "NaN"}</h3>
            <p className="profile-email-subtitle">{user?.email}</p>
            <div className="profile-photo-actions">
              <button className="profile-photo-btn" onClick={() => fileInputRef.current?.click()}>
                <Camera size={14} />
                {user?.profilePhoto ? "Change Photo" : "Upload Photo"}
              </button>
              {user?.profilePhoto && (
                <button className="profile-photo-btn profile-photo-remove-btn" onClick={() => setShowRemoveConfirm(true)}>
                  <Trash2 size={14} />
                  Remove
                </button>
              )}
            </div>
          </div>
          <div className="profile-details">
            <h2>
              <User size={18} />
              Personal Details
            </h2>
            <div className="profile-form">
              <label htmlFor="">Name</label>
              <input type="text" readOnly value={user?.name || "NaN"} />
              <label htmlFor="">Email</label>
              <div className='mail'>
                <input id='personal-mail' type="email" readOnly value={user?.email || "NaN"} />
              </div>
              <div className='hr'></div>
              <div className="delete-account">
                <div className="delete-account-wrapper">
                  <span className='alert-icon' ><TriangleAlert size={18} /></span>
                  <div className="delete-description">
                    <span>Danger Zone</span>
                    <p>Permanently delete your account and all projects.</p>
                  </div>
                </div>
                <Button className='profile-delete-btn' onClick={handleDeleteAccount}>Delete Account</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Profile