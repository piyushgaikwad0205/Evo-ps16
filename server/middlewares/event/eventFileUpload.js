const multer = require("multer");
const path = require("path");

// Try to use Cloudinary if configured, otherwise fall back to local storage
let useCloudinary = false;
let storage;

try {
    const { CloudinaryStorage } = require("multer-storage-cloudinary");
    const cloudinary = require("../../config/cloudinary");

    // Check if Cloudinary is properly configured
    const config = cloudinary.config();
    if (config.cloud_name && config.api_key && config.api_secret) {
        storage = new CloudinaryStorage({
            cloudinary: cloudinary,
            params: async (req, file) => {
                return {
                    folder: "campus-connects/events",
                    resource_type: "image",
                    allowed_formats: ["jpg", "jpeg", "png", "gif"],
                };
            },
        });
        useCloudinary = true;
    } else {
        throw new Error("Cloudinary not properly configured");
    }
} catch (error) {
    console.log("⚠️  Cloudinary not available, using local storage for events");
    const fs = require("fs");
    const up_folder = path.join(__dirname, "../../assets/eventFiles");

    storage = multer.diskStorage({
        destination: (req, file, cb) => {
            if (!fs.existsSync(up_folder)) {
                fs.mkdirSync(up_folder, { recursive: true });
            }
            cb(null, up_folder);
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
            const ext = path.extname(file.originalname);
            cb(null, file.fieldname + "-" + uniqueSuffix + ext);
        },
    });
}

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Only image files are allowed"), false);
        }
    },
});

function eventFileUpload(req, res, next) {
    const uploadFields = upload.fields([
        { name: "banner", maxCount: 1 },
        { name: "qrCode", maxCount: 1 },
        { name: "paymentProof", maxCount: 1 },
    ]);

    uploadFields(req, res, (err) => {
        if (err) {
            console.error("File upload error:", err);
            return res.status(500).json({
                success: false,
                message: "Error uploading file",
                error: err.message,
            });
        }

        if (req.files) {
            if (req.files.banner) {
                const file = req.files.banner[0];
                req.body.bannerUrl = useCloudinary
                    ? file.path
                    : `${req.protocol}://${req.get("host")}/assets/eventFiles/${file.filename
                    }`;
            }
            if (req.files.qrCode) {
                const file = req.files.qrCode[0];
                req.body.qrCodeUrl = useCloudinary
                    ? file.path
                    : `${req.protocol}://${req.get("host")}/assets/eventFiles/${file.filename
                    }`;
            }
            if (req.files.paymentProof) {
                const file = req.files.paymentProof[0];
                req.body.paymentProofUrl = useCloudinary
                    ? file.path
                    : `${req.protocol}://${req.get("host")}/assets/eventFiles/${file.filename
                    }`;
            }
        }

        next();
    });
}

module.exports = eventFileUpload;
