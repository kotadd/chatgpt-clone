"use client";
import Image from "next/image";
import { RiSendPlaneFill } from "react-icons/ri";
import { AiOutlinePlus, AiOutlineDelete } from "react-icons/ai";

import { useState } from "react";

import Loading from "./components/Loading";

interface Message {
  role: string;
  content: string;
}

export default function Home() {
  const [userInput, setUserInput] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const userMessage: Message = {
      role: "user",
      content: userInput,
    };

    generateAnswer([...messages, userMessage]);

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setUserInput("");
  };

  const generateAnswer = async (messages: Message[]) => {
    setIsLoading(true);
    const response = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({ messages }),
    });

    const result = await response.json();

    if (result.error) {
      setIsLoading(false);
      alert("Error: " + result.error);
      return;
    }

    const botMessage: Message = {
      role: "assistant",
      content: result.choices[0].message.content,
    };

    const updatedMessages = [...messages, botMessage];
    setMessages(updatedMessages);
    setIsLoading(false);
  };

  return (
    <main className="flex flex-row">
      {/** Sidebar Section */}
      <aside className="w-80 bg-[#111111] h-screen p-5 pt-8">
        <div className="flex gap-x-4 items-center w-full">
          <Image
            src="/ai_bot.jpg"
            className="w-8 h-8 rounded-md"
            alt="bot"
            width={200}
            height={200}
          />
          <h1 className="text-white origin-left font-medium text-md">
            AI Assistant
          </h1>
        </div>
        <button className="p-2 rounded-md w-full bg-blue-600 text-sm mt-6 flex items-center justify-center hover:scale-105 duration-300">
          <AiOutlinePlus className="mr-2" />
          New Conversation
        </button>

        {/* List of conversations */}
        <ul className="pt-6 w-full">
          <li className="flex items-center justify-between mt-2 rounded-md p-3 cursor-pointer hover:bg-black text-gray-300 text-sm gap-x-4 overflow-hidden">
            <div className="flex flex-col">
              <p className="font-semibold text-md">Conversation's title #1</p>
              <p className="text-xs text-gray-500">Last message's content</p>
            </div>
            <div className="hover:text-red-600">
              <AiOutlineDelete className="w-4 h-4" />
            </div>
          </li>
        </ul>
      </aside>
      {/** Chat Section */}
      <div className="flex flex-grow max-w-2xl mx-auto h-screen">
        <div className="flex flex-col w-full">
          {/* Title */}
          <h1 className="bg-gradient-to-r from-blue-50 to-purple-500 text-transparent bg-clip-text mt-6 py-3 font-semibold text-md px-5">
            Conversation title #1
          </h1>
          {/* ChatMessage */}
          <div className="flex-1 overflow-auto p-6">
            {messages.map((message, index) => {
              if (message.role === "user") {
                return (
                  <div className="flex items-top mb-4" key={index}>
                    <img
                      src="/me.jpg"
                      className="w-10 h-10 rounded-md mr-4"
                      alt=""
                    />
                    <div className="bg-blue-500 px-4 py-2 rounded-md text-white w-full max-x-2xl">
                      <p>{message.content}</p>
                    </div>
                  </div>
                );
              } else if (message.role === "assistant") {
                return (
                  <div className="flex items-top mb-4" key={index}>
                    <img
                      src="/ai_bot.jpg"
                      className="w-10 h-10 rounded-md mr-4"
                      alt=""
                    />
                    <div className="px-4 py-2 rounded-md text-white w-full max-w-2xl">
                      <p>{message.content}</p>
                    </div>
                  </div>
                );
              }
              return null;
            })}

            {isLoading && <Loading text="AI is typing" />}
          </div>
          {/* Chat Input */}
          <div className="flex w-full mx-auto max-w-2xl p-6">
            <form className="w-full" onSubmit={handleSubmit}>
              <div className="flex rounded-lg border border-gray-600 bg-[#111111]">
                <input
                  type="text"
                  className="flex-grow px-4 py-2 bg-transparent text-sm text-white focus:outline-none"
                  placeholder="Type your message..."
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                />
                <button
                  type="submit"
                  className="bg-blue-600 rounded-lg m-2 px-4 py-2 text-white focus:outline-none"
                >
                  <RiSendPlaneFill />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
