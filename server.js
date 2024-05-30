const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const killPort = require("kill-port");
const { Video, Prompt, sequelize } = require("./src/models");
const connectionDatabase = require("./connection_database");

const app = express();

// Tạo thư mục upload nếu chưa tồn tại
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  console.log("Creating upload directory...");
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads"); // Lưu file trong thư mục 'uploads'
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // Đặt tên file với timestamp
  },
});

const upload = multer({ storage });

let globalPromptText = ""; // Biến toàn cục để lưu prompt text

// Route để lấy đoạn text ngẫu nhiên từ database
app.get("/api/random-text", async (req, res) => {
  try {
    const prompt = await Prompt.findOne({ order: sequelize.random() });
    if (prompt) {
      globalPromptText = prompt.Text;
      res.json({ text: prompt.Text });
    } else {
      res.status(404).json({ error: "No text found" });
    }
  } catch (error) {
    console.error("Error fetching random text:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Route xử lý upload file video
app.post("/api/upload", upload.single("video"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    // Lưu thông tin video và prompt vào cơ sở dữ liệu
    await Video.create({
      filename: req.file.filename,
      promptText: globalPromptText,
    });

    res
      .status(200)
      .json({ message: "File uploaded successfully", file: req.file });
  } catch (error) {
    console.error("Error uploading video:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Route để lấy danh sách video đã upload kèm với prompt
app.get("/api/videos", async (req, res) => {
  try {
    const videos = await Video.findAll({
      attributes: ["filename", "promptText"],
      order: [["createdAt", "DESC"]],
    });
    console.log(videos); // Log dữ liệu để kiểm tra
    res.status(200).json({ videos });
  } catch (error) {
    console.error("Error fetching videos:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Route để phục vụ trang HTML mới
app.get("/video-uploaded", (req, res) => {
  res.sendFile(path.join(__dirname, "video_uploaded.html"));
});

// Serve the HTML file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "iindex.html"));
});

// Serve static files from the 'uploads' directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

try {
  connectionDatabase();
  const port = process.env.PORT || 7000;

  killPort(port)
    .then(() => {
      const listener = app.listen(port, () => {
        console.log(`Server is listening on port ` + listener.address().port);
      });
    })
    .catch((err) => {
      console.error("Error killing port:", err);
    });
} catch (err) {
  console.error("Error initializing server:", err);
}

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

setInterval(() => {}, 1 << 30);
