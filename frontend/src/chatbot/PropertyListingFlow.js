import {
  LISTING_MODE_OPTIONS,
  PURPOSE_KEY_MAP,
  CONSTRUCTION_STATUS_OPTIONS, CONSTRUCTION_STATUS_MAP,
  SECURITY_DEPOSIT_OPTIONS, SECURITY_DEPOSIT_MAP,
  AREA_UNIT_OPTIONS, BHK_OPTIONS, FURNISH_TYPE_OPTIONS,
  RESIDENTIAL_PLOT_IDS, COMMERCIAL_PLOT_IDS, COMMERCIAL_OFFICE_IDS,
  CATEGORY_RESIDENTIAL_ID, CATEGORY_COMMERCIAL_ID,
  LISTING_TYPE_SELL_ID, LISTING_TYPE_PG_ID,
  PG_FOR_OPTIONS, PG_SUITED_FOR_OPTIONS, PG_MEALS_OPTIONS,
  PG_COMMON_AREA_OPTIONS, PG_ROOM_TYPE_OPTIONS, PG_ROOM_TYPE_MAP,
  COMMERCIAL_ZONE_TYPE_OPTIONS, COMMERCIAL_LOCATION_HUB_OPTIONS,
  COMMERCIAL_OWNERSHIP_OPTIONS, COMMERCIAL_POSSESSION_OPTIONS, COMMERCIAL_POSSESSION_MAP,
} from "./chatbotConstants";
import { fetchActivePurposes, fetchActiveCategories, fetchPropertyTypes, fetchActiveCities } from "./chatbotApi";

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
      const fresh = {};
      setCollectedData(() => fresh);
      await botSay("Are you listing a Property or a Project?", LISTING_MODE_OPTIONS);
      goTo("listing_mode", fresh);
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
    const updated = { ...collectedData, propertyTypeId: matched?.value ?? null, propertyTypeName: answer };
    setCollectedData(() => updated);
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
    const isCommPlot   = COMMERCIAL_PLOT_IDS.includes(updated.propertyTypeId);
    const isPG         = updated.listingTypeId === LISTING_TYPE_PG_ID;
    if (isResidential && isPG) {
      goTo("pg_name", updated);
    } else if (isResidential && isPlot) {
      goTo("plot_society", updated);
    } else if (isResidential && !isPlot) {
      goTo("res_society", updated);
    } else if (isCommercial && isCommPlot) {
      await botSay("🚧 Commercial plot listing is coming soon! Stay tuned.");
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
    await botSay("What is the total number of beds available?", [], true);
    goTo("pg_total_beds", updated);
    return;
  }

  if (step === "pg_total_beds") {
    if (!answer) return;
    if (isNaN(answer) || Number(answer) <= 0) {
      await botSay("Please enter a valid number of beds.", [], true);
      return;
    }
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
      await botSay("What is the notice period in days? (e.g. 30)", [], true);
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
    await botSay("What is the notice period in days? (e.g. 30)", [], true);
    goTo("pg_notice_period", updated);
    return;
  }

  if (step === "pg_notice_period") {
    if (!answer) return;
    if (isNaN(answer) || Number(answer) < 0) {
      await botSay("Please enter a valid number of days.", [], true);
      return;
    }
    const updated = { ...collectedData, _pgNoticePeriod: Number(answer) };
    setCollectedData(() => updated);
    await botSay("What is the lock-in period in days? (e.g. 90)", [], true);
    goTo("pg_lockin_period", updated);
    return;
  }

  if (step === "pg_lockin_period") {
    if (!answer) return;
    if (isNaN(answer) || Number(answer) < 0) {
      await botSay("Please enter a valid number of days.", [], true);
      return;
    }
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
    const updated = { ...collectedData, _pgRoomType: PG_ROOM_TYPE_MAP[answer] ?? answer };
    setCollectedData(() => updated);
    await botSay("How many beds are available in this room type?", [], true);
    goTo("pg_room_beds", updated);
    return;
  }

  if (step === "pg_room_beds") {
    if (!answer) return;
    if (isNaN(answer) || Number(answer) <= 0) {
      await botSay("Please enter a valid number of beds.", [], true);
      return;
    }
    const updated = { ...collectedData, _pgRoomBeds: Number(answer) };
    setCollectedData(() => updated);
    await botSay("What is the rent for this room type? (in ₹, e.g. 8000)", [], true);
    goTo("pg_room_rent", updated);
    return;
  }

  if (step === "pg_room_rent") {
    if (!answer) return;
    if (isNaN(answer) || Number(answer) <= 0) {
      await botSay("Please enter a valid rent amount.", [], true);
      return;
    }
    const updated = { ...collectedData, _pgRoomRent: Number(answer) };
    setCollectedData(() => updated);
    await botSay("What is the security deposit for this room type? (in ₹, e.g. 16000)", [], true);
    goTo("pg_room_deposit", updated);
    return;
  }

  if (step === "pg_room_deposit") {
    if (!answer) return;
    if (isNaN(answer) || Number(answer) < 0) {
      await botSay("Please enter a valid deposit amount.", [], true);
      return;
    }
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
      const updated = {
        ...collectedData,
        detailsKey: "pgDetails",
        pgDetails: {
          pgName:           collectedData._pgName,
          pgFor:            collectedData._pgFor,
          totalBedsAvailable: collectedData._pgTotalBeds,
          bestSuitedFor:    collectedData._pgSuitedFor,
          mealsAvailable:   collectedData._pgMealsAvailable,
          meals:            collectedData._pgMeals ?? [],
          noticePeriod:     collectedData._pgNoticePeriod,
          lockInPeriod:     collectedData._pgLockinPeriod,
          commonAreas:      collectedData._pgCommonAreas,
          rooms:            collectedData._pgRooms,
        },
      };
      ["_pgName","_pgFor","_pgTotalBeds","_pgSuitedFor","_pgMealsAvailable","_pgMeals",
       "_pgNoticePeriod","_pgLockinPeriod","_pgCommonAreas","_pgRooms"].forEach((k) => delete updated[k]);
      setCollectedData(() => updated);
      goTo("summary", updated);
    }
    return;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // COMMERCIAL BRANCH  (commercialDetails)
  // ═══════════════════════════════════════════════════════════════════════════

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
    await botSay("What unit is the built-up area in?", AREA_UNIT_OPTIONS);
    goTo("comm_builtup_unit", updated);
    return;
  }

  if (step === "comm_builtup_unit") {
    if (!answer) return;
    const updated = { ...collectedData, _commBuiltUpUnit: answer };
    setCollectedData(() => updated);
    await botSay("What is the built-up area value? (e.g. 5000)", [], true);
    goTo("comm_builtup_value", updated);
    return;
  }

  if (step === "comm_builtup_value") {
    if (!answer) return;
    if (isNaN(answer) || Number(answer) <= 0) {
      await botSay("Please enter a valid number for built-up area.", [], true);
      return;
    }
    const updated = { ...collectedData, _commBuiltUpValue: Number(answer) };
    setCollectedData(() => updated);
    await botSay("What unit is the carpet area in?", AREA_UNIT_OPTIONS);
    goTo("comm_carpet_unit", updated);
    return;
  }

  if (step === "comm_carpet_unit") {
    if (!answer) return;
    const updated = { ...collectedData, _commCarpetUnit: answer };
    setCollectedData(() => updated);
    await botSay("What is the carpet area value? (e.g. 4200)", [], true);
    goTo("comm_carpet_value", updated);
    return;
  }

  if (step === "comm_carpet_value") {
    if (!answer) return;
    if (isNaN(answer) || Number(answer) <= 0) {
      await botSay("Please enter a valid number for carpet area.", [], true);
      return;
    }
    if (Number(answer) > collectedData._commBuiltUpValue) {
      await botSay(`❌ Carpet area cannot be greater than built-up area (${collectedData._commBuiltUpValue} ${collectedData._commBuiltUpUnit}).\n\nPlease enter a valid carpet area.`, [], true);
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
    await botSay("How many total floors does the building have? (e.g. 10)", [], true);
    goTo("comm_total_floors", updated);
    return;
  }

  if (step === "comm_total_floors") {
    if (!answer) return;
    if (isNaN(answer) || Number(answer) <= 0) {
      await botSay("Please enter a valid number of floors.", [], true);
      return;
    }
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
      await botSay("What is the minimum number of seats? (e.g. 20)", [], true);
      goTo("comm_office_seats", updated);
    } else {
      await botSay("What is the possession status?", COMMERCIAL_POSSESSION_OPTIONS);
      goTo("comm_possession", updated);
    }
    return;
  }

  // ── Office-only questions ──────────────────────────────────────────────────────

  if (step === "comm_office_seats") {
    if (!answer) return;
    if (isNaN(answer) || Number(answer) <= 0) {
      await botSay("Please enter a valid number of seats.", [], true);
      return;
    }
    const updated = { ...collectedData, _commOfficeSeats: Number(answer) };
    setCollectedData(() => updated);
    await botSay("What is the minimum number of cabins? (e.g. 5)", [], true);
    goTo("comm_office_cabins", updated);
    return;
  }

  if (step === "comm_office_cabins") {
    if (!answer) return;
    if (isNaN(answer) || Number(answer) < 0) {
      await botSay("Please enter a valid number of cabins.", [], true);
      return;
    }
    const updated = { ...collectedData, _commOfficeCabins: Number(answer) };
    setCollectedData(() => updated);
    await botSay("What is the minimum number of meeting rooms? (e.g. 2)", [], true);
    goTo("comm_office_meeting", updated);
    return;
  }

  if (step === "comm_office_meeting") {
    if (!answer) return;
    if (isNaN(answer) || Number(answer) < 0) {
      await botSay("Please enter a valid number of meeting rooms.", [], true);
      return;
    }
    const updated = { ...collectedData, _commOfficeMeeting: Number(answer) };
    setCollectedData(() => updated);
    await botSay("What is the possession status?", COMMERCIAL_POSSESSION_OPTIONS);
    goTo("comm_possession", updated);
    return;
  }

  // ── Possession ───────────────────────────────────────────────────────────────

  if (step === "comm_possession") {
    if (!answer) return;
    const status  = COMMERCIAL_POSSESSION_MAP[answer];
    const updated = { ...collectedData, _commPossessionStatus: status };
    setCollectedData(() => updated);
    if (status === "ReadyToMove") {
      await botSay("What is the age of the property in years? (e.g. 3)", [], true);
      goTo("comm_possession_age", updated);
    } else {
      await botSay("From which date will it be available? (e.g. 2026-06-01)", [], true);
      goTo("comm_possession_date", updated);
    }
    return;
  }

  if (step === "comm_possession_age") {
    if (!answer) return;
    if (isNaN(answer) || Number(answer) < 0) {
      await botSay("Please enter a valid age in years.", [], true);
      return;
    }
    const isOffice = COMMERCIAL_OFFICE_IDS.includes(collectedData.propertyTypeId);
    const updated  = { ...collectedData, _commPossessionAge: Number(answer) };
    setCollectedData(() => updated);
    goTo("comm_build", updated);
    return;
  }

  if (step === "comm_possession_date") {
    if (!answer) return;
    const updated = { ...collectedData, _commPossessionDate: answer };
    setCollectedData(() => updated);
    goTo("comm_build", updated);
    return;
  }

  if (step === "comm_build") {
    const isOffice   = COMMERCIAL_OFFICE_IDS.includes(collectedData.propertyTypeId);
    const possession = collectedData._commPossessionStatus === "ReadyToMove"
      ? { status: "ReadyToMove", ageOfProperty: collectedData._commPossessionAge }
      : { status: "UnderConstruction", availableFrom: collectedData._commPossessionDate };
    const updated = {
      ...collectedData,
      detailsKey: "commercialDetails",
      commercialDetails: {
        societyName: collectedData._commSociety,
        possession,
        zoneType:    collectedData._commZone,
        locationHub: collectedData._commLocationHub,
        builtUpArea: { value: collectedData._commBuiltUpValue, unit: collectedData._commBuiltUpUnit },
        carpetArea:  { value: collectedData._commCarpetValue,  unit: collectedData._commCarpetUnit },
        ownership:   collectedData._commOwnership,
        totalFloors: collectedData._commTotalFloors,
        yourFloor:   collectedData._commYourFloor,
        ...(isOffice && {
          minSeats:        collectedData._commOfficeSeats,
          minCabins:       collectedData._commOfficeCabins,
          minMeetingRooms: collectedData._commOfficeMeeting,
        }),
      },
    };
    ["_commSociety","_commZone","_commLocationHub","_commBuiltUpUnit","_commBuiltUpValue",
     "_commCarpetUnit","_commCarpetValue","_commOwnership","_commTotalFloors","_commYourFloor",
     "_commOfficeSeats","_commOfficeCabins","_commOfficeMeeting",
     "_commPossessionStatus","_commPossessionAge","_commPossessionDate"].forEach((k) => delete updated[k]);
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
    await botSay("What is the plot area value? (e.g. 2400)", [], true);
    goTo("plot_area_value", updated);
    return;
  }

  if (step === "plot_area_value") {
    if (!answer) return;
    if (isNaN(answer) || Number(answer) <= 0) {
      await botSay("Please enter a valid number for plot area.", [], true);
      return;
    }
    const updated = { ...collectedData, _plotAreaValue: Number(answer) };
    setCollectedData(() => updated);
    await botSay("What is the length of the plot in feet?", [], true);
    goTo("plot_length", updated);
    return;
  }

  if (step === "plot_length") {
    if (!answer) return;
    if (isNaN(answer) || Number(answer) <= 0) {
      await botSay("Please enter a valid number for length.", [], true);
      return;
    }
    const updated = { ...collectedData, _plotLength: Number(answer) };
    setCollectedData(() => updated);
    await botSay("What is the width of the plot in feet?", [], true);
    goTo("plot_width", updated);
    return;
  }

  if (step === "plot_width") {
    if (!answer) return;
    if (isNaN(answer) || Number(answer) <= 0) {
      await botSay("Please enter a valid number for width.", [], true);
      return;
    }
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
      await botSay("What is the plot area value? (e.g. 2400)", [], true);
      goTo("plot_area_value", retry);
      return;
    }
    const updated = {
      ...collectedData,
      detailsKey: "plotDetails",
      plotDetails: {
        societyName: collectedData._plotSociety,
        plotArea:    { value: areaValue, unit },
        length,
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
    await botSay("What is the built-up area value? (e.g. 1200)", [], true);
    goTo("res_area_value", updated);
    return;
  }

  if (step === "res_area_value") {
    if (!answer) return;
    if (isNaN(answer) || Number(answer) <= 0) {
      await botSay("Please enter a valid number for built-up area.", [], true);
      return;
    }
    const updated = { ...collectedData, _resAreaValue: Number(answer) };
    setCollectedData(() => updated);
    await botSay("What is the furnishing status?", FURNISH_TYPE_OPTIONS);
    goTo("res_furnish", updated);
    return;
  }

  if (step === "res_furnish") {
    if (!answer) return;
    const updated = {
      ...collectedData,
      detailsKey: "residentialDetails",
      residentialDetails: {
        societyName: collectedData._resSociety,
        bhk:         collectedData._resBhk,
        builtUpArea: { value: collectedData._resAreaValue, unit: collectedData._resAreaUnit },
        furnishType: answer,
        furnishings: [],
        amenities:   [],
      },
    };
    ["_resSociety", "_resBhk", "_resAreaValue", "_resAreaUnit"].forEach((k) => delete updated[k]);
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
      goTo("summary", collectedData);
    } else if (isSell) {
      await botSay("What is the expected sale price? (in ₹, e.g. 8500000)", [], true);
      goTo("sell_price", collectedData);
    } else {
      await botSay("What is the monthly rent? (in ₹, e.g. 15000)", [], true);
      goTo("rent_monthly", collectedData);
    }
    return;
  }

  // ── Sell flow ─────────────────────────────────────────────────────────────
  if (step === "sell_price") {
    if (!answer) return;
    if (isNaN(answer) || Number(answer) <= 0) {
      await botSay("Please enter a valid price amount.", [], true);
      return;
    }
    const updated = { ...collectedData, _sellPrice: Number(answer) };
    setCollectedData(() => updated);
    await botSay("What is the construction status?", CONSTRUCTION_STATUS_OPTIONS);
    goTo("sell_status", updated);
    return;
  }

  if (step === "sell_status") {
    if (!answer) return;
    const updated = {
      ...collectedData,
      sellInfo: {
        price:              collectedData._sellPrice,
        constructionStatus: CONSTRUCTION_STATUS_MAP[answer],
      },
    };
    delete updated._sellPrice;
    setCollectedData(() => updated);
    goTo("summary", updated);
    return;
  }

  // ── Rent / PG flow ────────────────────────────────────────────────────────
  if (step === "rent_monthly") {
    if (!answer) return;
    if (isNaN(answer) || Number(answer) <= 0) {
      await botSay("Please enter a valid monthly rent amount.", [], true);
      return;
    }
    const updated = { ...collectedData, _rentMonthly: Number(answer) };
    setCollectedData(() => updated);
    await botSay("From which date is the property available? (e.g. 2025-08-01)", [], true);
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
      await botSay("Please enter the custom security deposit amount (in ₹):", [], true);
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
      goTo("summary", updated);
    }
    return;
  }

  if (step === "rent_deposit_custom") {
    if (!answer) return;
    if (isNaN(answer) || Number(answer) <= 0) {
      await botSay("Please enter a valid deposit amount.", [], true);
      return;
    }
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
    goTo("summary", updated);
    return;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════════════════════════════════════

  if (step === "summary") {
    const d = collectedData;
    const detailsObj = d[d.detailsKey];
    const purposeObj = d[d.purposeKey ?? "sellInfo"];
    await botSay(
      `✅ All details collected!\n\n` +
      `• Purpose: ${d.listingTypeName}\n` +
      `• Category: ${d.categoryName}\n` +
      `• Type: ${d.propertyTypeName}\n` +
      `• City: ${d.cityName}\n` +
      `• Locality: ${d.locality?.address}\n` +
      `• Details: ${JSON.stringify(detailsObj, null, 2)}\n` +
      `• ${d.purposeKey ?? "sellInfo"}: ${JSON.stringify(purposeObj, null, 2)}\n\n` +
      `Ready to submit? 🚀`,
      ["Yes, Submit", "No, Cancel"]
    );
    goTo("submit", collectedData);
    return;
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  if (step === "submit") {
    if (!answer) return;
    if (answer === "No, Cancel") {
      await botSay("No problem! Your progress has been saved. You can close this window.");
      return;
    }
    const d = collectedData;
    const payload = {
      categoryId:                    d.categoryId,
      listingTypeId:                 d.listingTypeId,
      propertyTypeId:                d.propertyTypeId,
      cityId:                        d.cityId,
      locality:                      d.locality,
      [d.detailsKey]:                d[d.detailsKey],
      [d.purposeKey ?? "sellInfo"]:  d[d.purposeKey ?? "sellInfo"],
    };
    await botSay("Submitting your listing...");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/properties/list`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Submission failed");
      await botSay("🎉 Your property has been listed successfully! Our team will review and publish it within 24 hours.");
    } catch (err) {
      await botSay(`⚠️ Failed to submit: ${err.message}\n\nPlease try again.`, ["Retry"]);
      goTo("submit_retry", collectedData);
    }
    return;
  }

  if (step === "submit_retry") {
    if (!answer) return;
    goTo("summary", collectedData);
    return;
  }
}
