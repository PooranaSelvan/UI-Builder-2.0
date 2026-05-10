import { useEffect, useState, useContext, useRef, useCallback } from "react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragOverlay } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import LeftPanel from "./LeftSideBar/LeftPanel";
import Canvas from "./Canvas/Canvas";
import { v4 as uuidv4 } from "uuid";
import RightSideBar from "./RightSideBar/RightSideBar";
import toast from 'react-hot-toast';
import Dock from "./components/Dock";
import { components as componentLibrary } from "./utils/ComponentsData.js";
import { CustomComponentsContext } from "../../context/CustomComponentsContext";
import "./workspace.css";
import Button from "../../components/Button.jsx";
import { Eye, Rocket, Save, Undo2, AlertCircle, Trash2, ExternalLink, Cloudy, Settings } from 'lucide-react';
import { useNavigate, useParams } from "react-router-dom";
import api from "../../utils/axios.js";
import Loading from "../../components/Loading.jsx";


const Workspace = ({ isAuthenticated }) => {
  const [components, setComponents] = useState([]);
  const [zoom, setZoom] = useState(1);
  const [selectedComponentId, setSelectedComponentId] = useState(null);
  const { pageId } = useParams();
  const [user, setUser] = useState(null);
  const { customComponents } = useContext(CustomComponentsContext);
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageSaving, setPageSaving] = useState(false);
  let navigate = useNavigate();
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const pageMetaRef = useRef(null);

  // ── Undo / Redo (session-only) ──
  const historyRef = useRef([]);      // past snapshots
  const futureRef = useRef([]);       // redo snapshots
  const isUndoRedoRef = useRef(false); // flag to skip recording during undo/redo
  const componentsRef = useRef([]);   // always mirrors latest components state
  const [historyVersion, setHistoryVersion] = useState(0); // forces re-render for canUndo/canRedo
  const propertyChangeTimerRef = useRef(null); // debounce timer for property edits
  const propertyBaseSnapshotRef = useRef(null); // snapshot before a burst of property edits

  // Keep componentsRef in sync with state
  useEffect(() => { componentsRef.current = components; }, [components]);

  // Push a snapshot to history (clears redo stack)
  const pushHistory = useCallback((snapshot) => {
    historyRef.current = [...historyRef.current, snapshot];
    if (historyRef.current.length > 50) {
      historyRef.current = historyRef.current.slice(-50);
    }
    futureRef.current = [];
    setHistoryVersion(v => v + 1);
  }, []);

  // Wrap setComponents so every mutation auto-records history
  const setComponentsWithHistory = useCallback((updater) => {
    // Snapshot current state BEFORE the update (read from ref — no side effects in updater)
    const snapshot = JSON.parse(JSON.stringify(componentsRef.current));
    pushHistory(snapshot);
    // Clear any pending property-edit debounce since a structural change happened
    if (propertyChangeTimerRef.current) {
      clearTimeout(propertyChangeTimerRef.current);
      propertyChangeTimerRef.current = null;
      propertyBaseSnapshotRef.current = null;
    }
    setComponents((prev) => typeof updater === "function" ? updater(prev) : updater);
  }, [pushHistory]);

  // Debounced version for rapid property edits (typing, color picking, sliders)
  const setComponentsWithDebouncedHistory = useCallback((updater) => {
    // On the FIRST edit in a burst, capture the base snapshot
    if (!propertyBaseSnapshotRef.current) {
      propertyBaseSnapshotRef.current = JSON.parse(JSON.stringify(componentsRef.current));
    }
    // Clear previous timer
    if (propertyChangeTimerRef.current) {
      clearTimeout(propertyChangeTimerRef.current);
    }
    // Apply the change immediately (so UI updates)
    isUndoRedoRef.current = true; // skip pushHistory from other paths
    setComponents((prev) => typeof updater === "function" ? updater(prev) : updater);
    setTimeout(() => { isUndoRedoRef.current = false; }, 0);
    // After 400ms of inactivity, commit the base snapshot to history
    propertyChangeTimerRef.current = setTimeout(() => {
      if (propertyBaseSnapshotRef.current) {
        pushHistory(propertyBaseSnapshotRef.current);
        propertyBaseSnapshotRef.current = null;
      }
      propertyChangeTimerRef.current = null;
    }, 400);
  }, [pushHistory]);

  const canUndo = historyRef.current.length > 0;
  const canRedo = futureRef.current.length > 0;

  const handleUndo = useCallback(() => {
    if (historyRef.current.length === 0) return;
    // Flush any pending property-edit debounce
    if (propertyChangeTimerRef.current) {
      clearTimeout(propertyChangeTimerRef.current);
      propertyChangeTimerRef.current = null;
      if (propertyBaseSnapshotRef.current) {
        pushHistory(propertyBaseSnapshotRef.current);
        propertyBaseSnapshotRef.current = null;
      }
    }
    // Snapshot current → future, pop history → set as current
    const currentSnapshot = JSON.parse(JSON.stringify(componentsRef.current));
    const previous = historyRef.current.pop();
    futureRef.current = [...futureRef.current, currentSnapshot];
    isUndoRedoRef.current = true;
    setComponents(previous);
    setHistoryVersion(v => v + 1);
    setSelectedComponentId(null);
    setTimeout(() => { isUndoRedoRef.current = false; }, 0);
  }, [pushHistory]);

  const handleRedo = useCallback(() => {
    if (futureRef.current.length === 0) return;
    // Snapshot current → history, pop future → set as current
    const currentSnapshot = JSON.parse(JSON.stringify(componentsRef.current));
    const next = futureRef.current.pop();
    historyRef.current = [...historyRef.current, currentSnapshot];
    isUndoRedoRef.current = true;
    setComponents(next);
    setHistoryVersion(v => v + 1);
    setSelectedComponentId(null);
    setTimeout(() => { isUndoRedoRef.current = false; }, 0);
  }, []);

  // Keyboard shortcuts: Cmd/Ctrl + Z (undo), Cmd/Ctrl + Shift + Z (redo)
  useEffect(() => {
    const onKeyDown = (e) => {
      const isMod = e.metaKey || e.ctrlKey;
      if (isMod && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      if (isMod && e.key === "z" && e.shiftKey) {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleUndo, handleRedo]);


  useEffect(() => {
    async function getUser() {
      try {
        let res = await api.get("/checkme");
        setUser(res.data.user);
      } catch (error) {
        console.log(error.response);

        if (error.response?.status === 401) {
          navigate("/login", { replace: true });
        }
      } finally {
        setLoading(false);
      }
    }

    getUser();
  }, []);

  useEffect(() => {
    if (!user) return;

    async function fetchComponents() {
      try {
        let res = await api.get(`/builder/page/${pageId}`);

        // console.log(res.data.userId, user.userId);

        if (res.data.userId !== user.userId) {
          toast.error("You can't access this Page!");
          navigate("/dashboard");
          return;
        }

        setPage(res.data);

        // Separate __pageMeta__ from canvas components
        const rawData = res.data.data || [];
        const metaObj = rawData.find(item => item.id === "__pageMeta__");
        const canvasComponents = rawData.filter(item => item.id !== "__pageMeta__");
        pageMetaRef.current = metaObj || null;
        setComponents(canvasComponents);
      } catch (error) {
        console.log(error.response);

        if (error.response?.status === 404) {
          toast.error(error.response.data.message);
          navigate("/dashboard");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchComponents();
  }, [pageId, user]);


  // Build full data array with meta included
  const getFullData = useCallback(() => {
    const meta = pageMetaRef.current;
    return meta ? [meta, ...components] : [...components];
  }, [components]);

  const handleSavePage = async () => {
    if (!isAuthenticated) {
      toast.error("Login to Save Page!");
      return;
    }

    try {
      setPageSaving(true);
      const fullData = getFullData();
      let res = await api.put(`/builder/pages/${pageId}`, {
        data: fullData
      });

      let updatedPage = { ...page, data: fullData };

      setPage(ele => ({ ...ele, data: fullData }));
      localStorage.setItem("previewComponents", JSON.stringify(fullData));
      toast.success("Pages Saved Successfully!");

      return updatedPage;
    } catch (error) {
      console.log(error.response);
    } finally {
      setPageSaving(false);
    }
  }


  // Auto Save
  useEffect(() => {
    let timer = setTimeout(async () => {
      try {
        setPageSaving(true);
        const fullData = getFullData();
        let res = await api.put(`/builder/pages/${pageId}`, {
          data: fullData
        });

        let updatedPage = { ...page, data: fullData };

        setPage(ele => ({ ...ele, data: fullData }));
        localStorage.setItem("previewComponents", JSON.stringify(fullData));
      } catch (error) {
        console.log(error.response);
        toast.error("Auto Saving Failed! Please Save Manually!", {...toastErrorStyle, id : "auto-save"});
      } finally {
        setPageSaving(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [components]);


  const handlePublishPage = async () => {
    if (components.length === 0) {
      toast.error("Add any Components to Publish the Page!", toastErrorStyle);
      return;
    }

    let updatedPage = await handleSavePage();

    try {
      let res = await api.post("/builder/publish", {
        pageId: updatedPage.id,
        projectId: updatedPage.projectId
      });

      setPage(ele => ({ ...ele, isPublished: true }));
      toast.success(res.data.message);
    } catch (error) {
      console.log(error.response);
      toast.error(error.response?.data.message);
    }
  }


  const handleUnPublishPage = async () => {
    let updatedPage = await handleSavePage();

    try {
      let res = await api.post("/builder/publish/un", {
        pageId: updatedPage.id,
        projectId: updatedPage.projectId
      });

      setPage(ele => ({ ...ele, isPublished: false }));
      toast.success(res.data.message);
    } catch (error) {
      console.log(error);
      console.log(error.response);
      toast.error(error.response?.data.message);
    }
  }

  // Zoom Functions
  const handleZoomIn = () => {
    setZoom(zoom + 0.25);

    if (zoom >= 2) {
      setZoom(1);
    }
  };
  const handleZoomOut = () => {
    setZoom(zoom - 0.25);

    if (zoom <= 0.25) {
      setZoom(1);
    }
  }
  const handleReset = () => {
    setZoom(1);
  }


  // DFS
  const findComponentById = (items, id) => {
    for (let ele of items) {
      if (ele.id === id) {
        return ele;
      }

      if (ele.children && ele.children.length > 0) {
        let element = findComponentById(ele.children, id);
        if (element) return element;
      }
    }

    return null;
  }

  const cloneWithNewIds = (component) => {
    const newId = `${component.id}-${uuidv4()}`;

    return {
      ...component,
      id: newId,
      children: component.children?.map(cloneWithNewIds) || [],
    };
  };



  const selectedComponent = selectedComponentId ? findComponentById(components, selectedComponentId) : null;
  const toastErrorStyle = { style: { borderRadius: '10px', background: 'var(--primary)', color: 'white' }, iconTheme: { primary: 'white', secondary: 'var(--primary)' } };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    setSelectedComponentId(null);
    if (!over || active.id === over.id) return;

    const isFromSidebar = !!active.data.current?.component;
    const isChild = isChildComponent(components, active.id);


    // From SideBar
    if (isFromSidebar) {
      const componentData = active.data.current.component;

      // From SideBar to Canvas -- Layout Components
      if (over.id === "canvas") {
        if (componentData?.rank === 4) {
          toast.error("Basic elements must be inside a layout", toastErrorStyle);
          return;
        }

        const clonedComponent = cloneWithNewIds(componentData);

        setComponentsWithHistory((prev) => [...prev, clonedComponent]);
        setSelectedComponentId(clonedComponent.id);

        return;
      }


      // From SideBar to Canvas -- Child Components
      let overData = over.data.current;
      if (overData?.rank && componentData.rank < overData.rank) {
        toast.error("You cannot place this component inside a smaller Component.", toastErrorStyle);
        return;
      }

      let newChild = cloneWithNewIds(componentData);

      setComponentsWithHistory((items) => addChildToComponent(items, over.id, newChild));
      return;
    }


    // From Canvs Area
    if (isChild && over.id === "canvas") {
      const draggedComponent = findComponentById(components, active.id);
      if (!draggedComponent) return;

      if (draggedComponent.rank === 4) {
        toast.error("Basic elements must be inside a Layout Component", toastErrorStyle);
        return;
      }

      setComponentsWithHistory((items) => {
        const { newComponent, child } = removeChild(items, active.id);
        return [...newComponent, child];
      });

      return;
    }

    const findParentComponent = (items, childId) => {
      for (let item of items) {
        if (item.children?.some(child => child.id === childId)) {
          return item;
        }

        if (item.children?.length) {
          const found = findParentComponent(item.children, childId);
          if (found) return found;
        }
      }
      return null;
    };

    const isOverChild = isChildComponent(components, over.id);

    if (!isChild && !isOverChild && over.id !== "canvas") {
      const oldIndex = components.findIndex(i => i.id === active.id);
      const newIndex = components.findIndex(i => i.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        setComponentsWithHistory(items => arrayMove(items, oldIndex, newIndex));
        return;
      }
    }


    // Re-Order Canvas Elements - Sorting
    if (isChild) {
      const parent = findParentComponent(components, active.id);
      if (!parent) return;

      const oldIndex = parent.children.findIndex(c => c.id === active.id);
      const newIndex = parent.children.findIndex(c => c.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        setComponentsWithHistory(prev => {
          const cloned = cloneComponents(prev);
          const parentClone = findParentComponent(cloned, active.id);

          parentClone.children = arrayMove(
            parentClone.children,
            oldIndex,
            newIndex
          );

          return cloned;
        });

        return;
      }
    }


    // Putting Into Another Component
    if (over.id !== "canvas") {
      let componentData = findComponentById(components, active.id);
      if (!componentData) return;

      setComponentsWithHistory((items) => {
        let newComponents;
        let movingChild = componentData;

        if (isChild) {
          const { newComponent, child } = removeChild(items, active.id);
          newComponents = newComponent;
          movingChild = child;
        } else {
          newComponents = items.filter((item) => item.id !== active.id);
        }

        return addChildToComponent(newComponents, over.id, movingChild);
      });
    }
  };


  const addChildToComponent = (items, parentId, newChild) => {
    return items.map((item) => {
      if (item.id === parentId) {
        return { ...item, children: [...(item.children || []), newChild] };
      }

      if (item.children && item.children.length > 0) {
        return { ...item, children: addChildToComponent(item.children, parentId, newChild) };
      }

      return item;
    });
  };

  const removeChild = (items, childId) => {
    let child = null;
    let newComponent = cloneComponents(items);
    let arr = [newComponent];

    while (arr.length > 0) {
      let obj = arr.pop();
      let index = obj.findIndex(child => child && child.id === childId);

      if (index !== -1) {
        child = obj[index];
        obj.splice(index, 1);
        break;
      }

      obj.forEach(item => {
        if (item.children && item.children.length > 0) {
          arr.push(item.children);
        }
      });
    }

    return { newComponent, child };
  };


  // To Check a Element is a Child Element
  const isChildComponent = (items, id) => {
    for (let item of items) {
      if (item.children && item.children.some(child => child.id === id)) {
        return true;
      }

      if (item.children && item.children.length > 0) {
        if (isChildComponent(item.children, id)) {
          return true;
        }
      }
    }
    return false;
  };


  // Right SideBar Methods - Gowtham
  const deleteComponent = () => {
    if (!selectedComponentId) return;
    setDeleteTargetId(selectedComponentId);
  };
  const confirmDelete = () => {
    if (!deleteTargetId) return;
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

    setComponentsWithHistory(cloned);
    setSelectedComponentId(null);
    setDeleteTargetId(null);
  };

  const cancelDelete = () => {
    setDeleteTargetId(null);
  };
  const clearComponentSelection = () => {
    setSelectedComponentId(null);
  };

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

  const updateComponent = (id, updater) => {
    setComponentsWithDebouncedHistory(existingComponent => {
      const cloneStructure = cloneComponents(existingComponent);
      updateNodeById(cloneStructure, id, updater);
      return cloneStructure;
    })
  }

  const updateNodeById = (nodes, id, updater) => {
    for (const node of nodes) {
      if (node.id === id) {
        updater(node);
        return true
      }

      if (node.children && node.children.length) {
        if (updateNodeById(node.children, id, updater)) {
          return true;
        }
      }
    }
    return false
  }

  const handleNavigatePreview = () => {
    if (components.length === 0) {
      toast.error("There are no Components Load Preview!", { id: "There are no Components Load Preview!", ...toastErrorStyle });
      return;
    }

    localStorage.setItem("previewComponents", JSON.stringify(getFullData()));
    window.open("/preview", "_blank");
  }

  const openPublish = () => {
    if (!page.isPublished) {
      toast.error("This page is not Published!", { id: "This page is not Published!", ...toastErrorStyle });
      return;
    }

    window.open(`${window.location.origin}/publish/${page?.pageUrl}`, "_blank");
  }

  const handleNavigateDashboard = () => {
    navigate("/dashboard");
  }

  const combinedComponents = [
    ...componentLibrary,
    ...(customComponents.length
      ? [
        {
          title: "Custom Components",
          type: "grid",
          items: customComponents.map(c => ({
            id: c._id,
            originalId: c._id,
            label: c.componentName,
            iconName: c.icon || "Square",
            isRootCustom: true,
            children: c.data ? JSON.parse(c.data) : [],
          })),
        },
      ]
      : []),
  ];

  let sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8
      }
    })
  );

  if (loading) {
    return (
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", height: "93vh", overflow: "hidden", position: "relative" }}>
        <Loading />
      </div>
    );
  }

  return (
    <div>
      <DndContext onDragEnd={(e) => { handleDragEnd(e) }} sensors={sensors}>
        <div style={{ display: "flex", height: "93vh", overflow: "hidden", position: "relative" }}>
          <div className="workspace-topbar" id="topbar-tour">
            <div className="workspace-topbar-btns">
              <Button className="primary-button save-btn" style={{ display: "flex", alignItems: "center", justifyCenter: "center", gap: "10px", padding: "10px 20px" }} onClick={handleSavePage} disabled={!components.length || pageSaving}>
                {pageSaving ? (
                  <p>
                    <Cloudy size={20} />
                    Saving...
                  </p>
                ) : (
                  <p>
                    <Save size={20} />
                    Save
                  </p>
                )}
              </Button>
              <Button className="secondary-button" style={{ display: "flex", alignItems: "center", justifyCenter: "center", gap: "10px", padding: "10px 20px" }} onClick={handleNavigatePreview}>
                <Eye size={20} />
                Preview
              </Button>
              <div className="current-url">
                <div style={{ display: "flex", gap: "2px" }}>
                  <p className="current-project" onClick={handleNavigateDashboard}>{`${page?.pageUrl && page?.pageUrl.split("/")[1]}`}</p>
                  <p>/</p>
                  <p>{`${page?.pageUrl.split("/")[2]}`}</p>
                </div>
                <ExternalLink size={20} onClick={openPublish} />
              </div>
              <Button className="secondary-button" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "10px" }} onClick={() => navigate(`/page-settings/${pageId}`)} title="Page Settings">
                <Settings size={20} />
              </Button>
              {page?.isPublished ? (
                <Button className="primary-button" style={{ display: "flex", alignItems: "center", justifyCenter: "center", gap: "10px", padding: "10px 20px" }} onClick={handleUnPublishPage}>
                  <Undo2 size={20} />
                  Unpublish
                </Button>
              ) : (
                <Button className="primary-button" style={{ display: "flex", alignItems: "center", justifyCenter: "center", gap: "10px", padding: "10px 20px" }} onClick={handlePublishPage}>
                  <Rocket size={20} />
                  Publish
                </Button>
              )}
            </div>
          </div>
          <LeftPanel components={combinedComponents} canvasElements={components} onSelectComponent={setSelectedComponentId} onDeleteCanvasComponent={(id) => { setDeleteTargetId(id); }} selectedComponentId={selectedComponentId} />
          <Canvas components={components} zoom={zoom} selectedComponentId={selectedComponentId} onSelectComponent={(id) => setSelectedComponentId(id)} clearComponentSelection={clearComponentSelection} />
          <RightSideBar selectedComponent={selectedComponent} updateComponent={updateComponent} deleteComponent={deleteComponent} />
        </div >
        <Dock zoom={zoom} onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} onReset={handleReset} onUndo={handleUndo} onRedo={handleRedo} canUndo={canUndo} canRedo={canRedo} />
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
        {/* <LinkModal /> */}
      </DndContext >
    </div>
  );
};

export default Workspace;