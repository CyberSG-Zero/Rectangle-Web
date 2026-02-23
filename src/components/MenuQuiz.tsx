import { useState, useEffect } from "react";

// ─── TYPES ────────────────────────────────────────────────────────────────────

export interface QuizOption {
  label: string;
  value: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
}

export interface QuizProduct {
  id: number;
  title: string;
  price: string;
  image: string;
  tags: string[];
}

export interface QuizProps {
  dietaryQuestion?: QuizQuestion;
  routeQuestions?: {
    comer: QuizQuestion[];
    beber: QuizQuestion[];
    ambos: QuizQuestion[];
  };
  products?: {
    comer: QuizProduct[];
    beber: QuizProduct[];
  };
}

type RouteKey = "comer" | "beber" | "ambos";
type StepName = "intro" | "dietary" | "route" | "loading" | "result";

// ─── DEFAULT DATA ─────────────────────────────────────────────────────────────

const DEFAULT_DIETARY: QuizQuestion = {
  id: "dietary",
  question: "¿Hay alguna consideración alimentaria?",
  options: [
    { label: "Vegetariana",        value: "vegetariana" },
    { label: "Veganos",            value: "vegano" },
    { label: "Celiaco",            value: "celiaco" },
    { label: "Sin consideraciones",value: "ninguna" },
  ],
};

const DEFAULT_ROUTE_QUESTIONS: Record<RouteKey, QuizQuestion[]> = {
  comer: [
    {
      id: "mood",
      question: "¿VAS A LO SEGURO (CLÁSICOS) O QUIERES QUE TE SORPRENDAMOS?",
      options: [
        { label: "Clásico",     value: "clasico" },
        { label: "Sorpréndeme", value: "sorprendeme" },
      ],
    },
    {
      id: "flavor",
      question: "¿Qué te pide el cuerpo?",
      options: [
        { label: "CRUJIENTE Y FRITO",   value: "frito" },
        { label: "FRESCO Y LIGERO",     value: "fresh" },
        { label: "MELOSO Y DE CUCHARA", value: "meloso" },
      ],
    },
    {
      id: "time",
      question: "¿TIENES PRISA O EL TIEMPO HOY, ES RELATIVO?",
      options: [
        { label: "VENGO DE PASO", value: "fast" },
        { label: "TENGO TIEMPO",  value: "slow" },
      ],
    },
    {
      id: "discover",
      question: "CUANDO PRUEBAS ALGO NUEVO, PREFIERES QUE SEA...",
      options: [
        { label: "FAMILIAR",    value: "familiar" },
        { label: "DIFERENTE",   value: "diferent" },
        { label: "POTENTE",     value: "power" },
        { label: "EQUILIBRADO", value: "balanced" },
      ],
    },
  ],
  beber: [
    {
      id: "mood",
      question: "¿VAS A LO SEGURO (CLÁSICOS) O QUIERES QUE TE SORPRENDAMOS?",
      options: [
        { label: "Clásico",     value: "clasico" },
        { label: "Sorpréndeme", value: "sorprendeme" },
      ],
    },
    {
      id: "easy",
      question: "¿UN VINO FÁCIL DE BEBER O ALGO MÁS INTENSO?",
      options: [
        { label: "FÁCIL DE BEBER", value: "drink" },
        { label: "INTENSO",        value: "intense" },
      ],
    },
    {
      id: "kind",
      question: "¿VINO TINTO O VINO BLANCO?",
      options: [
        { label: "TINTO",  value: "tinto" },
        { label: "BLANCO", value: "blanco" },
      ],
    },
    {
      id: "sabor",
      question: "¿QUÉ SABOR TE GUSTA MÁS?",
      options: [
        { label: "DULCE",  value: "sugar" },
        { label: "ÁCIDO",  value: "acid" },
        { label: "AMARGO", value: "bitter" },
      ],
    },
  ],
  ambos: [
    {
      id: "mood",
      question: "¿VAS A LO SEGURO (CLÁSICOS) O QUIERES QUE TE SORPRENDAMOS?",
      options: [
        { label: "Clásico",     value: "clasico" },
        { label: "Sorpréndeme", value: "sorprendeme" },
      ],
    },
    {
      id: "flavor",
      question: "¿Qué te pide el cuerpo?",
      options: [
        { label: "CRUJIENTE Y FRITO",   value: "frito" },
        { label: "FRESCO Y LIGERO",     value: "fresh" },
        { label: "MELOSO Y DE CUCHARA", value: "meloso" },
      ],
    },
    {
      id: "time",
      question: "¿TIENES PRISA O EL TIEMPO HOY, ES RELATIVO?",
      options: [
        { label: "VENGO DE PASO", value: "fast" },
        { label: "TENGO TIEMPO",  value: "slow" },
      ],
    },
    {
      id: "discover",
      question: "CUANDO PRUEBAS ALGO NUEVO, PREFIERES QUE SEA...",
      options: [
        { label: "FAMILIAR",    value: "familiar" },
        { label: "DIFERENTE",   value: "diferent" },
        { label: "POTENTE",     value: "power" },
        { label: "EQUILIBRADO", value: "balanced" },
      ],
    },
    {
      id: "sabor",
      question: "¿QUÉ SABOR TE GUSTA MÁS?",
      options: [
        { label: "DULCE",  value: "sugar" },
        { label: "ÁCIDO",  value: "acid" },
        { label: "AMARGO", value: "bitter" },
      ],
    },
  ],
};

