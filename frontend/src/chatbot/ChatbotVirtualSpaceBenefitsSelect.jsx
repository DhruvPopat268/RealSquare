import { useState } from "react";
import { FiCheck } from "react-icons/fi";
import { primaryColor } from "../utils/theme";

export default function ChatbotVirtualSpaceBenefitsSelect({ groups, onSubmit }) {
  const [selected, setSelected] = useState({});

  function toggleBenefit(group, benefit) {
    setSelected((current) => {
      const selectedBenefits = current[group._id] ?? [];
      const benefits = selectedBenefits.includes(benefit)
        ? selectedBenefits.filter((item) => item !== benefit)
        : [...selectedBenefits, benefit];

      return { ...current, [group._id]: benefits };
    });
  }

  const selection = groups
    .map((group) => ({
      _id: group._id,
      title: group.title,
      benefits: selected[group._id] ?? [],
    }))
    .filter((group) => group.benefits.length > 0);

  const canConfirm = selection.length > 0;

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex max-h-64 flex-col gap-3 overflow-y-auto pr-1">
        {groups.map((group) => (
          <section
            key={group._id}
            className="rounded-xl border border-gray-200 p-3"
          >
            <h3 className="mb-2 text-sm font-semibold text-gray-800">
              {group.title}
            </h3>
            <div className="flex flex-wrap gap-2">
              {group.benefits.map((benefit) => {
                const active = (selected[group._id] ?? []).includes(benefit);

                return (
                  <button
                    key={`${group._id}-${benefit}`}
                    type="button"
                    onClick={() => toggleBenefit(group, benefit)}
                    className="rounded-full border-2 px-3 py-1.5 text-left text-sm font-medium transition"
                    style={
                      active
                        ? {
                            backgroundColor: primaryColor,
                            borderColor: primaryColor,
                            color: "white",
                          }
                        : {
                            backgroundColor: "white",
                            borderColor: "#e5e7eb",
                            color: "#4b5563",
                          }
                    }
                  >
                    {active && (
                      <FiCheck size={11} className="mr-1 inline -mt-0.5" />
                    )}
                    {benefit}
                  </button>
                );
              })}
            </div>
          </section>
        ))}
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
