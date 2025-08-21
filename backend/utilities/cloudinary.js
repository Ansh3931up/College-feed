import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: "dyk154dvi",
    api_key: "865648221428778",
    api_secret: "Wv8AEVcz1I2E69fstVEVqOD1smw",
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null; // If no local file path provided, return null

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto", // Adjusted from response_type to resource_type
        });

        console.log("File uploaded successfully to Cloudinary:", response.url);
        return response;
    } catch (error) {
        console.error("Error uploading file to Cloudinary:", error.message);
        fs.unlinkSync(localFilePath); // Remove the locally saved temporary file as the upload failed
        throw new Error("Failed to upload file to Cloudinary");
    }
};

export { uploadOnCloudinary };