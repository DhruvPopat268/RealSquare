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

  function addWorkspace(type) {
    const defaults = {
      individual_private_cabin: {
        type,
        available: 1,
        config: [{ availableSeats: "", rentPerSeat: "" }],
      },
      dedicated_coworking_desk: {
        type,
        availableSeats: "",
        rentPerSeat: "",
      },
      virtual_office: {
        type,
        benefits: benefitMasters.map((master) => ({
          _id: master._id,
          title: master.title,
          monthlyRent: "",
          benefits: [...master.benefits],
        })),
      },
    };

    if (workspaces.some((workspace) => workspace.type === type)) return;
    onWorkspacesChange([...workspaces, defaults[type]]);
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
        monthlyRent: currentGroup?.monthlyRent ?? "",
        benefits: master.benefits.filter((item) => nextBenefits.includes(item)),
      });
    }

    updateWorkspace(workspaceIndex, { benefits });
  }

  function updateBenefitGroupRent(workspaceIndex, groupId, monthlyRent) {
    const workspace = workspaces[workspaceIndex];
    const benefits = (workspace.benefits ?? []).map((group) =>
      group._id === groupId ? { ...group, monthlyRent } : group,
    );
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
            {workspace.type === "individual_private_cabin"
              ? "Individual Private Cabin"
              : workspace.type === "dedicated_coworking_desk"
                ? "Dedicated Coworking Desk"
                : "Virtual Office"}
          </h4>

          {workspace.type === "individual_private_cabin" && (
            <div className="flex flex-col gap-4">
              <p className="text-xs text-gray-500">
                {workspace.available} individual private cabins
              </p>
              {workspace.config.map((cabin, configIndex) => (
                <div
                  key={configIndex}
                  className="rounded-lg bg-gray-50 p-3"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-xs font-semibold text-gray-700">
                      Individual Private Cabin {configIndex + 1}
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
                Add Individual Private Cabin
              </button>
            </div>
          )}

          {workspace.type === "dedicated_coworking_desk" && (
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

          {workspace.type === "virtual_office" && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-600">
                  Benefit Plans and Monthly Rent
                </p>
                {benefitMasters.map((master) => {
                  const selectedGroup = (workspace.benefits ?? []).find(
                    (group) => group._id === master._id,
                  );
                  const displayedBenefits = [
                    ...master.benefits,
                    ...(selectedGroup?.benefits ?? []),
                  ].filter(
                    (benefit, index, benefits) =>
                      benefits.findIndex(
                        (item) => item.trim().toLowerCase() === benefit.trim().toLowerCase(),
                      ) === index,
                  );
                  return (
                    <div
                      key={master._id}
                      className="rounded-lg border border-gray-100 p-3"
                    >
                      <div>
                        <span className="mb-2 block text-xs font-semibold text-gray-500">
                          {master.title}{!master.isActive ? " (inactive)" : ""}
                        </span>
                        <span className="flex flex-col gap-2">
                          {displayedBenefits.map((benefit) => (
                            <span key={benefit} className="flex items-start gap-2 text-sm text-gray-700">
                              <input
                                type="checkbox"
                                checked={(selectedGroup?.benefits ?? []).some(
                                  (selectedBenefit) =>
                                    selectedBenefit.trim().toLowerCase() === benefit.trim().toLowerCase(),
                                )}
                                onChange={() => toggleBenefit(workspaceIndex, master, benefit)}
                                className="mt-0.5 h-4 w-4 accent-[var(--primary-color)]"
                              />
                              <span>{benefit}</span>
                            </span>
                          ))}
                        </span>
                        {selectedGroup && (
                          <div className="mt-3">
                            <FormField label="Monthly Rent (₹)">
                              <NumberInput
                                value={selectedGroup.monthlyRent ?? ""}
                                onChange={(value) =>
                                  updateBenefitGroupRent(workspaceIndex, master._id, value)
                                }
                                min={1}
                              />
                            </FormField>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {(workspace.benefits ?? [])
                  .filter(
                    (group) =>
                      !benefitMasters.some((master) => master._id === group._id),
                  )
                  .map((group) => (
                    <div key={group._id} className="rounded-lg border border-gray-100 p-3">
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
                      <div className="mt-3">
                        <FormField label="Monthly Rent (₹)">
                          <NumberInput
                            value={group.monthlyRent ?? ""}
                            onChange={(value) =>
                              updateBenefitGroupRent(workspaceIndex, group._id, value)
                            }
                            min={1}
                          />
                        </FormField>
                      </div>
                    </div>
                  ))}
                {benefitMasters.length === 0 &&
                  (workspace.benefits ?? []).length === 0 && (
                    <p className="text-xs text-gray-500">
                      No active Virtual Office benefit plans are available.
                    </p>
                  )}
              </div>
            </div>
          )}
        </div>
      ))}

      {workspaces.length < 3 && (
        <div className="flex flex-wrap gap-2">
          {[
            ["dedicated_coworking_desk", "Add Dedicated Coworking Desk"],
            ["individual_private_cabin", "Add Individual Private Cabin"],
            ["virtual_office", "Add Virtual Office"],
          ]
            .filter(([type]) => !workspaces.some((workspace) => workspace.type === type))
            .map(([type, label]) => (
              <button
                key={type}
                type="button"
                onClick={() => addWorkspace(type)}
                className="flex items-center gap-2 rounded-md border border-[var(--primary-color)] px-3 py-2 text-xs font-semibold text-[var(--primary-color)]"
              >
                <FiPlus size={14} />
                {label}
              </button>
            ))}
        </div>
      )}
    </Section>
  );
}
