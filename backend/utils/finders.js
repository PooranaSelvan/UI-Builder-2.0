import con from "../db/config.js";
import { selectProjectById, selectUserByEmail, selectUserById } from "./queries.js";


export const getProjectById = (projectId) => {
     return new Promise((resolve, reject) => {
          con.query(selectProjectById, [projectId], (err, result) => {
               if (err) {
                    console.log(err);
                    return reject(err);
               }

               if (result.length === 0) {
                    return resolve(null);
               }

               resolve(result[0]);
          });
     });
}


export const getUserById = (userId) => {
     return new Promise((resolve, reject) => {
          con.query(selectUserById, [userId], (err, result) => {
               if (err) {
                    console.log(err);
                    return reject(err);
               }

               if (result.length === 0) {
                    return resolve(null);
               }

               resolve(result[0]);
          });
     });
}


export const getUserByEmail = (email) => {
     return new Promise((resolve, reject) => {
          con.query(selectUserByEmail, [email], (err, result) => {
               if (err) {
                    console.log(err);
                    return reject(err);
               }

               if (result.length === 0) {
                    return resolve(null);
               }

               resolve(result[0]);
          });
     });
}