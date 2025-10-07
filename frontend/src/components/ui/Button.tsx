import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "outline" | "ghost";
};

export default function Button({
    className = "",
    variant = "primary",
    ...props
}: ButtonProps) {
    const base =
        "inline-flex items-center justify-center gap-2 rounded-lg px-4 h-10 text-sm font-medium transition";
    const variants: Record<string, string> = {
        primary:
            "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500/60 disabled:opacity-50",
        outline:
            "border border-zinc-300 hover:bg-zinc-50 text-zinc-900 dark:text-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900",
        ghost:
            "hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-900 dark:text-zinc-100",
    };

    return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}
