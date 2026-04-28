import { X, FolderCode } from "lucide-react";
import "../Dashboard.css";
import Button from "../../../components/Button.jsx";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../../utils/axios.js";


const UpdateForm = ({ isOpen, onClose, pageData, onRename }) => {
     const [name, setName] = useState("");
     const [description, setDescription] = useState("");
     const [url, setUrl] = useState("");
     const [isUrlValid, setIsUrlValid] = useState(false);

     useEffect(() => {
          // console.log(pageData.url.split("/")[2]);
          if (pageData) {
               // console.log(pageData);
               setName(pageData.name || "");
               setDescription(pageData.description || "");
               setUrl(pageData.url.split("/")[2] || "");
          }
     }, [pageData]);


     useEffect(() => {
          if (!url) {
               setIsUrlValid(false);
               return;
          }

          let urlRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;

          if (!urlRegex.test(url)) {
               setIsUrlValid(false);
               toast.error(`"${url}" : is not a valid URL!`);
               return;
          }

          let timer = setTimeout(async () => {
               try {
                    const res = await api.get(`/builder/check-url/${pageData.url.split("/")[0]}/${pageData.url.split("/")[1]}/${url}`);
                    setIsUrlValid(res.data.status);
               } catch (err) {
                    console.log(err);
                    console.log(err.response);
                    setIsUrlValid(false);
               }
          }, 500);

          return () => clearTimeout(timer);
     }, [url]);


     const handleUpdate = async (e) => {
          e.preventDefault();

          // console.log(name, description, url);

          if (!name || !description || !url) {
               toast.error("All fields are required!");
               return;
          }

          if (!isUrlValid) {
               toast.error("Invalid URL!");
               return;
          }

          try {
               onClose();
               await onRename(name, description, url);
          } catch (err) {
               console.log(err);
               console.log(err.response);
          }
     }


     if (!isOpen) return null;


     return (
          <div className="modal-overlay">
               <div className="modal-box">

                    <div className="modal-header">
                         <div className="folder-icon folder-color">
                              <FolderCode size={28} />
                         </div>
                         <h2>Update Page</h2>
                         <X size={20} className="close-icon" onClick={onClose} />
                    </div>

                    <div className="modal-body">
                         <form action="" onSubmit={handleUpdate}>
                              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", flexDirection: "column", gap: "10px", marginBottom: "10px" }}>
                                   <label>Page Name</label>
                                   <input type="text" placeholder={`Enter page Name...`} value={name} onChange={(e) => setName(e.target.value)} />
                              </div>

                              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", flexDirection: "column", gap: "10px", marginBottom: "10px" }}>
                                   <label>Page Description</label>
                                   <textarea placeholder="Brief description..." value={description} onChange={(e) => setDescription(e.target.value)} />
                              </div>

                              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", flexDirection: "column", gap: "10px", marginBottom: "10px" }}>
                                   <label>URL</label>
                                   <div>
                                        <input type="text" disabled value={`/publish/${pageData.url.split("/")[0]}/${pageData.url.split("/")[1]}`} style={{ border: "none" }} />
                                        <input placeholder="url" value={url} onChange={(e) => setUrl(e.target.value)} style={{ border: isUrlValid ? "2px solid green" : "2px solid var(--primary)" }} />
                                   </div>
                              </div>
                         </form>
                    </div>

                    <div className="modal-footer">
                         <Button className="primary-btn" onClick={handleUpdate} disabled={!isUrlValid}>
                              Update Page
                         </Button>
                    </div>

               </div>
          </div>
     );
}

export default UpdateForm;