import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { topPickGroups } from "../data/properties";
import ContactFlow from "./ContactFlow";
import "./TopPicks.css";

const INTERVAL = 3000;

export default function TopPicks() {
  const navigate = useNavigate();
  const [activeGroup, setActiveGroup] = useState(0);
  const [activeProject, setActiveProject] = useState(0);
  const [showContact, setShowContact] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef(null);
  const progressRef = useRef(null);

  const group = topPickGroups[activeGroup];
  const project = group.projects[activeProject];

  const startCycle = (currentGroup) => {
    clearInterval(timerRef.current);
    clearInterval(progressRef.current);
    setProgress(0);

    const startTime = Date.now();
    progressRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setProgress(Math.min((elapsed / INTERVAL) * 100, 100));
    }, 50);

    timerRef.current = setTimeout(() => {
      const next = (currentGroup + 1) % topPickGroups.length;
      setActiveGroup(next);
      setActiveProject(0);
    }, INTERVAL);
  };

  useEffect(() => {
    startCycle(activeGroup);
    return () => {
      clearTimeout(timerRef.current);
      clearInterval(progressRef.current);
    };
  }, [activeGroup]);

  const handleGroupChange = (gi) => {
    setActiveGroup(gi);
    setActiveProject(0);
  };

  return (
    <section className="tp-section">
      <div className="tp-inner">
        <div className="tp-header">
          <div>
            <h2>RealSquare's top picks</h2>
            <p>Explore top living options with us</p>
          </div>
          <div className="tp-group-tabs">
            {topPickGroups.map((g, i) => (
              <button
                key={g.id}
                className={`tp-group-tab ${activeGroup === i ? "active" : ""}`}
                onClick={() => handleGroupChange(i)}
              >
                {g.developer}
                {activeGroup === i && (
                  <span className="tp-progress-bar">
                    <span className="tp-progress-fill" style={{ width: `${progress}%` }} />
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="tp-card">
          {/* Left info panel */}
          <div className="tp-info">
            <div className="tp-developer">
              <img src={group.logo} alt={group.developer} className="tp-dev-logo" />
              <div>
                <p className="tp-dev-name">{group.developer}</p>
                <button
                  className="tp-view-projects"
                  onClick={() => navigate(`/developer/${group.id}`)}
                >
                  View Projects
                </button>
              </div>
            </div>

            <div className="tp-project-info">
              <h3>{project.name}</h3>
              <p className="tp-location">{project.location}</p>
              <div className="tp-price">{project.price}</div>
              <p className="tp-type">{project.type}</p>
            </div>

            <button className="tp-contact-btn" onClick={() => setShowContact(true)}>
              Contact
            </button>
          </div>

          {/* Right image */}
          <div className="tp-image-wrap">
            <img src={project.image} alt={project.name} className="tp-image" />

            {/* Thumbnail strip */}
            <div className="tp-thumbnails">
              {group.projects.map((p, i) => (
                <div
                  key={p.id}
                  className={`tp-thumb ${activeProject === i ? "active" : ""}`}
                  onClick={() => setActiveProject(i)}
                >
                  <img src={p.image} alt={p.name} />
                  <span>{p.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showContact && <ContactFlow onClose={() => setShowContact(false)} />}
    </section>
  );
}
