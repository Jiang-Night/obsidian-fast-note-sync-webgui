import { Wifi } from "lucide-react";
import { cn } from "@/lib/utils";


export function Logo({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                "flex items-center justify-center rounded-lg bg-primary text-primary-foreground transition-colors duration-300",
                className
            )}
            {...props}
        >
            <Wifi className="size-3/5" />
        </div>
    );
}
