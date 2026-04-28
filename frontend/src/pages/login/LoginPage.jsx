import React, { useState } from 'react'
import './LoginPage.css'
import Button from '../../components/Button'
import { Eye } from 'lucide-react';
import { EyeOff } from 'lucide-react';
import ZohoLogo from "../../assets/zohologo.ico";
import { NavLink, useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import api from "../../utils/axios.js";

const buttonStyle = {
    width: '100%',
    padding: '15px',
    backgroundColor: 'var(--primary)',
    fontSize: '14px',
    fontWeight: 'bold',
    borderRadius: '12px'
}

const googleStyle = {
    width: '100%',
    padding: '15px 60px',
    backgroundColor: 'var(--bg-main)',
    fontSize: '16px',
    fontWeight: '400',
    color: 'black',
    border: '2px solid var(--red-200)',
    borderRadius: '12px'
}



const LoginPage = ({ isAuthenticated, setIsAuthenticated }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const baseUrl = import.meta.env.VITE_SITE_TYPE === "development" ? import.meta.env.VITE_BACKEND_LOCAL : import.meta.env.VITE_BACKEND_PROD;
    let navigate = useNavigate();

    const handleZohoLogin = () => {
        window.location.href = `${baseUrl}auth/zoho/login`;
    }

    const handleNormalLogin = async () => {
        if (!email || !password) {
            toast.error("Name & Email are Required!", {id : "all-need"});
            return;
        }

        try {
            let res = await api.post(`/users/login/`, {
                email,
                password
            });

            localStorage.setItem("sirpam-token", res.data.token);
            setIsAuthenticated(true);
            toast.success(res.data.message);
            navigate("/");
        } catch (err) {
            console.log(err.response);
            setIsAuthenticated(false);
            toast.error(err.response?.data.message);
        }
    }

    if (isAuthenticated) {
        navigate("/");
    }

    return (
        <>
            <div className='login-container'>
                <div className='main-container'>
                    <div className="bottom-content">
                        <div className="welcome-text">
                            <h2>Sign in to your account</h2>
                            <h5>Welcome back! Please enter your details.</h5>
                        </div>
                        <form action="">
                            <div className="usermail-container">
                                <label htmlFor="">Email address</label>
                                <input type="email" placeholder='your email' value={email} onChange={(e) => setEmail(e.target.value)} />
                            </div>
                            <div className="password-container">
                                <div className="label-flex">
                                    <label htmlFor="">Password</label>
                                    <a href="#">Forgot password?</a>
                                </div>
                                <div className="input-div">
                                    <input type={showPassword ? 'text' : 'password'} placeholder='••••••••' value={password} onChange={(e) => setPassword(e.target.value)} />
                                    <button type='button' className='eye-button' onClick={() => setShowPassword(prev => !prev)}>{showPassword ? <Eye /> : <EyeOff />} </button>
                                </div>
                            </div>
                            <Button style={buttonStyle} className='btn-login' onClick={handleNormalLogin}>Sign In</Button>
                            <div className='option'>
                                <div className="red-line">

                                </div>
                                <span>or</span>
                                <div className="red-line">

                                </div>
                            </div>
                            <Button style={googleStyle} className='google-btn' onClick={handleZohoLogin}>
                                <img src={ZohoLogo} alt="" />
                                Continue with Zoho
                            </Button>
                        </form>
                        <p style={{ marginTop: "30px", fontSize: "14px" }}>Don't have an account? <NavLink to='/signup'>Create.</NavLink></p>
                    </div>
                </div>
            </div>
        </>
    )
}

export default LoginPage