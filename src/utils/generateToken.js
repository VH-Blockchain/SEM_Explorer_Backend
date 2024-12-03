import jwtt from 'jsonwebtoken';
import dotenv from 'dotenv'

dotenv.config();


const GenrateToken = async (data) => {
    console.log("secret:", process.env.JWT_SECRET);
    console.log("data of generatetoken :", data);
    const expirationTimeInSeconds = Math.floor(Date.now() / 1000) + 2 * 24 * 60 * 60;
    const temp = jwtt.sign({ data,expirationTimeInSeconds }, process.env.JWT_SECRET || 'JWT_SECRET',)

    return temp;
};



export default GenrateToken;