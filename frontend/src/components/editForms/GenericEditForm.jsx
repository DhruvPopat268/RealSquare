import { Section, Grid, FormField, TextInput, NumberInput, SelectField, DateField } from "./EditFormShared";
import { FiInfo } from "react-icons/fi";

const STATUS_OPTIONS = [{ value: "ReadyToMove", label: "Ready to Move" }, { value: "UnderConstruction", label: "Under Construction" }];
const PROPERTY_STATUS_OPTIONS = [{ value: "NewlyAdded", label: "Newly Added" }, { value: "Relaunch", label: "Re-release" }];

export default function GenericEditForm({ listing, form, onChange }) {
  const res = form.residentialDetails ?? {};
  const plot = form.plotDetails ?? {};
  const pg = form.pgDetails ?? {};
  const com = form.commercialDetails ?? {};
  const sell = form.sellInfo ?? {};
  const rent = form.rentInfo ?? {};
  const statusSection = listing.residentialDetails ? "residentialDetails" : listing.commercialDetails ? "commercialDetails" : listing.pgDetails ? "pgDetails" : null;
  const propertyStatus = statusSection ? form[statusSection] ?? {} : {};

  const setField = (path, val) => {
    const parts = path.split(".");
    if (parts.length === 1) onChange(path, val);
    else {
      const [section, key] = parts;
      const current = form[section] ?? {};
      onChange(section, { ...current, [key]: val });
    }
  };

  const fields = [];

  // Residential
  if (res.bhk != null) fields.push({ label: "BHK", path: "residentialDetails.bhk", type: "number", value: res.bhk });
  if (res.builtUpArea?.value) fields.push({ label: "Built-up Area", path: "residentialDetails.builtUpArea.value", type: "number", value: res.builtUpArea.value, hint: res.builtUpArea.unit });
  if (res.furnishType) fields.push({ label: "Furnishing", path: "residentialDetails.furnishType", type: "text", value: res.furnishType, readonly: true });
  if (res.societyName) fields.push({ label: "Society/Building", path: "residentialDetails.societyName", type: "text", value: res.societyName });

  // Plot
  if (plot.plotArea?.value) fields.push({ label: "Plot Area", path: "plotDetails.plotArea.value", type: "number", value: plot.plotArea.value, hint: plot.plotArea.unit });
  if (plot.length) fields.push({ label: "Length (ft)", path: "plotDetails.length", type: "number", value: plot.length });
  if (plot.width) fields.push({ label: "Width (ft)", path: "plotDetails.width", type: "number", value: plot.width });

  // Commercial
  if (com.builtUpArea?.value) fields.push({ label: "Built-up Area", path: "commercialDetails.builtUpArea.value", type: "number", value: com.builtUpArea.value });
  if (com.carpetArea?.value) fields.push({ label: "Carpet Area", path: "commercialDetails.carpetArea.value", type: "number", value: com.carpetArea.value });
  if (com.ownership) fields.push({ label: "Ownership", path: "commercialDetails.ownership", type: "text", value: com.ownership, readonly: true });
  if (com.zoneType) fields.push({ label: "Zone Type", path: "commercialDetails.zoneType", type: "text", value: com.zoneType, readonly: true });

  // PG
  if (pg.pgName) fields.push({ label: "PG Name", path: "pgDetails.pgName", type: "text", value: pg.pgName });
  if (pg.pgFor) fields.push({ label: "PG For", path: "pgDetails.pgFor", type: "text", value: pg.pgFor, readonly: true });
  if (pg.totalBedsAvailable != null) fields.push({ label: "Total Beds", path: "pgDetails.totalBedsAvailable", type: "number", value: pg.totalBedsAvailable });

  // Sell/Rent
  if (sell.price) fields.push({ label: "Sale Price (₹)", path: "sellInfo.price", type: "number", value: sell.price });
  if (rent.monthlyRent) fields.push({ label: "Monthly Rent (₹)", path: "rentInfo.monthlyRent", type: "number", value: rent.monthlyRent });
  if (listing.rentInfo) fields.push({ label: "Security Deposit (₹)", path: "rentInfo.securityDeposit", type: "number", value: rent.securityDeposit });
  if (statusSection) {
    if (statusSection !== "pgDetails") {
      fields.push({ label: "Property Status", path: `${statusSection}.propertyStatus`, type: "property-select", value: propertyStatus.propertyStatus });
    }
    fields.push({ label: "Construction Status", path: `${statusSection}.constructionStatus`, type: "select", value: propertyStatus.constructionStatus });
    fields.push({ label: "Age of Property (years)", path: `${statusSection}.ageOfProperty`, type: "number", value: propertyStatus.ageOfProperty });
    if (propertyStatus.constructionStatus === "UnderConstruction") {
      fields.push({ label: "Available From", path: `${statusSection}.availableFrom`, type: "date", value: propertyStatus.availableFrom });
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
        <FiInfo className="text-blue-500 mt-0.5 flex-shrink-0" size={18} />
        <p className="text-sm text-blue-700">Detailed breakdown for this property type is coming soon. Below is all available information for this listing.</p>
      </div>

      {fields.length > 0 && (
        <Section title="Property Details">
          <Grid cols={2}>
            {fields.map((f, i) => (
              <FormField key={i} label={f.label} hint={f.hint}>
                {f.readonly ? (
                  <div className="px-3 py-2.5 text-sm text-gray-600 bg-gray-50 rounded-xl border border-gray-200">{f.value}</div>
                ) : f.type === "select" ? (
                  <SelectField value={f.value ?? ""} onChange={(v) => setField(f.path, v)} options={STATUS_OPTIONS} placeholder="Select status" />
                ) : f.type === "property-select" ? (
                  <SelectField value={f.value ?? ""} onChange={(v) => setField(f.path, v)} options={PROPERTY_STATUS_OPTIONS} placeholder="Select property status" />
                ) : f.type === "date" ? (
                  <DateField value={f.value ?? ""} onChange={(v) => setField(f.path, v)} />
                ) : f.type === "number" ? (
                  <NumberInput value={f.value ?? ""} onChange={(v) => setField(f.path, v)} />
                ) : (
                  <TextInput value={f.value ?? ""} onChange={(v) => setField(f.path, v)} />
                )}
              </FormField>
            ))}
          </Grid>
        </Section>
      )}
    </div>
  );
}
