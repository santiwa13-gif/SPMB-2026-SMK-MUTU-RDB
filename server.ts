import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const DATA_FILE = path.join(process.cwd(), "students_data.json");

interface Student {
  noPendaftaran: string;
  nama: string;
  programKeahlian: string;
  password: string;
  status: string;
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json({ limit: "50mb" }));

  // Helper to read data
  const readData = (): Student[] => {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const data = fs.readFileSync(DATA_FILE, "utf-8");
        return JSON.parse(data);
      }
    } catch (error) {
      console.error("Error reading data file:", error);
    }
    return [];
  };

  // API Routes
  app.post("/api/admin/sync", (req, res) => {
    try {
      const { students } = req.body;
      if (!Array.isArray(students)) {
        return res.status(400).json({ error: "Invalid data format" });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(students, null, 2), "utf-8");
      res.json({ success: true, count: students.length });
    } catch (error) {
      console.error("Error syncing data:", error);
      res.status(500).json({ error: "Failed to sync data" });
    }
  });

  app.post("/api/student/login", (req, res) => {
    try {
      const { noPendaftaran, password } = req.body;
      if (!noPendaftaran || !password) {
        return res.status(400).json({ error: "No Pendaftaran dan Password wajib diisi" });
      }

      const students = readData();
      const student = students.find(
        (s) => String(s.noPendaftaran) === String(noPendaftaran) && String(s.password) === String(password)
      );

      if (student) {
        // Return without password
        const { password: _, ...studentData } = student;
        res.json({ success: true, student: studentData });
      } else {
        res.status(401).json({ error: "No Pendaftaran atau Password salah" });
      }
    } catch (error) {
      console.error("Error during student login:", error);
      res.status(500).json({ error: "Terjadi kesalahan sistem" });
    }
  });

  app.get("/api/admin/status", (req, res) => {
    const students = readData();
    res.json({ synced: students.length > 0, count: students.length });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
