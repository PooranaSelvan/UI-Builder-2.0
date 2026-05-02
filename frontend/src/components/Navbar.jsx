import React, { useEffect, useRef, useState } from 'react';
import sirpamLogo from '../assets/sirpam-logo.png';
import "./navbar.css";
import Button from './Button';
import { NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import api from "../utils/axios.js";

const Navbar = ({ isAuthenticated, setIsAuthenticated, user }) => {
  const [open, setOpen] = useState(false);
  const [openDropDown, setDropDown] = useState(false);
  let dropDownRef = useRef(null);
  let navigate = useNavigate();

  useEffect(() => {
    const handleOutSideClick = (e) => {
      if (dropDownRef.current && !dropDownRef.current.contains(e.target)) {
        setDropDown(false);
      }
    }

    document.addEventListener("mousedown", handleOutSideClick);
    return () => document.removeEventListener("mousedown", handleOutSideClick);
  }, []);


  const logoutHandler = async () => {
    try {
      let res = await api.get("/auth/logout");
      // console.log(res.data);

      localStorage.removeItem("sirpam-token");
      if (localStorage.getItem("previewComponents")) {
        localStorage.removeItem("previewComponents");
      }
      toast.success(res.data.message, { id: res.data.message });
      setIsAuthenticated(false);
      navigate("/");
    } catch (err) {
      setIsAuthenticated(true);
    }
  }

  return (
    <div className='navbar'>

      {/* Logo */}
      <div className='nav-logo'>
        <img src={sirpamLogo} alt="" className='sirpam-logo' />
        <NavLink to='/' className='nav-heading'>Sirpam</NavLink>
      </div>

      {/* Desktop */}
      <ul className='nav-flex desktop-navbar'>
        <li><NavLink to='/features' className='nav-btns'>Features</NavLink></li>
        <li><NavLink to='/dashboard' className='nav-btns'>Dashboard</NavLink></li>
        <li><NavLink to='/component-editor' className='nav-btns'>Component Editor</NavLink></li>
        <li><NavLink to='/templates' className='nav-btns'>Templates</NavLink></li>
      </ul>
      <div className='nav-flex desktop-navbar'>
        {isAuthenticated ? (
          <>
            <div className="nav-profile-trigger" onClick={(e) => { e.preventDefault(); setDropDown(!openDropDown) }}>
              {user?.profilePhoto ? (
                <img src={user.profilePhoto} alt={user.name} className="nav-avatar-img" />
              ) : (
                <span className="nav-avatar-letter">{user?.name?.charAt(0).toUpperCase()}</span>
              )}
              <ChevronDown size={16} className={`nav-chevron ${openDropDown ? 'nav-chevron-open' : ''}`} />
            </div>

            {openDropDown && (
              <div className="nav-dropdown-overlay" ref={dropDownRef}>
                <div className="nav-dropdown-card">
                  <div className="nav-dropdown-header">
                    {user?.profilePhoto ? (
                      <img src={user.profilePhoto} alt={user.name} className="nav-dropdown-avatar" />
                    ) : (
                      <span className="nav-dropdown-avatar-letter">{user?.name?.charAt(0).toUpperCase()}</span>
                    )}
                    <div className="nav-dropdown-info">
                      <span className="nav-dropdown-name">{user?.name}</span>
                      <span className="nav-dropdown-email">{user?.email}</span>
                    </div>
                  </div>
                  <div className="nav-dropdown-divider" />
                  <button className="nav-dropdown-item" onClick={() => { navigate("/profile"); setDropDown(false); }}>
                    <User size={18} />
                    Profile
                  </button>
                  <button className="nav-dropdown-item nav-dropdown-logout" onClick={() => { logoutHandler(); setDropDown(false); }}>
                    <LogOut size={18} />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <NavLink className='nav-btn nav-btn-primary' to='/login'>Login</NavLink>
            <NavLink className='nav-btn primary-button' to='/signup'>Get Started</NavLink>
          </>
        )}
      </div>


      {/* Mobile Hamburger */}
      <div className="hamburger" onClick={() => setOpen(!open)}>
        {open ? <X size={28} /> : <Menu size={28} />}
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="mobile-menu">
          <NavLink to="/features" onClick={() => setOpen(false)}>Features</NavLink>
          <NavLink to="/dashboard" onClick={() => setOpen(false)}>Dashboard</NavLink>
          <NavLink to="/component-editor" onClick={() => setOpen(false)}>Component Editor</NavLink>
          <NavLink to="/templates" onClick={() => setOpen(false)}>Templates</NavLink>

          {isAuthenticated ? (
            <>
              <div className="nav-profile-trigger" onClick={(e) => { e.preventDefault(); setDropDown(!openDropDown) }}>
                {user?.profilePhoto ? (
                  <img src={user.profilePhoto} alt={user.name} className="nav-avatar-img" />
                ) : (
                  <span className="nav-avatar-letter">{user?.name?.charAt(0).toUpperCase()}</span>
                )}
              </div>

              {openDropDown && (
                <div className="nav-dropdown-overlay" ref={dropDownRef}>
                  <div className="nav-dropdown-card">
                    <div className="nav-dropdown-header">
                      {user?.profilePhoto ? (
                        <img src={user.profilePhoto} alt={user.name} className="nav-dropdown-avatar" />
                      ) : (
                        <span className="nav-dropdown-avatar-letter">{user?.name?.charAt(0).toUpperCase()}</span>
                      )}
                      <div className="nav-dropdown-info">
                        <span className="nav-dropdown-name">{user?.name}</span>
                        <span className="nav-dropdown-email">{user?.email}</span>
                      </div>
                    </div>
                    <div className="nav-dropdown-divider" />
                    <button className="nav-dropdown-item" onClick={() => { navigate("/profile"); setDropDown(false); setOpen(false); }}>
                      <User size={18} />
                      Profile
                    </button>
                    <button className="nav-dropdown-item nav-dropdown-logout" onClick={() => { logoutHandler(); setDropDown(false); setOpen(false); }}>
                      <LogOut size={18} />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="mobile-actions">
              <NavLink className='nav-btn nav-btn-primary' to='/login'>Login</NavLink>
              <NavLink className='nav-btn primary-button' to='/signup'>Get Started</NavLink>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default Navbar;
