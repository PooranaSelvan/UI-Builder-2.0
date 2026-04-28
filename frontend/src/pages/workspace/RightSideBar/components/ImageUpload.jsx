import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import "./file-loader.css";

const ImageUpload = ({ selectedComponent, updateComponent, label }) => {
  const fileRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    if (!selectedComponent) return;

    if (selectedComponent.tag === "img") {
      setInputValue(selectedComponent.defaultProps?.src || "");
    } else {
      const bg = selectedComponent.defaultProps?.style?.backgroundImage || "";
      const cleanURL = bg.replace(/^url\(["']?/, "").replace(/["']?\)$/, "");
      setInputValue(cleanURL);
    }
  }, [selectedComponent]);

  const applyImage = (imageURL) => {
    updateComponent(selectedComponent.id, (node) => {
      node.defaultProps ??= {};
      node.defaultProps.style ??= {};

      if (node.tag === "img") {
        node.defaultProps.src = imageURL;
      } else {
        node.defaultProps.style.backgroundImage = `url(${imageURL})`;
        node.defaultProps.style.backgroundSize = "cover";
        node.defaultProps.style.backgroundPosition = "center";
        node.defaultProps.style.backgroundRepeat = "no-repeat";
      }
    });
  };

  const handleFile = async (file) => {
    if (!file) return;

    const cloudinaryData = await uploadImageToCloud(file);
    const imageURL = cloudinaryData?.secure_url;

    if (!imageURL) return;

    setInputValue(imageURL);
    applyImage(imageURL);
  };

  const uploadImageToCloud = async (file) => {
    let formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "sirpam ui builder");

    try {
      setLoading(true);
      let res = await axios.post(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD}/image/upload`,
        formData
      );
      return res.data;
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }

    return null;
  };

  return (
    <div className="background-image">
      <label>{label}</label>

      <div className="image-input">
        <input type="text" placeholder="Enter image URL or upload" value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
          }}
          onBlur={() => {
            const value = inputValue.trim();

            updateComponent(selectedComponent.id, (node) => {
              node.defaultProps ??= {};
              node.defaultProps.style ??= {};

              if (!value) {
                if (node.tag === "img") {
                  delete node.defaultProps.src;
                } else {
                  delete node.defaultProps.style.backgroundImage;
                }
                return;
              }

              if (node.tag === "img") {
                node.defaultProps.src = value;
              } else {
                node.defaultProps.style.backgroundImage = `url(${value})`;
                node.defaultProps.style.backgroundSize = "cover";
                node.defaultProps.style.backgroundPosition = "center";
                node.defaultProps.style.backgroundRepeat = "no-repeat";
              }
            });
          }}
        />

        <button type="button" onClick={() => fileRef.current.click()} disabled={loading} className={`browse-btn ${loading ? "loading" : ""}`}>
          {loading ? (
            <span className="spinner"></span>
          ) : (
            "Browse"
          )}
        </button>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => handleFile(e.target.files[0])}
      />
    </div>
  );
};

export default ImageUpload;