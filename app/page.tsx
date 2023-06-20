"use client";
import Image from "next/image";
import { RiSendPlaneFill } from "react-icons/ri";
import {
  AiOutlinePlus,
  AiOutlineDelete,
  AiOutlineCheckCircle,
} from "react-icons/ai";

import React, { useEffect, useRef, useState } from "react";

import Loading from "./components/Loading";
import { v4 as uuidv4 } from "uuid";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import SyntaxHighlight from "./components/SyntaxHighlight";

interface Message {
  role: string;
  content: string;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
}

export default function Home() {
  const [userInput, setUserInput] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversationTitle, setConversationTitle] = useState<string | null>(
    null
  );

  const [deleteConversationIndex, setDeleteConversationIndex] =
    useState<number>(-1);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current !== null) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

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

  const handleSelectConversation = (selectedConversation: Conversation) => {
    setConversationId(selectedConversation.id);
    setMessages(selectedConversation.messages);
    setConversationTitle(selectedConversation.title);
  };

  const handleConfirmDeleteConversation = (selectedIndex: number) => {
    setDeleteConversationIndex(selectedIndex);
    console.log("Selected Index: ", selectedIndex);

    setTimeout(() => {
      setDeleteConversationIndex(-1);
    }, 5000);
  };

  const handleRemoveConversation = (selectedIndex: number) => {
    setDeleteConversationIndex(-1);
    const newConversations = [...conversations];

    newConversations.splice(conversations.length - 1 - selectedIndex, 1);
    setConversations(newConversations);
    setConversationTitle(null);
    setConversationId(null);
    setMessages([]);
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

    if (messages.length < 3) {
      // create new conversation
      generateConversationTitle(updatedMessages);
    } else {
      // add new messages to current conversation
      addMessagesToConversation(conversationId!, updatedMessages);
    }
    setIsLoading(false);
  };

  const generateConversationTitle = async (initMessages: Message[]) => {
    const generateTitleMessage: Message = {
      role: "user",
      content:
        "What would be a short and relevant title for this conversation? You must strictly answer with only the title, no other text is allowed.",
    };

    const response = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({
        messages: [...initMessages, generateTitleMessage],
      }),
    });

    const result = await response.json();

    if (result.error) {
      alert("Error: " + result.error);
      return;
    }

    const newTitle = result.choices[0].message.content;
    createNewConversation(initMessages, newTitle);
  };

  const createNewConversation = (initMessages: Message[], newTitle: string) => {
    const newId = uuidv4();
    setConversations([
      ...conversations,
      {
        id: newId,
        title: newTitle,
        messages: initMessages,
      },
    ]);

    setConversationId(newId);
    setConversationTitle(newTitle);
  };

  const addMessagesToConversation = (
    conversationId: string,
    updatedMessages: Message[]
  ) => {
    // Create a new conversation array
    const updatedConversations = conversations.map((c) =>
      c.id === conversationId ? { ...c, messages: updatedMessages } : c
    );

    setConversations(updatedConversations);
  };

  // Load conversations from local storage
  useEffect(() => {
    const storedConversations = localStorage.getItem("conversations");
    if (storedConversations) {
      setConversations(JSON.parse(storedConversations));
    }
  }, []);

  // Save conversations to local storage
  useEffect(() => {
    localStorage.setItem("conversations", JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
        <a
          href="/"
          className="p-2 rounded-md w-full bg-blue-600 text-sm mt-6 flex items-center justify-center hover:scale-105 duration-300"
        >
          <AiOutlinePlus className="mr-2" />
          New Conversation
        </a>

        {/* List of conversations */}
        <ul className="pt-6 w-full">
          {conversations
            .slice()
            .reverse()
            .map((c, index) => {
              const lastMessage = c.messages[c.messages.length - 1];
              return (
                <li
                  key={index}
                  className="flex items-center justify-between mt-2 rounded-md p-3 cursor-pointer hover:bg-black text-gray-300 text-sm gap-x-4 overflow-hidden"
                >
                  <div
                    onClick={() => handleSelectConversation(c)}
                    className="flex flex-col w-[200px]"
                  >
                    <p className="font-semibold text-md truncate">{c.title}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {lastMessage.content}
                    </p>
                  </div>
                  <div className="hover:text-red-600">
                    {deleteConversationIndex === index ? (
                      <AiOutlineCheckCircle
                        onClick={() => handleRemoveConversation(index)}
                        className="w-4 h-4"
                      />
                    ) : (
                      <AiOutlineDelete
                        onClick={() => handleConfirmDeleteConversation(index)}
                        className="w-4 h-4"
                      />
                    )}
                  </div>
                </li>
              );
            })}
        </ul>
      </aside>
      {/** Chat Section */}
      <div className="flex flex-grow max-w-2xl mx-auto h-screen">
        <div className="flex flex-col w-full">
          {messages.length > 0 ? (
            <>
              {/* Title */}
              <h1 className="bg-gradient-to-r from-blue-50 to-purple-500 text-transparent bg-clip-text mt-6 py-3 font-semibold text-md px-5">
                {conversationTitle}
              </h1>
              {/* ChatMessage */}
              <div className="flex-1 overflow-auto p-6">
                <div className="font-medium text-sm leading-7 w-full">
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
                            <ReactMarkdown
                              children={message.content}
                              remarkPlugins={[remarkGfm]}
                              components={SyntaxHighlight}
                            />
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })}
                  {isLoading && <Loading text="AI is typing" />}
                </div>
                <div ref={messagesEndRef} />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="flex flex-col items-center">
                <Image
                  src="/ai_bot.jpg"
                  className="w-40 h-40 rounded-md"
                  alt="bot"
                  width={200}
                  height={200}
                />
                <h1 className="text-lg text-slate-500 text-center mt-6">
                  My name is Lana <br /> and I'm your AI personal assistant
                </h1>
              </div>
            </div>
          )}
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
