function Match({ students }) {

  const calculateScore = (a, b) => {
    let score = 0;

    if (a.sleep === b.sleep) score += 2;
    if (a.study === b.study) score += 2;
    if (a.music === b.music) score += 1;
    if (a.clean === b.clean) score += 1;

    return score;
  };

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
        used.add(i);
        used.add(bestMatch);
        pairs.push({
          a: students[i],
          b: students[bestMatch],
          score: bestScore
        });
      }
    }

    return pairs;
  };

  const pairs = matchRooms();

  return (
    <div>
      <h1>Room Allocation 🧠</h1>

      {pairs.length === 0 && <p>No students added yet</p>}

      {pairs.map((pair, i) => (
        <div key={i}>
          <h3>Room {i + 1}</h3>
          <p>{pair.a.name} + {pair.b.name}</p>
          <p>Compatibility Score: {pair.score}</p>
        </div>
      ))}
    </div>
  );
}

export default Match;
