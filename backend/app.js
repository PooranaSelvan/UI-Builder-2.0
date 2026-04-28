import express from "express";
import userRoutes from "./routes/userRoutes.js";
import dotenv from "dotenv";
import axios from "axios";
import cors from "cors";
import { generateToken, verifyUser } from "./utils/generateToken.js";
import cookieParser from "cookie-parser";
import componentRoutes from "./routes/componentRoutes.js";
import builderRoutes from "./routes/builderRoutes.js";
import { getUserByEmail, getUserById } from "./utils/finders.js";
import { signUpUserQuery, loginUserQuery } from "./utils/queries.js";
import con from "./db/config.js";
import templateRoutes from "./routes/templateRoutes.js";


const PORT = process.env.PORT || 5000;
const app = express();
dotenv.config();
app.use(cors({
     origin: "*",
     methods: ["GET", "POST", "PUT", "DELETE"],
     allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
let siteUrl = process.env.SITE_TYPE === "development" ? process.env.FRONTEND_LOCALURL : process.env.FRONTEND_PRODURL;



// Default Route
app.get("/", (req, res) => {
     res.send("Close This!");
});


// User Routes
app.use("/users/", userRoutes);
app.use("/components/", componentRoutes);
app.use("/builder/", builderRoutes);
app.use("/template/", templateRoutes);



// Checking Whether the User is Logged in or Not
app.get("/checkme", verifyUser, async (req, res) => {
     let user = await getUserById(req.user.id);

     if (!user) {
          return res.status(404).json({ message: "User not found" });
     }

     res.json({ user });
});



// Zoho Oauth
app.get("/auth/zoho/callback", async (req, res) => {
     try {
          const { code } = req.query;
          if (!code) {
               return res.status(400).send("Auth Code Not Found");
          }

          const tokenRes = await axios.post("https://accounts.zoho.in/oauth/v2/token", null,
               {
                    params: {
                         grant_type: "authorization_code",
                         client_id: process.env.ZOHO_CLIENT_ID,
                         client_secret: process.env.ZOHO_CLIENT_SECRET,
                         redirect_uri: process.env.ZOHO_REDIRECT_URI,
                         code
                    }
               }
          );

          const accessToken = tokenRes.data.access_token;
          const profileRes = await axios.get("https://accounts.zoho.in/oauth/user/info",
               {
                    headers: {
                         Authorization: `Zoho-oauthtoken ${accessToken}`
                    }
               }
          );


          if (profileRes.status === 200) {
               const zohoUser = profileRes.data;
               let user = await getUserByEmail(zohoUser.Email);

               if (user === null || !user) {
                    con.query(signUpUserQuery, [zohoUser.Display_Name, zohoUser.Email, "", false], async (err, result) => {
                         if (err) {
                              if (err.code === "ER_DUP_ENTRY") {
                                   return res.status(401).json({ message: "User Already Exists!" });
                              }

                              return res.status(500).json({ message: err?.sqlMessage, err });
                         }

                         let userId = result.insertId;
                         let token = generateToken(userId);

                         return res.redirect(`${siteUrl}?token=${token}`);
                    });
               } else {
                    con.query(loginUserQuery, [zohoUser.Email], async (err, result) => {
                         if (err) {
                              console.log(err);
                              return res.status(500).json({ message: "Error Occured", err });
                         }

                         if (result.length === 0) {
                              return res.status(401).json({ message: "Invalid Credentials" });
                         }

                         let user = result[0];
                         let token = generateToken(user.userId);

                         return res.redirect(`${siteUrl}?token=${token}`);
                    });
               }
          } else {
               res.status(404).json({ message: "Authentication Failed!" });
          }
     } catch (err) {
          console.error("Zoho login error:", err.response?.data || err.message);
          return res.status(500).json({ error: "Login failed! Try Again Later!" });
     }
});
// Redirecting the User via that UI
app.get("/auth/zoho/login", async (req, res) => {
     let redirectUrl = `https://accounts.zoho.in/oauth/v2/auth?response_type=code&client_id=${process.env.ZOHO_CLIENT_ID}&scope=AaaServer.profile.Read&redirect_uri=${process.env.ZOHO_REDIRECT_URI}&access_type=offline`;
     res.redirect(redirectUrl);
});
app.get("/auth/logout", async (req, res) => {
     try {
          res.clearCookie("authauth", {
               httpOnly: true,
               secure: process.env.NODE_ENV === "production",
               sameSite: "lax"
          });

          return res.status(200).json({ message: "Logout Successful!" });
     } catch (error) {
          return res.status(400).json({ message: "Logout failed!" });
     }
});


// const data = 


// const sql = `insert into templates(templateName, description, data, thumbnail) values(?, ?, ?, ?)`;
// // // const values = ['Portfolio Website', 'A powerful & personal portfolio website.', JSON.stringify(data)];

// con.query(sql, ["Zoho Desk", "Simple Clone of Zoho Desk", JSON.stringify(data), "https://res.cloudinary.com/dohgrufnf/image/upload/48361e47-96bd-4feb-b366-7a135a731cde.png"], (err, results) => {
//   if (err) {
//     console.error('Error inserting JSON:', err);
//   } else {
//     console.log('Inserted template ID:', results.insertId);
//   }
// });



app.listen(PORT, () => {
     console.log("Server is Running on PORT :", PORT);
});