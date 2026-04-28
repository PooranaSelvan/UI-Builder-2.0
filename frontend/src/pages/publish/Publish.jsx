import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from "react-hot-toast";
import Loading from '../../components/Loading';
import RenderComponents from "../../components/RenderComponents";
import api from "../../utils/axios.js";

const Project = () => {
  const { userName, projectName, pageUrl } = useParams();
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  let navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        let res = await api.get(`/builder/publish/${userName}/${projectName}/${pageUrl}`);

        setComponents(res.data.data || []);
      } catch (error) {
        console.log(error.response);
        if (error.response?.status === 404 || error.response?.status) {
          toast.error(error.response?.data.message);
          navigate("/dashboard");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [pageUrl, navigate]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center" }}>
        <Loading />
      </div>
    );
  }

  if (components.length === 0) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <h2>This page is not developed!</h2>
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

export default Project