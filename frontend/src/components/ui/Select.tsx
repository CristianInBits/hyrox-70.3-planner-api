import React from "react";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export default function Select({ className = "", children, ...props }: SelectProps) {
    return (
        <select
            className={
                "h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm shadow-sm " +
                "focus:outline-none focus:ring-2 focus:ring-indigo-500/60 " +
                "dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-100 " +
                className
            }
            {...props}
        >
            {children}
        </select>
    );
}
