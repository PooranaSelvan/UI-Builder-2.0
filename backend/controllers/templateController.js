import con from "../db/config.js";
import { getAllTemplatesQuery, getSpecificTemplateQuery } from "../utils/queries.js";


const getAllTemplates = async (req, res) => {
     con.query(getAllTemplatesQuery, (err, result) => {
          if (err) {
               console.log("SQL ERROR:", err);
               return res.status(500).json({ message: err?.sqlMessage, error: err });
          }

          if (result.length === 0) {
               return res.status(200).json({ message: "No Templates Found!", data: [] });
          }

          return res.status(200).json({ data: result, message: "Templates Fetched Successfully!" });
     });
}


const getSpecificTemplate = async (req, res) => {
     const { templateId } = req.params;

     if (!templateId) {
          return res.status(400).json({ message: "All fields are Required!" });
     }

     con.query(getSpecificTemplateQuery, [templateId], (err, result) => {
          if (err) {
               console.log("SQL ERROR:", err);
               return res.status(500).json({ message: err?.sqlMessage, error: err });
          }

          if (result.length === 0) {
               return res.status(200).json({ message: "Template Not Found!", data: [] });
          }

          return res.status(200).json({ data: result, message: "Template Fetched Successfully!" });
     });
}


export { getAllTemplates, getSpecificTemplate };