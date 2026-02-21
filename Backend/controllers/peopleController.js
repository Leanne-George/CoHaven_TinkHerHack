import { supabase } from "../server.js"; // adjust if needed

export const getPeople = async (req, res) => {
  const { data, error } = await supabase
    .from("people")
    .select("name, age");

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
};