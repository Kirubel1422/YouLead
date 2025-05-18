export default function MeetingFallback() {
     return (
          <div className="flex flex-col items-center justify-center py-12">
               <svg
                    className="w-12 h-12 text-gray-300 mb-3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    viewBox="0 0 24 24"
               >
                    <path
                         strokeLinecap="round"
                         strokeLinejoin="round"
                         d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-3A2.25 2.25 0 008.25 5.25V9m10.5 6.75V7.5A2.25 2.25 0 0016.5 5.25H15.75m-7.5 0A2.25 2.25 0 005.25 7.5v8.25M21 16.5a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 16.5V7.5A2.25 2.25 0 015.25 5.25h13.5A2.25 2.25 0 0121 7.5v9z"
                    />
               </svg>
               <div className="text-gray-500 text-sm font-medium">No meetings currently</div>
          </div>
     );
}
