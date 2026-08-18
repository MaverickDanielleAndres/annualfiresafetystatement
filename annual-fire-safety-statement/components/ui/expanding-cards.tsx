"use client";

import * as React from "react";

export interface CardItem {
  id: string | number;
  title: string;
  description: string;
  imgSrc: string;
  icon?: React.ReactNode;
  linkHref?: string;
}

interface ExpandingCardsProps extends React.HTMLAttributes<HTMLUListElement> {
  items: CardItem[];
  defaultActiveIndex?: number;
}

export const ExpandingCards = React.forwardRef<
  HTMLUListElement,
  ExpandingCardsProps
>(({ className, items, defaultActiveIndex = 0, ...props }, ref) => {
  const [activeIndex, setActiveIndex] = React.useState<number | null>(
    defaultActiveIndex,
  );
  
  const [isDesktop, setIsDesktop] = React.useState(false);

  React.useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const gridStyle = React.useMemo(() => {
    if (activeIndex === null) return {};
    
    if (isDesktop) {
      const columns = items
        .map((_, index) => (index === activeIndex ? "5fr" : "1fr"))
        .join(" ");
      return { gridTemplateColumns: columns };
    } else {
      const rows = items
        .map((_, index) => (index === activeIndex ? "5fr" : "1fr"))
        .join(" ");
      return { gridTemplateRows: rows };
    }
  }, [activeIndex, items.length, isDesktop]);

  const handleInteraction = (index: number) => {
    setActiveIndex(index);
  };

  return (
    <ul
      className={`w-full max-w-7xl mx-auto gap-2 grid h-[600px] md:h-[500px] transition-all duration-300 ease-out will-change-[grid-template-columns,grid-template-rows] ${className || ""}`}
      style={{
        ...gridStyle,
        ...(isDesktop 
          ? { gridTemplateRows: '1fr' }
          : { gridTemplateColumns: '1fr' }
        )
      }}
      ref={ref}
      {...props}
    >
      {items.map((item, index) => (
        <li
          key={item.id}
          className={`group relative cursor-pointer overflow-hidden rounded-lg border bg-white text-black shadow-sm md:min-w-[80px] min-h-0 min-w-0`}
          onMouseEnter={() => handleInteraction(index)}
          onFocus={() => handleInteraction(index)}
          onClick={() => handleInteraction(index)}
          tabIndex={0}
          data-active={activeIndex === index}
        >
          <img
            src={item.imgSrc}
            alt={item.title}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover transition-[transform,filter] duration-500 ease-out group-data-[active=true]:scale-100 group-data-[active=true]:grayscale-0 scale-110 grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />

          {/* Inactive State Title (Vertical on Desktop, Horizontal on Mobile) */}
          <div className="absolute inset-0 flex items-center justify-center md:items-end md:pb-12 pointer-events-none transition-opacity duration-300 ease-out group-data-[active=true]:opacity-0">
            <span 
              className="!text-[10px] md:!text-[13px] !font-normal text-white tracking-[0.2em] uppercase whitespace-nowrap hidden md:block opacity-60"
              style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
            >
              {item.title}
            </span>
            <span 
              className="!text-[10px] md:!text-[13px] !font-normal text-white tracking-[0.2em] uppercase whitespace-nowrap md:hidden opacity-60"
            >
              {item.title}
            </span>
          </div>

          <article
            className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-2 p-4 pointer-events-none"
          >
            {item.icon && (
              <div className="text-white/90 opacity-0 transition-opacity duration-300 delay-75 ease-out group-data-[active=true]:opacity-100">
                {item.icon}
              </div>
            )}

            <h3 className="text-xl font-bold text-white opacity-0 transition-opacity duration-300 delay-150 ease-out group-data-[active=true]:opacity-100">
              {item.title}
            </h3>

            {item.description && (
              <p className="w-full max-w-xs text-sm text-white/80 opacity-0 transition-opacity duration-300 delay-225 ease-out group-data-[active=true]:opacity-100">
                {item.description}
              </p>
            )}
          </article>
        </li>
      ))}
    </ul>
  );
});
ExpandingCards.displayName = "ExpandingCards";
