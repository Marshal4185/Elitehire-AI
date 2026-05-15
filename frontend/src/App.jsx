import { useEffect, useState } from "react"
import { apiUrl } from "./api"
import Sidebar from "./components/Sidebar"
import DashboardPage from "./pages/DashboardPage"
import CandidatesPage from "./pages/CandidatesPage"
import InterviewPage from "./pages/InterviewPage"
import LoginPage from "./pages/LoginPage"
import ResumePage from "./pages/ResumePage"
import "./index.css"

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem("elitehire_user")
    return saved ? JSON.parse(saved) : null
  })
  const [page, setPage] = useState("Dashboard")
  const [resumeData, setResumeData] = useState(null)
  const [apiOnline, setApiOnline] = useState(null)

  useEffect(() => {
    fetch(apiUrl("/api/health"))
      .then((response) => response.json())
      .then((data) => setApiOnline(data.status === "online"))
      .catch(() => setApiOnline(false))
  }, [])

  const handleLogin = (userData) => {
    setUser(userData)
    sessionStorage.setItem("elitehire_user", JSON.stringify(userData))
  }

  const handleLogout = () => {
    setUser(null)
    sessionStorage.removeItem("elitehire_user")
  }

  const handleStartInterview = (data) => {
    setResumeData(data)
    setPage("Interview")
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} />
  }

  return (
    <div className="app-shell">
      <Sidebar
        active={page}
        onNavigate={setPage}
        onLogout={handleLogout}
        user={user}
        apiOnline={apiOnline}
      />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">{page}</h1>
            <p className="page-subtitle">EliteHire AI - Intelligent Recruitment Platform</p>
          </div>
          <div className="header-right">
            {apiOnline === false && (
              <div className="demo-badge">Backend Offline - Some features are unavailable</div>
            )}
            <div className="avatar">{user.name?.charAt(0) || "H"}</div>
          </div>
        </div>

        {page === "Dashboard" && <DashboardPage />}
        {page === "Resume" && <ResumePage onStartInterview={handleStartInterview} />}
        {page === "Interview" && <InterviewPage resumeData={resumeData} />}
        {page === "Candidates" && <CandidatesPage />}
      </main>
    </div>
  )
}
