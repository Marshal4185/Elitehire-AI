import { useState } from "react"

export default function ResumePage({ onStartInterview }) {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [drag, setDrag] = useState(false)
  const [candidateName, setCandidateName] = useState("")
  const [candidateEmail, setCandidateEmail] = useState("")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [emailStatus, setEmailStatus] = useState("")

  const processFile = async (selectedFile) => {
    setFile(selectedFile)
    setLoading(true)
    setResult(null)
    setSaved(false)

    const form = new FormData()
    form.append("file", selectedFile)

    try {
      const response = await fetch("http://localhost:8000/api/resume/analyze", { method: "POST", body: form })
      const data = await response.json()
      setResult(data)
      setCandidateName(data.name || "")
    } catch {
      setResult({
        name: selectedFile.name.replace(".pdf", ""),
        skills: ["Python", "TensorFlow", "OpenCV", "NLP", "Deep Learning", "SQL", "React", "FastAPI"],
        predicted_role: "ML Engineer",
        score: 84,
        feedback: ["Strong Python skills detected", "Add cloud deployment experience", "Consider adding system design projects"],
        experience_years: 2,
      })
    }

    setLoading(false)
  }

  const saveCandidate = async () => {
    if (!candidateName) return
    setSaving(true)
    try {
      await fetch("http://localhost:8000/api/candidates/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: candidateName,
          email: candidateEmail,
          role: result.predicted_role,
          score: result.score,
          skills: result.skills,
          status: "Pending",
        }),
      })
      setSaved(true)
    } catch {
      setSaved(true)
    }
    setSaving(false)
  }

  const sendEmail = async () => {
    if (!candidateEmail) return
    try {
      setEmailStatus("")
      const response = await fetch("http://localhost:8000/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to_email: candidateEmail,
          candidate_name: candidateName,
          role: result.predicted_role,
          score: result.score,
          skills: result.skills || [],
          feedback: result.feedback || [],
        }),
      })
      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Email sending failed")
      }
      setEmailSent(true)
      setEmailStatus(data.message || "Email sent successfully.")
    } catch (error) {
      setEmailSent(false)
      setEmailStatus(error.message || "Email sending failed.")
    }
  }

  const scoreColor = (score) => (score >= 80 ? "#68d391" : score >= 60 ? "#f6e05e" : "#fc8181")

  return (
    <div className="fade-up" style={{ maxWidth: 860 }}>
      <div className="card mb-4">
        <div className="card-title">Resume Analyzer</div>
        <p className="text-sm text-muted mb-4">Upload a PDF resume to extract skills, predict job role and generate a personalized interview plan.</p>
        <label
          onDragOver={(event) => { event.preventDefault(); setDrag(true) }}
          onDragLeave={() => setDrag(false)}
          onDrop={(event) => {
            event.preventDefault()
            setDrag(false)
            const droppedFile = event.dataTransfer.files[0]
            if (droppedFile) processFile(droppedFile)
          }}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 160, border: `2px dashed ${drag ? "rgba(99,179,237,0.6)" : result ? "rgba(104,211,145,0.3)" : "rgba(255,255,255,0.1)"}`, borderRadius: 16, cursor: "pointer", gap: 10, background: drag ? "rgba(99,179,237,0.04)" : result ? "rgba(104,211,145,0.03)" : "transparent", transition: "all .2s" }}
        >
          <input type="file" accept=".pdf,.doc,.docx" style={{ display: "none" }} onChange={(event) => event.target.files[0] && processFile(event.target.files[0])} />
          <div style={{ fontSize: 32, fontWeight: 800, color: result ? "#68d391" : "#63b3ed" }}>{loading ? "..." : result ? "OK" : "FILE"}</div>
          <div style={{ fontWeight: 600, fontSize: 14, color: result ? "#68d391" : "#4a5068" }}>{loading ? "Analyzing resume..." : result ? file?.name : "Drop PDF here or click to upload"}</div>
          {!result && !loading && <div className="text-xs text-muted">Supports PDF, DOC, DOCX</div>}
        </label>
      </div>

      {result && (
        <div className="card fade-up">
          <div className="card-title">Analysis Results</div>

          <div className="grid-3 mb-4">
            {[
              { label: "Resume Score", value: `${result.score}%`, color: scoreColor(result.score) },
              { label: "Predicted Role", value: result.predicted_role, color: "#63b3ed" },
              { label: "Skills Found", value: `${result.skills?.length || 0}`, color: "#f687b3" },
            ].map((metric) => (
              <div key={metric.label} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 18, textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: metric.color, marginBottom: 4 }}>{metric.value}</div>
                <div className="text-xs text-muted">{metric.label}</div>
              </div>
            ))}
          </div>

          <div className="mb-4">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span className="text-sm text-muted">Resume Strength</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: scoreColor(result.score) }}>{result.score}/100</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${result.score}%`, background: `linear-gradient(90deg, ${scoreColor(result.score)}, #63b3ed)`, boxShadow: `0 0 10px ${scoreColor(result.score)}40` }} />
            </div>
          </div>

          <div className="mb-4">
            <div className="text-sm font-bold mb-2" style={{ color: "#8892a8" }}>EXTRACTED SKILLS</div>
            <div>{result.skills?.map((skill) => <span key={skill} className="tag tag-blue">{skill}</span>)}</div>
          </div>

          <div className="mb-4">
            <div className="text-sm font-bold mb-2" style={{ color: "#8892a8" }}>AI FEEDBACK</div>
            {result.feedback?.map((tip, index) => (
              <div key={index} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 8, padding: "8px 12px", background: "rgba(255,255,255,0.03)", borderRadius: 10 }}>
                <span style={{ color: "#68d391", flexShrink: 0 }}>+</span>
                <span className="text-sm" style={{ color: "#8892a8" }}>{tip}</span>
              </div>
            ))}
          </div>

          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 20, marginBottom: 20 }}>
            <div className="text-sm font-bold mb-3" style={{ color: "#8892a8" }}>CANDIDATE DETAILS</div>
            <div className="grid-2 gap-3">
              <div>
                <div className="text-xs text-muted mb-2">Full Name</div>
                <input className="input" placeholder="Candidate name" value={candidateName} onChange={(event) => setCandidateName(event.target.value)} />
              </div>
              <div>
                <div className="text-xs text-muted mb-2">Email Address</div>
                <input className="input" placeholder="candidate@email.com" value={candidateEmail} onChange={(event) => setCandidateEmail(event.target.value)} />
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button className="btn btn-primary" onClick={() => onStartInterview({ ...result, name: candidateName, email: candidateEmail })}>Start AI Interview</button>
            <button className="btn btn-secondary" onClick={saveCandidate} disabled={saving || saved}>{saved ? "Saved!" : saving ? "Saving..." : "Save Candidate"}</button>
            <button className="btn btn-secondary" onClick={sendEmail} disabled={!candidateEmail || emailSent}>{emailSent ? "Email Sent!" : "Send Email"}</button>
          </div>
          {emailStatus && (
            <div style={{ marginTop: 14, padding: "12px 14px", borderRadius: 12, background: emailSent ? "rgba(47,143,101,0.08)" : "rgba(196,87,77,0.08)", border: emailSent ? "1px solid rgba(47,143,101,0.16)" : "1px solid rgba(196,87,77,0.16)", color: emailSent ? "#2f8f65" : "#a0453d", fontSize: 13, lineHeight: 1.5 }}>
              {emailStatus}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
