import jwt from "jsonwebtoken";


export const generateToken = (userId) => {
     return jwt.sign(
          { id: userId },
          process.env.JWT_SECRET,
          { expiresIn: "7d" }
     );
};


export const verifyUser = (req, res, next) => {
     try {
          const authHeader = req.headers.authorization;

          if (!authHeader) {
               return res.status(401).json({ message: "Authorization header missing" });
          }

          if (!authHeader.startsWith("Bearer ")) {
               return res.status(401).json({ message: "Invalid token format" });
          }

          const token = authHeader.split(" ")[1];

          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          req.user = decoded;
          next();
     } catch (err) {
          return res.status(401).json({ message: "Unauthorized - Invalid Token" });
     }
};