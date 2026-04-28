import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import FolderCard from "./FolderCard";
import CreateForm from "./CreateForm";
import { Plus, MoreVertical, FileText, Search, ChevronRight, Copy, Edit3, Eye, Trash2, Rocket, Undo2, Download, FileUp, CodeXml, Braces, Component } from "lucide-react";
import "./Dashboard.css";
import toast from "react-hot-toast";
import Loading from "../../components/Loading";
import api from "../../utils/axios.js";
import Button from "../../components/Button.jsx";
import DeleteModal from "./components/DeleteModal.jsx";
import UpdateForm from "./components/UpdateForm.jsx";
import { generateHTML } from "../workspace/utils/exportHTML.js";
import { html as beautifyHtml } from "js-beautify";
import { v4 as uuidv4 } from "uuid";

const Dashboard = () => {
  let navigate = useNavigate();
  const [selectedApp, setSelectedApp] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteInfo, setDeleteInfo] = useState(null);
  const [isUpdateFormOpen, setIsUpdateFormOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(null);
  const menuRef = useRef(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportPageId, setExportPageId] = useState(null);
  const location = useLocation();
  const template = location.state?.template || null;
  const [selectedTemplateProject, setSelectedTemplateProject] = useState(null);
  const [showPageForm, setShowPageForm] = useState(false);
  const [templateMode, setTemplateMode] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isPageModalOpen, setIsPageModalOpen] = useState(false);
  const [user, setUser] = useState(null);

  const regenerateIds = (items) => {
    return items.map(item => ({
      ...item,
      id: `${item.id}-${uuidv4()}`,
      children: item.children ? regenerateIds(item.children) : []
    }));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  useEffect(() => {
    const getUserId = async () => {
      try {
        let res = await api.get("/checkme/");
        setUserId(res.data.user.userId);
        setUser(res.data.user);
      } catch (error) {
        navigate("/login", { replace: true });
      }
    };

    getUserId();
  }, []);


  function buildJSON(rows) {
    let project = {};

    rows.forEach((data) => {
      const projectId = data.projectId;

      if (!project[projectId]) {
        project[projectId] = {
          id: projectId,
          name: data.projectName,
          desc: data.description,
          pages: []
        }
      }

      if (data.pageName) {
        project[projectId].pages.push({
          id: data.pageId,
          projectId: projectId,
          name: data.pageName,
          description: data.pageDescription,
          pageUrl: data.url,
          modified: data.lastModified,
          data: data.pageData || [],
          isPublished: !!data.pagePublished
        });
      }
    });
    return Object.values(project);
  }

  async function fetchPages() {
    if (!userId) {
      return;
    }

    try {
      let res = await api.get(`/builder/pages/${userId}`);

      let formattedJSON = buildJSON(res.data.pages);
      setProjects(formattedJSON);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!userId) return;

    fetchPages();
  }, [userId]);

  const handleCreateNewPage = async (name, description, url) => {
    if (userId < 1) {
      toast.error("Invalid User!");
      return;
    }

    if (!selectedApp) {
      toast.error("Something Went Wrong! Refresh & Try Again!");
      return;
    }

    if (!name || !description || !url) {
      toast.error("All fields Required!");
      return;
    }

    let builtUrl = `${user.email.split("@")[0].split(".")[0].toLowerCase()}/${selectedApp.name && selectedApp.name.toLowerCase()}/${url}`;

    try {
      setLoading(true);
      let res = await api.post("/builder/pages/", {
        projectId: selectedApp.id,
        pageName: name,
        description,
        pageUrl: builtUrl,
        data: []
      });

      let projectId = selectedApp.id;

      let newPage = {
        id: res.data.pageId,
        projectId,
        name: name,
        description,
        pageUrl: builtUrl,
        status: "Draft",
        modified: new Date().toLocaleString(),
        data: [],
        isPublished: false
      };

      setSelectedApp(ele => ({
        ...ele,
        pages: [...ele.pages, newPage]
      }));

      setProjects(data =>
        data.map(project => project.id === projectId ? { ...project, pages: [...project.pages, newPage] } : project)
      );

      setIsModalOpen(false);
      toast.success("Page Created Successfully!");
      setLoading(false);
      navigate(`/workspace/${res.data.pageId}`, { replace: true });
    } catch (err) {
      setLoading(false);
      console.log(err.response);
      toast.error(err.response?.data.message);
    }
  }

  const handleCreateNewProject = async (name, description) => {
    if (userId < 1) {
      toast.error("Invalid User! Refresh & Try Again!");
      return;
    }

    if (!name || !description) {
      toast.error("All fields Required!");
      return;
    }

    try {
      let res = await api.post("/builder/projects/", {
        userId,
        projectName: name,
        description
      });

      setProjects(projects => [
        ...projects,
        {
          id: res.data.projectId,
          name,
          desc: description,
          pages: []
        }
      ]);

      setIsProjectModalOpen(false);
      toast.success("Project Created Successfully!");
    } catch (err) {
      console.log(err);
      toast.error(err.response?.data.message);
    } finally {
      setLoading(false);
    }

  }

  const deleteProject = async () => {
    if (!deleteInfo.id) {
      return;
    }

    if (userId < 1) {
      toast.error("Invalid User! Refresh & Try Again!");
      return;
    }

    try {
      let res = await api.delete("/builder/projects/", {
        data: {
          projectId: deleteInfo.id
        }
      });

      setProjects(projects => projects.filter(ele => ele.id !== deleteInfo.id));
      if (selectedApp?.id === deleteInfo.id) {
        setSelectedApp(null);
      }
      toast.success("Project Deleted Successfully!");
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Delete error");
    } finally {
      setActiveMenu(null);
      setLoading(false);
      setShowDelete(false);
      setDeleteInfo(null);
    }
  }

  const deletePage = async () => {
    if (!deleteInfo.id) {
      return;
    }

    if (userId < 1) {
      toast.error("Invalid User! Refresh & Try Again!");
      return;
    }

    try {
      let res = await api.delete("/builder/pages/", {
        data: {
          pageId: deleteInfo.id
        }
      });

      setSelectedApp(project => ({
        ...project,
        pages: project.pages.filter(page => page.id !== deleteInfo.id)
      }));
      setProjects(ele => ele.map(project => project.id === selectedApp.id ? { ...project, pages: project.pages.filter(page => page.id !== deleteInfo.id) } : project));
      toast.success("Page Deleted Successfully!");
    } catch (err) {
      console.log(err);
      toast.error(err.response?.data.message);
    } finally {
      setActiveMenu(null);
      setLoading(false);
      setShowDelete(false);
      setDeleteInfo(null);
    }
  }


  const handlePublishPage = async (pageId, projectId) => {
    if (!pageId || !projectId) {
      toast.error("Invalid Page or Project Id!");
      return;
    }

    try {
      let res = await api.post("/builder/publish", {
        pageId,
        projectId
      });

      setSelectedApp(project => ({
        ...project,
        pages: project.pages.map(pg => pg.id === pageId ? { ...pg, isPublished: true } : pg)
      }));
      setProjects(ele => ele.map(project => project.id === selectedApp.id ? { ...project, pages: project.pages.map(pg => pg.id === pageId ? { ...pg, isPublished: true, status: "Published" } : pg) } : project));
      toast.success(res.data.message);
    } catch (error) {
      console.log(error.response);
      toast.error(error.response?.data.message);
    }
  }

  const handleUnPublishPage = async (pageId, projectId) => {
    if (!pageId || !projectId) {
      toast.error("Invalid Page or Project Id!");
      return;
    }

    try {
      let res = await api.post("/builder/publish/un", {
        pageId,
        projectId
      });

      setSelectedApp(project => ({
        ...project,
        pages: project.pages.map(pg => pg.id === pageId ? { ...pg, isPublished: false } : pg)
      }));
      setProjects(ele => ele.map(project => project.id === selectedApp.id ? { ...project, pages: project.pages.map(pg => pg.id === pageId ? { ...pg, isPublished: false, status: "Draft" } : pg) } : project));
      toast.success(res.data.message);
    } catch (error) {
      console.log(error);
      console.log(error.response);
      toast.error(error.response?.data.message);
    }
  }

  const handleCopyLink = async (pageUrl) => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/publish/${pageUrl}`);
      toast.success("Link Copied Successfully!");
    } catch (error) {
      console.log(error);
      toast.error("Error Copying Link!");
    }
  }

  const renamePage = async (pageId, pageName, pageDescription, url) => {
    if (!pageId || !pageName || !pageDescription || !url) {
      toast.error("All fields are Required!");
      return;
    }

    let builtUrl = `${user.email.split("@")[0].split(".")[0].toLowerCase()}/${selectedApp.name && selectedApp.name.toLowerCase()}/${url}`;

    try {
      let res = await api.post("/builder/page/rename", {
        pageId,
        name: pageName,
        description: pageDescription,
        url: builtUrl
      });

      setSelectedApp((projects) => ({
        ...projects,
        pages: projects.pages.map((page) => page.id === pageId ? { ...page, pageName, pageDescription, pageUrl: builtUrl } : page)
      }));

      setProjects((projects) =>
        projects.map((project) =>
          project.id === selectedApp.id ? {
            ...project,
            pages: project.pages.map((page) =>
              page.id === pageId ? { ...page, pageName, pageDescription, pageUrl: builtUrl } : page
            )
          } : project
        )
      );

      setIsUpdateFormOpen(false);
      toast.success("Page Renamed Successfully!");
    } catch (error) {
      console.log(error);
      console.log(error.response);
      toast.error(error.response?.data.response);
    }
  }

  const handlePreviewpage = async (pageId) => {
    if (!pageId) {
      toast.error("Invalid Page Id!");
      return;
    }

    setLoading(true);
    try {
      let res = await api.get(`/builder/page/${pageId}`);

      if (res.data.data) {
        localStorage.setItem("previewComponents", JSON.stringify(res?.data.data));
        window.open("/preview", "_blank");
      } else {
        toast.error("No preview Found!");
      }
      setLoading(false);
    } catch (error) {
      console.log(error.response);
      setLoading(false);
    }
  }


  //Export feature
  const downloadJsonFile = (jsonData, fileName) => {
    let blob = new Blob(
      [JSON.stringify(jsonData, null, 2)],
      { type: "application/json" }
    );

    let url = URL.createObjectURL(blob);
    let a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    
    document.body.appendChild(a);
    a.click();
    
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  function formatHTML(htmlString) {
    return beautifyHtml(htmlString, {
      indent_size: 2,
      wrap_line_length: 100,
      preserve_newlines: true,
    });
  }

  const downloadHtmlFile = (htmlContent, fileName) => {
    let blob = new Blob([htmlContent], { type: "text/html" });
    let url = URL.createObjectURL(blob);
    
    let a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    
    document.body.appendChild(a);
    a.click();
    
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExport = async (type) => {
    if (!exportPageId) {
      toast.error("Invalid Page!");
      return;
    }


    try {
      let res = await api.get(`/builder/page/${exportPageId}`);
      let currentPage = res.data;
      const pageData = res.data.data;

      if (!pageData) {
        toast.error("No Data Found!");
        return;
      }

      if (type === "json") {
        downloadJsonFile(pageData, `${currentPage?.name}.json`);
      }

      if (type === "html") {
        const rawHTML = generateHTML(pageData);
        const formattedHTML = formatHTML(rawHTML);
        downloadHtmlFile(formattedHTML, `${currentPage?.name}.html`);
      }

      setIsExportModalOpen(false);
      toast.success("Exported Successfully!");
    } catch (error) {
      console.log(error);
      toast.error("Export Failed!");
    }
  };

  //Templates
  const handleCreateNewPageTemplate = async (name, description, url, project, template) => {
    if (!project || !template) {
      toast.error("Invalid project or template!");
      return;
    }

    let builtUrl = `${user.email.split("@")[0].split(".")[0].toLowerCase()}/${selectedApp.name && selectedApp.name.toLowerCase()}/${url}`;

    try {
      setLoading(true);
      let templateData = regenerateIds(template.data || []);

      let res = await api.post("/builder/pages/", {
        projectId: project.id,
        pageName: name,
        description,
        pageUrl: builtUrl,
        data: templateData
      });

      let newPage = {
        id: res.data.pageId,
        projectId: project.id,
        name,
        description,
        pageUrl: builtUrl,
        data: templateData,
        isPublished: false,
        modified: new Date().toLocaleString()
      };

      setProjects((projects) =>
        projects.map((p) =>
          p.id === project.id ? { ...p, pages: [...p.pages, newPage] } : p
        )
      );

      toast.success("Page created from template!");
      setShowPageForm(false);
      navigate(`/workspace/${res.data.pageId}`, { replace: true });
    } catch (err) {
      console.log(err);
      toast.error(err.response?.data?.message || "Page creation failed!");
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="dashboard-container">
        <Loading />
      </div>
    );
  }

  // ================= DASHBOARD VIEW =================
  if (!selectedApp) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-inner">

          <div className="top-bar">
            <div>
              <h1>My Workspace</h1>
              <p className="sub-text">
                Convert your ideas into Projects
              </p>
            </div>
          </div>

          <div className="card-grid" id="cards-grid">
            <div
              className="create-card"
              onClick={() => setIsProjectModalOpen(true)}
            >
              <div className="create-icon">
                <Plus size={28} />
              </div>
              <h3>Create New Project</h3>
            </div>

            {projects.map((app, index) => (
              <FolderCard
                app={{ ...app, isTemplateMode: !!template }}
                index={index}
                key={app.id}
                activeMenu={activeMenu}
                setActiveMenu={setActiveMenu}
                setSelectedApp={setSelectedApp}
                setDeleteInfo={setDeleteInfo}
                setShowDelete={setShowDelete}
                onTemplateClick={(project) => {
                  setSelectedTemplateProject(project);
                  setSelectedApp(project);
                  setShowPageForm(true);
                  setTemplateMode(true);
                }}
              />
            ))}

            {showPageForm && templateMode && selectedTemplateProject && (
              <CreateForm
                isOpen={isPageModalOpen}
                onClose={() => {
                  setShowPageForm(false);
                  setTemplateMode(false);
                  setSelectedTemplateProject(null);
                }}
                title={`Create Page in ${selectedTemplateProject?.name}`}
                nameLabel="Page Name"
                descriptionLabel="Page Description"
                buttonText="Create Page"
                createNewPage={(name, description, url) =>
                  handleCreateNewPageTemplate(
                    name,
                    description,
                    url,
                    selectedTemplateProject,
                    template
                  )
                }
                projectUrl={selectedApp.name}
                user={user}
              />
            )}
          </div>

        </div>
        <CreateForm
          isOpen={isProjectModalOpen}
          onClose={() => setIsProjectModalOpen(false)}
          title="Create New Project"
          nameLabel="Project Name"
          descriptionLabel="Project Description"
          buttonText="Create Project"
          createNewProject={handleCreateNewProject}
        />
        {showDelete && deleteInfo?.type === "project" && (
          <DeleteModal title="Project" onDelete={deleteProject} onCancel={() => { setShowDelete(false); setDeleteInfo(null) }} />
        )}
      </div>
    );
  }


  // ================= PAGES VIEW =================
  return (
    <div className="dashboard-container">
      <div className="dashboard-inner">

        <div className="top-bar">
          <div className="breadcrumb">
            <span
              className="breadcrumb-link"
              onClick={() => setSelectedApp(null)}>
              My Workspace
            </span>

            <span className="breadcrumb-separator">/</span>

            <span className="breadcrumb-current">
              {selectedApp.name}
            </span>
          </div>
        </div>

        <div className="card-grid">
          <div
            className="create-card"
            onClick={() => setShowPageForm(true)} >
            <div className="create-icon">
              <Plus size={28} />
            </div>
            <h3>Create New Page</h3>
            <p>Add a new page to this project</p>
          </div>

          {!templateMode && selectedApp?.pages?.map((page, index) => (
            <div key={page.id} className="page-card">
              <div className="page-top">
                {/* HEADER */}
                <div className="page-header">
                  <div className="folder-icon folder-color">
                    <FileText size={26} />
                  </div>
                  <br />
                  <div className="page-header-right">
                    <span className={`status ${page.isPublished ? "published" : "draft"}`}>
                      {page.isPublished ? "Published" : "Draft"}
                    </span>
                    <div className="menu-wrapper">
                      <MoreVertical
                        size={20}
                        className="three-dots"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenu(activeMenu === index ? null : index)
                        }} />
                      {activeMenu === index && (
                        <div className="dropdown-menu" onClick={(e) => e.stopPropagation()} ref={menuRef}>
                          <div className="menu-item">
                            <Button onClick={(e) => { e.stopPropagation(); setCurrentPage(page); setIsUpdateFormOpen(true); }} style={{ width: "100%", borderRadius: "5px", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px", backgroundColor: "transparent" }}>
                              <Edit3 size={16} />
                              Rename
                            </Button>
                          </div>
                          <div className="menu-item">
                            <Button onClick={(e) => { e.stopPropagation(); handlePreviewpage(page.id) }} style={{ width: "100%", borderRadius: "5px", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px", backgroundColor: "transparent" }}>
                              <Eye size={16} />
                              Preview
                            </Button>
                          </div>
                          {page.isPublished ? (
                            <div className="menu-item">
                              <Button style={{ width: "100%", borderRadius: "5px", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px", backgroundColor: "transparent" }} onClick={() => handleUnPublishPage(page.id, page.projectId)}>
                                <Undo2 size={16} />
                                Un Publish
                              </Button>
                            </div>
                          ) : (
                            <div className="menu-item">
                              <Button style={{ width: "100%", borderRadius: "5px", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px", backgroundColor: "transparent" }} onClick={() => handlePublishPage(page.id, page.projectId)}>
                                <Rocket size={16} />
                                Publish
                              </Button>
                            </div>
                          )}
                          <div className="menu-item">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setExportPageId(page.id);
                                setIsExportModalOpen(true);
                              }}
                              style={{ width: "100%", borderRadius: "5px", display: "flex", alignItems: "center", gap: "10px", backgroundColor: "transparent" }}>
                              <Download size={16} />
                              Export
                            </button>
                          </div>
                          <div className="menu-divider" />
                          <div className="menu-item delete">
                            <Button onClick={(e) => { e.stopPropagation(); setActiveMenu(null); setDeleteInfo({ type: "page", id: page.id }); setShowDelete(true) }} style={{ width: "100%", borderRadius: "5px", color: "var(--primary)", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px", backgroundColor: "transparent" }}>
                              <Trash2 size={16} />
                              Delete
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>
              {/* DIVIDER */}
              <div className="page-divider"></div>
              <br />
              {/* TITLE */}
              <div className="page-title">
                <h3>{page.name}</h3>
                <p className="page-description">{page.description}</p>
              </div>

              {/* FOOTER */}
              <div className="page-footer" style={{ justifyContent: page.isPublished ? "space-between" : "flex-end" }}>
                {page.isPublished && (
                  <div className="page-link">
                    <p onClick={() => window.open(`/publish/${page.pageUrl}`, "_blank")}>Open</p>
                    <Copy size={15} onClick={() => handleCopyLink(page.pageUrl)} />
                  </div>
                )}
                <div className="open-page" onClick={() => navigate(`/workspace/${page.id}`)}>
                  <ChevronRight size={24} />
                </div>
              </div>
            </div>
          ))
          }
        </div>
        <CreateForm
          isOpen={showPageForm}
          onClose={() => {
            setShowPageForm(false);
            setTemplateMode(false);
            setSelectedTemplateProject(null);
          }}
          title={`Create Page in ${selectedApp?.name}`}
          nameLabel="Page Name"
          descriptionLabel="Page Description"
          buttonText="Create Page"
          createNewPage={
            templateMode
              ? (name, description, url) =>
                handleCreateNewPageTemplate(
                  name,
                  description,
                  url,
                  selectedTemplateProject,
                  template
                )
              : handleCreateNewPage
          }
          projectUrl={selectedApp.name}
          user={user}
        />
      </div >
      {showDelete && deleteInfo?.type === "page" && (
        <DeleteModal title="Page" onDelete={deletePage} onCancel={() => { setShowDelete(false); setDeleteInfo(null) }} />
      )}
      {isUpdateFormOpen && currentPage && (
        <UpdateForm isOpen={isUpdateFormOpen} onClose={() => setIsUpdateFormOpen(false)} pageData={{ name: currentPage.name, description: currentPage.description, url: currentPage.pageUrl }} onRename={(name, description, url) => renamePage(currentPage.id, name, description, url)} />
      )}

      {isExportModalOpen && (
        <div className="export-modal-overlay">
          <div className="export-modal">
            <div className="export-header">
              <div className="export-icon">
                <FileUp size={22} />
              </div>
              <h3>Export Page</h3>
            </div>

            <p className="export-description">
              Choose your preferred format to export this page.
            </p>

            <div className="export-modal-actions">
              <button className="export-btn" onClick={() => handleExport("json")}>
                <div className="export-icon">
                  <Braces size={20} />
                </div>
                Export as JSON
              </button>

              <button className="export-btn" onClick={() => handleExport("html")}>
                <div className="export-icon">
                  <CodeXml size={20} />
                </div>
                Export as HTML
              </button>

              <button className="cancel-btn" onClick={() => setIsExportModalOpen(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div >

  );
};
export default Dashboard;