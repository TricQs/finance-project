"use client";

import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    Send,
    BarChart2,
    Globe,
    Video,
    PlaneTakeoff,
    AudioLines,
} from "lucide-react";

function useDebounce<T>(value: T, delay: number = 500): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]);

    return debouncedValue;
}

export interface Action {
    id: string;
    label: string;
    icon: React.ReactNode;
    description?: string;
    short?: string;
    end?: string;
    onSelect?: () => void;
}

interface SearchResult {
    actions: Action[];
}

const allActions: Action[] = [
    {
        id: "1",
        label: "Book tickets",
        icon: <PlaneTakeoff className="h-4 w-4 text-blue-500" />,
        description: "Operator",
        short: "⌘K",
        end: "Agent",
    },
    {
        id: "2",
        label: "Summarize",
        icon: <BarChart2 className="h-4 w-4 text-orange-500" />,
        description: "gpt-4o",
        short: "⌘cmd+p",
        end: "Command",
    },
    {
        id: "3",
        label: "Screen Studio",
        icon: <Video className="h-4 w-4 text-purple-500" />,
        description: "gpt-4o",
        short: "",
        end: "Application",
    },
    {
        id: "4",
        label: "Talk to Jarvis",
        icon: <AudioLines className="h-4 w-4 text-green-500" />,
        description: "gpt-4o voice",
        short: "",
        end: "Active",
    },
    {
        id: "5",
        label: "Translate",
        icon: <Globe className="h-4 w-4 text-blue-500" />,
        description: "gpt-4o",
        short: "",
        end: "Command",
    },
];

function ActionSearchBar({
    actions = allActions,
    placeholder = "Search...",
    className = "",
    isCollapsed = false,
    onFocusChange
}: {
    actions?: Action[];
    placeholder?: string;
    className?: string;
    isCollapsed?: boolean;
    onFocusChange?: (focused: boolean) => void;
}) {
    const [query, setQuery] = useState("");
    const [result, setResult] = useState<SearchResult | null>(null);
    const [isFocused, setIsFocused] = useState(false);
    const [selectedAction, setSelectedAction] = useState<Action | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const debouncedQuery = useDebounce(query, 200);

    useEffect(() => {
        if (!isFocused) {
            setResult(null);
            return;
        }

        if (!debouncedQuery) {
            setResult({ actions });
            return;
        }

        const normalizedQuery = debouncedQuery.toLowerCase().trim();
        const filteredActions = actions.filter((action) => {
            const searchableText = `${action.label} ${action.description || ""}`.toLowerCase();
            return searchableText.includes(normalizedQuery);
        });

        setResult({ actions: filteredActions });
    }, [debouncedQuery, isFocused, actions]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
    };

    const container = {
        hidden: { opacity: 0, height: 0 },
        show: {
            opacity: 1,
            height: "auto",
            transition: {
                height: { duration: 0.3 },
                staggerChildren: 0.04,
            },
        },
        exit: {
            opacity: 0,
            height: 0,
            transition: {
                height: { duration: 0.2 },
                opacity: { duration: 0.15 },
            },
        },
    };

    const item = {
        hidden: { opacity: 0, y: 8 },
        show: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.2 },
        },
        exit: {
            opacity: 0,
            y: -5,
            transition: { duration: 0.15 },
        },
    };

    const handleFocus = () => {
        setSelectedAction(null);
        setIsFocused(true);
        onFocusChange?.(true);
    };

    const handleBlur = () => {
        setTimeout(() => {
            setIsFocused(false);
            onFocusChange?.(false);
        }, 200);
    };

    return (
        <div className={cn("w-full relative", className)}>
            <div className="relative w-full flex items-center">
                {/* Left Stationary Search Icon */}
                <div className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 z-20 pointer-events-none flex items-center justify-center">
                    <Search className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-400 shrink-0" />
                </div>

                <Input
                    ref={inputRef}
                    type="text"
                    placeholder={placeholder}
                    value={query}
                    onChange={handleInputChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    className={cn(
                        "pl-9 py-1.5 h-9 text-xs rounded-2xl border-slate-200/80 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/60 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none focus:outline-none focus:ring-0 focus:border-indigo-400 dark:focus:border-indigo-500 shadow-none transition-all duration-300",
                        isCollapsed ? "pr-2 placeholder:opacity-0 cursor-pointer" : "pr-3 placeholder:opacity-100"
                    )}
                />
            </div>

            <AnimatePresence>
                {!isCollapsed && isFocused && result && (
                    <motion.div
                        className="absolute left-0 right-0 top-11 z-50 border rounded-2xl shadow-xl overflow-hidden border-slate-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md max-h-64 overflow-y-auto font-sans"
                        variants={container}
                        initial="hidden"
                        animate="show"
                        exit="exit"
                    >
                        <motion.ul className="p-1 flex flex-col gap-0.5">
                            {result.actions.map((action) => (
                                <motion.li
                                    key={action.id}
                                    className="px-3 py-2 flex items-center justify-between hover:bg-indigo-50 dark:hover:bg-zinc-900/80 text-slate-700 dark:text-zinc-200 cursor-pointer rounded-xl transition-colors"
                                    variants={item}
                                    layout
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        setQuery("");
                                        setIsFocused(false);
                                        setSelectedAction(null);
                                        onFocusChange?.(false);
                                        inputRef.current?.blur();
                                        action.onSelect?.();
                                    }}
                                >
                                    <div className="flex items-center gap-2.5 truncate">
                                        <span className="shrink-0">
                                            {action.icon}
                                        </span>
                                        <span className="text-xs font-medium truncate">
                                            {action.label}
                                        </span>
                                    </div>
                                    {action.end && (
                                        <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-2">
                                            {action.end}
                                        </span>
                                    )}
                                </motion.li>
                            ))}
                        </motion.ul>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export { ActionSearchBar };
