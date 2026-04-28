import { X, FolderCode } from "lucide-react";
import "./Dashboard.css";
import Button from "../../components/Button";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../utils/axios.js";

export default function CreateForm({ isOpen, onClose, title, nameLabel, descriptionLabel, buttonText, createNewProject, createNewPage, projectUrl, user }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [isUrlValid, setIsUrlValid] = useState(false);

  useEffect(() => {
    if (!url) {
      setIsUrlValid(false);
      return;
    }

    let urlRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;

    if (!urlRegex.test(url)) {
      setIsUrlValid(false);
      toast.error(`"${url}" : is not a valid URL!`, {id : "url-valid"});
      return;
    }

    let timer = setTimeout(async () => {
      try {
        const res = await api.get(`/builder/check-url/${user.email.split("@")[0].split(".")[0].toLowerCase()}/${projectUrl.toLowerCase()}/${url}`);
        setIsUrlValid(res.data.status);
      } catch (err) {
        console.log(err);
        console.log(err.response);
        setIsUrlValid(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [url]);

  if (!isOpen) return null;

  const handleCreate = (e) => {
    e.preventDefault();


    if (!name || !description) {
      toast.error("All Fields are Required!", {id : "all-need"});
      return;
    }

    if (description.length < 1 || description.length > 50) {
      toast.error("Description must be greater than 1 & less than 50 characters!");
      return;
    }

    if (createNewPage) {
      if (!url) {
        toast.error("All Fields are Required!");
        return;
      }

      createNewPage(name, description, url);
    }

    if (createNewProject) {
      createNewProject(name, description);
    }

    setName("");
    setDescription("");
    setUrl("");
    setIsUrlValid(false);
  }

  const handleURLChange = async (e) => {
    setUrl(e.target.value);
  }

  return (
    <div className="modal-overlay">
      <div className="modal-box">

        <div className="modal-header">
          <div className="folder-icon folder-color">
            <FolderCode size={28} />
          </div>
          <h2>{title}</h2>
          <X size={20} className="close-icon" onClick={onClose} />
        </div>

        <div className="modal-body">
          <form action="" onSubmit={handleCreate}>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", flexDirection: "column", gap: "10px", marginBottom: "10px" }}>
              <label>{nameLabel}</label>
              <input type="text" placeholder={`Enter ${nameLabel.toLowerCase()}...`} value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", flexDirection: "column", gap: "10px", marginBottom: "10px" }}>
              <label>{descriptionLabel}</label>
              <textarea placeholder="Brief description..." value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>

            {createNewPage && (
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", flexDirection: "column", gap: "10px", marginBottom: "10px" }}>
                <label>URL</label>
                <div>
                  <input type="text" disabled value={`/publish/${user.email.split("@")[0].split(".")[0].toLowerCase()}/${projectUrl && projectUrl.toLowerCase()}`} style={{ border: "none" }} />
                  <input placeholder="url" value={url} onChange={(e) => handleURLChange(e)} style={{ border: isUrlValid ? "2px solid green" : "2px solid var(--primary)" }} />
                </div>
              </div>
            )}
          </form>
        </div>

        <div className="modal-footer">
          {!createNewPage && (<Button className="primary-btn" onClick={handleCreate}>
            {buttonText}
          </Button>)}
          {createNewPage && (
            <Button className="primary-btn" onClick={handleCreate} disabled={!isUrlValid}>
              {buttonText}
            </Button>
          )}
        </div>

      </div>
    </div>
  );
}
