import { cn } from "@/lib/utils";
import { Input } from "./ui/input";

export const AuthInput = ({
  preIcon,
  suffixIcon,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
  preIcon?: React.ReactNode;
  suffixIcon?: React.ReactNode;
}) => {
  return (
    <div>
      <div className="relative">
        {!!preIcon && preIcon}

        <Input
          {...props}
          className={cn("pl-10 ", props.error && "border-red-500")}
        />

        {!!suffixIcon && suffixIcon}
      </div>

      {props.error && <p className="text-xs text-red-500">{props.error}</p>}
    </div>
  );
};
