import { Section, Grid, FormField, TextInput, NumberInput, SelectField, AreaField, DateField } from "./EditFormShared";
import FurnishingsAmenitiesSection from "./FurnishingsAmenitiesSection";

const BHK_OPTIONS = ["1 RK","1","2","3","4","5","6","7","8","9","10","11","12"].map((v) => ({ value: v === "1 RK" ? "1 RK" : Number(v), label: v === "1 RK" ? "1 RK" : `${v} BHK` }));
const STATUS_OPTIONS = [{ value: "ReadyToMove", label: "Ready to Move" }, { value: "UnderConstruction", label: "Under Construction" }];
const DEPOSIT_OPTIONS = [{ value: "None", label: "None" }, { value: "1Month", label: "1 Month" }, { value: "2Month", label: "2 Months" }, { value: "Custom", label: "Custom Amount" }];

export default function ResidentialEditForm({ listing, form, onChange, furnishingsAmenities, showFurnishings }) {
  const res  = form.residentialDetails ?? {};
  const sell = form.sellInfo ?? {};
  const rent = form.rentInfo ?? {};
  const isSell = !!listing.sellInfo;
  const isRent = !!listing.rentInfo;

  const setRes     = (key, val) => onChange("residentialDetails", { ...res, [key]: val });
  const setSell    = (key, val) => onChange("sellInfo", { ...sell, [key]: val });
  const setRent    = (key, val) => onChange("rentInfo", { ...rent, [key]: val });
  const setResArea = (key, field, val) => setRes(key, { ...(res[key] ?? {}), [field]: val });

  return (
    <div className="flex flex-col gap-5">
      <Section title="Property Details">
        <Grid>
          <FormField label="Society / Building Name">
            <TextInput value={res.societyName ?? ""} onChange={(v) => setRes("societyName", v)} placeholder="e.g. Green Valley Apartments" />
          </FormField>
          <FormField label="BHK / Configuration">
            <SelectField value={res.bhk ?? ""} onChange={(v) => setRes("bhk", v === "" ? "" : (v === "1 RK" ? "1 RK" : Number(v)))} options={BHK_OPTIONS} placeholder="Select BHK" />
          </FormField>
          <FormField label="Built-up Area">
            <AreaField value={res.builtUpArea?.value ?? ""} unit={res.builtUpArea?.unit ?? "sqft"} onValueChange={(v) => setResArea("builtUpArea", "value", v)} onUnitChange={(u) => setResArea("builtUpArea", "unit", u)} placeholder="Enter area" />
          </FormField>
        </Grid>
      </Section>

      {/* Furnishings & Amenities — only for non-plot residential */}
      {showFurnishings && (
        <FurnishingsAmenitiesSection
          availableFurnishings={furnishingsAmenities?.furnishings ?? []}
          availableAmenities={furnishingsAmenities?.amenities ?? []}
          furnishType={res.furnishType ?? ""}
          selectedFurnishings={res.furnishings ?? []}
          selectedAmenities={res.amenities ?? []}
          onFurnishTypeChange={(v) => setRes("furnishType", v)}
          onFurnishingsChange={(v) => setRes("furnishings", v)}
          onAmenitiesChange={(v) => setRes("amenities", v)}
        />
      )}

      {isSell && (
        <Section title="Sale Details">
          <Grid>
            <FormField label="Sale Price (₹)" required>
              <NumberInput value={sell.price ?? ""} onChange={(v) => setSell("price", v)} placeholder="e.g. 5000000" />
            </FormField>
            <FormField label="Construction Status">
              <SelectField value={sell.constructionStatus ?? ""} onChange={(v) => setSell("constructionStatus", v)} options={STATUS_OPTIONS} placeholder="Select status" />
            </FormField>
            {sell.constructionStatus === "ReadyToMove" && (
              <FormField label="Age of Property (years)">
                <NumberInput value={sell.ageOfProperty ?? ""} onChange={(v) => setSell("ageOfProperty", v)} placeholder="e.g. 3" min={0} />
              </FormField>
            )}
            {sell.constructionStatus === "UnderConstruction" && (
              <FormField label="Available From">
                <DateField value={sell.availableFrom ?? ""} onChange={(v) => setSell("availableFrom", v)} />
              </FormField>
            )}
          </Grid>
        </Section>
      )}

      {isRent && (
        <Section title="Rent Details">
          <Grid>
            <FormField label="Monthly Rent (₹)" required>
              <NumberInput value={rent.monthlyRent ?? ""} onChange={(v) => setRent("monthlyRent", v)} placeholder="e.g. 20000" />
            </FormField>
            <FormField label="Available From">
              <DateField value={rent.availableFrom ?? ""} onChange={(v) => setRent("availableFrom", v)} />
            </FormField>
            <FormField label="Security Deposit">
              <SelectField value={rent.securityDeposit?.type ?? ""} onChange={(v) => setRent("securityDeposit", { ...rent.securityDeposit, type: v, amount: v !== "Custom" ? undefined : rent.securityDeposit?.amount })} options={DEPOSIT_OPTIONS} placeholder="Select deposit type" />
            </FormField>
            {rent.securityDeposit?.type === "Custom" && (
              <FormField label="Deposit Amount (₹)">
                <NumberInput value={rent.securityDeposit?.amount ?? ""} onChange={(v) => setRent("securityDeposit", { ...rent.securityDeposit, amount: v })} placeholder="e.g. 50000" />
              </FormField>
            )}
          </Grid>
        </Section>
      )}
    </div>
  );
}
