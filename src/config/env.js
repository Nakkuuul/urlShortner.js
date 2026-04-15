import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT;

if(!PORT) {
    throw new Error("PORT is not available in .env");
}

export default {
    PORT
}