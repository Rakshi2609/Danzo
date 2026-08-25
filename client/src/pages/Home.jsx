import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiCheckSquare,
  FiRefreshCw,
  FiUsers,
  FiPieChart,
  FiSmartphone,
  FiShield,
  FiArrowRight,
  FiZap
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import InstallPWA from '../components/InstallPWA';
import { useAuth } from '../contexts/AuthContext';

/* ---------------- ReactBits-style: Split Text (per-char reveal) ---------------- */
function SplitText({ text, className = '', delay = 0 }) {
  return (
    <span className={className} aria-label={text}>
      {text.split('').map((ch, i) => (
        <motion.span
          key={i}
          aria-hidden
          className="inline-block"
          initial={{ opacity: 0, y: '0.4em', rotateX: -40 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 0.5, delay: delay + i * 0.025, ease: [0.22, 1, 0.36, 1] }}
        >
          {ch === ' ' ? '\u00A0' : ch}
        </motion.span>
      ))}
    </span>
  );
}

/* ---------------- ReactBits-style: Spotlight Card (mouse-follow glow) ---------------- */
function SpotlightCard({ children, className = '' }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: -999, y: -999 });
  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
  };
  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => setPos({ x: -999, y: -999 })}
      className={`relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] transition-colors hover:border-white/[0.12] ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(400px circle at ${pos.x}px ${pos.y}px, rgba(99,102,241,0.12), transparent 60%)`
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(220px circle at ${pos.x}px ${pos.y}px, rgba(255,255,255,0.05), transparent 70%)`
        }}
      />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}

/* ---------------- ReactBits-style: Infinite Marquee ---------------- */
function Marquee({ items, reverse = false }) {
  const row = [...items, ...items];
  return (
    <div className="relative overflow-hidden py-3 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
      <div
        className="flex w-max gap-3 animate-marquee"
        style={reverse ? { animationDirection: 'reverse' } : undefined}
      >
        {row.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-2 whitespace-nowrap rounded-full border border-white/10 bg-white/[0.03] px-5 py-2 text-sm text-zinc-300"
          >
            {item.icon}
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- ReactBits-style: Count Up statistic ---------------- */
function CountUp({ to, suffix = '' }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    let started = false;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !started) {
          started = true;
          const t0 = performance.now();
          const tick = (t) => {
            const p = Math.min((t - t0) / 1400, 1);
            setVal(Math.round(to * (1 - Math.pow(1 - p, 3))));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to]);
  return (
    <span ref={ref}>
      {val.toLocaleString()}
      {suffix}
    </span>
  );
}

/* ---------------- Aurora / beams backdrop ---------------- */
function Aurora() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute -top-[20%] left-[15%] w-[700px] h-[420px] rounded-full bg-indigo-600/25 blur-[130px]"
        animate={{ x: [0, 80, -30, 0], y: [0, 30, 60, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-[30%] right-[5%] w-[500px] h-[380px] rounded-full bg-violet-600/20 blur-[120px]"
        animate={{ x: [0, -60, 20, 0], y: [0, 40, -20, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* grid */}
      <div
        className="absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.35) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          maskImage: 'radial-gradient(ellipse 90% 55% at 50% 0%, black 30%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse 90% 55% at 50% 0%, black 30%, transparent 75%)'
        }}
      />
    </div>
  );
}

const features = [
  {
    icon: <FiCheckSquare className="w-6 h-6 text-indigo-400" />,
    title: 'Task Management',
    description: 'Create, assign, and track tasks with ease. Stay on top of your daily responsibilities.'
  },
  {
    icon: <FiRefreshCw className="w-6 h-6 text-violet-400" />,
    title: 'Recurring Tasks',
    description: 'Automate your workflow with tasks that repeat daily, weekly, or monthly.'
  },
  {
    icon: <FaWhatsapp className="w-6 h-6 text-emerald-400" />,
    title: 'WhatsApp Digests',
    description: 'Morning briefings and end-of-day summaries delivered straight to your WhatsApp.'
  },
  {
    icon: <FiUsers className="w-6 h-6 text-pink-400" />,
    title: 'Team Follow-ups',
    description: 'Keep track of pending follow-ups and ensure seamless team collaboration.'
  },
  {
    icon: <FiPieChart className="w-6 h-6 text-sky-400" />,
    title: 'Smart Dashboard',
    description: "A bird's-eye view of your productivity with an intuitive analytics dashboard."
  },
  {
    icon: <FiSmartphone className="w-6 h-6 text-indigo-400" />,
    title: 'Installable App',
    description: 'Install Danzo directly to your device for a fast, native-like experience.'
  }
];

const marqueeA = [
  { icon: <FiZap className="text-indigo-400" />, label: 'Smart reminders' },
  { icon: <FaWhatsapp className="text-emerald-400" />, label: 'WhatsApp digests' },
  { icon: <FiRefreshCw className="text-violet-400" />, label: 'Recurring workflows' },
  { icon: <FiShield className="text-pink-400" />, label: 'Role-based access' }
];
const marqueeB = [
  { icon: <FiPieChart className="text-sky-400" />, label: 'Completion analytics' },
  { icon: <FiCheckSquare className="text-indigo-400" />, label: 'Deadline tracking' },
  { icon: <FiUsers className="text-pink-400" />, label: 'Team follow-ups' },
  { icon: <FiSmartphone className="text-emerald-400" />, label: 'PWA installable' }
];

const stats = [
  { value: 100, suffix: '%', label: 'On-time visibility' },
  { value: 2, suffix: '/day', label: 'WhatsApp digests' },
  { value: 0, suffix: ' missed', label: 'Deadlines' }
];

export default function Home() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // subtle parallax tilt for hero mockup
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(my, { stiffness: 120, damping: 18 });
  const ry = useSpring(mx, { stiffness: 120, damping: 18 });
  const onTilt = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set(((e.clientX - r.left) / r.width - 0.5) * 8);
    my.set(-((e.clientY - r.top) / r.height - 0.5) * 6);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white font-sans overflow-x-hidden selection:bg-indigo-500/30">
      {/* ================= NAVBAR ================= */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.04] bg-[#0A0A0F]/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              D
            </div>
            <span className="font-bold text-lg tracking-tight">Danzo</span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#stats" className="hover:text-white transition-colors">Why Danzo</a>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:block"><InstallPWA /></div>
            <button
              onClick={() => navigate('/login')}
              className="hidden sm:inline-block text-sm font-medium text-zinc-300 hover:text-white transition-colors"
            >
              Login
            </button>
            <button
              onClick={() => navigate(currentUser ? '/dashboard' : '/login')}
              className="group inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-black text-sm font-semibold transition-transform hover:scale-[1.03] active:scale-95"
            >
              {currentUser ? 'Dashboard' : 'Get Started'}
              <FiArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* ================= HERO ================= */}
      <header className="relative pt-36 md:pt-44 pb-16 px-4 md:px-6 flex flex-col items-center min-h-[92vh]" onMouseMove={onTilt}>
        <Aurora />

        <div className="relative z-10 flex flex-col items-center text-center max-w-4xl w-full">
          <motion.a
            href="#features"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md px-4 py-1.5 text-xs font-medium text-zinc-300 hover:bg-white/[0.08] hover:border-white/20 transition-colors cursor-pointer"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-indigo-400" />
            </span>
            New: Daily WhatsApp digests just landed
            <FiArrowRight className="w-3 h-3" />
          </motion.a>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight leading-[1.05]">
            <SplitText text="Work better" className="text-white" delay={0.1} />
            <br />
            <SplitText
              text="with Danzo"
              delay={0.35}
              className="bg-gradient-to-r from-indigo-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent"
            />
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="text-lg md:text-xl text-zinc-400 mb-10 max-w-2xl font-light px-4"
          >
            Never miss a task, follow-up or recurring event.
            Morning plans and evening summaries — right in your WhatsApp.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.85 }}
            className="flex flex-col sm:flex-row items-center gap-3 mb-6"
          >
            <button
              onClick={() => navigate(currentUser ? '/dashboard' : '/login')}
              className="group inline-flex items-center gap-2 h-11 px-6 rounded-full bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-500/30 hover:bg-indigo-400 transition-colors active:scale-95"
            >
              Start organizing free
              <FiArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
            <div className="scale-110 origin-center">
              <InstallPWA />
            </div>
          </motion.div>

          {/* ===== Tilted app mockup ===== */}
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 1.0, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-5xl relative mt-8 md:mt-14"
            style={{ perspective: 1200 }}
          >
            <motion.div style={{ rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d' }}>
              <div className="rounded-2xl border border-white/10 bg-black/50 backdrop-blur-2xl shadow-[0_20px_80px_-20px_rgba(99,102,241,0.35)] overflow-hidden relative z-10 mx-2 md:mx-0">
                {/* window chrome */}
                <div className="h-11 border-b border-white/5 flex items-center px-4 bg-white/[0.04] gap-3">
                  <div className="flex gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500/70" />
                    <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
                    <span className="w-3 h-3 rounded-full bg-green-500/70" />
                  </div>
                  <div className="mx-auto bg-black/50 rounded-md px-10 md:px-32 py-1 text-[10px] md:text-xs text-zinc-500 border border-white/5 flex items-center gap-2">
                    <FiCheckSquare className="w-3 h-3" /> <span className="hidden sm:inline">Search anything…</span><span className="sm:hidden">Search</span>
                  </div>
                  <div className="w-14 hidden md:block" />
                </div>

                <div className="flex flex-col md:flex-row h-[320px] md:h-[420px]">
                  {/* sidebar */}
                  <div className="hidden md:flex w-60 border-r border-white/5 p-4 flex-col gap-1.5">
                    <div className="text-zinc-500 text-xs font-semibold mb-2 px-2 uppercase tracking-wider">Workspace</div>
                    {[
                      { icon: <FiPieChart className="w-4 h-4 text-indigo-400" />, label: 'Dashboard', active: true },
                      { icon: <FiCheckSquare className="w-4 h-4" />, label: 'My Tasks' },
                      { icon: <FiRefreshCw className="w-4 h-4" />, label: 'Recurring' },
                      { icon: <FiUsers className="w-4 h-4" />, label: 'Follow-ups' }
                    ].map((it) => (
                      <div
                        key={it.label}
                        className={`px-3 py-2 rounded-lg text-sm flex items-center gap-3 ${it.active ? 'bg-white/[0.07] text-white border border-white/[0.06]' : 'text-zinc-400 hover:bg-white/[0.03]'}`}
                      >
                        {it.icon} {it.label}
                        {it.active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400" />}
                      </div>
                    ))}
                    {/* mini progress ring */}
                    <div className="mt-auto px-3 py-3 rounded-xl bg-white/[0.03] border border-white/5">
                      <div className="text-[10px] uppercase tracking-wide text-zinc-500 mb-2">Today</div>
                      <div className="flex items-end justify-between">
                        <div>
                          <div className="text-xl font-semibold text-white">78%</div>
                          <div className="text-[10px] text-emerald-400">on track</div>
                        </div>
                        <svg width="52" height="52" viewBox="0 0 52 52" className="-rotate-90">
                          <circle cx="26" cy="26" r="22" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
                          <motion.circle
                            cx="26" cy="26" r="22" fill="none" stroke="rgb(129 140 248)" strokeWidth="5"
                            strokeLinecap="round" strokeDasharray="138.2"
                            initial={{ strokeDashoffset: 138.2 }}
                            animate={{ strokeDashoffset: 138.2 * 0.22 }}
                            transition={{ duration: 1.6, delay: 1.6, ease: 'easeOut' }}
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* main panel */}
                  <div className="flex-1 p-5 md:p-8 relative text-left">
                    <div className="text-xs md:text-sm text-indigo-400 font-medium mb-1">Today's Focus</div>
                    <div className="text-xl md:text-2xl font-semibold mb-4 md:mb-6">Complete Project Danzo</div>
                    <div className="space-y-3 md:space-y-4 max-w-md">
                      {[
                        { done: true, text: 'Review final mockups and update styling for the new homepage.' },
                        { done: false, text: 'Integrate the new PWA download button into navigation.' },
                        { done: false, text: 'Ship evening digest to WhatsApp at 6:00 PM.' }
                      ].map((t, i) => (
                        <motion.div
                          key={i}
                          className="flex items-start gap-3"
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 1.5 + i * 0.25 }}
                        >
                          <div
                            className={`w-4 md:w-5 h-4 md:h-5 rounded flex-shrink-0 mt-0.5 md:mt-1 flex items-center justify-center ${
                              t.done ? 'border border-indigo-400 bg-indigo-500/20' : 'border border-zinc-600'
                            }`}
                          >
                            {t.done && (
                              <svg width="10" height="10" viewBox="0 0 10 10" className="fill-none stroke-indigo-300" strokeWidth="2" strokeLinecap="round">
                                <path d="M1.5 5.5l2.5 2.5 4.5-5" />
                              </svg>
                            )}
                          </div>
                          <div className={`text-xs md:text-sm leading-relaxed ${t.done ? 'text-zinc-500 line-through decoration-zinc-600' : 'text-zinc-300'}`}>
                            {t.text}
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* whatsapp toast mock */}
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 2.4, duration: 0.6 }}
                      className="absolute bottom-4 md:bottom-6 right-4 md:right-6 max-w-[240px] rounded-xl rounded-br-sm bg-emerald-950/80 border border-emerald-500/20 backdrop-blur-md px-4 py-3 shadow-xl"
                    >
                      <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-medium mb-1">
                        <FaWhatsapp /> Danzo · 6:00 PM
                      </div>
                      <p className="text-xs text-zinc-200 leading-relaxed">
                        🌙 EOD summary: <b>3 done</b>, 1 pending. Great pace today! 🎉
                      </p>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
            <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-[85%] h-[90px] bg-indigo-600/30 blur-[60px] pointer-events-none" />
          </motion.div>
        </div>
      </header>

      {/* ================= MARQUEES ================= */}
      <section className="relative z-10 space-y-1 pb-4">
        <Marquee items={marqueeA} />
        <Marquee items={marqueeB} reverse />
      </section>

      {/* ================= FEATURES ================= */}
      <section id="features" className="py-24 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-3xl md:text-5xl font-bold mb-4 tracking-tight"
            >
              Everything you need,{' '}
              <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                built right in
              </span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="text-zinc-400 max-w-2xl mx-auto"
            >
              A carefully crafted set of features designed to make your daily workflow feel like magic.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
              >
                <SpotlightCard className="h-full">
                  <div className="p-6 group cursor-default h-full">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-5 border border-white/5 group-hover:scale-110 group-hover:border-indigo-500/30 transition-all duration-300">
                      {feature.icon}
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-zinc-100">{feature.title}</h3>
                    <p className="text-zinc-500 text-sm leading-relaxed">{feature.description}</p>
                  </div>
                </SpotlightCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= STATS ================= */}
      <section id="stats" className="pb-24 px-6 relative z-10">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.02] py-8 text-center"
            >
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
                <CountUp to={s.value} suffix={s.suffix} />
              </div>
              <div className="mt-2 text-xs uppercase tracking-widest text-zinc-500">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="px-6 pb-28 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative max-w-4xl mx-auto overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-b from-indigo-950/40 via-[#0D0D14] to-[#0A0A0F] px-6 py-16 md:py-20 text-center"
        >
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[500px] h-[240px] bg-indigo-500/25 blur-[100px] pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
              Ready to stop dropping tasks?
            </h2>
            <p className="text-zinc-400 max-w-xl mx-auto mb-8">
              Set up Danzo in under a minute and get your first WhatsApp briefing tomorrow morning.
            </p>
            <button
              onClick={() => navigate(currentUser ? '/dashboard' : '/login')}
              className="group inline-flex items-center gap-2 h-12 px-8 rounded-full bg-white text-black text-sm font-semibold hover:scale-[1.03] active:scale-95 transition-transform"
            >
              Get started now
              <FiArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </motion.div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="py-8 border-t border-white/5 text-center text-zinc-600 text-sm relative z-10 bg-[#0A0A0F]">
        <p>&copy; {new Date().getFullYear()} Danzo Workspace · Built by Rakshith</p>
      </footer>
    </div>
  );
}
