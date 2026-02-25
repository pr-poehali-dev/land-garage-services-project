import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";

const PHONE = "8 (914) 965-42-02";
const PHONE_HREF = "tel:+79149654202";
const WA_HREF = "https://wa.me/79149654202";

function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".sr");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("sr-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.08 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

function useCountUp(target: number, active: boolean) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start: number | null = null;
    const dur = 1200;
    const tick = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min(1, (ts - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(eased * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [active, target]);
  return val;
}

function StatCard({ num, suffix, label }: { num: number; suffix: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const val = useCountUp(num, active);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setActive(true); io.disconnect(); }
    }, { threshold: 0.4 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className="sr stat-card">
      <div className="stat-num">{val}{suffix}</div>
      <div className="stat-lbl">{label}</div>
    </div>
  );
}

const botReplies: Record<string, string> = {
  земл: "Оформление земли — одно из главных направлений. Приватизация, выкуп, наследство, исправление кадастровых ошибок. Оставьте заявку — разберём бесплатно.",
  участ: "Оформление участков, межевание, исправление ошибок — ведём до регистрации. Напишите подробнее.",
  гараж: "По гаражной амнистии работаем активно. Даже если ГСК уже не существует — поможем оформить.",
  гск: "Оформление через ГСК — наш профиль. Расскажите ситуацию подробнее.",
  сделк: "Сопровождение купли-продажи: проверка рисков, договор, регистрация. Работаем «под ключ».",
  ипотек: "Подберём сценарий, подготовим документы и сопроводим до регистрации. Первичный или вторичный рынок?",
  цен: "Консультация — бесплатно. Земля от 40 000 ₽, гараж от 25 000 ₽, сделки от 30 000 ₽.",
  стоим: "Земля от 40 000 ₽, гараж от 25 000 ₽, сделки от 30 000 ₽. Консультация бесплатна.",
  доку: "Если документы утеряны — восстановим через архивы и запросы. Расскажите, что именно отсутствует.",
  дистан: "Да, многие задачи решаем дистанционно. Приезжать необязательно.",
  срок: "Сроки фиксируем в договоре. Зависят от задачи — обычно 1–3 месяца.",
  спор: "Жилищные споры, раздел долей, ТСЖ — ведём до суда при необходимости. Опишите ситуацию.",
  привет: "Добрый день! Чем могу помочь? Спрашивайте по земле, гаражам, сделкам, ипотеке или спорам.",
  здравств: "Добрый день! Задавайте вопросы — помогу разобраться.",
  добр: "Добрый день! Чем могу помочь?",
  помог: "Конечно. Напишите, что за ситуация — разберём.",
};

function getBotReply(text: string): string {
  const t = text.toLowerCase();
  for (const key of Object.keys(botReplies)) {
    if (t.includes(key)) return botReplies[key];
  }
  return `Понял вас. Для точного ответа потребуется чуть больше деталей. Или позвоните прямо сейчас: ${PHONE} — ответим сразу.`;
}

function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<{ from: "user" | "bot"; text: string }[]>([
    { from: "bot", text: "Здравствуйте! Готов ответить на срочные вопросы по земле, гаражам и сделкам. Напишите — и помогу." },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState(1);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [msgs, typing]);

  useEffect(() => { if (open) setUnread(0); }, [open]);

  const send = () => {
    const t = input.trim();
    if (!t) return;
    setMsgs((m) => [...m, { from: "user", text: t }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMsgs((m) => [...m, { from: "bot", text: getBotReply(t) }]);
    }, 1100);
  };

  return (
    <>
      <button className="chat-fab" onClick={() => setOpen((v) => !v)} aria-label="Открыть чат">
        {open ? <Icon name="X" size={22} /> : <Icon name="MessageCircle" size={22} />}
        {!open && unread > 0 && <span className="chat-badge">{unread}</span>}
      </button>

      <div className={`chat-window${open ? " chat-open" : ""}`} role="dialog" aria-label="Чат с юристом">
        <div className="chat-header">
          <div className="chat-avatar">⚖</div>
          <div>
            <div className="chat-title">ЮрПомощь Приморье</div>
            <div className="chat-status"><span className="chat-dot" />Онлайн</div>
          </div>
          <button className="chat-close" onClick={() => setOpen(false)} aria-label="Закрыть чат">
            <Icon name="X" size={16} />
          </button>
        </div>
        <div className="chat-body" ref={bodyRef}>
          {msgs.map((m, i) => (
            <div key={i} className={`chat-msg chat-msg-${m.from}`}>{m.text}</div>
          ))}
          {typing && (
            <div className="chat-msg chat-msg-bot chat-typing">
              <span /><span /><span />
            </div>
          )}
        </div>
        <div className="chat-footer">
          <input
            className="chat-input"
            placeholder="Задайте вопрос..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
          />
          <button className="chat-send" onClick={send} aria-label="Отправить">
            <Icon name="Send" size={16} />
          </button>
        </div>
      </div>
    </>
  );
}

const NAV = [
  { l: "Услуги", id: "#services" },
  { l: "О нас", id: "#about" },
  { l: "Отзывы", id: "#proof" },
  { l: "Прайс", id: "#pricing" },
  { l: "FAQ", id: "#faq" },
  { l: "Контакты", id: "#contacts" },
];

const SERVICES = [
  { icon: "MapPin", title: "Земля", desc: "Приватизация, выкуп, перераспределение, наследство. Любые «сложные» кейсы с документами." },
  { icon: "Home", title: "Гаражи", desc: "Амнистия, ГСК, восстановление документов, регистрация права собственности на гараж и землю под ним." },
  { icon: "FileText", title: "Сделки", desc: "Сопровождение купли‑продажи: проверка рисков, договор, регистрация. Защита интересов сторон." },
  { icon: "Building2", title: "Ипотека", desc: "Подбор сценария, подготовка документов, сопровождение сделки до финальной регистрации." },
  { icon: "Scale", title: "Споры", desc: "Раздел долей, порядок пользования, споры с ТСЖ/УК, оспаривание сделок — до решения суда." },
  { icon: "Users", title: "Семья", desc: "Раздел имущества, алименты, брачный договор, документальное оформление договорённостей." },
];

const STEPS = [
  { n: "01", title: "Диагностика", desc: "Разбираем ситуацию, определяем путь и сроки. Говорим честно, если шансы низкие." },
  { n: "02", title: "Документы", desc: "Собираем и восстанавливаем, готовим заявления и полный комплект для подачи." },
  { n: "03", title: "Сопровождение", desc: "Контролируем этапы, подачу, ответы, коммуникацию с инстанциями." },
  { n: "04", title: "Результат", desc: "Вы получаете итоговый документ: регистрация, договор, выписка ЕГРН или решение суда." },
];

const REVIEWS = [
  { name: "Наталья В.", tag: "Земля", text: "Наконец-то оформили участок, который был «де-факто» нашим уже 20 лет. Всё сделали сами, мне только позвонили, когда документы были готовы." },
  { name: "Сергей М.", tag: "Гараж", text: "Думал, что без документов ГСК ничего не выйдет. Юристы нашли выход, восстановили через архивы и оформили. Доволен результатом." },
  { name: "Ирина К.", tag: "Ипотека + сделка", text: "Сжатые сроки, банк давил. Команда всё успела: проверили продавца, составили договор, зарегистрировали. Рекомендую." },
];

const FAQS = [
  { q: "Сколько стоит консультация?", a: "Первая консультация бесплатна: разберём ситуацию, уточним документы и предложим план действий." },
  { q: "Можно ли всё сделать дистанционно?", a: "Да, многие этапы ведём удалённо: обмен документами, консультации, согласования. Приезжать необязательно." },
  { q: "Что делать, если часть документов утеряна?", a: "Обычно документы можно восстановить через архивы, запросы и выписки. На консультации скажем, что именно нужно." },
  { q: "Сколько займёт оформление земли или гаража?", a: "Зависит от исходных данных. Сроки и этапы фиксируем в договоре до начала работы." },
  { q: "Вы сопровождаете ипотеку «под ключ»?", a: "Да: проверка рисков, договоры, сопровождение регистрации. Ваша задача — принять решение, остальное сделаем мы." },
  { q: "Можно начать только с консультации?", a: "Да. Начните с диагностики — и уже потом решайте, подключать ли сопровождение на нужном этапе." },
];

const PRICING = [
  { service: "Первичная консультация", price: "0 ₽", note: "Разбор ситуации + план действий" },
  { service: "Оформление земли", price: "от 40 000 ₽", note: "Зависит от кейса и документов" },
  { service: "Гараж / ГСК / амнистия", price: "от 25 000 ₽", note: "Гараж и земля под ним" },
  { service: "Сопровождение сделки", price: "от 30 000 ₽", note: "Проверка, договор, регистрация" },
  { service: "Ипотека с подбором", price: "от 15 000 ₽", note: "Сценарий + сопровождение" },
  { service: "Жилищный спор", price: "от 35 000 ₽", note: "Доли, порядок пользования, суд" },
];

function scrollTo(id: string) {
  const el = document.querySelector(id);
  if (!el) return;
  const y = el.getBoundingClientRect().top + window.scrollY - 76;
  window.scrollTo({ top: y, behavior: "smooth" });
}

export default function Index() {
  useScrollReveal();
  const [navOpen, setNavOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", msg: "" });
  const [headerScrolled, setHeaderScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setHeaderScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setForm({ name: "", phone: "", msg: "" });
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div className="law-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Golos+Text:wght@400;500;600;700;900&display=swap');

        .law-root {
          --navy: #0B1A2E;
          --navy2: #0F2444;
          --navy3: #162F55;
          --gold: #C9A96E;
          --gold2: #B08D4E;
          --ivory: #F5F2EC;
          --muted: #6B7894;
          --line: rgba(201,169,110,0.18);
          --line2: rgba(255,255,255,0.08);
          --card-bg: rgba(15,36,68,0.72);
          --card-border: rgba(201,169,110,0.15);
          background: var(--navy);
          color: #D4CFC7;
          font-family: 'Golos Text', system-ui, sans-serif;
          min-height: 100vh;
          overflow-x: hidden;
        }

        .sr { opacity: 0; transform: translateY(18px); transition: opacity 0.55s cubic-bezier(.16,1,.3,1), transform 0.55s cubic-bezier(.16,1,.3,1); }
        .sr-in { opacity: 1; transform: none; }

        /* HEADER */
        .lhdr { position: fixed; inset: 0 0 auto; z-index: 900; transition: background 0.3s, box-shadow 0.3s, border-color 0.3s; border-bottom: 1px solid transparent; }
        .lhdr.scrolled { background: rgba(11,26,46,0.95); backdrop-filter: blur(14px); border-color: var(--line); box-shadow: 0 8px 32px rgba(0,0,0,0.32); }
        .lhdr-inner { max-width: 1160px; margin: 0 auto; padding: 0 24px; display: flex; align-items: center; justify-content: space-between; height: 72px; gap: 16px; }
        .lbrand { display: flex; align-items: center; gap: 10px; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 20px; font-weight: 700; letter-spacing: 0.02em; color: var(--ivory); text-decoration: none; }
        .lbrand-icon { width: 38px; height: 38px; border-radius: 10px; background: linear-gradient(135deg, var(--gold2), var(--gold)); display: grid; place-items: center; font-size: 18px; box-shadow: 0 6px 20px rgba(201,169,110,0.28); flex: 0 0 auto; }
        .lnav { display: flex; align-items: center; gap: 4px; }
        .lnav a { padding: 8px 12px; border-radius: 8px; font-size: 14px; font-weight: 500; color: rgba(212,207,199,0.8); text-decoration: none; transition: color 0.18s, background 0.18s; }
        .lnav a:hover { color: var(--gold); background: rgba(201,169,110,0.08); }
        .lhdr-right { display: flex; align-items: center; gap: 10px; }
        .l-phone { font-weight: 700; color: var(--ivory); font-size: 14px; white-space: nowrap; text-decoration: none; transition: color 0.18s; }
        .l-phone:hover { color: var(--gold); }
        .lbtn { display: inline-flex; align-items: center; gap: 7px; padding: 10px 18px; border-radius: 10px; font-family: 'Golos Text', sans-serif; font-weight: 700; font-size: 14px; cursor: pointer; transition: all 0.18s; border: none; text-decoration: none; white-space: nowrap; box-sizing: border-box; }
        .lbtn-gold { background: linear-gradient(135deg, var(--gold2), var(--gold)); color: var(--navy); box-shadow: 0 8px 22px rgba(201,169,110,0.28); }
        .lbtn-gold:hover { box-shadow: 0 12px 28px rgba(201,169,110,0.38); transform: translateY(-1px); }
        .lbtn-outline { background: transparent; border: 1px solid var(--line); color: var(--ivory); }
        .lbtn-outline:hover { border-color: var(--gold); color: var(--gold); background: rgba(201,169,110,0.06); }
        .lbtn-ghost { background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.12); color: var(--ivory); }
        .lbtn-ghost:hover { background: rgba(255,255,255,0.13); }
        .lbtn-full { width: 100%; justify-content: center; }
        .lbtn-lg { padding: 14px 26px; font-size: 15px; border-radius: 12px; }
        .menu-btn { background: none; border: none; cursor: pointer; color: var(--ivory); padding: 6px; display: none; }
        @media (max-width: 900px) { .lnav { display: none; } .menu-btn { display: flex; } }
        @media (max-width: 600px) { .lhdr-right .lbtn-gold { display: none; } }

        /* MOBILE NAV */
        .mob-nav { position: fixed; inset: 72px 0 0; z-index: 800; background: rgba(11,26,46,0.97); backdrop-filter: blur(20px); display: flex; flex-direction: column; gap: 4px; padding: 20px 24px; transform: translateX(-100%); transition: transform 0.3s cubic-bezier(.16,1,.3,1); }
        .mob-nav.open { transform: none; }
        .mob-nav a { padding: 14px 16px; border-radius: 10px; font-size: 17px; font-weight: 600; color: var(--ivory); text-decoration: none; border-bottom: 1px solid var(--line2); }
        .mob-nav a:hover { color: var(--gold); background: rgba(201,169,110,0.07); }

        /* HERO */
        .hero-section { padding: 130px 0 80px; position: relative; overflow: hidden; }
        .hero-bg { position: absolute; inset: 0; background: radial-gradient(ellipse 900px 600px at -10% 20%, rgba(201,169,110,0.07) 0%, transparent 60%), radial-gradient(ellipse 700px 500px at 110% 80%, rgba(22,47,85,0.9) 0%, transparent 60%), linear-gradient(160deg, var(--navy2) 0%, var(--navy) 100%); }
        .hero-grid-lines { position: absolute; inset: 0; opacity: 0.04; background-image: linear-gradient(rgba(201,169,110,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(201,169,110,0.5) 1px, transparent 1px); background-size: 80px 80px; }
        .hero-content { position: relative; max-width: 1160px; margin: 0 auto; padding: 0 24px; }
        .hero-inner { display: grid; grid-template-columns: 1.15fr 0.85fr; gap: 48px; align-items: start; }
        @media (max-width: 900px) { .hero-inner { grid-template-columns: 1fr; } .hero-section { padding: 110px 0 60px; } }
        .hero-tag { display: inline-flex; align-items: center; gap: 8px; padding: 7px 14px; border-radius: 999px; border: 1px solid var(--line); background: rgba(201,169,110,0.06); font-size: 13px; font-weight: 600; color: var(--gold); margin-bottom: 20px; letter-spacing: 0.04em; text-transform: uppercase; }
        .hero-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--gold); box-shadow: 0 0 0 4px rgba(201,169,110,0.18); }
        h1.hero-h1 { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 54px; font-weight: 700; line-height: 1.06; letter-spacing: -0.02em; color: var(--ivory); margin: 0 0 18px; }
        @media (max-width: 700px) { h1.hero-h1 { font-size: 38px; } }
        .hero-sub { font-size: 17px; color: rgba(212,207,199,0.75); line-height: 1.65; margin: 0 0 28px; max-width: 52ch; }
        .hero-btns { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 10px; }
        .hero-note { font-size: 13px; color: var(--muted); margin-top: 8px; }
        .trust-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 28px; }
        @media (max-width: 600px) { .trust-row { grid-template-columns: 1fr; } }
        .trust-item { background: rgba(15,36,68,0.55); border: 1px solid var(--card-border); border-radius: 12px; padding: 12px 14px; display: flex; gap: 10px; align-items: flex-start; }
        .trust-ic { width: 28px; height: 28px; border-radius: 8px; background: rgba(201,169,110,0.12); display: grid; place-items: center; flex: 0 0 auto; color: var(--gold); }
        .trust-title { font-size: 13px; font-weight: 700; color: var(--ivory); display: block; }
        .trust-sub { font-size: 12px; color: var(--muted); display: block; margin-top: 3px; line-height: 1.35; }

        /* FORM */
        .form-card { background: rgba(15,36,68,0.78); backdrop-filter: blur(16px); border: 1px solid var(--card-border); border-radius: 18px; overflow: hidden; box-shadow: 0 24px 64px rgba(0,0,0,0.44); }
        .form-card-head { padding: 20px 22px; background: linear-gradient(135deg, rgba(201,169,110,0.10), rgba(22,47,85,0.5)); border-bottom: 1px solid var(--line); }
        .form-card-head h3 { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 22px; font-weight: 700; color: var(--ivory); margin: 0 0 6px; }
        .form-card-head p { font-size: 13px; color: var(--muted); margin: 0; }
        .form-card-body { padding: 20px 22px; }
        .f-label { display: block; font-size: 12px; font-weight: 700; color: var(--gold); text-transform: uppercase; letter-spacing: 0.06em; margin: 14px 0 6px; }
        .f-input { width: 100%; border-radius: 10px; border: 1px solid rgba(201,169,110,0.2); background: rgba(11,26,46,0.6); color: var(--ivory); padding: 11px 13px; font-size: 14px; font-family: 'Golos Text', sans-serif; outline: none; transition: border-color 0.18s, box-shadow 0.18s; box-sizing: border-box; }
        .f-input:focus { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(201,169,110,0.14); }
        .f-input::placeholder { color: rgba(107,120,148,0.7); }
        .f-textarea { min-height: 90px; resize: vertical; }
        .f-fine { font-size: 11.5px; color: var(--muted); margin-top: 10px; line-height: 1.4; }
        .f-ok { display: flex; align-items: center; gap: 10px; background: rgba(31,122,69,0.15); border: 1px solid rgba(31,122,69,0.3); border-radius: 10px; padding: 12px 14px; margin-bottom: 12px; color: #5fd490; font-size: 14px; font-weight: 600; }

        /* SECTIONS */
        .lsection { padding: 80px 0; }
        .lsection-alt { background: rgba(10,20,38,0.7); }
        .lcontainer { max-width: 1160px; margin: 0 auto; padding: 0 24px; }
        .sec-label { font-size: 12px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--gold); margin-bottom: 10px; display: block; }
        .sec-h2 { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 40px; font-weight: 700; color: var(--ivory); margin: 0 0 14px; line-height: 1.1; letter-spacing: -0.01em; }
        @media (max-width: 700px) { .sec-h2 { font-size: 30px; } }
        .sec-sub { font-size: 16px; color: rgba(212,207,199,0.65); max-width: 58ch; line-height: 1.65; margin: 0; }
        .gold-divider { width: 48px; height: 3px; background: linear-gradient(90deg, var(--gold2), var(--gold)); border-radius: 2px; margin-bottom: 16px; }

        /* HERO VISUAL RIGHT */
        .hero-visual { display: flex; align-items: center; justify-content: center; }
        .hero-visual-inner {
          width: 100%;
          background: rgba(15,36,68,0.65);
          backdrop-filter: blur(18px);
          border: 1px solid var(--card-border);
          border-radius: 22px;
          padding: 28px 24px;
          box-shadow: 0 24px 64px rgba(0,0,0,0.38);
          display: flex; flex-direction: column; gap: 20px;
          position: relative; overflow: hidden;
        }
        .hero-visual-inner::before {
          content: '';
          position: absolute; top: -60px; right: -60px;
          width: 220px; height: 220px; border-radius: 50%;
          background: radial-gradient(circle, rgba(201,169,110,0.10), transparent 70%);
          pointer-events: none;
        }
        .hv-badge {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 12px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase;
          color: var(--gold);
        }
        .hv-badge-dot { width: 7px; height: 7px; border-radius: 50%; background: #3dba67; box-shadow: 0 0 0 4px rgba(61,186,103,0.18); flex: 0 0 auto; }
        .hv-stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; }
        .hv-stat {
          background: rgba(201,169,110,0.07); border: 1px solid var(--line);
          border-radius: 14px; padding: 14px 10px; text-align: center;
        }
        .hv-num { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 32px; font-weight: 700; color: var(--gold); line-height: 1; display: block; }
        .hv-lbl { font-size: 11.5px; color: var(--muted); display: block; margin-top: 5px; line-height: 1.3; }
        .hv-services { display: flex; flex-wrap: wrap; gap: 8px; }
        .hv-chip {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 6px 12px; border-radius: 999px;
          background: rgba(255,255,255,0.05); border: 1px solid rgba(201,169,110,0.15);
          font-size: 13px; font-weight: 500; color: rgba(212,207,199,0.85);
          transition: border-color 0.18s, background 0.18s;
        }
        .hv-chip:hover { border-color: var(--gold); background: rgba(201,169,110,0.08); color: var(--gold); }
        .hv-cta-note {
          display: flex; align-items: center; gap: 8px;
          font-size: 13px; color: var(--muted);
          padding: 12px 14px;
          background: rgba(201,169,110,0.06); border: 1px solid var(--line);
          border-radius: 12px;
        }

        /* SERVICES */
        .services-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-top: 36px; }
        @media (max-width: 900px) { .services-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 560px) { .services-grid { grid-template-columns: 1fr; } }
        .svc-card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 16px; padding: 22px 20px; backdrop-filter: blur(12px); transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s; position: relative; overflow: hidden; }
        .svc-card::before { content: ''; position: absolute; inset: 0; background: radial-gradient(400px 300px at 50% -30%, rgba(201,169,110,0.06), transparent); pointer-events: none; }
        .svc-card:hover { transform: translateY(-3px); border-color: rgba(201,169,110,0.35); box-shadow: 0 18px 42px rgba(0,0,0,0.3); }
        .svc-icon { width: 42px; height: 42px; border-radius: 12px; background: rgba(201,169,110,0.1); border: 1px solid var(--line); display: grid; place-items: center; color: var(--gold); margin-bottom: 14px; }
        .svc-title { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 21px; font-weight: 700; color: var(--ivory); margin: 0 0 8px; }
        .svc-desc { font-size: 14px; color: var(--muted); line-height: 1.6; margin: 0; }

        /* STEPS */
        .steps-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-top: 36px; }
        @media (max-width: 900px) { .steps-row { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 560px) { .steps-row { grid-template-columns: 1fr; } }
        .step-card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 16px; padding: 22px 20px; }
        .step-num { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 44px; font-weight: 700; color: rgba(201,169,110,0.15); line-height: 1; margin-bottom: 10px; display: block; }
        .step-title { font-weight: 700; font-size: 16px; color: var(--ivory); margin: 0 0 8px; }
        .step-desc { font-size: 13.5px; color: var(--muted); line-height: 1.55; margin: 0; }

        /* STATS */
        .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-top: 36px; }
        @media (max-width: 900px) { .stats-row { grid-template-columns: repeat(2, 1fr); } }
        .stat-card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 16px; padding: 22px 20px; }
        .stat-num { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 46px; font-weight: 700; color: var(--gold); line-height: 1; letter-spacing: -0.02em; }
        .stat-lbl { font-size: 13.5px; color: var(--muted); margin-top: 8px; font-weight: 500; }

        /* REVIEWS */
        .reviews-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-top: 36px; }
        @media (max-width: 900px) { .reviews-grid { grid-template-columns: 1fr; } }
        .review-card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 16px; padding: 22px 20px; }
        .review-stars { color: var(--gold); font-size: 14px; letter-spacing: 2px; margin-bottom: 12px; }
        .review-text { font-size: 14px; color: rgba(212,207,199,0.85); line-height: 1.65; margin: 0 0 16px; font-style: italic; }
        .review-author { display: flex; align-items: center; gap: 10px; }
        .review-avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, var(--navy3), var(--gold2)); display: grid; place-items: center; font-weight: 700; font-size: 14px; color: var(--ivory); flex: 0 0 auto; }
        .review-name { font-weight: 700; font-size: 14px; color: var(--ivory); display: block; }
        .review-tag { font-size: 12px; color: var(--gold); display: block; margin-top: 2px; }

        /* PRICING */
        .price-table-wrap { margin-top: 36px; background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 18px; overflow: hidden; backdrop-filter: blur(12px); }
        table.price-table { width: 100%; border-collapse: collapse; }
        .price-table th { padding: 14px 18px; text-align: left; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: var(--gold); background: rgba(201,169,110,0.06); border-bottom: 1px solid var(--line); }
        .price-table td { padding: 15px 18px; font-size: 14px; border-bottom: 1px solid rgba(201,169,110,0.07); color: rgba(212,207,199,0.85); vertical-align: top; }
        .price-table tr:last-child td { border-bottom: none; }
        .price-table tr:hover td { background: rgba(201,169,110,0.04); }
        .price-val { font-weight: 800; color: var(--ivory); font-size: 15px; white-space: nowrap; }
        .price-free { color: var(--gold); }
        .price-note { font-size: 13px; color: var(--muted); }
        @media (max-width: 640px) { .price-table th:nth-child(3), .price-table td:nth-child(3) { display: none; } }

        /* ABOUT */
        .about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: center; }
        @media (max-width: 800px) { .about-grid { grid-template-columns: 1fr; } }
        .about-decor { position: relative; border-radius: 18px; overflow: hidden; background: linear-gradient(135deg, var(--navy2), var(--navy3)); border: 1px solid var(--card-border); min-height: 340px; display: flex; flex-direction: column; justify-content: flex-end; padding: 28px; }
        .about-decor-bg { position: absolute; inset: 0; background: radial-gradient(ellipse 400px 300px at 80% 20%, rgba(201,169,110,0.1), transparent); }
        .about-quote { position: relative; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 28px; font-weight: 600; font-style: italic; color: var(--ivory); line-height: 1.3; margin: 0; }
        .about-quote-mark { font-size: 80px; line-height: 0.4; display: block; color: var(--gold); opacity: 0.4; margin-bottom: 10px; font-style: normal; }
        .about-checks { display: grid; gap: 14px; margin-top: 24px; }
        .about-check { display: flex; gap: 12px; align-items: flex-start; }
        .about-check-ic { width: 24px; height: 24px; border-radius: 8px; background: rgba(201,169,110,0.12); display: grid; place-items: center; flex: 0 0 auto; color: var(--gold); margin-top: 1px; }
        .about-check-title { font-weight: 700; font-size: 15px; color: var(--ivory); display: block; }
        .about-check-sub { font-size: 13.5px; color: var(--muted); display: block; margin-top: 3px; line-height: 1.45; }

        /* FAQ */
        .faq-list { max-width: 860px; margin: 36px auto 0; display: grid; gap: 10px; }
        .faq-item { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 14px; overflow: hidden; transition: border-color 0.18s; }
        .faq-item.open { border-color: rgba(201,169,110,0.35); }
        .faq-btn { width: 100%; text-align: left; background: none; border: none; cursor: pointer; padding: 18px 20px; display: flex; justify-content: space-between; align-items: center; gap: 14px; font-family: 'Golos Text', sans-serif; font-size: 15px; font-weight: 700; color: var(--ivory); transition: color 0.18s; }
        .faq-btn:hover { color: var(--gold); }
        .faq-icon { flex: 0 0 auto; color: var(--gold); transition: transform 0.25s; }
        .faq-item.open .faq-icon { transform: rotate(45deg); }
        .faq-ans { max-height: 0; overflow: hidden; transition: max-height 0.32s cubic-bezier(.16,1,.3,1), padding 0.2s; padding: 0 20px; font-size: 14px; color: rgba(212,207,199,0.75); line-height: 1.65; }
        .faq-item.open .faq-ans { max-height: 300px; padding-bottom: 18px; }

        /* CTA BAND */
        .cta-band { padding: 80px 0; background: linear-gradient(135deg, var(--navy2), var(--navy3)); position: relative; overflow: hidden; }
        .cta-band::before { content: ''; position: absolute; inset: -50% -30% auto auto; width: 600px; height: 600px; border-radius: 50%; background: radial-gradient(circle, rgba(201,169,110,0.08), transparent 60%); }
        .cta-inner { position: relative; display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 40px; align-items: center; }
        @media (max-width: 800px) { .cta-inner { grid-template-columns: 1fr; } }
        .cta-h2 { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 38px; font-weight: 700; color: var(--ivory); margin: 0 0 12px; }
        @media (max-width: 700px) { .cta-h2 { font-size: 30px; } }
        .cta-sub { font-size: 16px; color: rgba(212,207,199,0.7); margin: 0; line-height: 1.6; }
        .cta-btns { display: flex; flex-wrap: wrap; gap: 10px; }

        /* FOOTER */
        footer.lfooter { background: rgba(6,13,25,0.96); border-top: 1px solid var(--line2); padding: 52px 0 24px; }
        .foot-grid { display: grid; grid-template-columns: 1.4fr 0.8fr 0.8fr; gap: 32px; padding-bottom: 28px; border-bottom: 1px solid var(--line2); margin-bottom: 20px; }
        @media (max-width: 800px) { .foot-grid { grid-template-columns: 1fr; } }
        .foot-brand { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 21px; font-weight: 700; color: var(--ivory); margin-bottom: 10px; }
        .foot-desc { font-size: 14px; color: var(--muted); line-height: 1.6; max-width: 42ch; }
        .foot-col-title { font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: var(--gold); margin-bottom: 12px; }
        .foot-links { display: grid; gap: 8px; }
        .foot-links a, .foot-links span { font-size: 14px; color: rgba(212,207,199,0.7); text-decoration: none; transition: color 0.18s; }
        .foot-links a:hover { color: var(--gold); }
        .foot-copy { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 8px; font-size: 13px; color: rgba(212,207,199,0.4); }

        /* STICKY BAR */
        .sticky-bar { position: fixed; left: 0; right: 0; bottom: 0; z-index: 1000; background: rgba(11,26,46,0.96); backdrop-filter: blur(14px); border-top: 1px solid var(--line); padding: 10px 16px; display: none; }
        .sticky-row { display: flex; gap: 10px; max-width: 1160px; margin: 0 auto; }
        .sticky-row .lbtn { flex: 1; }
        @media (max-width: 600px) { .sticky-bar { display: block; } }

        /* CHAT FAB */
        .chat-fab { position: fixed; right: 24px; bottom: 24px; z-index: 1200; width: 54px; height: 54px; border-radius: 50%; background: linear-gradient(135deg, var(--gold2), var(--gold)); color: var(--navy); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 28px rgba(201,169,110,0.42); transition: transform 0.2s, box-shadow 0.2s; }
        .chat-fab:hover { transform: scale(1.07); box-shadow: 0 12px 36px rgba(201,169,110,0.52); }
        @media (max-width: 600px) { .chat-fab { bottom: 80px; right: 16px; } }
        .chat-badge { position: absolute; top: -2px; right: -2px; width: 18px; height: 18px; border-radius: 50%; background: #e04040; color: #fff; font-size: 11px; font-weight: 800; display: grid; place-items: center; border: 2px solid var(--navy); }

        /* CHAT WINDOW */
        .chat-window { position: fixed; right: 24px; bottom: 92px; z-index: 1199; width: 340px; max-width: calc(100vw - 32px); background: rgba(11,26,46,0.98); backdrop-filter: blur(20px); border: 1px solid var(--card-border); border-radius: 20px; overflow: hidden; box-shadow: 0 24px 64px rgba(0,0,0,0.55); display: flex; flex-direction: column; transform: scale(0.88) translateY(18px); opacity: 0; pointer-events: none; transition: transform 0.28s cubic-bezier(.16,1,.3,1), opacity 0.22s; transform-origin: bottom right; }
        .chat-window.chat-open { transform: none; opacity: 1; pointer-events: auto; }
        @media (max-width: 600px) { .chat-window { right: 16px; bottom: 156px; width: calc(100vw - 32px); } }
        .chat-header { padding: 14px 16px; display: flex; align-items: center; gap: 10px; background: linear-gradient(135deg, rgba(201,169,110,0.12), rgba(15,36,68,0.5)); border-bottom: 1px solid var(--line); }
        .chat-avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, var(--gold2), var(--gold)); display: grid; place-items: center; font-size: 18px; flex: 0 0 auto; color: var(--navy); }
        .chat-title { font-weight: 700; font-size: 14px; color: var(--ivory); }
        .chat-status { font-size: 12px; color: var(--muted); display: flex; align-items: center; gap: 5px; }
        .chat-dot { width: 7px; height: 7px; border-radius: 50%; background: #3dba67; display: inline-block; }
        .chat-close { margin-left: auto; background: none; border: none; cursor: pointer; color: var(--muted); transition: color 0.18s; padding: 4px; border-radius: 6px; }
        .chat-close:hover { color: var(--ivory); background: rgba(255,255,255,0.08); }
        .chat-body { padding: 14px 14px 10px; display: flex; flex-direction: column; gap: 10px; min-height: 200px; max-height: 280px; overflow-y: auto; }
        .chat-body::-webkit-scrollbar { width: 4px; }
        .chat-body::-webkit-scrollbar-thumb { background: rgba(201,169,110,0.25); border-radius: 4px; }
        .chat-msg { max-width: 86%; padding: 10px 13px; border-radius: 14px; font-size: 13.5px; line-height: 1.5; }
        .chat-msg-bot { background: rgba(201,169,110,0.1); border: 1px solid rgba(201,169,110,0.15); color: rgba(212,207,199,0.9); align-self: flex-start; border-radius: 4px 14px 14px 14px; }
        .chat-msg-user { background: linear-gradient(135deg, var(--gold2), var(--gold)); color: var(--navy); align-self: flex-end; font-weight: 600; border-radius: 14px 14px 4px 14px; }
        .chat-typing { display: flex; align-items: center; gap: 5px; padding: 12px 16px; }
        .chat-typing span { width: 7px; height: 7px; border-radius: 50%; background: var(--gold); opacity: 0.5; animation: typing-bounce 1.1s infinite; }
        .chat-typing span:nth-child(2) { animation-delay: 0.18s; }
        .chat-typing span:nth-child(3) { animation-delay: 0.36s; }
        @keyframes typing-bounce { 0%,60%,100%{transform:translateY(0);opacity:.5} 30%{transform:translateY(-6px);opacity:1} }
        .chat-footer { padding: 10px 12px; border-top: 1px solid var(--line); display: flex; gap: 8px; align-items: center; }
        .chat-input { flex: 1; background: rgba(11,26,46,0.6); border: 1px solid rgba(201,169,110,0.18); border-radius: 10px; padding: 9px 12px; font-size: 13.5px; color: var(--ivory); font-family: 'Golos Text', sans-serif; outline: none; transition: border-color 0.18s; }
        .chat-input:focus { border-color: var(--gold); }
        .chat-input::placeholder { color: var(--muted); }
        .chat-send { width: 36px; height: 36px; border-radius: 10px; flex: 0 0 auto; background: linear-gradient(135deg, var(--gold2), var(--gold)); color: var(--navy); border: none; cursor: pointer; display: grid; place-items: center; transition: opacity 0.18s; }
        .chat-send:hover { opacity: 0.85; }
      `}</style>

      {/* HEADER */}
      <header className={`lhdr${headerScrolled ? " scrolled" : ""}`}>
        <div className="lhdr-inner">
          <a className="lbrand" href="#top">
            <span className="lbrand-icon">⚖</span>
            ЮрПомощь Приморье
          </a>
          <nav className="lnav">
            {NAV.map((n) => (
              <a key={n.id} href={n.id} onClick={(e) => { e.preventDefault(); scrollTo(n.id); }}>{n.l}</a>
            ))}
          </nav>
          <div className="lhdr-right">
            <a className="l-phone" href={PHONE_HREF}>{PHONE}</a>
            <a className="lbtn lbtn-gold" href="#consult" onClick={(e) => { e.preventDefault(); scrollTo("#consult"); }}>Консультация</a>
            <button className="menu-btn" onClick={() => setNavOpen((v) => !v)} aria-label="Меню">
              <Icon name={navOpen ? "X" : "Menu"} size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE NAV */}
      <nav className={`mob-nav${navOpen ? " open" : ""}`}>
        {NAV.map((n) => (
          <a key={n.id} href={n.id} onClick={(e) => { e.preventDefault(); scrollTo(n.id); setNavOpen(false); }}>{n.l}</a>
        ))}
        <a href={PHONE_HREF} style={{ color: "var(--gold)", borderBottom: "none" }}>{PHONE}</a>
      </nav>

      <main id="top">
        {/* HERO */}
        <section className="hero-section">
          <div className="hero-bg" />
          <div className="hero-grid-lines" />
          <div className="hero-content">
            <div className="hero-inner">
              <div>
                <div className="hero-tag sr sr-in">
                  <span className="hero-dot" />
                  Бесплатная первичная консультация
                </div>
                <h1 className="hero-h1 sr sr-in">
                  Оформим землю и гараж в собственность — без отказов
                </h1>
                <p className="hero-sub sr sr-in">
                  Документы, сделки, споры. Объясняем простыми словами, работаем по договору с фиксированной ценой и ведём до результата.
                </p>
                <div className="hero-btns sr sr-in">
                  <a className="lbtn lbtn-gold lbtn-lg" href="#consult" onClick={(e) => { e.preventDefault(); scrollTo("#consult"); }}>
                    Получить бесплатную консультацию
                    <Icon name="ArrowRight" size={16} />
                  </a>
                  <a className="lbtn lbtn-outline lbtn-lg" href={PHONE_HREF}>
                    <Icon name="Phone" size={15} />
                    Позвонить
                  </a>
                </div>
                <p className="hero-note sr sr-in">
                  Ответим в течение 15 минут в рабочее время. Можно в WhatsApp / Telegram.
                </p>
                <div className="trust-row sr sr-in">
                  {[
                    { icon: "ShieldCheck", t: "Договор и фикс-цена", s: "Стоимость прописываем заранее." },
                    { icon: "Clock", t: "Без очередей", s: "Берём бюрократию на себя." },
                    { icon: "Lock", t: "Конфиденциальность", s: "Аккуратно с данными клиента." },
                  ].map((i) => (
                    <div className="trust-item" key={i.t}>
                      <span className="trust-ic"><Icon name={i.icon} size={15} /></span>
                      <div>
                        <b className="trust-title">{i.t}</b>
                        <span className="trust-sub">{i.s}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* HERO RIGHT — визуальный блок */}
              <div className="hero-visual sr sr-in">
                <div className="hero-visual-inner">
                  <div className="hv-badge">
                    <span className="hv-badge-dot" />
                    Ведём дела с 2013 года
                  </div>
                  <div className="hv-stats">
                    <div className="hv-stat">
                      <span className="hv-num">500+</span>
                      <span className="hv-lbl">успешных дел</span>
                    </div>
                    <div className="hv-stat">
                      <span className="hv-num">12</span>
                      <span className="hv-lbl">лет практики</span>
                    </div>
                    <div className="hv-stat">
                      <span className="hv-num">98%</span>
                      <span className="hv-lbl">клиентов довольны</span>
                    </div>
                  </div>
                  <div className="hv-services">
                    {[
                      { icon: "MapPin", label: "Земля и участки" },
                      { icon: "Home", label: "Гаражи / ГСК" },
                      { icon: "FileText", label: "Сделки" },
                      { icon: "Building2", label: "Ипотека" },
                      { icon: "Scale", label: "Споры и суды" },
                      { icon: "Users", label: "Семейное право" },
                    ].map((s) => (
                      <div className="hv-chip" key={s.label}>
                        <Icon name={s.icon} size={13} />
                        {s.label}
                      </div>
                    ))}
                  </div>
                  <div className="hv-cta-note">
                    <Icon name="MessageCircle" size={14} />
                    Живой чат — ответим прямо сейчас
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* SERVICES */}
        <section className="lsection lsection-alt" id="services">
          <div className="lcontainer">
            <span className="sec-label sr">Направления</span>
            <div className="gold-divider sr" />
            <h2 className="sec-h2 sr">Услуги</h2>
            <p className="sec-sub sr">Земля, гаражи, сделки, ипотека, споры — ведём до результата.</p>
            <div className="services-grid">
              {SERVICES.map((s, i) => (
                <article className="svc-card sr" key={s.title} style={{ transitionDelay: `${i * 0.06}s` }}>
                  <div className="svc-icon"><Icon name={s.icon} size={20} /></div>
                  <h3 className="svc-title">{s.title}</h3>
                  <p className="svc-desc">{s.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ABOUT */}
        <section className="lsection" id="about">
          <div className="lcontainer">
            <div className="about-grid">
              <div className="about-decor sr">
                <div className="about-decor-bg" />
                <blockquote className="about-quote">
                  <span className="about-quote-mark">"</span>
                  Большинство «сложных» историй типовые. Нужны диагностика, чёткий план и контроль на каждом этапе.
                </blockquote>
              </div>
              <div>
                <span className="sec-label sr">О нас</span>
                <div className="gold-divider sr" />
                <h2 className="sec-h2 sr">12 лет практики в Приморском крае</h2>
                <p className="sec-sub sr">Специализируемся на земле, недвижимости и сделках. Работаем по договору — честно и прозрачно.</p>
                <div className="about-checks">
                  {[
                    { icon: "Award", t: "Опыт с 2013 года", s: "500+ дел, 300+ оформленных объектов." },
                    { icon: "FileCheck", t: "Работаем по договору", s: "Стоимость и этапы фиксируем до начала." },
                    { icon: "MessageSquare", t: "Говорим просто", s: "Объясняем без юридического жаргона." },
                    { icon: "Wifi", t: "Дистанционно", s: "Большинство задач — без личного визита." },
                  ].map((c) => (
                    <div className="about-check sr" key={c.t}>
                      <span className="about-check-ic"><Icon name={c.icon} size={13} /></span>
                      <div>
                        <b className="about-check-title">{c.t}</b>
                        <span className="about-check-sub">{c.s}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STEPS */}
        <section className="lsection lsection-alt">
          <div className="lcontainer">
            <span className="sec-label sr">Процесс</span>
            <div className="gold-divider sr" />
            <h2 className="sec-h2 sr">Как мы работаем</h2>
            <p className="sec-sub sr">Берём процесс на себя — от консультации до финального документа.</p>
            <div className="steps-row">
              {STEPS.map((s, i) => (
                <div className="step-card sr" key={s.n} style={{ transitionDelay: `${i * 0.07}s` }}>
                  <span className="step-num">{s.n}</span>
                  <div className="step-title">{s.title}</div>
                  <p className="step-desc">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="lsection">
          <div className="lcontainer">
            <span className="sec-label sr">Цифры</span>
            <div className="gold-divider sr" />
            <h2 className="sec-h2 sr">Нам доверяют</h2>
            <div className="stats-row">
              <StatCard num={12} suffix="+" label="лет практики" />
              <StatCard num={500} suffix="+" label="успешных дел" />
              <StatCard num={300} suffix="+" label="оформленных объектов" />
              <StatCard num={98} suffix="%" label="довольных клиентов" />
            </div>
          </div>
        </section>

        {/* REVIEWS */}
        <section className="lsection lsection-alt" id="proof">
          <div className="lcontainer">
            <span className="sec-label sr">Отзывы</span>
            <div className="gold-divider sr" />
            <h2 className="sec-h2 sr">Что говорят клиенты</h2>
            <div className="reviews-grid">
              {REVIEWS.map((r, i) => (
                <article className="review-card sr" key={r.name} style={{ transitionDelay: `${i * 0.07}s` }}>
                  <div className="review-stars">★★★★★</div>
                  <p className="review-text">«{r.text}»</p>
                  <div className="review-author">
                    <div className="review-avatar">{r.name[0]}</div>
                    <div>
                      <span className="review-name">{r.name}</span>
                      <span className="review-tag">{r.tag}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section className="lsection" id="pricing">
          <div className="lcontainer">
            <span className="sec-label sr">Стоимость</span>
            <div className="gold-divider sr" />
            <h2 className="sec-h2 sr">Прозрачный прайс</h2>
            <p className="sec-sub sr">Сначала консультация, затем фиксируем план, сроки и цену в договоре.</p>
            <div className="price-table-wrap sr">
              <table className="price-table">
                <thead>
                  <tr>
                    <th>Услуга</th>
                    <th>Стоимость</th>
                    <th>Комментарий</th>
                  </tr>
                </thead>
                <tbody>
                  {PRICING.map((p) => (
                    <tr key={p.service}>
                      <td style={{ fontWeight: 600, color: "var(--ivory)" }}>{p.service}</td>
                      <td><span className={`price-val${p.price === "0 ₽" ? " price-free" : ""}`}>{p.price}</span></td>
                      <td><span className="price-note">{p.note}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "20px" }} className="sr">
              <a className="lbtn lbtn-gold" href="#consult" onClick={(e) => { e.preventDefault(); scrollTo("#consult"); }}>Узнать стоимость под мой кейс →</a>
              <a className="lbtn lbtn-outline" href="#faq" onClick={(e) => { e.preventDefault(); scrollTo("#faq"); }}>Посмотреть FAQ</a>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="lsection lsection-alt" id="faq">
          <div className="lcontainer">
            <span className="sec-label sr">Вопросы</span>
            <div className="gold-divider sr" />
            <h2 className="sec-h2 sr" style={{ textAlign: "center" }}>Часто задаваемые вопросы</h2>
            <div className="faq-list">
              {FAQS.map((f, i) => (
                <div className={`faq-item sr${faqOpen === i ? " open" : ""}`} key={f.q} style={{ transitionDelay: `${i * 0.04}s` }}>
                  <button className="faq-btn" onClick={() => setFaqOpen(faqOpen === i ? null : i)}>
                    {f.q}
                    <span className="faq-icon"><Icon name="Plus" size={16} /></span>
                  </button>
                  <div className="faq-ans">{f.a}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CONSULT FORM */}
        <section className="lsection" id="consult">
          <div className="lcontainer">
            <div style={{ maxWidth: 600, margin: "0 auto" }}>
              <span className="sec-label sr" style={{ textAlign: "center", display: "block" }}>Бесплатно</span>
              <div className="gold-divider sr" style={{ margin: "0 auto 16px" }} />
              <h2 className="sec-h2 sr" style={{ textAlign: "center" }}>Бесплатная консультация</h2>
              <p className="sec-sub sr" style={{ textAlign: "center", margin: "0 auto 28px" }}>Опишите ситуацию в 1–2 предложениях — предложим план действий.</p>
              <div className="form-card sr">
                <div className="form-card-body" style={{ padding: "24px 26px" }}>
                  {submitted && (
                    <div className="f-ok">
                      <Icon name="CheckCircle2" size={18} />
                      Заявка принята! Свяжемся в ближайшее время.
                    </div>
                  )}
                  <form onSubmit={handleSubmit}>
                    <label className="f-label">Ваше имя</label>
                    <input className="f-input" type="text" required placeholder="Например, Ирина" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                    <label className="f-label">Телефон</label>
                    <input className="f-input" type="tel" required placeholder="+7 ___ ___-__-__" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                    <label className="f-label">Коротко: что нужно решить?</label>
                    <textarea className="f-input f-textarea" required placeholder="Например: оформить землю, гараж по амнистии, сопровождение сделки..." value={form.msg} onChange={(e) => setForm({ ...form, msg: e.target.value })} />
                    <button className="lbtn lbtn-gold lbtn-full" type="submit" style={{ marginTop: "14px" }}>
                      Получить консультацию →
                    </button>
                    <p className="f-fine">Нажимая кнопку, вы соглашаетесь с обработкой персональных данных.</p>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA BAND */}
        <section className="cta-band" id="contacts">
          <div className="lcontainer cta-inner">
            <div className="sr">
              <h2 className="cta-h2">Не готовы звонить? Начните с сообщения</h2>
              <p className="cta-sub">Напишите 2–3 предложения о ситуации — ответим, какие шаги нужны и что делать дальше. Без обязательств.</p>
            </div>
            <div className="cta-btns sr">
              <a className="lbtn lbtn-gold lbtn-lg" href="#consult" onClick={(e) => { e.preventDefault(); scrollTo("#consult"); }}>Оставить заявку</a>
              <a className="lbtn lbtn-ghost lbtn-lg" href={WA_HREF} target="_blank" rel="noopener noreferrer">
                <Icon name="MessageCircle" size={16} />
                WhatsApp
              </a>
              <a className="lbtn lbtn-ghost lbtn-lg" href={PHONE_HREF}>
                <Icon name="Phone" size={16} />
                {PHONE}
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="lfooter">
        <div className="lcontainer">
          <div className="foot-grid">
            <div>
              <div className="foot-brand">ЮрПомощь Приморье</div>
              <p className="foot-desc">Юридическая помощь с землёй, недвижимостью и сделками. Приморский край.</p>
            </div>
            <div>
              <div className="foot-col-title">Контакты</div>
              <div className="foot-links">
                <a href={PHONE_HREF}>{PHONE}</a>
                <a href="tel:+79140688234">8 (914) 068-82-34</a>
                <span>Приморский край</span>
                <span>Пн–Пт: 9:00–19:00</span>
              </div>
            </div>
            <div>
              <div className="foot-col-title">Документы</div>
              <div className="foot-links">
                <a href="#">Политика конфиденциальности</a>
                <a href="#">Договор оферты</a>
                <a href="#top" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Наверх</a>
              </div>
            </div>
          </div>
          <div className="foot-copy">
            <span>© {new Date().getFullYear()} ЮрПомощь Приморье. Все права защищены.</span>
            <span>Приморский край</span>
          </div>
        </div>
      </footer>

      {/* STICKY MOBILE BAR */}
      <div className="sticky-bar">
        <div className="sticky-row">
          <a className="lbtn lbtn-gold" href="#consult" onClick={(e) => { e.preventDefault(); scrollTo("#consult"); }}>Консультация</a>
          <a className="lbtn lbtn-outline" href={PHONE_HREF}>Позвонить</a>
        </div>
      </div>

      {/* LIVE CHAT */}
      <ChatWidget />
    </div>
  );
}