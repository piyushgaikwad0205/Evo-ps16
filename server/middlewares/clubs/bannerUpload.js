const fs = require("fs");
function bannerUpload(req, res, next) {
  const multer = require("multer");
  const path = require("path");
  const up_folder = path.join(__dirname, "../../assets/clubBanners");

  const storage = multer.diskStorage({
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
      console.log('Club banner upload - Generated filename:', filename);
      cb(null, filename);
    },
  });

  const upload = multer({
    storage: storage,
    limits: {
      fileSize: 20 * 1024 * 1024, // 20MB limit
    },
    fileFilter: (req, file, cb) => {
      console.log('Club banner upload - Processing file:', file.originalname, 'Type:', file.mimetype);
      if (
        file.mimetype === "image/jpeg" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/png" ||
        file.mimetype === "image/webp"
      ) {
        cb(null, true);
      } else {
        console.log('Club banner upload - Invalid file type:', file.mimetype);
        cb(null, false);
      }
    },
  });

  upload.any()(req, res, (err) => {
    if (err) {
      console.error('Club banner upload error:', err);
      res.status(500).json({
        success: false,
        message: "Error uploading banner file",
        error: err.message,
      });
    } else {
      console.log('Club banner upload - Files received:', req.files?.length || 0);
      if (req.files && req.files.length > 0) {
        console.log('Club banner upload - File details:', req.files.map(f => ({ fieldname: f.fieldname, filename: f.filename, size: f.size })));
      }
      next();
    }
  });
}

module.exports = bannerUpload;