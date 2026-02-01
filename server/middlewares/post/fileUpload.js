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
    console.log('✅ Cloudinary configured for stories:', config.cloud_name);

    storage = new CloudinaryStorage({
      cloudinary: cloudinary,
      params: async (req, file) => {
        const isVideo = file.mimetype.startsWith("video/");
        return {
          folder: "campus-connects/stories",
          resource_type: isVideo ? "video" : "image",
          allowed_formats: isVideo ? ["mp4", "mov", "avi"] : ["jpg", "jpeg", "png", "gif"],
          transformation: isVideo ? [] : [{ width: 1080, height: 1920, crop: "limit" }],
        };
      },
    });

    useCloudinary = true;
  } else {
    throw new Error('Cloudinary not properly configured');
  }
} catch (error) {
  console.log('⚠️  Cloudinary not available, using local storage for stories');
  console.log('   Error:', error.message);

  // Fallback to local storage
  const fs = require("fs");
  const up_folder = path.join(__dirname, "../../assets/userFiles");

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
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype.startsWith("image/") ||
      file.mimetype.startsWith("video/")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only image and video files are allowed"), false);
    }
  },
});

function fileUpload(req, res, next) {
  upload.any()(req, res, (err) => {
    if (err) {
      console.error('File upload error:', err);
      return res.status(500).json({
        success: false,
        message: "Error uploading file",
        error: err.message,
      });
    }

    if (!req.files || req.files.length === 0) {
      return next();
    }

    const file = req.files[0];
    req.file = file;
    req.fileType = file.mimetype.split("/")[0]; // 'image' or 'video'

    if (useCloudinary) {
      // Cloudinary URL is available in file.path
      req.fileUrl = file.path;
      console.log('✅ File uploaded to Cloudinary:', req.fileUrl);
    } else {
      // Local storage - construct URL
      req.fileUrl = `${req.protocol}://${req.get("host")}/assets/userFiles/${file.filename}`;
      console.log('✅ File uploaded locally:', req.fileUrl);
    }

    next();
  });
}

module.exports = fileUpload;
