import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FiArrowLeft, FiBriefcase, FiCheckCircle, FiMapPin, FiUser } from "react-icons/fi";
import api from "../utils/axiosInterceptor";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { primaryColor } from "../utils/theme";

const API_URL = import.meta.env.VITE_API_URL;

function Detail({ label, value, href }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="min-w-0 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">{label}</p>
      {href ? <a href={href} className="mt-1 block break-words text-sm font-semibold text-[#1a1a2e] hover:underline">{value}</a>
        : <p className="mt-1 break-words text-sm font-semibold text-[#1a1a2e]">{value}</p>}
    </div>
  );
}

function Section({ title, icon, children }) {
  return (
    <section className="mt-6">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-extrabold text-[#1a1a2e]">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: `${primaryColor}14`, color: primaryColor }}>{icon}</span>
        {title}
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">{children}</div>
    </section>
  );
}

export default function PublicProfilePage() {
  const { encryptedId } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const endpoint = useMemo(() => `${API_URL}/api/mixed/unprotected/profile/${encodeURIComponent(encryptedId || "")}`, [encryptedId]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    api.get(endpoint, { withCredentials: true })
      .then(({ data }) => { if (active && data.success) setProfile(data.data); })
      .catch((requestError) => {
        if (active) setError(requestError.response?.data?.message || "This profile link is invalid or no longer available.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [endpoint]);

  const owner = profile?.roleKey === "owner" ? profile.businessDetails : null;
  const broker = profile?.roleKey === "broker" ? profile.brokerDetails : null;
  const builder = profile?.roleKey === "builder" ? profile.builderDetails : null;

  return (
    <div className="min-h-screen bg-[#f7f8fb]">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <Link to="/" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#1a1a2e]"><FiArrowLeft size={16} /> RealSquare</Link>
        {loading ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center text-sm text-gray-500">Loading profile…</div>
        ) : error || !profile ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center">
            <h1 className="text-lg font-extrabold text-[#1a1a2e]">Profile unavailable</h1>
            <p className="mt-2 text-sm text-gray-500">{error || "This profile link is invalid or no longer available."}</p>
          </div>
        ) : (
          <article className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="h-2" style={{ backgroundColor: primaryColor }} />
            <div className="p-5 sm:p-8">
              <header className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 bg-gray-50" style={{ borderColor: `${primaryColor}30` }}>
                  {profile.profilePhoto ? <img src={profile.profilePhoto} alt={profile.name} className="h-full w-full object-cover" /> : <FiUser size={34} style={{ color: primaryColor }} />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold uppercase tracking-wider" style={{ color: primaryColor }}>RealSquare Profile</p>
                  <h1 className="mt-1 break-words text-2xl font-extrabold text-[#1a1a2e]">{profile.name}</h1>
                  <p className="mt-1 text-sm font-semibold text-gray-500">{profile.role}</p>
                  {(profile.location || profile.state) && <p className="mt-2 flex items-center justify-center gap-1.5 text-sm text-gray-500 sm:justify-start"><FiMapPin size={15} /> {[profile.location, profile.state].filter(Boolean).join(", ")}</p>}
                </div>
              </header>

              <Section title="Contact details" icon={<FiUser size={16} />}>
                <Detail label="Mobile number" value={profile.mobile} href={profile.mobile ? `tel:${profile.mobile}` : undefined} />
                <Detail label="Email" value={profile.email} href={profile.email ? `mailto:${profile.email}` : undefined} />
                <Detail label="Location" value={profile.location} />
                <Detail label="State" value={profile.state} />
              </Section>

              {owner && <Section title="Business details" icon={<FiBriefcase size={16} />}>
                {owner.logo && <div className="sm:col-span-2"><img src={owner.logo} alt={`${owner.name || profile.name} logo`} className="h-16 max-w-48 rounded-lg border border-gray-100 object-contain p-2" /></div>}
                <Detail label="Business name" value={owner.name} />
                <Detail label="Business type" value={owner.type?.replaceAll("_", " ")} />
                <Detail label="GST number" value={owner.gstNumber} />
                <Detail label="Business email" value={owner.email} href={owner.email ? `mailto:${owner.email}` : undefined} />
                <Detail label="Business mobile" value={owner.mobile} href={owner.mobile ? `tel:${owner.mobile}` : undefined} />
                <Detail label="Website" value={owner.website} href={owner.website} />
              </Section>}

              {broker && <Section title="Broker / agent details" icon={<FiBriefcase size={16} />}>
                <Detail label="Agency name" value={broker.agencyName} />
                <Detail label="RERA registration ID" value={broker.reraId} />
                <div className="min-w-0 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">RERA verification</p>
                  <p className={`mt-1 flex items-center gap-1.5 text-sm font-semibold ${broker.reraVerified ? "text-green-700" : "text-gray-600"}`}>
                    <FiCheckCircle size={15} /> {broker.reraVerified ? "Verified" : "Not verified"}
                  </p>
                </div>
                <Detail label="Years of experience" value={broker.yearsOfExperience} />
                <Detail label="Bio" value={broker.bio} />
              </Section>}

              {builder && <Section title="Builder / developer details" icon={<FiBriefcase size={16} />}>
                <Detail label="GST number" value={builder.gstNumber} />
                <Detail label="CIN number" value={builder.cinNumber} />
                <Detail label="Founded year" value={builder.foundedYear} />
                <Detail label="Projects delivered" value={builder.totalProjectsDelivered} />
              </Section>}
            </div>
          </article>
        )}
      </main>
      <Footer />
    </div>
  );
}
