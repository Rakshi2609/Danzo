import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useScroll, useTransform } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiCheckSquare,
  FiRefreshCw,
  FiUsers,
  FiPieChart,
  FiSmartphone,
  FiShield,
  FiArrowRight,
  FiArrowUpRight
} from 'react-icons/fi';
import { FaWhatsapp, FaCheck } from 'react-icons/fa';
import InstallPWA from '../components/InstallPWA';
import { useAuth } from '../contexts/AuthContext';

/* ---------- shared reveal wrapper ---------- */
function Reveal({ children, delay = 0, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ---------- border-beam card (Magic UI style) ---------- */
function BeamCard({ children, className = '' }) {
  return (
    <div className={`group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0D0D13]/80 ${className}`}>
      {/* animated border glow */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <motion.div
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400 to-transparent"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />
      </div>
      {children}
    </div>
  );
}

/* ---------- WhatsApp chat mock ---------- */
function ChatMock() {
  const msgs = [
    { dir: 'in', title: 'Danzo · 9:00 AM', body: '☀️ Morning plan — 4 tasks today. First up: Review mockups at 10 AM.', delay: 0.2 },
    { dir: 'out', title: 'You', body: 'Got it 👍', delay: 0.7 },
    { dir: 'in', title: 'Danzo · 6:00 PM', body: '🌙 EOD summary: 3 done, 1 pending. Great pace today! 🎉', delay: 1.2 }
  ];
  return (
    <div className="flex flex-col gap-2.5 p-5 h-full justify-center">
      {msgs.map((m, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 12, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: m.delay, duration: 0.45 }}
          className={`max-w-[85%] rounded-2xl px-4 py-3 text-[13px] leading-snug ${
            m.dir === 'in'
              ? 'self-start rounded-tl-sm bg-[#1B2B23] border border-emerald-500/15 text-zinc-200'
              : 'self-end rounded-tr-sm bg-indigo-600/90 text-white'
          }`}
        >
          <div className={`text-[10px] font-medium mb-1 ${m.dir === 'in' ? 'text-emerald-400' : 'text-indigo-200'}`}>
            {m.title}
          </div>
          {m.body}
        </motion.div>
      ))}
    </div>
  );
}

/* ---------- app window mockup ---------- */
function AppMock() {
  return (
    <div className="rounded-xl border border-white/10 bg-black/60 overflow-hidden shadow-2xl">
      <div className="h-9 border-b border-white/5 flex items-center px-4 bg-white/[0.03] gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
        <div className="mx-auto text-[10px] text-zinc-500 border border-white/5 bg-black/40 rounded px-6 py-0.5">
          denzo.onrender.com
        </div>
        <div className="w-10" />
      </div>
      <div className="flex h-[260px] md:h-[300px]">
        <div className="hidden md:flex w-48 border-r border-white/5 p-3 flex-col gap-1">
          {[
            { icon: <FiPieChart className="w-3.5 h-3.5 text-indigo-400" />, label: 'Dashboard', active: true },
            { icon: <FiCheckSquare className="w-3.5 h-3.5" />, label: 'My Tasks' },
            { icon: <FiRefreshCw className="w-3.5 h-3.5" />, label: 'Recurring' },
            { icon: <FiUsers className="w-3.5 h-3.5" />, label: 'Follow-ups' }
          ].map((it) => (
            <div key={it.label} className={`px-3 py-2 rounded-lg text-xs flex items-center gap-2.5 ${it.active ? 'bg-white/[0.06] text-white' : 'text-zinc-500'}`}>
              {it.icon}{it.label}
            </div>
          ))}
          <div className="mt-auto rounded-lg bg-white/[0.03] border border-white/5 p-3">
            <div className="text-[9px] uppercase tracking-wider text-zinc-500 mb-1.5">Today</div>
            <div className="flex items-center gap-2">
              <svg width="36" height="36" viewBox="0 0 36 36" className="-rotate-90 shrink-0">
                <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
                <motion.circle
                  cx="18" cy="18" r="15" fill="none" stroke="rgb(129 140 248)" strokeWidth="4" strokeLinecap="round"
                  strokeDasharray="94.2"
                  initial={{ strokeDashoffset: 94.2 }}
                  whileInView={{ strokeDashoffset: 94.2 * 0.22 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.4, ease: 'easeOut' }}
                />
              </svg>
              <div>
                <div className="text-sm font-semibold text-white">78%</div>
                <div className="text-[9px] text-emerald-400">on track</div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 p-4 md:p-5 text-left">
          <div className="text-[11px] text-indigo-400 font-medium mb-0.5">Today's Focus</div>
          <div className="text-base md:text-lg font-semibold mb-3 md:mb-4">Complete Project Danzo</div>
          <div className="space-y-2.5 max-w-sm">
            {[
              { done: true, text: 'Review final mockups and update homepage styling' },
              { done: false, text: 'Integrate the PWA download button into navigation' },
              { done: false, text: 'Ship evening digest to WhatsApp at 6 PM' }
            ].map((t, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-2.5"
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.15 }}
              >
                <span className={`w-4 h-4 rounded flex-shrink-0 flex items-center justify-center ${t.done ? 'bg-indigo-500 border border-indigo-400' : 'border border-zinc-600'}`}>
                  {t.done && <FaCheck className="w-2 h-2 text-white" />}
                </span>
                <span className={`text-[11px] md:text-xs ${t.done ? 'text-zinc-500 line-through' : 'text-zinc-300'}`}>{t.text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Count Up ---------- */
function CountUp({ to, suffix = '' }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      const t0 = performance.now();
      const tick = (t) => {
        const p = Math.min((t - t0) / 1300, 1);
        setVal(Math.round(to * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

const stats = [
  { value: 2, suffix: '/day', label: 'WhatsApp digests' },
  { value: 100, suffix: '%', label: 'Deadline visibility' },
  { value: 30, suffix: 's', label: 'To log a task' }
];

export default function Home() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const heroRef = useRef(null);

  // parallax fade on scroll for the mockup
  const { scrollY } = useScroll();
  const mockY = useTransform(scrollY, [0, 500], [0, 60]);
  const mockScale = useTransform(scrollY, [0, 500], [1, 0.96]);

  // subtle hero tilt
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(my, { stiffness: 100, damping: 20 });
  const ry = useSpring(mx, { stiffness: 100, damping: 20 });

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white font-sans overflow-x-hidden antialiased selection:bg-indigo-500/30">
      {/* ================= NAV ================= */}
      <nav className="fixed top-4 left-0 right-0 z-50 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between rounded-2xl border border-white/[0.07] bg-[#0A0A0F]/80 backdrop-blur-xl pl-4 pr-2 py-2 shadow-lg shadow-black/40">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center font-bold text-xs text-white">
              D
            </div>
            <span className="font-semibold text-sm tracking-tight">Danzo</span>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-[13px] font-medium text-zinc-400">
            <a href="#product" className="hover:text-white transition-colors">Product</a>
            <a href="#digests" className="hover:text-white transition-colors">WhatsApp</a>
            <a href="#stats" className="hover:text-white transition-colors">Numbers</a>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/login')}
              className="hidden sm:inline-block text-[13px] font-medium text-zinc-300 hover:text-white px-3 py-2 transition-colors"
            >
              Login
            </button>
            <button
              onClick={() => navigate(currentUser ? '/dashboard' : '/login')}
              className="group inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-white text-black text-[13px] font-semibold hover:bg-zinc-200 transition-colors"
            >
              {currentUser ? 'Dashboard' : 'Get started'}
              <FiArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* ================= HERO ================= */}
      <header
        ref={heroRef}
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          mx.set(((e.clientX - r.left) / r.width - 0.5) * 6);
          my.set(-((e.clientY - r.top) / r.height - 0.5) * 4);
        }}
        className="relative pt-40 md:pt-48 pb-10 px-4 flex flex-col items-center text-center"
      >
        {/* background: single clean radial + grid */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-indigo-600/[0.13] blur-[140px] rounded-full" />
          <div
            className="absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
              backgroundSize: '64px 64px',
              maskImage: 'radial-gradient(ellipse 80% 50% at 50% 0%, black 20%, transparent 70%)',
              WebkitMaskImage: 'radial-gradient(ellipse 80% 50% at 50% 0%, black 20%, transparent 70%)'
            }}
          />
        </div>

        <div className="relative z-10 max-w-3xl">
          <motion.a
            href="#digests"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur px-3.5 py-1.5 text-xs font-medium text-zinc-300 hover:bg-white/[0.08] transition-colors"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            WhatsApp digests are live
            <FiArrowUpRight className="w-3 h-3 text-zinc-500" />
          </motion.a>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-[42px] leading-[1.05] md:text-7xl font-semibold tracking-[-0.03em] mb-5"
          >
            Tasks that come to you,
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              not the other way
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="text-base md:text-lg text-zinc-400 mb-8 max-w-xl mx-auto leading-relaxed"
          >
            Danzo plans your morning, tracks your follow-ups, and texts you a
            wrap-up every evening — so nothing slips.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <button
              onClick={() => navigate(currentUser ? '/dashboard' : '/login')}
              className="group inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-white text-black text-sm font-semibold hover:bg-zinc-200 transition-colors"
            >
              Start for free
              <FiArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
            <a
              href="#product"
              className="inline-flex items-center gap-2 h-11 px-6 rounded-xl border border-white/10 bg-white/[0.03] text-sm font-medium text-zinc-200 hover:bg-white/[0.07] transition-colors"
            >
              See how it works
            </a>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-4 text-xs text-zinc-600"
          >
            Free forever for personal use · No credit card
          </motion.p>
        </div>

        {/* hero mockup with parallax + tilt */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ y: mockY, scale: mockScale, perspective: 1200 }}
          className="relative z-10 w-full max-w-3xl mt-14"
        >
          <motion.div style={{ rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d' }}>
            <AppMock />
          </motion.div>
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[70%] h-16 bg-indigo-600/25 blur-[60px] pointer-events-none" />
        </motion.div>
      </header>

      {/* ================= BENTO GRID ================= */}
      <section id="product" className="px-4 pt-24 pb-8 relative z-10">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-12">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-indigo-400 mb-3">Product</p>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-3">
              One workspace, zero chaos
            </h2>
            <p className="text-zinc-400 max-w-lg mx-auto text-sm md:text-base">
              Everything Danzo does, in one glance.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[minmax(0,auto)]">
            {/* WhatsApp digests — large cell */}
            <Reveal className="md:col-span-2 md:row-span-2" delay={0}>
              <BeamCard className="h-full" id="digests">
                <div className="grid md:grid-cols-2 h-full">
                  <div className="p-7 flex flex-col justify-center">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
                      <FaWhatsapp className="w-5 h-5 text-emerald-400" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Digests on WhatsApp</h3>
                    <p className="text-sm text-zinc-400 leading-relaxed mb-4">
                      A friendly morning plan and an end-of-day wrap-up, delivered
                      automatically. Reply-friendly, no app needed.
                    </p>
                    <div className="flex gap-2 text-[11px]">
                      <span className="rounded-full bg-white/[0.05] border border-white/10 px-2.5 py-1 text-zinc-400">9:00 AM plan</span>
                      <span className="rounded-full bg-white/[0.05] border border-white/10 px-2.5 py-1 text-zinc-400">6:00 PM recap</span>
                    </div>
                  </div>
                  <div className="border-t md:border-t-0 md:border-l border-white/[0.06] bg-black/30">
                    <ChatMock />
                  </div>
                </div>
              </BeamCard>
            </Reveal>

            {/* Stats cell */}
            <Reveal delay={0.1}>
              <BeamCard className="h-full">
                <div id="stats" className="p-6 flex flex-col justify-between h-full">
                  <FiPieChart className="w-5 h-5 text-indigo-400 mb-3" />
                  <div>
                    <div className="text-3xl font-semibold tracking-tight">
                      <CountUp to={100} suffix="%" />
                    </div>
                    <div className="text-xs text-zinc-500 mt-1">deadline visibility across your whole team</div>
                  </div>
                </div>
              </BeamCard>
            </Reveal>

            {/* Recurring cell */}
            <Reveal delay={0.15}>
              <BeamCard className="h-full">
                <div className="p-6 flex flex-col justify-between h-full">
                  <FiRefreshCw className="w-5 h-5 text-violet-400 mb-3" />
                  <div>
                    <div className="text-lg font-semibold mb-1">Set once, repeats forever</div>
                    <div className="text-xs text-zinc-500">Daily, weekly or monthly tasks run themselves.</div>
                  </div>
                </div>
              </BeamCard>
            </Reveal>

            {/* Follow-ups cell */}
            <Reveal delay={0.1}>
              <BeamCard className="h-full">
                <div className="p-6 flex flex-col justify-between h-full">
                  <FiUsers className="w-5 h-5 text-pink-400 mb-3" />
                  <div>
                    <div className="text-lg font-semibold mb-1">Follow-ups that nudge</div>
                    <div className="text-xs text-zinc-500">Gently reminds teammates before things go stale.</div>
                  </div>
                </div>
              </BeamCard>
            </Reveal>

            {/* PWA cell */}
            <Reveal delay={0.15}>
              <BeamCard className="h-full">
                <div className="p-6 flex flex-col justify-between h-full">
                  <FiSmartphone className="w-5 h-5 text-sky-400 mb-3" />
                  <div>
                    <div className="text-lg font-semibold mb-1">Installable app</div>
                    <div className="text-xs text-zinc-500 mb-3">Native-like feel, straight from the browser.</div>
                    <div className="scale-95 origin-left text-left"><InstallPWA /></div>
                  </div>
                </div>
              </BeamCard>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ================= STATS BAND ================= */}
      <section className="px-4 py-16 relative z-10">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-4">
          {stats.map((s, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] py-7 text-center">
                <div className="text-2xl md:text-3xl font-semibold bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent">
                  <CountUp to={s.value} suffix={s.suffix} />
                </div>
                <div className="mt-1.5 text-[10px] md:text-xs uppercase tracking-widest text-zinc-600">{s.label}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="px-4 pb-24 relative z-10">
        <Reveal>
          <div className="relative max-w-3xl mx-auto overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0D0D14] px-6 py-16 md:py-20 text-center">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/60 to-transparent" />
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[420px] h-[180px] bg-indigo-500/15 blur-[90px] pointer-events-none" />
            <div className="relative z-10">
              <FiShield className="w-6 h-6 text-indigo-400 mx-auto mb-4" />
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-3">
                Your evening recap, tomorrow.
              </h2>
              <p className="text-zinc-400 text-sm md:text-base max-w-md mx-auto mb-8">
                Create an account, add your number, and Danzo handles the remembering.
              </p>
              <button
                onClick={() => navigate(currentUser ? '/dashboard' : '/login')}
                className="group inline-flex items-center gap-2 h-11 px-7 rounded-xl bg-white text-black text-sm font-semibold hover:bg-zinc-200 transition-colors"
              >
                Get started free
                <FiArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-white/5 py-8 px-4 relative z-10">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-600">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center font-bold text-[9px] text-white">D</div>
            <span>&copy; {new Date().getFullYear()} Danzo Workspace</span>
          </div>
          <span>Built by Rakshith</span>
        </div>
      </footer>
    </div>
  );
}
