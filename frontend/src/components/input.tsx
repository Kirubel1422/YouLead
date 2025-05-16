import { cn } from "@/lib/utils";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

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

                    <Input {...props} className={cn("pl-10 ", props.error && "border-red-500")} />

                    {!!suffixIcon && suffixIcon}
               </div>

               {props.error && <p className="text-xs text-red-500">{props.error}</p>}
          </div>
     );
};

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
     label: string;
     error: string;
}
export const FormInput = ({ label, error, name, ...props }: FormInputProps) => {
     return (
          <div>
               <Label htmlFor={name}>{label}</Label>
               <Input {...props} className={cn("w-full", error && "border-red-500")} id={name} />

               {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
     );
};
