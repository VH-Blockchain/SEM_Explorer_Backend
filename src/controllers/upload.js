import path from "path";
import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, file.originalname);
  },
});
const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
      // Check if the uploaded file has a .sol extension
      const extname = path.extname(file.originalname);
      if (extname !== '.sol') {
          return cb(new Error('Only .sol files are allowed'));
        }
        cb(null, true);
    },
    limits: {
        fileSize: 1024 * 1024 * 5,
    },
});

export default upload
