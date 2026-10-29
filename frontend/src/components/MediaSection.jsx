import { FiPlay, FiFileText, FiExternalLink, FiDownload, FiFilm, FiImage } from "react-icons/fi";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getYouTubeVideoId(url) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    if (host !== "youtu.be" && host !== "youtube.com" && !host.endsWith(".youtube.com")) return null;
    const parts = parsed.pathname.split("/").filter(Boolean);
    const id = host === "youtu.be" ? parts[0] : parsed.searchParams.get("v") ?? (parts[0] === "watch" ? null : parts[1]);
    return id && /^[a-zA-Z0-9_-]{6,20}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

// ─── Image strip ──────────────────────────────────────────────────────────────

function ImageStrip({ images, onImageClick }) {
  if (!images?.length) return null;

  // Show up to 4 thumbnails; last one gets the "+N" overlay
  const visible   = images.slice(0, 4);
  const remaining = images.length - 4;

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
        Photos · {images.length}
      </p>
      <div className="flex flex-wrap gap-2">
        {visible.map((url, index) => {
          const isLast     = index === 3;
          const showOverlay = isLast && remaining > 0;
          return (
            <button
              key={`${url}-${index}`}
              type="button"
              onClick={() => onImageClick(index)}
              className="group relative h-[88px] w-[88px] shrink-0 overflow-hidden rounded-xl bg-gray-200"
              aria-label={`View photo ${index + 1}`}
            >
              <img
                src={url}
                alt={`Photo ${index + 1}`}
                className={`h-full w-full object-cover transition group-hover:brightness-90 ${showOverlay ? "brightness-50" : ""}`}
              />
              {index === 0 && (
                <span className="absolute left-1.5 top-1.5 rounded-full bg-[var(--primary-color)] px-1.5 py-0.5 text-[9px] font-bold text-white">
                  Cover
                </span>
              )}
              {showOverlay && (
                <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-white">
                  +{remaining}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Video card ───────────────────────────────────────────────────────────────

function VideoCard({ label, fileUrl, youtubeUrl }) {
  const ytId = getYouTubeVideoId(youtubeUrl);
  const ytThumb = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null;

  // items: each has { thumb, href, isYoutube }
  const items = [];
  if (fileUrl) items.push({ thumb: null, href: fileUrl, isYoutube: false });
  if (youtubeUrl) items.push({ thumb: ytThumb, href: youtubeUrl, isYoutube: true });

  if (!items.length) return null;

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
      <div className="flex flex-wrap gap-3">
        {items.map(({ thumb, href, isYoutube }, index) => (
          <a
            key={index}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex h-[88px] w-[156px] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-900 shadow-sm transition hover:shadow-md"
            aria-label={`Watch ${label}${isYoutube ? " on YouTube" : ""}`}
          >
            {/* Thumbnail */}
            {thumb ? (
              <img
                src={thumb}
                alt={label}
                className="absolute inset-0 h-full w-full object-cover opacity-80 transition group-hover:opacity-60"
              />
            ) : (
              /* Uploaded file — no poster, show gradient bg */
              <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900" />
            )}

            {/* Play button */}
            <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-lg transition group-hover:scale-110 group-hover:bg-white">
              <FiPlay size={16} className="ml-0.5 text-gray-900" />
            </div>

            {/* YouTube badge */}
            {isYoutube && (
              <span className="absolute bottom-1.5 right-1.5 z-10 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-white">
                YT
              </span>
            )}
          </a>
        ))}
      </div>
    </div>
  );
}

// ─── Brochure card ────────────────────────────────────────────────────────────

function BrochureCard({ url }) {
  if (!url) return null;
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Brochure</p>
      <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
        {/* Icon */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50">
          <FiFileText size={18} className="text-red-500" />
        </div>

        {/* Label */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-gray-800">PDF Document</p>
          <p className="text-xs text-gray-400">Project brochure</p>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 gap-2">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm transition hover:border-[var(--primary-color)] hover:text-[var(--primary-color)]"
          >
            <FiExternalLink size={12} />
            View
          </a>
          <a
            href={url}
            download
            className="flex items-center gap-1.5 rounded-lg bg-[var(--primary-color)] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[var(--primary-color-hover)]"
          >
            <FiDownload size={12} />
            Download
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * Compact media section for property/project detail pages.
 *
 * Props:
 *   images         — array of image URLs (opens lightbox via onImageClick)
 *   onImageClick   — (index: number) => void  called when a thumbnail is clicked
 *   videoUrl       — uploaded video file URL
 *   ytVideoUrl     — YouTube video URL
 *   reelUrl        — uploaded reel file URL
 *   ytReelUrl      — YouTube reel URL
 *   brochureUrl    — PDF brochure URL (only pass for projects)
 */
export default function MediaSection({ images, onImageClick, videoUrl, ytVideoUrl, reelUrl, ytReelUrl, brochureUrl }) {
  const hasImages  = images?.length > 0;
  const hasVideo   = videoUrl || ytVideoUrl;
  const hasReel    = reelUrl  || ytReelUrl;
  const hasBrochure = Boolean(brochureUrl);

  if (!hasImages && !hasVideo && !hasReel && !hasBrochure) return null;

  return (
    <section className="rounded-2xl bg-white p-5">
      <div className="mb-4 flex items-center gap-2">
        <FiFilm size={16} className="text-[var(--primary-color)]" />
        <h2 className="text-base font-bold text-[#1a1a2e]">Media</h2>
      </div>

      <div className="flex flex-col gap-5">
        {hasImages   && <ImageStrip images={images} onImageClick={onImageClick} />}
        {hasVideo    && <VideoCard label="Video"   fileUrl={videoUrl} youtubeUrl={ytVideoUrl} />}
        {hasReel     && <VideoCard label="Reel"    fileUrl={reelUrl}  youtubeUrl={ytReelUrl}  />}
        {hasBrochure && <BrochureCard url={brochureUrl} />}
      </div>
    </section>
  );
}
