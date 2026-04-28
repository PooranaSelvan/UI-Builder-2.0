import React, { useEffect, useState } from 'react'
import api from '../../utils/axios.js';
import { useNavigate, useParams } from 'react-router-dom';
import Loading from '../../components/Loading.jsx';
import toast from 'react-hot-toast';
import RenderComponents from '../../components/RenderComponents.jsx';


const TemplatePreview = () => {
  const { templateId } = useParams();
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  let navigate = useNavigate();

  useEffect(() => {
    async function fetchDatas() {
      try {
        let res = await api.get(`/template/${templateId}`);

        setComponents(res.data.data[0].data || []);
      } catch (error) {
        console.log(error.response);
        console.log(error.response?.message);
        if (error.response?.status === 404 || error.response?.status) {
          toast.error(error.response?.data.message);
          navigate("/dashboard");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchDatas();
  }, [templateId, navigate]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center" }}>
        <Loading />
      </div>
    );
  }

  return (
    components.length && (
      <RenderComponents>
        {components}
      </RenderComponents>
    )
  )
}

export default TemplatePreview;