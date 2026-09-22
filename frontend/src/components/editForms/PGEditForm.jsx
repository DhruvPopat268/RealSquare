import { useState } from "react";
import { Section, Grid, FormField, TextInput, NumberInput, SelectField, DateField, ChipGroup, Toggle } from "./EditFormShared";
import FurnishingsAmenitiesSection from "./FurnishingsAmenitiesSection";
import { FiPlus, FiX } from "react-icons/fi";

const PG_FOR_OPTIONS = ["Girls", "Boys", "Both"];
const SUITED_FOR_OPTIONS = ["Students", "Professionals"];
const MEALS_OPTIONS = ["Breakfast", "Lunch", "Dinner"];
const COMMON_AREAS_OPTIONS = ["Living Room", "Kitchen", "Dining Area", "Bathroom", "Balcony", "Terrace", "Laundry Room", "Study Room", "Gym", "Parking"];
const ROOM_TYPE_OPTIONS = ["1 Sharing", "2 Sharing", "3 Sharing", "4 Sharing", "5 Sharing", "6 Sharing", "7 Sharing"];

export default function PGEditForm({ listing, form, onChange, furnishingsAmenities }) {
  const pg   = form.pgDetails ?? {};
  const rent = form.rentInfo ?? {};
  const [newRoomType, setNewRoomType] = useState("");

  const setPg = (key, val) => onChange("pgDetails", { ...pg, [key]: val });
  const setRent = (key, val) => onChange("rentInfo", { ...rent, [key]: val });

  const handleAddRoom = () => {
    if (!newRoomType) return;
    const rooms = [...(pg.rooms ?? []), { roomType: newRoomType, bedsAvailable: 1, rent: 0, securityDeposit: 0 }];
    setPg("rooms", rooms);
    setNewRoomType("");
  };

  const handleDeleteRoom = (i) => {
    const rooms = pg.rooms?.filter((_, idx) => idx !== i) ?? [];
    setPg("rooms", rooms);
  };

  const handleUpdateRoom = (i, key, val) => {
    const rooms = [...(pg.rooms ?? [])];
    rooms[i] = { ...rooms[i], [key]: val };
    setPg("rooms", rooms);
  };

  return (
    <div className="flex flex-col gap-5">
      <Section title="PG Overview">
        <Grid>
          <FormField label="PG Name" required>
            <TextInput value={pg.pgName ?? ""} onChange={(v) => setPg("pgName", v)} placeholder="e.g. Green Valley Hostel" />
          </FormField>
          <FormField label="Total Beds Available" required>
            <NumberInput value={pg.totalBedsAvailable ?? ""} onChange={(v) => setPg("totalBedsAvailable", v)} placeholder="e.g. 20" min={1} />
          </FormField>
          <FormField label="Accommodation For" required>
            <SelectField value={pg.pgFor ?? ""} onChange={(v) => setPg("pgFor", v)} options={PG_FOR_OPTIONS} placeholder="Select accommodation" />
          </FormField>
          <FormField label="Best Suited For">
            <div className="pt-1">
              <ChipGroup options={SUITED_FOR_OPTIONS} selected={pg.bestSuitedFor ?? []} onToggle={(v) => {
                const next = pg.bestSuitedFor?.includes(v) ? pg.bestSuitedFor.filter((x) => x !== v) : [...(pg.bestSuitedFor ?? []), v];
                setPg("bestSuitedFor", next);
              }} />
            </div>
          </FormField>
        </Grid>
      </Section>

      <Section title="Meals">
        <Grid>
          <FormField label="Meals Available">
            <Toggle value={pg.mealsAvailable ?? false} onChange={(v) => setPg("mealsAvailable", v)} label="Include meals" />
          </FormField>
          {pg.mealsAvailable && (
            <FormField label="Available Meals">
              <div className="pt-1">
                <ChipGroup options={MEALS_OPTIONS} selected={pg.meals ?? []} onToggle={(v) => {
                  const next = pg.meals?.includes(v) ? pg.meals.filter((x) => x !== v) : [...(pg.meals ?? []), v];
                  setPg("meals", next);
                }} />
              </div>
            </FormField>
          )}
        </Grid>
      </Section>

      <Section title="Policies">
        <Grid cols={2}>
          <FormField label="Notice Period (days)">
            <NumberInput value={pg.noticePeriod ?? ""} onChange={(v) => setPg("noticePeriod", v)} placeholder="e.g. 30" min={0} />
          </FormField>
          <FormField label="Lock-in Period (days)">
            <NumberInput value={pg.lockInPeriod ?? ""} onChange={(v) => setPg("lockInPeriod", v)} placeholder="e.g. 180" min={0} />
          </FormField>
        </Grid>
      </Section>

      <Section title="Common Areas">
        <div className="pt-1">
          <ChipGroup options={COMMON_AREAS_OPTIONS} selected={pg.commonAreas ?? []} onToggle={(v) => {
            const next = pg.commonAreas?.includes(v) ? pg.commonAreas.filter((x) => x !== v) : [...(pg.commonAreas ?? []), v];
            setPg("commonAreas", next);
          }} />
        </div>
      </Section>

      <Section title="Room Options & Pricing">
        <div className="flex flex-col gap-4">
          {pg.rooms?.map((room, i) => (
            <div key={i} className="border border-gray-200 rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-800">{room.roomType}</h4>
                <button type="button" onClick={() => handleDeleteRoom(i)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition">
                  <FiX size={14} />
                </button>
              </div>
              <Grid cols={2}>
                <FormField label="Beds Available" required>
                  <NumberInput value={room.bedsAvailable ?? 1} onChange={(v) => handleUpdateRoom(i, "bedsAvailable", v)} min={1} />
                </FormField>
                <FormField label="Monthly Rent (₹)" required>
                  <NumberInput value={room.rent ?? ""} onChange={(v) => handleUpdateRoom(i, "rent", v)} min={0} />
                </FormField>
                <FormField label="Security Deposit (₹)">
                  <NumberInput value={room.securityDeposit ?? ""} onChange={(v) => handleUpdateRoom(i, "securityDeposit", v)} min={0} />
                </FormField>
              </Grid>
            </div>
          ))}

          <div className="flex flex-col gap-2 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wide">Add Room</p>
            <div className="flex gap-2">
              <SelectField value={newRoomType} onChange={setNewRoomType} options={ROOM_TYPE_OPTIONS} placeholder="Select room type" />
              <button type="button" onClick={handleAddRoom} className="flex items-center gap-1 px-4 py-2 bg-[#7B2FFF] text-white rounded-xl font-semibold hover:bg-[#6320d4] transition">
                <FiPlus size={14} />
                Add
              </button>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Availability">
        <Grid>
          <FormField label="Available From">
            <DateField value={rent.availableFrom ?? ""} onChange={(v) => setRent("availableFrom", v)} />
          </FormField>
        </Grid>
      </Section>

      {/* Furnishings & Amenities — always shown for PG */}
      <FurnishingsAmenitiesSection
        availableFurnishings={furnishingsAmenities?.furnishings ?? []}
        availableAmenities={furnishingsAmenities?.amenities ?? []}
        furnishType={pg.furnishType ?? ""}
        selectedFurnishings={pg.furnishings ?? []}
        selectedAmenities={pg.amenities ?? []}
        onFurnishTypeChange={(v) => setPg("furnishType", v)}
        onFurnishingsChange={(v) => setPg("furnishings", v)}
        onAmenitiesChange={(v) => setPg("amenities", v)}
      />
    </div>
  );
}
