import React from 'react';
import "./footer.css";
import sirpamLogo from '../assets/sirpam-logo.png';
import { Link, NavLink } from 'react-router-dom';
import { Twitter, Github, Linkedin } from 'lucide-react';

const Footer = () => {
     return (
          <div className='footer-wrapper'>
               <div className="footer-content">
                    <div className="footer-info">
                         <div>
                              <img src={sirpamLogo} alt="" className='sirpam-logo' />
                              <Link to='/' className='nav-heading'>Sirpam</Link>
                         </div>
                         <p>Empowering developers to design and deploy custom UIs without code.</p>
                         <div>
                              <Twitter className='footer-icon' size={45} fill='var(--red-100)' color='var(--primary)' />
                              <Github className='footer-icon' size={45} fill='var(--red-100)' color='var(--primary)' />
                              <Linkedin className='footer-icon' size={45} fill='var(--red-100)' color='var(--primary)' />
                         </div>
                    </div>
                    <div className="footer-product">
                         <h3>Product</h3>
                         <NavLink to='/features'>Features</NavLink>
                         <NavLink to='/dashboard'>Dashboard</NavLink>
                         <NavLink to='/component-editor'>Component Editor</NavLink>
                         <NavLink to='/templates'>Templates</NavLink>
                    </div>
               </div>

               <div className='footer-line'></div>

               <div className="footer-copyright">
                    <p>© 2026 Sirpam. All rights reserved.</p>
               </div>
          </div>
     )
}

export default Footer