const jwt = require('jsonwebtoken');

const config = process.env;

const verifyToken = (req, res, next) => {
    const token = req.headers["authorization"];
    if (!token) {
      return res.status(404).json({ success: false, message: "A token is required for authentication" });   
    }
    try {
      const decoded = jwt.verify(token, config.JWT_SECRET_KEY);
      req.user = decoded;
    } catch (err) {
        return res.status(401).json({success:false,message:"Invalid Token"});
    }
    return next();
};

module.exports = {verifyToken};
