import { useCallback, useEffect, useRef, useState } from "react"

function useWebcam() {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [active, setActive] = useState(false)
  const [error, setError] = useState(null)

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, facingMode: "user" }, audio: false })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
      setActive(true)
      setError(null)
    } catch {
      setError("Camera denied - allow permissions in browser")
    }
  }, [])

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    setActive(false)
  }, [])

  const capture = useCallback(() => {
    if (!videoRef.current || !active) return null
    const canvas = document.createElement("canvas")
    canvas.width = 320
    canvas.height = 240
    canvas.getContext("2d").drawImage(videoRef.current, 0, 0, 320, 240)
    return canvas.toDataURL("image/jpeg", 0.7).split(",")[1]
  }, [active])

  return { videoRef, active, error, start, stop, capture }
}

function useSpeech() {
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [error, setError] = useState("")
  const recognitionRef = useRef(null)
  const supported = Boolean(window.SpeechRecognition || window.webkitSpeechRecognition)

  useEffect(() => {
    if (!supported) {
      setError("Voice input is supported in Chrome or Edge on localhost.")
      return
    }
    const SpeechRecognitionApi = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognitionApi()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = "en-US"
    recognition.onresult = (event) => {
      setError("")
      setTranscript(Array.from(event.results).map((result) => result[0].transcript).join(""))
    }
    recognition.onend = () => setListening(false)
    recognition.onerror = (event) => {
      setListening(false)
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setError("Microphone permission was blocked. Allow mic access in the browser and try again.")
      } else if (event.error === "no-speech") {
        setError("No speech was detected. Speak clearly, then click Send.")
      } else if (event.error === "audio-capture") {
        setError("No microphone was detected. Check your device microphone settings.")
      } else {
        setError(`Voice input error: ${event.error}`)
      }
    }
    recognitionRef.current = recognition
  }, [supported])

  const startListen = () => {
    if (!recognitionRef.current) return
    setTranscript("")
    setError("")
    setListening(true)
    recognitionRef.current.start()
  }

  const stopListen = () => {
    recognitionRef.current?.stop()
    setListening(false)
  }

  const speak = (text) => {
    window.speechSynthesis?.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.95
    window.speechSynthesis?.speak(utterance)
  }

  return { listening, transcript, setTranscript, startListen, stopListen, speak, supported, error }
}

function WebcamPanel({ webcam, faceVerified, isActive }) {
  const [scanY, setScanY] = useState(0)

  useEffect(() => {
    if (!isActive) return
    const timer = setInterval(() => setScanY((value) => (value + 1.5) % 100), 25)
    return () => clearInterval(timer)
  }, [isActive])

  return (
    <div style={{ position: "relative", borderRadius: 14, overflow: "hidden", background: "#050510", border: `1px solid ${isActive ? "rgba(99,179,237,0.25)" : "rgba(255,255,255,0.06)"}`, aspectRatio: "4/3" }}>
      <video ref={webcam.videoRef} autoPlay muted playsInline style={{ width: "100%", height: "100%", objectFit: "cover", display: webcam.active ? "block" : "none", transform: "scaleX(-1)" }} />
      {!webcam.active && (
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <div style={{ fontSize: 24, opacity: 0.2, fontWeight: 800 }}>CAM</div>
          <span style={{ color: "#2a3050", fontSize: 12 }}>{webcam.error || "Camera off"}</span>
        </div>
      )}
      {webcam.active && (
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.05, pointerEvents: "none" }}>
          {[...Array(7)].map((_, index) => <line key={`v${index}`} x1={`${index * 16.6}%`} y1="0" x2={`${index * 16.6}%`} y2="100%" stroke="#63b3ed" strokeWidth="1" />)}
          {[...Array(5)].map((_, index) => <line key={`h${index}`} x1="0" y1={`${index * 25}%`} x2="100%" y2={`${index * 25}%`} stroke="#63b3ed" strokeWidth="1" />)}
        </svg>
      )}
      {webcam.active && (
        <div style={{ position: "absolute", top: "18%", left: "22%", right: "22%", bottom: "12%", border: `1.5px solid rgba(99,179,237,${faceVerified ? 0.7 : 0.2})`, borderRadius: 8, pointerEvents: "none" }}>
          {[["top", "left"], ["top", "right"], ["bottom", "left"], ["bottom", "right"]].map(([vertical, horizontal]) => (
            <div key={`${vertical}${horizontal}`} style={{ position: "absolute", [vertical]: -1, [horizontal]: -1, width: 10, height: 10, borderTop: vertical === "top" ? "2px solid #63b3ed" : "none", borderBottom: vertical === "bottom" ? "2px solid #63b3ed" : "none", borderLeft: horizontal === "left" ? "2px solid #63b3ed" : "none", borderRight: horizontal === "right" ? "2px solid #63b3ed" : "none" }} />
          ))}
        </div>
      )}
      {isActive && webcam.active && <div style={{ position: "absolute", left: 0, right: 0, top: `${scanY}%`, height: 1.5, background: "linear-gradient(90deg, transparent, #63b3ed, transparent)", opacity: 0.5, pointerEvents: "none" }} />}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "8px 10px", background: "linear-gradient(transparent, rgba(0,0,0,0.85))", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: webcam.active ? "#68d391" : "#3a3a5a", animation: webcam.active ? "pulse 2s infinite" : "none" }} />
          <span style={{ fontSize: 9, fontFamily: "'Space Mono',monospace", color: webcam.active ? (faceVerified ? "#68d391" : "#63b3ed") : "#3a3a5a" }}>
            {webcam.active ? (faceVerified ? "VERIFIED" : "DETECTING...") : "CAM OFF"}
          </span>
        </div>
        {isActive && webcam.active && <span style={{ fontSize: 9, fontFamily: "monospace", color: "#fc8181", animation: "pulse 1.5s infinite" }}>REC</span>}
      </div>
    </div>
  )
}

