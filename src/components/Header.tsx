import { useState, useEffect, useRef } from "react";

const LANGS = ["ESP", "CAT", "ENG"];
const NAV_LINKS = [
    { label: "INICIO", href: "/" },
    { label: "CARTA", href: "/carta" },
    { label: "DESCUBRIR", href: "/descubrir" },
    { label: "EQUIPO", href: "/equipo" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [lang, setLang] = useState("ESP");

  // Detecta scroll pasando el hero
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight - 280);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Bloquea scroll con menú abierto
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const textColor = scrolled ? "text-gray-900" : "text-white";
  const borderColor = scrolled ? "border-wine" : "border-white-cream";

  return (
    <>
      <header
        className={`m-5 fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${borderColor} border-2 md:max-w-[1440px]: ${
          scrolled ? "bg-white border-b border-gray-200" : "bg-transparent"
        }`}
      >
        <div className="flex items-stretch">

          {/* Logo */}
          <a href="/" className={`flex items-center px-5 py-4 border-r-2 ${borderColor} shrink-0`}>
            <img
              src={scrolled ? "/img/dark-logo.png" : "/img/white-logo.png"}
              alt="Rectangle"
              className="h-8"
            />
          </a>

          {/* Tagline — solo desktop */}
          <div className={`hidden md:flex items-center px-6 border-r border-white-cream flex-1`}>
            <span className={`text-sm ${textColor} opacity-80`}>
              Tapas, platilos, vino & cosas chulas
            </span>
          </div>

          {/* Spacer mobile */}
          <div className="flex-1 md:hidden" />

          {/* RESERVAR — desktop */}
          <a
            href="/reserva"
            className={`hidden md:flex items-center px-6 font-bold text-sm border-r border-l ${borderColor} transition-colors ${
              scrolled
                ? "bg-[#3d0a1a] text-white hover:bg-[#2a0712]"
                : "bg-white text-gray-900 hover:bg-gray-100"
            }`}
          >
            RESERVAR
          </a>

          {/* Nav links — solo desktop */}
          <nav className={`hidden md:flex items-stretch`}>
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`flex items-center px-5 text-sm font-bold tracking-wider ${textColor} transition-colors border-r ${borderColor} hover:opacity-60`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Selector idioma — desktop */}
          <div className={`hidden md:flex items-center px-5 gap-1 text-sm font-bold border-2 border-white-cream`}>
            {LANGS.map((l, i) => (
              <span key={l} className="flex items-center gap-1">
                <button
                  onClick={() => setLang(l)}
                  className={`transition-colors ${
                    lang === l
                      ? textColor
                      : scrolled
                        ? "text-gray-400 hover:text-gray-700"
                        : "text-white/40 hover:text-white/80"
                  }`}
                >
                  {l}
                </button>
                {i < LANGS.length - 1 && (
                  <span className={scrolled ? "text-gray-300" : "text-white/30"}>/</span>
                )}
              </span>
            ))}
          </div>

          {/* Mobile: idioma + hamburguesa */}
          <div className="flex md:hidden items-stretch font-Mono">
            <div className={`flex items-center px-4 text-sm font-bold ${textColor} border-l-2 ${borderColor}`}>
              {lang}
            </div>
            <button
              onClick={() => 
                setMenuOpen((p) => !p)}
              className={`flex items-center justify-center w-14 border-l-2 ${borderColor} transition-colors`}
              aria-label="Menú"
            >
              {menuOpen ? (
                <svg className={`w-5 h-5 ${textColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className={`w-5 h-5 ${textColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

        </div>
      </header>

      {/* Overlay móvil */}
      <div
        onClick={() => setMenuOpen(false)}
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 md:hidden ${
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Panel menú móvil */}
      <nav
        className={`fixed top-22 right-0 h-full w-full z-40 bg-wine flex flex-col justify-between py-24 px-10 transition-transform duration-300 ease-in-out md:hidden ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col font-Mono">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="text-white font-bold text-lg py-4 border-b border-white/20 hover:text-white/60 transition-colors tracking-widest"
            >
              {link.label}
            </a>
          ))}

          <a
            href="/reserva"
            onClick={() => setMenuOpen(false)}
            className="mt-8 border border-white text-white font-bold text-sm px-6 py-3 text-center hover:bg-white hover:text-[#3d0a1a] transition-colors tracking-widest"
          >
            RESERVAR
          </a>

          {/* Idiomas móvil */}
          <div className="flex gap-4 mt-6">
            {LANGS.map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`text-sm font-bold transition-colors ${
                  lang === l ? "text-white" : "text-white/40 hover:text-white/70"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Dirección */}
        <div className="flex items-start gap-3 border border-white/30 p-4">
          <svg className="w-4 h-4 text-white mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
          <span className="text-white text-sm font-mono leading-snug">
            Carrer de<br />Sepúlveda, 23
          </span>
        </div>
      </nav>
    </>
  );
}