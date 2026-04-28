import React from "react";
import "./errorPage.css";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import errorImage from "../../assets/error-msg.png";

const ErrorPage = () => {
     let navigate = useNavigate();

     let classes = [
          "warning-float",
          "error-float",
     ];

     let symbols = {
          warning: "⚠️",
          error: "❗",
     };

     return (
          <div className="error-container">
               <div className="error-card">
                    <div className="code-container">
                         <h1 className="error-code error-four">4</h1>
                         <h1 className="error-code error-zero">0</h1>
                         <h1 className="error-code error-four">4</h1>
                    </div>
                    <h2 className="error-title">Page Not Found</h2>
                    <button style={{ padding: "10px 20px", borderRadius: "8px", fontSize: "14px", fontWeight: "600" }} className="primary-button" onClick={() => navigate("/")}>
                         Go Back Home
                    </button>
               </div>

               {Array.from({ length: 4 }).map((ele, i) => {
                    let className = classes[i % classes.length];
                    let data = className.includes("warning") ? symbols.warning : symbols.error;

                    let positions = [
                         { top: 50, left: 300 },
                         { top: 200, left: 500 },
                         { top: 100, left: 1300 },
                         { top: 300, left: 1200 }
                    ];

                    let position = positions[i % positions.length];

                    return <div key={i} className={className} style={{ top: position.top, left: position.left }}> {data} </div>
               })}
          </div>
     );
};

export default ErrorPage;