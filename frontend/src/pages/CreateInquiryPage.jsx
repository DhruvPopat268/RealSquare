import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FiSend, FiClipboard } from "react-icons/fi";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useChatbot } from "../chatbot/useChatbot";
import { inquiryFlow } from "../chatbot/InquiryFlow";
import ChatbotPlacesInput from "../chatbot/ChatbotPlacesInput";
import ChatbotMultiSelect from "../chatbot/ChatbotMultiSelect";
import ChatbotNumberInput from "../chatbot/ChatbotNumberInput";
import ChatbotDateInput from "../chatbot/ChatbotDateInput";

function BotAvatar() {
  return (
    <div className="w-8 h-8 rounded-full bg-[#7B2FFF] flex items-center justify-center flex-shrink-0 shadow">
      <FiClipboard size={15} className="text-white" />
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <BotAvatar />
      <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
        <div className="flex gap-1 items-center h-4">
          <span className="w-2 h-2 bg-[#7B2FFF] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-2 h-2 bg-[#7B2FFF] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-2 h-2 bg-[#7B2FFF] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}

function BotMessage({ text }) {
  return (
    <div className="flex items-end gap-2">
      <BotAvatar />
      <div className="max-w-[75%] bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
        <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">{text}</p>
      </div>
    </div>
  );
}

function UserMessage({ text }) {
  return (
    <div className="flex items-end gap-2 justify-end">
      <div className="max-w-[75%] bg-[#7B2FFF] rounded-2xl rounded-br-sm px-4 py-3 shadow-sm">
        <p className="text-sm text-white leading-relaxed whitespace-pre-line">{text}</p>
      </div>
      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 text-xs font-bold text-gray-600">
        You
      </div>
    </div>
  );
}

function QuickReplies({ options, onSelect }) {
  return (
    <div className="flex flex-wrap gap-2 ml-10 mt-1">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onSelect(opt)}
          className="px-4 py-2 rounded-full border-2 border-[#7B2FFF] text-[#7B2FFF] text-sm font-medium bg-white hover:bg-[#f0ebff] transition"
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

export default function CreateInquiryPage() {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);

  const {
    messages, isTyping, quickReplies, awaitingInput, customInput,
    handleUserReply, editLastAnswer, startFlow, currentStep,
  } = useChatbot(inquiryFlow);

  // Start flow on mount
  useEffect(() => { startFlow(); }, []);

  // Auto-scroll chat container
  useEffect(() => {
    const el = chatContainerRef.current;
    if (!el) return;
    requestAnimationFrame(() => { el.scrollTop = el.scrollHeight; });
  }, [messages, isTyping, quickReplies, customInput]);

  // Focus text input when it becomes active
  const showPlacesInput      = !!customInput && customInput.type === "places";
  const showMultiSelectInput = !!customInput && customInput.type === "multiselect";
  const showNumberInput      = !!customInput && customInput.type === "number";
  const showDateInput        = !!customInput && customInput.type === "date";
  const showTextInput        = awaitingInput && !showPlacesInput && !showMultiSelectInput && !showNumberInput && !showDateInput;

  useEffect(() => {
    if (showTextInput) inputRef.current?.focus();
  }, [showTextInput]);

  const lastUserMsgId = [...messages].reverse().find((m) => m.from === "user")?.id;
  const canSend = awaitingInput && input.trim().length > 0;

  const submit = () => {
    if (!canSend) return;
    handleUserReply(input);
    setInput("");
  };

  const handlePlacesSubmit = ({ displayText, address, latitude, longitude }) => {
    if (customInput?.mode === "locality") {
      handleUserReply(displayText, {
        _localityAddress: address,
        _localityLatitude: latitude,
        _localityLongitude: longitude,
      });
    } else {
      handleUserReply(displayText);
    }
  };

  return (
    <>
      <Navbar />
      <div className="bg-[#f7f8fa] min-h-[calc(100vh-62px)] flex flex-col">
        <div className="max-w-[720px] w-full mx-auto flex flex-col flex-1 px-4 py-6 gap-4">

          {/* Header */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-5 py-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#7B2FFF] flex items-center justify-center shadow">
              <FiClipboard size={18} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-[#1a1a2e]">RealSquare Inquiry Assistant</p>
              <p className="text-xs text-green-500 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                Online · Typically replies instantly
              </p>
            </div>
          </div>

          {/* Chat window */}
          <div
            className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col overflow-hidden"
            style={{ height: "calc(100vh - 210px)", minHeight: 400 }}
          >
            {/* Messages */}
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-4 scrollbar-none"
            >
              {messages.map((msg, idx) => {
                const isLastMessage = idx === messages.length - 1;
                return msg.from === "bot"
                  ? (
                    <div key={msg.id}>
                      <BotMessage text={msg.text} />
                      {isLastMessage && ["area", "notes"].includes(currentStep) && !isTyping && (
                        <button
                          onClick={() => handleUserReply("SKIP")}
                          className="mt-2 ml-10 px-4 py-2 rounded-xl bg-[#7B2FFF] text-white text-xs font-semibold hover:bg-[#6320d4] transition border-none cursor-pointer"
                        >
                          Skip
                        </button>
                      )}
                    </div>
                  )
                  : (
                    <div key={msg.id} className="flex flex-col items-end gap-1">
                      <UserMessage text={msg.text} />
                      {msg.id === lastUserMsgId && !isTyping && currentStep !== "submit" && (
                        <button
                          onClick={editLastAnswer}
                          className="mr-10 text-xs text-[#7B2FFF] hover:underline bg-transparent border-none cursor-pointer px-1"
                        >
                          ✏️ Edit
                        </button>
                      )}
                    </div>
                  );
              })}
              {isTyping && <TypingIndicator />}
              {!isTyping && quickReplies.length > 0 && (
                <QuickReplies options={quickReplies} onSelect={(opt) => handleUserReply(opt)} />
              )}
            </div>

            <div className="border-t border-gray-100" />

            {/* Input bar */}
            <div className="px-4 py-3 flex items-end gap-3">
              {showPlacesInput ? (
                <ChatbotPlacesInput
                  mode={customInput.mode}
                  cityName={customInput.cityName ?? ""}
                  placeholder={customInput.placeholder}
                  onSubmit={handlePlacesSubmit}
                />
              ) : showMultiSelectInput ? (
                <ChatbotMultiSelect
                  key={customInput.key}
                  options={customInput.options}
                  minSelect={customInput.minSelect ?? 1}
                  onSubmit={(val) => handleUserReply(val)}
                />
              ) : showNumberInput ? (
                <ChatbotNumberInput
                  key={customInput.key}
                  placeholder={customInput.placeholder}
                  min={customInput.min ?? 0}
                  allowZero={customInput.allowZero ?? false}
                  onSubmit={(val) => handleUserReply(val)}
                />
              ) : showDateInput ? (
                <ChatbotDateInput
                  key={customInput.key}
                  placeholder={customInput.placeholder}
                  minDate={customInput.minDate}
                  maxDate={customInput.maxDate}
                  onSubmit={(val) => handleUserReply(val)}
                />
              ) : (
                <>
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && submit()}
                    placeholder={showTextInput ? "Type your answer..." : "Choose an option above"}
                    disabled={!showTextInput}
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#7B2FFF] transition disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
                  />
                  <button
                    onClick={submit}
                    disabled={!canSend}
                    className="w-10 h-10 rounded-xl bg-[#7B2FFF] disabled:opacity-40 flex items-center justify-center flex-shrink-0 hover:bg-[#6320d4] transition border-none cursor-pointer"
                  >
                    <FiSend size={16} className="text-white" />
                  </button>
                </>
              )}
            </div>
          </div>

          <p className="text-center text-xs text-gray-400">
            ⚠️ Do not refresh the page, your answers will be lost
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}
