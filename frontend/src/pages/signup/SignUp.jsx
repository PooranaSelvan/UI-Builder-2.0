import Button from '../../components/Button';
import { Link, useNavigate } from 'react-router-dom';
import './SignUp.css';
import { Eye, EyeOff, User, Mail, Lock, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import ZohoLogo from "../../assets/zohologo.ico";
import toast from 'react-hot-toast';
import api from "../../utils/axios.js";


const SignUp = ({ isAuthenticated, setIsAuthenticated }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cPassword, setCPassword] = useState("");
  const [terms, setTerms] = useState(false);
  const baseUrl = import.meta.env.VITE_SITE_TYPE === "development" ? import.meta.env.VITE_BACKEND_LOCAL : import.meta.env.VITE_BACKEND_PROD;
  let navigate = useNavigate();

  const handleZohoLogin = () => {
    window.location.href = `${baseUrl}auth/zoho/login`;
  }

  const handleNormalSignUp = async () => {
    if (!name || !email || !password || !cPassword) {
      toast.error("All Fields are Required!", {id : "all-need"});
      return;
    }
    if (password !== cPassword) {
      toast.error("Confirm Password Doesn't Match with your Password!");
      return;
    }

    if (!terms) {
      toast.error("You Should Agree to our Terms & Conditions!");
      return;
    }

    try {
      let res = await api.post(`/users/signup/`, {
        name,
        email,
        password
      });

      localStorage.setItem("sirpam-token", res.data.token);
      setIsAuthenticated(true);
      toast.success(res.data.message);
      navigate("/");
    } catch (err) {
      setIsAuthenticated(false);
      console.log(err);
      toast.error(err.response?.data.message);
    }
  }


  if (isAuthenticated) {
    navigate("/");
  }

  return (

    <>
      <div className="signup-page">
        <div className="signup-card">

          <h2 className="signup-title">Create your account</h2>
          <p className="signup-subtitle">Build powerful Websites.</p>

          <form className="signup-form">

            <label className="input-label">Full Name</label>
            <div className="input-wrapper">
              <input
                type="text"
                placeholder="Enter your name"
                className="signup-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <User className="icon" size={20} />
            </div>


            <label className="input-label">Email Address</label>
            <div className="input-wrapper">
              <input
                type="email"
                placeholder="yourname@gmail.com"
                className="signup-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Mail className="icon" size={20} />
            </div>

            <label className="input-label">Password</label>
            <div className="input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="signup-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Lock size={20} className='icon' />
              <span className='eye-icon' onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <Eye size={15} /> : < EyeOff size={15} />}
              </span>
            </div>

            <label className="input-label">Confirm Password</label>
            <div className="input-wrapper">
              <input
                type={confirmPassword ? "text" : "password"}
                placeholder="••••••••"
                className="signup-input"
                value={cPassword}
                onChange={(e) => setCPassword(e.target.value)}
              />
              <ShieldCheck size={20} className='icon' />

              <span className='eye-icon' onClick={() => setConfirm(!confirmPassword)}>
                {confirmPassword ? <Eye size={15} /> : < EyeOff size={15} />}
              </span>

            </div>

            <div className="terms-container">
              <input type="checkbox" checked={terms} onChange={() => setTerms(!terms)} />
              <span>
                I agree to the <span className="link-text">Terms of Service</span> and &nbsp;
                <span className="link-text">Privacy Policy</span>
              </span>
            </div>

            <Button className="primary-button signup-btn" onClick={handleNormalSignUp}>
              Create Account
            </Button>

            <div className="or-divider">
              <span>OR</span>
            </div>


            <Button type="button" className="google-btn" onClick={handleZohoLogin}>
              <img src={ZohoLogo} alt="" />
              Continue with Zoho
            </Button>

            <p className="login-text">
              Already have an account? &nbsp;
              <Link to="/login" className="link-text">Log in</Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
};

export default SignUp;
