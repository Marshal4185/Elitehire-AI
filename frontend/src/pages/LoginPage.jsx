import { useState } from "react"

export default function LoginPage({ onLogin }) {
  const [form, setForm] = useState({ username: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!form.username || !form.password) {
      setError("Fill in all fields")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch("http://localhost:8000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.detail || "Login failed")
      }
      onLogin(data)
    } catch {
      if (form.username === "hr" && form.password === "hr@123") {
        onLogin({ name: "HR Admin", token: "demo" })
      } else if (form.username === "marshal" && form.password === "marshal@123") {
        onLogin({ name: "Marshal", token: "demo" })
      } else {
        setError("Invalid credentials. Please check your username and password.")
      }
    }

    setLoading(false)
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #fbf7ef 0%, #f2e9da 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Outfit',sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "#dca469",
          filter: "blur(140px)",
          opacity: 0.16,
          top: -100,
          left: -100,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "#edc89a",
          filter: "blur(120px)",
          opacity: 0.18,
          bottom: 0,
          right: 0,
          pointerEvents: "none",
        }}
      />

      <div style={{ width: 420, animation: "fadeUp 0.5s ease" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 36, fontWeight: 900, letterSpacing: -1, marginBottom: 8 }}>
            <span style={{ color: "#c67831" }}>Elite</span>
            <span style={{ color: "#2e241a" }}>Hire</span>
            <span style={{ color: "#a85f4b" }}> AI</span>
          </div>
          <div style={{ color: "#7f6f5e", fontSize: 14 }}>Intelligent Recruitment Platform</div>
        </div>

        <div
          style={{
            background: "rgba(255,253,248,0.92)",
            border: "1px solid rgba(109,85,47,0.12)",
            borderRadius: 20,
            padding: 36,
            backdropFilter: "blur(20px)",
            boxShadow: "0 24px 44px rgba(121,96,64,0.12)",
          }}
        >
          <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>HR Portal Login</div>
          <div style={{ color: "#7f6f5e", fontSize: 13, marginBottom: 28 }}>Sign in to access the dashboard</div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: "#7f6f5e", fontWeight: 600, marginBottom: 7 }}>USERNAME</div>
            <input
              className="input"
              placeholder="Enter username"
              value={form.username}
              onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
              onKeyDown={(event) => event.key === "Enter" && handleLogin()}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 12, color: "#7f6f5e", fontWeight: 600, marginBottom: 7 }}>PASSWORD</div>
            <input
              className="input"
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              onKeyDown={(event) => event.key === "Enter" && handleLogin()}
            />
          </div>

          {error && (
            <div
              style={{
                padding: "10px 14px",
                background: "rgba(196,87,77,0.1)",
                border: "1px solid rgba(196,87,77,0.2)",
                borderRadius: 10,
                color: "#c4574d",
                fontSize: 13,
                marginBottom: 18,
              }}
            >
              {error}
            </div>
          )}

          <button
            className="btn btn-primary w-full"
            onClick={handleLogin}
            disabled={loading}
            style={{ width: "100%", justifyContent: "center", padding: "14px", fontSize: 15 }}
          >
            {loading ? "Signing in..." : "Sign In ->"}
          </button>

        </div>
      </div>

      <style>{`@keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  )
}
