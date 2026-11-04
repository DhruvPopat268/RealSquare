import {
  AREA_UNIT_OPTIONS,
  BHK_OPTIONS,
  FURNISH_TYPE_OPTIONS,
  RESIDENTIAL_PLOT_IDS,
  COMMERCIAL_PLOT_IDS,
  COMMERCIAL_COWORKING_SPACE_ID,
  CATEGORY_RESIDENTIAL_ID,
  CATEGORY_COMMERCIAL_ID,
  LISTING_TYPE_SELL_ID,
  LISTING_TYPE_RENT_ID,
} from "./chatbotConstants";
import { fetchActivePurposes, fetchActiveCategories, fetchPropertyTypes, fetchActiveIdealFor } from "./chatbotApi";
import api from "../utils/axiosInterceptor";

// ── Inquiry-specific constants ────────────────────────────────────────────────
const INQUIRY_TYPE_OPTIONS     = ["Ready To Move Property", "Under Construction Property"];
const INQUIRY_CLASS_OPTIONS    = ["Hot 🔥 (High Priority)", "Warm 🌤️ (Medium Priority)", "Cold ❄️ (Low Priority)"];
const INQUIRY_CLASS_MAP        = { "Hot 🔥 (High Priority)": "hot", "Warm 🌤️ (Medium Priority)": "warm", "Cold ❄️ (Low Priority)": "cold" };
const COMM_PREF_OPTIONS        = ["Call", "WhatsApp", "Email", "SMS"];
const COWORKING_WORKSPACE_OPTIONS = ["Dedicated Coworking Desk", "Individual Private Cabin", "Virtual Office"];

const isCoworkingRequirement = (data) => Boolean(COMMERCIAL_COWORKING_SPACE_ID)
  && data.listingTypeId === LISTING_TYPE_RENT_ID
  && data.categoryId === CATEGORY_COMMERCIAL_ID
  && data.propertyTypeId === COMMERCIAL_COWORKING_SPACE_ID;

async function askNextCoworkingWorkspaceField(data, { botSay, setCustomInput, goTo }) {
  const type = data._coworkingSelectedTypes[data._coworkingWorkspaceIndex];
  const pending = { type };
  const updated = { ...data, _coworkingPendingWorkspace: pending };
  const displayType = type === "virtual_office" ? "Virtual Office" : type === "individual_private_cabin" ? "Individual Private Cabin" : "Dedicated Coworking Desk";

  if (type === "virtual_office") {
    await botSay("What is the minimum monthly rent for Virtual Office? (in ₹)");
    setCustomInput({ type: "number", key: "coworking_virtual_min_rent", placeholder: "Minimum monthly rent in ₹...", min: 1 });
    goTo("coworking_workspace_min_rent", updated);
    return;
  }

  await botSay(`How many seats do you need for ${displayType}?`);
  setCustomInput({ type: "number", key: "coworking_required_seats", placeholder: "Number of seats...", min: 1 });
  goTo("coworking_workspace_seats", updated);
}

async function askUnderConstructionCity(data, { botSay, setCustomInput, goTo }) {
  await botSay("Which city are you looking for a property in?");
  setCustomInput({ type: "places", mode: "city", placeholder: "Search for a city..." });
  goTo("city", data);
}

async function askUnderConstructionIdealFor(data, { botSay, setCollectedData, setCustomInput, goTo }) {
  try {
    const options = await fetchActiveIdealFor();
    if (!options.length) {
      await botSay("There are no active Ideal For options available. Please retry.", ["Retry"]);
      goTo("retry_under_construction_ideal_for", data);
      return;
    }
    const updated = { ...data, _idealForOptions: options };
    setCollectedData(() => updated);
    await botSay("Who is this commercial property ideal for? Select one option.");
    setCustomInput({ type: "idealFor", key: "requirement_ideal_for", options, minSelect: 1 });
    goTo("under_construction_ideal_for", updated);
  } catch {
    await botSay("⚠️ Failed to load Ideal For options. Please try again.", ["Retry"]);
    goTo("retry_under_construction_ideal_for", data);
  }
}

