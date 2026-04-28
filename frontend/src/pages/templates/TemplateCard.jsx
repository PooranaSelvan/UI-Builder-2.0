import React from 'react'
import sales from "./assets/sales.png"
import "./templateCard.css"
import { Eye, ExternalLink } from 'lucide-react'
import Button from '../../components/Button.jsx'
import { Link } from 'react-router-dom'

const TemplateCard = ({ name, description, thumbnail, pageId, onSelect }) => {
    return (
        <div className="template-card">
            <div className="image-part">
                <img src={thumbnail} alt="template" className='template-img' />
            </div>
            <div className="template-content">
                <div className="content-part">
                    <h3 className='template-heading'>{name}</h3>
                    <p className='template-description'>{description}</p>
                </div>
                <div className="button-part">
                    <Link className='btn-view' to={`/template-preview/${pageId}`} target='_blank'><Eye size={16} />View Page</Link>
                    <Button className='btn-open' onClick={onSelect}>
                        <ExternalLink size={16} /> Use Template 
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default TemplateCard 