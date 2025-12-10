import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export function Logo({ size = "md", showText = true, className }: LogoProps) {
  const sizes = {
    sm: { icon: 40, text: "text-lg" },
    md: { icon: 60, text: "text-2xl" },
    lg: { icon: 100, text: "text-4xl" },
  };

  const { icon, text } = sizes[size];

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      {/* Lotus Icon */}
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-md"
      >
        {/* Outer circle gradient */}
        <defs>
          <linearGradient id="circleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(174, 55%, 45%)" />
            <stop offset="100%" stopColor="hsl(200, 60%, 50%)" />
          </linearGradient>
          <linearGradient id="lotusGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="hsl(140, 50%, 55%)" />
            <stop offset="100%" stopColor="hsl(155, 45%, 70%)" />
          </linearGradient>
        </defs>
        
        {/* Background circle */}
        <circle cx="50" cy="50" r="48" fill="url(#circleGrad)" />
        
        {/* Lotus petals */}
        {/* Center petal */}
        <path
          d="M50 20 C50 20 35 40 35 55 C35 65 42 70 50 70 C58 70 65 65 65 55 C65 40 50 20 50 20Z"
          fill="url(#lotusGrad)"
        />
        {/* Left petal */}
        <path
          d="M32 35 C32 35 20 50 22 62 C24 72 32 73 40 68 C48 63 45 50 32 35Z"
          fill="url(#lotusGrad)"
          opacity="0.9"
        />
        {/* Right petal */}
        <path
          d="M68 35 C68 35 80 50 78 62 C76 72 68 73 60 68 C52 63 55 50 68 35Z"
          fill="url(#lotusGrad)"
          opacity="0.9"
        />
        {/* Outer left petal */}
        <path
          d="M20 50 C20 50 15 60 20 68 C25 76 35 74 40 68 C42 65 30 55 20 50Z"
          fill="url(#lotusGrad)"
          opacity="0.7"
        />
        {/* Outer right petal */}
        <path
          d="M80 50 C80 50 85 60 80 68 C75 76 65 74 60 68 C58 65 70 55 80 50Z"
          fill="url(#lotusGrad)"
          opacity="0.7"
        />
      </svg>
      
      {showText && (
        <div className="text-center">
          <h1 className={cn("font-display font-semibold text-primary", text)}>
            Laís Castro
          </h1>
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground font-medium">
            Massoterapeuta
          </p>
        </div>
      )}
    </div>
  );
}
