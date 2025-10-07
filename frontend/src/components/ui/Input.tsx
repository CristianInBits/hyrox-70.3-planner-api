import React from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export default function Input({ className = "", ...props }: InputProps) {
    return (
        <input
            className={
                "h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm " +
                "placeholder:text-zinc-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/60 " +
                "dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-100 " +
                className
            }
            {...props}
        />
    );
}
