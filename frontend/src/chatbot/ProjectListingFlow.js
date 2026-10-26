import {
  AREA_UNIT_OPTIONS,
  BHK_OPTIONS,
  CATEGORY_COMMERCIAL_ID,
  CATEGORY_RESIDENTIAL_ID,
} from "./chatbotConstants";
import { fetchActiveCategories, fetchActiveIdealFor } from "./chatbotApi";
import api from "../utils/axiosInterceptor";

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

async function askImages(helpers, data) {
  await helpers.botSay("📸 Please upload at least 1 project image. You can upload up to 20 images.");
  helpers.setCustomInput({ type: "images", key: "project_images" });
  helpers.goTo("images_upload", data);
}

function buildProjectSummary(data) {
  const configurations = data.categoryId === CATEGORY_RESIDENTIAL_ID
    ? (data.residentialConfigurations ?? []).join(", ")
    : (data.commercialConfigurations ?? []).map((config, index) =>
      `${index + 1}. ${config.unitName}: ${config.carpetArea} ${data.commercialAreaUnit} carpet area`
    ).join("\n");
  const possession = data.projectStatus === "Ready to Move"
    ? "Ready to Move"
    : `${data.projectStatus} · Expected possession: ${data.possessionDate}`;
  return [
    "✅ Project details collected for review",
    "",
    `Project: ${data.projectName}`,
    `Developer / Builder: ${data.developerName || "Not provided"}`,
    `Category: ${data.categoryName}`,
    `Ideal for: ${(data.idealFor ?? []).map((option) => option.name).join(", ")}`,
    `Location: ${data.locality?.address}, ${data.cityName}`,
    `Status: ${possession}`,
    `Total units: ${data.totalUnits}`,
    `Available units: ${data.availableUnits}`,
    `Towers / buildings: ${data.towerCount ?? "Not provided"}`,
    `Configurations:\n${configurations}`,
    `Project price range: ₹${Number(data.minPrice).toLocaleString("en-IN")} – ₹${Number(data.maxPrice).toLocaleString("en-IN")}`,
    `Images: ${(data._images ?? []).length} uploaded`,
    "",
    "Your answers have not been submitted.",
  ].join("\n");
}

function getSubmitErrorMessage(error) {
  const validationMessages = error.response?.data?.errors
    ?.map((item) => item.msg ?? item.message)
    .filter(Boolean);
  return validationMessages?.join("; ") || error.response?.data?.message || error.message || "Please try again.";
}

