import React from 'react';
import "./loading.css";

const Loading = () => {
     return (
          <div className="loading-wrapper">
               <div className="blocks">
                    <div className="block"></div>
                    <div className="block"></div>
                    <div className="block"></div>
                    <div className="block"></div>
               </div>
               <p>Loading...</p>
          </div>
     )
}

export default Loading