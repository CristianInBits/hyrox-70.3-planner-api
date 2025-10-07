import React from "react";

type Props = {
    children: React.ReactNode;
    className?: string;
};

export default function Label({ children, className = "" }: Props) {
    return (
        <span
            className={
                "text-sm font-medium text-zinc-700 dark:text-zinc-300 " + className
            }
        >
            {children}
        </span>
    );
}
