import { useEffect, useState } from "react";
import { getConflicts, resolveConflict } from "../sync/conflict";

export default function Conflicts() {
  const [conflicts, setConflicts] = useState([]);

  useEffect(() => {
    getConflicts().then(setConflicts);
  }, []);

  if (!conflicts.length) return null;

  return (
    <div className="conflict-panel">
      <h3>Sync conflicts</h3>

      {conflicts.map(c => (
        <div key={c.id} className="conflict-item">
          <button
            onClick={() => resolveConflict(c.id, "local")}
          >
            Keep local
          </button>

          <button
            onClick={() => resolveConflict(c.id, "remote")}
          >
            Use remote
          </button>
        </div>
      ))}
    </div>
  );
}
