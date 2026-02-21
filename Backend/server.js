import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();

// Allow frontend requests
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://cohaven.netlify.app"
    ],
    methods: ["GET", "POST"],
  })
);

// Parse JSON bodies
app.use(express.json());

// Create Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Health check route (important for testing & Render)
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// LOGIN ROUTE
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(200).json({
      message: "Login successful",
      user: data.user,
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET PEOPLE (Display Route)
app.get("/api/people", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("people")
      .select("name, age");

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(200).json(data);

  } catch (err) {
    console.error("Fetch people error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Use dynamic port for deployment (Render requires this)
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});