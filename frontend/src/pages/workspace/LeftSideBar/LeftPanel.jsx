import "./LeftPanel.css";
import ComponentItem from "./ComponentItem";
import { Search, Plus } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { X, ChevronRight, ChevronDown, BotMessageSquare } from "lucide-react";
import { useCustomComponents } from "../../../context/CustomComponentsContext";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";


export default function LeftPanel({ components, onEditSavedComponent, onRenameComponent, onChangeIcon, onDeleteComponent, canvasElements, onDeleteCanvasComponent, onSelectComponent, selectedComponentId, setShowAiModel, setGenerated, aiData }) {
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [jsonInput, setJsonInput] = useState("");
  const location = useLocation();
  const { addCustomComponent } = useCustomComponents();
  const isComponentEditor = location.pathname === "/component-editor";
  const [widthPercent, setWidthPercent] = useState(16);
  const isResizing = useRef(false);
  const navigate = useNavigate();
  const [openSections, setOpenSections] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("components");
  const [expandedLayers, setExpandedLayers] = useState({});

  useEffect(() => {
    if (components.length > 0) {
      setOpenSections(prev => {
        const newSections = { ...prev };
        components.forEach(section => {
          if (!(section.title in newSections)) {
            newSections[section.title] = true;
          }
        });
        return newSections;
      });
    }
  }, [components]);


  useEffect(() => {
    async function addAiData() {
      if (!aiData) {
        return;
      }

      let builtJSON = {
        ...aiData,
        id: `${aiData.label}-${Date.now()}`,
        iconName: aiData.icon || "Square",
        children: Array.isArray(aiData.children) ? aiData.children : [],
        defaultProps: aiData.defaultProps || {},
      };


      await addCustomComponent({
        componentName: builtJSON.label,
        icon: builtJSON.icon || "Square",
        data: JSON.stringify([builtJSON])
      });
    }

    addAiData();
  }, [aiData]);


  const toggleSection = (title) => {
    setOpenSections((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  /* ---------------- Resize Logic ---------------- */

  const handlePointerDown = (e) => {
    isResizing.current = true;
    e.target.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isResizing.current) return;
    const screenWidth = window.innerWidth;
    let newPercent = (e.clientX / screenWidth) * 100;
    newPercent = Math.min(16, Math.max(12, newPercent));
    setWidthPercent(newPercent);
  };

  const handlePointerUp = (e) => {
    isResizing.current = false;
    e.target.releasePointerCapture(e.pointerId);
  };


  /* ---------------- JSON Save ---------------- */
  const handleSaveJsonComponent = async () => {
    try {
      const raw = JSON.parse(jsonInput);

      if (!raw.label || !raw.tag || raw.rank === undefined) {
        toast.error("Required fields: label, tag, rank", { id: "all-need" });
        return;
      }

      if (typeof raw.rank !== "number") {
        toast.error("rank must be a number", { id: "all-need" });
        return;
      }

      const parsed = {
        ...raw,
        id: `json-${Date.now()}`,
        iconName: raw.icon || "Square",
        children: Array.isArray(raw.children) ? raw.children : [],
        defaultProps: raw.defaultProps || {},
      };
      await addCustomComponent({
        componentName: parsed.label,
        icon: raw.icon || "Square",
        data: JSON.stringify([parsed]),
      });

      toast.success("Component added successfully!");
      setJsonInput("");
      setShowJsonModal(false);

    } catch (err) {
      toast.error("Invalid JSON format!", { id: "all-need" });
    }
  };

  /* ---------------- Search Components ---------------- */
  const filteredSections = components
    .map((section) => {
      const filteredItems = section.items.filter((item) =>
        item.label.toLowerCase().includes(searchTerm.toLowerCase())
      );

      return {
        ...section,
        items: filteredItems,
      };
    })
    .filter((section) => section.items.length > 0);
  const finalSections = filteredSections;

  // -------------------- Layers Logic --------------------


  const toggleLayerExpand = (id) => {
    setExpandedLayers(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  function SortableLayer({ item, level }) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition
    } = useSortable({ id: item.id });

    const hasChildren = item.children?.length > 0;
    const isExpanded = expandedLayers[item.id] || false;
    const isSelected = selectedComponentId === item.id;

    const style = {
      transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : "",
      transition,
      paddingLeft: 16 + level * 16,
    };

    return (
      <div>
        <div ref={setNodeRef} style={style} className={`layer-item ${isSelected ? "selected" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            onSelectComponent?.(item.id);
          }}
        >

          <div className="layer-drag" {...attributes} {...listeners}>::</div>

          {hasChildren ? (isExpanded ? (<ChevronDown size={14}
            onClick={(e) => {
              e.stopPropagation();
              toggleLayerExpand(item.id);
            }} />
          ) : (
            <ChevronRight size={14}
              onClick={(e) => {
                e.stopPropagation();
                toggleLayerExpand(item.id);
              }} />
          )) : (
            <div style={{ width: 14 }} />
          )}


          {/* Name */}
          <span className="layer-label">
            {item.label || item.type}
          </span>

          {/* Visibility */}
          <X
            size={14}
            className="layer-delete"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteCanvasComponent?.(item.id);
            }}
          />

        </div>

        {/* Render children */}
        {hasChildren && isExpanded && (
          <SortableContext
            items={item.children.map(child => child.id)}
            strategy={verticalListSortingStrategy}>
            {item.children.map(child => (
              <SortableLayer
                key={child.id}
                item={child}
                level={level + 1} />
            ))}
          </SortableContext>
        )}
      </div>
    );
  }


  return (
    <>
      <aside className="left-panel" style={{ width: `${widthPercent}%` }}>
        {/* RESIZE HANDLE */}
        <div
          className="resize-handle"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        />

        <div className="left-panel-scroll" id="left-panel-tour">
          {/* TABS */}
          <div className="panel-tabs">
            <button className={`tab ${activeTab === 'components' ? 'active' : ''}`} onClick={() => setActiveTab('components')}>Components</button>
            <button className={`tab ${activeTab === 'layers' ? 'active' : ''}`} onClick={() => setActiveTab('layers')}>Layers</button>
          </div>
          <br />

          {/* SEARCH */}
          {activeTab === 'components' && (
            <div className="search-row">
              <div className="search-box">
                <Search size={16} />
                <input
                  placeholder="Search components..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {!isComponentEditor && (
                <button
                  className="add-near-search-btn"
                  onClick={() => navigate("/component-editor")}
                  title="Open Component Editor"
                >
                  <Plus size={18} />
                </button>
              )}
            </div>
          )}

          {/* CONTENT: Components or Layers */}
          {activeTab === 'components' ? (
            finalSections.map((section) => (
              <div key={section.title} className="panel-section">
                <div
                  className="section-header"
                  onClick={() => toggleSection(section.title)}
                >
                  <ChevronRight
                    size={16}
                    className={`chevron ${openSections[section.title] || searchTerm ? "open" : ""}`}
                  />
                  <span>{section.title}</span>
                </div>

                {(searchTerm || openSections[section.title]) && section.items.length > 0 && (
                  <div className="grid">
                    {section.items.map((item, index) => {
                      const uniqueId = item.id || item._id || `${section.title}-${index}`;

                      const draggableItem = {
                        ...item,
                        id: uniqueId,
                        children: item.children || [],
                        tag: item.tag || "div",
                        rank: item.rank ?? 1,
                        defaultProps: item.defaultProps || {},
                        isRootCustom: item.isRootCustom || false,
                      };

                      return (
                        <ComponentItem
                          key={uniqueId}
                          item={draggableItem}
                          onEditSavedComponent={onEditSavedComponent}
                          onRenameComponent={onRenameComponent}
                          onChangeIcon={onChangeIcon}
                          onDeleteComponent={onDeleteComponent} />
                      );
                    })}
                  </div>
                )}
              </div>
            ))
          ) : (
            <SortableContext
              items={canvasElements.map(item => item.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="layers-container">
                {canvasElements.map(item => (
                  <SortableLayer
                    key={item.id}
                    item={item}
                    level={0}
                  />
                ))}
              </div>
            </SortableContext>

          )}

          {searchTerm && finalSections.length === 0 && (
            <p className="no-results">No components found</p>
          )}

          {/* AI */}
          {isComponentEditor && activeTab === "components" && (
            <button className="json-ai" onClick={() => { setShowAiModel(true); setGenerated(false); }}>
              <BotMessageSquare />
              Create with AI
            </button>
          )}

          {/* ADD JSON BUTTON */}
          {isComponentEditor && activeTab === 'components' && (
            <button
              className="add-json-component-btn"
              id="custom-json-tour"
              onClick={() => setShowJsonModal(true)}
            >
              <Plus size={18} /> Add JSON Component
            </button>
          )}
        </div>

        {/* JSON MODAL */}
        {showJsonModal && (
          <div className="json-component-modal">
            <div className="json-modal-box">
              <div className="modal-header">
                <h4>Add Component via JSON</h4>
                <X size={18}
                  onClick={() => {
                    setJsonInput("");
                    setShowJsonModal(false);
                  }} />
              </div>

              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}

                className="json-textarea"
                placeholder={`Sample JSON:
{
  "id": "my-component",
  "label": "My Component",
  "icon": "Square",
  "tag": "div",
  "rank": 2,
  "defaultProps": { "className": "my-component test-component" },
  "children": []
}`} />
              <button className="json-save-btn" onClick={handleSaveJsonComponent}>
                Save Component
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
