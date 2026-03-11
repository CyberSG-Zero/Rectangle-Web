import { useState, useEffect } from "react";
import productsData        from "../data/products.json";
import questionsData       from "../data/questions.json";
import recommendationsData from "../data/recommendations.json";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";

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
  dietary: string[];
}

export interface QuizProps {
  backgrounds?: {
    intro: string;
    dietary: string;
    comer: string;
    beber: string;
    ambos: string;
    loading: string;
    result: string;
  };
}

type RouteKey = "comer" | "beber" | "ambos";
type StepName = "intro" | "dietary" | "route" | "loading" | "result";

// ─── BACKGROUNDS ──────────────────────────────────────────────────────────────

const DEFAULT_BACKGROUNDS = {
  intro:   "img/quiz/bg_intro.png",
  dietary: "img/quiz/bg_dietary.png",
  comer:   "img/quiz/bg_comer.png",
  beber:   "img/quiz/bg_beber.png",
  ambos:   "img/quiz/bg_ambos.png",
  loading: "img/quiz/bg_loading.png",
  result:  "img/quiz/bg_result.png",
};

// ─── LOADING MESSAGES ─────────────────────────────────────────────────────────
// Aquí estaba el problema — faltaba esta constante

const LOADING_MESSAGES: Record<string, string[]> = {
  comer: [
    "Si confías en nosotros, empieza por aquí.",
  ],
  beber: [
    "Por lo que nos has contado... creemos que esto encaja contigo hoy.",
  ],
  ambos: [
    "Por lo que nos has contado... creemos que esto encaja contigo hoy.",
  ],
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function getRecommendations(
  route: string,
  dietaryAnswer: string,
  preferenceAnswers: string[]
): QuizProduct[] {
  const pool: QuizProduct[] =
    route === "ambos"
      ? [...productsData.comer, ...productsData.beber]
      : (productsData[route as keyof typeof productsData] ?? []);

  const key = preferenceAnswers.join("_");

  const map      = recommendationsData.map      as Record<string, number[]>;
  const defaults = recommendationsData.defaults as Record<string, number[]>;
  const ids      = map[key] ?? defaults[route] ?? [];

  const resolved = ids
    .map((id) => pool.find((p) => p.id === id))
    .filter((p): p is QuizProduct => p !== undefined);

  const filtered =
    dietaryAnswer === "ninguna"
      ? resolved
      : resolved.filter((p) => p.dietary.includes(dietaryAnswer));

  if (filtered.length === 0) {
    const dietaryPool =
      dietaryAnswer === "ninguna"
        ? pool
        : pool.filter((p) => p.dietary.includes(dietaryAnswer));
    return dietaryPool.slice(0, 4);
  }

  return filtered;
}

// ─── DUAL PROGRESS BAR ────────────────────────────────────────────────────────

interface DualProgressBarProps {
  phase: 1 | 2;
  phase1Current: number;
  phase2Current: number;
  phase2Total: number;
}

function DualProgressBar({ phase, phase1Current, phase2Current, phase2Total }: DualProgressBarProps) {
  const p1 = Math.round((phase1Current / 2) * 100);
  const p2 = phase2Total > 0 ? Math.round((phase2Current / phase2Total) * 100) : 0;
  const showPhase2 = phase2Total > 0;

  return (
    <div className="w-full mb-8 flex gap-3 items-end">
      <div className="flex flex-col gap-1 flex-1 md:max-w-100">
        <p className="font-Mono text-[0.75rem] text-white tracking-widest uppercase">
          Antes de empezar... {phase === 1 ? phase1Current : 2}/2
        </p>
        <div className="w-full h-[3px] bg-white/10">
          <div
            className="h-full bg-white transition-all duration-500"
            style={{ width: phase === 1 ? `${p1}%` : "100%" }}
          />
        </div>
      </div>

      {showPhase2 && (
        <>
          <div className="w-px h-5 bg-white/15 mb-[3px]" />
          <div className="flex flex-col gap-1 flex-[2]">
            <p className="font-Mono text-[0.75rem] text-white tracking-widest uppercase">
              Tu selección {phase === 2 ? `${phase2Current}/${phase2Total}` : `0/${phase2Total}`}
            </p>
            <div className="w-full h-[3px] bg-white/10">
              <div
                className="h-full bg-orange-500 transition-all duration-500"
                style={{ width: phase === 2 ? `${p2}%` : "0%" }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── BACK BUTTON ──────────────────────────────────────────────────────────────

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="font-Mono text-[0.875rem] text-neutral-500 uppercase tracking-wider mb-6 flex items-center gap-1 hover:text-white transition-colors duration-200 bg-transparent border-none cursor-pointer p-0 group"
    >
      <svg className="transition-colors duration-200 group-hover:text-white" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="20" y="8.74228e-07" width="20" height="20" transform="rotate(90 20 8.74228e-07)" fill="transparent"/>
        <g mask="url(#mask0_2537_5369)">
          <path d="M7.16537 10L12.1654 5L13.332 6.16667L9.4987 10L13.332 13.8333L12.1654 15L7.16537 10Z" fill="currentColor"/>
        </g>
      </svg>
      Volver
    </button>
  );
}

// ─── QUESTION SCREEN ──────────────────────────────────────────────────────────

interface QuestionScreenProps {
  question: string;
  options: QuizOption[];
  onAnswer: (val: string) => void;
  onBack?: () => void;
  canGoBack: boolean;
  phase: 1 | 2;
  phase1Current: number;
  phase2Current: number;
  phase2Total: number;
}

function QuestionScreen({
  question, options, onAnswer, onBack, canGoBack,
  phase, phase1Current, phase2Current, phase2Total,
}: QuestionScreenProps) {
  const [selected, setSelected] = useState<string | null>(null);
  useEffect(() => { setSelected(null); }, [question]);

  function handleSelect(val: string) {
    setSelected(val);
    setTimeout(() => onAnswer(val), 300);
  }

  return (
    <div className="w-full max-w-280 mx-auto px-4">
      {canGoBack && onBack && <BackButton onClick={onBack} />}

      <DualProgressBar
        phase={phase}
        phase1Current={phase1Current}
        phase2Current={phase2Current}
        phase2Total={phase2Total}
      />

      <h2 className="text-3xl md:text-4xl font-Mono font-medium uppercase text-white tracking-wide leading-tight mb-10">
        {question}
      </h2>

      <div className="flex flex-col gap-3 md:flex-row">
        {options.map((opt) => (
          <button
            key={opt.value + opt.label}
            onClick={() => handleSelect(opt.value)}
            className={`
              w-full px-6 py-4 text-left font-Mono text-sm uppercase tracking-widest
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

// ─── LOADING SCREEN ───────────────────────────────────────────────────────────

function LoadingScreen({ onDone, route }: { onDone: () => void; route: string }) {
  const [filled, setFilled] = useState(1);
  const messages = LOADING_MESSAGES[route] ?? LOADING_MESSAGES.comer;
  const msgIdx = Math.min(Math.max(filled - 1, 0), messages.length - 1);

  // Efecto 1 — pinta un cuadro cada 600ms
  useEffect(() => {
    const iv = setInterval(() => {
      setFilled((f) => (f >= 4 ? 4 : f + 1));
    }, 600);
    return () => clearInterval(iv);
  }, []);

  // Efecto 2 — cuando llega a 4, espera un poco y avanza
  useEffect(() => {
    if (filled < 4) return;
    const t = setTimeout(onDone, 400);
    return () => clearTimeout(t);
  }, [filled]);

  return (
    <div className="text-center max-w-250 mx-auto px-4">
      <div className="flex justify-center gap-3 mb-8">
        {[1, 2, 3, 4].map((n) => (
          <div
            key={n}
            className="w-8 h-8 border border-white/40 transition-colors duration-200"
            style={{
              backgroundColor: n <= filled ? "white" : "transparent",
              borderColor:     n <= filled ? "white" : "rgba(255,255,255,0.4)",
            }}
          />
        ))}
      </div>

      <p className="font-Mono font-medium text-3xl md:text-6xl text-white tracking-widest uppercase min-h-6 mb-8">
        {filled > 0 ? messages[msgIdx] : ""}
      </p>
    </div>
  );
}

// ─── PRODUCT CARD ─────────────────────────────────────────────────────────────

function ProductCard({ product, index }: { product: QuizProduct; index: number }) {
  const rots = [-3, 2, -1.5, 2.5];
  const rot = rots[index % rots.length];

  return (
    <div className="flex flex-col w-full bg-[#FAFAFA] px-6 py-10 border-2 border-wine gap-8 transition-all duration-300 cursor-default min-w-45 md:max-w-80 max-w-280 hover:z-10">
      <div className="w-full aspect-square bg-[#f0ebe3]">
        <img
          src={product.image}
          alt={product.title}
          className="w-full border-2 border-wine aspect-square object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src =
              `https://placehold.co/230x230/f0ebe3/999?text=${encodeURIComponent(product.title)}`;
          }}
        />
      </div>
      <div className="flex flex-col gap-2 pb-4 border-b border-wine">
        <h3 className="font-Mono font-medium uppercase text-[1.25rem]/[1em] md:text-[2rem]">
          {product.title}
        </h3>
        <p className="font-DMSans font-normal text-[1.225rem]">{product.price}</p>
      </div>
    </div>
  );
}

// ─── RESULT SCREEN ────────────────────────────────────────────────────────────

function ResultScreen({ products, onReset }: { products: QuizProduct[]; onReset: () => void }) {
  const [activeIdx, setActiveIdx] = useState(0);

  // Posición de cada carta en el abanico relativa a la activa
  function getCardStyle(i: number): React.CSSProperties {
    const offset = i - activeIdx;
    const absOffset = Math.abs(offset);

    // Cartas muy alejadas — ocultas
    if (absOffset > 2) return { opacity: 0, pointerEvents: "none", zIndex: 0 };

    const direction = offset < 0 ? -1 : offset > 0 ? 1 : 0;

    return {
      // Desplazamiento lateral en abanico — las más alejadas se van más al lado
      transform: `
        translateX(${direction * absOffset * 80}px)
        translateY(${absOffset * 20}px)
        rotate(${direction * absOffset * 8}deg)
        scale(${1 - absOffset * 0.08})
      `,
      opacity:    offset === 0 ? 1 : 0.6,
      zIndex:     10 - absOffset,
      transition: "transform 0.4s ease, opacity 0.4s ease",
      cursor:     offset !== 0 ? "pointer" : "default",
    };
  }

  const prev = () => setActiveIdx((i) => Math.max(0, i - 1));
  const next = () => setActiveIdx((i) => Math.min(products.length - 1, i + 1));

  return (
    <div className="w-full mx-auto pt-[30%] md:pt-0">
      <div className="max-w-280 mx-auto px-4 mb-8">
        <button
          onClick={onReset}
          className="font-Mono text-[0.875rem] text-neutral-500 uppercase tracking-wider mb-8 flex items-center gap-1 hover:text-white transition-colors duration-200 bg-transparent border-none cursor-pointer p-0 group"
        >
          <svg className="transition-colors duration-200 group-hover:text-white" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="20" y="8.74228e-07" width="20" height="20" transform="rotate(90 20 8.74228e-07)" fill="transparent"/>
            <g mask="url(#mask0_2537_5369)">
              <path d="M7.16537 10L12.1654 5L13.332 6.16667L9.4987 10L13.332 13.8333L12.1654 15L7.16537 10Z" fill="currentColor"/>
            </g>
          </svg>
         Reiniciar
        </button>
        {/* <p className="font-mono text-[0.7rem] text-orange-500 tracking-[0.15em] uppercase">
          Tu selección
        </p> */}
      </div>

      {/* ── DESKTOP — abanico apilado ───────────────────────────────── */}
      <div className="hidden md:flex flex-col items-center">
        {/* Área del stack — altura fija para que no salte el layout */}
        <div className="relative flex items-center justify-center w-full"
             style={{ height: "520px" }}>
          {products.map((p, i) => (
            <div
              key={p.id}
              onClick={() => i !== activeIdx && setActiveIdx(i)}
              className="absolute"
              style={getCardStyle(i)}
            >
              <ProductCard product={p} index={i} />
            </div>
          ))}
        </div>

        {/* Navegación desktop */}
        <div className="flex items-center gap-6 mt-4">
          <button
            onClick={prev}
            disabled={activeIdx === 0}
            className={`w-11 h-11 flex items-center justify-center border-none cursor-pointer transition-all duration-200 ${activeIdx === 0 ? "bg-white/10 opacity-25 cursor-default" : "bg-white hover:bg-neutral-100"}`}
          >
            <svg width="10" height="18" viewBox="0 0 12 20" fill="none">
              <path d="M10 20L0 10L10 0L11.775 1.775L3.55 10L11.775 18.225L10 20Z" fill="#1F1F1F"/>
            </svg>
          </button>

          {/* Dots */}
          <div className="flex gap-2">
            {products.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIdx(i)}
                className={`h-2 rounded-full border-none cursor-pointer transition-all duration-300 p-0 ${i === activeIdx ? "bg-orange-500 w-10" : "bg-white/20 w-2"}`}
              />
            ))}
          </div>

          <button
            onClick={next}
            disabled={activeIdx === products.length - 1}
            className={`w-11 h-11 flex items-center justify-center border-none cursor-pointer transition-all duration-200 ${activeIdx === products.length - 1 ? "bg-white/5 opacity-25 cursor-default" : "bg-orange-500 hover:bg-orange-600"}`}
          >
            <svg width="10" height="18" viewBox="0 0 12 20" fill="none">
              <path d="M1.77539 20L11.7754 10L1.77539 0L0.000390053 1.775L8.22539 10L0.000390053 18.225L1.77539 20Z" fill="#fff"/>
            </svg>
          </button>
        </div>
      </div>

      {/* ── MOBILE — Swiper ─────────────────────────────────────────── */}
      <div className="md:hidden">
        <Swiper
          modules={[Navigation, Pagination]}
          slidesPerView={1.3}
          centeredSlides={true}
          spaceBetween={24}
          loop={false}
          navigation={{ nextEl: ".result-next", prevEl: ".result-prev" }}
          pagination={{
            el: ".result-bullets",
            bulletClass: "result-bullet",
            bulletActiveClass: "result-bullet-active",
            clickable: true,
          }}
          style={{ overflow: "visible", padding: "2rem 0 1rem" }}
        >
          {products.map((p, i) => (
            <SwiperSlide key={p.id}>
              {({ isActive }) => (
                <div style={{
                  transform: isActive ? "rotate(0deg) scale(1) translateY(-12px)" : `rotate(${[-3,2,-1.5,2.5][i%4]}deg) scale(0.88)`,
                  opacity: isActive ? 1 : 0.5,
                  transition: "transform 0.4s ease, opacity 0.4s ease",
                }}>
                  <ProductCard product={p} index={i} />
                </div>
              )}
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="max-w-280 mx-auto px-4">
          <div className="flex items-center justify-between mt-2">
            <button className="result-prev w-11 h-11 flex items-center justify-center bg-white border-none cursor-pointer">
              <svg width="10" height="18" viewBox="0 0 12 20" fill="none">
                <path d="M10 20L0 10L10 0L11.775 1.775L3.55 10L11.775 18.225L10 20Z" fill="#1F1F1F"/>
              </svg>
            </button>
            <div className="result-bullets flex items-center gap-2 [&_.result-bullet]:w-2 [&_.result-bullet]:h-2 [&_.result-bullet]:rounded-full [&_.result-bullet]:bg-white/20 [&_.result-bullet]:cursor-pointer [&_.result-bullet-active]:w-10 [&_.result-bullet-active]:bg-orange-500" />
            <button className="result-next w-11 h-11 flex items-center justify-center bg-orange-500 border-none cursor-pointer">
              <svg width="10" height="18" viewBox="0 0 12 20" fill="none">
                <path d="M1.77539 20L11.7754 10L1.77539 0L0.000390053 1.775L8.22539 10L0.000390053 18.225L1.77539 20Z" fill="#fff"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Acciones — compartidas */}
      <div className="max-w-280 mx-auto px-4">
        <div className="flex justify-center gap-4 mt-8">
          <a href="/" className="font-Mono text-xs uppercase tracking-widest text-white border border-white/25 px-8 py-3 no-underline hover:border-white/60 transition-colors duration-200">
            Reservar
          </a>
          <button title="Guardar selección" className="w-11 h-11 bg-white/10 border border-white/15 cursor-pointer flex items-center justify-center hover:bg-white/20 transition-colors duration-200">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </button>
        </div>
        <span className="absolute left-0 font-Antro text-[clamp(3rem,6vw,8.5rem)] text-white text-left mt-8 leading-none">
          Tus tapas ideales...
        </span>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function MenuQuiz({
  backgrounds = DEFAULT_BACKGROUNDS,
}: QuizProps) {
  const [step, setStep]                   = useState<StepName>("intro");
  const [route, setRoute]                 = useState<RouteKey | "">("");
  const [dietaryAnswer, setDietaryAnswer] = useState<string>("");
  const [prefAnswers, setPrefAnswers]     = useState<string[]>([]);
  const [routeIdx, setRouteIdx]           = useState(0);
  const [results, setResults]             = useState<QuizProduct[]>([]);

  const [bgUrl, setBgUrl]         = useState(backgrounds.intro);
  const [bgVisible, setBgVisible] = useState(true);

  const currentRouteQs: QuizQuestion[] =
    route ? (questionsData[route as RouteKey] as QuizQuestion[]) ?? [] : [];

  function transitionBg(newUrl: string) {
    if (newUrl === bgUrl) return;
    setBgVisible(false);
    setTimeout(() => {
      setBgUrl(newUrl);
      setBgVisible(true);
    }, 400);
  }

  function handleRouteSelect(val: string) {
    setRoute(val as RouteKey);
    transitionBg(backgrounds.dietary);
    setStep("dietary");
  }

  function handleDietaryAnswer(val: string) {
    setDietaryAnswer(val);
    setPrefAnswers([]);
    setRouteIdx(0);
    transitionBg(backgrounds[route as RouteKey] ?? backgrounds.intro);
    setStep("route");
  }

  function handlePrefAnswer(val: string) {
    const next = [...prefAnswers, val];
    setPrefAnswers(next);
    if (routeIdx + 1 < currentRouteQs.length) {
      setRouteIdx(routeIdx + 1);
    } else {
      transitionBg(backgrounds.loading);
      setResults(getRecommendations(route, dietaryAnswer, next));
      setStep("loading");
    }
  }

  function goBack() {
    if (step === "dietary") {
      transitionBg(backgrounds.intro);
      setStep("intro");
      setDietaryAnswer("");
      setRoute("");
    } else if (step === "route") {
      if (routeIdx > 0) {
        setRouteIdx(routeIdx - 1);
        setPrefAnswers((a) => a.slice(0, -1));
      } else {
        transitionBg(backgrounds.dietary);
        setStep("dietary");
        setPrefAnswers([]);
      }
    }
  }

  function handleReset() {
    transitionBg(backgrounds.intro);
    setStep("intro");
    setRoute("");
    setDietaryAnswer("");
    setPrefAnswers([]);
    setRouteIdx(0);
    setResults([]);
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col items-center justify-center py-8 px-4 relative overflow-hidden">

      <div
        className="fixed inset-0 pointer-events-none z-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('${bgUrl}')`,
          opacity: bgVisible ? 0.5 : 0,
          transition: "opacity 0.4s ease",
        }}
      />

      <div className="relative z-10 w-full">

        {step === "intro" && (
          <QuestionScreen
            question={questionsData.route.question}
            options={questionsData.route.options}
            onAnswer={handleRouteSelect}
            canGoBack={false}
            phase={1}
            phase1Current={1}
            phase2Current={0}
            phase2Total={0}
          />
        )}

        {step === "dietary" && (
          <QuestionScreen
            question={questionsData.dietary.question}
            options={questionsData.dietary.options}
            onAnswer={handleDietaryAnswer}
            onBack={goBack}
            canGoBack={true}
            phase={1}
            phase1Current={2}
            phase2Current={0}
            phase2Total={currentRouteQs.length}
          />
        )}

        {step === "route" && currentRouteQs.length > 0 && (
          <QuestionScreen
            question={currentRouteQs[routeIdx].question}
            options={currentRouteQs[routeIdx].options}
            onAnswer={handlePrefAnswer}
            onBack={goBack}
            canGoBack={true}
            phase={2}
            phase1Current={2}
            phase2Current={routeIdx + 1}
            phase2Total={currentRouteQs.length}
          />
        )}

        {step === "loading" && (
          <LoadingScreen
            route={route}
            onDone={() => {
              transitionBg(backgrounds.result);
              setStep("result");
            }}
          />
        )}

        {step === "result" && (
          <ResultScreen products={results} onReset={handleReset} />
        )}

      </div>
    </div>
  );
}