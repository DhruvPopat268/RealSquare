import {
  AREA_UNIT_OPTIONS,
  BHK_OPTIONS,
  FURNISH_TYPE_OPTIONS,
  RESIDENTIAL_PLOT_IDS,
  COMMERCIAL_PLOT_IDS,
  CATEGORY_RESIDENTIAL_ID,
  CATEGORY_COMMERCIAL_ID,
} from "./chatbotConstants";
import { fetchActivePurposes, fetchActiveCategories, fetchPropertyTypes } from "./chatbotApi";

// ── Inquiry-specific constants ────────────────────────────────────────────────
const INQUIRY_TYPE_OPTIONS     = ["Individual Property", "Project Property"];
const INQUIRY_CLASS_OPTIONS    = ["Hot 🔥 (High Priority)", "Warm 🌤️ (Medium Priority)", "Cold ❄️ (Low Priority)"];
const INQUIRY_CLASS_MAP        = { "Hot 🔥 (High Priority)": "hot", "Warm 🌤️ (Medium Priority)": "warm", "Cold ❄️ (Low Priority)": "cold" };
const COMM_PREF_OPTIONS        = ["Call", "WhatsApp", "Email", "SMS"];

// ── Main flow ─────────────────────────────────────────────────────────────────
export async function inquiryFlow(step, answer, collectedData, { botSay, setCollectedData, goTo, setCustomInput }) {

  // ── INIT ──────────────────────────────────────────────────────────────────
  if (step === "init") {
    await botSay("👋 Hi! I'll help you create a new property inquiry.\nLet's capture a few details to get started. 📋");
    await botSay("Are you creating an inquiry for an Individual Property or a Project Property?", INQUIRY_TYPE_OPTIONS);
    goTo("inquiry_type", collectedData);
    return;
  }

  // ── Q1: Inquiry type ──────────────────────────────────────────────────────
  if (step === "inquiry_type") {
    if (!answer) return;
    if (answer === "Project Property") {
      await botSay("🚧 Project inquiry is coming soon! Currently you can only create Individual Property inquiries.\n\nWould you like to continue with Individual Property?", ["Yes, continue", "No, go back"]);
      goTo("project_fallback", collectedData);
      return;
    }
    const updated = { ...collectedData, inquiryType: answer };
    setCollectedData(() => updated);
    try {
      await botSay("Got it! What is the property purpose you're interested in?");
      const purposes = await fetchActivePurposes();
      await botSay("Select the purpose:", purposes.map((p) => p.label));
      setCollectedData(() => ({ ...updated, _purposes: purposes }));
      goTo("purpose", { ...updated, _purposes: purposes });
    } catch {
      await botSay("⚠️ Failed to load options. Please refresh and try again.");
    }
    return;
  }

  // ── Project fallback ──────────────────────────────────────────────────────
  if (step === "project_fallback") {
    if (!answer) return;
    if (answer === "Yes, continue") {
      const updated = { ...collectedData, inquiryType: "Individual Property" };
      setCollectedData(() => updated);
      try {
        await botSay("Got it! What is the property purpose you're interested in?");
        const purposes = await fetchActivePurposes();
        await botSay("Select the purpose:", purposes.map((p) => p.label));
        setCollectedData(() => ({ ...updated, _purposes: purposes }));
        goTo("purpose", { ...updated, _purposes: purposes });
      } catch {
        await botSay("⚠️ Failed to load options. Please refresh and try again.");
      }
      return;
    }
    // If "No, go back"
    await botSay("Are you creating an inquiry for an Individual Property or a Project Property?", INQUIRY_TYPE_OPTIONS);
    goTo("inquiry_type", collectedData);
    return;
  }

  // ── Q2: Purpose ───────────────────────────────────────────────────────────
  if (step === "purpose") {
    if (!answer) return;
    const matched = collectedData._purposes?.find((p) => p.label === answer);
    const PG_ID = import.meta.env.VITE_LISTING_TYPE_PG_ID;
    const updated = {
      ...collectedData,
      listingTypeId:   matched?.value ?? null,
      listingTypeName: answer,
    };
    setCollectedData(() => updated);
    
    // If PG/Co-Living is selected, skip category and property type, go directly to city
    if (matched?.value === PG_ID) {
      await botSay("Which city are you looking for a property in?");
      setCustomInput({ type: "places", mode: "city", placeholder: "Search for a city..." });
      goTo("city", updated);
      return;
    }
    
    try {
      await botSay("What category does the property fall under?");
      const categories = await fetchActiveCategories();
      await botSay("Select the category:", categories.map((c) => c.label));
      setCollectedData(() => ({ ...updated, _categories: categories }));
      goTo("category", { ...updated, _categories: categories });
    } catch {
      await botSay("⚠️ Failed to load categories. Please refresh and try again.");
    }
    return;
  }

  // ── Q3: Category ──────────────────────────────────────────────────────────
  if (step === "category") {
    if (!answer) return;
    const matched = collectedData._categories?.find((c) => c.label === answer);
    const updated = { ...collectedData, categoryId: matched?.value ?? null, categoryName: answer };
    setCollectedData(() => updated);
    try {
      await botSay(`What type of ${answer.toLowerCase()} property are you looking for?`);
      const types = await fetchPropertyTypes(matched?.value);
      await botSay("Select the property type:", types.map((t) => t.label));
      setCollectedData(() => ({ ...updated, _propertyTypes: types }));
      goTo("property_type", { ...updated, _propertyTypes: types });
    } catch {
      await botSay("⚠️ Failed to load property types. Please refresh and try again.");
    }
    return;
  }

  // ── Q4: Property type ─────────────────────────────────────────────────────
  if (step === "property_type") {
    if (!answer) return;
    const matched = collectedData._propertyTypes?.find((t) => t.label === answer);
    const updated = { ...collectedData, propertyTypeId: matched?.value ?? null, propertyTypeName: answer };
    setCollectedData(() => updated);
    await botSay("Which city are you looking for a property in?");
    setCustomInput({ type: "places", mode: "city", placeholder: "Search for a city..." });
    goTo("city", updated);
    return;
  }

  // ── Q5: Preferred city ────────────────────────────────────────────────────
  if (step === "city") {
    if (!answer) return;
    const updated = { ...collectedData, preferredCity: answer };
    setCollectedData(() => updated);
    await botSay(`Great! Now, which area or locality in ${answer} are you interested in?`);
    setCustomInput({ type: "places", mode: "locality", cityName: answer, placeholder: `Search area in ${answer}...` });
    goTo("area", updated);
    return;
  }

  // ── Q6: Preferred area ────────────────────────────────────────────────────
  if (step === "area") {
    if (answer === "SKIP") {
      const updated = collectedData;
      setCollectedData(() => updated);
      await botSay("What is your minimum budget? (in ₹)");
      setCustomInput({ type: "number", key: "budget_min", placeholder: "Minimum budget in ₹..." });
      goTo("budget_min", updated);
      return;
    }
    if (!answer) return;
    const updated = {
      ...collectedData,
      preferredArea: collectedData._localityAddress ?? answer,
    };
    delete updated._localityAddress;
    delete updated._localityLatitude;
    delete updated._localityLongitude;
    setCollectedData(() => updated);
    await botSay("What is your minimum budget? (in ₹)");
    setCustomInput({ type: "number", key: "budget_min", placeholder: "Minimum budget in ₹..." });
    goTo("budget_min", updated);
    return;
  }

  // ── Q7a: Budget min ───────────────────────────────────────────────────────
  if (step === "budget_min") {
    if (!answer) return;
    const updated = { ...collectedData, budgetMin: Number(answer) };
    setCollectedData(() => updated);
    await botSay("What is your maximum budget? (in ₹)");
    setCustomInput({ type: "number", key: "budget_max", placeholder: "Maximum budget in ₹..." });
    goTo("budget_max", updated);
    return;
  }

  // ── Q7b: Budget max ───────────────────────────────────────────────────────
  if (step === "budget_max") {
    if (!answer) return;
    const max = Number(answer);
    const min = collectedData.budgetMin;
    if (max <= min) {
      await botSay(`❌ Maximum budget must be greater than minimum budget (₹${min.toLocaleString()}).\n\nPlease enter a valid maximum budget.`);
      setCustomInput({ type: "number", key: "budget_max_retry", placeholder: "Maximum budget in ₹..." });
      goTo("budget_max", collectedData);
      return;
    }
    const updated = { ...collectedData, budgetMax: max };
    setCollectedData(() => updated);

    // ── Q8: Route based on category + property type ──────────────────────
    const categoryId     = updated.categoryId;
    const propertyTypeId = updated.propertyTypeId;

    const isResidential  = categoryId === CATEGORY_RESIDENTIAL_ID;
    const isCommercial   = categoryId === CATEGORY_COMMERCIAL_ID;
    const isResPlot      = RESIDENTIAL_PLOT_IDS.includes(propertyTypeId);
    const isCommPlot     = COMMERCIAL_PLOT_IDS.includes(propertyTypeId);

    // Case 1: not commercial AND not any plot → ask BHK
    if (!isCommercial && !isResPlot && !isCommPlot) {
      await botSay("How many BHK are you looking for?", BHK_OPTIONS);
      goTo("bhk", updated);
      return;
    }

    // Case 2: not residential AND not any plot → ask built-up area unit then value
    if (!isResidential && !isResPlot && !isCommPlot) {
      await botSay("What unit should the built-up area be in?", AREA_UNIT_OPTIONS);
      goTo("builtup_unit", updated);
      return;
    }

    // Case 3: plot (residential or commercial) → ask area unit then total area
    await botSay("What unit should the plot area be in?", AREA_UNIT_OPTIONS);
    goTo("plot_unit", updated);
    return;
  }

  // ── Q8 Case 1: BHK ────────────────────────────────────────────────────────
  if (step === "bhk") {
    if (!answer) return;
    const updated = {
      ...collectedData,
      bhkRequirement: answer === "1 RK" ? 0 : Number(answer.replace(" BHK", "")),
      bhkLabel: answer,
    };
    setCollectedData(() => updated);
    await botSay("What furnishing type are you looking for?", FURNISH_TYPE_OPTIONS);
    goTo("furnishing", updated);
    return;
  }

  // ── Q8 Case 2: Built-up area ──────────────────────────────────────────────
  if (step === "builtup_unit") {
    if (!answer) return;
    const updated = { ...collectedData, _areaUnit: answer };
    setCollectedData(() => updated);
    await botSay(`What is the required built-up area? (in ${answer})`);
    setCustomInput({ type: "number", key: "builtup_value", placeholder: `Built-up area in ${answer}...` });
    goTo("builtup_value", updated);
    return;
  }

  if (step === "builtup_value") {
    if (!answer) return;
    const updated = {
      ...collectedData,
      requiredArea: { value: Number(answer), unit: collectedData._areaUnit },
    };
    delete updated._areaUnit;
    setCollectedData(() => updated);
    await botSay("What furnishing type are you looking for?", FURNISH_TYPE_OPTIONS);
    goTo("furnishing", updated);
    return;
  }

  // ── Q8 Case 3: Plot area ──────────────────────────────────────────────────
  if (step === "plot_unit") {
    if (!answer) return;
    const updated = { ...collectedData, _areaUnit: answer };
    setCollectedData(() => updated);
    await botSay(`What is the required plot area? (in ${answer})`);
    setCustomInput({ type: "number", key: "plot_value", placeholder: `Plot area in ${answer}...` });
    goTo("plot_value", updated);
    return;
  }

  if (step === "plot_value") {
    if (!answer) return;
    const updated = {
      ...collectedData,
      requiredArea: { value: Number(answer), unit: collectedData._areaUnit },
    };
    delete updated._areaUnit;
    setCollectedData(() => updated);
    await botSay("What furnishing type are you looking for?", FURNISH_TYPE_OPTIONS);
    goTo("furnishing", updated);
    return;
  }

  // ── Q9: Furnishing ────────────────────────────────────────────────────────
  if (step === "furnishing") {
    if (!answer) return;
    const updated = { ...collectedData, furnishingPreference: answer };
    setCollectedData(() => updated);
    await botSay("How would you classify this inquiry?", INQUIRY_CLASS_OPTIONS);
    goTo("lead_classification", updated);
    return;
  }

  // ── Q10: Lead classification ──────────────────────────────────────────────
  if (step === "lead_classification") {
    if (!answer) return;
    const updated = { ...collectedData, leadClassification: INQUIRY_CLASS_MAP[answer] ?? answer };
    setCollectedData(() => updated);
    await botSay("When was the last follow-up date?");
    setCustomInput({
      type: "date",
      key: "followup_date",
      placeholder: "Select date...",
      minDate: new Date().toISOString().split("T")[0],
    });
    goTo("followup_date", updated);
    return;
  }

  // ── Q11: Last follow-up date ──────────────────────────────────────────────
  if (step === "followup_date") {
    if (!answer) return;
    const updated = { ...collectedData, lastFollowUpDate: answer };
    setCollectedData(() => updated);
    await botSay("Any notes or remarks you'd like to add?", [], true);
    goTo("notes", updated);
    return;
  }

  // ── Q12: Notes / remarks ──────────────────────────────────────────────────
  if (step === "notes") {
    if (answer === "SKIP") {
      const updated = collectedData;
      setCollectedData(() => updated);
      await botSay("What are the preferred communication channels for this lead?");
      setCustomInput({
        type: "multiselect",
        key: "comm_prefs",
        options: COMM_PREF_OPTIONS,
        minSelect: 1,
      });
      goTo("comm_prefs", updated);
      return;
    }
    if (!answer) return;
    const updated = { ...collectedData, notes: answer };
    setCollectedData(() => updated);
    await botSay("What are the preferred communication channels for this lead?");
    setCustomInput({
      type: "multiselect",
      key: "comm_prefs",
      options: COMM_PREF_OPTIONS,
      minSelect: 1,
    });
    goTo("comm_prefs", updated);
    return;
  }

  // ── Q13: Communication preferences ───────────────────────────────────────
  if (step === "comm_prefs") {
    if (!answer) return;
    const updated = {
      ...collectedData,
      communicationPreferences: answer.split(", ").map((s) => s.trim()),
    };
    setCollectedData(() => updated);
    goTo("summary", updated);
    return;
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  if (step === "summary") {
    const d = collectedData;

    const budgetStr = d.budgetMin !== undefined && d.budgetMax !== undefined
      ? `₹${d.budgetMin.toLocaleString()} – ₹${d.budgetMax.toLocaleString()}`
      : "—";

    const areaStr = d.requiredArea
      ? `${d.requiredArea.value} ${d.requiredArea.unit}`
      : d.bhkLabel
      ? d.bhkLabel
      : "—";

    const areaLabel = d.requiredArea
      ? (RESIDENTIAL_PLOT_IDS.includes(d.propertyTypeId) || COMMERCIAL_PLOT_IDS.includes(d.propertyTypeId)
          ? "Plot Area"
          : "Built-up Area")
      : "BHK Requirement";

    const msg =
      `✅ Here's a summary of the inquiry. Please review before submitting.\n\n` +
      `📋 Basic Info:\n` +
      `  • Inquiry Type    : ${d.inquiryType ?? "—"}\n` +
      `  • Purpose         : ${d.listingTypeName ?? "—"}\n` +
      `  • Category        : ${d.categoryName ?? "—"}\n` +
      `  • Property Type   : ${d.propertyTypeName ?? "—"}\n\n` +
      `📍 Location:\n` +
      `  • City            : ${d.preferredCity ?? "—"}\n` +
      `  • Area            : ${d.preferredArea ?? "—"}\n\n` +
      `💰 Budget:\n` +
      `  • Range           : ${budgetStr}\n\n` +
      `🏠 Property Requirements:\n` +
      `  • ${areaLabel.padEnd(18)}: ${areaStr}\n` +
      `  • Furnishing      : ${d.furnishingPreference ?? "—"}\n\n` +
      `🎯 Lead Info:\n` +
      `  • Classification  : ${d.leadClassification ?? "—"}\n` +
      `  • Last Follow-up  : ${d.lastFollowUpDate ?? "—"}\n` +
      `  • Comm. Channels  : ${d.communicationPreferences?.join(", ") ?? "—"}\n\n` +
      `📝 Notes:\n  ${d.notes ?? "—"}\n\n` +
      `Ready to submit? 🚀`;

    await botSay(msg, ["Yes, Submit", "Start Over"]);
    goTo("submit", d);
    return;
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  if (step === "submit") {
    if (!answer) return;
    if (answer === "Start Over") {
      await botSay("Starting over... 🔄");
      setTimeout(() => window.location.reload(), 800);
      return;
    }
    // TODO: wire up to backend API
    await botSay("✅ Inquiry submitted successfully! Our team will follow up with you shortly. 🎉");
    await botSay("Would you like to create another inquiry?", ["Yes, create another", "No, I'm done"]);
    goTo("ask_more", collectedData);
    return;
  }

  // ── Ask more ──────────────────────────────────────────────────────────────
  if (step === "ask_more") {
    if (!answer) return;
    if (answer === "Yes, create another") {
      await botSay("Starting a new inquiry... 🔄");
      setTimeout(() => window.location.reload(), 800);
    }
    return;
  }
}
