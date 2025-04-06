import { Loader2 } from "lucide-react";
import React from "react";

export const Loadable = ({
  isLoading,
  children,
}: {
  children: React.ReactNode;
  isLoading: boolean;
}) => {
  return (
    <React.Fragment>
      {isLoading && <Loader2 className="animate-spin h-6 w-6 text-gray-500" />}

      {children}
    </React.Fragment>
  );
};
