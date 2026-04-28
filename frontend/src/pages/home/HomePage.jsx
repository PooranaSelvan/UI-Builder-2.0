import React, { useState } from 'react'
import Button from '../../components/Button';
import "../../index.css";
import "./homePage.css";
import "./canvas.css";
import { LayoutDashboard, Layers2, Rocket, ChevronDown, ArrowUpRight, Play, X } from 'lucide-react';
import Footer from '../../components/Footer';
import { useNavigate } from 'react-router-dom';
import demoVideo from "../../assets/demo.mp4";


const HomePage = ({ isAuthenticated }) => {
  let navigate = useNavigate();
  const [openVideo, setOpenVideo] = useState(false);

  const stepsData = [
    {
      number: 1,
      icon: <LayoutDashboard size={30} fill='white' color='red' strokeWidth={2} />,
      heading: "Choose Template",
      description: "Start with a pre-built template or create one from scratch. Pick your perfect starting point."
    },
    {
      number: 2,
      icon: <Layers2 size={30} fill='white' color='red' strokeWidth={2} />,
      heading: "Drag & Drop",
      description: "Add buttons, forms, layouts, and more by simply dragging them onto your canvas."
    },
    {
      number: 3,
      icon: <Rocket size={30} fill='white' color='red' strokeWidth={2} />,
      heading: "Deploy Instantly",
      description: "Click deploy to make your app live instantly. Share it with your audience."
    }
  ];


  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      navigate("/signup");
    }
  }


  const handleOpenDemo = () => {
    setOpenVideo(true);
  }

  return (
    <div className='home-wrapper'>
      {/* Home Hero */}
      <div className="home-hero">
        <div className="home-gradient-round-blur"></div>
        <div className="home-hero-wrapper">
          <div className="home-hero-content">
            <h1>Build Custom UI <span className="gradient-text">10x Faster</span></h1>
            <p>
              Drag and drop components and deploy custom apps for you in minutes, not weeks.
              <span className='gradient-text'> Secure, scalable, and fully customizable.</span>
            </p>
            <div className='home-hero-btns'>
              <Button className='primary-button get-started-btn' id="start-build" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 32px", fontSize: "16px", fontWeight: "600" }} onClick={handleGetStarted}>
                Start Building <ArrowUpRight size={20} />
              </Button>
              <Button className='video-btn' id="demo-btn" onClick={handleOpenDemo}>
                Watch Demo <Play size={20} />
              </Button>
            </div>
          </div>

          {openVideo && (
            <div className="demo-modal" onClick={() => setOpenVideo(false)}>
              <Button onClick={() => setOpenVideo(false)} className='demo-close'>
                <X size={20} />
                Close
              </Button>
              <iframe src={demoVideo} title="Demo Video" className='demo-frame'></iframe>
            </div>
          )}

          {/* Canvas */}
          <div className="canvas-wrapper">
            <div className="ui-builder-container">
              {/* Animated Rings - Behind */}
              <div className="ring-container">
                <div className="ring"></div>
                <div className="ring inner"></div>
              </div>

              <div className="main-window">
                {/* Header */}
                <div className="window-header">
                  <div className="window-controls">
                    <div className="control-dot red"></div>
                    <div className="control-dot yellow"></div>
                    <div className="control-dot green"></div>
                  </div>
                  <div className="url-bar">
                    <span className="material-symbols-outlined">public</span>
                    sirpam.app/my-project
                  </div>
                </div>

                <div className="content-area">
                  {/* Left Sidebar */}
                  <div className="left-sidebar">
                    <div className="sidebar-icon active">
                      <span className="material-symbols-outlined">widgets</span>
                    </div>
                    <div className="sidebar-icon">
                      <span className="material-symbols-outlined">format_shapes</span>
                    </div>
                    <div className="sidebar-icon">
                      <span className="material-symbols-outlined">image</span>
                    </div>
                    <div className="sidebar-icon">
                      <span className="material-symbols-outlined">code</span>
                    </div>
                    <div className="sidebar-icon settings">
                      <span className="material-symbols-outlined">settings</span>
                    </div>
                  </div>

                  {/* Canvas */}
                  <div className="canvas-area">
                    <div className="glass-card">
                      <div className="card-header">
                        <div className="card-header-left">
                          <div className="avatar">S</div>
                          <div>
                            <div className="card-title">Dashboard</div>
                            <div className="card-subtitle">Analytics Overview</div>
                          </div>
                        </div>
                        <span className="material-symbols-outlined">more_horiz</span>
                      </div>
                      <div className="mini-chart">
                        <div className="chart-bar"></div>
                        <div className="chart-bar"></div>
                        <div className="chart-bar"></div>
                        <div className="chart-bar"></div>
                        <div className="chart-bar"></div>
                        <div className="chart-bar"></div>
                        <div className="chart-bar"></div>
                      </div>
                      <div className="stats-row">
                        <div className="stat-item red">
                          <div className="stat-value">2.4K</div>
                          <div className="stat-label">Views</div>
                        </div>
                        <div className="stat-item green">
                          <div className="stat-value">+18%</div>
                          <div className="stat-label">Growth</div>
                        </div>
                        <div className="stat-item blue">
                          <div className="stat-value">847</div>
                          <div className="stat-label">Users</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Sidebar */}
                  <div className="home-right-panel">
                    <div className="panel-title">Properties</div>
                    <div className="property-group">
                      <div className="property-label">Background</div>
                      <div className="color-options">
                        <div className="color-swatch red active"></div>
                        <div className="color-swatch blue"></div>
                        <div className="color-swatch green"></div>
                        <div className="color-swatch purple"></div>
                      </div>
                    </div>
                    <div className="property-group">
                      <div className="property-label">Border Radius</div>
                      <div className="slider-track">
                        <div className="slider-fill w-75"></div>
                      </div>
                    </div>
                    <div className="property-group">
                      <div className="property-label">Shadow</div>
                      <div className="slider-track">
                        <div className="slider-fill w-50"></div>
                      </div>
                    </div>
                    <div className="property-group">
                      <div className="property-label">Opacity</div>
                      <div className="slider-track">
                        <div className="slider-fill w-100"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Bar */}
                <div className="bottom-bar">
                  <div className="action-buttons">
                    <button className="btn btn-secondary">Preview</button>
                    <button className="btn primary-button">
                      <span className="material-symbols-outlined">rocket_launch</span>
                      Deploy
                    </button>
                  </div>
                </div>
              </div>

              {/* Floater */}
              <div className="floating-notification">
                <div className="notification-content">
                  <div className="notification-icon">
                    <span className="material-symbols-outlined">check_circle</span>
                  </div>
                  <div>
                    <div className="notification-title">Live Preview</div>
                    <div className="notification-subtitle">Changes saved</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="canvas-gradient-round-blur"></div>

        <div className="scrollToExplore">
          <p>Scroll to Explore</p>
          <ChevronDown />
        </div>
      </div>

      {/* How it Works */}
      <div className="steps">
        <h1>
          How It
          <span className='step-gradient'> Works</span>
        </h1>
        <p>Three simple steps to transform your workflow and build amazing interfaces.</p>

        <div className="steps-cards">
          {stepsData.map(ele => (
            <div className='steps-card' key={ele.number}>
              <div className="step-icon">{ele.icon}</div>
              <h2 className='step-heading'>{ele.heading}</h2>
              <p>{ele.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Get Started */}
      <div className="get-started">
        <div className="starter-card">
          <h1>
            Ready to build your
            <span className='starter-gradient'>Next Tool?</span>
          </h1>
          <p>Join thousands who are building faster with Sirpam.</p>
          <Button style={{ display: "flex", alignItems: "center", gap: "10px", padding: "15px 30px", fontSize: "18px", color: "var(--primary)", backgroundColor: "white", borderRadius: "12px", fontWeight: "600" }} onClick={handleGetStarted}>
            Get Started <ArrowUpRight size={25} />
          </Button>
        </div>
        <div className="starter-pattern"></div>
      </div>
      <Footer />
    </div>
  )
}

export default HomePage;