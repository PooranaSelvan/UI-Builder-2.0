import { useState, useContext, useEffect } from "react";
import { DndContext, PointerSensor, useSensor, useSensors, DragOverlay } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { v4 as uuidv4 } from "uuid";
import toast from "react-hot-toast";
import "./ComponentEditor.css";
import LeftPanel from "../workspace/LeftSideBar/LeftPanel";
import Canvas from "../workspace/Canvas/Canvas";
import RightSideBar from "../workspace/RightSideBar/RightSideBar";
import IconPicker from "./IconPicker";
import { Search, X, Eye, Trash2, AlertCircle } from "lucide-react";
import { BasicComponents } from "../workspace/utils/basicComponentsData";
import Button from "../../components/Button.jsx";
import { CustomComponentsContext } from "../../context/CustomComponentsContext";
import api from "../../utils/axios.js";
import { useNavigate } from "react-router-dom";
import PromptModal from "./components/PromptModal.jsx";
import axios from "axios";


const ComponentEditor = () => {
  /* ---------------- State ---------------- */
  const [components, setComponents] = useState([]);
  const [selectedComponentId, setSelectedComponentId] = useState(null);
  const { customComponents, addCustomComponent, deleteCustomComponent, updateCustomComponent } = useContext(CustomComponentsContext);
  const [customIconName, setCustomIconName] = useState("Square");
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [customComponentName, setCustomComponentName] = useState("");
  const [showNameInput, setShowNameInput] = useState(false);
  const [iconSearch, setIconSearch] = useState("");
  const [editingSavedComponentId, setEditingSavedComponentId] = useState(null);
  const [showAiModel, setShowAiModel] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [generatedComponent, setGeneratedComponent] = useState(null);
  let navigate = useNavigate();


  useEffect(() => {
    async function getUser() {
      try {
        await api.get("/checkme");
      } catch (error) {
        console.log(error.response);

        if (error.response?.status === 401 || error.response?.status === 404) {
          navigate("/login", { replace: true });
        }
      }
    }

    getUser();
  }, []);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [editingComponent, setEditingComponent] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);


  /* ---------------- Helpers ---------------- */

  const findComponentById = (items, id) => {
    for (let item of items) {
      if (item.id === id) return item;
      if (item.children?.length) {
        const found = findComponentById(item.children, id);
        if (found) return found;
      }
    }
    return null;
  };


  const isChildComponent = (items, id) => {
    for (let item of items) {
      if (item.children?.some(child => child.id === id)) return true;
      if (item.children?.length) {
        if (isChildComponent(item.children, id)) return true;
      }
    }
    return false;
  };

  const addChildToComponent = (items, parentId, newChild) =>
    items.map(item => {
      if (item.id === parentId) {
        return {
          ...item,
          children: [...(item.children || []), newChild],
        };
      }
      if (item.children?.length) {
        return {
          ...item,
          children: addChildToComponent(item.children, parentId, newChild),
        };
      }
      return item;
    });

  const removeChild = (items, childId) => {
    let removedChild = null;
    const cloned = cloneComponents(items);
    const stack = [cloned];

    while (stack.length) {
      const arr = stack.pop();
      const index = arr.findIndex(i => i.id === childId);

      if (index !== -1) {
        removedChild = arr[index];
        arr.splice(index, 1);
        break;
      }

      arr.forEach(i => i.children?.length && stack.push(i.children));
    }

    return { newTree: cloned, removedChild };
  };
  const cloneComponentWithNewIds = (component) => {
    const baseId = component.id || "custom";

    return {
      ...component,
      id: `${baseId}-${uuidv4()}`,
      children: component.children
        ? component.children.map(child =>
          cloneComponentWithNewIds(child)
        )
        : [],
    };
  };


  const startEditingSavedComponent = (savedComponent) => {
    setEditingSavedComponentId(savedComponent.originalId);
    setCustomComponentName(savedComponent.label);
    setCustomIconName(savedComponent.iconName || "Square");

    const cloned = cloneComponentWithNewIds(savedComponent);
    setComponents([cloned]);
    setSelectedComponentId(cloned.id);
    setHasUnsavedChanges(false);
  }

  /* ---------------- Drag Logic ---------------- */

  const toastErrorStyle = {
    style: {
      borderRadius: "10px",
      background: "var(--primary)",
      color: "white",
    },
  };


  const handleDragEnd = ({ active, over }) => {
    setSelectedComponentId(null);
    if (!over || active.id === over.id) return;

    const isFromSidebar = !!active.data.current?.component;
    const isChild = isChildComponent(components, active.id);
    const isOverChild = isChildComponent(components, over.id);

    /* Sidebar to Canvas */
    if (isFromSidebar && over.id === "canvas") {
      const componentData = active.data.current.component;

      if (componentData.rank === 4) {
        toast.error("Basic elements must be inside a layout", { ...toastErrorStyle, id: "inside-layout" });
        return;
      }

      const clonedComponent = cloneComponentWithNewIds({
        ...componentData,
        isRootCustom: componentData.isRootCustom || false,
        originalId: componentData.id,
        defaultProps: { ...componentData.defaultProps },
        label: componentData.label,
        tag: componentData.tag,
        iconName: componentData.iconName,
      });

      setComponents(prev => {
        return [...prev, clonedComponent];
      });

      setSelectedComponentId(clonedComponent.id);

      if (componentData.isRootCustom) {
        setEditingSavedComponentId(componentData.originalId || componentData.id);
      }
      setHasUnsavedChanges(true);
      return;
    }


    if (!isFromSidebar && isChild && over.id === "canvas") {
      const componentData = findComponentById(components, active.id);
      if (!componentData) return;

      if (componentData.rank === 4) {
        toast.error("Basic elements must be inside a container", { ...toastErrorStyle, id: "inside-layout" });
        return;
      }

      setComponents(prev => {
        const res = removeChild(prev, active.id);
        setHasUnsavedChanges(true);
        return [...res.newTree, res.removedChild];
      });

      return;
    }


    /* Sidebar to Child */
    if (isFromSidebar && over.id !== "canvas") {
      const componentData = active.data.current.component;

      if (
        over.data.current?.rank &&
        componentData.rank < over.data.current.rank
      ) {
        toast.error("You cannot place this component inside a smaller component", { ...toastErrorStyle, id: "inside-layout" });
        return;
      }

      const newChild = {
        ...componentData,
        id: `${componentData.id}-${uuidv4()}`,
        children: [],
      };


      setComponents(prev => {
        setHasUnsavedChanges(true);
        return addChildToComponent(prev, over.id, newChild);
      });
      return;
    }

    /* Root → Root Reorder */
    if (!isFromSidebar && !isChild && !isOverChild && over.id !== "canvas") {
      const activeComponent = findComponentById(components, active.id);
      if (activeComponent?.rank === 4) {
        toast.error("Basic elements must stay inside a container", { ...toastErrorStyle, id: "inside-layout" });
        return;
      }
      setComponents(prev => {
        const oldIndex = prev.findIndex(i => i.id === active.id);
        const newIndex = prev.findIndex(i => i.id === over.id);

        if (oldIndex === -1 || newIndex === -1) return prev;

        setHasUnsavedChanges(true);
        return arrayMove(prev, oldIndex, newIndex);
      });
      return;
    }

    /* Move child */
    if (!isFromSidebar && over.id !== "canvas") {
      const componentData = findComponentById(components, active.id);
      if (!componentData) return;

      if (
        over.data.current?.rank &&
        componentData.rank < over.data.current.rank
      ) {
        toast.error("You cannot place this component inside a smaller component", { ...toastErrorStyle, id: "inside-layout" });
        return;
      }


      setComponents(prev => {
        let updatedTree;
        let movingItem = componentData;

        if (isChild) {
          const res = removeChild(prev, active.id);
          updatedTree = res.newTree;
          movingItem = res.removedChild;
        } else {
          updatedTree = prev.filter(i => i.id !== active.id);
        }

        const newTree = addChildToComponent(updatedTree, over.id, movingItem);
        setHasUnsavedChanges(true);
        return newTree;
      });
      return;
    }

    /* Sort top-level */
    if (!isChild) {
      setComponents(prev => {
        const oldIndex = prev.findIndex(i => i.id === active.id);
        const newIndex = prev.findIndex(i => i.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return prev;
        setHasUnsavedChanges(true);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  //Delete
  const deleteComponent = () => {
    if (!selectedComponentId) return;
    setDeleteTargetId(selectedComponentId);
  };
  const cancelDelete = () => {
    setDeleteTargetId(null);
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;

    try {
      const isCustomComponent = customComponents.some(
        comp => comp._id === deleteTargetId
      );

      if (isCustomComponent) {
        await deleteCustomComponent(deleteTargetId);

        if (editingSavedComponentId === deleteTargetId) {
          setComponents([]);
          setEditingSavedComponentId(null);
        }

        toast.success("Component deleted!", { id: "confirm-delete" });
      } else {
        const cloned = cloneComponents(components);

        const remove = (items) => {
          const index = items.findIndex(i => i.id === deleteTargetId);

          if (index !== -1) {
            items.splice(index, 1);
            return true;
          }

          return items.some(item =>
            item.children && remove(item.children)
          );
        };

        remove(cloned);

        setComponents(cloned);
        setSelectedComponentId(null);
      }

    } catch (err) {
      toast.error("Delete failed", { id: "confirm-delete-err" });
    }

    setDeleteTargetId(null);
  };


  //clear components
  const clearComponentSelection = () => {
    setSelectedComponentId(null);
  };


  //cloning components
  const cloneComponents = (obj) => {
    if (obj === null || typeof obj !== "object") {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(cloneComponents);
    }

    const clonedObj = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        clonedObj[key] = cloneComponents(obj[key]);
      }
    }
    return clonedObj;
  };


  //for update component
  const updateComponent = (id, updater) => {
    setComponents(prev => {
      const cloned = cloneComponents(prev);
      const stack = [...cloned];
      while (stack.length) {
        const node = stack.pop();
        if (node.id === id) {
          updater(node);
          setHasUnsavedChanges(true);
          break;
        }
        if (node.children?.length) {
          stack.push(...node.children);
        }
      }
      return cloned;
    });
  };



  //save component as in the canvas
  const saveCanvasAsComponent = async () => {
    if (!components.length) {
      toast.error("Canvas is empty", { id: "empty-canvas" });
      return;
    }

    const structureOnlyPayload = {
      data: JSON.stringify(deepCloneWithoutIds(components)),
    };

    try {
      if (editingSavedComponentId) {
        await updateCustomComponent(editingSavedComponentId, structureOnlyPayload);

        toast.success("Component Updated Successfully!", { id: "update-custom" });
        setHasUnsavedChanges(false);
        setEditingSavedComponentId(null);
        setComponents([]);
        setSelectedComponentId(null);
        return;
      }
      setCustomComponentName("");
      setCustomIconName("Square");
      setShowNameInput(true);

    } catch (error) {
      toast.error("Failed to save component", { id: "failed-save" });
    }
  };


  const selectedComponent = selectedComponentId ? findComponentById(components, selectedComponentId) : null;


  //combining components to the left panel
  const combinedComponents = [
    ...BasicComponents,
    ...(customComponents.length
      ? [
        {
          title: "Custom Components",
          type: "grid",
          items: customComponents.map((comp) => {
            let parsedData = [];

            try {
              parsedData =
                typeof comp.data === "string"
                  ? JSON.parse(comp.data)
                  : comp.data || [];
            } catch {
              parsedData = [];
            }

            return {
              id: `custom-${comp._id}`,
              originalId: comp._id,
              label: comp.componentName,
              iconName: comp.icon || "Square",
              isRootCustom: true,
              children: parsedData,
              rank: 1,
              defaultProps: {},
              tag: "div",
            };
          }),
        },
      ]
      : []),
  ];
  const handleNameSubmit = async () => {
    if (!customComponentName.trim()) return;
    setShowNameInput(false);
    if (editingComponent) {
      try {
        await updateCustomComponent(editingComponent.originalId, {
          componentName: customComponentName,
          icon: editingComponent.iconName || "Square",
          data: JSON.stringify(editingComponent.children || []),
        });

        toast.success("Component renamed!");
        setHasUnsavedChanges(true);
        const updatedComponents = customComponents.map(comp =>
          comp._id === editingComponent.originalId
            ? { ...comp, componentName: customComponentName }
            : comp
        );
        setEditingComponent(null);
      } catch (err) {
        toast.error("Rename failed", { id: "rename-failed" });
      }
    } else {
      setShowIconPicker(true);
    }
  };



  const deepCloneWithoutIds = (items) =>
    items.map(({ id, ...rest }) => ({
      ...rest,
      children: rest.children ? deepCloneWithoutIds(rest.children) : [],
    }));



  const handleIconSelect = async (iconName) => {
    setCustomIconName(iconName);

    if (editingComponent) {
      try {
        await updateCustomComponent(editingComponent.originalId, {
          componentName: customComponentName,
          icon: iconName,
          data: JSON.stringify(editingComponent.children || []),
        });

        toast.success("Icon updated!");
        setEditingComponent(null);
        setShowIconPicker(false);
      } catch (err) {
        toast.error("Icon update failed", { id: "icon-fail" });
      }
    } else {
      const componentPayload = {
        icon: iconName,
        componentName: customComponentName,
        data: JSON.stringify(deepCloneWithoutIds(components)),
      };

      try {
        const success = await addCustomComponent(componentPayload);
        setShowIconPicker(false);
        if (!success) return;

        toast.success("Custom Component Saved!", { id: "custom-save" });
        setComponents([]);
        setSelectedComponentId(null);
        setCustomComponentName("");
        setCustomIconName("Square");
      } catch (error) {
        setShowIconPicker(false);
        toast.error("Failed to save component", { id: "failed-save" });
      }
    }
  };


  const handleRenameComponent = (component) => {
    setEditingComponent(component);
    setCustomComponentName(component.label);
    setShowNameInput(true);
  };


  const handleChangeIcon = (component) => {
    setEditingComponent(component);
    setCustomComponentName(component.label);
    setCustomIconName(component.iconName || "Square");
    setIconSearch("");
    setShowIconPicker(true);
  };

  const handleDeleteComponent = (component) => {
    setDeleteTargetId(component.originalId);
  };

  //Layer Logic
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );


  const generateComponent = async (prompt) => {
    if (!prompt) {
      toast.error("Invalid Prompt!", { id: "prompt" });
      return;
    }

    let aiUrl = import.meta.env.VITE_GENERATE_URL;
    let aiApi = import.meta.env.VITE_AI_API_KEY;

    if (!aiUrl || !aiApi) {
      toast.error("URL Not Found! Refresh & Try Again!", { id: "error-prompt" });
      return;
    }

    try {
      setGenerating(true);
      let res = await axios.post(aiUrl, {
        prompt
      },
        {
          headers: {
            "Content-Type": "application/json",
            "x-api-key": aiApi
          }
        });

      setGeneratedComponent(JSON.parse(res.data.response));
    } catch (error) {
      console.log(error);
    } finally {
      setGenerating(false);
      setGenerated(true);
    }
  }


  /* ---------------- Render ---------------- */
  return (
    <DndContext onDragEnd={handleDragEnd} sensors={sensors}>
      <div className="component-editor-wrapper" style={{ position: "relative" }}>
        <div className="editor-top-bar">
          <Button
            className="secondary-button"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              padding: "10px 20px",
            }}
            onClick={() => {
              if (components.length === 0) {
                toast.error("There is no component to preview!", { ...toastErrorStyle, id: "no-preview" });
                return;
              }

              localStorage.setItem(
                "componentEditorPreview",
                JSON.stringify(components)
              );

              window.open("/component-editor-preview", "_blank");
            }}>
            <Eye size={20} />
            Preview
          </Button>

          <button
            className="save-component-btn"
            disabled={!components.length || !hasUnsavedChanges}
            onClick={saveCanvasAsComponent}
          >
            {editingSavedComponentId ? (hasUnsavedChanges ? "Update Component" : "Saved") : "Save Component"}
          </button>
        </div>


        <div className="editor-body">
          <LeftPanel components={combinedComponents}
            onAddJsonComponent={async (newComp) => {
              try {
                await addCustomComponent(newComp);
                toast.success("JSON component added!", { id: "json-added" });
              } catch (err) {
                toast.error("Failed to add JSON component", { id: "json-added" });
              }
            }}

            onEditSavedComponent={startEditingSavedComponent}
            onRenameComponent={handleRenameComponent}
            onChangeIcon={handleChangeIcon}
            onDeleteComponent={handleDeleteComponent}
            canvasElements={components}
            onDeleteCanvasComponent={(id) => {
              setDeleteTargetId(id);
            }}
            onSelectComponent={setSelectedComponentId}
            selectedComponentId={selectedComponentId}
            setShowAiModel={setShowAiModel}
            setGenerated={setGenerated}
            aiData={generatedComponent}
          />

          <Canvas
            components={components}
            selectedComponentId={selectedComponentId}
            onSelectComponent={setSelectedComponentId}
            clearComponentSelection={clearComponentSelection}
          />

          <RightSideBar
            selectedComponent={selectedComponent}
            updateComponent={updateComponent}
            deleteComponent={deleteComponent} />
        </div>
      </div>


      {/* Ai Modal */}
      {showAiModel && (
        <PromptModal setShowAiModel={setShowAiModel} isGenerated={generated} data={generatedComponent} setData={setGeneratedComponent} onSubmit={generateComponent} isGenerating={generating} />
      )}


      {/* Component Name Modal */}
      {showNameInput && (
        <div className="custom-component-modal">
          <div className="modal-header">
            <h4>{editingComponent ? "Rename Component" : "Name your component"}</h4>
            <X size={20} className="modal-cancel-btn" onClick={() => setShowNameInput(false)} />
          </div>
          <input
            type="text"
            placeholder="Enter component name..."
            value={customComponentName}
            onChange={(e) => setCustomComponentName(e.target.value)} />
          <button
            disabled={!customComponentName.trim()}
            onClick={handleNameSubmit}>
            {editingComponent ? "Rename" : "Next: Choose Icon"}
          </button>
        </div>
      )}

      {/* Icon Picker Modal */}
      {showIconPicker && (
        <div className="icon-picker-wrapper">
          <div className="modal-header">
            <h4>Choose an icon for {customComponentName || "your component"}</h4>
            <X size={20} className="modal-cancel-btn" onClick={() => setShowIconPicker(false)} />
          </div>

          <div className="icon-picker-search">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search icons..."
              value={iconSearch}
              onChange={(e) => setIconSearch(e.target.value)}
            />
          </div>

          <div className="icon-picker-grid">
            <IconPicker
              search={iconSearch}
              value={customIconName}
              onChange={handleIconSelect}
              className="icon-picker-item"
            />
          </div>
        </div>
      )}

      {deleteTargetId && (
        <div className="delete-modal-overlay">
          <div className="delete-modal">

            <div className="delete-header">
              <div className="delete-icon">
                <AlertCircle size={22} />
              </div>
              <h3>Delete Component</h3>
            </div>

            <p className="delete-description">
              Are you sure you want to delete this component?
            </p>

            <div className="delete-modal-actions">
              <button className="cancel-btn" onClick={cancelDelete}>
                No
              </button>

              <button className="confirm-btn" onClick={confirmDelete}>
                <Trash2 size={16} />
                Yes
              </button>
            </div>

          </div>
        </div>
      )}

      <DragOverlay dropAnimation={{ duration: 120 }} />
    </DndContext>
  );
};

export default ComponentEditor;
