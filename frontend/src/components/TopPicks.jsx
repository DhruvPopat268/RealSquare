import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { topPickGroups } from "../data/properties";
import ContactFlow from "./ContactFlow";
import ImageSlider from "./ImageSlider";

const INTERVAL = 3000;

export default function TopPicks({ searchQuery }) {
  const navigate = useNavigate();
  const [activeGroup, setActiveGroup] = useState(0);
  const [activeProject, setActiveProject] = useState(0);
  const [showContact, setShowContact] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef(null);
  const progressRef = useRef(null);

  const matchesCity = (location) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const loc = location.toLowerCase();
    return searchQuery.split(",").map((s) => s.trim().toLowerCase()).some((part) => loc.includes(part)) || loc.includes(q);
  };

  const filteredGroups = searchQuery
    ? topPickGroups.filter((g) => g.projects.some((p) => matchesCity(p.location)))
    : topPickGroups;

  const group = filteredGroups[activeGroup] ?? topPickGroups[activeGroup];
  const filteredProjects = searchQuery
    ? group.projects.filter((p) => matchesCity(p.location))
    : group.projects;
  const project = filteredProjects[activeProject] ?? filteredProjects[0];

  const startCycle = (currentGroup) => {
    clearInterval(timerRef.current);
    clearInterval(progressRef.current);
    setProgress(0);
    const startTime = Date.now();
    progressRef.current = setInterval(() => {
      setProgress(Math.min(((Date.now() - startTime) / INTERVAL) * 100, 100));
    }, 50);
    timerRef.current = setTimeout(() => {
      const next = (currentGroup + 1) % filteredGroups.length;
      setActiveGroup(next);
      setActiveProject(0);
    }, INTERVAL);
  };

  useEffect(() => {
    startCycle(activeGroup);
    return () => { clearTimeout(timerRef.current); clearInterval(progressRef.current); };
  }, [activeGroup]);

  const handleGroupChange = (gi) => { setActiveGroup(gi); setActiveProject(0); };

  const handleProjectClick = (p) => {
    if (p.propertyId) {
      navigate(`/property/${p.propertyId}`);
    } else {
      navigate(`/developer/${group.id}`);
    }
  };

  if (searchQuery && filteredGroups.length === 0) return null;

  return (
    <section className="bg-[#f7f8fa] pt-12 px-5">
      <div className="max-w-[1200px] mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4 mb-5">
          <div>
            <h2 className="text-2xl font-extrabold text-[#1a1a2e]">RealSquare's top picks</h2>
            <p className="text-sm text-gray-400 mt-1">Explore top living options with us</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {filteredGroups.map((g, i) => (
              <button
                key={g.id}
                onClick={() => handleGroupChange(i)}
                className={`px-4 py-1.5 rounded-full border text-sm font-medium transition flex flex-col items-center ${
                  activeGroup === i
                    ? "border-[#7B2FFF] text-[#7B2FFF] bg-[#f3eeff]"
                    : "border-gray-300 text-gray-500 bg-white hover:border-[#7B2FFF] hover:text-[#7B2FFF]"
                }`}
              >
                {g.developer}
                {activeGroup === i && (
                  <span className="block w-full h-[3px] bg-[#d8c4ff] rounded mt-1.5 overflow-hidden">
                    <span className="block h-full bg-[#7B2FFF] rounded transition-all duration-75" style={{ width: `${progress}%` }} />
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Main card */}
        <div className="flex rounded-2xl overflow-hidden border-2 border-[#7B2FFF] h-[400px] max-md:flex-col max-md:h-auto">

          {/* Left info panel */}
          <div className="w-[320px] flex-shrink-0 bg-gradient-to-br from-[#f3eeff] via-[#e8d5ff] to-[#fce4ec] p-6 flex flex-col gap-4 max-md:w-full">
            {/* Developer */}
            <div className="flex items-center gap-3 bg-white rounded-xl p-3">
              <img src={group.logo} alt={group.developer} className="w-12 h-12 rounded-xl object-cover border border-gray-100" />
              <div>
                <p className="text-sm font-bold text-[#1a1a2e]">{group.developer}</p>
                <button
                  className="text-xs text-[#7B2FFF] font-semibold underline"
                  onClick={() => navigate(`/developer/${group.id}`)}
                >
                  View All Projects
                </button>
              </div>
            </div>

            {/* Project info — always clickable */}
            <div
              className="flex-1 cursor-pointer"
              onClick={() => handleProjectClick(project)}
            >
              <h3 className="text-xl font-extrabold text-[#1a1a2e] mb-1 hover:text-[#7B2FFF] transition-colors">
                {project.name}
              </h3>
              <p className="text-xs text-gray-500 mb-3">{project.location}</p>
              <div className="text-2xl font-extrabold text-[#1a1a2e] mb-1">{project.price}</div>
              <p className="text-xs text-gray-500">{project.type}</p>
              <span className="inline-block mt-2 text-xs text-[#7B2FFF] font-semibold">View Details →</span>
            </div>

            <button
              className="w-full bg-[#7B2FFF] hover:bg-[#6320d4] text-white rounded-xl py-3 text-sm font-bold transition"
              onClick={() => setShowContact(true)}
            >
              Contact
            </button>
          </div>

          {/* Right image */}
          <div className="flex-1 relative overflow-hidden max-md:h-[210px]">
            <ImageSlider
              images={group.projects.map((p) => p.image)}
              className="absolute inset-0 w-full h-full"
            />
          </div>
        </div>

      </div>

      {showContact && <ContactFlow onClose={() => setShowContact(false)} />}
    </section>
  );
}
