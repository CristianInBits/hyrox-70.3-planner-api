import React from "react";

type Props = React.HTMLAttributes<HTMLDivElement>;

export default function Card({ className = "", ...props }: Props) {
    return (
        <div
            className={
                "rounded-2xl border border-zinc-200/70 bg-white/80 backdrop-blur p-4 shadow-sm " +
                "dark:bg-zinc-900/70 dark:border-zinc-800 " +
                className
            }
            {...props}
        />
    );
}
