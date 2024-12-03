import jwt from "jsonwebtoken";

const AuthToken = (req,res,next) =>{
    const token = req.header("Authorization");
    // function parseJwt (token) {
    //     return JSON.parse(Buffer.from(token.split('B')[1], 'base64').toString());
    // }
    // const tt = parseJwt(token);
    // console.log("Kariyu ne", tt);
    if (!token || !token.includes("Bearer")) {
        return res.status(401).json({ message: "No token found !" });
    }
    let aToken = token.split('Bearer ')[1];
    jwt.verify(aToken, process.env.JWT_SECRET || "JWT_SECRET", (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Invalid token !" });
        }else{
            // console.log("first",decoded)

            req.email = decoded.data.email;
            next();
        }
    });
}

export default AuthToken;
