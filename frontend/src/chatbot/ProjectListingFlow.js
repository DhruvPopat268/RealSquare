import {
  AREA_UNIT_OPTIONS,
  BHK_OPTIONS,
  CATEGORY_COMMERCIAL_ID,
  CATEGORY_RESIDENTIAL_ID,
  PROJECT_COMMERCIAL_PROPERTY_TYPE_EXCLUDE_IDS,
  PROJECT_RESIDENTIAL_PROPERTY_TYPE_EXCLUDE_IDS,
  FURNISH_TYPE_OPTIONS,
} from "./chatbotConstants";
import { fetchActiveCategories, fetchPropertyTypes, fetchFurnishingsAmenities } from "./chatbotApi";

const PROJECT_STATUS_OPTIONS = ["Ready to Move", "Under Construction", "New Launch"];

async function askNumber(prompt, key, helpers, step, options = {}) {
  const { botSay, setCustomInput, goTo } = helpers;
  await botSay(prompt);
  setCustomInput({
    type: "number",
    key,
    placeholder: options.placeholder ?? "Enter a number...",
    min: options.min ?? 0,
    allowZero: options.allowZero ?? false,
  });
  goTo(step, options.data);
}

async function askContactName(helpers, data) {
  helpers.setCollectedData(() => data);
  await helpers.botSay("What is the contact person's name?", [], true);
  helpers.goTo("contact_name", data);
}

async function askImages(helpers, data) {
  await helpers.botSay("📸 Please upload at least 1 project image. You can upload up to 20 images.");
  helpers.setCustomInput({ type: "images", key: "project_images" });
  helpers.goTo("images_upload", data);
}

async function askProjectFurnishing(data, helpers) {
  await helpers.botSay("What is the furnishing status for this project?", FURNISH_TYPE_OPTIONS);
  helpers.goTo("project_furnish_type", data);
}

function buildProjectSummary(data) {
  const configurations = data.categoryId === CATEGORY_RESIDENTIAL_ID
    ? (data.residentialConfigurations ?? []).join(", ")
    : (data.commercialConfigurations ?? []).map((config, index) =>
      `${index + 1}. ${config.unitName}: ${config.builtUpArea} ${config.areaUnit} built-up, ${config.carpetArea} ${config.areaUnit} carpet`
    ).join("\n");
  const possession = data.projectStatus === "Ready to Move"
    ? "Ready to Move"
    : `${data.projectStatus} · Expected possession: ${data.possessionDate}`;
  const contacts = (data.contacts ?? []).map((contact, index) =>
    `${index + 1}. ${contact.name} · ${contact.mobile}`
  ).join("\n");

  return [
    "✅ Project details collected for review",
    "",
    `Project: ${data.projectName}`,
    `Developer / Builder: ${data.developerName}`,
    `Launch date: ${data.launchDate}`,
    `Description: ${data.projectDescription}`,
    `Category: ${data.categoryName}`,
    `Property type: ${data.propertyTypeName}`,
    `Location: ${data.locality?.address}, ${data.cityName}`,
    `Status: ${possession}`,
    `Total units: ${data.totalUnits}`,
    `Available units: ${data.availableUnits}`,
    `Towers / buildings: ${data.towerCount ?? "Not provided"}`,
    `Configurations:\n${configurations}`,
    `Project price range: ₹${Number(data.minPrice).toLocaleString("en-IN")} – ₹${Number(data.maxPrice).toLocaleString("en-IN")}`,
    `Furnishing: ${data.furnishType}`,
    `Furnishings selected: ${(data.furnishings ?? []).length}`,
    `Amenities selected: ${(data.amenities ?? []).length}`,
    `Contacts:\n${contacts}`,
    `Images: ${(data._images ?? []).length} uploaded`,
    "",
    "Your answers have not been submitted.",
  ].join("\n");
}

function excludedTypesForCategory(categoryId) {
  if (categoryId === CATEGORY_RESIDENTIAL_ID) return PROJECT_RESIDENTIAL_PROPERTY_TYPE_EXCLUDE_IDS;
  if (categoryId === CATEGORY_COMMERCIAL_ID) return PROJECT_COMMERCIAL_PROPERTY_TYPE_EXCLUDE_IDS;
  return [];
}

