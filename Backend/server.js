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
    credentials: true
  })
);

// Parse JSON bodies
app.use(express.json());

// Create Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// ---------------- HEALTH CHECK ----------------
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// ---------------- LOGIN ROUTE ----------------
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
      access_token: data.session.access_token,   // 🔥 important
      user: data.user,
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ---------------- AUTH MIDDLEWARE ----------------
async function authenticateUser(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Missing token" });
  }

  const token = authHeader.split(" ")[1];

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return res.status(401).json({ error: "Invalid token" });
  }

  req.user = data.user;
  next();
}

// ---------------- PROFILE ----------------
app.get("/profile", authenticateUser, async (req, res) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", req.user.id)
    .single();

  if (error) return res.status(400).json({ error: error.message });

  res.json(data);
});

// ---------------- TASKS ----------------
app.get("/tasks", authenticateUser, async (req, res) => {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", req.user.id);

  if (error) return res.status(400).json({ error: error.message });

  res.json(data);
});

app.post("/tasks", authenticateUser, async (req, res) => {
  const { title, task_date } = req.body;

  const { data, error } = await supabase
    .from("tasks")
    .insert([
      {
        user_id: req.user.id,
        title,
        task_date,
      },
    ]);

  if (error) return res.status(400).json({ error: error.message });

  res.json(data);
});

// ---------------- AVAILABILITY ----------------
app.get("/availability", authenticateUser, async (req, res) => {
  const { data, error } = await supabase
    .from("availability")
    .select("*")
    .eq("user_id", req.user.id);

  if (error) return res.status(400).json({ error: error.message });

  res.json(data);
});

app.post("/availability", authenticateUser, async (req, res) => {
  const { date, start_time, end_time } = req.body;

  const { data, error } = await supabase
    .from("availability")
    .insert([
      {
        user_id: req.user.id,
        date,
        start_time,
        end_time,
      },
    ]);

  if (error) return res.status(400).json({ error: error.message });

  res.json(data);
});

// ---------------- OPTIONAL OLD ROUTE ----------------
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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});