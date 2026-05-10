import { useSortable } from "@dnd-kit/sortable";
import React from "react";
import "./work-canvas.css";
import { useDroppable } from "@dnd-kit/core";
import { VOID_TAGS } from "../utils/voidTags";
import { CSS } from '@dnd-kit/utilities';

/* Recursively render table children without SortableItem div wrappers */
const renderTableChildren = (children, onSelect, tableId) => {
     if (!children || children.length === 0) return null;

     return children.map((child, index) => {
          const { id, tag, content, defaultProps = {}, children: subChildren = [] } = child;

          const clickHandler = (e) => {
               e.stopPropagation();
               onSelect(tableId);
          };

          if (VOID_TAGS.has(tag)) {
               return React.createElement(tag, { ...defaultProps, key: id || index, onClick: clickHandler });
          }

          const childContent = subChildren.length > 0
               ? renderTableChildren(subChildren, onSelect, tableId)
               : content;

          return React.createElement(tag, { ...defaultProps, key: id || index, onClick: clickHandler }, childContent);
     });
};

const SortableItem = ({ ele, isSelected, onSelect, selectedComponentId }) => {
     const { id, tag, content, defaultProps, children = [], rank } = ele;
     const { setNodeRef, attributes, listeners, transform, transition } = useSortable({ id });
     const isVoid = typeof tag === "string" && VOID_TAGS.has(tag);
     const isTable = tag === "table";

     const selectComponent = (e) => {
          e.stopPropagation();
          onSelect(id);
     };

     const { setNodeRef: setDropRef } = useDroppable({
          id: id,
          data: {
               rank,
               type: "component",
          },
          disabled: isVoid
     });

     const style = {
          transform: CSS.Translate.toString(transform),
          transition,
          outline: isSelected ? "2px solid var(--red-300)" : "none",
          position: "relative",
          outlineOffset: "2px"
     };

     /* For table elements, render children natively to preserve table HTML structure */
     if (isTable) {
          const tableWrapperStyle = {
               ...style,
               padding: "10px",
               cursor: "pointer"
          };
          return (
               <div ref={(node) => { setNodeRef(node); setDropRef(node) }} style={tableWrapperStyle} {...attributes} onDoubleClick={selectComponent} {...listeners} className="test-component">
                    {React.createElement(tag, { ...defaultProps, onClick: selectComponent },
                         children?.length > 0 ? renderTableChildren(children, onSelect, id) : content
                    )}
               </div>
          );
     }

     return (
          <div ref={(node) => { setNodeRef(node); setDropRef(node) }} style={style} {...attributes} onDoubleClick={selectComponent} {...listeners} className="test-component">
               {isVoid ? (
                    React.createElement(tag, { ...defaultProps, onClick: selectComponent })
               ) : (
                    React.createElement(tag, { ...defaultProps, onClick: selectComponent }, children?.length > 0 ? children.map((child) => (<SortableItem key={child.id} ele={child} isSelected={child.id === selectedComponentId} selectedComponentId={selectedComponentId} onSelect={onSelect} />)) : content)
               )}
          </div>
     );

};

export default SortableItem;
