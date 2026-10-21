import { useEffect, useState } from "react";
import axios from "axios";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { Section, Grid, FormField, NumberInput } from "./EditFormShared";

const API = import.meta.env.VITE_API_URL;

export default function CoworkingEditSection({
  workSpaceFloor,
  workspaces,
  onFloorChange,
  onWorkspacesChange,
}) {
  const [benefitMasters, setBenefitMasters] = useState([]);

  useEffect(() => {
    axios
      .get(`${API}/api/mixed/property-listings/active-virtual-space-benefits`, {
        withCredentials: true,
      })
      .then((response) => setBenefitMasters(response.data.data ?? []))
      .catch(() => setBenefitMasters([]));
  }, []);

  function updateWorkspace(index, changes) {
    onWorkspacesChange(
      workspaces.map((workspace, workspaceIndex) =>
        workspaceIndex === index ? { ...workspace, ...changes } : workspace,
      ),
    );
  }

  function updateCabinConfig(workspaceIndex, configIndex, key, value) {
    const workspace = workspaces[workspaceIndex];
    const config = workspace.config.map((cabin, index) =>
      index === configIndex ? { ...cabin, [key]: value } : cabin,
    );
    updateWorkspace(workspaceIndex, { config });
  }

  function addCabin(workspaceIndex) {
    const workspace = workspaces[workspaceIndex];
    const config = [
      ...workspace.config,
      { availableSeats: "", rentPerSeat: "" },
    ];
    updateWorkspace(workspaceIndex, { available: config.length, config });
  }

  function removeCabin(workspaceIndex, configIndex) {
    const workspace = workspaces[workspaceIndex];
    if (workspace.config.length <= 1) return;

    const config = workspace.config.filter((_, index) => index !== configIndex);
    updateWorkspace(workspaceIndex, { available: config.length, config });
  }

  function toggleBenefit(workspaceIndex, master, benefit) {
    const workspace = workspaces[workspaceIndex];
    const currentGroups = workspace.benefits ?? [];
    const currentGroup = currentGroups.find((group) => group._id === master._id);
    const selected = currentGroup?.benefits ?? [];
    const isSelected = selected.includes(benefit);
    const nextBenefits = isSelected
      ? selected.filter((item) => item !== benefit)
      : [...selected, benefit];
    const benefits = currentGroups.filter((group) => group._id !== master._id);

    if (nextBenefits.length) {
      benefits.push({
        _id: master._id,
        title: master.title,
        benefits: master.benefits.filter((item) => nextBenefits.includes(item)),
      });
    }

    updateWorkspace(workspaceIndex, { benefits });
  }

  function toggleSavedBenefit(workspaceIndex, group, benefit) {
    const workspace = workspaces[workspaceIndex];
    const selected = group.benefits ?? [];
    const nextBenefits = selected.includes(benefit)
      ? selected.filter((item) => item !== benefit)
      : [...selected, benefit];
    const benefits = (workspace.benefits ?? []).filter(
      (item) => item._id !== group._id,
    );

    if (nextBenefits.length) {
      benefits.push({ ...group, benefits: nextBenefits });
    }

    updateWorkspace(workspaceIndex, { benefits });
  }

  return (
    <Section title="Coworking Workspaces">
      <FormField label="Workspace Floor">
        <NumberInput
          value={workSpaceFloor ?? ""}
          onChange={onFloorChange}
          placeholder="-1 for basement, 0 for ground floor"
          min={-1}
        />
      </FormField>

      {workspaces.map((workspace, workspaceIndex) => (
        <div
          key={`${workspace.type}-${workspaceIndex}`}
          className="rounded-xl border border-gray-200 p-4"
        >
          <h4 className="mb-4 text-sm font-bold text-gray-800">
            {workspace.type === "cabin"
              ? "Cabins"
              : workspace.type === "hall"
                ? "Hall"
                : "Virtual Space"}
          </h4>

          {workspace.type === "cabin" && (
            <div className="flex flex-col gap-4">
              <p className="text-xs text-gray-500">
                {workspace.available} cabins
              </p>
              {workspace.config.map((cabin, configIndex) => (
                <div
                  key={configIndex}
                  className="rounded-lg bg-gray-50 p-3"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-xs font-semibold text-gray-700">
                      Cabin {configIndex + 1}
                    </p>
                    {workspace.config.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCabin(workspaceIndex, configIndex)}
                        className="text-gray-400 transition hover:text-red-500"
                        aria-label={`Remove cabin ${configIndex + 1}`}
                      >
                        <FiTrash2 size={15} />
                      </button>
                    )}
                  </div>
                  <Grid>
                    <FormField label="Available Seats">
                      <NumberInput
                        value={cabin.availableSeats ?? ""}
                        onChange={(value) =>
                          updateCabinConfig(
                            workspaceIndex,
                            configIndex,
                            "availableSeats",
                            value,
                          )
                        }
                        min={1}
                      />
                    </FormField>
                    <FormField label="Monthly Rent per Seat (₹)">
                      <NumberInput
                        value={cabin.rentPerSeat ?? ""}
                        onChange={(value) =>
                          updateCabinConfig(
                            workspaceIndex,
                            configIndex,
                            "rentPerSeat",
                            value,
                          )
                        }
                        min={0}
                      />
                    </FormField>
                  </Grid>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addCabin(workspaceIndex)}
                className="flex items-center gap-2 self-start text-xs font-semibold text-[var(--primary-color)]"
              >
                <FiPlus size={15} />
                Add Cabin
              </button>
            </div>
          )}

          {workspace.type === "hall" && (
            <Grid>
              <FormField label="Available Seats">
                <NumberInput
                  value={workspace.availableSeats ?? ""}
                  onChange={(value) =>
                    updateWorkspace(workspaceIndex, { availableSeats: value })
                  }
                  min={1}
                />
              </FormField>
              <FormField label="Monthly Rent per Seat (₹)">
                <NumberInput
                  value={workspace.rentPerSeat ?? ""}
                  onChange={(value) =>
                    updateWorkspace(workspaceIndex, { rentPerSeat: value })
                  }
                  min={0}
                />
              </FormField>
            </Grid>
          )}

          {workspace.type === "virtualSpace" && (
            <div className="flex flex-col gap-4">
              <FormField label="Monthly Rent (₹)">
                <NumberInput
                  value={workspace.monthlyRent ?? ""}
                  onChange={(value) =>
                    updateWorkspace(workspaceIndex, { monthlyRent: value })
                  }
                  min={1}
                />
              </FormField>

              <div className="flex flex-col gap-2">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-600">
                  Benefits
                </p>
                {benefitMasters.map((master) => {
                  const selectedGroup = (workspace.benefits ?? []).find(
                    (group) => group._id === master._id,
                  );
                  return (
                    <div
                      key={master._id}
                      className="rounded-lg border border-gray-100 p-3"
                    >
                      <span>
                        <span className="mb-2 block text-xs font-semibold text-gray-500">
                          {master.title}{!master.isActive ? " (inactive)" : ""}
                        </span>
                        <span className="flex flex-col gap-2">
                          {master.benefits.map((benefit) => (
                            <span key={benefit} className="flex items-start gap-2 text-sm text-gray-700">
                              <input
                                type="checkbox"
                                checked={selectedGroup?.benefits.includes(benefit) ?? false}
                                onChange={() => toggleBenefit(workspaceIndex, master, benefit)}
                                className="mt-0.5 h-4 w-4 accent-[var(--primary-color)]"
                              />
                              <span>{benefit}</span>
                            </span>
                          ))}
                        </span>
                      </span>
                    </div>
                  );
                })}

                {(workspace.benefits ?? [])
                  .filter(
                    (group) =>
                      !benefitMasters.some((master) => master._id === group._id),
                  )
                  .map((group) => (
                    <label key={group._id} className="rounded-lg border border-gray-100 p-3">
                      <span className="mb-2 block text-xs font-semibold text-gray-500">
                        {group.title} (plan no longer available)
                      </span>
                      <span className="flex flex-col gap-2">
                        {group.benefits.map((benefit) => (
                          <span key={benefit} className="flex items-start gap-2 text-sm text-gray-700">
                            <input
                              type="checkbox"
                              checked
                              onChange={() => toggleSavedBenefit(workspaceIndex, group, benefit)}
                              className="mt-0.5 h-4 w-4 accent-[var(--primary-color)]"
                            />
                            <span>{benefit}</span>
                          </span>
                        ))}
                      </span>
                    </label>
                  ))}
                {benefitMasters.length === 0 &&
                  (workspace.benefits ?? []).length === 0 && (
                    <p className="text-xs text-gray-500">
                      No active Virtual Space benefit plans are available.
                    </p>
                  )}
              </div>
            </div>
          )}
        </div>
      ))}
    </Section>
  );
}
