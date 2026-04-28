import { createContext, useState, useEffect, useContext } from "react";
import toast from "react-hot-toast";
import api from "../utils/axios.js";

export const CustomComponentsContext = createContext(null);

export const CustomComponentsProvider = ({ children, user }) => {
  const [customComponents, setCustomComponents] = useState([]);

  // FETCH COMPONENTS
  const fetchCustomComponents = async () => {


    if (!user?.userId) return;

    try {
      const res = await api.get(`/builder/components/${user.userId}`);

      const normalized = (res.data.components || []).map(c => ({
        _id: c.id,
        componentName: c.componentName || "Unnamed Component",
        icon: c.icon || "Square",
        data: typeof c.data === "string" ? c.data : JSON.stringify(c.data),
      }));

      setCustomComponents(normalized);
    } catch (err) {
      console.error(err);
    }
  };


  useEffect(() => {
    if (user?.userId) fetchCustomComponents();
  }, [user]);

  // CREATE
  const addCustomComponent = async (payload) => {
    if (!user?.userId) return null;

    try {
      await api.post("/builder/components", { userId: user.userId, ...payload });
      await fetchCustomComponents();
      return true;
    } catch (err) {
      console.error(err);
      return null;
    }
  };


  // DELETE
  const deleteCustomComponent = async (componentId) => {
    if (!user?.userId) return;

    try {
      await api.delete(`/builder/components/${componentId}`, {
        data: { userId: user.userId }
      });

      setCustomComponents(prev => prev.filter(c => c._id !== componentId));
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete component", {id : "delete-custom"});
    }
  };

  //UPDATE
  const updateCustomComponent = async (componentId, payload) => {
    if (!componentId) return false;

    const body = {
      data: payload.data,
    };

    if (payload.componentName !== undefined && payload.componentName !== null) {
      body.componentName = payload.componentName;
    }

    if (payload.icon !== undefined && payload.icon !== null) {
      body.icon = payload.icon;
    }

    try {
      await api.put(
        `/builder/components/${componentId}`,
        body
      );

      await fetchCustomComponents();
      return true;

    } catch (error) {
      console.error("Update failed:", error.response?.data || error.message);
      toast.error("Failed to update component", {id : "update-custom"});
      return false;
    }
  };

  return (
    <CustomComponentsContext.Provider
      value={{
        customComponents,
        addCustomComponent,
        deleteCustomComponent,
        updateCustomComponent
      }}

    >
      {children}
    </CustomComponentsContext.Provider>
  );
};

export const useCustomComponents = () => {
  return useContext(CustomComponentsContext);
};
