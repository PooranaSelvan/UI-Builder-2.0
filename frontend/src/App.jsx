import { useState } from 'react';
import HomePage from './pages/home/HomePage';
import Navbar from './components/Navbar';
import { Route, Routes, useLocation } from "react-router-dom";
import ErrorPage from './pages/error/ErrorPage';
import LoginPage from './pages/login/LoginPage';
import SignUp from './pages/signup/SignUp';
import Workspace from './pages/workspace/Workspace';
import ComponentEditor from './pages/component-editor/ComponentEditor';
import { Toaster } from 'react-hot-toast';
import PreviewCanvas from './pages/workspace/preview/PreviewCanvas';
import { useEffect } from 'react';
import ComponentEditorPreview from "./pages/component-editor/ComponentEditorPreview.jsx";
import { CustomComponentsProvider } from "./context/CustomComponentsContext";
import Dashboard from "./pages/dashboard/Dashboard.jsx";
import Features from "./pages/features/Features.jsx";
import Templates from "./pages/templates/Templates.jsx";
import Profile from "./pages/profile/Profile.jsx";
import Publish from "./pages/publish/Publish.jsx";
import api from "./utils/axios.js";
import TemplatePreview from './pages/templates/TemplatePreview.jsx';
import ScrollToTop from "./components/ScrollToTop.jsx";
import { dashBoardTour, editorTour, homeTour, workspaceTour } from './driverjs/tour.js';


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  let location = useLocation();


  useEffect(() => {
    const checkMe = async () => {
      try {
        let res = await api.get("/checkme");

        if (res.data?.user) {
          setIsAuthenticated(true);
          setUser(res.data.user);
        } else {
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.log(err.response);
        setIsAuthenticated(false);
        setUser(null);
      }
    }

    checkMe();


    let urlToken = new URLSearchParams(window.location.search);
    let token = urlToken.get("token");

    if (token) {
      localStorage.setItem("sirpam-token", token);
      window.history.replaceState({}, document.title, "/");
    }


    // Tour
    let isToured = JSON.parse(localStorage.getItem("sirpam-tour")) || {};

    // console.log(isToured);

    if (isAuthenticated) {
      if (location.pathname === "/" && !isToured.home) {
        homeTour();
      }

      if (location.pathname === "/dashboard" && !isToured.dashboard) {
        dashBoardTour();
      }

      if (location.pathname.includes("workspace") && !isToured.workspace) {
        workspaceTour();
      }

      if (location.pathname === "/component-editor" && !isToured.editor) {
        editorTour();
      }
    }
  }, [isAuthenticated, location.pathname]);



  const hideNavbar = location.pathname.startsWith("/preview") || location.pathname.startsWith("/component-editor-preview") || location.pathname.startsWith("/publish") || location.pathname.startsWith("/template-preview");

  return (
    <CustomComponentsProvider user={user}>
      <>
        {!hideNavbar && (
          <Navbar isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} user={user} />
        )}
        <ScrollToTop />
        <Routes>
          <Route path='/' element={<HomePage isAuthenticated={isAuthenticated} />} />
          <Route path='*' element={<ErrorPage />} />
          <Route path="/signup" element={<SignUp isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />} />
          <Route path='/login' element={<LoginPage isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />} />
          <Route path='/features' element={<Features isAuthenticated={isAuthenticated} />} />
          <Route path='/templates' element={<Templates />} />
          <Route path="/workspace/:pageId" element={<Workspace isAuthenticated={isAuthenticated} />} />
          <Route path="/preview" element={<PreviewCanvas />} />
          <Route path="/component-editor" element={<ComponentEditor />} />
          <Route path="/component-editor-preview" element={<ComponentEditorPreview />} />
          <Route path='/dashboard' element={<Dashboard />} />
          <Route path='/profile' element={<Profile setIsAuthenticated={setIsAuthenticated} />} />
          <Route path='/publish/:userName/:projectName/:pageUrl' element={<Publish />} />
          <Route path='/template-preview/:templateId' element={<TemplatePreview />} />
        </Routes>
        <Toaster />
      </>
    </CustomComponentsProvider>
  )
}

export default App
