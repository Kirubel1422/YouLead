export default function ActivityFallBack() {
     return (
          <div className="flex flex-col items-center justify-center py-12">
               <span
                    role="img"
                    aria-label="Waving hand"
                    className="text-5xl mb-2 animate-wave"
                    style={{ fontSize: "3rem" }}
               >
                    👋
               </span>
               <div className="text-lg font-semibold text-gray-700 mb-1">No activity yet</div>
               <div className="text-gray-500 text-sm text-center max-w-xs">
                    It looks a little quiet in here.
                    <br />
                    Start collaborating, and your team's activity will show up here!
               </div>
          </div>
     );
}