// ── Main flow ─────────────────────────────────────────────────────────────────
export async function inquiryFlow(step, answer, collectedData, { botSay, setCollectedData, goTo, setCustomInput }) {

  // ── INIT ──────────────────────────────────────────────────────────────────
  if (step === "init") {
    await botSay("👋 Hi! I'll help you create a new property requirement.\nLet's capture a few details to get started. 📋");
    await botSay("Are you creating a requirement for an Ready To Move Property or an Under Construction Property?", INQUIRY_TYPE_OPTIONS);
    goTo("inquiry_type", collectedData);
    return;
  }

  // ── Q1: Inquiry type ──────────────────────────────────────────────────────
  if (step === "inquiry_type") {
    if (!answer) return;
    if (answer === "Project Property") {
      await botSay("🚧 Project requirements are coming soon! Currently you can only create Individual Property requirements.\n\nWould you like to continue with Individual Property?", ["Yes, continue", "No, go back"]);
      goTo("project_fallback", collectedData);
      return;
    }
    const updated = { ...collectedData, inquiryType: answer };
    setCollectedData(() => updated);

    if (answer === "Under Construction Property") {
      const sellRequirement = {
        ...updated,
        listingTypeId: LISTING_TYPE_SELL_ID,
        listingTypeName: "Sell",
      };
      setCollectedData(() => sellRequirement);
      try {
        await botSay("What category does the property fall under?");
        const categories = (await fetchActiveCategories()).filter((category) =>
          [CATEGORY_RESIDENTIAL_ID, CATEGORY_COMMERCIAL_ID].includes(category.value)
        );
        if (!categories.length) throw new Error("No supported project categories are available");
        await botSay("Select the category:", categories.map((category) => category.label));
        const nextData = { ...sellRequirement, _categories: categories };
        setCollectedData(() => nextData);
        goTo("category", nextData);
      } catch {
        await botSay("⚠️ Failed to load categories. Please refresh and try again.");
      }
      return;
    }

    try {
      await botSay("Got it! What is the property purpose you're interested in?");
      const purposes = await fetchActivePurposes({ showBuyLabel: true });
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
        const purposes = await fetchActivePurposes({ showBuyLabel: true });
        await botSay("Select the purpose:", purposes.map((p) => p.label));
        setCollectedData(() => ({ ...updated, _purposes: purposes }));
        goTo("purpose", { ...updated, _purposes: purposes });
      } catch {
        await botSay("⚠️ Failed to load options. Please refresh and try again.");
      }
      return;
    }
    // If "No, go back"
    await botSay("Are you creating a requirement for an Ready To Move Property or an Under Construction Property?", INQUIRY_TYPE_OPTIONS);
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
    if (!matched) return;
    const updated = { ...collectedData, categoryId: matched?.value ?? null, categoryName: answer };
    setCollectedData(() => updated);

    if (updated.inquiryType === "Under Construction Property") {
      if (updated.categoryId === CATEGORY_COMMERCIAL_ID) {
        await askUnderConstructionIdealFor(updated, { botSay, setCollectedData, setCustomInput, goTo });
      } else {
        await askUnderConstructionCity(updated, { botSay, setCustomInput, goTo });
      }
      return;
    }

    try {
      await botSay(`What type of ${answer.toLowerCase()} property are you looking for?`);
      const availableTypes = await fetchPropertyTypes(matched?.value);
      const allowCoworkingType = Boolean(COMMERCIAL_COWORKING_SPACE_ID)
        && collectedData.listingTypeId === LISTING_TYPE_RENT_ID
        && matched?.value === CATEGORY_COMMERCIAL_ID;
      const types = allowCoworkingType
        ? availableTypes
        : availableTypes.filter((type) => String(type.value) !== String(COMMERCIAL_COWORKING_SPACE_ID));
      await botSay("Select the property type:", types.map((t) => t.label));
      setCollectedData(() => ({ ...updated, _propertyTypes: types }));
      goTo("property_type", { ...updated, _propertyTypes: types });
    } catch {
      await botSay("⚠️ Failed to load property types. Please refresh and try again.");
    }
    return;
  }

  if (step === "retry_under_construction_ideal_for") {
    if (answer !== "Retry") return;
    await askUnderConstructionIdealFor(collectedData, { botSay, setCollectedData, setCustomInput, goTo });
    return;
  }

  if (step === "under_construction_ideal_for") {
    const selected = collectedData._idealForSelection;
    if (!Array.isArray(selected) || selected.length === 0) return;
    const updated = {
      ...collectedData,
      idealFor: selected.map((option) => ({
        id: option._id,
        name: option.name,
        image: option.image,
        order: option.order,
      })),
    };
    delete updated._idealForSelection;
    delete updated._idealForOptions;
    setCollectedData(() => updated);
    await askUnderConstructionCity(updated, { botSay, setCustomInput, goTo });
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
      const updated = { ...collectedData };
      setCollectedData(() => updated);
      if (isCoworkingRequirement(updated)) {
        await botSay("Which co-working workspace types are you looking for? Select all that apply.");
        setCustomInput({ type: "multiselect", key: "coworking_workspace_types", options: COWORKING_WORKSPACE_OPTIONS, minSelect: 1, returnArray: true, resultKey: "_selectedCoworkingWorkspaceTypes" });
        goTo("coworking_workspace_types", updated);
        return;
      }
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
    if (isCoworkingRequirement(updated)) {
      await botSay("Which co-working workspace types are you looking for? Select all that apply.");
      setCustomInput({ type: "multiselect", key: "coworking_workspace_types", options: COWORKING_WORKSPACE_OPTIONS, minSelect: 1, returnArray: true, resultKey: "_selectedCoworkingWorkspaceTypes" });
      goTo("coworking_workspace_types", updated);
      return;
    }
    await botSay("What is your minimum budget? (in ₹)");
    setCustomInput({ type: "number", key: "budget_min", placeholder: "Minimum budget in ₹..." });
    goTo("budget_min", updated);
    return;
  }

  // Co-working requirements ask for workspace-specific seat and rent ranges instead of area/budget fields.
  if (step === "coworking_workspace_types") {
    const selected = (collectedData._selectedCoworkingWorkspaceTypes ?? []).map((label) => ({
      "Dedicated Coworking Desk": "dedicated_coworking_desk",
      "Individual Private Cabin": "individual_private_cabin",
      "Virtual Office": "virtual_office",
    }[label])).filter(Boolean).sort((a, b) =>
      ["dedicated_coworking_desk", "individual_private_cabin", "virtual_office"].indexOf(a) - ["dedicated_coworking_desk", "individual_private_cabin", "virtual_office"].indexOf(b)
    );
    if (!selected.length) return;

    const updated = {
      ...collectedData,
      _coworkingSelectedTypes: selected,
      _coworkingWorkspaceIndex: 0,
      _coworkingWorkspaces: [],
    };
    delete updated._selectedCoworkingWorkspaceTypes;
    setCollectedData(() => updated);
    await askNextCoworkingWorkspaceField(updated, { botSay, setCustomInput, goTo });
    return;
  }

  if (step === "coworking_workspace_seats") {
    if (!answer) return;
    const seats = Number(answer);
    if (!Number.isInteger(seats) || seats < 1) {
      await botSay("Please enter a whole number of seats greater than zero.");
      setCustomInput({ type: "number", key: "coworking_required_seats_retry", placeholder: "Number of seats...", min: 1 });
      goTo("coworking_workspace_seats", collectedData);
      return;
    }
    const workspaceType = collectedData._coworkingSelectedTypes[collectedData._coworkingWorkspaceIndex];
    const updated = { ...collectedData, _coworkingPendingWorkspace: { type: workspaceType, requiredSeats: seats } };
    setCollectedData(() => updated);
    const displayType = updated._coworkingPendingWorkspace.type === "individual_private_cabin" ? "Individual Private Cabin" : "Dedicated Coworking Desk";
    await botSay(`What is the minimum monthly rent per seat for ${displayType}? (in ₹)`);
    setCustomInput({ type: "number", key: "coworking_min_rent_per_seat", placeholder: "Minimum monthly rent per seat in ₹...", min: 1 });
    goTo("coworking_workspace_min_rent", updated);
    return;
  }

  if (step === "coworking_workspace_min_rent") {
    if (!answer) return;
    const minRent = Number(answer);
    if (!Number.isFinite(minRent) || minRent <= 0) {
      await botSay("Please enter a monthly rent greater than zero.");
      setCustomInput({ type: "number", key: "coworking_min_rent_retry", placeholder: "Minimum monthly rent in ₹...", min: 1 });
      goTo("coworking_workspace_min_rent", collectedData);
      return;
    }
    const workspaceType = collectedData._coworkingSelectedTypes[collectedData._coworkingWorkspaceIndex];
    const updated = { ...collectedData, _coworkingPendingWorkspace: { ...collectedData._coworkingPendingWorkspace, type: workspaceType, minRent } };
    setCollectedData(() => updated);
    const isPerSeat = workspaceType === "dedicated_coworking_desk" || workspaceType === "individual_private_cabin";
    const workspaceLabel = workspaceType === "dedicated_coworking_desk" ? "Dedicated Coworking Desk" : workspaceType === "individual_private_cabin" ? "Individual Private Cabin" : "Virtual Office";
    await botSay(isPerSeat
      ? `What is the maximum monthly rent per seat for ${workspaceLabel}? (in ₹)`
      : "What is the maximum monthly rent for Virtual Office? (in ₹)");
    setCustomInput({ type: "number", key: "coworking_max_rent", placeholder: isPerSeat ? `Maximum monthly rent per seat for ${workspaceLabel} in ₹...` : "Maximum monthly rent in ₹...", min: 1 });
    goTo("coworking_workspace_max_rent", updated);
    return;
  }

  if (step === "coworking_workspace_max_rent") {
    if (!answer) return;
    const maxRent = Number(answer);
    const pending = collectedData._coworkingPendingWorkspace;
    if (!Number.isFinite(maxRent) || maxRent <= 0 || maxRent < pending.minRent) {
      await botSay(`Maximum rent must be at least the minimum rent of ₹${Number(pending.minRent).toLocaleString("en-IN")}. Please enter it again.`);
      setCustomInput({ type: "number", key: "coworking_max_rent_retry", placeholder: "Maximum monthly rent in ₹...", min: 1 });
      goTo("coworking_workspace_max_rent", collectedData);
      return;
    }

    const workspaceType = collectedData._coworkingSelectedTypes[collectedData._coworkingWorkspaceIndex];
    const updated = {
      ...collectedData,
      _coworkingPendingWorkspace: { ...pending, maxRent },
    };
    setCollectedData(() => updated);
    const workspaceLabel = workspaceType === "dedicated_coworking_desk" ? "Dedicated Coworking Desk" : workspaceType === "individual_private_cabin" ? "Individual Private Cabin" : "Virtual Office";
    await botSay(`What furnishing status do you prefer for ${workspaceLabel}?`, FURNISH_TYPE_OPTIONS);
    goTo("coworking_workspace_furnishing", updated);
    return;
  }

  if (step === "coworking_workspace_furnishing") {
    if (!FURNISH_TYPE_OPTIONS.includes(answer)) {
      await botSay("Please choose a furnishing status for this workspace.", FURNISH_TYPE_OPTIONS);
      return;
    }

    const workspaceType = collectedData._coworkingSelectedTypes[collectedData._coworkingWorkspaceIndex];
    const pending = collectedData._coworkingPendingWorkspace;
    const workspace = workspaceType === "virtual_office"
      ? { type: workspaceType, minMonthlyRent: pending.minRent, maxMonthlyRent: pending.maxRent, furnishingType: answer }
      : { type: workspaceType, requiredSeats: pending.requiredSeats, minRentPerSeat: pending.minRent, maxRentPerSeat: pending.maxRent, furnishingType: answer };
    const nextIndex = collectedData._coworkingWorkspaceIndex + 1;
    const updated = {
      ...collectedData,
      _coworkingWorkspaceIndex: nextIndex,
      _coworkingWorkspaces: [...(collectedData._coworkingWorkspaces ?? []), workspace],
    };
    delete updated._coworkingPendingWorkspace;

    if (nextIndex < updated._coworkingSelectedTypes.length) {
      setCollectedData(() => updated);
      await askNextCoworkingWorkspaceField(updated, { botSay, setCustomInput, goTo });
      return;
    }

    updated.coworkingWorkspaces = updated._coworkingWorkspaces;
    ["_coworkingSelectedTypes", "_coworkingWorkspaceIndex", "_coworkingWorkspaces"].forEach((key) => delete updated[key]);
    setCollectedData(() => updated);
    await botSay("How would you classify this requirement?", INQUIRY_CLASS_OPTIONS);
    goTo("lead_classification", updated);
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
    const PG_ID          = import.meta.env.VITE_LISTING_TYPE_PG_ID;
    const isPG           = updated.listingTypeId === PG_ID;

    const isResidential  = categoryId === CATEGORY_RESIDENTIAL_ID;
    const isCommercial   = categoryId === CATEGORY_COMMERCIAL_ID;
    const isResPlot      = RESIDENTIAL_PLOT_IDS.includes(propertyTypeId);
    const isCommPlot     = COMMERCIAL_PLOT_IDS.includes(propertyTypeId);
    const isUnderConstruction = updated.inquiryType === "Under Construction Property";

    // PG — no BHK, no area, no furnishing → go straight to lead classification
    if (isPG) {
      await botSay("How would you classify this requirement?", INQUIRY_CLASS_OPTIONS);
      goTo("lead_classification", updated);
      return;
    }

    if (isUnderConstruction && isResidential) {
      await botSay("How many BHK are you looking for?", BHK_OPTIONS);
      goTo("bhk", updated);
      return;
    }

    if (isUnderConstruction && isCommercial) {
      await botSay("What unit should the approximate carpet area be in?", AREA_UNIT_OPTIONS);
      goTo("carpet_area_unit", updated);
      return;
    }

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
    if (updated.inquiryType === "Under Construction Property") {
      await botSay("What furnishing type are you looking for?", FURNISH_TYPE_OPTIONS);
      goTo("furnishing", updated);
      return;
    }
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

  if (step === "carpet_area_unit") {
    if (!AREA_UNIT_OPTIONS.includes(answer)) return;
    const updated = { ...collectedData, _carpetAreaUnit: answer };
    setCollectedData(() => updated);
    await botSay(`What is the approximate carpet area you want? (in ${answer})`);
    setCustomInput({ type: "number", key: "carpet_area_value", placeholder: `Approximate carpet area in ${answer}...`, min: 1 });
    goTo("carpet_area_value", updated);
    return;
  }

  if (step === "carpet_area_value") {
    if (!answer) return;
    const value = Number(answer);
    if (!Number.isFinite(value) || value <= 0) {
      await botSay("Please enter a carpet area greater than zero.");
      setCustomInput({ type: "number", key: "carpet_area_value_retry", placeholder: `Approximate carpet area in ${collectedData._carpetAreaUnit}...`, min: 1 });
      goTo("carpet_area_value", collectedData);
      return;
    }
    const updated = {
      ...collectedData,
      carpetArea: { value, unit: collectedData._carpetAreaUnit },
    };
    delete updated._carpetAreaUnit;
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
    // Plots don't have furnishing — skip directly to lead classification
      await botSay("How would you classify this requirement?", INQUIRY_CLASS_OPTIONS);
    goTo("lead_classification", updated);
    return;
  }

  // ── Q9: Furnishing ────────────────────────────────────────────────────────
  if (step === "furnishing") {
    if (!answer) return;
    const updated = { ...collectedData, furnishingPreference: answer };
    setCollectedData(() => updated);
      await botSay("How would you classify this requirement?", INQUIRY_CLASS_OPTIONS);
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
    const isCoworking = isCoworkingRequirement(d);

    const budgetStr = d.budgetMin !== undefined && d.budgetMax !== undefined
      ? `₹${d.budgetMin.toLocaleString()} – ₹${d.budgetMax.toLocaleString()}`
      : "—";

    const areaStr = d.carpetArea
      ? `${d.carpetArea.value} ${d.carpetArea.unit}`
      : d.requiredArea
      ? `${d.requiredArea.value} ${d.requiredArea.unit}`
      : d.bhkLabel
      ? d.bhkLabel
      : "—";

    const areaLabel = d.carpetArea
      ? "Carpet Area"
      : d.requiredArea
      ? (RESIDENTIAL_PLOT_IDS.includes(d.propertyTypeId) || COMMERCIAL_PLOT_IDS.includes(d.propertyTypeId)
          ? "Plot Area"
          : "Built-up Area")
      : "BHK Requirement";

    const idealForSummary = d.idealFor?.length
      ? `  • Ideal For       : ${d.idealFor.map((option) => option.name).join(", ")}\n`
      : "";

    const workspaceLines = (d.coworkingWorkspaces ?? []).map((workspace) => {
      const label = workspace.type === "virtual_office" ? "Virtual Office" : workspace.type === "individual_private_cabin" ? "Individual Private Cabin" : "Dedicated Coworking Desk";
      if (workspace.type === "virtual_office") {
        return `  • ${label}: ₹${workspace.minMonthlyRent.toLocaleString("en-IN")} – ₹${workspace.maxMonthlyRent.toLocaleString("en-IN")} monthly, ${workspace.furnishingType}`;
      }
      return `  • ${label}: ${workspace.requiredSeats} seats, ₹${workspace.minRentPerSeat.toLocaleString("en-IN")} – ₹${workspace.maxRentPerSeat.toLocaleString("en-IN")} per seat/month, ${workspace.furnishingType}`;
    }).join("\n");

    const msg =
      `✅ Here's a summary of the requirement. Please review before submitting.\n\n` +
      `📋 Basic Info:\n` +
      `  • Requirement Type: ${d.inquiryType ?? "—"}\n` +
      `  • Purpose         : ${d.listingTypeName ?? "—"}\n` +
      `  • Category        : ${d.categoryName ?? "—"}\n` +
      (d.inquiryType === "Under Construction Property" ? "" : `  • Property Type   : ${d.propertyTypeName ?? "—"}\n`) +
      idealForSummary + "\n" +
      `📍 Location:\n` +
      `  • City            : ${d.preferredCity ?? "—"}\n` +
      `  • Area            : ${d.preferredArea ?? "—"}\n\n` +
      (isCoworking ? `🏢 Workspace Requirements:\n${workspaceLines}\n\n` :
        `💰 Budget:\n` +
        `  • Range           : ${budgetStr}\n\n` +
        `🏠 Property Requirements:\n` +
        `  • ${areaLabel.padEnd(18)}: ${areaStr}\n` +
        (d.furnishingPreference ? `  • Furnishing      : ${d.furnishingPreference}\n` : "") + `\n`) +
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

    await botSay("⏳ Submitting your requirement...");

    try {
      const d = collectedData;
      const isCoworking = isCoworkingRequirement(d);

      // ── Build payload ──────────────────────────────────────────────────
      // Map comm preferences to lowercase API values
      const commMap = { "Call": "call", "WhatsApp": "whatsapp", "Email": "email", "SMS": "sms" };
      const preferredCommunication = (d.communicationPreferences ?? []).map((c) => commMap[c] ?? c.toLowerCase());

      const payload = {
        // Keep the selected requirement condition in the API's boolean flag.
        isProperty: d.inquiryType === "Ready To Move Property",
        listingType:             d.listingTypeId,
        preferredCity:           d.preferredCity,
        inquiryClassification:   d.leadClassification,
        lastFollowUpDate:        new Date(d.lastFollowUpDate).toISOString(),
        preferredCommunication,
        ...(!isCoworking && { budget: { min: d.budgetMin, max: d.budgetMax } }),
        ...(isCoworking && { coworkingWorkspaces: d.coworkingWorkspaces }),
        ...(d.furnishingPreference && { furnishingType: d.furnishingPreference }),
        ...(d.categoryId    && { propertyCategory: d.categoryId }),
        ...(d.propertyTypeId && { propertyType: d.propertyTypeId }),
        ...(d.idealFor?.length && { idealFor: d.idealFor.map((option) => option.id) }),
        ...(d.carpetArea && { carpetArea: d.carpetArea }),
        ...(d.preferredArea && { preferredArea: d.preferredArea }),
        ...(d.notes         && { remarks: d.notes }),
      };

      // Area fields — only one of bhk / builtUpArea / plotArea
      const isPlot       = [...RESIDENTIAL_PLOT_IDS, ...COMMERCIAL_PLOT_IDS].includes(d.propertyTypeId);
      const isCommercial = d.categoryId === CATEGORY_COMMERCIAL_ID;

      if (d.bhkRequirement !== undefined) {
        payload.bhk = d.bhkRequirement;
      } else if (d.requiredArea) {
        if (isPlot) {
          payload.plotArea = { value: d.requiredArea.value, unit: d.requiredArea.unit };
        } else if (isCommercial) {
          payload.builtUpArea = { value: d.requiredArea.value, unit: d.requiredArea.unit };
        }
      }

      await api.post(`${import.meta.env.VITE_API_URL}/api/mixed/inquiries/create`, payload, { withCredentials: true });

      await botSay(`✅ Requirement submitted successfully! 🎉\nYour requirement has been created and assigned to eligible professionals in ${d.preferredCity}.`);
      await botSay("Would you like to create another requirement?", ["Yes, create another", "No, I'm done"]);
      goTo("ask_more", collectedData);

    } catch (err) {
      await botSay(`❌ Something went wrong: ${err.message ?? "Network error"}. Please try again.`, ["Start Over"]);
      goTo("submit_error", collectedData);
    }
    return;
  }

  // ── Submit error fallback ─────────────────────────────────────────────────
  if (step === "submit_error") {
    if (answer === "Start Over") {
      await botSay("Starting over... 🔄");
      setTimeout(() => window.location.reload(), 800);
    }
    return;
  }

  // ── Ask more ──────────────────────────────────────────────────────────────
  if (step === "ask_more") {
    if (!answer) return;
    if (answer === "Yes, create another") {
      await botSay("Starting a new requirement... 🔄");
      setTimeout(() => window.location.reload(), 800);
    }
    return;
  }
}
