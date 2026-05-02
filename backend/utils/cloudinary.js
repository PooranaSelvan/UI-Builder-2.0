/**
 * Uploads an image to Cloudinary and returns a public URL.
 *
 * Cloudinary is a cloud service that hosts images and gives you
 * a permanent, public URL (e.g. "https://res.cloudinary.com/...").
 *
 * This function accepts either:
 *   - A base64 data URI (e.g. "data:image/png;base64,iVBOR...")
 *   - A public image URL (e.g. "https://example.com/photo.jpg")
 *
 * It uses an "unsigned upload preset" so no API secret is needed.
 *
 * @param {string} imageData - base64 data URI or image URL to upload
 * @returns {Promise<string|null>} Cloudinary public URL, or null if upload failed
 */
export async function uploadToCloudinary(imageData) {
     try {
          // Prepare the upload data as a form (like submitting a web form)
          const formData = new FormData();
          formData.append("file", imageData);                              // The image to upload
          formData.append("upload_preset", process.env.CLOUDINARY_UPLOAD_PRESET); // Upload preset name (configured in Cloudinary dashboard)

          // Send the image to Cloudinary's upload API
          const response = await fetch(
               `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD}/image/upload`,
               { method: "POST", body: formData }
          );

          // Parse Cloudinary's response
          const result = await response.json();

          // If the upload failed, return null
          if (!response.ok) return null;

          // Return the public URL of the uploaded image
          // This URL can be used directly in <img src="...">
          return result.secure_url || null;

     } catch (err) {
          return null;
     }
}
