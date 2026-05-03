import { useEffect, useState } from "react"

function AnimCount({ to, suffix = "" }) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    let current = 0
    const step = to / 60
    const timer = setInterval(() => {
      current = Math.min(current + step, to)
      setValue(Math.floor(current))
      if (current >= to) {
        clearInterval(timer)
      }
    }, 16)

    return () => clearInterval(timer)
  }, [to])

  return (
    <>
      {value}
      {suffix}
    </>
  )
}

function Bar({ val, color, label, delay = 0 }) {
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setWidth(val), 200 + delay)
    return () => clearTimeout(timer)
  }, [val, delay])

  return (
    <div className="mb-3">
      <div className="flex justify-between mb-2">
        <span className="text-sm text-muted">{label}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color }}>{val}%</span>
      </div>
      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ width: `${width}%`, background: color, boxShadow: `0 0 8px ${color}50` }}
        />
      </div>
    </div>
  )
}

const MOCK_CANDIDATES = [
  { id: 1, name: "Arjun Sharma", role: "ML Engineer", score: 87, status: "Shortlisted" },
  { id: 2, name: "Priya Nair", role: "Data Scientist", score: 92, status: "Selected" },
  { id: 3, name: "Rohan Mehta", role: "AI Researcher", score: 74, status: "Pending" },
  { id: 4, name: "Sneha Patel", role: "NLP Engineer", score: 68, status: "Pending" },
]

function statusClass(status) {
  return {
    Selected: "badge-selected",
    Shortlisted: "badge-shortlisted",
    Pending: "badge-pending",
    Rejected: "badge-rejected",
  }[status] || "badge-pending"
}

export default function DashboardPage() {
  const [stats, setStats] = useState({
    total_candidates: 0,
    selected: 0,
    avg_score: 0,
    interviews_today: 0,
  })
  const [candidates, setCandidates] = useState([])

  useEffect(() => {
    fetch("http://localhost:8000/api/dashboard/stats")
      .then((response) => response.json())
      .then(setStats)
      .catch(() =>
        setStats({ total_candidates: 248, selected: 34, avg_score: 81, interviews_today: 12 }),
      )

    fetch("http://localhost:8000/api/candidates")
      .then((response) => response.json())
      .then((data) => setCandidates(data.length ? data : MOCK_CANDIDATES))
      .catch(() => setCandidates(MOCK_CANDIDATES))
  }, [])

  const statCards = [
    { label: "Total Candidates", value: stats.total_candidates, suffix: "", color: "#63b3ed" },
    { label: "Interviews Today", value: stats.interviews_today, suffix: "", color: "#68d391" },
    { label: "Average Score", value: stats.avg_score, suffix: "%", color: "#f6e05e" },
    { label: "Selected", value: stats.selected, suffix: "", color: "#f687b3" },
  ]

  return (
    <div className="fade-up">
      <div className="stat-grid">
        {statCards.map((card) => (
          <div key={card.label} className="stat-card">
            <div className="stat-label">{card.label}</div>
            <div className="stat-value" style={{ color: card.color }}>
              <AnimCount to={card.value} suffix={card.suffix} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-title">Recent Candidates</div>
          {candidates.slice(0, 6).map((candidate, index) => (
            <div
              key={candidate.id || index}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "11px 0",
                borderBottom:
                  index < candidates.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 12,
                  background: "linear-gradient(135deg,#1a1a3a,#252545)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: 12,
                  color: "#63b3ed",
                  border: "1px solid rgba(99,179,237,0.2)",
                  flexShrink: 0,
                }}
              >
                {candidate.name?.split(" ").map((name) => name[0]).join("") || "?"}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{candidate.name}</div>
                <div className="text-muted text-sm">{candidate.role}</div>
              </div>
              <div style={{ textAlign: "right", marginRight: 12 }}>
                <div style={{ fontWeight: 700, color: "#63b3ed", fontSize: 15 }}>{candidate.score}</div>
                <div style={{ fontSize: 10, color: "#2a3050" }}>score</div>
              </div>
              <span className={`badge ${statusClass(candidate.status)}`}>{candidate.status}</span>
            </div>
          ))}
          {candidates.length === 0 && (
            <div className="text-muted text-sm" style={{ padding: "20px 0", textAlign: "center" }}>
              No candidates yet - analyze a resume first.
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-title">Emotion Overview</div>
          <div style={{ marginBottom: 20 }}>
            <Bar label="Confident" val={58} color="#68d391" delay={0} />
            <Bar label="Neutral" val={24} color="#63b3ed" delay={100} />
            <Bar label="Nervous" val={12} color="#fc8181" delay={200} />
            <Bar label="Focused" val={6} color="#f6e05e" delay={300} />
          </div>
          <div
            style={{
              padding: "14px 16px",
              background: "rgba(104,211,145,0.05)",
              borderRadius: 12,
              border: "1px solid rgba(104,211,145,0.12)",
              textAlign: "center",
            }}
          >
            <div className="text-muted text-xs mb-2">Most common across all sessions</div>
            <div style={{ fontWeight: 900, fontSize: 22, color: "#68d391" }}>Confident</div>
          </div>

          <div style={{ marginTop: 20 }}>
            <div className="card-title" style={{ fontSize: 14 }}>
              Quick Stats
            </div>
            {[
              { label: "Avg Interview Score", value: "78/100", color: "#63b3ed" },
              { label: "Face Verify Rate", value: "96.4%", color: "#68d391" },
              { label: "Voice Used", value: "64%", color: "#f6e05e" },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                }}
              >
                <span className="text-sm text-muted">{stat.label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: stat.color }}>{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
