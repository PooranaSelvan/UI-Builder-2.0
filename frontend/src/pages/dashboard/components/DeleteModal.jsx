import React from 'react';
import "./deletemodal.css";
import { AlertCircle, Trash2 } from 'lucide-react';

const DeleteModal = ({title, onCancel, onDelete }) => {
     return (
          <div className="delete-modal-overlay">
               <div className="delete-modal">

                    <div className="delete-header">
                         <div className="delete-icon">
                              <AlertCircle size={22} />
                         </div>
                         <h3>Delete {title}</h3>
                    </div>

                    <p className="delete-description">
                         Are you sure you want to delete this {title}?
                    </p>

                    <div className="delete-modal-actions">
                         <button className="cancel-btn" onClick={onCancel}>
                              No
                         </button>

                         <button className="confirm-btn" onClick={onDelete}>
                              <Trash2 size={16} />
                              Yes
                         </button>
                    </div>

               </div>
          </div>
     )
}

export default DeleteModal