const DEFAULT_PRODUCTS = {
  comer: [
    { id: 1,  title: "La Croqueta Lund",  price: "3,5 €", image: "/img/products/croqueta_lund.png", tags: ["suave", "clasico", "pequeño"] },
    { id: 2,  title: "Bravas Martí",      price: "3,5 €", image: "/img/products/bravas.png",        tags: ["intenso", "compartir", "pequeño"] },
    { id: 3,  title: "Nuestra Gilda Lud", price: "4,5 €", image: "/img/products/gilda.png",         tags: ["fresco", "clasico", "pequeño"] },
    { id: 4,  title: "Tartar de Atún",    price: "9 €",   image: "/img/products/tartar.png",        tags: ["fresco", "especial", "grande"] },
    { id: 5,  title: "Tabla de Quesos",   price: "12 €",  image: "/img/products/quesos.png",        tags: ["suave", "compartir", "grande"] },
    { id: 6,  title: "Pulpo a la Brasa",  price: "14 €",  image: "/img/products/pulpo.png",         tags: ["intenso", "especial", "grande"] },
  ],
  beber: [
    { id: 7,  title: "Vino de la Casa",      price: "3 €",   image: "/img/products/vino.png",     tags: ["suave", "clasico", "copa"] },
    { id: 8,  title: "Vermut Casero",        price: "4,5 €", image: "/img/products/vermut.png",   tags: ["intenso", "aperitivo", "copa"] },
    { id: 9,  title: "Cava Brut Nature",     price: "5 €",   image: "/img/products/cava.png",     tags: ["fresco", "especial", "copa"] },
    { id: 10, title: "Gin Tónic Lund",       price: "8 €",   image: "/img/products/gintonic.png", tags: ["intenso", "especial", "largo"] },
    { id: 11, title: "Kombucha del Día",     price: "4 €",   image: "/img/products/kombucha.png", tags: ["fresco", "sin alcohol", "largo"] },
    { id: 12, title: "Café de Especialidad", price: "2,5 €", image: "/img/products/cafe.png",     tags: ["suave", "clasico", "corto"] },
  ],
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function getRecommendations(
  route: string,
  answers: string[],
  products: typeof DEFAULT_PRODUCTS
): QuizProduct[] {
  const pool: QuizProduct[] =
    route === "ambos"
      ? [...products.comer, ...products.beber]
      : (products[route as keyof typeof products] ?? []);

  return pool
    .map((p) => ({
      ...p,
      score: answers.reduce((acc, a) => acc + (p.tags.includes(a) ? 1 : 0), 0),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);
}

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

interface ProgressBarProps {
  current: number;
  total: number;
}

function ProgressBar({ current, total }: ProgressBarProps) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="w-full mb-8">
      <p className="font-mono text-xs text-neutral-500 mb-2 tracking-widest uppercase">
        Antes de empezar... {current}/{total}
      </p>
      <div className="w-full h-[3px] bg-white/10 rounded-full">
        <div
          className="h-full bg-orange-500 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

interface BackButtonProps {
  onClick: () => void;
}

function BackButton({ onClick }: BackButtonProps) {
  return (
    <button
      onClick={onClick}
      className="font-mono text-xs text-neutral-500 uppercase tracking-wider mb-6 flex items-center gap-1 hover:text-white transition-colors duration-200 bg-transparent border-none cursor-pointer p-0"
    >
      ← Volver
    </button>
  );
}

interface QuestionScreenProps {
  question: string;
  options: QuizOption[];
  onAnswer: (val: string) => void;
  onBack: () => void;
  current: number;
  total: number;
  canGoBack: boolean;
}

function QuestionScreen({
  question,
  options,
  onAnswer,
  onBack,
  current,
  total,
  canGoBack,
}: QuestionScreenProps) {
  const [selected, setSelected] = useState<string | null>(null);
  useEffect(() => { setSelected(null); }, [question]);

  function handleSelect(val: string) {
    setSelected(val);
    setTimeout(() => onAnswer(val), 300);
  }

  return (
    <div className="w-full max-w-xl mx-auto px-4">
      {canGoBack && <BackButton onClick={onBack} />}
      <ProgressBar current={current} total={total} />
      <h2 className="font-mono text-3xl md:text-4xl font-bold uppercase text-white tracking-wide leading-tight mb-10">
        {question}
      </h2>
      <div className="flex flex-col gap-3">
        {options.map((opt) => (
          <button
            key={opt.value + opt.label}
            onClick={() => handleSelect(opt.value)}
            className={`
              w-full px-6 py-4 text-left font-mono text-sm uppercase tracking-widest
              border transition-all duration-200 cursor-pointer
              ${selected === opt.value
                ? "bg-orange-500 border-orange-500 text-white"
                : "bg-white/5 border-white/20 text-white hover:bg-orange-500/15 hover:border-orange-500"
              }
            `}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

interface LoadingScreenProps {
  onDone: () => void;
}

function LoadingScreen({ onDone }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const messages = ["Analizando tu mood...", "Consultando la carta...", "Preparando tu selección..."];
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { clearInterval(iv); setTimeout(onDone, 400); return 100; }
        return p + 2;
      });
    }, 40);
    const mv = setInterval(() => setMsgIdx((i) => (i + 1) % messages.length), 900);
    return () => { clearInterval(iv); clearInterval(mv); };
  }, []);

  return (
    <div className="text-center max-w-sm mx-auto px-4">
      <div
        className="w-16 h-16 rounded-full border-2 border-white/10 mx-auto mb-8"
        style={{ borderTopColor: "#E8652A", animation: "spin 1s linear infinite" }}
      />
      <p className="font-mono text-xs text-orange-500 tracking-widest uppercase min-h-[1.25rem] mb-8">
        {messages[msgIdx]}
      </p>
      <div className="w-full h-[2px] bg-white/10">
        <div
          className="h-full bg-orange-500 transition-all duration-75"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="font-mono text-[0.65rem] text-neutral-600 mt-1">{progress}%</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

interface ProductCardProps {
  product: QuizProduct;
  index: number;
}

function ProductCard({ product, index }: ProductCardProps) {
  const rots = [-3, 2, -1.5, 2.5];
  const rot = rots[index % rots.length];

  return (
    <div
      className="bg-white p-4 pb-8 shadow-2xl transition-all duration-300 cursor-default min-w-[180px] max-w-[230px] hover:z-10"
      style={{ transform: `rotate(${rot}deg)` }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = "rotate(0deg) scale(1.04)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = `rotate(${rot}deg) scale(1)`; }}
    >
      <div className="w-full aspect-square overflow-hidden mb-3 bg-[#f0ebe3]">
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src =
              `https://placehold.co/230x230/f0ebe3/999?text=${encodeURIComponent(product.title)}`;
          }}
        />
      </div>
      <h3 className="font-mono text-[0.82rem] font-bold uppercase text-neutral-900 mb-1 leading-snug">
        {product.title}
      </h3>
      <p className="font-serif text-sm text-neutral-500">{product.price}</p>
      <div className="mt-3 h-px bg-neutral-200" />
    </div>
  );
}

interface ResultScreenProps {
  products: QuizProduct[];
  onReset: () => void;
}

function ResultScreen({ products, onReset }: ResultScreenProps) {
  const [activeIdx, setActiveIdx] = useState(0);

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <button
        onClick={onReset}
        className="font-mono text-xs text-neutral-500 uppercase tracking-wider mb-8 flex items-center gap-1 hover:text-white transition-colors duration-200 bg-transparent border-none cursor-pointer p-0"
      >
        ← Reiniciar
      </button>

      <p className="font-mono text-[0.7rem] text-orange-500 tracking-[0.15em] uppercase mb-4">
        Tu selección
      </p>

      <div className="relative flex justify-center items-center min-h-[360px]">
        <button
          onClick={() => setActiveIdx((i) => Math.max(0, i - 1))}
          disabled={activeIdx === 0}
          className={`
            absolute left-0 z-20 w-11 h-11 flex items-center justify-center
            border-none cursor-pointer transition-all duration-200
            ${activeIdx === 0 ? "bg-white/5 opacity-25 cursor-default" : "bg-white opacity-100 hover:bg-neutral-100"}
          `}
        >
          <svg width="10" height="18" viewBox="0 0 12 20" fill="none">
            <path d="M10 20L0 10L10 0L11.775 1.775L3.55 10L11.775 18.225L10 20Z" fill="#1F1F1F" />
          </svg>
        </button>

        <div className="flex items-center justify-center gap-5 py-8 px-16 overflow-visible">
          {products.map((p, i) => (
            <div
              key={p.id}
              onClick={() => setActiveIdx(i)}
              className="transition-all duration-400 relative"
              style={{
                transform: i === activeIdx ? "scale(1.1) translateY(-12px)" : "scale(0.86)",
                opacity: i === activeIdx ? 1 : 0.5,
                zIndex: i === activeIdx ? 5 : 1,
                cursor: i !== activeIdx ? "pointer" : "default",
              }}
            >
              <ProductCard product={p} index={i} />
            </div>
          ))}
        </div>

        <button
          onClick={() => setActiveIdx((i) => Math.min(products.length - 1, i + 1))}
          disabled={activeIdx === products.length - 1}
          className={`
            absolute right-0 z-20 w-11 h-11 flex items-center justify-center
            border-none cursor-pointer transition-all duration-200
            ${activeIdx === products.length - 1 ? "bg-white/5 opacity-25 cursor-default" : "bg-orange-500 opacity-100 hover:bg-orange-600"}
          `}
        >
          <svg width="10" height="18" viewBox="0 0 12 20" fill="none">
            <path d="M1.77539 20L11.7754 10L1.77539 0L0.000390053 1.775L8.22539 10L0.000390053 18.225L1.77539 20Z" fill="#fff" />
          </svg>
        </button>
      </div>

      <div className="flex justify-center gap-2 mt-5">
        {products.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveIdx(i)}
            className={`
              h-2 rounded-full border-none cursor-pointer transition-all duration-300 p-0
              ${i === activeIdx ? "bg-orange-500 w-10" : "bg-white/20 w-2"}
            `}
          />
        ))}
      </div>

      <div className="flex justify-center gap-4 mt-12">
        <a
          href="/"
          className="font-mono text-xs uppercase tracking-widest text-white border border-white/25 px-8 py-3 no-underline hover:border-white/60 transition-colors duration-200"
        >
          Reservar
        </a>
        <button
          title="Guardar selección"
          className="w-11 h-11 bg-white/10 border border-white/15 cursor-pointer flex items-center justify-center hover:bg-white/20 transition-colors duration-200"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </button>
      </div>

      <p className="font-serif italic text-[clamp(2rem,6vw,3.5rem)] text-white/5 text-right mt-8 leading-none">
        Tus tapas ideales...
      </p>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
// Flujo: intro → dietary → route → loading → result

export default function MenuQuiz({
  dietaryQuestion = DEFAULT_DIETARY,
  routeQuestions = DEFAULT_ROUTE_QUESTIONS,
  products = DEFAULT_PRODUCTS,
}: QuizProps) {
  const [step, setStep]         = useState<StepName>("intro");
  const [route, setRoute]       = useState<RouteKey | "">("");
  const [answers, setAnswers]   = useState<string[]>([]);
  const [routeIdx, setRouteIdx] = useState(0);
  const [results, setResults]   = useState<QuizProduct[]>([]);

  // totalQ se fija en el momento que el usuario elige la ruta
  // y no cambia hasta que se hace reset.
  // 1 (dietary) + N (preguntas de la ruta elegida)
  const [totalQ, setTotalQ] = useState(0);

  const currentRouteQs: QuizQuestion[] =
    route ? (routeQuestions[route] ?? []) : [];

  // currentQ siempre relativo al total fijado
  const currentQ: number =
    step === "dietary" ? 1
    : step === "route"  ? 1 + routeIdx + 1
    : totalQ;

  // ── Handlers ──────────────────────────────────────────────────────────────

  function selectRoute(r: RouteKey) {
    const qs = routeQuestions[r] ?? [];
    // Fijamos el total en cuanto se elige la ruta: dietary(1) + preguntas de ruta
    setTotalQ(1 + qs.length);
    setRoute(r);
    setStep("dietary");
  }

  function handleDietaryAnswer(val: string) {
    setAnswers([val]);
    setStep("route");
    setRouteIdx(0);
  }

  function handleRouteAnswer(val: string) {
    const next = [...answers, val];
    setAnswers(next);
    if (routeIdx + 1 < currentRouteQs.length) {
      setRouteIdx(routeIdx + 1);
    } else {
      setResults(getRecommendations(route, next, products));
      setStep("loading");
    }
  }

  function goBack() {
    if (step === "dietary") {
      setStep("intro");
      setAnswers([]);
      setTotalQ(0);
      setRoute("");
    } else if (step === "route") {
      if (routeIdx > 0) {
        setRouteIdx(routeIdx - 1);
        setAnswers((a) => a.slice(0, -1));
      } else {
        setStep("dietary");
        setAnswers([]);
      }
    }
  }

  function handleReset() {
    setStep("intro");
    setRoute("");
    setAnswers([]);
    setRouteIdx(0);
    setResults([]);
    setTotalQ(0);
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col items-center justify-center py-8 px-4 relative overflow-hidden">
      {/* Grain overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="relative z-10 w-full">

        {/* INTRO */}
        {step === "intro" && (
          <div className="text-center max-w-2xl mx-auto px-4">
            <h1 className="font-mono text-[clamp(2rem,6vw,4rem)] font-bold uppercase text-white tracking-wide leading-tight mb-12 text-center">
              ¿Con qué mood vienes hoy?
            </h1>
            <div className="flex gap-4 justify-center flex-col md:flex-wrap">
              {(["comer", "beber", "ambos"] as RouteKey[]).map((value) => (
                <button
                  key={value}
                  onClick={() => selectRoute(value)}
                  className="px-10 py-4 bg-orange-600 hover:bg-orange-700 text-white font-mono text-sm uppercase tracking-widest border-none cursor-pointer transition-all duration-200"
                >
                  {value.charAt(0).toUpperCase() + value.slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* DIETARY */}
        {step === "dietary" && (
          <QuestionScreen
            question={dietaryQuestion.question}
            options={dietaryQuestion.options}
            onAnswer={handleDietaryAnswer}
            onBack={goBack}
            current={currentQ}
            total={totalQ}
            canGoBack={true}
          />
        )}

        {/* ROUTE */}
        {step === "route" && currentRouteQs.length > 0 && (
          <QuestionScreen
            question={currentRouteQs[routeIdx].question}
            options={currentRouteQs[routeIdx].options}
            onAnswer={handleRouteAnswer}
            onBack={goBack}
            current={currentQ}
            total={totalQ}
            canGoBack={true}
          />
        )}

        {/* LOADING */}
        {step === "loading" && <LoadingScreen onDone={() => setStep("result")} />}

        {/* RESULT */}
        {step === "result" && <ResultScreen products={results} onReset={handleReset} />}
      </div>
    </div>
  );
}