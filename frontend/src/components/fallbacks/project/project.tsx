import { Coffee } from "lucide-react";

const ProjectFallBack = () => {
     return (
          <div className="flex flex-col items-center justify-center py-16">
               <div
                    className="bg-amber-50 rounded-full flex items-center justify-center"
                    style={{ width: 128, height: 128, animation: "float 3s ease-in-out infinite" }}
               >
                    <Coffee size={72} strokeWidth={1.5} className="text-amber-400" />
               </div>
               <h2 className="text-2xl font-semibold mt-6 text-gray-700">Nothing to do... yet!</h2>
               <p className="text-gray-500 mt-3 text-center max-w-md">
                    Take a deep breath, grab a coffee, and relax.
                    <br />
                    Projects will appear here when they’re assigned to you.
               </p>
          </div>
     );
};

export default ProjectFallBack;
