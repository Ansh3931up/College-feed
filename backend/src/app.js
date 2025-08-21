import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import bodyParser from "body-parser";
import ApiResponse from "../utilities/ApiResponse.js";
import morgan from "morgan";

import userRouter from "../routes/user.routes.js";
import feedRouter from "../routes/feed.routes.js";


// Configure environment variables
dotenv.config();

const app = express();

// CORS configuration
const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(morgan('dev'));

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Cookie parser
app.use(cookieParser());

// Static files
app.use(express.static("public"));

// Health check route
app.get("/ping", function (req, res) {
    console.log("Pong");
    return res.status(200).json(new ApiResponse(200, null, "Hello pong"));
});

// API routes
app.use("/api/v1/user", userRouter);
app.use("/api/v1/feed", feedRouter);

// Default route
app.get('/', (req, res) => {
    res.status(200).json(new ApiResponse(200, null, "College Feed API is running!"));
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json(new ApiResponse(404, null, "Route not found"));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json(new ApiResponse(500, null, "Something went wrong!"));
});

export default app;