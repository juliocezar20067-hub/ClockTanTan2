import { useState, useCallback, type CSSProperties } from "react";

// ---------- Types ----------
type CardType = "acerto" | "acerto_critico" | "erro" | "erro_critico";

interface Card {
  tipo: CardType;
}

interface DeckState {
  [attr: string]: Card[];
}

interface AccuracyState {
  [attr: string]: number;
}

interface ResultState {
  [attr: string]: Card | null;
}

interface FlipState {
  [attr: string]: boolean;
}

// ---------- Attribute Themes ----------
interface AttrTheme {
  icon: string;
  emoji: string;
  pattern: string;
  subtitle: string;
  gradientFrom: string;
  gradientTo: string;
  borderColor: string;
  bgLight: string;
  bonusBg: string;
}

const ATTR_THEMES: Record<string, AttrTheme> = {
  Força: {
    icon: "fa-fist-raised",
    emoji: "💪",
    pattern: "'⚔️'",
    subtitle: "Poder Bruto",
    gradientFrom: "#dc2626",
    gradientTo: "#7f1d1d",
    borderColor: "#b91c1c",
    bgLight: "#fef2f2",
    bonusBg: "#fee2e2",
  },
  Destreza: {
    icon: "fa-running",
    emoji: "🏃",
    pattern: "'🗡️'",
    subtitle: "Agilidade & Reflexo",
    gradientFrom: "#059669",
    gradientTo: "#064e3b",
    borderColor: "#047857",
    bgLight: "#ecfdf5",
    bonusBg: "#d1fae5",
  },
  Constituição: {
    icon: "fa-shield-alt",
    emoji: "🛡️",
    pattern: "'🛡️'",
    subtitle: "Resistência & Vigor",
    gradientFrom: "#d97706",
    gradientTo: "#78350f",
    borderColor: "#b45309",
    bgLight: "#fffbeb",
    bonusBg: "#fef3c7",
  },
  Inteligência: {
    icon: "fa-brain",
    emoji: "🧠",
    pattern: "'📖'",
    subtitle: "Mente & Razão",
    gradientFrom: "#2563eb",
    gradientTo: "#1e3a8a",
    borderColor: "#1d4ed8",
    bgLight: "#eff6ff",
    bonusBg: "#dbeafe",
  },
  Sabedoria: {
    icon: "fa-eye",
    emoji: "👁️",
    pattern: "'🔮'",
    subtitle: "Percepção & Intuição",
    gradientFrom: "#9333ea",
    gradientTo: "#581c87",
    borderColor: "#7e22ce",
    bgLight: "#faf5ff",
    bonusBg: "#f3e8ff",
  },
  Carisma: {
    icon: "fa-crown",
    emoji: "👑",
    pattern: "'✨'",
    subtitle: "Presença & Influência",
    gradientFrom: "#ca8a04",
    gradientTo: "#713f12",
    borderColor: "#a16207",
    bgLight: "#fefce8",
    bonusBg: "#fef9c3",
  },
};

// ---------- Constants ----------
const ATRIBUTOS = [
  "Força",
  "Destreza",
  "Constituição",
  "Inteligência",
  "Sabedoria",
  "Carisma",
];
const ACERTOS_CRITICOS_FIXOS = 1;
const ERROS_COMUNS_FIXOS = 11;
const ERROS_CRITICOS_FIXOS = 1;
const ACERTOS_INICIAIS_COMUNS = 8;

