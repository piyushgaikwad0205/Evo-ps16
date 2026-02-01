const multer = require("multer");
const path = require("path");
const fs = require("fs");

let useCloudinary = false;
let storage;

try {
    const { CloudinaryStorage } = require("multer-storage-cloudinary");
    const cloudinary = require("../../config/cloudinary");

    const config = cloudinary.config();
    if (config.cloud_name && config.api_key && config.api_secret) {
        storage = new CloudinaryStorage({
            cloudinary: cloudinary,
            params: async (req, file) => {
                const isVideo = file.mimetype.startsWith("video/");
                const isAudio = file.mimetype.startsWith("audio/");
                const isImage = file.mimetype.startsWith("image/");

                let resource_type = "raw";
                if (isImage) resource_type = "image";
                if (isVideo) resource_type = "video";
                if (isAudio) resource_type = "video"; // Cloudinary treats audio as video/resource_type 'video' often works best for streaming

                return {
                    folder: "campus-connects/messages",
                    resource_type: resource_type,
                    public_id: `${file.fieldname}-${Date.now()}`
                };
            },
        });
        useCloudinary = true;
    } else {
        throw new Error('Cloudinary not configured');
    }
} catch (error) {
    console.log('Using local storage for message uploads');
    const up_folder = path.join(__dirname, "../../assets/userFiles/messages");
    storage = multer.diskStorage({
        destination: (req, file, cb) => {
            if (!fs.existsSync(up_folder)) fs.mkdirSync(up_folder, { recursive: true });
            cb(null, up_folder);
        },
        filename: (req, file, cb) => {
            cb(null, Date.now() + "-" + file.originalname);
        }
    });
}

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    fileFilter: (req, file, cb) => {
        // Allow almost anything for messages (docs, zips, etc)
        cb(null, true);
    }
});

function universalUpload(req, res, next) {
    upload.single('file')(req, res, (err) => {
        if (err) return res.status(500).json({ success: false, message: "Upload failed", error: err.message });
        if (!req.file) return next();

        if (useCloudinary) {
            req.fileUrl = req.file.path;
        } else {
            req.fileUrl = `${req.protocol}://${req.get("host")}/assets/userFiles/messages/${req.file.filename}`;
        }

        // Determine type
        const mime = req.file.mimetype;
        if (mime.startsWith('image/')) req.fileType = 'image';
        else if (mime.startsWith('video/')) req.fileType = 'video';
        else if (mime.startsWith('audio/')) req.fileType = 'audio';
        else req.fileType = 'file';

        next();
    });
}

module.exports = universalUpload;
