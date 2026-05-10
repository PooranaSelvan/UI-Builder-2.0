import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Settings,
  FileText,
  Clock,
  Globe,
  Copy,
  Check,
  ExternalLink,
  X,
  Rocket,
  Undo2,
  Image,
  Type,
  Search,
  Link,
  Upload,
  Save,
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import api from "../../utils/axios.js";
import Loading from "../../components/Loading.jsx";
import { formatDistanceToNow, format } from "date-fns";
import "./PageSettings.css";

const PageSettings = () => {
  const { pageId } = useParams();
  const navigate = useNavigate();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  // Editable field values
  const [nameValue, setNameValue] = useState("");
  const [descValue, setDescValue] = useState("");
  const [faviconValue, setFaviconValue] = useState("");
  const [titleValue, setTitleValue] = useState("");
  const [metaValue, setMetaValue] = useState("");

  // Favicon upload
  const faviconFileRef = useRef(null);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);

  // Track original values to detect changes
  const [originals, setOriginals] = useState({
    name: "",
    desc: "",
    favicon: "",
    title: "",
    meta: "",
  });

  useEffect(() => {
    async function fetchPageDetails() {
      try {
        const userRes = await api.get("/checkme");
        if (!userRes.data?.user) {
          navigate("/login", { replace: true });
          return;
        }

        const res = await api.get(`/builder/page/${pageId}`);

        if (res.data.userId !== userRes.data.user.userId) {
          toast.error("You don't have access to this page!");
          navigate("/dashboard");
          return;
        }

        const rawData = res.data.data || [];
        const metaObj = rawData.find((item) => item.id === "__pageMeta__");

        setPage({
          ...res.data,
          favicon: metaObj?.favicon || null,
          title: metaObj?.title || null,
          meta: metaObj?.meta || null,
        });

        const n = res.data.pageName || "";
        const d = res.data.description || "";
        const f = metaObj?.favicon || "";
        const t = metaObj?.title || "";
        const m = metaObj?.meta || "";

        setNameValue(n);
        setDescValue(d);
        setFaviconValue(f);
        setTitleValue(t);
        setMetaValue(m);
        setOriginals({ name: n, desc: d, favicon: f, title: t, meta: m });
      } catch (error) {
        console.log(error);
        if (error.response?.status === 401) {
          navigate("/login", { replace: true });
        } else if (error.response?.status === 404) {
          toast.error("Page not found!");
          navigate("/dashboard");
        } else {
          toast.error("Failed to load page details");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchPageDetails();
  }, [pageId]);

  // Detect dirty
  const isDirty =
    nameValue !== originals.name ||
    descValue !== originals.desc ||
    faviconValue !== originals.favicon ||
    titleValue !== originals.title ||
    metaValue !== originals.meta;

  // --- Favicon upload to Cloudinary ---
  const handleFaviconFile = async (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "sirpam ui builder");

    try {
      setUploadingFavicon(true);
      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD}/image/upload`,
        formData
      );
      if (res.data?.secure_url) {
        setFaviconValue(res.data.secure_url);
        toast.success("Favicon uploaded!");
      }
    } catch (err) {
      console.log(err);
      toast.error("Failed to upload favicon");
    } finally {
      setUploadingFavicon(false);
    }
  };

  // --- Copy URL ---
  const handleCopyUrl = () => {
    if (!page?.url) return;
    const fullUrl = `${window.location.origin}/publish/${page.url}`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    toast.success("URL copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  // --- Save All Changes ---
  const handleSaveAll = async () => {
    const trimmedName = nameValue.trim();
    if (!trimmedName) {
      toast.error("Page name cannot be empty!");
      return;
    }

    setSaving(true);
    try {
      // 1. Save name, description, URL if changed
      const nameChanged = trimmedName !== originals.name;
      const descChanged = descValue.trim() !== originals.desc;

      if (nameChanged || descChanged) {
        const urlParts = page.url ? page.url.split("/") : [];
        let newUrl = page.url;
        if (nameChanged && urlParts.length >= 3) {
          const newPageSlug = trimmedName.toLowerCase().replace(/\s+/g, "-");
          newUrl = `${urlParts[0]}/${urlParts[1]}/${newPageSlug}`;
        }

        await api.post("/builder/page/rename", {
          pageId: page.pageId,
          name: trimmedName,
          description: descValue.trim(),
          url: newUrl,
        });

        setPage((prev) => ({
          ...prev,
          pageName: trimmedName,
          description: descValue.trim(),
          url: newUrl,
        }));
      }

      // 2. Save meta (favicon, title, meta description) if changed
      const metaChanged =
        faviconValue.trim() !== originals.favicon ||
        titleValue.trim() !== originals.title ||
        metaValue.trim() !== originals.meta;

      if (metaChanged) {
        const pageRes = await api.get(`/builder/page/${pageId}`);
        const rawData = pageRes.data.data || [];

        const newMeta = {
          id: "__pageMeta__",
          favicon: faviconValue.trim() || null,
          title: titleValue.trim() || null,
          meta: metaValue.trim() || null,
        };

        const withoutMeta = rawData.filter((item) => item.id !== "__pageMeta__");
        const updatedData = [newMeta, ...withoutMeta];

        await api.put(`/builder/pages/${pageId}`, { data: updatedData });

        setPage((prev) => ({
          ...prev,
          data: updatedData,
          favicon: newMeta.favicon,
          title: newMeta.title,
          meta: newMeta.meta,
        }));
      }

      // Update originals to reflect saved state
      const newOriginals = {
        name: trimmedName,
        desc: descValue.trim(),
        favicon: faviconValue.trim(),
        title: titleValue.trim(),
        meta: metaValue.trim(),
      };
      setOriginals(newOriginals);

      toast.success("All changes saved!");
    } catch (err) {
      console.log(err);
      toast.error(err.response?.data?.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  // --- Discard Changes ---
  const handleDiscard = () => {
    setNameValue(originals.name);
    setDescValue(originals.desc);
    setFaviconValue(originals.favicon);
    setTitleValue(originals.title);
    setMetaValue(originals.meta);
  };

  // --- Publish / Unpublish ---
  const handlePublish = async () => {
    setPublishing(true);
    try {
      const res = await api.post("/builder/publish", {
        pageId: page.pageId,
        projectId: page.projectId,
      });
      setPage((prev) => ({ ...prev, isPublished: 1 }));
      toast.success(res.data.message || "Page published!");
    } catch (err) {
      console.log(err);
      toast.error(err.response?.data?.message || "Failed to publish page");
    } finally {
      setPublishing(false);
    }
  };

  const handleUnpublish = async () => {
    setPublishing(true);
    try {
      const res = await api.post("/builder/publish/un", {
        pageId: page.pageId,
        projectId: page.projectId,
      });
      setPage((prev) => ({ ...prev, isPublished: 0 }));
      toast.success(res.data.message || "Page unpublished!");
    } catch (err) {
      console.log(err);
      toast.error(err.response?.data?.message || "Failed to unpublish page");
    } finally {
      setPublishing(false);
    }
  };

  const handleOpenPublished = () => {
    if (!page?.isPublished) {
      toast.error("This page is not published yet!");
      return;
    }
    window.open(`${window.location.origin}/publish/${page.url}`, "_blank");
  };

  const countComponents = (components) => {
    if (!components || !Array.isArray(components)) return 0;
    let count = 0;
    for (const comp of components) {
      if (comp.id === "__pageMeta__") continue;
      count++;
      if (comp.children && comp.children.length > 0) {
        count += countComponents(comp.children);
      }
    }
    return count;
  };

  // ── Loading / Not found ──
  if (loading) {
    return (
      <div className="page-settings-container">
        <Loading />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="page-settings-container">
        <div className="page-settings-inner">
          <div className="page-settings-card">
            <p>Page not found.</p>
          </div>
        </div>
      </div>
    );
  }

  const componentCount = countComponents(page.data);
  const lastModified = page.lastModified
    ? format(new Date(page.lastModified), "MMM dd, yyyy 'at' hh:mm a")
    : "N/A";
  const lastModifiedRelative = page.lastModified
    ? formatDistanceToNow(new Date(page.lastModified), { addSuffix: true })
    : "";
  const publishedUrl = page.url
    ? `${window.location.origin}/publish/${page.url}`
    : null;

  return (
    <div className="page-settings-container">
      <div className="page-settings-inner">
        {/* Back Button */}
        <button className="page-settings-back" onClick={() => navigate(`/workspace/${pageId}`)}>
          <ArrowLeft size={14} /> Back to Workspace
        </button>

        {/* Main Card */}
        <div className="page-settings-card">
          {/* Header */}
          <div className="page-settings-header">
            <div className="page-settings-header-icon"><Settings size={22} /></div>
            <div className="page-settings-header-text">
              <h2>Page Settings</h2>
              <p>View details for this page</p>
            </div>
          </div>

          {/* Core Info */}
          <div className="page-settings-section">
            <div className="page-settings-field">
              <label><FileText size={12} /> PAGE NAME</label>
              <input type="text" className="page-settings-input" value={nameValue} onChange={(e) => setNameValue(e.target.value)} placeholder="Enter page name" />
            </div>
            <div className="page-settings-field">
              <label>DESCRIPTION</label>
              <input type="text" className="page-settings-input" value={descValue} onChange={(e) => setDescValue(e.target.value)} placeholder="Enter description" />
            </div>
          </div>

          <div className="page-settings-divider" />

          {/* Status */}
          <div className="page-settings-field">
            <label><Globe size={12} /> STATUS</label>
            <div className="page-settings-status-row">
              <span className={`page-settings-badge ${page.isPublished ? "published" : "draft"}`}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: page.isPublished ? "#16a34a" : "#92400e", display: "inline-block" }} />
                {page.isPublished ? "Published" : "Draft"}
              </span>
              {page.isPublished ? (
                <button className="page-settings-publish-btn unpublish" onClick={handleUnpublish} disabled={publishing}>
                  <Undo2 size={14} /> {publishing ? "..." : "Unpublish"}
                </button>
              ) : (
                <button className="page-settings-publish-btn publish" onClick={handlePublish} disabled={publishing}>
                  <Rocket size={14} /> {publishing ? "..." : "Publish"}
                </button>
              )}
            </div>
          </div>

          {/* Last Modified */}
          <div className="page-settings-field">
            <label><Clock size={12} /> LAST MODIFIED</label>
            <div className="page-settings-timestamp">
              <span>{lastModified}</span>
              {lastModifiedRelative && <span className="relative">({lastModifiedRelative})</span>}
            </div>
          </div>

          <div className="page-settings-divider" />

          {/* SEO & Meta */}
          <div className="page-settings-section">
            <label className="page-settings-section-title"><Search size={14} /> SEO &amp; META</label>

            {/* Favicon */}
            <div className="page-settings-field">
              <label><Image size={12} /> FAVICON</label>
              <div className="page-settings-favicon-row">
                {faviconValue && (
                  <div className="page-settings-favicon-preview">
                    <img src={faviconValue} alt="favicon" onError={(e) => { e.target.style.display = "none"; }} />
                  </div>
                )}
                <input type="text" className="page-settings-input" value={faviconValue} onChange={(e) => setFaviconValue(e.target.value)} placeholder="Enter favicon URL or upload" style={{ flex: 1 }} />
                <button type="button" className="page-settings-browse-btn" onClick={() => faviconFileRef.current?.click()} disabled={uploadingFavicon}>
                  {uploadingFavicon ? <span className="page-settings-spinner" /> : <><Upload size={14} /> Browse</>}
                </button>
                {faviconValue && (
                  <button type="button" className="page-settings-icon-btn cancel" onClick={() => setFaviconValue("")} title="Remove favicon" style={{ width: 34, height: 34 }}>
                    <X size={14} />
                  </button>
                )}
              </div>
              <input ref={faviconFileRef} type="file" accept="image/*" hidden onChange={(e) => handleFaviconFile(e.target.files[0])} />
            </div>

            {/* Page Title & Meta Description */}
            <div className="page-settings-field">
              <label><Type size={12} /> PAGE TITLE</label>
              <input type="text" className="page-settings-input" value={titleValue} onChange={(e) => setTitleValue(e.target.value)} placeholder="Page title (defaults to page name)" />
            </div>
            <div className="page-settings-field">
              <label><Search size={12} /> META DESCRIPTION</label>
              <textarea className="page-settings-textarea" value={metaValue} onChange={(e) => setMetaValue(e.target.value)} placeholder="A brief description for search engines..." rows={3} />
            </div>
          </div>

          <div className="page-settings-divider" />

          {/* Published URL */}
          <div className="page-settings-url-section">
            <label><Link size={14} /> PUBLISHED URL</label>
            {publishedUrl ? (
              <div className="page-settings-url-box">
                <input type="text" className="page-settings-url-input" value={publishedUrl} readOnly />
                <button className="copy-btn" onClick={handleCopyUrl} title="Copy URL">
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            ) : (
              <div className="page-settings-field-value empty">No URL assigned</div>
            )}
          </div>

          {/* Navigation Actions */}
          <div className="page-settings-actions">
            <button className="btn-primary" onClick={() => navigate(`/workspace/${pageId}`)}>
              <ExternalLink size={16} /> Open in Workspace
            </button>
            {page.isPublished && publishedUrl && (
              <button className="btn-secondary" onClick={handleOpenPublished}>
                <ExternalLink size={16} /> View Published Page
              </button>
            )}
          </div>
        </div>

        {/* Sticky Save Bar */}
        {isDirty && (
          <div className="page-settings-save-bar">
            <span className="page-settings-save-bar-text">You have unsaved changes</span>
            <div className="page-settings-save-bar-actions">
              <button className="page-settings-discard-btn" onClick={handleDiscard} disabled={saving}>
                <X size={14} /> Discard
              </button>
              <button className="page-settings-save-btn" onClick={handleSaveAll} disabled={saving}>
                <Save size={14} /> {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PageSettings;
