//third party import
import * as dotenv from "dotenv";
dotenv.config();

const config = {
  host: "smtp.gmail.com",
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
};

export default config;
