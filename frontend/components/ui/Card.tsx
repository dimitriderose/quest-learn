import { ReactNode } from "react";
import { clsx } from "clsx";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className, hover = false }: CardProps) {
  return (
    <div
      className={clsx(
        "bg-white dark:bg-gray-800 rounded-xl shadow-md p-6",
        hover && "hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}
