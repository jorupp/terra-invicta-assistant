import { InfoIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ReactNode } from "react";

interface InfoTooltipProps {
  children: ReactNode;
}

export function InfoTooltip({ children }: InfoTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button className="inline-flex items-center justify-center hover:text-muted-foreground transition-colors bg-blue-500 rounded-full ml-1">
          <InfoIcon className="h-4 w-4 stroke-white" />
        </button>
      </TooltipTrigger>
      <TooltipContent>{children}</TooltipContent>
    </Tooltip>
  );
}
