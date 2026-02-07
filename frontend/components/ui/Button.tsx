import { ButtonHTMLAttributes, ReactNode } from "react";
import { clsx } from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "hero";
  children: ReactNode;
}

export function Button({ variant = "primary", children, className, ...props }: ButtonProps) {
  const baseStyles = "px-6 py-3 rounded-xl font-semibold transition-all";
  
  const variants = {
    primary: "bg-landing-orange hover:bg-landing-orange-dark text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5",
    secondary: "bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-200 hover:border-gray-300",
    hero: "px-12 py-6 bg-gradient-to-r from-landing-orange to-orange-600 text-white text-xl shadow-2xl hover:shadow-3xl hover:-translate-y-1",
  };

  return (
    <button
      className={clsx(baseStyles, variants[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
}
