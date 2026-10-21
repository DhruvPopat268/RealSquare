import {
  LISTING_MODE_OPTIONS,
  PURPOSE_KEY_MAP,
  CONSTRUCTION_STATUS_OPTIONS, CONSTRUCTION_STATUS_MAP,
  SECURITY_DEPOSIT_OPTIONS, SECURITY_DEPOSIT_MAP,
  AREA_UNIT_OPTIONS, BHK_OPTIONS,
  RESIDENTIAL_PLOT_IDS, COMMERCIAL_PLOT_IDS, COMMERCIAL_OFFICE_IDS, COMMERCIAL_OTHERS_IDS,
  COMMERCIAL_COWORKING_SPACE_ID,
  CATEGORY_RESIDENTIAL_ID, CATEGORY_COMMERCIAL_ID,
  LISTING_TYPE_SELL_ID, LISTING_TYPE_RENT_ID, LISTING_TYPE_PG_ID,
  PG_ROOM_TYPE_OPTIONS,
} from "./chatbotConstants";
import {
  fetchActivePurposes,
  fetchActiveCategories,
  fetchPropertyTypes,
  fetchVirtualSpaceBenefits,
} from "./chatbotApi";
import api from "../utils/axiosInterceptor";

const COWORKING_WORKSPACE_TYPES = ["Hall", "Cabins", "Virtual Space"];

