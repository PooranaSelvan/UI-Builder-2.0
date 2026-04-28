import React, { useEffect, useState } from "react";
import RenderComponents from "../../components/RenderComponents.jsx";

const ComponentEditorPreview = () => {
  const [components, setComponents] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem("componentEditorPreview");
    if (stored) {
      setComponents(JSON.parse(stored));
    }
  }, []);

  if (components.length === 0) {
    return <div>There are no components to preview!</div>;
  }

  return (
    <div
      className="preview-container"
      style={{ flex: 1, minHeight: "100vh", background: "#f9f9f9" }}
    >
      <RenderComponents>{components}</RenderComponents>
    </div>
  );
};

export default ComponentEditorPreview;
