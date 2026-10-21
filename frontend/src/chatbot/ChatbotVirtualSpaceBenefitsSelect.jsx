import { useState } from "react";
import { FiCheck } from "react-icons/fi";
import { primaryColor } from "../utils/theme";

export default function ChatbotVirtualSpaceBenefitsSelect({ groups, onSubmit }) {
  const [selectedBenefits, setSelectedBenefits] = useState([]);

  function toggleBenefit(groupId, benefit) {
    const key = `${groupId}:${benefit}`;
    setSelectedBenefits((current) =>
      current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key],
    );
  }

  const selection = groups
    .map((group) => ({
      _id: group._id,
      title: group.title,
      benefits: group.benefits.filter((benefit) =>
        selectedBenefits.includes(`${group._id}:${benefit}`),
      ),
    }))
    .filter((group) => group.benefits.length > 0);

  const canConfirm = selection.length > 0;

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex max-h-64 flex-col gap-3 overflow-y-auto pr-1">
        {groups.map((group) => {
          const selectedCount = group.benefits.filter((benefit) =>
            selectedBenefits.includes(`${group._id}:${benefit}`),
          ).length;

          return (
          <section
            key={group._id}
            className="rounded-xl border p-3 transition"
            style={
              selectedCount > 0
                ? { borderColor: primaryColor, backgroundColor: `${primaryColor}0D` }
                : { borderColor: "#e5e7eb", backgroundColor: "white" }
            }
          >
            <h3 className="mb-2 text-sm font-semibold text-gray-800">{group.title}</h3>
            <div className="space-y-2">
              {group.benefits.map((benefit) => {
                const checked = selectedBenefits.includes(`${group._id}:${benefit}`);
                return (
                  <label key={`${group._id}-${benefit}`} className="flex cursor-pointer items-start gap-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleBenefit(group._id, benefit)}
                      className="mt-0.5 h-4 w-4 accent-[var(--primary-color)]"
                    />
                    <span>{benefit}</span>
                    {checked && <FiCheck size={14} style={{ color: primaryColor }} aria-hidden="true" />}
                  </label>
                );
              })}
            </div>
          </section>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => canConfirm && onSubmit(selection)}
        disabled={!canConfirm}
        className="self-end rounded-xl border-none px-5 py-2 text-sm font-medium text-white transition disabled:opacity-40"
        style={{ backgroundColor: primaryColor }}
      >
        Confirm
      </button>
    </div>
  );
}
