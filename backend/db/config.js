import mysql from "mysql2";
import dotenv from "dotenv";
dotenv.config();

const con = mysql.createConnection({
     host : process.env.DB_HOSTNAME,
     port: process.env.DB_PORT,
     user : process.env.DB_USERNAME,
     password : process.env.DB_PASSWORD,
     database : "sirpam-ui-builder"
});


con.connect(err => {
     if(err){
          console.log(err);
     } else {
          console.log("Database Connected Successfully!");
     }
});

export default con;