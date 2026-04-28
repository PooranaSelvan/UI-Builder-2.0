import React from "react";
import "./work-canvas.css";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import SortableItem from "./SortableItem";

const Canvas = ({ components, zoom, selectedComponentId, onSelectComponent, clearComponentSelection }) => {
  const { setNodeRef, isOver } = useDroppable({ id: "canvas" });

  const unSelectComponent = (e) => {
    if (e.target === e.currentTarget || e.target.classList.contains('canvas-drop-zone')) {
      clearComponentSelection();
    }
  };


  return (
    <div className="work-canvas-wrapper" onClick={unSelectComponent} id="canvas-tour">
      <div ref={setNodeRef} className="canvas-drop-zone" style={{ flex: 1, transform: `scale(${zoom})`, transformOrigin: "top left", transition: "transform 0.3s ease-in-out", padding: "20px", background: isOver ? "#eaf7ff" : "white", border: isOver ? "2px dashed black" : "", marginTop: "25px" }}>
        {components.length === 0 && (
          <p style={{ color: "#999", textAlign: "center" }}>Drag components here</p>
        )}

        <SortableContext items={components.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          {components.map((ele) => (
            <SortableItem key={ele.id} ele={ele} isSelected={selectedComponentId === ele.id} selectedComponentId={selectedComponentId} onSelect={onSelectComponent} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
};

export default Canvas;