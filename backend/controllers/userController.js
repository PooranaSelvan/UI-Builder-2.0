import con from "../db/config.js";
import validator from "validator";
import { deleteAllProjectsQuery, deleteUserQuery, loginUserQuery, signUpUserQuery } from "../utils/queries.js";
import { generateToken } from "../utils/generateToken.js";
import bcrypt from "bcrypt";
import { getUserById } from "../utils/finders.js";

const registerUser = async (req, res) => {
     let { name, email, password } = req.body;

     if (!name || !email || !password) {
          return res.status(400).json({ message: "All fields are required!" });
     }

     if (name.length < 3) {
          return res.status(400).json({ message: "Name Must be More than 3 Characters!" });
     }
     if (!validator.isEmail(email)) {
          return res.status(400).json({ message: "Invalid Email Format!" });
     }
     if (!validator.isStrongPassword(password)) {
          return res.status(400).json({ message: "Not a Strong Password!" });
     }

     try {
          let hashedPassword = bcrypt.hashSync(password, 12);

          con.query(signUpUserQuery, [name, email, hashedPassword, false], async (err, result) => {
               if (err) {
                    if (err.code === "ER_DUP_ENTRY") {
                         return res.status(401).json({ message: "Registration failed! Try again Later!" });
                    }

                    return res.status(500).json({ message: err?.sqlMessage, err });
               }

               let userId = result.insertId;

               let token = generateToken(userId);

               return res.status(200).json({ token, message: "SignUp Successful!" });
          });
     } catch (error) {
          console.log(error);
     }

}

const loginUser = async (req, res) => {
     const { email, password } = req.body;

     if (!email || !password) {
          return res.status(400).json({ message: "Email and password required" });
     }
     if (!validator.isEmail(email)) {
          return res.status(400).json({ message: "Invalid Email Format!" });
     }

     con.query(loginUserQuery, [email], async (err, result) => {
          if (err) {
               console.log(err);
               return res.status(500).json({ message: "Error Occured", err });
          }

          if (result.length === 0) {
               return res.status(401).json({ message: "Invalid Credentials" });
          }

          let user = result[0];
          let isValidUser = await bcrypt.compare(password, user.password);

          if (!isValidUser) {
               return res.status(401).json({ message: "Invalid Credentials" });
          }

          let token = generateToken(user.userId);


          if (result.length > 0) {
               return res.status(200).json({ token, message: "Login Successful!" });
          }
     });
}


const deleteUser = async (req, res) => {
     const { userId } = req.body;

     if (!userId) {
          return res.status(400).json({ message: "All fields are required!" });
     }

     let user = getUserById(userId);

     if (user === null) {
          return res.status(400).json({ message: "Invalid User!" });
     }

     con.query(deleteAllProjectsQuery, [userId], (err, result) => {
          if (err) {
               return res.status(500).json({ message: err?.sqlMessage, err });
          }

          con.query(deleteUserQuery, [userId], (err, result) => {
               if (err) {
                    return res.status(500).json({ message: err?.sqlMessage, err });
               }

               return res.status(200).json({ message: "Account Deleted Successfully!" });
          });
     });
}


export { registerUser, loginUser, deleteUser };