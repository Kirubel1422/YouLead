import { empty } from "@/assets";
import { cn } from "@/lib/utils";
import { FC } from "react";

interface ClassName {
     img?: string;
     wrapper?: string;
     text?: string;
}

interface EmptyProps {
     className?: ClassName;
}

export const Empty: FC<EmptyProps> = ({ className }) => {
     return (
          <div className={cn("flex flex-col items-center", className?.wrapper)}>
               <img src={empty} className={cn(className?.img)} width={400} />
               <h3 className={cn("text-lg font-medium text-primary mt-4", className?.text)}>Enjoy! You are free.</h3>
          </div>
     );
};
