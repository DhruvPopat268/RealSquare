import { useState, useRef, useCallback } from "react";

/**
 * Generic chatbot engine.
 * runStep(step, answer, collectedData, { botSay, setCollectedData, goTo, setCustomInput })
 *
 * setCustomInput(config | null)
 *   config = { type: "places", mode: "city" | "locality", cityName: "", placeholder: "" }
 *   pass null to clear and go back to normal text input
 */
export function useChatbot(runStep) {
  const [messages, setMessages]           = useState([]);
  const [isTyping, setIsTyping]           = useState(false);
  const [quickReplies, setQuickReplies]   = useState([]);
  const [awaitingInput, setAwaitingInput] = useState(false);
  const [customInput, setCustomInput]     = useState(null); // { type, mode, cityName, placeholder }
  const [collectedData, setCollectedData] = useState({});

  const stepRef          = useRef("init");
  const collectedDataRef = useRef({});
  const hasStartedRef    = useRef(false);

  const updateCollectedData = useCallback((updater) => {
    setCollectedData((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      collectedDataRef.current = next;
      return next;
    });
  }, []);

  const addMessage = useCallback((msg) => {
    setMessages((prev) => [...prev, { id: Date.now() + Math.random(), ...msg }]);
  }, []);

  const botSay = useCallback((text, options = [], freeInput = false) => {
    setIsTyping(true);
    setQuickReplies([]);
    setAwaitingInput(false);
    setCustomInput(null);
    return new Promise((resolve) => {
      setTimeout(() => {
        setIsTyping(false);
        addMessage({ from: "bot", text });
        if (options.length > 0) setQuickReplies(options);
        if (freeInput) setAwaitingInput(true);
        resolve();
      }, 750);
    });
  }, [addMessage]);

  const goTo = useCallback((nextStep, latestData) => {
    stepRef.current = nextStep;
    const data = latestData ?? collectedDataRef.current;
    runStep(nextStep, null, data, { botSay, setCollectedData: updateCollectedData, goTo, setCustomInput });
  }, [botSay, runStep, updateCollectedData]);

  const handleUserReply = useCallback((text, extraData = {}) => {
    if (!text.trim()) return;
    setQuickReplies([]);
    setAwaitingInput(false);
    setCustomInput(null);
    addMessage({ from: "user", text });
    // merge any extra data (e.g. lat/lng from places) before running the step
    if (Object.keys(extraData).length > 0) {
      collectedDataRef.current = { ...collectedDataRef.current, ...extraData };
      setCollectedData(collectedDataRef.current);
    }
    runStep(stepRef.current, text.trim(), collectedDataRef.current, {
      botSay,
      setCollectedData: updateCollectedData,
      goTo,
      setCustomInput,
    });
  }, [addMessage, botSay, goTo, runStep, updateCollectedData]);

  const startFlow = useCallback(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;
    collectedDataRef.current = {};
    setCollectedData({});
    stepRef.current = "init";
    runStep("init", null, {}, { botSay, setCollectedData: updateCollectedData, goTo, setCustomInput });
  }, [botSay, goTo, runStep, updateCollectedData]);

  return {
    messages,
    isTyping,
    quickReplies,
    awaitingInput,
    customInput,
    collectedData,
    handleUserReply,
    startFlow,
  };
}
