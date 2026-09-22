import { Section, Grid, FormField, TextInput, NumberInput, SelectField, AreaField, DateField } from "./EditFormShared";

const OWNERSHIP_OPTIONS = [{ value: "Freehold", label: "Freehold" }, { value: "Leasehold", label: "Leasehold" }, { value: "CooperativeSociety", label: "Cooperative Society" }, { value: "PowerOfAttorney", label: "Power of Attorney" }];
const ZONE_OPTIONS = ["Industrial", "Commercial", "Residential", "SEZ", "OpenSpaces", "Agricultural", "Others"];
const LOCATION_HUB_OPTIONS = ["IT Park", "Business Park", "Mall", "Commercial Project", "Residential Project", "Retail Complex/Building", "Market/High Street", "Others"];
const STATUS_OPTIONS = [{ value: "ReadyToMove", label: "Ready for Construction" }, { value: "UnderConstruction", label: "Approved for Development" }];

export default function PlotEditForm({ listing, form, onChange }) {
  const plot = form.plotDetails ?? {};
  const com = form.commercialDetails ?? {};
  const sell = form.sellInfo ?? {};
  const isSell = !!listing.sellInfo;

  const setPlot = (key, val) => onChange("plotDetails", { ...plot, [key]: val });
  const setCom = (key, val) => onChange("commercialDetails", { ...com, [key]: val });
  const setSell = (key, val) => onChange("sellInfo", { ...sell, [key]: val });
  const setPlotArea = (field, val) => setPlot("plotArea", { ...(plot.plotArea ?? {}), [field]: val });
  const setComArea = (key, field, val) => setCom(key, { ...(com[key] ?? {}), [field]: val });

  return (
    <div className="flex flex-col gap-5">
      <Section title="Plot Specifications">
        <Grid>
          <FormField label="Plot Area" required>
            <AreaField value={plot.plotArea?.value ?? ""} unit={plot.plotArea?.unit ?? "sqft"} onValueChange={(v) => setPlotArea("value", v)} onUnitChange={(u) => setPlotArea("unit", u)} placeholder="Enter area" />
          </FormField>
          <FormField label="Society / Layout Name">
            <TextInput value={plot.societyName ?? ""} onChange={(v) => setPlot("societyName", v)} placeholder="e.g. Green Valley Layout" />
          </FormField>
        </Grid>

        <Grid cols={2}>
          <FormField label="Length (ft)" required>
            <NumberInput value={plot.length ?? ""} onChange={(v) => setPlot("length", v)} placeholder="Length" min={0} />
          </FormField>
          <FormField label="Width (ft)" required>
            <NumberInput value={plot.width ?? ""} onChange={(v) => setPlot("width", v)} placeholder="Width" min={0} />
          </FormField>
        </Grid>

        {plot.length && plot.width && (
          <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
            <p className="text-xs text-blue-600 font-semibold mb-1">Calculated Perimeter</p>
            <p className="text-lg font-bold text-blue-700">{2 * (Number(plot.length) + Number(plot.width))} ft</p>
          </div>
        )}
      </Section>

      <Section title="Legal & Location">
        <Grid>
          <FormField label="Ownership Type">
            <SelectField value={com.ownership ?? ""} onChange={(v) => setCom("ownership", v)} options={OWNERSHIP_OPTIONS} placeholder="Select ownership" />
          </FormField>
          <FormField label="Zone Type">
            <SelectField value={com.zoneType ?? ""} onChange={(v) => setCom("zoneType", v)} options={ZONE_OPTIONS} placeholder="Select zone" />
          </FormField>
          <FormField label="Location Hub">
            <SelectField value={com.locationHub ?? ""} onChange={(v) => setCom("locationHub", v)} options={LOCATION_HUB_OPTIONS} placeholder="Select hub" />
          </FormField>
        </Grid>
      </Section>

      {isSell && (
        <Section title="Sale Details">
          <Grid>
            <FormField label="Sale Price (₹)" required>
              <NumberInput value={sell.price ?? ""} onChange={(v) => setSell("price", v)} placeholder="e.g. 5000000" />
            </FormField>
            <FormField label="Status">
              <SelectField value={sell.constructionStatus ?? ""} onChange={(v) => setSell("constructionStatus", v)} options={STATUS_OPTIONS} placeholder="Select status" />
            </FormField>
            {sell.constructionStatus === "UnderConstruction" && (
              <FormField label="Available From">
                <DateField value={sell.availableFrom ?? ""} onChange={(v) => setSell("availableFrom", v)} />
              </FormField>
            )}
          </Grid>
        </Section>
      )}
    </div>
  );
}
