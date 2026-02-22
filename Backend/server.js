import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();

// ---------------- CORS ----------------
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "https://cohaven.netlify.app",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.use(express.json());

// ---------------- SUPABASE ----------------
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// ---------------- HEALTH CHECK ----------------
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// ---------------- LOGIN ----------------
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
      access_token: data.session.access_token,
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
    .from("people")
    .select("name")
    .eq("id", req.user.id)
    .single();

  if (error) return res.status(400).json({ error: error.message });

  res.json(data);
});

// ---------------- TASKS ----------------

// GET tasks
app.get("/tasks", authenticateUser, async (req, res) => {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", req.user.id);

  if (error) return res.status(400).json({ error: error.message });

  res.json(data);
});

// ADD task
app.post("/tasks", authenticateUser, async (req, res) => {
  const { title, task_date } = req.body;

  if (!title || !task_date) {
    return res.status(400).json({ error: "Title and date required" });
  }

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

  res.json({ message: "Task added successfully", data });
});

// ---------------- AVAILABILITY ----------------

// GET availability
app.get("/availability", authenticateUser, async (req, res) => {
  const { data, error } = await supabase
    .from("availability")
    .select("*")
    .eq("user_id", req.user.id);

  if (error) return res.status(400).json({ error: error.message });

  res.json(data);
});

// ADD availability
app.post("/availability", authenticateUser, async (req, res) => {
  const { date, start_time, end_time } = req.body;

  if (!date || !start_time || !end_time) {
    return res.status(400).json({ error: "All fields required" });
  }

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

  res.json({ message: "Availability added successfully", data });
});


// ---------------- GENERATE SCHEDULE (AI) ----------------
app.post("/generate-schedule", async (req, res) => {
  try {
    const { person1, person2 } = req.body;

    if (!person1 || !person2) {
      return res.status(400).json({ error: "Missing schedule data" });
    }

    const prompt = `
Create a fair and balanced household schedule.

Person 1 tasks: ${person1.tasks.join(", ")}
Person 1 availability: ${person1.availability.join(", ")}

Person 2 tasks: ${person2.tasks.join(", ")}
Person 2 availability: ${person2.availability.join(", ")}

Distribute tasks fairly based on availability.
Return a clear, structured schedule.
`;

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama3-8b-8192", // safer, lighter model
          messages: [{ role: "user", content: prompt }],
        }),
      }
    );

    const data = await response.json();

    console.log("Groq response:", data);

    if (!data.choices || !data.choices.length) {
      return res.json({
        schedule: "AI could not generate a schedule. Please try again.",
      });
    }

    res.json({
      schedule: data.choices[0].message.content,
    });

  } catch (error) {
    console.error("AI route error:", error);
    res.status(500).json({ error: "AI generation failed" });
  }
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});