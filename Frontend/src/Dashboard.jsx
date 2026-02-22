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

  const handleGenerate = () => {
    // Placeholder for now
    setGeneratedSchedule(
      "Balanced schedule will appear here after AI integration."
    );
  };

  return (
    <div className="dashboard">
      <div className="overlay">
        <div className="container">

          <div className="date">{today}</div>
          <h1 className="main-title">CoHaven</h1>
          <p className="subtitle">Balanced living. Shared clarity.</p>

          <div className="tabs">
            <button
              className={activeTab === "person1" ? "tab active" : "tab"}
              onClick={() => setActiveTab("person1")}
            >
              Person 1
            </button>

            <button
              className={activeTab === "person2" ? "tab active" : "tab"}
              onClick={() => setActiveTab("person2")}
            >
              Person 2
            </button>
          </div>

          {/* TWO COLUMN LAYOUT */}
          <div className="layout">

            {/* LEFT SIDE - INPUT */}
            <div className="left-panel">
              <div className="person-card">
                <h2>{currentPerson.name}</h2>

                <div className="section">
                  <div className="section-header">
                    <h3>Tasks</h3>
                    <button onClick={addTask} className="mini-btn">
                      + Add Task
                    </button>
                  </div>

                  {currentPerson.tasks.map((task, i) => (
                    <div key={i} className="pill">{task}</div>
                  ))}
                </div>

                <div className="section">
                  <div className="section-header">
                    <h3>Availability</h3>
                    <button onClick={addAvailability} className="mini-btn">
                      + Add Time Slot
                    </button>
                  </div>

                  {currentPerson.availability.map((slot, i) => (
                    <div key={i} className="pill availability">{slot}</div>
                  ))}
                </div>
              </div>

              <button className="ai-button" onClick={handleGenerate}>
                Generate Balanced Schedule
              </button>
            </div>

            {/* RIGHT SIDE - OUTPUT */}
            <div className="right-panel">
              <div className="schedule-box">
                <h3>Generated Schedule</h3>

                {generatedSchedule ? (
                  <p className="schedule-content">
                    {generatedSchedule}
                  </p>
                ) : (
                  <p className="schedule-placeholder">
                    Your balanced schedule will appear here.
                  </p>
                )}
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;