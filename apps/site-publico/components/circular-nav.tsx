"use client"
import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import {
  Home, Hotel, Tag, Ticket, MapPin, Phone,
  Search, User,
  Settings, RotateCcw, GripVertical, X,
  ChevronLeft, ChevronRight, Volume2, VolumeX
} from "lucide-react"
interface NavItem {
  id: string
  icon: React.ReactNode
  label: string
  href: string
}
const allNavItems: NavItem[] = [
  { id: "inicio", icon: <Home className="w-5 h-5" />, label: "Início", href: "/" },
  { id: "buscar", icon: <Search className="w-5 h-5" />, label: "Buscar", href: "/buscar" },
  { id: "hoteis", icon: <Hotel className="w-5 h-5" />, label: "Hotéis", href: "/hoteis" },
  { id: "promocoes", icon: <Tag className="w-5 h-5" />, label: "Promoções", href: "/promocoes" },
  { id: "ingressos", icon: <Ticket className="w-5 h-5" />, label: "Ingressos", href: "/ingressos" },
  { id: "atracoes", icon: <MapPin className="w-5 h-5" />, label: "Atrações", href: "/atracoes" },
  { id: "perfil", icon: <User className="w-5 h-5" />, label: "Perfil", href: "/perfil" },
  { id: "contato", icon: <Phone className="w-5 h-5" />, label: "Contato", href: "/contato" },
]
const ALL_IDS = allNavItems.map((m) => m.id)
const DEFAULT_OUTER = ["inicio", "buscar", "hoteis", "promocoes"]
const DEFAULT_INNER = ["ingressos", "atracoes", "perfil", "contato"]
const SK = {
  rotO: "rsv360-rot-outer",
  rotI: "rsv360-rot-inner",
  grpO: "rsv360-grp-outer",
  grpI: "rsv360-grp-inner",
}
const CX = 170
const CY = 200
const OUTER = { ir: 112, or: 168, itemR: 140 }
const INNER = { ir: 50, or: 104, itemR: 77 }
const WEDGE_GAP = 3
const STEP = 25
function toRad(d: number) {
  return (d * Math.PI) / 180
}
function wedgePath(ir: number, or: number, s: number, e: number) {
  const fmt = (n: number) => Number(n.toFixed(6))
  const sr = toRad(s),
    er = toRad(e)
  const ix1 = fmt(CX + ir * Math.cos(sr)),
    iy1 = fmt(CY - ir * Math.sin(sr))
  const ix2 = fmt(CX + ir * Math.cos(er)),
    iy2 = fmt(CY - ir * Math.sin(er))
  const ox2 = fmt(CX + or * Math.cos(er)),
    oy2 = fmt(CY - or * Math.sin(er))
  const ox1 = fmt(CX + or * Math.cos(sr)),
    oy1 = fmt(CY - or * Math.sin(sr))
  const la = Math.abs(e - s) > 180 ? 1 : 0
  return `M${ix1},${iy1} A${ir},${ir} 0 ${la} 0 ${ix2},${iy2} L${ox2},${oy2} A${or},${or} 0 ${la} 1 ${ox1},${oy1} Z`
}
function getWedges(count: number, rotation: number) {
  if (!count) return []
  const ws = (180 - Math.max(0, count - 1) * WEDGE_GAP) / count
  return Array.from({ length: count }, (_, i) => {
    const start = i * (ws + WEDGE_GAP) + rotation
    return { start, end: start + ws, mid: start + ws / 2 }
  })
}
function itemPos(r: number, deg: number) {
  const rad = toRad(deg)
  return { x: CX + r * Math.cos(rad), y: CY - r * Math.sin(rad) }
}
function load<T>(key: string, fb: T): T {
  if (typeof window === "undefined") return fb
  try {
    const v = localStorage.getItem(key)
    return v !== null ? (JSON.parse(v) as T) : fb
  } catch {
    return fb
  }
}
let dbTimer: ReturnType<typeof setTimeout> | null = null
function saveDeb(key: string, val: unknown) {
  if (dbTimer) clearTimeout(dbTimer)
  dbTimer = setTimeout(() => {
    try {
      localStorage.setItem(key, JSON.stringify(val))
    } catch {}
  }, 200)
}
function saveNow(key: string, val: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(val))
  } catch {}
}
function normalize(a: string[] | null, b: string[] | null) {
  if (!a || !b || !a.length || !b.length)
    return { a: [...DEFAULT_OUTER], b: [...DEFAULT_INNER] }
  const va = a.filter((id) => ALL_IDS.includes(id))
  const vb = b.filter((id) => ALL_IDS.includes(id) && !va.includes(id))
  const used = new Set([...va, ...vb])
  ALL_IDS.filter((id) => !used.has(id)).forEach((id) => {
    va.length <= vb.length ? va.push(id) : vb.push(id)
  })
  if (!va.length || !vb.length)
    return { a: [...DEFAULT_OUTER], b: [...DEFAULT_INNER] }
  return { a: va, b: vb }
}
function isAngleVisible(midAngle: number) {
  const n = ((midAngle % 360) + 360) % 360
  return n >= -5 && n <= 185
}
async function playAirplaneChime() {
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AC) return
    const ctx = new AC()
    if (ctx.state === "suspended") {
      await ctx.resume()
    }
    const chime = (startTime: number, freq: number, duration: number) => {
      const harmonics = [
        { f: 1, g: 0.45 },
        { f: 2, g: 0.12 },
        { f: 3, g: 0.06 },
        { f: 4.02, g: 0.025 },
      ]
      harmonics.forEach(({ f, g }) => {
        const osc = ctx.createOscillator()
        const gainNode = ctx.createGain()
        osc.connect(gainNode)
        gainNode.connect(ctx.destination)
        osc.type = "sine"
        osc.frequency.setValueAtTime(freq * f, startTime)
        gainNode.gain.setValueAtTime(0.001, startTime)
        gainNode.gain.linearRampToValueAtTime(g, startTime + 0.02)
        gainNode.gain.setValueAtTime(g, startTime + 0.05)
        gainNode.gain.exponentialRampToValueAtTime(g * 0.5, startTime + duration * 0.4)
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration)
        osc.start(startTime)
        osc.stop(startTime + duration + 0.1)
      })
    }
    const now = ctx.currentTime + 0.05
    chime(now, 698.46, 0.9)
    chime(now + 0.6, 523.25, 1.2)
    setTimeout(() => { try { ctx.close() } catch {} }, 3500)
  } catch {}
}
export default function CircularNav() {
  const [isOpen, setIsOpen] = useState(false)
  const [rotO, setRotO] = useState(0)
  const [rotI, setRotI] = useState(0)
  const [outerIds, setOuterIds] = useState<string[]>(DEFAULT_OUTER)
  const [innerIds, setInnerIds] = useState<string[]>(DEFAULT_INNER)
  const [active, setActive] = useState<"outer" | "inner">("outer")
  const [showCfg, setShowCfg] = useState(false)
  const [ready, setReady] = useState(false)
  const [showPlane, setShowPlane] = useState(false)
  const [soundOn, setSoundOn] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{
    ring: "outer" | "inner"
    startAngle: number
    startRot: number
    cx: number
    cy: number
  } | null>(null)
  useEffect(() => {
    setRotO(load(SK.rotO, 0))
    setRotI(load(SK.rotI, 0))
    const n = normalize(load(SK.grpO, null), load(SK.grpI, null))
    setOuterIds(n.a)
    setInnerIds(n.b)
    const savedSound = load<boolean | null>("rsv360-sound-enabled", null)
    if (savedSound !== null) setSoundOn(savedSound)
    setReady(true)
  }, [])
  useEffect(() => {
    if (ready) saveDeb(SK.rotO, rotO)
  }, [rotO, ready])
  useEffect(() => {
    if (ready) saveDeb(SK.rotI, rotI)
  }, [rotI, ready])
  const outerItems = outerIds
    .map((id) => allNavItems.find((n) => n.id === id))
    .filter(Boolean) as NavItem[]
  const innerItems = innerIds
    .map((id) => allNavItems.find((n) => n.id === id))
    .filter(Boolean) as NavItem[]
  const outerW = getWedges(outerItems.length, rotO)
  const innerW = getWedges(innerItems.length, rotI)
  const close = useCallback(() => {
    setIsOpen(false)
    setShowCfg(false)
  }, [])
  const toggleSound = useCallback(() => {
    setSoundOn((prev) => {
      const next = !prev
      saveNow("rsv360-sound-enabled", next)
      return next
    })
  }, [])
  const toggle = useCallback(() => {
    if (isOpen) {
      close()
    } else {
      setIsOpen(true)
      if (soundOn) {
        void playAirplaneChime()
        setShowPlane(true)
        setTimeout(() => setShowPlane(false), 1800)
      }
    }
  }, [isOpen, close, soundOn])
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showCfg) setShowCfg(false)
        else close()
      }
    }
    document.addEventListener("keydown", fn)
    return () => document.removeEventListener("keydown", fn)
  }, [close, showCfg])
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])
  const rotateActive = useCallback(
    (dir: number) => {
      if (active === "outer") setRotO((r) => r + dir * STEP)
      else setRotI((r) => r + dir * STEP)
    },
    [active]
  )
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!containerRef.current || showCfg) return
      const rect = containerRef.current.getBoundingClientRect()
      const cx = rect.left + CX
      const cy = rect.top + CY
      const dx = e.clientX - cx
      const dy = -(e.clientY - cy)
      const dist = Math.sqrt(dx * dx + dy * dy)
      const ring: "outer" | "inner" =
        dist > (INNER.or + OUTER.ir) / 2 ? "outer" : "inner"
      setActive(ring)
      const startAngle = Math.atan2(dy, dx) * (180 / Math.PI)
      ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
      dragRef.current = {
        ring,
        startAngle,
        startRot: ring === "outer" ? rotO : rotI,
        cx,
        cy,
      }
    },
    [rotO, rotI, showCfg]
  )
  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragRef.current) return
      const dx = e.clientX - dragRef.current.cx
      const dy = -(e.clientY - dragRef.current.cy)
      const angle = Math.atan2(dy, dx) * (180 / Math.PI)
      const delta = angle - dragRef.current.startAngle
      const newRot = dragRef.current.startRot + delta
      if (dragRef.current.ring === "outer") setRotO(newRot)
      else setRotI(newRot)
    },
    []
  )
  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    ;(e.target as HTMLElement).releasePointerCapture?.(e.pointerId)
    dragRef.current = null
  }, [])
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      const d = e.deltaY > 0 ? STEP : -STEP
      if (active === "outer") setRotO((r) => r + d)
      else setRotI((r) => r + d)
    },
    [active]
  )
  const moveItem = useCallback((itemId: string, to: "outer" | "inner") => {
    setOuterIds((pO) => {
      setInnerIds((pI) => {
        const cO = pO.filter((id) => id !== itemId)
        const cI = pI.filter((id) => id !== itemId)
        const nO = to === "outer" ? [...cO, itemId] : cO
        const nI = to === "inner" ? [...cI, itemId] : cI
        if (!nO.length || !nI.length) return pI
        saveNow(SK.grpO, nO)
        saveNow(SK.grpI, nI)
        setOuterIds(nO)
        return nI
      })
      return pO
    })
  }, [])
  const resetAll = useCallback(() => {
    setOuterIds([...DEFAULT_OUTER])
    setInnerIds([...DEFAULT_INNER])
    setRotO(0)
    setRotI(0)
    saveNow(SK.grpO, DEFAULT_OUTER)
    saveNow(SK.grpI, DEFAULT_INNER)
    saveNow(SK.rotO, 0)
    saveNow(SK.rotI, 0)
  }, [])
  const renderItem = (
    item: NavItem,
    p: { x: number; y: number },
    ring: "outer" | "inner",
    delay: number
  ) => {
    const isOuter = ring === "outer"
    const btnSize = isOuter ? 42 : 36
    const fontSize = isOuter ? "0.55rem" : "0.5rem"
    const bg = isOuter
      ? "linear-gradient(135deg, #22c55e, #15803d)"
      : "linear-gradient(135deg, #3b82f6, #2563eb)"
    const shadow = isOuter
      ? "0 3px 10px rgba(34,197,94,0.5)"
      : "0 3px 10px rgba(59,130,246,0.5)"
    return (
      <Link
        key={item.id}
        href={item.href}
        onClick={(e) => {
          e.stopPropagation()
          close()
        }}
        tabIndex={isOpen ? 0 : -1}
        style={{
          position: "absolute",
          left: p.x,
          top: p.y,
          transform: "translate(-50%, -50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textDecoration: "none",
          color: "#fff",
          zIndex: 3,
          opacity: isOpen ? 1 : 0,
          transition: `opacity 0.3s ease ${delay}s`,
        }}
      >
        <div
          style={{
            width: btnSize,
            height: btnSize,
            borderRadius: "50%",
            background: bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: shadow,
            border: "2px solid rgba(255,255,255,0.2)",
          }}
        >
          {item.icon}
        </div>
        <span
          style={{
            fontSize,
            fontWeight: 700,
            marginTop: 2,
            whiteSpace: "nowrap",
            textShadow: "0 1px 3px rgba(0,0,0,0.5)",
          }}
        >
          {item.label}
        </span>
      </Link>
    )
  }
  const smallBtn: React.CSSProperties = {
    width: 30,
    height: 30,
    borderRadius: "50%",
    border: "none",
    background: "rgba(255,255,255,0.12)",
    color: "#fff",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }
  const pillBtn = (isActive: boolean, color: string): React.CSSProperties => ({
    padding: "3px 8px",
    borderRadius: 10,
    border: "none",
    background: isActive ? color : "rgba(255,255,255,0.08)",
    color: "#fff",
    fontSize: "0.55rem",
    fontWeight: 700,
    cursor: "pointer",
    transition: "background 0.2s",
    textTransform: "uppercase",
  })
  return (
    <>
      {/* Overlay escuro ao abrir */}
      <div
        onClick={close}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(0,0,0,0.6)",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transition: "opacity 0.3s",
          zIndex: 90,
        }}
      />
      {/* Animação do avião */}
      {showPlane && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 94,
            pointerEvents: "none",
            overflow: "hidden",
          }}
        >
          <svg
            width="80"
            height="40"
            viewBox="0 0 80 40"
            fill="none"
            style={{
              position: "absolute",
              animation: "planeIntro 1.5s cubic-bezier(0.25, 0.1, 0.25, 1) forwards",
            }}
          >
            <path
              d="M70 20 L50 20 L40 10 L38 20 L20 16 L18 20 L35 22 L30 30 L34 28 L38 22 L48 22 L70 20Z"
              fill="rgba(255,255,255,0.9)"
            />
            <path
              d="M10 20 L35 20"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />
            <path
              d="M0 20 L18 20"
              stroke="rgba(255,255,255,0.15)"
              strokeWidth="1"
              strokeDasharray="2 4"
            />
          </svg>
          <style>{`
            @keyframes planeIntro {
              0% {
                left: -100px;
                bottom: 30px;
                opacity: 0;
                transform: rotate(-15deg) scale(0.6);
              }
              10% {
                opacity: 1;
              }
              50% {
                left: 45%;
                bottom: 55%;
                transform: rotate(-8deg) scale(1);
                opacity: 1;
              }
              80% {
                opacity: 0.7;
                transform: rotate(-5deg) scale(0.8);
              }
              100% {
                left: 110%;
                bottom: 70%;
                opacity: 0;
                transform: rotate(-3deg) scale(0.5);
              }
            }
          `}</style>
        </div>
      )}
      {/* Container do Semicírculo */}
      <nav
        ref={containerRef}
        id="circular-nav"
        aria-label="Menu de navegação principal"
        onPointerDown={isOpen && !showCfg ? handlePointerDown : undefined}
        onPointerMove={isOpen ? handlePointerMove : undefined}
        onPointerUp={isOpen ? handlePointerUp : undefined}
        onWheel={isOpen ? handleWheel : undefined}
        style={{
          position: "fixed",
          bottom: 0,
          left: "50%",
          width: 340,
          height: 210,
          marginLeft: -170,
          transform: isOpen ? "scale(1)" : "scale(0)",
          transformOrigin: `${CX}px ${CY}px`,
          transition: "transform 0.45s cubic-bezier(0.175,0.885,0.32,1.275)",
          zIndex: 95,
          pointerEvents: isOpen ? "auto" : "none",
          touchAction: "none",
          overflow: "hidden",
        }}
      >
        {/* Fundos SVG em fatia (wedge) */}
        <svg
          width="340"
          height="210"
          viewBox="0 0 340 210"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            pointerEvents: "none",
          }}
        >
          <defs>
            <clipPath id="semi-clip">
              <rect x="0" y="0" width="340" height={CY + 2} />
            </clipPath>
          </defs>
          <g clipPath="url(#semi-clip)">
            {outerW.map((w, i) => (
              <path
                key={`ow${i}`}
                d={wedgePath(OUTER.ir, OUTER.or, w.start, w.end)}
                fill={active === "outer" ? "#3a4556" : "#2d3748"}
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="1.5"
                style={{ transition: "fill 0.2s" }}
              />
            ))}
            {innerW.map((w, i) => (
              <path
                key={`iw${i}`}
                d={wedgePath(INNER.ir, INNER.or, w.start, w.end)}
                fill={active === "inner" ? "#3a4556" : "#2d3748"}
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="1.5"
                style={{ transition: "fill 0.2s" }}
              />
            ))}
          </g>
        </svg>
        {/* Itens do anel externo */}
        {outerItems.map((item, i) => {
          if (!outerW[i] || !isAngleVisible(outerW[i].mid)) return null
          const p = itemPos(OUTER.itemR, outerW[i].mid)
          return renderItem(item, p, "outer", i * 0.05)
        })}
        {/* Itens do anel interno */}
        {innerItems.map((item, i) => {
          if (!innerW[i] || !isAngleVisible(innerW[i].mid)) return null
          const p = itemPos(INNER.itemR, innerW[i].mid)
          return renderItem(item, p, "inner", i * 0.05 + 0.1)
        })}
      </nav>
      {/* Barra de controles inferior */}
      {isOpen && !showCfg && (
        <div
          style={{
            position: "fixed",
            bottom: 4,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 101,
            display: "flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          <button
            onClick={() => rotateActive(-1)}
            style={smallBtn}
            aria-label="Girar esquerda"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setActive("outer")}
            style={pillBtn(active === "outer", "rgba(34,197,94,0.7)")}
          >
            Ext
          </button>
          <button
            onClick={() => setActive("inner")}
            style={pillBtn(active === "inner", "rgba(59,130,246,0.7)")}
          >
            Int
          </button>
          <button
            onClick={() => rotateActive(1)}
            style={smallBtn}
            aria-label="Girar direita"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={toggleSound}
            style={{
              ...smallBtn,
              background: soundOn ? "rgba(34,197,94,0.4)" : "rgba(255,255,255,0.08)",
              transition: "background 0.2s",
            }}
            aria-label={soundOn ? "Desativar som" : "Ativar som"}
            title={soundOn ? "Som ativado" : "Som desativado"}
          >
            {soundOn
              ? <Volume2 className="w-3.5 h-3.5" />
              : <VolumeX className="w-3.5 h-3.5" style={{ opacity: 0.5 }} />}
          </button>
          <button
            onClick={() => setShowCfg(true)}
            style={{ ...smallBtn, marginLeft: 2 }}
            aria-label="Configurações"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
      {/* Botão central Menu/Fechar */}
      <button
        onClick={toggle}
        aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
        aria-expanded={isOpen}
        aria-controls="circular-nav"
        style={{
          position: "fixed",
          bottom: isOpen ? 28 : 0,
          left: "50%",
          marginLeft: isOpen ? -22 : -28,
          width: isOpen ? 44 : 56,
          height: isOpen ? 44 : 56,
          borderRadius: "50%",
          border: "none",
          background: isOpen
            ? "linear-gradient(135deg, #ef4444, #dc2626)"
            : "linear-gradient(135deg, #22c55e, #15803d)",
          color: "#fff",
          fontWeight: 800,
          fontSize: isOpen ? "0.55rem" : "0.7rem",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          cursor: "pointer",
          zIndex: 102,
          boxShadow: isOpen
            ? "0 -2px 15px rgba(239,68,68,0.4)"
            : "0 -2px 15px rgba(34,197,94,0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          paddingBottom: isOpen ? 0 : 8,
          transition: "all 0.3s ease",
        }}
      >
        {isOpen ? <X className="w-5 h-5" /> : "Menu"}
      </button>
      {/* Modal de customização de grupos */}
      {showCfg && (
        <>
          <div
            onClick={() => setShowCfg(false)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "rgba(0,0,0,0.5)",
              zIndex: 99,
            }}
          />
          <div
            role="dialog"
            aria-modal="true"
            style={{
              position: "fixed",
              bottom: 60,
              left: "50%",
              transform: "translateX(-50%)",
              width: 280,
              maxHeight: "60vh",
              overflowY: "auto",
              background: "#1e293b",
              borderRadius: 16,
              padding: 20,
              zIndex: 100,
              color: "#fff",
              boxShadow: "0 -4px 30px rgba(0,0,0,0.5)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <h3 style={{ fontSize: "0.9rem", fontWeight: 700, margin: 0 }}>
                Customizar Grupos
              </h3>
              <button
                onClick={() => setShowCfg(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#fff",
                  cursor: "pointer",
                  padding: 4,
                }}
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  color: "#22c55e",
                  marginBottom: 8,
                }}
              >
                Anel Externo
              </div>
              {outerItems.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 12px",
                    marginBottom: 4,
                    borderRadius: 8,
                    background: "rgba(34,197,94,0.12)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <GripVertical
                      className="w-3 h-3"
                      style={{ opacity: 0.4 }}
                    />
                    <span style={{ fontSize: "0.8rem" }}>{item.label}</span>
                  </div>
                  {outerItems.length > 1 && (
                    <button
                      onClick={() => moveItem(item.id, "inner")}
                      style={{
                        background: "rgba(59,130,246,0.3)",
                        border: "none",
                        color: "#fff",
                        fontSize: "0.6rem",
                        fontWeight: 700,
                        padding: "3px 8px",
                        borderRadius: 6,
                        cursor: "pointer",
                      }}
                    >
                      → Int
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div style={{ marginBottom: 16 }}>
              <div
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  color: "#3b82f6",
                  marginBottom: 8,
                }}
              >
                Anel Interno
              </div>
              {innerItems.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 12px",
                    marginBottom: 4,
                    borderRadius: 8,
                    background: "rgba(59,130,246,0.12)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <GripVertical
                      className="w-3 h-3"
                      style={{ opacity: 0.4 }}
                    />
                    <span style={{ fontSize: "0.8rem" }}>{item.label}</span>
                  </div>
                  {innerItems.length > 1 && (
                    <button
                      onClick={() => moveItem(item.id, "outer")}
                      style={{
                        background: "rgba(34,197,94,0.3)",
                        border: "none",
                        color: "#fff",
                        fontSize: "0.6rem",
                        fontWeight: 700,
                        padding: "3px 8px",
                        borderRadius: 6,
                        cursor: "pointer",
                      }}
                    >
                      ← Ext
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={resetAll}
              style={{
                width: "100%",
                padding: "8px 0",
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.2)",
                background: "transparent",
                color: "rgba(255,255,255,0.7)",
                fontSize: "0.75rem",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              <RotateCcw className="w-3 h-3" />
              Restaurar Padrão
            </button>
          </div>
        </>
      )}
    </>
  )
}
