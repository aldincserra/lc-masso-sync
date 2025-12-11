import { cn } from "@/lib/utils";
import logoImage from "@/assets/logo.png";

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
      <img
        src={logoImage}
        alt="Laís Castro - Massoterapeuta"
        width={icon}
        height={icon}
        className="object-contain"
      />
      
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
