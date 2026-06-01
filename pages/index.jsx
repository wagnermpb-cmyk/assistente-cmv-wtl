import { useState, useRef, useEffect } from "react";
import Head from "next/head";

const QUICK_PROMPTS = [
  { label: "Calcular meu CMV", icon: "📊", prompt: "Quero calcular o CMV do meu restaurante. Me explica o que preciso levantar e como fazer a conta." },
  { label: "Desperdício do salmão", icon: "🐟", prompt: "Como uso a planilha de desperdício do salmão e o que fazer se estiver fora do benchmark de 25%?" },
  { label: "Custo real do kg", icon: "⚖️", prompt: "Quero calcular o custo real do kg usável do salmão considerando o aproveitamento. Me ajuda com essa conta." },
  { label: "Minha curva A", icon: "📈", prompt: "Como identifico minha curva A de pratos e por que isso importa pro CMV?" },
  { label: "Gap teórico vs real", icon: "🎯", prompt: "Como descubro o gap entre meu CMV teórico e o real? O que faço com essa informação?" },
  { label: "Bônus da equipe", icon: "💰", prompt: "Quero montar um sistema de bonificação por CMV para a liderança do meu restaurante. Como estruturo?" },
  { label: "Balanço semanal", icon: "📋", prompt: "Como implemento o balanço de estoque semanal na prática? O que preciso e como funciona?" },
  { label: "5 alavancas de redução", icon: "🔧", prompt: "Quais são as 5 alavancas para reduzir o CMV e qual devo priorizar primeiro?" },
];

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState({ tipo: "", faturamento: "", cmvAtual: "" });
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const buildContextStr = () => {
    const parts = [];
    if (context.tipo) parts.push(`Tipo/operação: ${context.tipo}`);
    if (context.faturamento) parts.push(`Faturamento mensal: ${context.faturamento}`);
    if (context.cmvAtual) parts.push(`CMV atual: ${context.cmvAtual}`);
    return parts.length ? `\n\n[Dados do restaurante: ${parts.join(" | ")}]` : "";
  };

  const sendMessage = async (text) => {
    const userMsg = text.trim();
    if (!userMsg || loading) return;
    setInput("");
    const newMessages = [...messages, { role: "user", content: userMsg }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          contextStr: messages.length === 0 ? buildContextStr() : "",
        }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.reply || "Erro ao gerar resposta." }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Erro de conexão. Tente novamente." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  const started = messages.length > 0;

  return (
    <>
      <Head>
        <title>Assistente CMV — WTL · Sushi Life</title>
        <meta name="description" content="Assistente do curso CMV na Prática — Wagner Barreto · WTL · Sushi Life" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet" />
      </Head>

      <div className="root">
        <header className="header">
          <div className="header-left">
            <div className="wtl-badge">WTL</div>
            <div>
              <div className="header-sub">Sushi Life · Wagner Barreto</div>
              <div className="header-title">Assistente CMV</div>
            </div>
          </div>
          {started && (
            <button className="reset-btn" onClick={() => setMessages([])}>↩ nova conversa</button>
          )}
        </header>

        <main className="main">
          <div className="chat-area">
            {!started && (
              <div className="initial">
                <div className="context-box">
                  <div className="section-label red">seu restaurante <span className="optional">(opcional)</span></div>
                  <p className="context-hint">Preencha para respostas com seus números reais. Pode deixar em branco.</p>
                  <div className="context-grid">
                    {[
                      { key: "tipo", label: "Tipo / operação", ph: "Ex: Japonês, 2 lojas" },
                      { key: "faturamento", label: "Faturamento / mês", ph: "Ex: R$ 120.000" },
                      { key: "cmvAtual", label: "CMV atual", ph: "Ex: 38%" },
                    ].map(f => (
                      <div key={f.key} className="context-field">
                        <label className="field-label">{f.label}</label>
                        <input
                          value={context[f.key]}
                          onChange={e => setContext(c => ({ ...c, [f.key]: e.target.value }))}
                          placeholder={f.ph}
                          className="field-input"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="section-label">atalhos do curso</div>
                <div className="prompts-grid">
                  {QUICK_PROMPTS.map((p, i) => (
                    <button key={i} className="prompt-btn" onClick={() => sendMessage(p.prompt)}>
                      <span className="prompt-icon">{p.icon}</span>
                      <span>{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="messages">
              {messages.map((m, i) => (
                <div key={i} className={`msg-wrap ${m.role}`}>
                  <div className="msg-label">{m.role === "user" ? "você" : "assistente cmv"}</div>
                  <div className={`msg-bubble ${m.role}`}>{m.content}</div>
                </div>
              ))}
              {loading && (
                <div className="msg-wrap assistant">
                  <div className="msg-label">assistente cmv</div>
                  <div className="msg-bubble assistant loading-bubble">
                    <span className="dot" style={{ animationDelay: "0s" }} />
                    <span className="dot" style={{ animationDelay: ".2s" }} />
                    <span className="dot" style={{ animationDelay: ".4s" }} />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          </div>
        </main>

        <footer className="footer">
          {started && (
            <div className="mini-prompts">
              {QUICK_PROMPTS.slice(0, 4).map((p, i) => (
                <button key={i} className="mini-btn" onClick={() => sendMessage(p.prompt)} disabled={loading}>
                  {p.icon} {p.label}
                </button>
              ))}
            </div>
          )}
          <div className="input-row">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              disabled={loading}
              rows={2}
              placeholder="Digite sua dúvida ou os dados do seu restaurante..."
              className="input-area"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              className={`send-btn ${input.trim() && !loading ? "active" : ""}`}
            >→</button>
          </div>
          <div className="footer-hint">ENTER envia · SHIFT+ENTER nova linha · Uma vida inteira de conhecimento.</div>
        </footer>
      </div>

      <style jsx global>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; }
        body { background: #000; color: #fff; font-family: 'IBM Plex Mono', 'Courier New', monospace; }
        #__next { height: 100%; }
      `}</style>

      <style jsx>{`
        .root { display: flex; flex-direction: column; height: 100vh; }
        .header { display: flex; align-items: center; justify-content: space-between; padding: 12px 24px; border-bottom: 1px solid #1a1a1a; flex-shrink: 0; background: #000; position: sticky; top: 0; z-index: 10; }
        .header-left { display: flex; align-items: center; gap: 12px; }
        .wtl-badge { background: #fff; color: #000; font-weight: 900; font-size: 11px; padding: 3px 9px; letter-spacing: 3px; font-family: 'Arial Black', sans-serif; }
        .header-sub { font-size: 9px; color: #444; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 2px; }
        .header-title { font-size: 13px; font-weight: 700; letter-spacing: 1px; color: #fff; }
        .reset-btn { background: transparent; border: 1px solid #1a1a1a; color: #444; font-size: 10px; padding: 6px 14px; cursor: pointer; font-family: inherit; letter-spacing: 1px; transition: all .15s; }
        .reset-btn:hover { border-color: #333; color: #888; }
        .main { flex: 1; overflow-y: auto; }
        .chat-area { max-width: 800px; margin: 0 auto; padding: 0 20px; }
        .initial { padding-top: 28px; }
        .section-label { font-size: 9px; color: #333; letter-spacing: 3px; text-transform: uppercase; font-family: 'Arial Black', sans-serif; margin-bottom: 14px; }
        .section-label.red { color: #c00; }
        .optional { color: #333; font-family: 'IBM Plex Mono', monospace; font-size: 9px; }
        .context-box { border: 1px solid #1a1a1a; padding: 18px 20px; margin-bottom: 28px; }
        .context-hint { font-size: 11px; color: #333; margin-bottom: 16px; line-height: 1.6; }
        .context-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
        .context-field { display: flex; flex-direction: column; gap: 6px; }
        .field-label { font-size: 8px; color: #444; letter-spacing: 2px; text-transform: uppercase; }
        .field-input { background: #050505; border: 1px solid #1a1a1a; color: #ccc; padding: 8px 10px; font-size: 11px; font-family: inherit; outline: none; transition: border-color .15s; }
        .field-input:focus { border-color: #333; }
        .field-input::placeholder { color: #252525; }
        .prompts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 24px; }
        .prompt-btn { display: flex; align-items: center; gap: 10px; background: #050505; border: 1px solid #141414; color: #666; padding: 12px 14px; cursor: pointer; font-family: inherit; font-size: 12px; text-align: left; transition: all .15s; }
        .prompt-btn:hover { border-color: #c00; color: #fff; background: #0a0a0a; }
        .prompt-icon { font-size: 16px; flex-shrink: 0; }
        .messages { padding: 20px 0 16px; }
        .msg-wrap { display: flex; flex-direction: column; margin-bottom: 22px; }
        .msg-wrap.user { align-items: flex-end; }
        .msg-wrap.assistant { align-items: flex-start; }
        .msg-label { font-size: 8px; color: #333; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 6px; font-family: 'Arial Black', sans-serif; }
        .msg-bubble { max-width: 88%; padding: 13px 16px; font-size: 13px; line-height: 1.8; white-space: pre-wrap; word-break: break-word; }
        .msg-bubble.user { background: #fff; color: #000; }
        .msg-bubble.assistant { background: #080808; color: #ccc; border: 1px solid #1a1a1a; }
        .loading-bubble { display: flex; gap: 5px; align-items: center; padding: 14px 16px; }
        .dot { display: inline-block; width: 5px; height: 5px; background: #c00; border-radius: 50%; animation: pulse 1.2s ease infinite; }
        @keyframes pulse { 0%,100%{opacity:.2;transform:scale(.7)} 50%{opacity:1;transform:scale(1.3)} }
        .footer { border-top: 1px solid #111; padding: 10px 24px 16px; flex-shrink: 0; background: #000; }
        .mini-prompts { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
        .mini-btn { background: transparent; border: 1px solid #141414; color: #333; font-size: 9px; padding: 4px 10px; cursor: pointer; font-family: inherit; letter-spacing: 1px; transition: all .15s; }
        .mini-btn:hover:not(:disabled) { color: #888; border-color: #333; }
        .mini-btn:disabled { opacity: .4; cursor: default; }
        .input-row { display: flex; gap: 8px; max-width: 800px; margin: 0 auto; }
        .input-area { flex: 1; background: #050505; border: 1px solid #1a1a1a; color: #ccc; padding: 10px 13px; font-size: 13px; font-family: inherit; resize: none; outline: none; line-height: 1.6; transition: border-color .15s; }
        .input-area:focus { border-color: #2a2a2a; }
        .input-area::placeholder { color: #222; }
        .send-btn { background: #111; border: none; color: #444; padding: 0 20px; font-size: 20px; cursor: default; transition: background .15s; flex-shrink: 0; }
        .send-btn.active { background: #c00; color: #fff; cursor: pointer; }
        .send-btn.active:hover { background: #a00; }
        .footer-hint { font-size: 9px; color: #1a1a1a; margin-top: 8px; letter-spacing: 1px; text-align: center; }
        @media (max-width: 600px) {
          .context-grid { grid-template-columns: 1fr; }
          .prompts-grid { grid-template-columns: 1fr; }
          .chat-area { padding: 0 14px; }
          .footer { padding: 10px 14px 14px; }
          .mini-prompts { display: none; }
        }
      `}</style>
    </>
  );
}
