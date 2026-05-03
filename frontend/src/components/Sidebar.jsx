const NAV = [
  { id: "Dashboard", icon: "[]", label: "Dashboard" },
  { id: "Resume", icon: "<>", label: "Resume Analyzer" },
  { id: "Interview", icon: "()", label: "AI Interview" },
  { id: "Candidates", icon: "::", label: "Candidates" },
]

export default function Sidebar({ active, onNavigate, onLogout, user, apiOnline }) {
  return (
    <aside
      style={{
        width: 220,
        flexShrink: 0,
        background: "rgba(255,251,244,0.9)",
        backdropFilter: "blur(20px)",
        borderRight: "1px solid rgba(109,85,47,0.12)",
        display: "flex",
        flexDirection: "column",
        padding: "28px 14px",
        height: "100vh",
        position: "sticky",
        top: 0,
      }}
    >
      <div style={{ paddingLeft: 8, marginBottom: 38 }}>
        <div
          style={{
            fontFamily: "'Outfit',sans-serif",
            fontSize: 22,
            fontWeight: 900,
            letterSpacing: -0.5,
          }}
        >
          <span style={{ color: "#63b3ed" }}>Elite</span>
          <span style={{ color: "#e2e8f4" }}>Hire</span>
          <span style={{ color: "#f687b3", fontSize: 14, marginLeft: 4 }}>AI</span>
        </div>
        <div
          style={{
            color: "#2a2a4a",
            fontSize: 10,
            fontFamily: "'Space Mono',monospace",
            marginTop: 3,
            letterSpacing: 0.4,
          }}
        >
          v3.0 | INTERVIEW INTELLIGENCE
        </div>
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {NAV.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 14px",
              borderRadius: 12,
              border: "none",
              cursor: "pointer",
              background: active === item.id ? "rgba(198,120,49,0.12)" : "transparent",
              color: active === item.id ? "#c67831" : "#7f6f5e",
              fontSize: 14,
              fontWeight: 600,
              fontFamily: "'Outfit',sans-serif",
              transition: "all 0.2s",
              textAlign: "left",
              width: "100%",
              borderLeft: active === item.id ? "2px solid #c67831" : "2px solid transparent",
            }}
            onMouseEnter={(event) => {
              if (active !== item.id) {
                event.currentTarget.style.color = "#4f3d2c"
                event.currentTarget.style.background = "rgba(198,120,49,0.06)"
              }
            }}
            onMouseLeave={(event) => {
              if (active !== item.id) {
                event.currentTarget.style.color = "#7f6f5e"
                event.currentTarget.style.background = "transparent"
              }
            }}
          >
            <span style={{ fontSize: 16 }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
        <div
          style={{
            padding: "14px",
            background: "rgba(198,120,49,0.06)",
            borderRadius: 12,
            border: "1px solid rgba(198,120,49,0.12)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: apiOnline === false ? "#c4574d" : "#2f8f65",
                boxShadow: `0 0 6px ${apiOnline === false ? "#c4574d" : "#2f8f65"}`,
                animation: "pulse 2s infinite",
              }}
            />
            <span
              style={{
                fontSize: 11,
                color: apiOnline === false ? "#c4574d" : "#2f8f65",
                fontWeight: 700,
              }}
            >
              {apiOnline === null ? "Connecting..." : apiOnline ? "Backend Online" : "Backend Offline"}
            </span>
          </div>
          <div style={{ fontSize: 10, color: "#7f6f5e", fontFamily: "'Space Mono',monospace", lineHeight: 2 }}>
            Emotion AI: Ready
            <br />
            Face AI: Ready
            <br />
            Gemini: {apiOnline ? "Active" : "Unavailable"}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 4px" }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "linear-gradient(135deg,#c67831,#d89b63)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: 13,
              color: "#fff",
              flexShrink: 0,
            }}
          >
            {user?.name?.charAt(0) || "H"}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user?.name}
            </div>
            <div style={{ fontSize: 10, color: "#7f6f5e" }}>HR Admin</div>
          </div>
          <button
            onClick={onLogout}
            title="Logout"
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "#7f6f5e",
              fontSize: 16,
              padding: 4,
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.color = "#c4574d"
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.color = "#7f6f5e"
            }}
          >
            X
          </button>
        </div>
      </div>
    </aside>
  )
}
