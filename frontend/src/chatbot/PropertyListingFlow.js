import {
  LISTING_MODE_OPTIONS,
  PURPOSE_KEY_MAP,
  CONSTRUCTION_STATUS_OPTIONS, CONSTRUCTION_STATUS_MAP,
  SECURITY_DEPOSIT_OPTIONS, SECURITY_DEPOSIT_MAP,
  AREA_UNIT_OPTIONS, BHK_OPTIONS, FURNISH_TYPE_OPTIONS,
  RESIDENTIAL_PLOT_IDS, COMMERCIAL_PLOT_IDS, COMMERCIAL_OFFICE_IDS, COMMERCIAL_OTHERS_IDS,
  CATEGORY_RESIDENTIAL_ID, CATEGORY_COMMERCIAL_ID,
  LISTING_TYPE_SELL_ID, LISTING_TYPE_PG_ID,
  PG_FOR_OPTIONS, PG_SUITED_FOR_OPTIONS, PG_MEALS_OPTIONS,
  PG_COMMON_AREA_OPTIONS, PG_ROOM_TYPE_OPTIONS,
  COMMERCIAL_ZONE_TYPE_OPTIONS, COMMERCIAL_LOCATION_HUB_OPTIONS,
  COMMERCIAL_OWNERSHIP_OPTIONS,
} from "./chatbotConstants";
import { fetchActivePurposes, fetchActiveCategories, fetchPropertyTypes, fetchActiveCities, fetchFurnishingsAmenities } from "./chatbotApi";