async function submitProject(data, helpers) {
  const { botSay, setCollectedData, goTo } = helpers;
  let workingData = data;
  const apiUrl = import.meta.env.VITE_API_URL;

  if (!workingData._projectId) {
    const payload = {
      categoryId: workingData.categoryId,
      ...(workingData.idealFor?.length && { idealFor: workingData.idealFor.map((option) => option.id) }),
      cityName: workingData.cityName,
      locality: workingData.locality,
      projectName: workingData.projectName,
      ...(workingData.developerName && { developerName: workingData.developerName }),
      projectStatus: workingData.projectStatus,
      ...(workingData.possessionDate && { possessionDate: workingData.possessionDate }),
      totalUnits: workingData.totalUnits,
      availableUnits: workingData.availableUnits,
      ...(workingData.towerCount !== null && workingData.towerCount !== undefined && { towerCount: workingData.towerCount }),
      minPrice: workingData.minPrice,
      maxPrice: workingData.maxPrice,
    };

    if (workingData.categoryId === CATEGORY_RESIDENTIAL_ID) {
      payload.residentialConfigurations = workingData.residentialConfigurations ?? [];
    } else if (workingData.categoryId === CATEGORY_COMMERCIAL_ID) {
      payload.commercialAreaUnit = workingData.commercialAreaUnit;
      payload.commercialConfigurations = workingData.commercialConfigurations ?? [];
    }

    try {
      await botSay("⏳ Submitting your project listing...");
      const { data: response } = await api.post(
        `${apiUrl}/api/mixed/project-listings`,
        payload,
        { withCredentials: true }
      );
      const projectId = response.data?._id;
      if (!projectId) throw new Error("The project was created but the server did not return its ID.");

      workingData = { ...workingData, _projectId: projectId };
      setCollectedData(() => workingData);
    } catch (error) {
      await botSay(`⚠️ Failed to create the project listing: ${getSubmitErrorMessage(error)}`, ["Retry"]);
      goTo("submit_retry", workingData);
      return;
    }
  }

  if (!workingData._projectImagesUploaded) {
    try {
      await botSay("📸 Uploading your project images...");
      const formData = new FormData();
      formData.append("projectId", workingData._projectId);
      (workingData._images ?? []).forEach((image) => formData.append("images", image));
      const { data: mediaResponse } = await api.post(
        `${apiUrl}/api/mixed/project-listings/media`,
        formData,
        { withCredentials: true }
      );
      workingData = { ...workingData, _projectImagesUploaded: true, _uploadedImageUrls: mediaResponse.data?.images ?? [] };
      setCollectedData(() => workingData);
      await botSay(`🎉 ${mediaResponse.message ?? "Project listed successfully"}\n\nYour project details and images have been submitted.`);
    } catch (error) {
      await botSay(
        `⚠️ Your project was created, but image upload failed: ${getSubmitErrorMessage(error)}\n\nChoose Retry to upload the images.`,
        ["Retry"]
      );
      goTo("submit_retry", workingData);
      return;
    }
  }

  await botSay("Do you want to list another project?", ["Yes", "No"]);
  goTo("ask_more_listing", workingData);
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

async function askIdealFor(data, helpers) {
  const { botSay, setCollectedData, goTo } = helpers;
  try {
    const options = await fetchActiveIdealFor();
    if (options.length === 0) {
      await botSay("There are no active Ideal For options available. Please retry.", ["Retry"]);
      goTo("retry_ideal_for", data);
      return;
    }
    const updated = { ...data, _idealForOptions: options };
    setCollectedData(() => updated);
    await botSay("Who is this project ideal for? Select all that apply.");
    helpers.setCustomInput({ type: "idealFor", key: "project_ideal_for", options, minSelect: 1 });
    goTo("ideal_for", updated);
  } catch {
    setCollectedData(() => data);
    await botSay("⚠️ Failed to load Ideal For options. Please try again.", ["Retry"]);
    goTo("retry_ideal_for", data);
  }
}

async function askProjectCity(data, helpers) {
  await helpers.botSay("Great! In which city is the project located?");
  helpers.setCustomInput({ type: "places", mode: "city", placeholder: "Search for a city..." });
  helpers.goTo("city", data);
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
    if (category.value === CATEGORY_COMMERCIAL_ID) await askIdealFor(updated, helpers);
    else await askProjectCity(updated, helpers);
    return;
  }

  if (step === "retry_ideal_for") {
    if (answer !== "Retry") return;
    await askIdealFor(collectedData, helpers);
    return;
  }

  if (step === "ideal_for") {
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
    setCollectedData(() => updated);
    await askProjectCity(updated, helpers);
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
    await botSay("What is the developer or builder name?", ["Skip"], true);
    goTo("developer_name", updated);
    return;
  }

  if (step === "developer_name") {
    if (!answer) return;
    const updated = { ...collectedData };
    if (answer === "Skip") delete updated.developerName;
    else updated.developerName = answer;
    setCollectedData(() => updated);
    await botSay("What is the project's status?", PROJECT_STATUS_OPTIONS);
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
      "How many units are currently available?",
      "project_available_units",
      helpers,
      "available_units",
      { placeholder: "Available units...", min: 0, allowZero: true, data: updated }
    );
    return;
  }

  if (step === "available_units") {
    if (!answer) return;
    const availableUnits = Number(answer);
    if (!Number.isInteger(availableUnits) || availableUnits < 1 || availableUnits > collectedData.totalUnits) {
      await botSay(`❌ Available units must be a whole number from 1 to ${collectedData.totalUnits}.\n\nPlease enter a valid number.`);
      helpers.setCustomInput({ type: "number", key: "project_available_units_retry", placeholder: "Available units...", min: 0, allowZero: true });
      goTo("available_units", collectedData);
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
    await askMinimumPrice(updated, helpers);
    return;
  }

  if (step === "commercial_area_unit") {
    if (!AREA_UNIT_OPTIONS.includes(answer)) return;
    const updated = { ...collectedData, commercialAreaUnit: answer };
    setCollectedData(() => updated);
    await askNumber(`What is the carpet area for configuration 1? (in ${answer})`, "commercial_carpet_area", helpers, "commercial_carpet_area", { placeholder: "Carpet area...", data: updated });
    return;
  }

  if (step === "commercial_carpet_area") {
    if (!answer) return;
    const carpetArea = Number(answer);
    if (!Number.isFinite(carpetArea) || carpetArea <= 0) {
      const configurationNumber = (collectedData.commercialConfigurations?.length ?? 0) + 1;
      await askNumber(
        `Enter a carpet area greater than zero for configuration ${configurationNumber}.`,
        "commercial_carpet_area_retry",
        helpers,
        "commercial_carpet_area",
        { placeholder: "Carpet area...", data: collectedData }
      );
      return;
    }
    const configuration = {
      unitName: `Configuration ${(collectedData.commercialConfigurations?.length ?? 0) + 1}`,
      carpetArea,
    };
    const updated = {
      ...collectedData,
      commercialConfigurations: [...(collectedData.commercialConfigurations ?? []), configuration],
    };
    setCollectedData(() => updated);
    await botSay("Would you like to add another commercial configuration?", ["Add another", "Done"]);
    goTo("commercial_add_configuration", updated);
    return;
  }

  if (step === "commercial_add_configuration") {
    if (answer === "Add another") {
      const configurationNumber = (collectedData.commercialConfigurations?.length ?? 0) + 1;
      await botSay(`Let's add configuration ${configurationNumber}.`);
      await askNumber(`What is the carpet area for configuration ${configurationNumber}? (in ${collectedData.commercialAreaUnit})`, "commercial_carpet_area", helpers, "commercial_carpet_area", { placeholder: "Carpet area...", data: collectedData });
    } else if (answer === "Done") {
      await askMinimumPrice(collectedData, helpers);
    }
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
    await askImages(helpers, updated);
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
    await botSay(`${buildProjectSummary(updated)}\n\nReady to submit? 🚀`, ["Yes, Submit"]);
    goTo("submit", updated);
    return;
  }

  if (step === "submit") {
    if (answer !== "Yes, Submit") return;
    await submitProject(collectedData, helpers);
    return;
  }

  if (step === "submit_retry") {
    if (answer !== "Retry") return;
    await submitProject(collectedData, helpers);
    return;
  }

  if (step === "ask_more_listing") {
    if (answer === "Yes") {
      await botSay("Starting a new project listing...");
      setTimeout(() => window.location.reload(), 1000);
    }
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

  await helpers.botSay("What area unit should be used for all commercial configurations?", AREA_UNIT_OPTIONS);
  helpers.setCollectedData((previous) => ({ ...previous, ...data, commercialConfigurations: [] }));
  helpers.goTo("commercial_area_unit", { ...data, commercialConfigurations: [] });
}

async function askMinimumPrice(data, helpers) {
  await askNumber("What is the minimum unit price for the project?", "project_min_price", helpers, "minimum_price", { placeholder: "Minimum price in ₹...", data });
}
