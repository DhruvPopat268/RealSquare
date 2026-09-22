import { Section, Grid, FormField, TextInput, NumberInput, SelectField, AreaField, DateField } from "./EditFormShared";
import FurnishingsAmenitiesSection from "./FurnishingsAmenitiesSection";

const OWNERSHIP_OPTIONS = [{ value: "Freehold", label: "Freehold" }, { value: "Leasehold", label: "Leasehold" }, { value: "CooperativeSociety", label: "Cooperative Society" }, { value: "PowerOfAttorney", label: "Power of Attorney" }];
const ZONE_OPTIONS = ["Industrial", "Commercial", "Residential", "SEZ", "OpenSpaces", "Agricultural", "Others"];
const LOCATION_HUB_OPTIONS = ["IT Park", "Business Park", "Mall", "Commercial Project", "Residential Project", "Retail Complex/Building", "Market/High Street", "Others"];
const STATUS_OPTIONS = [{ value: "ReadyToMove", label: "Ready to Move" }, { value: "UnderConstruction", label: "Under Construction" }];

export default function CommercialEditForm({ listing, form, onChange, furnishingsAmenities, showFurnishings }) {
  const com  = form.commercialDetails ?? {};
  const sell = form.sellInfo ?? {};
  const rent = form.rentInfo ?? {};
  const isSell = !!listing.sellInfo;
  const isRent = !!listing.rentInfo;
  const propType = listing.propertyType?.name ?? "";
  const isOffice = propType.toLowerCase().includes("office") || com.minSeats != null || com.minCabins != null;
  const isPlot = listing.commercialDetails?.plotArea ? true : false;

  const setCom     = (key, val) => onChange("commercialDetails", { ...com, [key]: val });
  const setSell    = (key, val) => onChange("sellInfo", { ...sell, [key]: val });
  const setRent    = (key, val) => onChange("rentInfo", { ...rent, [key]: val });
  const setComArea = (key, field, val) => setCom(key, { ...(com[key] ?? {}), [field]: val });

  return (
    <div className="flex flex-col gap-5">
      <Section title="Property Details">
        <Grid>
          <FormField label="Building / Project Name">
            <TextInput value={com.societyName ?? ""} onChange={(v) => setCom("societyName", v)} placeholder="e.g. Tech Park Tower" />
          </FormField>
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

      {!isPlot && (
        <Section title="Area Details">
          <Grid>
            <FormField label="Built-up Area">
              <AreaField value={com.builtUpArea?.value ?? ""} unit={com.builtUpArea?.unit ?? "sqft"} onValueChange={(v) => setComArea("builtUpArea", "value", v)} onUnitChange={(u) => setComArea("builtUpArea", "unit", u)} placeholder="Enter area" />
            </FormField>
            <FormField label="Carpet Area">
              <AreaField value={com.carpetArea?.value ?? ""} unit={com.carpetArea?.unit ?? "sqft"} onValueChange={(v) => setComArea("carpetArea", "value", v)} onUnitChange={(u) => setComArea("carpetArea", "unit", u)} placeholder="Enter area" />
              {com.carpetArea?.value && com.builtUpArea?.value && Number(com.carpetArea.value) > Number(com.builtUpArea.value) && (
                <p className="text-xs text-red-500 mt-1">Carpet area cannot be greater than built-up area ({com.builtUpArea.value} {com.builtUpArea.unit ?? "sqft"})</p>
              )}
            </FormField>
          </Grid>
        </Section>
      )}

      {isPlot && (
        <Section title="Plot Details">
          <Grid>
            <FormField label="Plot Area">
              <AreaField value={com.plotArea?.value ?? ""} unit={com.plotArea?.unit ?? "sqft"} onValueChange={(v) => setComArea("plotArea", "value", v)} onUnitChange={(u) => setComArea("plotArea", "unit", u)} placeholder="Enter area" />
            </FormField>
            <Grid cols={2}>
              <FormField label="Length (ft)">
                <NumberInput value={com.length ?? ""} onChange={(v) => setCom("length", v)} placeholder="Length" />
              </FormField>
              <FormField label="Width (ft)">
                <NumberInput value={com.width ?? ""} onChange={(v) => setCom("width", v)} placeholder="Width" />
              </FormField>
            </Grid>
          </Grid>
        </Section>
      )}

      <Section title="Floor Information">
        <Grid>
          <FormField label="Total Floors">
            <NumberInput value={com.totalFloors ?? ""} onChange={(v) => setCom("totalFloors", v)} placeholder="Number of floors" min={0} />
          </FormField>
          <FormField label="Your Floor">
            <TextInput value={com.yourFloor ?? ""} onChange={(v) => setCom("yourFloor", v)} placeholder="e.g. 3rd, Ground, etc." />
          </FormField>
        </Grid>
      </Section>

      {isOffice && (
        <Section title="Office Specifications">
          <Grid cols={3}>
            <FormField label="Min Workstations">
              <NumberInput value={com.minSeats ?? ""} onChange={(v) => setCom("minSeats", v)} placeholder="Number of seats" min={0} />
            </FormField>
            <FormField label="Min Cabins">
              <NumberInput value={com.minCabins ?? ""} onChange={(v) => setCom("minCabins", v)} placeholder="Number of cabins" min={0} />
            </FormField>
            <FormField label="Min Meeting Rooms">
              <NumberInput value={com.minMeetingRooms ?? ""} onChange={(v) => setCom("minMeetingRooms", v)} placeholder="Number of rooms" min={0} />
            </FormField>
          </Grid>
        </Section>
      )}

      {/* Furnishings & Amenities — hidden for commercial plots */}
      {showFurnishings && (
        <FurnishingsAmenitiesSection
          availableFurnishings={furnishingsAmenities?.furnishings ?? []}
          availableAmenities={furnishingsAmenities?.amenities ?? []}
          furnishType={com.furnishType ?? ""}
          selectedFurnishings={com.furnishings ?? []}
          selectedAmenities={com.amenities ?? []}
          onFurnishTypeChange={(v) => setCom("furnishType", v)}
          onFurnishingsChange={(v) => setCom("furnishings", v)}
          onAmenitiesChange={(v) => setCom("amenities", v)}
        />
      )}

      {isSell && (
        <Section title="Sale Details">
          <Grid>
            <FormField label="Sale Price (₹)" required>
              <NumberInput value={sell.price ?? ""} onChange={(v) => setSell("price", v)} placeholder="e.g. 5000000" />
            </FormField>
            <FormField label="Status">
              <SelectField value={sell.constructionStatus ?? ""} onChange={(v) => setSell("constructionStatus", v)} options={STATUS_OPTIONS} placeholder="Select status" />
            </FormField>
            {sell.constructionStatus === "ReadyToMove" && (
              <FormField label="Age (years)">
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
              <NumberInput value={rent.monthlyRent ?? ""} onChange={(v) => setRent("monthlyRent", v)} placeholder="e.g. 50000" />
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