async function askCategories(data, { botSay, setCollectedData, goTo }) {
  try {
    const supportedCategoryIds = [CATEGORY_RESIDENTIAL_ID, CATEGORY_COMMERCIAL_ID];
    const categories = (await fetchActiveCategories())
      .filter((category) => supportedCategoryIds.includes(category.value));
    if (categories.length === 0) {
      await botSay("No project categories are currently available.", ["Retry"]);
      goTo("load_categories", data);
      return;
    }

    const updated = { ...data, _projectCategories: categories };
    setCollectedData(() => updated);
    await botSay("What category does your project fall under?", categories.map((category) => category.label));
    goTo("category", updated);
  } catch {
    await botSay("⚠️ Failed to load project categories. Please try again.", ["Retry"]);
    goTo("load_categories", data);
  }
}

async function askPropertyTypes(category, data, helpers) {
  const { botSay, setCollectedData, goTo } = helpers;
  const excludedIds = excludedTypesForCategory(category.value);

  try {
    const types = (await fetchPropertyTypes(category.value))
      .filter((type) => !excludedIds.includes(type.value));

    if (types.length === 0) {
      await botSay(
        "There are no available project property types for this category. Please choose another category.",
        data._projectCategories.map((item) => item.label)
      );
      goTo("category", data);
      return;
    }

    const updated = { ...data, _projectPropertyTypes: types };
    delete updated._projectCategoryForRetry;
    setCollectedData(() => updated);
    await botSay(`What type of ${category.label.toLowerCase()} project is it?`, types.map((type) => type.label));
    goTo("property_type", updated);
  } catch {
    const retryData = { ...data, _projectCategoryForRetry: category };
    setCollectedData(() => retryData);
    await botSay("⚠️ Failed to load project property types. Please try again.", ["Retry"]);
    goTo("retry_property_types", retryData);
  }
}

