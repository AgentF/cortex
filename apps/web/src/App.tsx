import React from "react";
import { ChatProvider } from "./context/ChatContext";
import { TestChat } from "./components/TestChat";
// import { Sidebar } from './components/layout/Sidebar'; // Comment out existing layout for now
// import { Editor } from './components/editor/Editor';

function App() {
  return (
    <ChatProvider>
      {/* TEMPORARY TESTING INTERFACE */}
      <TestChat />

      {/* 
        Once validated, we will restore the real layout:
        <div className="flex h-screen bg-gray-900 text-white">
           <Sidebar />
           <main className="flex-1 flex">
             <ChatInterface /> 
             <Editor />
           </main>
        </div>
      */}
    </ChatProvider>
  );
}

export default App;
