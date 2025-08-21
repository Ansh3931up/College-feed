import app from "./app.js";
import connectdb from "../database/connectdb.js";

const PORT = process.env.PORT || 5000;

console.log("Starting server...");

connectdb()
.then(() => {
    console.log("Database connected successfully");
    app.listen(PORT, () => {
        console.log(`✅ Server running successfully on port ${PORT}`);
        console.log(`🌐 API URL: http://localhost:${PORT}`);
        console.log(`📍 Health check: http://localhost:${PORT}/ping`);
    });
})
.catch((error) => {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
});