export async function projectListingFlow(step, answer, collectedData, helpers) {
  const { botSay, setCollectedData, goTo } = helpers;

  if (step === "init" || step === "load_categories") {
    if (step === "load_categories" && answer !== "Retry") return;
    if (step === "init") {
      await botSay("👋 Hi! I'm your RealSquare project listing assistant.\nI'll help you start a project listing.");
    }
    await askCategories(collectedData, helpers);
    return;
  }

  if (step === "category") {
    if (!answer) return;
    const category = collectedData._projectCategories?.find((item) => item.label === answer);
    if (!category) return;

    const updated = {
      ...collectedData,
      listingMode: "Project Listing",
      categoryId: category.value,
      categoryName: category.label,
    };
    setCollectedData(() => updated);
    await askPropertyTypes(category, updated, helpers);
    return;
  }

  if (step === "retry_property_types") {
    if (answer !== "Retry") return;
    const category = collectedData._projectCategoryForRetry;
    if (!category) {
      await askCategories(collectedData, helpers);
      return;
    }
    await askPropertyTypes(category, collectedData, helpers);
    return;
  }

  if (step === "property_type") {
    if (!answer) return;
    const type = collectedData._projectPropertyTypes?.find((item) => item.label === answer);
    if (!type) return;

    const updated = {
      ...collectedData,
      propertyTypeId: type.value,
      propertyTypeName: type.label,
    };
    setCollectedData(() => updated);
    await botSay("Great! In which city is the project located?");
    helpers.setCustomInput({ type: "places", mode: "city", placeholder: "Search for a city..." });
    goTo("city", updated);
    return;
  }

  if (step === "city") {
    if (!answer) return;
    const updated = { ...collectedData, cityName: answer };
    setCollectedData(() => updated);
    await botSay(`What is the exact locality or address in ${answer}?`);
    helpers.setCustomInput({
      type: "places",
      mode: "locality",
      cityName: answer,
      placeholder: `Search locality in ${answer}...`,
    });
    goTo("locality", updated);
    return;
  }

  if (step === "locality") {
    if (!answer) return;
    const updated = {
      ...collectedData,
      locality: {
        address: collectedData._localityAddress ?? answer,
        latitude: collectedData._localityLatitude ?? null,
        longitude: collectedData._localityLongitude ?? null,
      },
    };
    delete updated._localityAddress;
    delete updated._localityLatitude;
    delete updated._localityLongitude;
    setCollectedData(() => updated);
    await botSay("What is the project name?", [], true);
    goTo("project_name", updated);
    return;
  }

  if (step === "project_name") {
    if (!answer) return;
    const updated = { ...collectedData, projectName: answer };
    setCollectedData(() => updated);
    await botSay("What is the developer or builder name?", [], true);
    goTo("developer_name", updated);
    return;
  }

  if (step === "developer_name") {
    if (!answer) return;
    const updated = { ...collectedData, developerName: answer };
    setCollectedData(() => updated);
    await botSay("When was the project launched?");
    helpers.setCustomInput({ type: "date", key: "project_launch_date" });
    goTo("launch_date", updated);
    return;
  }

  if (step === "launch_date") {
    if (!answer) return;
    const updated = { ...collectedData, launchDate: answer };
    setCollectedData(() => updated);
    await botSay("Add a short description of the project.", [], true);
    goTo("project_description", updated);
    return;
  }

  if (step === "project_description") {
    if (!answer?.trim()) return;
    const updated = { ...collectedData, projectDescription: answer.trim() };
    setCollectedData(() => updated);
    await botSay("What is the project's launch status?", PROJECT_STATUS_OPTIONS);
    goTo("project_status", updated);
    return;
  }

  if (step === "project_status") {
    if (!PROJECT_STATUS_OPTIONS.includes(answer)) return;
    const updated = { ...collectedData, projectStatus: answer };
    setCollectedData(() => updated);
    if (answer !== "Ready to Move") {
      await botSay("What is the expected possession date?");
      helpers.setCustomInput({ type: "date", key: "project_possession_date" });
      goTo("possession_date", updated);
      return;
    }
    await askNumber("How many units are in the project?", "project_total_units", helpers, "total_units", { placeholder: "Total units...", data: updated });
    return;
  }

  if (step === "possession_date") {
    if (!answer) return;
    const updated = { ...collectedData, possessionDate: answer };
    setCollectedData(() => updated);
    await askNumber("How many units are in the project?", "project_total_units", helpers, "total_units", { placeholder: "Total units...", data: updated });
    return;
  }

  if (step === "total_units") {
    if (!answer) return;
    const totalUnits = Number(answer);
    if (!Number.isInteger(totalUnits) || totalUnits < 1) {
      await askNumber("Enter a whole number greater than zero for total units.", "project_total_units_retry", helpers, "total_units", { placeholder: "Total units...", data: collectedData });
      return;
    }
    const updated = { ...collectedData, totalUnits };
    setCollectedData(() => updated);
    await askNumber(
      "How many units are currently available? Enter 0 if none are available.",
      "project_available_units",
      helpers,
      "available_units",
      { placeholder: "Available units...", allowZero: true, data: updated }
    );
    return;
  }

  if (step === "available_units") {
    if (!answer) return;
    const availableUnits = Number(answer);
    if (!Number.isInteger(availableUnits) || availableUnits < 0 || availableUnits > collectedData.totalUnits) {
      await askNumber(
        `Enter a whole number from 0 to ${collectedData.totalUnits}.`,
        "project_available_units_retry",
        helpers,
        "available_units",
        { placeholder: "Available units...", allowZero: true, data: collectedData }
      );
      return;
    }
    const updated = { ...collectedData, availableUnits };
    setCollectedData(() => updated);
    await botSay("How many towers or buildings are there? This is optional.", ["Skip"]);
    helpers.setCustomInput({ type: "number", key: "project_tower_count", placeholder: "Number of towers/buildings...", min: 0 });
    goTo("tower_count", updated);
    return;
  }

  if (step === "tower_count") {
    if (answer === "Skip") {
      const updated = { ...collectedData, towerCount: null };
      setCollectedData(() => updated);
      await askProjectConfigurations(updated, helpers);
      return;
    }
    if (!answer) return;
    const towerCount = Number(answer);
    if (!Number.isInteger(towerCount) || towerCount < 1) {
      await botSay("Enter a whole number greater than zero, or choose Skip.", ["Skip"]);
      helpers.setCustomInput({ type: "number", key: "project_tower_count_retry", placeholder: "Number of towers/buildings...", min: 0 });
      goTo("tower_count", collectedData);
      return;
    }
    const updated = { ...collectedData, towerCount };
    setCollectedData(() => updated);
    await askProjectConfigurations(updated, helpers);
    return;
  }

  if (step === "residential_configurations") {
    if (!answer) return;
    const residentialConfigurations = answer.split(", ").map((option) => option.trim()).filter(Boolean);
    if (residentialConfigurations.length === 0) return;
    const updated = { ...collectedData, residentialConfigurations };
    setCollectedData(() => updated);
    await askProjectFurnishing(updated, helpers);
    return;
  }

  if (step === "commercial_area_unit") {
    if (!AREA_UNIT_OPTIONS.includes(answer)) return;
    const updated = { ...collectedData, _commercialAreaUnit: answer };
    setCollectedData(() => updated);
    await askNumber("What is the built-up area for this unit?", "commercial_built_up_area", helpers, "commercial_built_up_area", { placeholder: "Built-up area...", data: updated });
    return;
  }

  if (step === "commercial_built_up_area") {
    if (!answer) return;
    const builtUpArea = Number(answer);
    if (!Number.isFinite(builtUpArea) || builtUpArea <= 0) {
      await askNumber("Enter a built-up area greater than zero.", "commercial_built_up_area_retry", helpers, "commercial_built_up_area", { placeholder: "Built-up area...", data: collectedData });
      return;
    }
    const updated = { ...collectedData, _commercialBuiltUpArea: builtUpArea };
    setCollectedData(() => updated);
    await askNumber(`What is the carpet area? (must not exceed ${builtUpArea} ${updated._commercialAreaUnit})`, "commercial_carpet_area", helpers, "commercial_carpet_area", { placeholder: "Carpet area...", data: updated });
    return;
  }

  if (step === "commercial_carpet_area") {
    if (!answer) return;
    const carpetArea = Number(answer);
    if (!Number.isFinite(carpetArea) || carpetArea <= 0 || carpetArea > collectedData._commercialBuiltUpArea) {
      await askNumber(
        `Enter a carpet area greater than zero and no more than ${collectedData._commercialBuiltUpArea} ${collectedData._commercialAreaUnit}.`,
        "commercial_carpet_area_retry",
        helpers,
        "commercial_carpet_area",
        { placeholder: "Carpet area...", data: collectedData }
      );
      return;
    }
    const configuration = {
      unitName: `Configuration ${(collectedData.commercialConfigurations?.length ?? 0) + 1}`,
      areaUnit: collectedData._commercialAreaUnit,
      builtUpArea: collectedData._commercialBuiltUpArea,
      carpetArea,
    };
    const updated = {
      ...collectedData,
      commercialConfigurations: [...(collectedData.commercialConfigurations ?? []), configuration],
    };
    ["_commercialAreaUnit", "_commercialBuiltUpArea"].forEach((key) => delete updated[key]);
    setCollectedData(() => updated);
    await botSay("Would you like to add another commercial configuration?", ["Add another", "Done"]);
    goTo("commercial_add_configuration", updated);
    return;
  }

  if (step === "commercial_add_configuration") {
    if (answer === "Add another") {
      const configurationNumber = (collectedData.commercialConfigurations?.length ?? 0) + 1;
      await botSay(`Let's add configuration ${configurationNumber}.`);
      await botSay(`What area unit should be used for configuration ${configurationNumber}?`, AREA_UNIT_OPTIONS);
      goTo("commercial_area_unit", collectedData);
    } else if (answer === "Done") {
      await askProjectFurnishing(collectedData, helpers);
    }
    return;
  }

  if (step === "project_furnish_type") {
    if (!FURNISH_TYPE_OPTIONS.includes(answer)) return;
    let available = { furnishings: [], amenities: [] };
    try {
      available = await fetchFurnishingsAmenities();
    } catch {
      // Keep the selection step usable if the option service is temporarily unavailable.
    }
    const updated = { ...collectedData, furnishType: answer, _projectFurnishings: available.furnishings ?? [], _projectAmenities: available.amenities ?? [] };
    setCollectedData(() => updated);
    await helpers.botSay("Select the furnishings and amenities available in this project.");
    helpers.setCustomInput({
      type: "furnishamenities",
      key: "project_furnishings_amenities",
      furnishType: answer,
      furnishings: updated._projectFurnishings,
      amenities: updated._projectAmenities,
    });
    goTo("project_furnishings_amenities", updated);
    return;
  }

  if (step === "project_furnishings_amenities") {
    const selection = collectedData._furnishAmenitiesPayload ?? { furnishings: [], amenities: [] };
    const updated = { ...collectedData, furnishings: selection.furnishings, amenities: selection.amenities };
    delete updated._furnishAmenitiesPayload;
    setCollectedData(() => updated);
    await askMinimumPrice(updated, helpers);
    return;
  }

  if (step === "minimum_price") {
    if (!answer) return;
    const minPrice = Number(answer);
    if (!Number.isFinite(minPrice) || minPrice <= 0) {
      await askNumber("Enter a minimum price greater than zero.", "project_min_price_retry", helpers, "minimum_price", { placeholder: "Minimum price in ₹...", data: collectedData });
      return;
    }
    const updated = { ...collectedData, minPrice };
    setCollectedData(() => updated);
    await askNumber("What is the maximum unit price for the project?", "project_max_price", helpers, "maximum_price", { placeholder: "Maximum price in ₹...", data: updated });
    return;
  }

  if (step === "maximum_price") {
    if (!answer) return;
    const maxPrice = Number(answer);
    if (!Number.isFinite(maxPrice) || maxPrice < collectedData.minPrice) {
      await askNumber(`Enter a maximum price equal to or greater than ₹${collectedData.minPrice}.`, "project_max_price_retry", helpers, "maximum_price", { placeholder: "Maximum price in ₹...", data: collectedData });
      return;
    }
    const updated = { ...collectedData, maxPrice };
    setCollectedData(() => updated);
    await askContactName(helpers, { ...updated, contacts: [] });
    return;
  }

  if (step === "contact_name") {
    if (!answer?.trim()) return;
    const updated = { ...collectedData, _contactName: answer.trim() };
    setCollectedData(() => updated);
    await botSay("What is this contact person's 10-digit mobile number?", [], true);
    goTo("contact_mobile", updated);
    return;
  }

  if (step === "contact_mobile") {
    if (!answer) return;
    const digits = answer?.replace(/\D/g, "") ?? "";
    const mobile = digits.length === 12 && digits.startsWith("91")
      ? digits.slice(2)
      : digits.length === 11 && digits.startsWith("0")
        ? digits.slice(1)
        : digits;
    if (!/^\d{10}$/.test(mobile)) {
      await botSay("Please enter a valid 10-digit mobile number, with or without the +91 prefix.", [], true);
      goTo("contact_mobile", collectedData);
      return;
    }
    const updated = {
      ...collectedData,
      contacts: [...(collectedData.contacts ?? []), { name: collectedData._contactName, mobile }],
    };
    delete updated._contactName;
    setCollectedData(() => updated);
    await botSay("Would you like to add another contact?", ["Add another", "Done"]);
    goTo("add_contact", updated);
    return;
  }

  if (step === "add_contact") {
    if (answer === "Add another") {
      await askContactName(helpers, collectedData);
    } else if (answer === "Done") {
      await askImages(helpers, collectedData);
    }
    return;
  }

  if (step === "images_upload") {
    if (!answer) return;
    const images = collectedData._uploadedImages ?? [];
    if (images.length === 0) {
      await askImages(helpers, collectedData);
      return;
    }
    const updated = { ...collectedData, _images: images };
    delete updated._uploadedImages;
    setCollectedData(() => updated);
    await botSay(buildProjectSummary(updated));
    goTo("review_complete", updated);
  }
}

async function askProjectConfigurations(data, helpers) {
  if (data.categoryId === CATEGORY_RESIDENTIAL_ID) {
    await helpers.botSay("Which BHK configurations are available in this project? Select all that apply.");
    helpers.setCustomInput({
      type: "multiselect",
      key: "project_bhk_configurations",
      options: BHK_OPTIONS,
      minSelect: 1,
    });
    helpers.goTo("residential_configurations", data);
    return;
  }

  await helpers.botSay("What area unit should be used for configuration 1?", AREA_UNIT_OPTIONS);
  helpers.setCollectedData((previous) => ({ ...previous, ...data, commercialConfigurations: [] }));
  helpers.goTo("commercial_area_unit", { ...data, commercialConfigurations: [] });
}

async function askMinimumPrice(data, helpers) {
  await askNumber("What is the minimum unit price for the project?", "project_min_price", helpers, "minimum_price", { placeholder: "Minimum price in ₹...", data });
}