// ---------- Helpers ----------
function embaralhar(arr: Card[]): Card[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function criarDeck(acertosComuns: number): Card[] {
  const deck: Card[] = [];
  for (let i = 0; i < acertosComuns; i++) deck.push({ tipo: "acerto" });
  for (let i = 0; i < ACERTOS_CRITICOS_FIXOS; i++)
    deck.push({ tipo: "acerto_critico" });
  for (let i = 0; i < ERROS_COMUNS_FIXOS; i++) deck.push({ tipo: "erro" });
  for (let i = 0; i < ERROS_CRITICOS_FIXOS; i++)
    deck.push({ tipo: "erro_critico" });
  return embaralhar(deck);
}

function criarTodosDecks(acertosComuns: AccuracyState): DeckState {
  const decks: DeckState = {};
  ATRIBUTOS.forEach((attr) => {
    decks[attr] = criarDeck(acertosComuns[attr]);
  });
  return decks;
}

function initAcertos(): AccuracyState {
  const acc: AccuracyState = {};
  ATRIBUTOS.forEach((attr) => {
    acc[attr] = ACERTOS_INICIAIS_COMUNS;
  });
  return acc;
}

function initResults(): ResultState {
  const res: ResultState = {};
  ATRIBUTOS.forEach((attr) => {
    res[attr] = null;
  });
  return res;
}

function initFlipped(): FlipState {
  const f: FlipState = {};
  ATRIBUTOS.forEach((attr) => {
    f[attr] = false;
  });
  return f;
}

function calcularBonus(attr: string, acertosComuns: number) {
  const totalAcertos = acertosComuns + ACERTOS_CRITICOS_FIXOS;
  switch (attr) {
    case "Força":
      return { dano: Math.floor(totalAcertos / 3), carga: totalAcertos };
    case "Destreza":
      return { esquiva: Math.min(totalAcertos, 75) };
    case "Constituição":
      return { vida: totalAcertos * 4 };
    case "Inteligência":
      return {
        investigacao: totalAcertos,
        progresso: Math.floor(totalAcertos / 10),
      };
    case "Sabedoria":
      return {
        percepcao: totalAcertos,
        engenhosidade: totalAcertos,
        transformacoes: Math.floor(totalAcertos / 10),
      };
    case "Carisma": {
      let afinidade = 0;
      if (totalAcertos >= 91) afinidade = 26;
      else if (totalAcertos >= 80) afinidade = 22;
      else if (totalAcertos >= 68) afinidade = 20;
      else if (totalAcertos >= 58) afinidade = 18;
      else if (totalAcertos >= 49) afinidade = 14;
      else if (totalAcertos >= 41) afinidade = 12;
      else if (totalAcertos >= 31) afinidade = 11;
      else if (totalAcertos >= 27) afinidade = 8;
      else if (totalAcertos >= 23) afinidade = 7;
      else if (totalAcertos >= 19) afinidade = 6;
      else if (totalAcertos >= 15) afinidade = 5;
      else if (totalAcertos >= 11) afinidade = 4;
      else if (totalAcertos >= 8) afinidade = 3;
      return { astucia: totalAcertos, afinidade };
    }
    default:
      return {};
  }
}

function getBonusContent(
  attr: string,
  bonus: Record<string, number>
): React.ReactNode {
  switch (attr) {
    case "Força":
      return (
        <>
          <p>⚔️ Dano: <strong>+{bonus.dano}</strong></p>
          <p>📦 Carga: <strong>{bonus.carga}kg</strong></p>
        </>
      );
    case "Destreza":
      return <p>💨 Esquiva: <strong>{bonus.esquiva}%</strong></p>;
    case "Constituição":
      return <p>❤️ Vida: <strong>+{bonus.vida}</strong></p>;
    case "Inteligência":
      return (
        <>
          <p>🔍 Investigação: <strong>{bonus.investigacao}%</strong></p>
          <p>📈 Progresso: <strong>+{bonus.progresso}</strong></p>
        </>
      );
    case "Sabedoria":
      return (
        <>
          <p>👁️ Percepção: <strong>{bonus.percepcao}%</strong></p>
          <p>🧠 Engenh.: <strong>{bonus.engenhosidade}</strong></p>
          <p>✨ Críticos: <strong>+{bonus.transformacoes}</strong></p>
        </>
      );
    case "Carisma":
      return (
        <>
          <p>🎭 Astúcia: <strong>{bonus.astucia}%</strong></p>
          <p>🔮 Afinidade: <strong>{bonus.afinidade}</strong></p>
        </>
      );
    default:
      return null;
  }
}

function getResultInfo(card: Card): {
  icon: string;
  iconClass: string;
  text: string;
  textColor: string;
  glowClass: string;
  bgColor: string;
} {
  switch (card.tipo) {
    case "acerto":
      return {
        icon: "fa-check-circle",
        iconClass: "text-green-500",
        text: "ACERTO",
        textColor: "#16a34a",
        glowClass: "glow-acerto",
        bgColor: "#f0fdf4",
      };
    case "acerto_critico":
      return {
        icon: "fa-star",
        iconClass: "text-yellow-500",
        text: "ACERTO CRÍTICO",
        textColor: "#ca8a04",
        glowClass: "glow-acerto-critico",
        bgColor: "#fefce8",
      };
    case "erro":
      return {
        icon: "fa-times-circle",
        iconClass: "text-red-500",
        text: "ERRO",
        textColor: "#dc2626",
        glowClass: "glow-erro",
        bgColor: "#fef2f2",
      };
    case "erro_critico":
      return {
        icon: "fa-skull-crossbones",
        iconClass: "text-red-900",
        text: "ERRO CRÍTICO",
        textColor: "#7f1d1d",
        glowClass: "glow-erro-critico",
        bgColor: "#fef2f2",
      };
  }
}

// ---------- DeckCard Component ----------
function DeckCard({
  attr,
  deck,
  acertosComuns,
  resultado,
  pontosDistribuir,
  isFlipped,
  onPuxar,
  onReembaralhar,
  onIncrement,
  onFlipBack,
}: {
  attr: string;
  deck: Card[];
  acertosComuns: number;
  resultado: Card | null;
  pontosDistribuir: number;
  isFlipped: boolean;
  onPuxar: () => void;
  onReembaralhar: () => void;
  onIncrement: () => void;
  onFlipBack: () => void;
}) {
  const theme = ATTR_THEMES[attr];
  const acertosNo = deck.filter(
    (c) => c.tipo === "acerto" || c.tipo === "acerto_critico"
  ).length;
  const errosNo = deck.filter(
    (c) => c.tipo === "erro" || c.tipo === "erro_critico"
  ).length;
  const total = deck.length;
  const bonus = calcularBonus(attr, acertosComuns) as Record<string, number>;

  const cssVars = {
    "--card-gradient": `linear-gradient(135deg, ${theme.gradientFrom}, ${theme.gradientTo})`,
    "--card-border": theme.borderColor,
    "--card-bg": theme.bgLight,
    "--card-bonus-bg": theme.bonusBg,
    "--card-pattern": theme.pattern,
  } as CSSProperties;

  const resultInfo = resultado ? getResultInfo(resultado) : null;

  return (
    <div className="card-wrapper" style={cssVars}>
      {/* The flippable card area */}
      <div className="flip-card">
        <div className={`flip-card-inner ${isFlipped ? "flipped" : ""}`}>
          {/* ===== FRONT: Attribute Info ===== */}
          <div className="flip-card-front">
            <div className="card-face">
              {/* Header */}
              <div className="card-header">
                <div className="card-header-icon">
                  <i className={`fas ${theme.icon}`}></i>
                </div>
                <div className="card-header-text">
                  <h3>{attr}</h3>
                  <p className="card-subtitle">{theme.subtitle}</p>
                </div>
                <div
                  style={{
                    marginLeft: "auto",
                    fontSize: "1.8rem",
                    position: "relative",
                    zIndex: 2,
                    filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))",
                  }}
                >
                  {theme.emoji}
                </div>
              </div>

              {/* Body */}
              <div className="card-body">
                {/* Stats row */}
                <div className="card-stats">
                  <span style={{ color: "#16a34a" }}>✅ {acertosNo}</span>
                  <span style={{ color: "#dc2626" }}>❌ {errosNo}</span>
                  <span style={{ color: "#6b7280" }}>📦 {total}</span>
                </div>

                {/* Bonus section */}
                <div className="card-bonus">{getBonusContent(attr, bonus)}</div>

                {/* Deck composition hint */}
                <div className="card-deck-count">
                  Total no deck: {acertosComuns + ACERTOS_CRITICOS_FIXOS} acertos
                  · {ERROS_COMUNS_FIXOS + ERROS_CRITICOS_FIXOS} erros
                </div>

                {/* Visual card hint */}
                <div
                  style={{
                    textAlign: "center",
                    fontSize: "0.72rem",
                    color: "#aaa",
                    marginTop: "auto",
                    paddingTop: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "4px",
                  }}
                >
                  <i className="fas fa-hand-pointer"></i> Clique em "Puxar"
                  para sacar
                </div>
              </div>
            </div>
          </div>

          {/* ===== BACK: Result Display ===== */}
          <div className="flip-card-back">
            <div
              className={`card-face ${resultInfo ? resultInfo.glowClass : ""}`}
              style={
                resultInfo
                  ? {
                      borderColor: resultInfo.textColor,
                    }
                  : undefined
              }
            >
              {/* Same themed header */}
              <div className="card-header">
                <div className="card-header-icon">
                  <i className={`fas ${theme.icon}`}></i>
                </div>
                <div className="card-header-text">
                  <h3>{attr}</h3>
                  <p className="card-subtitle">Resultado do Saque</p>
                </div>
                <div
                  style={{
                    marginLeft: "auto",
                    fontSize: "1.8rem",
                    position: "relative",
                    zIndex: 2,
                    filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))",
                  }}
                >
                  {theme.emoji}
                </div>
              </div>

              {/* Result body */}
              <div
                className="card-result-body"
                onClick={onFlipBack}
                style={{
                  background: resultInfo
                    ? resultInfo.bgColor
                    : theme.bgLight,
                  cursor: "pointer",
                }}
              >
                {resultInfo ? (
                  <>
                    <div className="result-icon">
                      <i
                        className={`fas ${resultInfo.icon} ${resultInfo.iconClass}`}
                      ></i>
                    </div>
                    <div
                      className="result-text"
                      style={{ color: resultInfo.textColor }}
                    >
                      {resultInfo.text}
                    </div>
                    <div
                      style={{
                        fontSize: "0.8rem",
                        color: "#888",
                        marginTop: "4px",
                      }}
                    >
                      Restam: {total} cartas
                    </div>
                  </>
                ) : (
                  <span style={{ color: "#aaa", fontSize: "1.1rem" }}>
                    Nenhuma carta sacada
                  </span>
                )}
                <div className="result-hint">
                  <i className="fas fa-undo-alt"></i> Clique para voltar
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls - always visible below the card */}
      <div className="card-controls">
        <button
          className="btn-increment"
          onClick={(e) => {
            e.stopPropagation();
            onIncrement();
          }}
          disabled={pontosDistribuir <= 0}
          title="Adicionar acerto"
        >
          +
        </button>
        <button
          className="btn-puxar"
          onClick={(e) => {
            e.stopPropagation();
            onPuxar();
          }}
          disabled={total === 0}
        >
          <i className="fas fa-hand-point-up"></i> Puxar
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onReembaralhar();
          }}
        >
          <i className="fas fa-sync-alt"></i> Reemb.
        </button>
      </div>
    </div>
  );
}