export async function propertyListingFlow(step, answer, collectedData, { botSay, setCollectedData, goTo, setCustomInput }) {

  // ── INIT ──────────────────────────────────────────────────────────────────
  if (step === "init") {
    await botSay("👋 Hi! I'm your RealSquare listing assistant.\nI'll help you list your property in just a few simple steps.\n\nLet's get started! 🏠");
    await botSay("Are you listing a Property or a Project?", LISTING_MODE_OPTIONS);
    goTo("listing_mode", collectedData);
    return;
  }

  // ── Q1: Property Listing or Project Listing ───────────────────────────────
  if (step === "listing_mode") {
    if (!answer) return;
    if (answer === "Project Listing") {
      await botSay("🚧 Project listing is coming soon! Currently you can only do Property Listing.\n\nWould you like to continue with Property Listing?", ["Yes, continue", "No, go back"]);
      goTo("project_fallback", collectedData);
      return;
    }
    const updated = { ...collectedData, listingMode: answer };
    setCollectedData(() => updated);
    try {
      await botSay("Fetching options...");
      const purposes = await fetchActivePurposes();
      await botSay("What are you looking to do with this property?", purposes.map((p) => p.label));
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
      const updated = { ...collectedData, listingMode: "Property Listing" };
      setCollectedData(() => updated);
      try {
        await botSay("Fetching options...");
        const purposes = await fetchActivePurposes();
        await botSay("What are you looking to do with this property?", purposes.map((p) => p.label));
        setCollectedData(() => ({ ...updated, _purposes: purposes }));
        goTo("purpose", { ...updated, _purposes: purposes });
      } catch {
        await botSay("⚠️ Failed to load options. Please refresh and try again.");
      }
    } else {
      await botSay("👋 No problem! Come back when Project Listing is available. You can close this window.");
    }
    return;
  }

  // ── Q2: Purpose ───────────────────────────────────────────────────────────
  if (step === "purpose") {
    if (!answer) return;
    const matched = collectedData._purposes?.find((p) => p.label === answer);
    const updated = {
      ...collectedData,
      listingTypeId:   matched?.value ?? null,
      listingTypeName: answer,
      purposeKey:      PURPOSE_KEY_MAP[answer] ?? "sellInfo",
    };
    setCollectedData(() => updated);
    // PG always belongs to Residential — skip category & property type
    if (matched?.value === LISTING_TYPE_PG_ID) {
      const pgUpdated = { ...updated, categoryId: CATEGORY_RESIDENTIAL_ID, categoryName: "Residential" };
      setCollectedData(() => pgUpdated);
      await botSay("Great! In which city is the property located?");
      setCustomInput({ type: "places", mode: "city", placeholder: "Search for a city..." });
      goTo("city", pgUpdated);
      return;
    }
    try {
      await botSay("Got it! Now, what category does your property fall under?");
      const categories = await fetchActiveCategories();
      await botSay("Please select the property category:", categories.map((c) => c.label));
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
      await botSay(`Great! What type of ${answer.toLowerCase()} property is it?`);
      const types = await fetchPropertyTypes(matched?.value);
      await botSay("Select the property type:", types.map((t) => t.label));
      setCollectedData(() => ({ ...updated, _propertyTypes: types }));
      goTo("property_type", { ...updated, _propertyTypes: types });
    } catch {
      await botSay("⚠️ Failed to load property types. Please refresh and try again.");
    }
    return;
  }

  // ── Q4: Property Type ─────────────────────────────────────────────────────
  if (step === "property_type") {
    if (!answer) return;
    const matched = collectedData._propertyTypes?.find((t) => t.label === answer);
    const isCommPlot   = COMMERCIAL_PLOT_IDS.includes(matched?.value);
    const isCommOthers = COMMERCIAL_OTHERS_IDS.includes(matched?.value);
    if (isCommPlot) {
      const updated = { ...collectedData, propertyTypeId: matched?.value ?? null, propertyTypeName: answer };
      setCollectedData(() => updated);
      await botSay("Great! In which city is the property located?");
      setCustomInput({ type: "places", mode: "city", placeholder: "Search for a city..." });
      goTo("city", updated);
      return;
    }
    const updated = { ...collectedData, propertyTypeId: matched?.value ?? null, propertyTypeName: answer };
    setCollectedData(() => updated);
    if (isCommOthers) {
      await botSay("What is the property type name?", [], true);
      goTo("comm_others_type", updated);
      return;
    }
    await botSay("Great! In which city is the property located?");
    setCustomInput({ type: "places", mode: "city", placeholder: "Search for a city..." });
    goTo("city", updated);
    return;
  }

  // ── Q5: City ──────────────────────────────────────────────────────────────
  if (step === "city") {
    if (!answer) return;
    try {
      const cities = await fetchActiveCities();
      const matched = cities.find((c) => c.label.toLowerCase() === answer.toLowerCase());
      if (!matched) {
        await botSay(`🚧 Sorry, our service is not available in ${answer} yet. We're coming soon!\n\nWould you like to try a different city?`, ["Yes, try another city"]);
        goTo("city_retry", collectedData);
        return;
      }
      const updated = { ...collectedData, cityId: matched.value, cityName: answer };
      setCollectedData(() => updated);
      await botSay(`Perfect! Now, what's the exact locality or address in ${answer}?`);
      setCustomInput({ type: "places", mode: "locality", cityName: answer, placeholder: `Search locality in ${answer}...` });
      goTo("locality", updated);
    } catch {
      await botSay("⚠️ Failed to validate city. Please refresh and try again.");
    }
    return;
  }

  // ── City retry ────────────────────────────────────────────────────────────
  if (step === "city_retry") {
    if (!answer) return;
    await botSay("Sure! Which city is the property located in?");
    setCustomInput({ type: "places", mode: "city", placeholder: "Search for a city..." });
    goTo("city", collectedData);
    return;
  }

  // ── Q6: Locality ──────────────────────────────────────────────────────────
  if (step === "locality") {
    if (!answer) return;
    const updated = {
      ...collectedData,
      locality: {
        address:   collectedData._localityAddress   ?? answer,
        latitude:  collectedData._localityLatitude  ?? null,
        longitude: collectedData._localityLongitude ?? null,
      },
    };
    delete updated._localityAddress;
    delete updated._localityLatitude;
    delete updated._localityLongitude;
    setCollectedData(() => updated);

    const isResidential = updated.categoryId === CATEGORY_RESIDENTIAL_ID;
    const isPlot        = RESIDENTIAL_PLOT_IDS.includes(updated.propertyTypeId);

    const isCommercial = updated.categoryId === CATEGORY_COMMERCIAL_ID;
    const isCommPlot    = COMMERCIAL_PLOT_IDS.includes(updated.propertyTypeId);
    const isPG          = updated.listingTypeId === LISTING_TYPE_PG_ID;
    if (isResidential && isPG) {
      goTo("pg_name", updated);
    } else if (isResidential && isPlot) {
      goTo("plot_society", updated);
    } else if (isResidential && !isPlot) {
      goTo("res_society", updated);
    } else if (isCommercial && isCommPlot) {
      goTo("comm_plot_society", updated);
    } else if (isCommercial) {
      goTo("comm_society", updated);
    } else {
      await botSay("🚧 This property type is coming soon!");
    }
    return;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PG BRANCH  (pgDetails)
  // ═══════════════════════════════════════════════════════════════════════════

  if (step === "pg_name") {
    if (!answer) {
      await botSay("What is the name of your PG?", [], true);
      return;
    }
    const updated = { ...collectedData, _pgName: answer };
    setCollectedData(() => updated);
    await botSay("Who is this PG suited for?", PG_FOR_OPTIONS);
    goTo("pg_for", updated);
    return;
  }

  if (step === "pg_for") {
    if (!answer) return;
    const updated = { ...collectedData, _pgFor: answer };
    setCollectedData(() => updated);
    await botSay("What is the total number of beds available?");
    setCustomInput({ type: "number", key: "pg_total_beds", placeholder: "Total beds available..." });
    goTo("pg_total_beds", updated);
    return;
  }

  if (step === "pg_total_beds") {
    if (!answer) return;
    const updated = { ...collectedData, _pgTotalBeds: Number(answer) };
    setCollectedData(() => updated);
    await botSay("Best suited for? (select all that apply)");
    setCustomInput({ type: "multiselect", key: "pg_suited_for", options: PG_SUITED_FOR_OPTIONS, minSelect: 1 });
    goTo("pg_suited_for", updated);
    return;
  }

  if (step === "pg_suited_for") {
    if (!answer) return;
    const selected = answer.split(",").map((s) => s.trim()).filter((s) => PG_SUITED_FOR_OPTIONS.includes(s));
    if (selected.length === 0) {
      await botSay("Please select at least one valid option.");
      setCustomInput({ type: "multiselect", key: "pg_suited_for", options: PG_SUITED_FOR_OPTIONS, minSelect: 1 });
      return;
    }
    const updated = { ...collectedData, _pgSuitedFor: selected };
    setCollectedData(() => updated);
    await botSay("Are meals available at this PG?", ["Yes", "No"]);
    goTo("pg_meals_available", updated);
    return;
  }

  if (step === "pg_meals_available") {
    if (!answer) return;
    const updated = { ...collectedData, _pgMealsAvailable: answer === "Yes" };
    setCollectedData(() => updated);
    if (answer === "Yes") {
      await botSay("Which meals are provided? (select all that apply)");
      setCustomInput({ type: "multiselect", key: "pg_meals_list", options: PG_MEALS_OPTIONS, minSelect: 1 });
      goTo("pg_meals_list", updated);
    } else {
      await botSay("What is the notice period in days?");
      setCustomInput({ type: "number", key: "pg_notice_period", placeholder: "Notice period in days...", allowZero: true });
      goTo("pg_notice_period", { ...updated, _pgMeals: [] });
    }
    return;
  }

  if (step === "pg_meals_list") {
    if (!answer) return;
    const selected = answer.split(",").map((s) => s.trim()).filter((s) => PG_MEALS_OPTIONS.includes(s));
    if (selected.length === 0) {
      await botSay("Please select at least one valid meal option.");
      setCustomInput({ type: "multiselect", key: "pg_meals_list", options: PG_MEALS_OPTIONS, minSelect: 1 });
      return;
    }
    const updated = { ...collectedData, _pgMeals: selected };
    setCollectedData(() => updated);
    await botSay("What is the notice period in days?");
    setCustomInput({ type: "number", key: "pg_notice_period", placeholder: "Notice period in days...", allowZero: true });
    goTo("pg_notice_period", updated);
    return;
  }

  if (step === "pg_notice_period") {
    if (!answer) return;
    const updated = { ...collectedData, _pgNoticePeriod: Number(answer) };
    setCollectedData(() => updated);
    await botSay("What is the lock-in period in days?");
    setCustomInput({ type: "number", key: "pg_lockin_period", placeholder: "Lock-in period in days...", allowZero: true });
    goTo("pg_lockin_period", updated);
    return;
  }

  if (step === "pg_lockin_period") {
    if (!answer) return;
    const updated = { ...collectedData, _pgLockinPeriod: Number(answer) };
    setCollectedData(() => updated);
    await botSay("Which common areas are available? (select all that apply)");
    setCustomInput({ type: "multiselect", key: "pg_common_areas", options: PG_COMMON_AREA_OPTIONS, minSelect: 0 });
    goTo("pg_common_areas", updated);
    return;
  }

  if (step === "pg_common_areas") {
    if (!answer) return;
    const selected = answer.split(",").map((s) => s.trim()).filter((s) => PG_COMMON_AREA_OPTIONS.includes(s));
    const updated = { ...collectedData, _pgCommonAreas: selected, _pgRooms: [] };
    setCollectedData(() => updated);
    await botSay("Great! Now let's add rooms.\n\nWhat is the room type?", PG_ROOM_TYPE_OPTIONS);
    goTo("pg_room_type", updated);
    return;
  }

  // ── PG Room loop ──────────────────────────────────────────────────────────

  if (step === "pg_room_type") {
    if (!answer) return;
    const isSingleSharing = answer === "1 Sharing";
    const updated = { ...collectedData, _pgRoomType: answer, _pgRoomBeds: isSingleSharing ? 1 : undefined };
    setCollectedData(() => updated);
    if (isSingleSharing) {
      await botSay("What is the rent for this room type? (in ₹)");
      setCustomInput({ type: "number", key: "pg_room_rent", placeholder: "Rent amount in ₹..." });
      goTo("pg_room_rent", updated);
    } else {
      await botSay("How many beds are available in this room type?");
      setCustomInput({ type: "number", key: "pg_room_beds", placeholder: "Number of beds..." });
      goTo("pg_room_beds", updated);
    }
    return;
  }

  if (step === "pg_room_beds") {
    if (!answer) return;
    const beds = Number(answer);
    // derive max from room type label e.g. "3 Sharing" → 3
    const maxBeds = Number(collectedData._pgRoomType?.split(" ")[0]) || Infinity;
    if (beds < 1 || beds > maxBeds) {
      await botSay(`❌ For "${collectedData._pgRoomType}", beds available must be between 1 and ${maxBeds}.\n\nPlease enter a valid number.`);
      setCustomInput({ type: "number", key: "pg_room_beds_retry", placeholder: "Number of beds..." });
      goTo("pg_room_beds", collectedData);
      return;
    }
    const updated = { ...collectedData, _pgRoomBeds: beds };
    setCollectedData(() => updated);
    await botSay("What is the rent for this room type? (in ₹)");
    setCustomInput({ type: "number", key: "pg_room_rent", placeholder: "Rent amount in ₹..." });
    goTo("pg_room_rent", updated);
    return;
  }

  if (step === "pg_room_rent") {
    if (!answer) return;
    const updated = { ...collectedData, _pgRoomRent: Number(answer) };
    setCollectedData(() => updated);
    await botSay("What is the security deposit for this room type? (in ₹)");
    setCustomInput({ type: "number", key: "pg_room_deposit", placeholder: "Security deposit in ₹...", allowZero: true });
    goTo("pg_room_deposit", updated);
    return;
  }

  if (step === "pg_room_deposit") {
    if (!answer) return;
    const newRoom = {
      roomType:       collectedData._pgRoomType,
      bedsAvailable:  collectedData._pgRoomBeds,
      rent:           collectedData._pgRoomRent,
      securityDeposit: Number(answer),
    };
    const rooms   = [...(collectedData._pgRooms ?? []), newRoom];
    const updated = { ...collectedData, _pgRooms: rooms };
    delete updated._pgRoomType;
    delete updated._pgRoomBeds;
    delete updated._pgRoomRent;
    setCollectedData(() => updated);
    await botSay(`✅ Room ${rooms.length} added successfully!`);
    await botSay("Do you want to add another room type?", ["Yes, add another room", "No, done with rooms"]);
    goTo("pg_room_more", updated);
    return;
  }

  if (step === "pg_room_more") {
    if (!answer) return;
    if (answer === "Yes, add another room") {
      await botSay("What is the room type?", PG_ROOM_TYPE_OPTIONS);
      goTo("pg_room_type", collectedData);
    } else {
      const ex = collectedData.pgDetails ?? {};
      const updated = {
        ...collectedData,
        detailsKey: "pgDetails",
        pgDetails: {
          pgName:             collectedData._pgName             ?? ex.pgName,
          pgFor:              collectedData._pgFor              ?? ex.pgFor,
          totalBedsAvailable: collectedData._pgTotalBeds        ?? ex.totalBedsAvailable,
          bestSuitedFor:      collectedData._pgSuitedFor        ?? ex.bestSuitedFor,
          mealsAvailable:     collectedData._pgMealsAvailable   ?? ex.mealsAvailable,
          meals:              collectedData._pgMeals            ?? ex.meals ?? [],
          noticePeriod:       collectedData._pgNoticePeriod     ?? ex.noticePeriod,
          lockInPeriod:       collectedData._pgLockinPeriod     ?? ex.lockInPeriod,
          commonAreas:        collectedData._pgCommonAreas      ?? ex.commonAreas,
          rooms:              collectedData._pgRooms            ?? ex.rooms,
        },
      };
      ["_pgName","_pgFor","_pgTotalBeds","_pgSuitedFor","_pgMealsAvailable","_pgMeals",
       "_pgNoticePeriod","_pgLockinPeriod","_pgCommonAreas","_pgRooms"].forEach((k) => delete updated[k]);
      setCollectedData(() => updated);
      goTo("ask_images", updated);
    }
    return;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // COMMERCIAL PLOT BRANCH  (commercialDetails)
  // ═══════════════════════════════════════════════════════════════════════════

  if (step === "comm_plot_society") {
    if (!answer) {
      await botSay("What is the society or park name?", [], true);
      return;
    }
    const updated = { ...collectedData, _commPlotSociety: answer };
    setCollectedData(() => updated);
    await botSay("What is the zone type?", COMMERCIAL_ZONE_TYPE_OPTIONS);
    goTo("comm_plot_zone", updated);
    return;
  }

  if (step === "comm_plot_zone") {
    if (!answer) return;
    const updated = { ...collectedData, _commPlotZone: answer };
    setCollectedData(() => updated);
    await botSay("What is the location hub?", COMMERCIAL_LOCATION_HUB_OPTIONS);
    goTo("comm_plot_location_hub", updated);
    return;
  }

  if (step === "comm_plot_location_hub") {
    if (!answer) return;
    const updated = { ...collectedData, _commPlotLocationHub: answer };
    setCollectedData(() => updated);
    await botSay("What unit is the plot area in?", AREA_UNIT_OPTIONS);
    goTo("comm_plot_area_unit", updated);
    return;
  }

  if (step === "comm_plot_area_unit") {
    if (!answer) return;
    const updated = { ...collectedData, _commPlotAreaUnit: answer };
    setCollectedData(() => updated);
    await botSay("What is the plot area value?");
    setCustomInput({ type: "number", key: "comm_plot_area_value", placeholder: "Plot area value..." });
    goTo("comm_plot_area_value", updated);
    return;
  }

  if (step === "comm_plot_area_value") {
    if (!answer) return;
    const updated = { ...collectedData, _commPlotAreaValue: Number(answer) };
    setCollectedData(() => updated);
    await botSay("What is the length of the plot in feet?");
    setCustomInput({ type: "number", key: "comm_plot_length", placeholder: "Plot length in feet..." });
    goTo("comm_plot_length", updated);
    return;
  }

  if (step === "comm_plot_length") {
    if (!answer) return;
    const updated = { ...collectedData, _commPlotLength: Number(answer) };
    setCollectedData(() => updated);
    await botSay("What is the width of the plot in feet?");
    setCustomInput({ type: "number", key: "comm_plot_width", placeholder: "Plot width in feet..." });
    goTo("comm_plot_width", updated);
    return;
  }

  if (step === "comm_plot_width") {
    if (!answer) return;
    const width      = Number(answer);
    const length     = collectedData._commPlotLength;
    const areaValue  = collectedData._commPlotAreaValue;
    const unit       = collectedData._commPlotAreaUnit;
    const rawProduct = length * width;
    const converted  = unit === "sqyd" ? rawProduct / 9 : unit === "sqmt" ? rawProduct / 10.764 : rawProduct;
    const mismatch   = Math.abs(converted - areaValue) > 1;
    if (mismatch) {
      await botSay(
        `❌ The plot area doesn't match!\n\n` +
        `• You entered area: ${areaValue} ${unit}\n` +
        `• Length × Width = ${length} × ${width} ft = ${converted.toFixed(2)} ${unit}\n\n` +
        `Please re-enter the correct plot area, length, and width.`
      );
      const retry = { ...collectedData };
      delete retry._commPlotAreaValue;
      delete retry._commPlotLength;
      setCollectedData(() => retry);
      await botSay("What is the plot area value?");
      setCustomInput({ type: "number", key: "comm_plot_area_value_retry", placeholder: "Plot area value..." });
      goTo("comm_plot_area_value", retry);
      return;
    }
    const updated = { ...collectedData, _commPlotWidth: width };
    setCollectedData(() => updated);
    await botSay("What is the ownership type?", COMMERCIAL_OWNERSHIP_OPTIONS);
    goTo("comm_plot_ownership", updated);
    return;
  }

  if (step === "comm_plot_ownership") {
    if (!answer) return;
    const ex = collectedData.commercialDetails ?? {};
    const updated = {
      ...collectedData,
      detailsKey: "commercialDetails",
      commercialDetails: {
        societyName: collectedData._commPlotSociety    ?? ex.societyName,
        zoneType:    collectedData._commPlotZone       ?? ex.zoneType,
        locationHub: collectedData._commPlotLocationHub ?? ex.locationHub,
        plotArea:    collectedData._commPlotAreaValue != null
          ? { value: collectedData._commPlotAreaValue, unit: collectedData._commPlotAreaUnit }
          : ex.plotArea,
        length:      collectedData._commPlotLength     ?? ex.length,
        width:       collectedData._commPlotWidth      ?? ex.width,
        ownership:   answer,
      },
    };
    ["_commPlotSociety","_commPlotZone","_commPlotLocationHub","_commPlotAreaUnit",
     "_commPlotAreaValue","_commPlotLength","_commPlotWidth"].forEach((k) => delete updated[k]);
    setCollectedData(() => updated);
    goTo("purpose_questions", updated);
    return;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // COMMERCIAL BRANCH  (commercialDetails)
  // ═══════════════════════════════════════════════════════════════════════════

  if (step === "comm_others_type") {
    if (!answer) return;
    const updated = { ...collectedData, _commOthersType: answer };
    setCollectedData(() => updated);
    await botSay("Great! In which city is the property located?");
    setCustomInput({ type: "places", mode: "city", placeholder: "Search for a city..." });
    goTo("city", updated);
    return;
  }

  if (step === "comm_society") {
    if (!answer) {
      await botSay("What is the society or building name?", [], true);
      return;
    }
    const updated = { ...collectedData, _commSociety: answer };
    setCollectedData(() => updated);
    await botSay("What is the zone type?", COMMERCIAL_ZONE_TYPE_OPTIONS);
    goTo("comm_zone", updated);
    return;
  }

  if (step === "comm_zone") {
    if (!answer) return;
    const updated = { ...collectedData, _commZone: answer };
    setCollectedData(() => updated);
    await botSay("What is the location hub?", COMMERCIAL_LOCATION_HUB_OPTIONS);
    goTo("comm_location_hub", updated);
    return;
  }

  if (step === "comm_location_hub") {
    if (!answer) return;
    const updated = { ...collectedData, _commLocationHub: answer };
    setCollectedData(() => updated);
    await botSay("What unit are the areas in? (built-up & carpet)", AREA_UNIT_OPTIONS);
    goTo("comm_builtup_unit", updated);
    return;
  }

  if (step === "comm_builtup_unit") {
    if (!answer) return;
    const updated = { ...collectedData, _commAreaUnit: answer };
    setCollectedData(() => updated);
    await botSay("What is the built-up area value?");
    setCustomInput({ type: "number", key: "comm_builtup_value", placeholder: "Built-up area value..." });
    goTo("comm_builtup_value", updated);
    return;
  }

  if (step === "comm_builtup_value") {
    if (!answer) return;
    const updated = { ...collectedData, _commBuiltUpValue: Number(answer) };
    setCollectedData(() => updated);
    await botSay(`What is the carpet area value? (in ${collectedData._commAreaUnit})`);
    setCustomInput({ type: "number", key: "comm_carpet_value", placeholder: "Carpet area value..." });
    goTo("comm_carpet_value", updated);
    return;
  }

  if (step === "comm_carpet_value") {
    if (!answer) return;
    if (Number(answer) > collectedData._commBuiltUpValue) {
      await botSay(`❌ Carpet area cannot be greater than built-up area (${collectedData._commBuiltUpValue} ${collectedData._commAreaUnit}).\n\nPlease enter a valid carpet area.`);
      setCustomInput({ type: "number", key: "comm_carpet_value_retry", placeholder: "Carpet area value..." });
      return;
    }
    const updated = { ...collectedData, _commCarpetValue: Number(answer) };
    setCollectedData(() => updated);
    await botSay("What is the ownership type?", COMMERCIAL_OWNERSHIP_OPTIONS);
    goTo("comm_ownership", updated);
    return;
  }

  if (step === "comm_ownership") {
    if (!answer) return;
    const updated = { ...collectedData, _commOwnership: answer };
    setCollectedData(() => updated);
    await botSay("How many total floors does the building have?");
    setCustomInput({ type: "number", key: "comm_total_floors", placeholder: "Total number of floors..." });
    goTo("comm_total_floors", updated);
    return;
  }

  if (step === "comm_total_floors") {
    if (!answer) return;
    const totalFloors = Number(answer);
    const updated = { ...collectedData, _commTotalFloors: totalFloors };
    setCollectedData(() => updated);
    const floorOptions = ["-2", "-1", "Ground", ...Array.from({ length: totalFloors }, (_, i) => `${i + 1}`)];
    await botSay(`On which floor is your property located?`, floorOptions);
    goTo("comm_your_floor", updated);
    return;
  }

  if (step === "comm_your_floor") {
    if (!answer) return;
    const yourFloor = answer === "Ground" ? 0 : Number(answer);
    if (isNaN(yourFloor) || yourFloor > collectedData._commTotalFloors) {
      const floorOptions = ["-2", "-1", "Ground", ...Array.from({ length: collectedData._commTotalFloors }, (_, i) => `${i + 1}`)];
      await botSay(`❌ Please select a valid floor from the options.`, floorOptions);
      return;
    }
    const updated = { ...collectedData, _commYourFloor: yourFloor };
    setCollectedData(() => updated);
    const isOffice = COMMERCIAL_OFFICE_IDS.includes(collectedData.propertyTypeId);
    if (isOffice) {
      await botSay("What is the minimum number of seats?");
      setCustomInput({ type: "number", key: "comm_office_seats", placeholder: "Minimum seats..." });
      goTo("comm_office_seats", updated);
    } else {
      goTo("comm_build", updated);
    }
    return;
  }

  // ── Office-only questions ──────────────────────────────────────────────────────

  if (step === "comm_office_seats") {
    if (!answer) return;
    const updated = { ...collectedData, _commOfficeSeats: Number(answer) };
    setCollectedData(() => updated);
    await botSay("What is the minimum number of cabins?");
    setCustomInput({ type: "number", key: "comm_office_cabins", placeholder: "Minimum cabins...", allowZero: true });
    goTo("comm_office_cabins", updated);
    return;
  }

  if (step === "comm_office_cabins") {
    if (!answer) return;
    const updated = { ...collectedData, _commOfficeCabins: Number(answer) };
    setCollectedData(() => updated);
    await botSay("What is the minimum number of meeting rooms?");
    setCustomInput({ type: "number", key: "comm_office_meeting", placeholder: "Minimum meeting rooms...", allowZero: true });
    goTo("comm_office_meeting", updated);
    return;
  }

  if (step === "comm_office_meeting") {
    if (!answer) return;
    const updated = { ...collectedData, _commOfficeMeeting: Number(answer) };
    setCollectedData(() => updated);
    goTo("comm_build", updated);
    return;
  }

  // ── Possession ───────────────────────────────────────────────────────────────

  if (step === "comm_build") {
    const isOffice = COMMERCIAL_OFFICE_IDS.includes(collectedData.propertyTypeId);
    const ex = collectedData.commercialDetails ?? {};
    const areaUnit = collectedData._commAreaUnit ?? ex.builtUpArea?.unit;
    const updated = {
      ...collectedData,
      detailsKey: "commercialDetails",
      commercialDetails: {
        societyName: collectedData._commSociety      ?? ex.societyName,
        ...((collectedData._commOthersType ?? ex.propertyType) && { propertyType: collectedData._commOthersType ?? ex.propertyType }),
        zoneType:    collectedData._commZone         ?? ex.zoneType,
        locationHub: collectedData._commLocationHub  ?? ex.locationHub,
        builtUpArea: collectedData._commBuiltUpValue != null
          ? { value: collectedData._commBuiltUpValue, unit: areaUnit }
          : ex.builtUpArea,
        carpetArea:  collectedData._commCarpetValue != null
          ? { value: collectedData._commCarpetValue, unit: areaUnit }
          : ex.carpetArea,
        ownership:   collectedData._commOwnership    ?? ex.ownership,
        totalFloors: collectedData._commTotalFloors  ?? ex.totalFloors,
        yourFloor:   collectedData._commYourFloor    ?? ex.yourFloor,
        ...(isOffice && {
          minSeats:        collectedData._commOfficeSeats    ?? ex.minSeats,
          minCabins:       collectedData._commOfficeCabins   ?? ex.minCabins,
          minMeetingRooms: collectedData._commOfficeMeeting  ?? ex.minMeetingRooms,
        }),
      },
    };
    ["_commSociety","_commOthersType","_commZone","_commLocationHub","_commAreaUnit","_commBuiltUpValue",
     "_commCarpetValue","_commOwnership","_commTotalFloors","_commYourFloor",
     "_commOfficeSeats","_commOfficeCabins","_commOfficeMeeting"].forEach((k) => delete updated[k]);
    setCollectedData(() => updated);
    goTo("purpose_questions", updated);
    return;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RESIDENTIAL PLOT BRANCH  (plotDetails)
  // ═══════════════════════════════════════════════════════════════════════════

  if (step === "plot_society") {
    if (!answer) {
      await botSay("What is the society or colony name?", [], true);
      return;
    }
    const updated = { ...collectedData, _plotSociety: answer };
    setCollectedData(() => updated);
    await botSay("What unit is the plot area in?", AREA_UNIT_OPTIONS);
    goTo("plot_area_unit", updated);
    return;
  }

  if (step === "plot_area_unit") {
    if (!answer) return;
    const updated = { ...collectedData, _plotAreaUnit: answer };
    setCollectedData(() => updated);
    await botSay("What is the plot area value?");
    setCustomInput({ type: "number", key: "plot_area_value", placeholder: "Plot area value..." });
    goTo("plot_area_value", updated);
    return;
  }

  if (step === "plot_area_value") {
    if (!answer) return;
    const updated = { ...collectedData, _plotAreaValue: Number(answer) };
    setCollectedData(() => updated);
    await botSay("What is the length of the plot in feet?");
    setCustomInput({ type: "number", key: "plot_length", placeholder: "Plot length in feet..." });
    goTo("plot_length", updated);
    return;
  }

  if (step === "plot_length") {
    if (!answer) return;
    const updated = { ...collectedData, _plotLength: Number(answer) };
    setCollectedData(() => updated);
    await botSay("What is the width of the plot in feet?");
    setCustomInput({ type: "number", key: "plot_width", placeholder: "Plot width in feet..." });
    goTo("plot_width", updated);
    return;
  }

  if (step === "plot_width") {
    if (!answer) return;
    const width       = Number(answer);
    const length      = collectedData._plotLength;
    const areaValue   = collectedData._plotAreaValue;
    const unit        = collectedData._plotAreaUnit;
    const rawProduct  = length * width; // always in sqft
    const converted   = unit === "sqyd" ? rawProduct / 9 : unit === "sqmt" ? rawProduct / 10.764 : rawProduct;
    const mismatch    = Math.abs(converted - areaValue) > 1;
    if (mismatch) {
      await botSay(
        `❌ The plot area doesn't match!\n\n` +
        `• You entered area: ${areaValue} ${unit}\n` +
        `• Length × Width = ${length} × ${width} ft = ${converted.toFixed(2)} ${unit}\n\n` +
        `Please re-enter the correct plot area, length, and width.`
      );
      const retry = { ...collectedData };
      delete retry._plotAreaValue;
      delete retry._plotLength;
      setCollectedData(() => retry);
      await botSay("What is the plot area value?");
      setCustomInput({ type: "number", key: "plot_area_value_retry", placeholder: "Plot area value..." });
      goTo("plot_area_value", retry);
      return;
    }
    const ex = collectedData.plotDetails ?? {};
    const updated = {
      ...collectedData,
      detailsKey: "plotDetails",
      plotDetails: {
        societyName: collectedData._plotSociety ?? ex.societyName,
        plotArea:    collectedData._plotAreaValue != null ? { value: areaValue, unit } : ex.plotArea,
        length:      collectedData._plotLength   ?? ex.length,
        width,
      },
    };
    ["_plotSociety", "_plotAreaValue", "_plotAreaUnit", "_plotLength"].forEach((k) => delete updated[k]);
    setCollectedData(() => updated);
    goTo("purpose_questions", updated);
    return;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RESIDENTIAL NON-PLOT BRANCH  (residentialDetails)
  // ═══════════════════════════════════════════════════════════════════════════

  if (step === "res_society") {
    if (!answer) {
      await botSay("What is the society or apartment complex name?", [], true);
      return;
    }
    const updated = { ...collectedData, _resSociety: answer };
    setCollectedData(() => updated);
    await botSay("How many BHK is the property?", BHK_OPTIONS);
    goTo("res_bhk", updated);
    return;
  }

  if (step === "res_bhk") {
    if (!answer) return;
    const updated = { ...collectedData, _resBhk: answer === "1 RK" ? 0 : Number(answer.replace(" BHK", "")) };
    setCollectedData(() => updated);
    await botSay("What unit is the built-up area in?", AREA_UNIT_OPTIONS);
    goTo("res_area_unit", updated);
    return;
  }

  if (step === "res_area_unit") {
    if (!answer) return;
    const updated = { ...collectedData, _resAreaUnit: answer };
    setCollectedData(() => updated);
    await botSay("What is the built-up area value?");
    setCustomInput({ type: "number", key: "res_area_value", placeholder: "Built-up area value..." });
    goTo("res_area_value", updated);
    return;
  }

  if (step === "res_area_value") {
    if (!answer) return;
    const updated = { ...collectedData, _resAreaValue: Number(answer) };
    setCollectedData(() => updated);
    await botSay("What is the furnishing status?", FURNISH_TYPE_OPTIONS);
    goTo("res_furnish", updated);
    return;
  }

  if (step === "res_furnish") {
    if (!answer) return;
    const existing = collectedData.residentialDetails ?? {};
    const updated = {
      ...collectedData,
      _resFurnishType: answer,
      detailsKey: "residentialDetails",
      residentialDetails: {
        societyName: collectedData._resSociety  ?? existing.societyName,
        bhk:         collectedData._resBhk      ?? existing.bhk,
        builtUpArea: collectedData._resAreaValue != null
          ? { value: collectedData._resAreaValue, unit: collectedData._resAreaUnit }
          : existing.builtUpArea,
        furnishType: answer,
        furnishings: [],
        amenities:   [],
      },
    };
    ["_resSociety", "_resBhk", "_resAreaValue", "_resAreaUnit"].forEach((k) => delete updated[k]);
    setCollectedData(() => updated);
    try {
      const faData = await fetchFurnishingsAmenities();
      const msg = answer === "Unfurnished"
        ? "Now let's select the amenities available at this property.\n\nClick the button below to open the selection."
        : "Now let's select the furnishings and amenities available at this property.\n\nClick the button below to open the selection.";
      await botSay(msg);
      setCustomInput({
        type: "furnishamenities",
        key: "res_furnish_amenities",
        furnishType: answer,
        furnishings: faData.furnishings,
        amenities:   faData.amenities,
      });
      const withMeta = { ...updated, _furnishingsMeta: faData.furnishings, _amenitiesMeta: faData.amenities };
      setCollectedData(() => withMeta);
      goTo("res_furnish_amenities", withMeta);
    } catch {
      await botSay("⚠️ Failed to load furnishings & amenities. Please refresh and try again.");
    }
    return;
  }

  if (step === "res_furnish_amenities") {
    if (!answer) return;
    const payload = collectedData._furnishAmenitiesPayload ?? { furnishings: [], amenities: [] };
    const updated = {
      ...collectedData,
      residentialDetails: {
        ...collectedData.residentialDetails,
        furnishings: payload.furnishings,
        amenities:   payload.amenities,
      },
    };
    delete updated._resFurnishType;
    delete updated._furnishAmenitiesPayload;
    setCollectedData(() => updated);
    goTo("purpose_questions", updated);
    return;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PURPOSE QUESTIONS  (sellInfo / rentInfo)
  // ═══════════════════════════════════════════════════════════════════════════

  if (step === "purpose_questions") {
    const isSell = collectedData.listingTypeId === LISTING_TYPE_SELL_ID;
    const isPG   = collectedData.listingTypeId === LISTING_TYPE_PG_ID;
    if (isPG) {
      goTo("ask_images", collectedData);
    } else if (isSell) {
      await botSay("What is the expected sale price? (in ₹)");
      setCustomInput({ type: "number", key: "sell_price", placeholder: "Expected sale price in ₹..." });
      goTo("sell_price", collectedData);
    } else {
      await botSay("What is the monthly rent? (in ₹)");
      setCustomInput({ type: "number", key: "rent_monthly", placeholder: "Monthly rent in ₹..." });
      goTo("rent_monthly", collectedData);
    }
    return;
  }

  // ── Sell flow ─────────────────────────────────────────────────────────────
  if (step === "sell_price") {
    if (!answer) return;
    const updated = { ...collectedData, _sellPrice: Number(answer) };
    setCollectedData(() => updated);
    await botSay("What is the construction status?", CONSTRUCTION_STATUS_OPTIONS);
    goTo("sell_status", updated);
    return;
  }

  if (step === "sell_status") {
    if (!answer) return;
    const status  = CONSTRUCTION_STATUS_MAP[answer];
    const updated = { ...collectedData, _sellStatus: status };
    setCollectedData(() => updated);
    if (status === "ReadyToMove") {
      await botSay("What is the age of the property in years?");
      setCustomInput({ type: "number", key: "sell_age", placeholder: "Age in years...", allowZero: true });
      goTo("sell_age", updated);
    } else {
      await botSay("From which date will it be available?");
      setCustomInput({ type: "date", key: "sell_available_from", minDate: new Date().toISOString().split("T")[0] });
      goTo("sell_available_from", updated);
    }
    return;
  }

  if (step === "sell_age") {
    if (!answer) return;
    const updated = {
      ...collectedData,
      sellInfo: {
        price:              collectedData._sellPrice,
        constructionStatus: collectedData._sellStatus,
        ageOfProperty:      Number(answer),
      },
    };
    ["_sellPrice", "_sellStatus"].forEach((k) => delete updated[k]);
    setCollectedData(() => updated);
    goTo("ask_images", updated);
    return;
  }

  if (step === "sell_available_from") {
    if (!answer) return;
    const updated = {
      ...collectedData,
      sellInfo: {
        price:              collectedData._sellPrice,
        constructionStatus: collectedData._sellStatus,
        availableFrom:      answer,
      },
    };
    ["_sellPrice", "_sellStatus"].forEach((k) => delete updated[k]);
    setCollectedData(() => updated);
    goTo("ask_images", updated);
    return;
  }

  // ── Rent / PG flow ────────────────────────────────────────────────────────
  if (step === "rent_monthly") {
    if (!answer) return;
    const updated = { ...collectedData, _rentMonthly: Number(answer) };
    setCollectedData(() => updated);
    await botSay("From which date is the property available?");
    setCustomInput({ type: "date", key: "rent_available_from", minDate: new Date().toISOString().split("T")[0] });
    goTo("rent_available_from", updated);
    return;
  }

  if (step === "rent_available_from") {
    if (!answer) return;
    const updated = { ...collectedData, _rentAvailableFrom: answer };
    setCollectedData(() => updated);
    await botSay("What is the security deposit?", SECURITY_DEPOSIT_OPTIONS);
    goTo("rent_deposit_type", updated);
    return;
  }

  if (step === "rent_deposit_type") {
    if (!answer) return;
    const depositType = SECURITY_DEPOSIT_MAP[answer];
    if (depositType === "Custom") {
      const updated = { ...collectedData, _depositType: depositType };
      setCollectedData(() => updated);
      await botSay("Please enter the custom security deposit amount (in ₹)");
      setCustomInput({ type: "number", key: "rent_deposit_custom", placeholder: "Custom deposit amount in ₹..." });
      goTo("rent_deposit_custom", updated);
    } else {
      const updated = {
        ...collectedData,
        rentInfo: {
          monthlyRent:     collectedData._rentMonthly,
          availableFrom:   collectedData._rentAvailableFrom,
          securityDeposit: { type: depositType },
        },
      };
      ["_rentMonthly", "_rentAvailableFrom", "_depositType"].forEach((k) => delete updated[k]);
      setCollectedData(() => updated);
      goTo("ask_images", updated);
    }
    return;
  }

  if (step === "rent_deposit_custom") {
    if (!answer) return;
    const updated = {
      ...collectedData,
      rentInfo: {
        monthlyRent:     collectedData._rentMonthly,
        availableFrom:   collectedData._rentAvailableFrom,
        securityDeposit: { type: "Custom", amount: Number(answer) },
      },
    };
    ["_rentMonthly", "_rentAvailableFrom", "_depositType"].forEach((k) => delete updated[k]);
    setCollectedData(() => updated);
    goTo("ask_images", updated);
    return;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // IMAGE UPLOAD
  // ═══════════════════════════════════════════════════════════════════════════

  if (step === "ask_images") {
    await botSay("Would you like to upload images of your property?\n\n📸 You can upload up to 20 images", ["Upload images", "Skip"]);
    goTo("images_choice", collectedData);
    return;
  }

  if (step === "images_choice") {
    if (!answer) return;
    if (answer === "Skip") {
      const updated = { ...collectedData, _images: [] };
      setCollectedData(() => updated);
      goTo("summary", updated);
    } else {
      await botSay("Great! Please upload your images (max 20).\n\nClick the upload area below to select images.");
      setCustomInput({ type: "images", key: "property_images" });
      goTo("images_upload", collectedData);
    }
    return;
  }

  if (step === "images_upload") {
    if (!answer) return;
    const images = collectedData._uploadedImages ?? [];
    const updated = { ...collectedData, _images: images };
    setCollectedData(() => updated);
    await botSay(`✅ ${images.length} image${images.length > 1 ? "s" : ""} uploaded successfully!`);
    goTo("summary", updated);
    return;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════════════════════════════════════

  if (step === "summary") {
    const d = collectedData;
    const details  = d[d.detailsKey]  ?? {};
    const purpose  = d[d.purposeKey ?? "sellInfo"] ?? {};

    // ── format details block ──
    const detailLines = [];
    if (details.societyName)  detailLines.push(`  • Society / Name   : ${details.societyName}`);
    if (details.bhk !== undefined) detailLines.push(`  • BHK              : ${details.bhk === 0 ? "1 RK" : `${details.bhk} BHK`}`);
    if (details.builtUpArea)  detailLines.push(`  • Built-up Area    : ${details.builtUpArea.value} ${details.builtUpArea.unit}`);
    if (details.carpetArea)   detailLines.push(`  • Carpet Area      : ${details.carpetArea.value} ${details.carpetArea.unit}`);
    if (details.plotArea)     detailLines.push(`  • Plot Area        : ${details.plotArea.value} ${details.plotArea.unit}`);
    if (details.length)       detailLines.push(`  • Length           : ${details.length} ft`);
    if (details.width)        detailLines.push(`  • Width            : ${details.width} ft`);
    if (details.furnishType)  detailLines.push(`  • Furnish Type     : ${details.furnishType}`);
    if (details.zoneType)     detailLines.push(`  • Zone Type        : ${details.zoneType}`);
    if (details.locationHub)  detailLines.push(`  • Location Hub     : ${details.locationHub}`);
    if (details.ownership)    detailLines.push(`  • Ownership        : ${details.ownership}`);
    if (details.totalFloors !== undefined) detailLines.push(`  • Total Floors     : ${details.totalFloors}`);
    if (details.yourFloor  !== undefined) detailLines.push(`  • Your Floor       : ${details.yourFloor === 0 ? "Ground" : details.yourFloor}`);
    if (details.minSeats   !== undefined) detailLines.push(`  • Min Seats        : ${details.minSeats}`);
    if (details.minCabins  !== undefined) detailLines.push(`  • Min Cabins       : ${details.minCabins}`);
    if (details.minMeetingRooms !== undefined) detailLines.push(`  • Min Meeting Rooms: ${details.minMeetingRooms}`);
    // furnishings
    if (details.furnishings?.length > 0) {
      detailLines.push(`  • Furnishings      :`);
      details.furnishings.forEach((f, i) => {
        const name = d._furnishingsMeta?.find((x) => x._id === f.furnishingId)?.name ?? f.furnishingId;
        detailLines.push(`      ${i + 1}). ${name}${f.count > 1 ? ` ( ${f.count} )` : ""}`);
      });
    }
    // amenities
    if (details.amenities?.length > 0) {
      detailLines.push(`  • Amenities        :`);
      details.amenities.forEach((a, i) => {
        const name = d._amenitiesMeta?.find((x) => x._id === a.amenityId)?.name ?? a.amenityId;
        detailLines.push(`      ${i + 1}). ${name}`);
      });
    }
    // PG details
    if (details.pgName)       detailLines.push(`  • PG Name          : ${details.pgName}`);
    if (details.pgFor)        detailLines.push(`  • PG For           : ${details.pgFor}`);
    if (details.totalBedsAvailable !== undefined) detailLines.push(`  • Total Beds       : ${details.totalBedsAvailable}`);
    if (details.bestSuitedFor?.length) detailLines.push(`  • Best Suited For  : ${details.bestSuitedFor.join(", ")}`);
    if (details.mealsAvailable !== undefined) detailLines.push(`  • Meals Available  : ${details.mealsAvailable ? "Yes" : "No"}`);
    if (details.meals?.length) detailLines.push(`  • Meals            : ${details.meals.join(", ")}`);
    if (details.noticePeriod  !== undefined) detailLines.push(`  • Notice Period    : ${details.noticePeriod} days`);
    if (details.lockInPeriod  !== undefined) detailLines.push(`  • Lock-in Period   : ${details.lockInPeriod} days`);
    if (details.commonAreas?.length) detailLines.push(`  • Common Areas     : ${details.commonAreas.join(", ")}`);
    if (details.rooms?.length) {
      detailLines.push(`  • Rooms            :`);
      details.rooms.forEach((r, i) => {
        detailLines.push(`      ${i + 1}). ${r.roomType} — ${r.bedsAvailable} beds — ₹${r.rent} rent — ₹${r.securityDeposit} deposit`);
      });
    }

    // ── format purpose block ──
    const purposeLines = [];
    if (purpose.price          !== undefined) purposeLines.push(`  • Sale Price       : ₹${purpose.price.toLocaleString()}`);
    if (purpose.constructionStatus)           purposeLines.push(`  • Construction     : ${purpose.constructionStatus}`);
    if (purpose.ageOfProperty  !== undefined) purposeLines.push(`  • Age of Property  : ${purpose.ageOfProperty} yrs`);
    if (purpose.availableFrom)                purposeLines.push(`  • Available From   : ${purpose.availableFrom}`);
    if (purpose.monthlyRent    !== undefined) purposeLines.push(`  • Monthly Rent     : ₹${purpose.monthlyRent.toLocaleString()}`);
    if (purpose.securityDeposit) {
      const dep = purpose.securityDeposit;
      purposeLines.push(`  • Security Deposit : ${dep.type}${dep.amount ? ` — ₹${dep.amount.toLocaleString()}` : ""}`);
    }

    const purposeLabel = d.purposeKey === "rentInfo" ? "Rent Info" : d.purposeKey === "pgDetails" ? "PG Info" : "Sell Info";

    const msg =
      `✅ All details collected! Please review before submitting.\n\n` +
      `📋 Basic Info :\n` +
      `  • Purpose  : ${d.listingTypeName}\n` +
      `  • Category : ${d.categoryName}\n` +
      `  • Type     : ${d.propertyTypeName}\n` +
      `  • City     : ${d.cityName}\n` +
      `  • Locality : ${d.locality?.address}\n\n` +
      `🏠 Property Details :\n${detailLines.join("\n")}\n\n` +
      `💰 ${purposeLabel} :\n${purposeLines.join("\n")}\n\n` +
      `Ready to submit? 🚀`;

    await botSay(msg, ["Yes, Submit"]);
    goTo("submit", d);
    return;
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  if (step === "submit") {
    if (!answer) return;

    const d = collectedData;
    const images = d._images ?? [];
    const hasImages = images.length > 0;

    const listingPayload = {
      categoryId:                   d.categoryId,
      listingTypeId:                d.listingTypeId,
      propertyTypeId:               d.propertyTypeId,
      cityId:                       d.cityId,
      locality:                     d.locality,
      [d.detailsKey]:               d[d.detailsKey],
      [d.purposeKey ?? "sellInfo"]: d[d.purposeKey ?? "sellInfo"],
    };

    // ── Step 1: Create the property listing ──────────────────────────────
    let propertyId;
    try {
      await botSay("⏳ Submitting your property listing...");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/mixed/property-listings`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(listingPayload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to list property");
      propertyId = data.data?._id;
    } catch (err) {
      await botSay(`⚠️ Failed to list property: ${err.message}\n\nPlease try again after some time.`, ["Retry"]);
      goTo("submit_retry", collectedData);
      return;
    }

    // ── Step 2: Upload images (if any) ───────────────────────────────────
    if (!hasImages) {
      await botSay("🎉 Your property has been listed successfully!");
      return;
    }

    // Show animated loading — keep saying dots while media uploads
    await botSay("📸 Uploading your images, please wait...");

    try {
      const formData = new FormData();
      formData.append("propertyId", propertyId);
      images.forEach((file) => formData.append("images", file));

      const mediaRes = await fetch(`${import.meta.env.VITE_API_URL}/api/mixed/property-listings/media`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const mediaData = await mediaRes.json();
      if (!mediaRes.ok) throw new Error(mediaData.message || "Image upload failed");
      await botSay(`🎉 ${mediaData.message}`);
    } catch (err) {
      await botSay(`⚠️ Property listed but image upload failed: ${err.message}\n\nYou can try uploading images later.`);
    }
    return;
  }

  // ── Edit Last Question ────────────────────────────────────────────────────
  if (step === "edit_last") {
    const d = collectedData;
    const isSell = d.listingTypeId === LISTING_TYPE_SELL_ID;
    const isPG   = d.listingTypeId === LISTING_TYPE_PG_ID;
    if (isPG) {
      // last PG question was rooms
      await botSay("What is the room type?", PG_ROOM_TYPE_OPTIONS);
      goTo("pg_room_type", d);
    } else if (isSell) {
      // restore temp keys from sellInfo so sell_age / sell_available_from can rebuild correctly
      const restored = {
        ...d,
        _sellPrice:  d.sellInfo?.price,
        _sellStatus: d.sellInfo?.constructionStatus,
      };
      setCollectedData(() => restored);
      const status = d.sellInfo?.constructionStatus;
      if (status === "ReadyToMove") {
        await botSay("What is the age of the property in years?");
        setCustomInput({ type: "number", key: "sell_age_edit", placeholder: "Age in years...", allowZero: true });
        goTo("sell_age", restored);
      } else {
        await botSay("From which date will it be available?");
        setCustomInput({ type: "date", key: "sell_available_from_edit", minDate: new Date().toISOString().split("T")[0] });
        goTo("sell_available_from", restored);
      }
    } else {
      // rent — restore temp keys from rentInfo so rent_deposit_type can rebuild correctly
      const restored = {
        ...d,
        _rentMonthly:      d.rentInfo?.monthlyRent,
        _rentAvailableFrom: d.rentInfo?.availableFrom,
      };
      setCollectedData(() => restored);
      await botSay("What is the security deposit?", SECURITY_DEPOSIT_OPTIONS);
      goTo("rent_deposit_type", restored);
    }
    return;
  }

  if (step === "submit_retry") {
    if (!answer) return;
    goTo("summary", collectedData);
    return;
  }
}
