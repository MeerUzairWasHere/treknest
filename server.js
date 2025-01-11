//third party import
import * as dotenv from "dotenv";
dotenv.config();
import "express-async-errors";
import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cloudinary from "cloudinary";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";

// public
import { dirname } from "path";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

//local import

//  routers
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";
import packageRouter from "./routes/packageRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import dashboardRouter from "./routes/dashboardRoutes.js";

//connect db
import connectDB from "./db/connect.js";

//error handlers
import notFoundMiddleware from "./middleware/not-found.js";
import errorHandlerMiddleware from "./middleware/error-handler.js";
import { StatusCodes } from "http-status-codes";

//applying thirdparty middlewares
const app = express();
app.use(express.json());
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(cookieParser(process.env.COOKIE_SECRET));

app.use(express.static(path.resolve(__dirname, "./client/dist")));

//security packages
app.use(helmet());
app.use(helmet({ crossOriginEmbedderPolicy: false, originAgentCluster: true }));
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      "img-src": [
        "'self'",
        "data:",
        "https://trek-nest-travels.onrender.com/",
        "https://res.cloudinary.com/",
        "https://www.google-analytics.com",
      ],
    },
    reportOnly: false,
  })
);
app.use(mongoSanitize());

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

app.get("/api/v1/health", (req, res) => {
  res.status(StatusCodes.OK).json({ msg: "Server is running!" });
});
// public routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/packages", packageRouter);
app.use("/api/v1/booking", bookingRouter);
app.use("/api/v1/dashboard", dashboardRouter);

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "./client/dist", "index.html"));
});

//handling errors
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3001;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URL);
    console.log(`Mongo database is connected!!!`);

    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();

// // Schedule health check
// cron.schedule("*/14 * * * *", async () => {
//   try {
//     const response = await axios.get(
//       `https://trek-nest-travels.onrender.com/api/v1/health`
//     );
//     console.log(`Health check successful: ${response.data.msg}`);
//   } catch (error) {
//     console.error(`Health check failed: ${error.message}`);
//   }
// });