// ---------- Main App ----------
export function App() {
  const [nivel, setNivel] = useState(1);
  const [pontosDistribuir, setPontosDistribuir] = useState(21);
  const [acertosComuns, setAcertosComuns] =
    useState<AccuracyState>(initAcertos);
  const [decks, setDecks] = useState<DeckState>(() =>
    criarTodosDecks(initAcertos())
  );
  const [resultados, setResultados] = useState<ResultState>(initResults);
  const [flipped, setFlipped] = useState<FlipState>(initFlipped);

  const sabedoriaTotal =
    (acertosComuns["Sabedoria"] || ACERTOS_INICIAIS_COMUNS) +
    ACERTOS_CRITICOS_FIXOS;

  const handlePuxar = useCallback(
    (attr: string) => {
      const deck = decks[attr];
      if (deck.length === 0) {
        alert(`Deck de ${attr} vazio! Reembaralhe.`);
        return;
      }
      const novoDeck = [...deck];
      const carta = novoDeck.pop()!;
      setDecks((prev) => ({ ...prev, [attr]: novoDeck }));
      setResultados((prev) => ({ ...prev, [attr]: carta }));
      // Flip the card to show result
      setFlipped((prev) => ({ ...prev, [attr]: true }));
    },
    [decks]
  );

  const handleFlipBack = useCallback((attr: string) => {
    setFlipped((prev) => ({ ...prev, [attr]: false }));
  }, []);

  const handleReembaralhar = useCallback(
    (attr: string) => {
      setDecks((prev) => ({
        ...prev,
        [attr]: criarDeck(acertosComuns[attr]),
      }));
      setFlipped((prev) => ({ ...prev, [attr]: false }));
      setResultados((prev) => ({ ...prev, [attr]: null }));
    },
    [acertosComuns]
  );

  const handleReembaralharTodos = useCallback(() => {
    setDecks(criarTodosDecks(acertosComuns));
    setFlipped(initFlipped());
    setResultados(initResults());
  }, [acertosComuns]);

  const handleIncrement = useCallback(
    (attr: string) => {
      if (pontosDistribuir <= 0) {
        alert("Você não tem mais pontos de acerto para distribuir!");
        return;
      }
      const novoAcertos = {
        ...acertosComuns,
        [attr]: acertosComuns[attr] + 1,
      };
      setAcertosComuns(novoAcertos);
      setPontosDistribuir((prev) => prev - 1);
      setDecks((prev) => ({
        ...prev,
        [attr]: criarDeck(novoAcertos[attr]),
      }));
      setFlipped((prev) => ({ ...prev, [attr]: false }));
    },
    [acertosComuns, pontosDistribuir]
  );

  const handleSubirNivel = useCallback(() => {
    setNivel((prev) => prev + 1);
    setPontosDistribuir((prev) => prev + 2);
  }, []);

  return (
    <div className="app-bg">
      <div className="tool">
        <h1 className="text-center mt-0 text-slate-700 text-2xl md:text-3xl font-bold">
          ⏰ Clock Tan-Tan · Ferramenta do Mestre
        </h1>
        <div className="text-center mb-6 text-slate-600 italic">
          Gerenciamento de decks, progressão, perícias e regras
        </div>

        {/* Nível e pontos */}
        <div className="nivel-info">
          <span className="font-bold text-slate-700">
            🎯 Nível: <span className="text-lg">{nivel}</span>
          </span>
          <span className="font-bold text-slate-700">
            🎴 Acertos para distribuir:{" "}
            <span className="text-lg text-green-700">{pontosDistribuir}</span>
          </span>
          <button
            onClick={handleSubirNivel}
            className="py-2 px-5 border-2 border-slate-500 bg-slate-600 hover:bg-slate-700 text-white rounded-full cursor-pointer text-sm font-bold transition-all hover:scale-105 active:scale-95 shadow-md"
          >
            ⬆ Subir Nível (+2 acertos)
          </button>
        </div>

        <div className="principal">
          {/* Decks section */}
          <div className="decks-section">
            <div className="decks-grid">
              {ATRIBUTOS.map((attr) => (
                <DeckCard
                  key={attr}
                  attr={attr}
                  deck={decks[attr]}
                  acertosComuns={acertosComuns[attr]}
                  resultado={resultados[attr]}
                  pontosDistribuir={pontosDistribuir}
                  isFlipped={flipped[attr]}
                  onPuxar={() => handlePuxar(attr)}
                  onReembaralhar={() => handleReembaralhar(attr)}
                  onIncrement={() => handleIncrement(attr)}
                  onFlipBack={() => handleFlipBack(attr)}
                />
              ))}
            </div>
            <div className="text-center my-5">
              <button
                onClick={handleReembaralharTodos}
                className="py-3 px-8 border-2 border-slate-500 bg-slate-600 hover:bg-slate-700 text-white rounded-full cursor-pointer text-base font-bold transition-all hover:scale-105 active:scale-95 shadow-lg"
              >
                🔄 Reembaralhar todos os decks
              </button>
            </div>
          </div>

          {/* Painel lateral: Afinidade */}
          <div className="info-section">
            <div className="painel">
              <h2 className="panel-title">
                <i className="fas fa-handshake"></i> Afinidade (Carisma)
              </h2>
              <table className="panel-table">
                <thead>
                  <tr>
                    <th>Pontos de Carisma</th>
                    <th>Afinidade</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>8-10</td>
                    <td>3</td>
                  </tr>
                  <tr>
                    <td>11-14</td>
                    <td>4</td>
                  </tr>
                  <tr>
                    <td>15-18</td>
                    <td>5</td>
                  </tr>
                  <tr>
                    <td>19-20</td>
                    <td>6</td>
                  </tr>
                  <tr>
                    <td>23-26</td>
                    <td>7</td>
                  </tr>
                  <tr>
                    <td>27-30</td>
                    <td>8</td>
                  </tr>
                  <tr>
                    <td>31-40</td>
                    <td>11</td>
                  </tr>
                  <tr>
                    <td>41-48</td>
                    <td>12</td>
                  </tr>
                  <tr>
                    <td>49-57</td>
                    <td>14</td>
                  </tr>
                  <tr>
                    <td>58-67</td>
                    <td>18</td>
                  </tr>
                  <tr>
                    <td>68-79</td>
                    <td>20</td>
                  </tr>
                  <tr>
                    <td>80-90</td>
                    <td>22</td>
                  </tr>
                  <tr>
                    <td>91-100</td>
                    <td>26</td>
                  </tr>
                </tbody>
              </table>
              <p className="mt-2 text-xs text-gray-600">
                Espaço de artefatos: 1º:1, 2º:3, 3º:4, 4º:7, 5º:11
              </p>
            </div>
          </div>
        </div>

        {/* Painéis inferiores */}
        <div className="paineis-inferiores">
          {/* Tabela de classes */}
          <div className="painel">
            <h2 className="panel-title">
              <i className="fas fa-dragon"></i> Tabela de classes
            </h2>
            <table className="panel-table">
              <thead>
                <tr>
                  <th>Classe</th>
                  <th>Valor</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Variante</td>
                  <td>1</td>
                </tr>
                <tr>
                  <td>Feiticeiro</td>
                  <td>2</td>
                </tr>
                <tr>
                  <td>Santo vivo</td>
                  <td>3</td>
                </tr>
                <tr>
                  <td>Mago</td>
                  <td>4-6</td>
                </tr>
                <tr>
                  <td>Paladino</td>
                  <td>7-8</td>
                </tr>
                <tr>
                  <td>Bruxa</td>
                  <td>9-10</td>
                </tr>
                <tr>
                  <td>Guerreiro</td>
                  <td>10-100</td>
                </tr>
              </tbody>
            </table>
            <p className="mt-2 text-xs text-gray-600">
              Classes mágicas têm progressão própria.
            </p>
          </div>

          {/* Combate: A Trindade */}
          <div className="painel regras">
            <h2 className="panel-title">
              <i className="fas fa-fist-raised"></i> Combate: A Trindade
            </h2>
            <p>
              <strong>1ª Ação:</strong> Sacar 1 carta (acerto = sucesso).
            </p>
            <p>
              <strong>2ª Ação:</strong> Sacar 2 cartas (priorizar erro:
              qualquer erro anula).
            </p>
            <p>
              <strong>3ª Ação:</strong> Sacar 3 cartas (priorizar erro).
            </p>
            <p>
              <strong>Esquiva:</strong> d100: 1ª total, 2ª metade, 3ª quarto.
            </p>
            <p>
              <strong>Mitigação:</strong> usar ação para movimento/interação
              sem teste.
            </p>
            <p>
              <strong>Iniciativa:</strong> saque do deck de Destreza.
            </p>
          </div>

          {/* Horizonte de Eventos */}
          <div className="painel regras">
            <h2 className="panel-title">
              <i className="fas fa-hourglass-half"></i> Horizonte de Eventos
            </h2>
            <p>O tempo é recurso. Mestre define custo antes do teste.</p>
            <p>
              <strong>Pressa:</strong> metade do tempo, penalidade (priorizar
              erro ou -50% perícia).
            </p>
            <p>
              <strong>Cuidado:</strong> dobro do tempo, vantagem.
            </p>
            <p>Falha: tempo passa, nova tentativa custa mais.</p>
          </div>

          {/* Perícias & Engenhosidade */}
          <div className="painel">
            <h2 className="panel-title">
              <i className="fas fa-dice-d20"></i> Perícias &amp; Engenhosidade
              (d100)
            </h2>
            <p className="text-sm">
              <strong>Base:</strong> Todas as perícias começam com 15%.
              Personagem inicia escolhendo:
            </p>
            <ul className="text-sm list-disc ml-5 my-2 space-y-1">
              <li>
                3 perícias para aumentar <strong>+25%</strong> (ficam com 40%)
              </li>
              <li>
                3 perícias para aumentar <strong>+15%</strong> (ficam com 30%)
              </li>
              <li>
                2 perícias para ser <strong>proficiente</strong> (vantagem: rola
                duas vezes e fica com o melhor resultado)
              </li>
            </ul>
            <p className="text-sm">
              <strong>Engenhosidade:</strong> Cada ponto de Sabedoria (acerto)
              dá <strong>4%</strong> para distribuir em qualquer perícia (máximo
              80% por perícia). Atualmente você tem{" "}
              <strong>{sabedoriaTotal}</strong> pontos de engenhosidade
              (Sabedoria).
            </p>

            <div className="pericias-grid">
              <div>
                <h3 className="text-base font-bold border-b border-gray-400 pb-1 mb-2">
                  Físicas
                </h3>
                <ul className="list-none p-0 m-0">
                  <li className="py-0.5 text-sm border-b border-dotted border-gray-300">
                    Acrobacia
                  </li>
                  <li className="py-0.5 text-sm border-b border-dotted border-gray-300">
                    Atletismo
                  </li>
                  <li className="py-0.5 text-sm border-b border-dotted border-gray-300">
                    Furtividade
                  </li>
                  <li className="py-0.5 text-sm border-b border-dotted border-gray-300">
                    Prestidigitação
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-base font-bold border-b border-gray-400 pb-1 mb-2">
                  Sociais
                </h3>
                <ul className="list-none p-0 m-0">
                  <li className="py-0.5 text-sm border-b border-dotted border-gray-300">
                    Atuação
                  </li>
                  <li className="py-0.5 text-sm border-b border-dotted border-gray-300">
                    Enganação
                  </li>
                  <li className="py-0.5 text-sm border-b border-dotted border-gray-300">
                    Intimidação
                  </li>
                  <li className="py-0.5 text-sm border-b border-dotted border-gray-300">
                    Intuição
                  </li>
                  <li className="py-0.5 text-sm border-b border-dotted border-gray-300">
                    Persuasão
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-base font-bold border-b border-gray-400 pb-1 mb-2">
                  Conhecimento
                </h3>
                <ul className="list-none p-0 m-0">
                  <li className="py-0.5 text-sm border-b border-dotted border-gray-300">
                    Arcanismo
                  </li>
                  <li className="py-0.5 text-sm border-b border-dotted border-gray-300">
                    História
                  </li>
                  <li className="py-0.5 text-sm border-b border-dotted border-gray-300">
                    Natureza
                  </li>
                  <li className="py-0.5 text-sm border-b border-dotted border-gray-300">
                    Religião
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-base font-bold border-b border-gray-400 pb-1 mb-2">
                  Práticas
                </h3>
                <ul className="list-none p-0 m-0">
                  <li className="py-0.5 text-sm border-b border-dotted border-gray-300">
                    Investigação
                  </li>
                  <li className="py-0.5 text-sm border-b border-dotted border-gray-300">
                    Medicina
                  </li>
                  <li className="py-0.5 text-sm border-b border-dotted border-gray-300">
                    Percepção
                  </li>
                  <li className="py-0.5 text-sm border-b border-dotted border-gray-300">
                    Sobrevivência
                  </li>
                  <li className="py-0.5 text-sm border-b border-dotted border-gray-300">
                    Adestrar Animais
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-gray-200 p-2 rounded mt-3 text-sm">
              <i className="fas fa-info-circle"></i>{" "}
              <strong>Lembrete:</strong> Perícias são resolvidas com d100
              (rolar abaixo do valor). Dificuldade pode ser reduzida para
              metade ou quarto do valor em tarefas complexas.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
