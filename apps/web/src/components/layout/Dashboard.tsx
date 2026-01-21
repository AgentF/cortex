import React from "react";

interface DashboardProps {
  docCount: number;
  onCreate: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ docCount, onCreate }) => {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-gray-900 text-gray-400 select-none">
      <div className="max-w-md w-full text-center space-y-8">
        {/* LOGO / ICON */}
        <div className="flex justify-center">
          <div className="h-24 w-24 bg-gray-800 rounded-full flex items-center justify-center shadow-2xl border border-gray-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-blue-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
              />
            </svg>
          </div>
        </div>

        {/* STATUS */}
        <div>
          <h1 className="text-3xl font-bold text-gray-200 tracking-tight">
            CORTEX ONLINE
          </h1>
          <p className="mt-2 text-gray-500">
            System Ready. Neural Link Established.
          </p>
        </div>

        {/* METRICS */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
            <div className="text-2xl font-bold text-white">{docCount}</div>
            <div className="text-xs uppercase tracking-wider text-gray-500">
              Memory Nodes
            </div>
          </div>
          <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
            <div className="text-2xl font-bold text-green-400">ACTIVE</div>
            <div className="text-xs uppercase tracking-wider text-gray-500">
              Vector Link
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="pt-4">
          <button
            onClick={onCreate}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-blue-900/20 flex items-center gap-2 mx-auto"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Initialize New Node
          </button>

          <p className="mt-6 text-xs text-gray-600">
            Press{" "}
            <kbd className="bg-gray-800 px-1 rounded text-gray-400">/</kbd> in
            editor for commands
          </p>
        </div>
      </div>
    </div>
  );
};