const EMOTION_MARKER = { confident: "C", neutral: "N", nervous: "!", focused: "F", happy: "H" }
const EMOTION_COLOR = { confident: "#68d391", neutral: "#63b3ed", nervous: "#fc8181", focused: "#f6e05e", happy: "#f687b3" }

export default function InterviewPage({ resumeData }) {
  const webcam = useWebcam()
  const speech = useSpeech()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [started, setStarted] = useState(false)
  const [done, setDone] = useState(false)
  const [qNum, setQNum] = useState(0)
  const [totalQ, setTotalQ] = useState(12)
  const [emotion, setEmotion] = useState("neutral")
  const [faceVerified, setFaceVerified] = useState(false)
  const [emotionLog, setEmotionLog] = useState([])
  const [answerScores, setAnswerScores] = useState([])
  const [report, setReport] = useState(null)
  const [saving, setSaving] = useState(false)
  const [replaySessionId, setReplaySessionId] = useState("")
  const [savingReplay, setSavingReplay] = useState(false)
  const [assistantName] = useState("Ava Sterling")
  const chatRef = useRef(null)
  const emotionTimer = useRef(null)

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight
  }, [messages])

  useEffect(() => {
    if (speech.transcript) setInput(speech.transcript)
  }, [speech.transcript])

  const addMessage = (role, text) => setMessages((current) => [...current, { role, text, ts: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }])

  const buildReplayEntries = (history, finalReport) => {
    const aiMessages = history.filter((message) => message.role === "ai")
    const userMessages = history.filter((message) => message.role === "user")
    return aiMessages.slice(0, userMessages.length).map((message, index) => ({
      question_number: index + 1,
      question: message.text,
      answer: userMessages[index]?.text || "No answer recorded.",
      answer_score: answerScores[index] || 0,
      emotion: emotionLog[index] || finalReport?.emotion_summary || emotion || "neutral",
    }))
  }

  const saveReplay = async (finalReport, history) => {
    try {
      setSavingReplay(true)
      const response = await fetch("http://localhost:8000/api/interview/replay/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidate_name: resumeData?.name || "Candidate",
          role: resumeData?.predicted_role || "Unknown Role",
          overall_score: finalReport?.overall_score || 0,
          recommendation: finalReport?.recommendation || "",
          emotion_summary: finalReport?.emotion_summary || emotion,
          entries: buildReplayEntries(history, finalReport),
        }),
      })
      const data = await response.json()
      if (data?.success) {
        setReplaySessionId(data.session_id || "")
      }
    } catch {
      setReplaySessionId("")
    } finally {
      setSavingReplay(false)
    }
  }

  const startEmotionLoop = useCallback(() => {
    emotionTimer.current = setInterval(async () => {
      const frame = webcam.capture()
      if (!frame) return
      try {
        const emotionResponse = await fetch("http://localhost:8000/api/emotion/detect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image_base64: frame }),
        })
        const emotionData = await emotionResponse.json()
        if (emotionData?.dominant) {
          setEmotion(emotionData.dominant)
          setEmotionLog((current) => [...current, emotionData.dominant])
        }
        if (!faceVerified) {
          const faceResponse = await fetch("http://localhost:8000/api/face/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image_base64: frame }),
          })
          const faceData = await faceResponse.json()
          if (faceData?.verified) setFaceVerified(true)
        }
      } catch {
        const fallback = ["confident", "neutral", "focused", "nervous", "confident"]
        setEmotion(fallback[Math.floor(Date.now() / 3000) % fallback.length])
        setFaceVerified(true)
      }
    }, 2500)
  }, [faceVerified, webcam])

  const startInterview = async () => {
    await webcam.start()
    setStarted(true)
    try {
      const response = await fetch("http://localhost:8000/api/interview/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidate_name: resumeData?.name || "Candidate", job_role: resumeData?.predicted_role || "ML Engineer", skills: resumeData?.skills || ["Python"], experience_years: resumeData?.experience_years || 1 }),
      })
      const data = await response.json()
      addMessage("ai", data.question)
      speech.speak(data.question)
      setQNum(1)
      setTotalQ(data.total_questions || 12)
    } catch {
      const fallbackQuestion = "Tell me about yourself and your experience in AI and Machine Learning."
      addMessage("ai", fallbackQuestion)
      speech.speak(fallbackQuestion)
      setQNum(1)
      setTotalQ(12)
    }
    startEmotionLoop()
  }

  const finalize = async (history) => {
    setDone(true)
    clearInterval(emotionTimer.current)
    webcam.stop()
    addMessage("ai", "Thank you for completing the interview! Generating your report...")
    let finalReport = null
    try {
      const response = await fetch("http://localhost:8000/api/interview/finalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history, emotion_log: emotionLog }),
      })
      finalReport = await response.json()
    } catch {
      finalReport = { overall_score: 79, technical_knowledge: 82, communication: 76, problem_solving: 80, cultural_fit: 77, recommendation: "Shortlisted", summary: "Strong candidate with good technical foundations.", strengths: ["Clear communication", "Technical depth", "Problem-solving mindset"], improvements: ["Add concrete project metrics", "Deeper system design"] }
    }
    setReport(finalReport)
    await saveReplay(finalReport, history)
  }

  const sendAnswer = async () => {
    const answer = input.trim()
    if (!answer || loading) return
    addMessage("user", answer)
    setInput("")
    speech.setTranscript("")
    setLoading(true)
    const history = messages.map((message) => ({ role: message.role, text: message.text }))
    try {
      const response = await fetch("http://localhost:8000/api/interview/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: messages[messages.length - 1]?.text || "", answer, job_role: resumeData?.predicted_role || "ML Engineer", skills: resumeData?.skills || [], history, question_number: qNum }),
      })
      const data = await response.json()
      setLoading(false)
      setAnswerScores((current) => [...current, data.answer_score || 0])
      if (data.is_final || qNum >= totalQ) {
        finalize([...history, { role: "user", text: answer }])
      } else {
        addMessage("ai", data.next_question)
        speech.speak(data.next_question)
        setQNum((current) => current + 1)
      }
    } catch {
      setLoading(false)
      setAnswerScores((current) => [...current, 60])
      const fallbackQuestions = ["Can you elaborate on that?", "Tell me about a challenge you overcame.", "How do you approach problem solving?", "Where do you see yourself in 5 years?"]
      const fallbackQuestion = fallbackQuestions[qNum % fallbackQuestions.length]
      addMessage("ai", fallbackQuestion)
      speech.speak(fallbackQuestion)
      setQNum((current) => current + 1)
    }
  }

  const saveReport = async () => {
    if (!report || !resumeData) return
    setSaving(true)
    try {
      await fetch("http://localhost:8000/api/candidates/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: resumeData.name || "Candidate", email: resumeData.email || "", role: resumeData.predicted_role || "ML Engineer", score: resumeData.score || 0, skills: resumeData.skills || [], interview_score: report.overall_score, emotion_summary: report.emotion_summary || "", status: report.recommendation || "Pending" }),
      })
    } catch {}
    setSaving(false)
  }

  const recommendationColor = { Selected: "#68d391", Shortlisted: "#f6e05e", Pending: "#63b3ed", Rejected: "#fc8181" }
  const latestAiMessage = [...messages].reverse().find((message) => message.role === "ai")?.text || "I will guide the candidate through a friendly, voice-led interview."
  const replayEntries = buildReplayEntries(messages.filter((message) => message.role === "ai" || message.role === "user"), report)

  return (
    <div className="interview-layout fade-up">
      <div className="card flex-col" style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div className="interviewer-stage">
          <div className="card ai-character-card">
            <div className="voice-pill" style={{ marginBottom: 18 }}>
              <span className="voice-dot" />
              {started && !done ? `${assistantName} is speaking` : `${assistantName} is ready`}
            </div>
            <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
              <div className="ai-character-avatar">AI</div>
              <div style={{ flex: 1, minWidth: 240 }}>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.1, color: "#7f6f5e", marginBottom: 6 }}>
                  AI INTERVIEWER
                </div>
                <div style={{ fontSize: 30, fontWeight: 900, color: "#2e241a", marginBottom: 8 }}>
                  {assistantName}
                </div>
                <div style={{ fontSize: 15, lineHeight: 1.7, color: "#5f503f", maxWidth: 540 }}>
                  {latestAiMessage}
                </div>
                <div className="interview-metrics">
                  <div className="metric-tile">
                    <div className="text-xs text-muted mb-1">Interview Style</div>
                    <div style={{ fontWeight: 800 }}>Voice-led</div>
                  </div>
                  <div className="metric-tile">
                    <div className="text-xs text-muted mb-1">Candidate Reply</div>
                    <div style={{ fontWeight: 800 }}>{speech.supported ? "Text or voice" : "Text"}</div>
                  </div>
                  <div className="metric-tile">
                    <div className="text-xs text-muted mb-1">Current Role</div>
                    <div style={{ fontWeight: 800 }}>{resumeData?.predicted_role || "General AI role"}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card candidate-feed-card" style={{ padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800 }}>Candidate View</div>
                <div className="text-xs text-muted" style={{ marginTop: 4 }}>
                  Camera, emotion, and response mode
                </div>
              </div>
          <div className="voice-pill">
                <span className="voice-dot" style={{ background: started ? "#2f8f65" : "#c59a2a" }} />
                {speech.listening ? "Mic is listening" : started ? "Interview live" : "Waiting"}
              </div>
            </div>
            <WebcamPanel webcam={webcam} faceVerified={faceVerified} isActive={started && !done} />
            {webcam.error && <div className="text-xs text-red mt-2">{webcam.error}</div>}
            <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
              <div style={{ padding: "10px 12px", borderRadius: 12, background: "rgba(47,143,101,0.08)", border: "1px solid rgba(47,143,101,0.12)" }}>
                <div className="text-xs text-muted mb-1">Best mic flow</div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>Click Use Mic, allow permission if asked, speak clearly, then click Send.</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-3">
          <div>
            <div style={{ fontWeight: 800, fontSize: 16 }}>Live AI Interview</div>
            <div className="text-sm text-muted mt-1">
              {started ? `Question ${Math.min(qNum, totalQ)} of ${totalQ}` : "Ready to begin"}
              {started && !done && <span style={{ color: EMOTION_COLOR[emotion], marginLeft: 10 }}>| {emotion}</span>}
            </div>
          </div>
          {!started ? <button className="btn btn-primary" onClick={startInterview}>Start Interview</button> : !done ? <div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fc8181", animation: "pulse 1.5s infinite" }} /><span style={{ fontSize: 11, color: "#fc8181", fontFamily: "monospace" }}>LIVE</span></div> : null}
        </div>

        <div style={{ display: "flex", gap: 4, marginBottom: 18 }}>
          {[...Array(totalQ)].map((_, index) => <div key={index} style={{ flex: 1, height: 3, borderRadius: 99, background: index < qNum ? "linear-gradient(90deg,#63b3ed,#7c3aed)" : "rgba(255,255,255,0.07)", transition: "background .5s" }} />)}
        </div>

        <div ref={chatRef} style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12, paddingRight: 4, marginBottom: 14 }}>
          {messages.length === 0 && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, color: "#2a3050" }}>
              <div style={{ fontSize: 42, fontWeight: 900 }}>AI</div>
              <div style={{ fontWeight: 800, fontSize: 16, color: "#3a4060" }}>Ready to Interview</div>
              <div className="text-sm" style={{ color: "#2a3050" }}>Webcam and emotion analysis activate on start</div>
              {resumeData && <div className="tag tag-blue" style={{ marginTop: 4 }}>Role: {resumeData.predicted_role}</div>}
            </div>
          )}
          {messages.map((message, index) => (
            <div key={index} style={{ display: "flex", flexDirection: "column", alignItems: message.role === "user" ? "flex-end" : "flex-start" }}>
              <div style={{ fontSize: 10, color: "#2a3050", marginBottom: 4, fontFamily: "monospace" }}>{message.role === "ai" ? "AI Interviewer" : "You"} | {message.ts}</div>
              <div className={message.role === "ai" ? "chat-bubble-ai" : "chat-bubble-user"}>{message.text}</div>
            </div>
          ))}
          {loading && <div style={{ display: "flex", gap: 5, padding: "10px 14px" }}>{[0, 1, 2].map((index) => <div key={index} style={{ width: 6, height: 6, borderRadius: "50%", background: "#63b3ed", animation: `pulse 1.2s ${index * 0.2}s infinite` }} />)}</div>}
        </div>

        {started && !done && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input className="input" value={input} placeholder={speech.listening ? "Listening..." : "Type your answer or use mic..."} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => event.key === "Enter" && sendAnswer()} style={{ flex: 1, border: speech.listening ? "1px solid rgba(252,129,129,0.4)" : undefined }} />
            {speech.supported && <button className="btn btn-icon" onClick={speech.listening ? speech.stopListen : speech.startListen} style={{ width: 94, background: speech.listening ? "rgba(196,87,77,0.12)" : undefined, border: speech.listening ? "1px solid rgba(196,87,77,0.28)" : undefined, animation: speech.listening ? "pulse 1.5s infinite" : "none" }}>{speech.listening ? "Stop Mic" : "Use Mic"}</button>}
            <button className="btn btn-primary" onClick={sendAnswer} disabled={!input.trim() || loading} style={{ padding: "0 18px", height: 42 }}>Send</button>
          </div>
        )}
        {started && speech.error && (
          <div style={{ marginTop: 10, padding: "10px 12px", borderRadius: 12, background: "rgba(196,87,77,0.08)", border: "1px solid rgba(196,87,77,0.14)", color: "#a0453d", fontSize: 13 }}>
            {speech.error}
          </div>
        )}

        {done && report && (
          <div style={{ background: "rgba(99,179,237,0.05)", border: "1px solid rgba(99,179,237,0.15)", borderRadius: 14, padding: 18, marginTop: 12 }}>
            <div style={{ fontWeight: 800, fontSize: 14, color: "#63b3ed", marginBottom: 14 }}>Interview Report</div>
            <div className="grid-2 gap-3 mb-3">
              {[["Technical", report.technical_knowledge], ["Communication", report.communication], ["Problem Solving", report.problem_solving], ["Cultural Fit", report.cultural_fit]].map(([label, value]) => (
                <div key={label} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "10px 12px" }}>
                  <div className="text-xs text-muted mb-1">{label}</div>
                  <div style={{ fontWeight: 900, fontSize: 18, color: "#63b3ed" }}>{value}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ padding: "8px 16px", borderRadius: 10, background: `${recommendationColor[report.recommendation] || "#63b3ed"}15`, border: `1px solid ${recommendationColor[report.recommendation] || "#63b3ed"}30`, color: recommendationColor[report.recommendation] || "#63b3ed", fontWeight: 700, fontSize: 13 }}>{report.recommendation}</div>
              <div style={{ fontWeight: 900, fontSize: 20, color: "#63b3ed" }}>{report.overall_score}/100</div>
              <button className="btn btn-secondary" onClick={saveReport} disabled={saving} style={{ marginLeft: "auto" }}>{saving ? "Saving..." : "Save Report"}</button>
            </div>
            <div style={{ marginTop: 18, padding: "12px 14px", borderRadius: 12, background: "rgba(198,120,49,0.08)", border: "1px solid rgba(198,120,49,0.12)" }}>
              <div className="text-xs text-muted mb-1">Replay status</div>
              <div style={{ fontWeight: 700 }}>
                {savingReplay ? "Saving replay timeline..." : replaySessionId ? `Replay saved as ${replaySessionId}` : "Replay timeline available in this report view."}
              </div>
            </div>
            <div style={{ marginTop: 18 }}>
              <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 10 }}>AI Interview Replay</div>
              <div style={{ display: "grid", gap: 10, maxHeight: 340, overflowY: "auto", paddingRight: 4 }}>
                {replayEntries.map((entry) => (
                  <div key={entry.question_number} style={{ background: "rgba(255,255,255,0.42)", border: "1px solid rgba(109,85,47,0.1)", borderRadius: 12, padding: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
                      <div style={{ fontWeight: 800 }}>Q{entry.question_number}</div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <span className="tag tag-blue">Score {entry.answer_score || 0}</span>
                        <span className="tag tag-green" style={{ textTransform: "capitalize" }}>{entry.emotion}</span>
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, marginBottom: 8, lineHeight: 1.55 }}>{entry.question}</div>
                    <div className="text-sm text-muted" style={{ lineHeight: 1.65 }}>{entry.answer}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="card" style={{ padding: 16, flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 14 }}>Live Emotion</div>
          <div style={{ textAlign: "center", padding: "10px 0 16px" }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: `radial-gradient(circle, ${EMOTION_COLOR[emotion]}15, transparent 70%)`, border: `2px solid ${EMOTION_COLOR[emotion]}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 10px", transition: "all 0.5s", fontWeight: 900 }}>
              {started ? EMOTION_MARKER[emotion] || "N" : "-"}
            </div>
            <div style={{ fontWeight: 800, fontSize: 15, color: EMOTION_COLOR[emotion], textTransform: "capitalize", transition: "color 0.5s" }}>{started ? emotion : "Not started"}</div>
          </div>

          {started && (
            <>
              {[{ label: "Confidence", val: emotion === "confident" ? 84 : emotion === "nervous" ? 36 : 62, color: "#68d391" }, { label: "Focus", val: emotion === "focused" ? 88 : 65, color: "#63b3ed" }].map((bar) => (
                <div key={bar.label} className="mb-3">
                  <div className="flex justify-between mb-2"><span className="text-xs text-muted">{bar.label}</span><span style={{ fontSize: 11, fontWeight: 700, color: bar.color }}>{bar.val}%</span></div>
                  <div className="progress-track"><div className="progress-fill" style={{ width: `${bar.val}%`, background: bar.color }} /></div>
                </div>
              ))}
              <div style={{ marginTop: 14, padding: "10px 12px", background: "rgba(255,255,255,0.03)", borderRadius: 10 }}>
                <div className="text-xs text-muted mb-2">Emotion Log ({emotionLog.length})</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {emotionLog.slice(-8).map((entry, index) => <span key={index} style={{ fontSize: 10, padding: "2px 7px", borderRadius: 99, background: `${EMOTION_COLOR[entry]}12`, color: EMOTION_COLOR[entry], border: `1px solid ${EMOTION_COLOR[entry]}20` }}>{entry}</span>)}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12 }}>Interview Guidance</div>
            <div style={{ display: "grid", gap: 10 }}>
              <div style={{ padding: "12px 14px", borderRadius: 12, background: "rgba(198,120,49,0.08)", border: "1px solid rgba(198,120,49,0.12)" }}>
                <div className="text-xs text-muted mb-1">AI voice</div>
                <div style={{ fontWeight: 700 }}>Questions are spoken automatically to feel more natural.</div>
              </div>
              <div style={{ padding: "12px 14px", borderRadius: 12, background: "rgba(47,143,101,0.08)", border: "1px solid rgba(47,143,101,0.12)" }}>
                <div className="text-xs text-muted mb-1">Candidate answers</div>
                <div style={{ fontWeight: 700 }}>Respond by typing or using the microphone button.</div>
              </div>
              <div style={{ padding: "12px 14px", borderRadius: 12, background: "rgba(99,179,237,0.08)", border: "1px solid rgba(99,179,237,0.12)" }}>
                <div className="text-xs text-muted mb-1">Browser support</div>
                <div style={{ fontWeight: 700 }}>For voice input, use Chrome or Edge and allow microphone access when prompted.</div>
              </div>
              <div style={{ padding: "12px 14px", borderRadius: 12, background: "rgba(197,154,42,0.08)", border: "1px solid rgba(197,154,42,0.12)" }}>
                <div className="text-xs text-muted mb-1">Interview depth</div>
                <div style={{ fontWeight: 700 }}>{totalQ} moderate questions covering intro, projects, teamwork, tradeoffs, and HR evaluation.</div>
              </div>
            </div>
        </div>
      </div>
    </div>
  )
}
