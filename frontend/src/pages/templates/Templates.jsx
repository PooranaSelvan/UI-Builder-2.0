import React, { useEffect, useState } from 'react'
import TemplateCard from './TemplateCard'
import "./templates.css";
import Footer from "../../../src/components/Footer";
import { useNavigate } from 'react-router-dom';
import api from '../../utils/axios';
import toast from 'react-hot-toast';
import Loading from "../../components/Loading";
import Button from '../../components/Button';
import { ArrowUpRight } from 'lucide-react';

const Templates = () => {
  let navigate = useNavigate();
  const [templates, setTemplates] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDatas() {
      try {
        let res = await api.get("/template");
        setTemplates(res.data.data);
      } catch (error) {
        console.log(error);
        console.log(error.response);
        toast.error(error.response?.message);
      } finally {
        setLoading(false);
      }
    }

    fetchDatas();
  }, [navigate]);

  if (loading) {
    return (
      <div style={{ height: "90vh", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center" }}>
        <Loading />
      </div>
    );
  }

  return (
    <>
      <div className='template-wrapper'>
        <div className="template-header">
          <h1>Choose a template to <span>Start Building</span></h1>
        </div>
        <div className="template-container">
          {
            templates.map(ele => (
              <TemplateCard key={ele.templateId} name={ele.templateName} thumbnail={ele.thumbnail} description={ele.description} pageId={ele.templateId} onSelect={() => navigate("/dashboard", { state: { template: ele } })} />
            ))
          }
        </div>
        <p>More Templates Coming Soon. Stay Tuned..</p>
      </div>
      <Footer />
    </>
  )
}

export default Templates