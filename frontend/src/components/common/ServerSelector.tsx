import { ServerOff } from "lucide-react";
import { cn } from "@/lib/cn";
import type { ServerPublicResponse } from "@/api/types";

interface ServerSelectorProps {
    servers: ServerPublicResponse[];
    selectedServerId: string | null;
    onSelect: (server: ServerPublicResponse) => void;
}

export function ServerSelector({ servers, selectedServerId, onSelect }: ServerSelectorProps) {
    if (servers.length === 0) {
        return (
            <div className="flex flex-col items-center gap-2 py-6 text-center">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-muted text-muted-foreground/40">
                    <ServerOff size={18} />
                </div>
                <div>
                    <p className="text-sm font-medium text-foreground">Нет доступных серверов</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Активные серверы временно недоступны!!!!
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-1" role="radiogroup" aria-label="Выбор сервера">
            {servers.map((server) => {
                const isSelected = server.id === selectedServerId;

                return (
                    <button
                        key={server.id}
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => onSelect(server)}
                        className={cn(
                            "w-full flex items-center gap-3 rounded-xl px-3 py-2.5",
                            "text-left border transition-all duration-110",
                            isSelected
                                ? "bg-primary/6 border-primary/25"
                                : "border-transparent hover:bg-muted/50 hover:border-border/50",
                        )}
                    >
                        {/* Radio indicator */}
                        <div
                            className={cn(
                                "w-3.75 h-3.75 rounded-full border-[1.5px] shrink-0",
                                "flex items-center justify-center transition-colors",
                                isSelected
                                    ? "border-primary bg-primary"
                                    : "border-muted-foreground/30",
                            )}
                        >
                            {isSelected && (
                                <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />
                            )}
                        </div>

                        {/* Location */}
                        <div className="flex-1 min-w-0">
                            <p className={cn(
                                "text-sm font-medium truncate",
                                isSelected ? "text-foreground" : "text-foreground/80",
                            )}>
                                {server.country}
                            </p>
                            <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                                {server.city}
                            </p>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}