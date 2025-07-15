import jwt from "jsonwebtoken";

export default async function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const decodedToken = jwt.verify(
      token,
      process.env.JWT_SECRET,
      function (err, decoded) {
        if (err) {
          return res.status(401).json({ message: "Unauthorized" });
        }
        return decoded;
      }
    );
    req.headers.user = decodedToken;
    next();
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: JSON.stringify(error) });
  }
}
