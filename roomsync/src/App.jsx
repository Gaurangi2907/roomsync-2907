
import { useState, useEffect } from "react";
import "./App.css";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import Login from "./login";

function App() {
  const [page, setPage] = useState("dashboard");
  const [students, setStudents] = useState([]);
  const [removedStudents, setRemovedStudents] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 🔥 LOAD DATA
  useEffect(() => {
    const saved = localStorage.getItem("students");

    if (saved && JSON.parse(saved).length > 0) {
      setStudents(JSON.parse(saved));
    } else {
      fetch(
        "https://opensheet.elk.sh/12XDhfU1Z4PwI5n8Z7iPVxNrOu6N7IBzdewiZ9TlOL2o/Form%20Responses%201"
      )
        .then((res) => res.json())
        .then((data) => {
          const uniqueData = [
            ...new Map(data.map((item) => [item.name, item])).values(),
          ];

          setStudents(uniqueData);
          localStorage.setItem("students", JSON.stringify(uniqueData));
        });
    }
  }, []);

  // 🔥 SAVE DATA
  useEffect(() => {
    localStorage.setItem("students", JSON.stringify(students));
  }, [students]);

  // 🔥 REMOVE
  const removeStudent = (student) => {
    setStudents((prev) => prev.filter((s) => s.name !== student.name));
    setRemovedStudents((prev) => [...prev, student]);
  };

  // 🔥 UNDO
  const undoRemove = (student) => {
    setStudents((prev) => [...prev, student]);
    setRemovedStudents((prev) =>
      prev.filter((s) => s.name !== student.name)
    );
  };

  // 🔥 SCORE
  const calculateScore = (a, b) => {
    let score = 0;
    if (a.sleep === b.sleep) score += 2;
    if (a.study === b.study) score += 2;
    if (a.music === b.music) score += 2;
    if (a.clean === b.clean) score += 2;
    if (a.personality === b.personality) score += 2;
    return (score / 10) * 100;
  };

  // 🔥 MATCHING
  const matchRooms = () => {
    let used = new Set();
    let pairs = [];

    for (let i = 0; i < students.length; i++) {
      if (used.has(i)) continue;

      let bestMatch = -1;
      let bestScore = -1;

      for (let j = i + 1; j < students.length; j++) {
        if (used.has(j)) continue;

        let score = calculateScore(students[i], students[j]);

        if (score > bestScore) {
          bestScore = score;
          bestMatch = j;
        }
      }

      if (bestMatch !== -1) {
        pairs.push({
          s1: students[i],
          s2: students[bestMatch],
          score: bestScore,
        });

        used.add(i);
        used.add(bestMatch);
      }
    }

    return { pairs, used };
  };

  const { pairs, used } = matchRooms();

  const waiting = students.filter((_, index) => !used.has(index));

  const chartData = [
    { name: "High", value: pairs.filter((p) => p.score >= 70).length },
    {
      name: "Medium",
      value: pairs.filter((p) => p.score >= 40 && p.score < 70).length,
    },
    { name: "Low", value: pairs.filter((p) => p.score < 40).length },
  ];

  return (
    <div className="container">

      {!isLoggedIn ? (
        <Login onLogin={() => setIsLoggedIn(true)} />
      ) : (
        <>
          {/* SIDEBAR */}
          <div className="sidebar">
            <h2>RoomSync 🚀</h2>
            <p onClick={() => setPage("dashboard")}>Dashboard</p>
            <p onClick={() => setPage("match")}>Match</p>
            <p onClick={() => setPage("analytics")}>Analytics</p>
            <p onClick={() => setPage("removed")}>Removed</p>
          </div>

          {/* MAIN */}
          <div className="main">

            {/* DASHBOARD */}
            {page === "dashboard" && (
              <div>
                <h1>Dashboard</h1>
                <div className="card">
                  Total Students: {students.length}
                </div>
              </div>
            )}

            {/* MATCH */}
            {page === "match" && (
              <div>
                <h1>Room Allocation</h1>
                {pairs.map((pair, i) => (
                  <div key={i} className="card">
                    Room {i + 1}: {pair.s1.name} + {pair.s2.name} (
                    {pair.score.toFixed(0)}%)

                    <br /><br />

                    <button onClick={() => removeStudent(pair.s1)}>
                      ❌ Remove {pair.s1.name}
                    </button>

                    <button onClick={() => removeStudent(pair.s2)}>
                      ❌ Remove {pair.s2.name}
                    </button>
                  </div>
                ))}

                {waiting.map((s, i) => (
                  <div key={i} className="card">
                    Waiting: {s.name}
                  </div>
                ))}
              </div>
            )}

            {/* ANALYTICS */}
            {page === "analytics" && (
              <div>
                <h1>Analytics 📊</h1>

                <div className="card">
                  Average Compatibility:{" "}
                  {pairs.length > 0
                    ? Math.round(
                        pairs.reduce((acc, p) => acc + p.score, 0) /
                          pairs.length
                      )
                    : 0}
                  %
                </div>

                <PieChart width={300} height={300}>
                  <Pie data={chartData} dataKey="value" outerRadius={100}>
                    <Cell fill="#00C49F" />
                    <Cell fill="#FFBB28" />
                    <Cell fill="#FF4444" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </div>
            )}

            {/* REMOVED */}
            {page === "removed" && (
              <div>
                <h1>Removed Students ❌</h1>

                {removedStudents.length === 0 && <p>No removed students</p>}

                {removedStudents.map((s, i) => (
                  <div key={i} className="card">
                    {s.name}

                    <button onClick={() => undoRemove(s)}>
                      🔄 Undo
                    </button>
                  </div>
                ))}
              </div>
            )}

          </div>
        </>
      )}

    </div>
  );
}

export default App;