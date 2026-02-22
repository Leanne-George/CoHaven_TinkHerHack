import { useState } from "react";
import "./App.css";

const Dashboard = () => {
  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  const [activeTab, setActiveTab] = useState("person1");
  const [generatedSchedule, setGeneratedSchedule] = useState("");
  const [loading, setLoading] = useState(false);

  const [person1, setPerson1] = useState({
    name: "Person 1",
    tasks: ["Cook dinner", "Do laundry"],
    availability: ["6 PM - 9 PM"]
  });

  const [person2, setPerson2] = useState({
    name: "Person 2",
    tasks: ["Clean kitchen"],
    availability: ["5 PM - 8 PM"]
  });

  const currentPerson =
    activeTab === "person1" ? person1 : person2;

  const setCurrentPerson =
    activeTab === "person1" ? setPerson1 : setPerson2;

  const addTask = () => {
    const newTask = prompt("Enter new task:");
    if (!newTask) return;
    setCurrentPerson(prev => ({
      ...prev,
      tasks: [...prev.tasks, newTask]
    }));
  };

  const addAvailability = () => {
    const newSlot = prompt("Enter new time slot:");
    if (!newSlot) return;
    setCurrentPerson(prev => ({
      ...prev,
      availability: [...prev.availability, newSlot]
    }));
  };

  const handleGenerate = async () => {
  setLoading(true);
  setGeneratedSchedule("");

  // Simulate AI processing delay
  setTimeout(() => {
    setGeneratedSchedule(`
✨ Balanced Weekly Plan

Monday (Evening Overlap)
• 6:00 PM – Person 1: Cook dinner
• 7:00 PM – Person 2: Clean kitchen

Wednesday
• 6:00 PM – Person 2: Water plants
• 7:00 PM – Person 1: Do laundry

Saturday (Shared Weekend Window)
• 10:00 AM – Person 1: Pay bills
• 11:00 AM – Person 2: Buy groceries

✔ Tasks distributed evenly  
✔ Availability windows respected  
✔ Mental load shared fairly
    `);

    setLoading(false);
  }, 1500); // 1.5 second AI "thinking" delay
};}