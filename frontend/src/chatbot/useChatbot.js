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
  const [customInput, setCustomInput]     = useState(null);
  const [collectedData, setCollectedData] = useState({});

  const stepRef          = useRef("init");
  const prevStepRef      = useRef("init");
  const collectedDataRef = useRef({});
  const hasStartedRef    = useRef(false);
  // snapshot of bot state just before the last user reply
  const lastQuestionSnapRef = useRef(null); // { quickReplies, customInput, awaitingInput }

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
        // update current question tracker
        currentQuestionRef.current = { text, quickReplies: options, customInput: null, awaitingInput: freeInput };
        resolve();
      }, 750);
    });
  }, [addMessage]);

  const setCustomInputAndSnap = useCallback((config) => {
    setCustomInput(config);
    // update current question tracker with customInput
    if (config) {
      currentQuestionRef.current = { ...currentQuestionRef.current, customInput: config, quickReplies: [], awaitingInput: false };
    }
  }, []);

  // track current question state in a ref so handleUserReply can snapshot it
  const currentQuestionRef = useRef({ text: "", quickReplies: [], customInput: null, awaitingInput: false });

  const goTo = useCallback((nextStep, latestData) => {
    stepRef.current = nextStep;
    const data = latestData ?? collectedDataRef.current;
    runStep(nextStep, null, data, { botSay, setCollectedData: updateCollectedData, goTo, setCustomInput: setCustomInputAndSnap });
  }, [botSay, runStep, setCustomInputAndSnap, updateCollectedData]);

  const handleUserReply = useCallback((text, extraData = {}) => {
    if (!text.trim()) return;
    prevStepRef.current = stepRef.current;
    // snapshot the current question BEFORE moving forward
    lastQuestionSnapRef.current = { ...currentQuestionRef.current };
    setQuickReplies([]);
    setAwaitingInput(false);
    setCustomInput(null);
    addMessage({ from: "user", text });
    if (Object.keys(extraData).length > 0) {
      collectedDataRef.current = { ...collectedDataRef.current, ...extraData };
      setCollectedData(collectedDataRef.current);
    }
    runStep(stepRef.current, text.trim(), collectedDataRef.current, {
      botSay,
      setCollectedData: updateCollectedData,
      goTo,
      setCustomInput: setCustomInputAndSnap,
    });
  }, [addMessage, botSay, goTo, runStep, setCustomInputAndSnap, updateCollectedData]);

  const editLastAnswer = useCallback(() => {
    const snap = lastQuestionSnapRef.current;
    if (!snap) return;
    stepRef.current = prevStepRef.current;
    // restore currentQuestionRef so next handleUserReply snapshots correctly
    currentQuestionRef.current = { ...snap };
    setIsTyping(true);
    setQuickReplies([]);
    setCustomInput(null);
    setAwaitingInput(false);
    setTimeout(() => {
      setIsTyping(false);
      addMessage({ from: "bot", text: snap.text });
      setQuickReplies(snap.quickReplies);
      setCustomInput(snap.customInput);
      setAwaitingInput(snap.awaitingInput);
    }, 250);
  }, [addMessage]);

  const startFlow = useCallback(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;
    collectedDataRef.current = {};
    setCollectedData({});
    stepRef.current = "init";
    runStep("init", null, {}, { botSay, setCollectedData: updateCollectedData, goTo, setCustomInput: setCustomInputAndSnap });
  }, [botSay, goTo, runStep, setCustomInputAndSnap, updateCollectedData]);

  return {
    messages,
    isTyping,
    quickReplies,
    awaitingInput,
    customInput,
    collectedData,
    handleUserReply,
    editLastAnswer,
    startFlow,
  };
}
