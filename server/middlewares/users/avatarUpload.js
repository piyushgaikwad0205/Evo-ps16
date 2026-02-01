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
    console.log('✅ Cloudinary configured for avatars:', config.cloud_name);

    storage = new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
        folder: "campus-connects/avatars",
        allowed_formats: ["jpg", "jpeg", "png"],
        transformation: [{ width: 500, height: 500, crop: "limit" }],
      },
    });

    useCloudinary = true;
  } else {
    throw new Error('Cloudinary not properly configured');
  }
} catch (error) {
  console.log('⚠️  Cloudinary not available, using local storage for avatars');
  console.log('   Error:', error.message);

  // Fallback to local storage
  const fs = require("fs");
  const up_folder = path.join(__dirname, "../../assets/userAvatars");

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
      const filename = file.fieldname + "-" + uniqueSuffix + ext;
      cb(null, filename);
    },
  });
}

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit (increased from 5MB)
  },
  fileFilter: (req, file, cb) => {
    console.log('Avatar upload - Processing file:', file.originalname, 'Type:', file.mimetype, 'Size:', file.size);
    if (
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/jpg" ||
      file.mimetype === "image/png"
    ) {
      cb(null, true);
    } else {
      console.log('Avatar upload - Invalid file type:', file.mimetype);
      cb(new Error("Only JPEG, JPG, and PNG files are allowed"), false);
    }
  },
});

function avatarUpload(req, res, next) {
  upload.single('avatar')(req, res, (err) => {
    if (err) {
      console.error('Avatar upload error:', err);

      // Provide specific error messages
      let errorMessage = "Error uploading file";
      let statusCode = 400;

      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          errorMessage = "File too large. Maximum size is 10MB";
        } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          errorMessage = "Unexpected field name. Use 'avatar' as field name";
        } else {
          errorMessage = `Upload error: ${err.message}`;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      return res.status(statusCode).json({
        success: false,
        message: errorMessage,
        error: err.code || err.message,
      });
    }

    if (req.file) {
      if (useCloudinary) {
        // Cloudinary URL is available in req.file.path
        req.avatarUrl = req.file.path;
        console.log('✅ Avatar uploaded to Cloudinary:', req.avatarUrl);
      } else {
        // Local storage - URL will be constructed in controller
        console.log('✅ Avatar uploaded locally:', req.file.filename);
      }
    } else {
      console.log('ℹ️  No avatar file in request');
    }

    next();
  });
}

module.exports = avatarUpload;