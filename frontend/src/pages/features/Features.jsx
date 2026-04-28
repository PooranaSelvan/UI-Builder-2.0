import React from 'react';
import "./features.css";
import Footer from '../../components/Footer.jsx';
import Button from '../../components/Button.jsx';
import { MoveRight, Check, ArrowUpRight } from 'lucide-react';
import float from './assets/float.png';
import publish from './assets/publish.png';
import { useNavigate } from 'react-router-dom';


const Features = ({ isAuthenticated }) => {
  let navigate = useNavigate();

  const handleNavigate = () => {
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  }

  return (
    <>
      <div className="feature-container">
        <div className="heading-section">
          <div className="heading-content">
            <h1>Build powerful websites <span>without limits.</span></h1>
          </div>
          <div className="heading-text">
            <p>Design and launch websites at the speed of thought. A minimalist canvas for maximum productivity.</p>
          </div>
          <div className="heading-btn">
            <Button onClick={handleNavigate} className='build-btn'>Start Building <ArrowUpRight size={20} /></Button>
          </div>
        </div>
        <div className="features">
          <div className="features-content">
            <div className="feature-image">
              <div className="floating-box">
                <img src={float} alt="float-animation" />
              </div>
            </div>
            <div className="feature-text">
              <span>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"></path>
                </svg>
                <p>Visual Builder</p>
              </span>
              <h2><span>Effortlessly</span> design <br /> pixel-perfect Sites.</h2>
              <p>Create exceptional interfaces with : </p>
              <ul>
                <li>
                  <span className='check'><Check size={14} /></span>
                  Drag and drop components
                </li>
                <li>
                  <span className='check'><Check size={14} /></span>
                  Auto-responsive layouts
                </li>
                <li>
                  <span className='check'><Check size={14} /></span>
                  Pre-built templates
                </li>
              </ul>
            </div>
          </div>
          <div className="features-content">
            <div className="feature-text">
              <span>
                <span id='publish-dot'></span>
                <p>Visual Builder</p>
              </span>
              <h2>Publish instantly</h2>
              <p>Go live with a single click. Your updates are available immediately upon publishing.</p>
            </div>
            <div className="feature-image publish-image">
              <div className="floating-box publish-float">
                <img src={publish} alt="float-animation" id='publish' />
              </div>
            </div>
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
            <Button style={{ display: "flex", alignItems: "center", gap: "10px", padding: "15px 30px", fontSize: "18px", color: "var(--primary)", backgroundColor: "white", borderRadius: "12px", fontWeight: "600" }} onClick={handleNavigate}>
              Get Started <ArrowUpRight size={25} />
            </Button>
          </div>
          <div className="starter-pattern"></div>
        </div>
      </div>
      <Footer></Footer>
    </>
  )
}

export default Features