function getAvailableCoworkingWorkspaceTypes(workspaces = []) {
  const addedTypes = new Set(
    workspaces.map((workspace) => {
      if (workspace.type === "Cabin" || workspace.type === "cabin") return "Cabins";
      if (workspace.type === "hall") return "Hall";
      if (workspace.type === "virtualSpace") return "Virtual Space";
      return workspace.type;
    }),
  );

  return COWORKING_WORKSPACE_TYPES.filter((type) => !addedTypes.has(type));
}

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
      const propertyTypes = await fetchPropertyTypes(matched?.value);
      const types = matched?.value === CATEGORY_COMMERCIAL_ID && collectedData.listingTypeId !== LISTING_TYPE_RENT_ID
        ? propertyTypes.filter((type) => type.value !== COMMERCIAL_COWORKING_SPACE_ID)
        : propertyTypes;
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
    const updated = { ...collectedData, cityName: answer };
    setCollectedData(() => updated);
    await botSay(`Perfect! Now, what's the exact locality or address in ${answer}?`);
    setCustomInput({ type: "places", mode: "locality", cityName: answer, placeholder: `Search locality in ${answer}...` });
    goTo("locality", updated);
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
    const isCommercial  = updated.categoryId === CATEGORY_COMMERCIAL_ID;
    const isCommPlot    = COMMERCIAL_PLOT_IDS.includes(updated.propertyTypeId);
    const isPG          = updated.listingTypeId === LISTING_TYPE_PG_ID;
    const isCoworking   = updated.propertyTypeId === COMMERCIAL_COWORKING_SPACE_ID
      && updated.listingTypeId === LISTING_TYPE_RENT_ID;

    if (isResidential && isPG) {
      goTo("pg_name", updated);
    } else if (isResidential && isPlot) {
      goTo("plot_area_unit", updated);
    } else if (isResidential && !isPlot) {
      goTo("res_bhk", updated);
    } else if (isCommercial && isCoworking) {
      await botSay("Which floor is the coworking space on? (Use -1 for underground, 0 for ground floor, and 1 or higher for floors above ground.)", [], true);
      goTo("coworking_floor", { ...updated, _coworkingWorkspaces: [] });
    } else if (isCommercial && isCommPlot) {
      goTo("comm_plot_area_unit", updated);
    } else if (isCommercial) {
      goTo("comm_builtup_unit", updated);
    } else {
      await botSay("🚧 This property type is coming soon!");
    }
    return;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PG BRANCH
  // ═══════════════════════════════════════════════════════════════════════════

  if (step === "pg_name") {
    if (!answer) {
      await botSay("What is the name of your PG?", [], true);
      return;
    }
    const updated = { ...collectedData, _pgName: answer };
    setCollectedData(() => updated);
    await botSay("What is the total number of beds available?");
    setCustomInput({ type: "number", key: "pg_total_beds", placeholder: "Total beds available..." });
    goTo("pg_total_beds", updated);
    return;
  }

  if (step === "pg_total_beds") {
    if (!answer) return;
    const updated = { ...collectedData, _pgTotalBeds: Number(answer), _pgRooms: [] };
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
      roomType:        collectedData._pgRoomType,
      bedsAvailable:   collectedData._pgRoomBeds,
      rent:            collectedData._pgRoomRent,
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
          pgName:             collectedData._pgName        ?? ex.pgName,
          totalBedsAvailable: collectedData._pgTotalBeds   ?? ex.totalBedsAvailable,
          rooms:              collectedData._pgRooms       ?? ex.rooms,
        },
      };
      ["_pgName", "_pgTotalBeds", "_pgRooms"].forEach((k) => delete updated[k]);
      setCollectedData(() => updated);
      goTo("ask_images", updated);
    }
    return;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RESIDENTIAL PLOT BRANCH
  // ═══════════════════════════════════════════════════════════════════════════

  if (step === "plot_area_unit") {
    if (!answer) {
      await botSay("What unit is the plot area in?", AREA_UNIT_OPTIONS);
      return;
    }
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
    const width      = Number(answer);
    const length     = collectedData._plotLength;
    const areaValue  = collectedData._plotAreaValue;
    const unit       = collectedData._plotAreaUnit;
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
        plotArea: collectedData._plotAreaValue != null ? { value: areaValue, unit } : ex.plotArea,
        length:   collectedData._plotLength ?? ex.length,
        width,
      },
    };
    ["_plotAreaValue", "_plotAreaUnit", "_plotLength"].forEach((k) => delete updated[k]);
    setCollectedData(() => updated);
    goTo("purpose_questions", updated);
    return;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RESIDENTIAL NON-PLOT BRANCH
  // ═══════════════════════════════════════════════════════════════════════════

  if (step === "res_bhk") {
    if (!answer) {
      await botSay("How many BHK is the property?", BHK_OPTIONS);
      return;
    }
    const updated = {
      ...collectedData,
      detailsKey: "residentialDetails",
      residentialDetails: {
        ...(collectedData.residentialDetails ?? {}),
        bhk: answer === "1 RK" ? 0 : Number(answer.replace(" BHK", "")),
      },
    };
    setCollectedData(() => updated);
    goTo("purpose_questions", updated);
    return;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // COMMERCIAL PLOT BRANCH
  // ═══════════════════════════════════════════════════════════════════════════

  if (step === "comm_plot_area_unit") {
    if (!answer) {
      await botSay("What unit is the plot area in?", AREA_UNIT_OPTIONS);
      return;
    }
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
    const ex = collectedData.commercialDetails ?? {};
    const updated = {
      ...collectedData,
      detailsKey: "commercialDetails",
      commercialDetails: {
        plotArea: collectedData._commPlotAreaValue != null
          ? { value: areaValue, unit }
          : ex.plotArea,
        length:   collectedData._commPlotLength ?? ex.length,
        width,
      },
    };
    ["_commPlotAreaUnit", "_commPlotAreaValue", "_commPlotLength"].forEach((k) => delete updated[k]);
    setCollectedData(() => updated);
    goTo("purpose_questions", updated);
    return;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // COMMERCIAL NON-PLOT BRANCH (Office / Shop / Building / Others)
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

  // COWORKING SPACE BRANCH (Rent listings only)
  if (step === "coworking_floor") {
    if (!answer?.trim()) return;
    const updated = { ...collectedData, _coworkingFloor: answer.trim() };
    setCollectedData(() => updated);
    await botSay(
      "What type of workspace would you like to add?",
      getAvailableCoworkingWorkspaceTypes(updated._coworkingWorkspaces),
    );
    goTo("coworking_workspace_type", updated);
    return;
  }

  if (step === "coworking_workspace_type") {
    if (!answer) return;

    const availableTypes = getAvailableCoworkingWorkspaceTypes(
      collectedData._coworkingWorkspaces,
    );
    if (!availableTypes.includes(answer)) {
      if (availableTypes.length) {
        await botSay("Choose a workspace type that has not been added yet:", availableTypes);
        goTo("coworking_workspace_type", collectedData);
      } else {
        await botSay("All workspace types have been added. Choose Done to continue.", ["Done"]);
        goTo("coworking_workspace_more", collectedData);
      }
      return;
    }

    if (answer === "Virtual Space") {
      if (collectedData._coworkingWorkspaces?.some((workspace) => workspace.type === "Virtual Space")) {
        await botSay("Virtual Space has already been added. Choose Done to continue.", ["Done"]);
        goTo("coworking_workspace_more", collectedData);
        return;
      }
      try {
        const masters = await fetchVirtualSpaceBenefits();
        const benefitGroups = masters.filter(
          (item) => item.isActive !== false && item.benefits?.length,
        );
        if (!benefitGroups.length) {
          await botSay(
            "Virtual Space benefits are not configured yet. Choose another workspace type.",
            getAvailableCoworkingWorkspaceTypes(collectedData._coworkingWorkspaces),
          );
          return;
        }
        const updated = {
          ...collectedData,
          _virtualSpaceBenefitGroups: benefitGroups,
        };
        setCollectedData(() => updated);
        await botSay(
          "Choose each benefit you will provide:",
        );
        setCustomInput({
          type: "virtualSpaceBenefits",
          key: "coworking_virtual_space_benefits",
          groups: benefitGroups,
        });
        goTo("coworking_virtual_space_benefits", updated);
      } catch {
        await botSay(
          "Could not load virtual space benefits. Please try again or choose another workspace type.",
          getAvailableCoworkingWorkspaceTypes(collectedData._coworkingWorkspaces),
        );
      }
      return;
    }
    if (answer !== "Hall" && answer !== "Cabins") return;
    if (answer === "Hall" && collectedData._coworkingWorkspaces?.some((workspace) => workspace.type === "Hall")) {
      await botSay("Hall has already been added. Choose Done to continue.", ["Done"]);
      goTo("coworking_workspace_more", collectedData);
      return;
    }
    const updated = { ...collectedData, _coworkingPendingType: answer };
    setCollectedData(() => updated);
    if (answer === "Hall") {
      await botSay("How many seats are available in the hall?");
      setCustomInput({ type: "number", key: "coworking_hall_seats", placeholder: "Number of seats...", min: 0 });
      goTo("coworking_hall_seats", updated);
    } else {
      await botSay("How many cabins are available?");
      setCustomInput({ type: "number", key: "coworking_cabin_count", placeholder: "Number of cabins...", min: 0 });
      goTo("coworking_cabin_count", updated);
    }
    return;
  }

  if (step === "coworking_virtual_space_benefits") {
    const benefits = collectedData._coworkingVirtualSpaceBenefits ?? [];
    const benefitGroups = collectedData._virtualSpaceBenefitGroups ?? [];
    const availableById = new Map(
      benefitGroups.map((group) => [group._id, group]),
    );
    if (
      !benefits.length ||
      benefits.some(
        (group) =>
          !availableById.has(group._id) ||
          !group.benefits?.length ||
          group.benefits.some(
            (benefit) => !availableById.get(group._id).benefits.includes(benefit),
          ),
      )
    ) {
      return;
    }
    await botSay("What is the monthly rent for the virtual space? (in ₹)");
    setCustomInput({
      type: "number",
      key: "coworking_virtual_space_rent",
      placeholder: "Monthly rent in ₹...",
      min: 0,
    });
    goTo("coworking_virtual_space_rent", collectedData);
    return;
  }

  if (step === "coworking_virtual_space_rent") {
    if (answer === "" || !Number.isFinite(Number(answer)) || Number(answer) <= 0) {
      return;
    }
    const entry = {
      type: "Virtual Space",
      monthlyRent: Number(answer),
      benefits: collectedData._coworkingVirtualSpaceBenefits ?? [],
    };
    const updated = {
      ...collectedData,
      _coworkingWorkspaces: [...(collectedData._coworkingWorkspaces ?? []), entry],
    };
    delete updated._coworkingVirtualSpaceBenefits;
    delete updated._virtualSpaceBenefitGroups;
    setCollectedData(() => updated);
    const availableTypes = getAvailableCoworkingWorkspaceTypes(
      updated._coworkingWorkspaces,
    );
    await botSay(
      availableTypes.length
        ? "Virtual Space added. Would you like to add another workspace?"
        : "Virtual Space added. All workspace types have been added.",
      availableTypes.length ? ["Add another workspace", "Done"] : ["Done"],
    );
    goTo("coworking_workspace_more", updated);
    return;
  }

  if (step === "coworking_hall_seats") {
    if (!answer || Number(answer) <= 0) return;
    const updated = { ...collectedData, _coworkingPendingSeatCount: Number(answer) };
    setCollectedData(() => updated);
    await botSay("What is the monthly rent per seat in the hall? (in ₹)");
    setCustomInput({ type: "number", key: "coworking_hall_rent", placeholder: "Monthly rent per seat in ₹...", min: 0 });
    goTo("coworking_hall_rent", updated);
    return;
  }

  if (step === "coworking_hall_rent") {
    if (!answer || Number(answer) <= 0) return;
    const entry = {
      type: "Hall",
      seatCount: collectedData._coworkingPendingSeatCount,
      rentPerSeatMonthly: Number(answer),
    };
    const updated = {
      ...collectedData,
      _coworkingWorkspaces: [...(collectedData._coworkingWorkspaces ?? []), entry],
    };
    delete updated._coworkingPendingType;
    delete updated._coworkingPendingSeatCount;
    setCollectedData(() => updated);
    const availableTypes = getAvailableCoworkingWorkspaceTypes(
      updated._coworkingWorkspaces,
    );
    await botSay(
      availableTypes.length
        ? "Hall added. Would you like to add another workspace?"
        : "Hall added. All workspace types have been added.",
      availableTypes.length ? ["Add another workspace", "Done"] : ["Done"],
    );
    goTo("coworking_workspace_more", updated);
    return;
  }

  if (step === "coworking_cabin_count") {
    if (!answer || Number(answer) <= 0) return;
    const existingCabins = (collectedData._coworkingWorkspaces ?? []).filter((workspace) => workspace.type === "Cabin").length;
    const updated = {
      ...collectedData,
      _coworkingCabinTotal: Number(answer),
      _coworkingCabinIndex: 0,
      _coworkingCabinStartNumber: existingCabins + 1,
      _coworkingPendingCabins: [],
    };
    setCollectedData(() => updated);
    const cabinNumber = updated._coworkingCabinStartNumber;
    await botSay(`How many seats are available in Cabin ${cabinNumber}?`);
    setCustomInput({ type: "number", key: "coworking_cabin_seats_1", placeholder: `Seats in Cabin ${cabinNumber}...`, min: 0 });
    goTo("coworking_cabin_seats", updated);
    return;
  }

  if (step === "coworking_cabin_seats") {
    if (!answer || Number(answer) <= 0) return;
    const cabinNumber = collectedData._coworkingCabinStartNumber + collectedData._coworkingCabinIndex;
    const updated = { ...collectedData, _coworkingPendingCabinSeats: Number(answer) };
    setCollectedData(() => updated);
    await botSay(`What is the monthly rent per seat in Cabin ${cabinNumber}? (in ₹)`);
    setCustomInput({ type: "number", key: `coworking_cabin_rent_${cabinNumber}`, placeholder: `Monthly rent per seat in Cabin ${cabinNumber}...`, min: 0 });
    goTo("coworking_cabin_rent", updated);
    return;
  }

  if (step === "coworking_cabin_rent") {
    if (!answer || Number(answer) <= 0) return;
    const cabinNumber = collectedData._coworkingCabinStartNumber + collectedData._coworkingCabinIndex;
    const pendingCabins = [
      ...(collectedData._coworkingPendingCabins ?? []),
      {
        type: "Cabin",
        cabinNumber,
        seatCount: collectedData._coworkingPendingCabinSeats,
        rentPerSeatMonthly: Number(answer),
      },
    ];
    const nextIndex = collectedData._coworkingCabinIndex + 1;
    const updated = {
      ...collectedData,
      _coworkingPendingCabins: pendingCabins,
      _coworkingCabinIndex: nextIndex,
    };
    delete updated._coworkingPendingCabinSeats;
    setCollectedData(() => updated);

    if (nextIndex < collectedData._coworkingCabinTotal) {
      const nextCabinNumber = updated._coworkingCabinStartNumber + nextIndex;
      await botSay(`How many seats are available in Cabin ${nextCabinNumber}?`);
      setCustomInput({ type: "number", key: `coworking_cabin_seats_${nextCabinNumber}`, placeholder: `Seats in Cabin ${nextCabinNumber}...`, min: 0 });
      goTo("coworking_cabin_seats", updated);
      return;
    }

    updated._coworkingWorkspaces = [...(updated._coworkingWorkspaces ?? []), ...pendingCabins];
    ["_coworkingCabinTotal", "_coworkingCabinIndex", "_coworkingCabinStartNumber", "_coworkingPendingCabins"].forEach((key) => delete updated[key]);
    setCollectedData(() => updated);
    const availableTypes = getAvailableCoworkingWorkspaceTypes(
      updated._coworkingWorkspaces,
    );
    await botSay(
      `${pendingCabins.length} cabin${pendingCabins.length === 1 ? "" : "s"} added. ${
        availableTypes.length
          ? "Would you like to add another workspace?"
          : "All workspace types have been added."
      }`,
      availableTypes.length ? ["Add another workspace", "Done"] : ["Done"],
    );
    goTo("coworking_workspace_more", updated);
    return;
  }

  if (step === "coworking_workspace_more") {
    if (answer === "Add another workspace") {
      const availableTypes = getAvailableCoworkingWorkspaceTypes(
        collectedData._coworkingWorkspaces,
      );
      if (availableTypes.length) {
        await botSay("What type of workspace would you like to add?", availableTypes);
        goTo("coworking_workspace_type", collectedData);
      } else {
        await botSay("All workspace types have been added. Choose Done to continue.", ["Done"]);
        goTo("coworking_workspace_more", collectedData);
      }
    } else if (answer === "Done") {
      const entries = collectedData._coworkingWorkspaces ?? [];
      const cabins = entries.filter((item) => item.type === "Cabin");
      const hall = entries.find((item) => item.type === "Hall");
      const virtualSpace = entries.find((item) => item.type === "Virtual Space");
      const workspaces = [];
      if (cabins.length) {
        workspaces.push({
          type: "cabin",
          available: cabins.length,
          config: cabins.map((item) => ({
            availableSeats: item.seatCount,
            rentPerSeat: item.rentPerSeatMonthly,
          })),
        });
      }
      if (hall) {
        workspaces.push({
          type: "hall",
          availableSeats: hall.seatCount,
          rentPerSeat: hall.rentPerSeatMonthly,
        });
      }
      if (virtualSpace) {
        workspaces.push({
          type: "virtualSpace",
          monthlyRent: virtualSpace.monthlyRent,
          benefits: virtualSpace.benefits,
        });
      }
      const updated = {
        ...collectedData,
        detailsKey: "commercialDetails",
        commercialDetails: {
          ...(collectedData.commercialDetails ?? {}),
          workSpaceFloor: Number(collectedData._coworkingFloor),
          workspaces,
        },
      };
      setCollectedData(() => updated);
      goTo("purpose_questions", updated);
    }
    return;
  }

  if (step === "comm_builtup_unit") {
    if (!answer) {
      await botSay("What unit are the areas in? (built-up & carpet)", AREA_UNIT_OPTIONS);
      return;
    }
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
    const areaUnit = collectedData._commAreaUnit;
    const ex = collectedData.commercialDetails ?? {};
    const updated = {
      ...collectedData,
      detailsKey: "commercialDetails",
      commercialDetails: {
        ...(collectedData._commOthersType && { propertyType: collectedData._commOthersType }),
        builtUpArea: collectedData._commBuiltUpValue != null
          ? { value: collectedData._commBuiltUpValue, unit: areaUnit }
          : ex.builtUpArea,
        carpetArea: { value: Number(answer), unit: areaUnit },
      },
    };
    ["_commAreaUnit", "_commBuiltUpValue", "_commOthersType"].forEach((k) => delete updated[k]);
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
    const isCoworkingRent = collectedData.categoryId === CATEGORY_COMMERCIAL_ID
      && collectedData.propertyTypeId === COMMERCIAL_COWORKING_SPACE_ID
      && collectedData.listingTypeId === LISTING_TYPE_RENT_ID;
    if (isPG) {
      goTo("ask_images", collectedData);
    } else if (isCoworkingRent) {
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
    const updated = {
      ...collectedData,
      sellInfo: { price: Number(answer) },
    };
    setCollectedData(() => updated);
    goTo("ask_images", updated);
    return;
  }

  // ── Rent flow ─────────────────────────────────────────────────────────────
  if (step === "rent_monthly") {
    if (!answer) return;
    const updated = {
      ...collectedData,
      rentInfo: { monthlyRent: Number(answer) },
    };
    setCollectedData(() => updated);
    goTo("ask_images", updated);
    return;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // IMAGE UPLOAD  (min 1 required)
  // ═══════════════════════════════════════════════════════════════════════════

  if (step === "ask_images") {
    await botSay("📸 Almost done! Please upload at least 1 image of your property.\n\nYou can upload up to 20 images.");
    setCustomInput({ type: "images", key: "property_images" });
    goTo("images_upload", collectedData);
    return;
  }

  if (step === "images_upload") {
    if (!answer) return;
    const images = collectedData._uploadedImages ?? [];
    if (images.length === 0) {
      await botSay("⚠️ Please upload at least 1 image to continue.");
      setCustomInput({ type: "images", key: "property_images" });
      return;
    }
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
    const details = d[d.detailsKey] ?? {};
    const purpose = d[d.purposeKey ?? "sellInfo"] ?? {};

    const detailLines = [];

    // Residential non-plot
    if (details.bhk !== undefined)
      detailLines.push(`  • BHK              : ${details.bhk === 0 ? "1 RK" : `${details.bhk} BHK`}`);

    // Plot (residential & commercial)
    if (details.plotArea)
      detailLines.push(`  • Plot Area        : ${details.plotArea.value} ${details.plotArea.unit}`);
    if (details.length)
      detailLines.push(`  • Length           : ${details.length} ft`);
    if (details.width)
      detailLines.push(`  • Width            : ${details.width} ft`);

    // Commercial non-plot
    if (details.builtUpArea)
      detailLines.push(`  • Built-up Area    : ${details.builtUpArea.value} ${details.builtUpArea.unit}`);
    if (details.carpetArea)
      detailLines.push(`  • Carpet Area      : ${details.carpetArea.value} ${details.carpetArea.unit}`);
    if (details.propertyType)
      detailLines.push(`  • Property Type    : ${details.propertyType}`);

    if (d._coworkingFloor)
      detailLines.push(`  • Workspace Floor : ${d._coworkingFloor}`);
    if (d._coworkingWorkspaces?.length) {
      detailLines.push("  • Workspaces       :");
      d._coworkingWorkspaces.forEach((workspace, index) => {
        if (workspace.type === "Virtual Space") {
          detailLines.push(
            `      ${index + 1}). Virtual Space — ₹${workspace.monthlyRent.toLocaleString()} / month`,
          );
          workspace.benefits.forEach((group) => {
            detailLines.push(`          ${group.title}: ${group.benefits.join(", ")}`);
          });
        } else {
          const label = workspace.type === "Cabin" ? `Cabin ${workspace.cabinNumber}` : "Hall";
          detailLines.push(`      ${index + 1}). ${label} — ${workspace.seatCount} seats — ₹${workspace.rentPerSeatMonthly.toLocaleString()} / seat / month`);
        }
      });
    }

    // PG
    if (details.pgName)
      detailLines.push(`  • PG Name          : ${details.pgName}`);
    if (details.totalBedsAvailable !== undefined)
      detailLines.push(`  • Total Beds       : ${details.totalBedsAvailable}`);
    if (details.rooms?.length) {
      detailLines.push(`  • Rooms            :`);
      details.rooms.forEach((r, i) => {
        detailLines.push(`      ${i + 1}). ${r.roomType} — ${r.bedsAvailable} beds — ₹${r.rent} rent — ₹${r.securityDeposit} deposit`);
      });
    }

    const purposeLines = [];
    if (purpose.price !== undefined)
      purposeLines.push(`  • Sale Price       : ₹${purpose.price.toLocaleString()}`);
    if (purpose.monthlyRent !== undefined)
      purposeLines.push(`  • Monthly Rent     : ₹${purpose.monthlyRent.toLocaleString()}`);

    const purposeLabel = d.purposeKey === "rentInfo" ? "Rent Info" : d.purposeKey === "pgDetails" ? "PG Info" : "Sell Info";

    const imageCount = (d._images ?? []).length;

    const msg =
      `✅ All details collected! Please review before submitting.\n\n` +
      `📋 Basic Info :\n` +
      `  • Purpose  : ${d.listingTypeName}\n` +
      `  • Category : ${d.categoryName}\n` +
      `  • Type     : ${d.propertyTypeName ?? "—"}\n` +
      `  • City     : ${d.cityName}\n` +
      `  • Locality : ${d.locality?.address}\n\n` +
      (detailLines.length ? `🏠 Property Details :\n${detailLines.join("\n")}\n\n` : "") +
      (purposeLines.length ? `💰 ${purposeLabel} :\n${purposeLines.join("\n")}\n\n` : "") +
      `📸 Images    : ${imageCount} uploaded\n\n` +
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

    const listingPayload = {
      categoryId:                   d.categoryId,
      listingTypeId:                d.listingTypeId,
      propertyTypeId:               d.propertyTypeId,
      cityName:                     d.cityName,
      locality:                     d.locality,
      [d.detailsKey]:               d[d.detailsKey],
      [d.purposeKey ?? "sellInfo"]: d[d.purposeKey ?? "sellInfo"],
    };

    // ── Step 1: Create the property listing ──────────────────────────────
    let propertyId;
    try {
      await botSay("⏳ Submitting your property listing...");
      const { data } = await api.post(`${import.meta.env.VITE_API_URL}/api/mixed/property-listings`, listingPayload, { withCredentials: true });
      propertyId = data.data?._id;
    } catch (err) {
      await botSay(`⚠️ Failed to list property: ${err.message}\n\nPlease try again after some time.`, ["Retry"]);
      goTo("submit_retry", collectedData);
      return;
    }

    // ── Step 2: Upload images ─────────────────────────────────────────────
    await botSay("📸 Uploading your images, please wait...");
    try {
      const formData = new FormData();
      formData.append("propertyId", propertyId);
      images.forEach((file) => formData.append("images", file));

      const { data: mediaData } = await api.post(`${import.meta.env.VITE_API_URL}/api/mixed/property-listings/media`, formData, { withCredentials: true });
      const isProject = d.listingMode === "Project Listing";
      const editPath  = isProject
        ? "Profile → My Project Listings → Edit Project"
        : "Profile → My Property Listings → Edit Property";
      await botSay(`🎉 ${mediaData.message}\n\n💡 Your listing is under review. You can complete the remaining details anytime from ${editPath}.`);
    } catch (err) {
      const isProject = d.listingMode === "Project Listing";
      const editPath  = isProject
        ? "Profile → My Project Listings → Edit Project"
        : "Profile → My Property Listings → Edit Property";
      await botSay(`⚠️ Property listed but image upload failed: ${err.message}\n\nYou can try uploading images from ${editPath}.`);
    }
    await botSay("Do you want to do more listing?", ["Yes", "No"]);
    goTo("ask_more_listing", collectedData);
    return;
  }

  // ── Ask more listing ──────────────────────────────────────────────────────
  if (step === "ask_more_listing") {
    if (!answer) return;
    if (answer === "Yes") {
      await botSay("Great! Starting a new listing... 🔄");
      setTimeout(() => window.location.reload(), 1000);
    }
    // No — do nothing, just leave the chat as is
    return;
  }

  // ── Submit retry ─────────────────────────────────────────────────────────
  if (step === "submit_retry") {
    if (!answer) return;
    goTo("summary", collectedData);
    return;
  }
}
