import React, { useEffect, useRef } from "react";
import {
  Folder,
  MoreVertical,
  ChevronRight,
  Pencil,
  Trash2
} from "lucide-react";
import Button from "../../components/Button";

const FolderCard = ({
  app,
  index,
  activeMenu,
  setActiveMenu,
  setSelectedApp,
  setDeleteInfo,
  setShowDelete,
  onTemplateClick 
}) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  return (
    <div
      className="folder-card"
      onClick={() => {
        if (app.isTemplateMode && onTemplateClick) {
          onTemplateClick(app);
        } else {
          setSelectedApp(app);
        }
      }}
    >
      <div className="card-top">
        <div className="folder-icon folder-color">
          <Folder size={26} />
        </div>

        <div
          className="menu-wrapper"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreVertical
            size={18}
            className="three-dots"
            onClick={() =>
              setActiveMenu(activeMenu === index ? null : index)
            }
          />

          {activeMenu === index && (
            <div className="dropdown-menu" ref={menuRef}>
              <div style={{ width: "100%", backgroundColor: "transparent" }} onClick={(e) => { e.stopPropagation(); }}>
                <Button className="menu-item" style={{ width: "100%", backgroundColor: "transparent" }}>
                  <Pencil size={16} />
                  Rename
                </Button>
              </div>
              <div className="menu-divider" />
              <Button className="menu-item delete" style={{ width: "100%", backgroundColor: "transparent" }} onClick={(e) => { e.stopPropagation(); setDeleteInfo({ type: "project", id: app.id }); setShowDelete(true); }}>
                <Trash2 size={16} />
                Delete
              </Button>
            </div>
          )}
        </div>
      </div>

      <h3>{app.name}</h3>
      <p className="desc">{app.desc}</p>

      <div className="card-footer">
        <span>{app.pages.length} pages</span>
        <ChevronRight size={22} />
      </div>
    </div>
  );
};

export default FolderCard;
