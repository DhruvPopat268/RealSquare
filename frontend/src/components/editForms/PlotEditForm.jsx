import { Section, Grid, FormField, TextInput, NumberInput, SelectField, AreaField, DateField } from "./EditFormShared";

const OWNERSHIP_OPTIONS = [{ value: "Freehold", label: "Freehold" }, { value: "Leasehold", label: "Leasehold" }, { value: "CooperativeSociety", label: "Cooperative Society" }, { value: "PowerOfAttorney", label: "Power of Attorney" }];
const ZONE_OPTIONS = ["Industrial", "Commercial", "Residential", "SEZ", "OpenSpaces", "Agricultural", "Others"];
const LOCATION_HUB_OPTIONS = ["IT Park", "Business Park", "Mall", "Commercial Project", "Residential Project", "Retail Complex/Building", "Market/High Street", "Others"];

export default function PlotEditForm({ listing, form, onChange }) {
  const plot = form.plotDetails ?? {};
  const com = form.commercialDetails ?? {};
  const rent = form.rentInfo ?? {};
  const isCommercialPlot = listing.category?.id?.toString() === import.meta.env.VITE_CATEGORY_COMMERCIAL_ID;
  const plotFields = isCommercialPlot ? com : plot;
  const sell = form.sellInfo ?? {};
  const isSell = !!listing.sellInfo;
  const isRent = !!listing.rentInfo;

  const setPlot = (key, val) => onChange("plotDetails", { ...plot, [key]: val });
  const setCom = (key, val) => onChange("commercialDetails", { ...com, [key]: val });
  const setSell = (key, val) => onChange("sellInfo", { ...sell, [key]: val });
  const setRent = (key, val) => onChange("rentInfo", { ...rent, [key]: val });
  const setPlotField = (key, val) => (isCommercialPlot ? setCom : setPlot)(key, val);
  const setPlotArea = (field, val) => setPlotField("plotArea", { ...(plotFields.plotArea ?? {}), [field]: val });

  return (
    <div className="flex flex-col gap-5">
      <Section title="Plot Specifications">
        <Grid>
          <FormField label="Plot Area" required>
            <AreaField value={plotFields.plotArea?.value ?? ""} unit={plotFields.plotArea?.unit ?? "sqft"} onValueChange={(v) => setPlotArea("value", v)} onUnitChange={(u) => setPlotArea("unit", u)} placeholder="Enter area" />
          </FormField>
          <FormField label="Society / Layout Name">
            <TextInput value={plotFields.societyName ?? ""} onChange={(v) => setPlotField("societyName", v)} placeholder="e.g. Green Valley Layout" />
          </FormField>
        </Grid>

        <Grid cols={2}>
          <FormField label="Length (ft)" required>
            <NumberInput value={plotFields.length ?? ""} onChange={(v) => setPlotField("length", v)} placeholder="Length" min={0} />
          </FormField>
          <FormField label="Width (ft)" required>
            <NumberInput value={plotFields.width ?? ""} onChange={(v) => setPlotField("width", v)} placeholder="Width" min={0} />
          </FormField>
        </Grid>

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
          </Grid>
        </Section>
      )}

      {isRent && (
        <Section title="Rent Details">
          <Grid>
            <FormField label="Monthly Rent (₹)" required>
              <NumberInput value={rent.monthlyRent ?? ""} onChange={(v) => setRent("monthlyRent", v)} placeholder="e.g. 20000" />
            </FormField>
            <FormField label="Security Deposit (₹)">
              <NumberInput value={rent.securityDeposit ?? ""} onChange={(v) => setRent("securityDeposit", v)} placeholder="e.g. 50000" min={0} />
            </FormField>
            <FormField label="Available From">
              <DateField value={rent.availableFrom ?? ""} onChange={(v) => setRent("availableFrom", v)} />
            </FormField>
          </Grid>
        </Section>
      )}
    </div>
  );
}
