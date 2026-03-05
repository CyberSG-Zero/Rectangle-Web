// src/components/AccordionItem.tsx
import { useState } from "react";

interface Props {
  name: string;
  price: string;
  image: string;
  alt?: string;
}

export default function AccordionItem({ name, price, image, alt }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="item border-b-2 border-wine py-4 w-full text-wine transition-all duration-250">
      <div
        className="flex flex-col items-start justify-between cursor-pointer gap-2 md:flex-row"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="md:flex md:flex-row">
          <h3 className="font-Mono font-medium text-xl">{name}</h3>

          <span className="text-sm flex items-center gap-1 md:hidden">
            Ver más
            <span
              className={`transition-transform duration-250 inline-block ${isOpen ? "rotate-180" : ""}`}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M7 10L12 15L17 10" stroke="black" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/>
              </svg>
            </span>
          </span>

        </div>
        <div className={`bg-white border border-wine px-4 py-3 font-bold ${isOpen ? "w-full" : "w-auto"} md:text-xl`}>
          {price}
          <div className={`item-img overflow-hidden transition-all duration-250 pb-0 w-0 ${isOpen ? "max-h-150 w-full pb-8" : "max-h-0"}`}>
            <div className="border border-wine mt-4">
              <img className="transition-all duration-250 w-full h-full object-cover aspect-3/4" src={image} alt={alt ?? name} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}