import { useEffect, useState } from "react"

const MOCK = [
  { id: 1, name: "Arjun Sharma", email: "arjun@email.com", role: "ML Engineer", score: 87, interview_score: 82, status: "Shortlisted", skills: "Python, TensorFlow, OpenCV", emotion_summary: "confident" },
  { id: 2, name: "Priya Nair", email: "priya@email.com", role: "Data Scientist", score: 92, interview_score: 89, status: "Selected", skills: "PyTorch, SQL, Pandas", emotion_summary: "confident" },
  { id: 3, name: "Rohan Mehta", email: "rohan@email.com", role: "AI Researcher", score: 74, interview_score: 71, status: "Pending", skills: "NLP, Research, Python", emotion_summary: "neutral" },
  { id: 4, name: "Sneha Patel", email: "sneha@email.com", role: "NLP Engineer", score: 68, interview_score: 65, status: "Pending", skills: "BERT, HuggingFace, Python", emotion_summary: "nervous" },
]

function statusClass(status) {
  return { Selected: "badge-selected", Shortlisted: "badge-shortlisted", Pending: "badge-pending", Rejected: "badge-rejected" }[status] || "badge-pending"
}

const EMOTION_COLOR = { confident: "#68d391", neutral: "#63b3ed", nervous: "#fc8181", focused: "#f6e05e" }

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState([])
  const [filter, setFilter] = useState("All")
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetch("http://localhost:8000/api/candidates")
      .then((response) => response.json())
      .then((data) => setCandidates(data.length ? data : MOCK))
      .catch(() => setCandidates(MOCK))
  }, [])

  const updateStatus = async (id, status) => {
    try {
      await fetch(`http://localhost:8000/api/candidates/${id}/status?status=${status}`, { method: "PATCH" })
    } catch {}
    setCandidates((current) => current.map((candidate) => (candidate.id === id ? { ...candidate, status } : candidate)))
  }

  const statuses = ["All", "Selected", "Shortlisted", "Pending", "Rejected"]
  const filtered = candidates.filter((candidate) => {
    const query = search.toLowerCase()
    const matchFilter = filter === "All" || candidate.status === filter
    const matchSearch = !search || candidate.name?.toLowerCase().includes(query) || candidate.role?.toLowerCase().includes(query)
    return matchFilter && matchSearch
  })

  const exportCSV = () => {
    const headers = ["Name", "Email", "Role", "Score", "Interview Score", "Status", "Skills", "Emotion"]
    const rows = filtered.map((candidate) => [candidate.name, candidate.email, candidate.role, candidate.score, candidate.interview_score, candidate.status, candidate.skills, candidate.emotion_summary])
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n")
    const link = document.createElement("a")
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }))
    link.download = "elitehire_candidates.csv"
    link.click()
  }

  const counts = { All: candidates.length, Selected: 0, Shortlisted: 0, Pending: 0, Rejected: 0 }
  candidates.forEach((candidate) => {
    if (counts[candidate.status] !== undefined) counts[candidate.status] += 1
  })

  return (
    <div className="fade-up">
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <input className="input" placeholder="Search candidates..." value={search} onChange={(event) => setSearch(event.target.value)} style={{ width: 240 }} />
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {statuses.map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              style={{
                padding: "7px 14px",
                borderRadius: 10,
                border: `1px solid ${filter === status ? "rgba(99,179,237,0.4)" : "rgba(255,255,255,0.07)"}`,
                background: filter === status ? "rgba(99,179,237,0.1)" : "transparent",
                color: filter === status ? "#63b3ed" : "#4a5068",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "'Outfit',sans-serif",
              }}
            >
              {status} {counts[status] !== undefined ? <span style={{ opacity: 0.6 }}>({counts[status]})</span> : null}
            </button>
          ))}
        </div>
        <button className="btn btn-secondary" onClick={exportCSV} style={{ marginLeft: "auto" }}>Export CSV</button>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                {["Candidate", "Role", "Resume", "Interview", "Emotion", "Skills", "Status", "Action"].map((heading) => (
                  <th key={heading} style={{ padding: "14px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#4a5068", fontFamily: "'Space Mono',monospace", whiteSpace: "nowrap" }}>{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((candidate, index) => (
                <tr
                  key={candidate.id || index}
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background 0.15s" }}
                  onMouseEnter={(event) => { event.currentTarget.style.background = "rgba(255,255,255,0.02)" }}
                  onMouseLeave={(event) => { event.currentTarget.style.background = "transparent" }}
                >
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg,#1a1a3a,#252545)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 11, color: "#63b3ed", border: "1px solid rgba(99,179,237,0.2)", flexShrink: 0 }}>
                        {candidate.name?.split(" ").map((part) => part[0]).join("") || "?"}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{candidate.name}</div>
                        <div style={{ fontSize: 11, color: "#4a5068" }}>{candidate.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px" }}><span className="text-sm" style={{ color: "#8892a8" }}>{candidate.role}</span></td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ fontWeight: 700, color: candidate.score >= 80 ? "#68d391" : candidate.score >= 60 ? "#f6e05e" : "#fc8181", fontSize: 15 }}>{candidate.score}</div>
                  </td>
                  <td style={{ padding: "12px 16px" }}><div style={{ fontWeight: 700, color: "#63b3ed", fontSize: 15 }}>{candidate.interview_score || "-"}</div></td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: EMOTION_COLOR[candidate.emotion_summary] || "#4a5068", textTransform: "capitalize" }}>{candidate.emotion_summary || "-"}</span>
                  </td>
                  <td style={{ padding: "12px 16px", maxWidth: 180 }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                      {candidate.skills?.split(", ").slice(0, 3).map((skill) => <span key={skill} className="tag tag-blue" style={{ fontSize: 10, padding: "2px 8px" }}>{skill}</span>)}
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px" }}><span className={`badge ${statusClass(candidate.status)}`}>{candidate.status}</span></td>
                  <td style={{ padding: "12px 16px" }}>
                    <select
                      value={candidate.status}
                      onChange={(event) => updateStatus(candidate.id, event.target.value)}
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "5px 8px", color: "#e2e8f4", fontSize: 12, fontFamily: "'Outfit',sans-serif", cursor: "pointer", outline: "none" }}
                    >
                      {["Pending", "Shortlisted", "Selected", "Rejected"].map((status) => <option key={status} value={status} style={{ background: "#0e0e1e" }}>{status}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ padding: "40px", textAlign: "center", color: "#4a5068", fontSize: 14 }}>
                    {search ? "No candidates match your search" : "No candidates yet - analyze a resume first."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginTop: 12, color: "#4a5068", fontSize: 12 }}>Showing {filtered.length} of {candidates.length} candidates</div>
    </div>
  )
}
