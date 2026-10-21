
import { useState } from "react";
import { jsPDF } from "jspdf";
import "./App.css";

const initialForm = {
  eventName: "Accra Creative Night",
  eventType: "Networking event",
  audience: "Young professionals and creatives",
  location: "Accra, Ghana",
  budget: "Moderate",
  atmosphere: "Energetic, colorful, welcoming",
  culturalTag: "urn:tag:genre:music:afrobeats",
};


function getBudgetAllocations(form, concept) {
  const budgetLevel = String(form?.budget || "Moderate").toLowerCase();
  const eventType = String(form?.eventType || "").toLowerCase();
  const audience = String(form?.audience || "").toLowerCase();

  const plan = concept?.budgetPlan;
  const planText = (
    typeof plan === "string" ? plan : JSON.stringify(plan ?? "")
  ).toLowerCase();

  const isAffordable =
    /affordable|cost-effective|budget-friendly|lower-cost|reduce spending/.test(
      planText
    );

  const isNetworking =
    eventType.includes("networking") ||
    audience.includes("networking");

  let percentages;

  if (isAffordable || budgetLevel.includes("low")) {
    percentages = [25, 25, 15, 10, 25];
  } else if (budgetLevel.includes("high") || budgetLevel.includes("premium")) {
    percentages = [35, 25, 20, 15, 5];
  } else {
    percentages = [30, 25, 20, 15, 10];
  }

  // Networking events place more emphasis on social interaction.
  if (isNetworking && !isAffordable) {
    percentages = [30, 25, 15, 20, 10];
  }

  const labels = [
    "Venue & logistics",
    "Food & refreshments",
    "Music & entertainment",
    "Décor & activities",
    "Contingency",
  ];

  return labels.map((label, index) => ({
    label,
    percent: percentages[index],
  }));
}


function App() {
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [refinement, setRefinement] = useState("");
  const [refining, setRefining] = useState(false);

  
const [refinementMessage, setRefinementMessage] = useState("");


function handleRefine() {
  const request = refinement.trim().toLowerCase();

  if (!request || !result?.eventConcept || refining) return;

  let mode = "";

  if (/affordable|budget|cheaper|cost|inexpensive/.test(request)) {
    mode = "affordable";
  } else if (/network|connection|icebreaker|meet people/.test(request)) {
    mode = "networking";
  } else if (/relaxed|calm|chill|intimate|laid.back/.test(request)) {
    mode = "relaxed";
  } else if (/ghana|ghanaian|local culture|cultural identity/.test(request)) {
    mode = "ghanaian";
  }

  if (!mode) {
    setRefinementMessage(
      "Try asking for a more affordable, networking-focused, relaxed, or Ghanaian-culture-focused experience."
    );
    return;
  }

  setRefining(true);
  setError("");

  const original = result.eventConcept;
  const updated = { ...original };

  const originalActivities = original.activities || [];
  const originalFood = original.foodSuggestions || [];
  const originalSchedule = original.schedule || [];

  const uniqueItems = (items, limit = 5) =>
    [...new Set(items.filter(Boolean))].slice(0, limit);

  if (mode === "affordable") {
    updated.budgetPlan =
      "Budget-conscious plan: prioritize the venue and essential logistics, " +
      "use locally sourced seasonal refreshments, simplify décor, and choose " +
      "interactive activities that require minimal equipment. Reserve part " +
      "of the budget for unexpected costs.";

    updated.foodSuggestions = uniqueItems([
      "Serve a focused menu of seasonal, locally sourced refreshments.",
      "Offer a small selection of crowd-friendly snacks and non-alcoholic drinks.",
      ...originalFood,
    ]);

    updated.activities = uniqueItems([
      "Host a conversation-led icebreaker using simple prompt cards.",
      "Use collaborative games and creative challenges instead of costly production.",
      ...originalActivities,
    ]);
  }

  if (mode === "networking") {
    updated.audienceFit =
      `${original.audienceFit || ""} The experience is designed to help guests ` +
      "make meaningful connections through guided introductions, small-group " +
      "conversations, and dedicated time to exchange ideas.";

    updated.activities = uniqueItems([
      "Run guided networking rounds with rotating conversation partners.",
      "Create themed conversation stations around shared interests.",
      "Invite guests to share a project, idea, or collaboration opportunity.",
      "Finish with open networking and an optional contact exchange.",
      ...originalActivities,
    ]);

    updated.schedule = originalSchedule.map((item) => {
      const time = item.time || "";

      if (time === "00:30") {
        return {
          ...item,
          activity: "Host welcome, guided introductions, and a lively icebreaker",
        };
      }

      if (time === "02:00") {
        return {
          ...item,
          activity: "Themed networking stations, refreshments, and open connections",
        };
      }

      return { ...item };
    });
  }

  if (mode === "relaxed") {
    updated.musicDirection =
      "A smooth, comfortable soundtrack with moderate volume, warm transitions, " +
      "and space for guests to talk, unwind, and connect.";

    updated.concept =
      `${original.concept || original.title} The experience now leans into ` +
      "a relaxed lounge atmosphere, unhurried moments, comfortable seating, " +
      "and meaningful conversation.";

    updated.activities = uniqueItems([
      "Create a comfortable lounge with inviting seating and warm lighting.",
      "Offer optional small-group conversations without pressure to participate.",
      "Build in quiet breaks between the main activities.",
      ...originalActivities,
    ]);

    updated.schedule = originalSchedule.map((item) => {
      const time = item.time || "";

      if (time === "00:30") {
        return {
          ...item,
          activity: "A warm welcome, relaxed introductions, and easy conversation",
        };
      }

      if (time === "01:00") {
        return {
          ...item,
          activity: "An intimate creative experience with a relaxed music backdrop",
        };
      }

      return { ...item };
    });
  }

  if (mode === "ghanaian") {
    updated.concept =
      `${original.concept || original.title} This edition celebrates Ghanaian ` +
      "creative culture through locally inspired food, music, art, and community connections.";

    updated.culturalRationale =
      "The experience brings Ghanaian creative culture into the event through " +
      "locally relevant music direction, food ideas, and opportunities to feature " +
      "artists, makers, and creative communities.";

    updated.foodSuggestions = uniqueItems([
      "Explore a Ghanaian-inspired menu featuring jollof, kelewele, or other dishes suited to the event.",
      "Include locally sourced refreshments and non-alcoholic drink options.",
      ...originalFood,
    ]);

    updated.activities = uniqueItems([
      "Feature work or stories from Ghanaian artists, designers, or makers.",
      "Invite a local creative to lead a short interactive session.",
      "Create a showcase celebrating local ideas, music, and creative talent.",
      ...originalActivities,
    ]);

    updated.schedule = originalSchedule.map((item) => {
      if ((item.time || "") === "01:00") {
        return {
          ...item,
          activity: "Ghanaian creative showcase, cultural activities, and featured music",
        };
      }

      return { ...item };
    });
  }

  setResult({
    ...result,
    eventConcept: updated,
  });

  const labels = {
    affordable: "a budget-conscious experience",
    networking: "a networking-focused experience",
    relaxed: "a more relaxed experience",
    ghanaian: "an experience celebrating Ghanaian creative culture",
  };

  setRefinementMessage(
    `Updated: ${labels[mode]}. Your event plan now reflects this direction.`
  );

  setRefining(false);
}



  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/events/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Event generation failed.");
      }

      setResult(data);
    } catch (err) {
      setError(
        `${err.message}. Check that your backend is running on port 3000.`
      );
    } finally {
      setLoading(false);
    }
  }

  
  function handleDownloadPlan() {
    if (!result?.eventConcept) return;

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const concept = result.eventConcept;

    const budgetAllocations = getBudgetAllocations(form, concept);

    const brief = result.eventBrief || {};
    const artists = result.culturalSignals?.artists || [];
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 18;
    const contentWidth = pageWidth - margin * 2;
    const colors = {
      cream: [255, 250, 240],
      purple: [36, 19, 61],
      pink: [230, 48, 165],
      orange: [255, 151, 67],
      lime: [219, 244, 174],
      muted: [103, 91, 111],
      white: [255, 255, 255],
      line: [225, 215, 226],
    };
    let y = 22;

    const toText = (value) => {
      if (value === null || value === undefined || value === "") return "Not specified";
      if (Array.isArray(value)) {
        return value.map((item) => {
          if (item && typeof item === "object") {
            if (item.time || item.activity) {
              return [item.time, item.activity].filter(Boolean).join(" — ");
            }
            return Object.entries(item)
              .map(([key, val]) => `${key}: ${toText(val)}`)
              .join(" | ");
          }
          return String(item);
        });
      }
      if (typeof value === "object") {
        return Object.entries(value)
          .map(([key, val]) => `${key}: ${toText(val)}`)
          .join("\n");
      }
      return String(value);
    };

    const paintPage = () => {
      doc.setFillColor(...colors.cream);
      doc.rect(0, 0, pageWidth, pageHeight, "F");
    };

    const addPage = () => {
      doc.addPage();
      paintPage();
      y = 23;
    };

    const ensureSpace = (height = 12) => {
      if (y + height > pageHeight - 22) addPage();
    };

    const addSection = (title, entries, accent = colors.pink) => {
      ensureSpace(25);
      doc.setFillColor(...accent);
      doc.roundedRect(margin, y - 5, 3, 10, 1, 1, "F");
      doc.setTextColor(...colors.purple);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text(title.toUpperCase(), margin + 8, y + 2);
      y += 13;

      entries.forEach(({ label, value }) => {
        if (value === undefined || value === null || value === "") return;
        const normalized = toText(value);
        const values = Array.isArray(normalized) ? normalized : [normalized];
        ensureSpace(12);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(...colors.purple);
        const labelLines = doc.splitTextToSize(String(label), contentWidth);
        ensureSpace(labelLines.length * 4.5 + 5);
        doc.text(labelLines, margin, y);
        y += labelLines.length * 4.5 + 1.5;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(...colors.muted);
        values.forEach((entry) => {
          const entryText = String(entry);
          const lines = doc.splitTextToSize(`•  ${entryText}`, contentWidth - 3);
          const lineHeight = 4.7;
          ensureSpace(lines.length * lineHeight + 4);
          doc.text(lines, margin + 2, y);
          y += lines.length * lineHeight + 2;
        });
        y += 2;
      });
      y += 4;
    };

    // Cover page
    paintPage();
    doc.setFillColor(...colors.purple);
    doc.rect(0, 0, pageWidth, 13, "F");
    doc.setFillColor(...colors.pink);
    doc.circle(176, 51, 23, "F");
    doc.setFillColor(...colors.orange);
    doc.circle(190, 73, 12, "F");
    doc.setFillColor(...colors.lime);
    doc.roundedRect(145, 88, 43, 14, 4, 4, "F");

    doc.setTextColor(...colors.purple);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("ENCORE :: THE CULTURE POWERED EVENT PRODUCER", margin, 31);

    const coverTitle = toText(form.eventName || concept.title);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(31);
    const titleLines = doc.splitTextToSize(coverTitle, 142);
    doc.text(titleLines, margin, 70);
    let coverY = 70 + titleLines.length * 12 + 6;

    doc.setFillColor(...colors.pink);
    doc.roundedRect(margin, coverY, 31, 2, 1, 1, "F");
    coverY += 12;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(...colors.muted);
    const subtitle = doc.splitTextToSize(toText(concept.concept), contentWidth);
    doc.text(subtitle.slice(0, 5), margin, coverY);
    coverY += Math.min(subtitle.length, 5) * 6 + 15;

    const details = [
      ["EVENT TYPE", brief.eventType || form.eventType],
      ["LOCATION", brief.location || form.location],
      ["AUDIENCE", brief.audience || form.audience],
      ["BUDGET LEVEL", brief.budget || form.budget],
    ];
    details.forEach(([label, value], index) => {
      const x = margin + (index % 2) * 88;
      const boxY = coverY + Math.floor(index / 2) * 31;
      doc.setFillColor(...colors.white);
      doc.roundedRect(x, boxY, 82, 25, 3, 3, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(...colors.pink);
      doc.text(label, x + 5, boxY + 7);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...colors.purple);
      const lines = doc.splitTextToSize(toText(value), 72);
      doc.text(lines.slice(0, 2), x + 5, boxY + 15);
    });

    doc.setFillColor(...colors.purple);
    doc.roundedRect(margin, 252, contentWidth, 23, 4, 4, "F");
    doc.setTextColor(...colors.cream);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("A PLAN FOR THE EXPERIENCE", margin + 7, 261);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.text("Creative direction. Cultural inspiration. Actionable planning.", margin + 7, 268);

    // Blueprint sections
    addPage();
    addSection("01 / Event brief", [
      { label: "Event name", value: brief.eventName || form.eventName },
      { label: "Event type", value: brief.eventType || form.eventType },
      { label: "Location", value: brief.location || form.location },
      { label: "Target audience", value: brief.audience || form.audience },
      { label: "Budget level", value: brief.budget || form.budget },
      { label: "Desired atmosphere", value: brief.atmosphere || form.atmosphere },
      { label: "Cultural direction", value: form.culturalTag.replace("urn:tag:genre:music:", "") },
    ], colors.orange);

    addSection("02 / The concept", [
      { label: "Experience title", value: concept.title },
      { label: "Concept", value: concept.concept },
      { label: "Audience fit", value: concept.audienceFit },
      { label: "Atmosphere direction", value: concept.atmosphereDirection },
    ], colors.pink);

    addSection("03 / Creative programming", [
      { label: "Music direction", value: concept.musicDirection },
      { label: "Food suggestions", value: concept.foodSuggestions },
      { label: "Activities and experiences", value: concept.activities },
    ], colors.orange);

    addSection("04 / Event schedule", [
      { label: "Proposed run of show", value: concept.schedule },
    ], colors.lime);

    /* 
    addSection("05 / Budget guidance", [
      { label: "Planning recommendations", value: concept.budgetPlan },
      { label: "Illustrative allocation", value: [
        "Venue and logistics — 30%",
        "Food and refreshments — 25%",
        "Music and entertainment — 20%",
        "Décor and activities — 15%",
        "Contingency — 10%",
      ] },
    ], colors.pink); */

    addSection(
  "05 / Budget allocation",
  [
    {
      label: "Suggested category allocations",
      value: budgetAllocations.map(
        (item) => `${item.label}: ${item.percent}%`
      ),
    },
    {
      label: "Planning notes",
      value:
        "Percentages are planning estimates to guide you through the planning process.",
    },
  ],
  colors.pink);

    addSection("06 / Cultural intelligence", [
      { label: "Cultural rationale", value: concept.culturalRationale },
      { label: "Qloo cultural references", value: artists.map((artist) => artist.name).filter(Boolean) },
      { label: "Music direction", value: concept.musicDirection },
    ], colors.orange);

    addSection("07 / Organizer checklist", [
      { label: "Next steps", value: concept.organizerChecklist },
    ], colors.lime);

    // Add consistent page footer and page numbers to content pages.
    const totalPages = doc.getNumberOfPages();
    for (let page = 2; page <= totalPages; page += 1) {
      doc.setPage(page);
      doc.setDrawColor(...colors.line);
      doc.line(margin, 282, pageWidth - margin, 282);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(...colors.purple);
      doc.text("ENCORE", margin, 289);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...colors.muted);
      doc.text("EVENT EXPERIENCE BLUEPRINT", pageWidth / 2, 289, { align: "center" });
      doc.text(`${page} / ${totalPages}`, pageWidth - margin, 289, { align: "right" });
    }

    doc.setProperties({
      title: `${toText(form.eventName || concept.title)} - Encore Blueprint`,
      subject: "Event experience blueprint",
      author: "Encore",
      creator: "Encore Event Planning Studio",
    });

    const slug = String(form.eventName || concept.title || "encore-event")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    doc.save(`${slug || "encore-event"}-blueprint.pdf`);
  }


  const concept = result?.eventConcept;
  const artists = result?.culturalSignals?.artists || [];

  return (
    <main className="app-shell">
      <nav className="topbar">
        <a className="brand" href="#home">
          <span className="brand-mark">e.</span>
          <span>encore<span className="brand-period">.</span></span>
        </a>

        <span className="nav-label">CULTURE × EXPERIENCES</span>

        <a className="nav-link" href="#planner">
          Create an experience ↗
        </a>
      </nav>

      <section className="hero" id="home">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="live-dot" />
            YOUR CULTURE-POWERED EVENT PRODUCER
          </div>

          <h1>
            Make it
            <br />
            <span className="headline-highlight">mean</span> something<span className="orange-dot">.</span>
          </h1>

          <p className="hero-description">
            Great events don't just bring people together.
            They bring the right culture, energy and ideas
            into the room.
          </p>

          <a className="hero-cta" href="#planner">
            Dream up your event <span>↘</span>
          </a>

          <div className="hero-note">
            <span>✳</span> Thoughtful experiences. Cultural intelligence.
          </div>
        </div>

        <div className="hero-art" aria-label="Encore creative event illustration">
          <div className="art-sticker sticker-top">GOOD VIBES<br />ONLY ✳</div>
          <div className="art-circle circle-pink" />
          <div className="art-circle circle-blue" />
          <div className="art-circle circle-lime" />
          <div className="art-sun">✳</div>
          <div className="art-card">
            <span className="art-card-kicker">THE NEXT BIG THING</span>
            <strong>People.<br />Places.<br /><em>Possibilities.</em></strong>
            <span className="art-card-footer">MADE TO BRING US TOGETHER ↗</span>
          </div>
          <div className="art-sticker sticker-bottom">FEEL<br />SOMETHING!</div>
        </div>
      </section>

      <section className="marquee-strip">
        <span>CULTURE FIRST</span><b>✳</b>
        <span>CONNECTION ALWAYS</span><b>✳</b>
        <span>EXPERIENCES THAT STICK</span><b>✳</b>
        <span>CULTURE FIRST</span>
      </section>

      <section className="planner-section" id="planner">
        <div className="section-intro">
          <span className="section-index">01 / THE BRIEF</span>
          <h2>Let's set the <span>scene.</span></h2>
          <p>Tell us what you're bringing to life. Encore will help shape the experience around your audience and cultural direction.</p>
        </div>

        <div className="planner-layout">
          <form className="brief-form" onSubmit={handleSubmit}>
            <label>
              EVENT NAME
              <input
                name="eventName"
                value={form.eventName}
                onChange={handleChange}
                required
                placeholder="e.g. Accra Creative Night"
              />
            </label>

            <div className="form-row">
              <label>
                EVENT TYPE
                <select name="eventType" value={form.eventType} onChange={handleChange}>
                  <option>Networking event</option>
                  <option>Workshop</option>
                  <option>Birthday party</option>
                  <option>Creative showcase</option>
                  <option>Festival</option>
                  <option>Community meetup</option>
                  <option>Product launch</option>
                </select>
              </label>

              <label>
                LOCATION
                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  required
                  placeholder="City, country"
                />
              </label>
            </div>

            <label>
              WHO IS IT FOR?
              <textarea
                name="audience"
                value={form.audience}
                onChange={handleChange}
                required
                rows="2"
                placeholder="Describe your guests"
              />
            </label>

            <label>
              WHAT SHOULD IT FEEL LIKE?
              <textarea
                name="atmosphere"
                value={form.atmosphere}
                onChange={handleChange}
                required
                rows="2"
                placeholder="Energetic, intimate, playful..."
              />
            </label>

            <div className="form-row">
              <label>
                BUDGET LEVEL
                <select name="budget" value={form.budget} onChange={handleChange}>
                  <option>Low</option>
                  <option>Moderate</option>
                  <option>High</option>
                </select>
              </label>

              <label>
                CULTURAL DIRECTION
                <select
                  name="culturalTag"
                  value={form.culturalTag}
                  onChange={handleChange}
                >
                  <option value="urn:tag:genre:music:afrobeats">Afrobeats</option>
                  <option value="urn:tag:genre:music:hip-hop">Hip-hop</option>
                  <option value="urn:tag:genre:music:jazz">Jazz</option>
                  <option value="urn:tag:genre:music:rock">Rock</option>
                </select>
              </label>
            </div>

            <button className="generate-button" type="submit" disabled={loading}>
              {loading ? "Dreaming up your experience..." : "Create my experience ↗"}
            </button>

            <p className="form-footnote">
              ✳ Powered by Qloo cultural signals and Encore's local planning engine.
            </p>
          </form>

          <aside className="brief-aside">
            <div className="aside-number">✳</div>
            <span className="aside-label">THE ENCORE PROMISE</span>
            <h3>Less guesswork.<br />More <span>connection.</span></h3>
            <p>
              Cultural signals can help inspire the experience. Your brief
              gives the plan its purpose, audience and atmosphere.
            </p>
            <div className="aside-bottom">
              <span>01 — UNDERSTAND</span>
              <span>02 — DISCOVER</span>
              <span>03 — DESIGN</span>
            </div>
          </aside>
        </div>
      </section>

      {error && (
        <section className="error-panel" role="alert">
          <strong>We hit a snag.</strong>
          <p>{error}</p>
        </section>
      )}

      {concept && (
        <section className="results-section" aria-live="polite">
          <div className="section-intro">
            <span className="section-index">02 / YOUR EXPERIENCE</span>
            <h2>Here's the <span>feeling.</span></h2>
            <p>A culture-powered experience, shaped around your audience and vision.</p>
          </div>

          
  <div className="blueprint-actions">
    <button
      className="download-plan-button"
      type="button"
      onClick={handleDownloadPlan}
    >
      ↓ Download your event blueprint
    </button>
    <span>Save your plan. Make the moment happen.</span>
  </div>


          <article className="concept-banner">
            <div>
              <span className="result-kicker">YOUR EVENT CONCEPT ✳</span>
              <h3>{concept.title}</h3>
              <p>{concept.concept}</p>
            </div>
            <div className="concept-stamp">MADE<br />TOGETHER</div>
          </article>

          <div className="result-grid">
            <article className="result-card result-pink">
              <span className="result-kicker">01 / AUDIENCE FIT</span>
              <h3>Bring them in.</h3>
              <p>{concept.audienceFit}</p>
            </article>

            <article className="result-card result-lime">
              <span className="result-kicker">02 / THE SOUND</span>
              <h3>Set the tone.</h3>
              <p>{concept.musicDirection}</p>
            </article>

            <article className="result-card result-blue">
              <span className="result-kicker">03 / THE MENU</span>
              <h3>Feed the vibe.</h3>
              <ul>{(concept.foodSuggestions || []).map((item, i) => <li key={i}>{item}</li>)}</ul>
            </article>

            <article className="result-card result-orange">
              <span className="result-kicker">04 / THE MOMENTS</span>
              <h3>Make it memorable.</h3>
              <ul>{(concept.activities || []).map((item, i) => <li key={i}>{item}</li>)}</ul>
            </article>
          </div>

          <div className="schedule-panel">
            <div>
              <span className="result-kicker">05 / THE RUN OF SHOW</span>
              <h3>Good things, in order.</h3>
            </div>
            <div className="schedule-list">
              {(concept.schedule || []).map((item, i) => (
                <div className="schedule-item" key={`${item.time}-${i}`}>
                  <span>{item.time}</span>
                  <p>{item.activity}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="result-grid bottom-grid">
            

<article className="result-card result-cream">
  <span className="result-kicker">06 / THE BUDGET</span>
  <h3>Spend with purpose.</h3>
  <p>{concept.budgetPlan}</p>

  <div className="budget-breakdown">
    <p className="budget-note">
      Suggested allocation · adapts to your event plan
    </p>

    {getBudgetAllocations(form, concept).map((item) => (
      <div className="budget-item" key={item.label}>
        <div className="budget-item-heading">
          <span>{item.label}</span>
          <strong>{item.percent}%</strong>
        </div>

        <div
          className="budget-track"
          role="img"
          aria-label={`${item.label}: ${item.percent}% suggested allocation`}
        >
          <div
            className="budget-fill"
            style={{ width: `${item.percent}%` }}
          />
        </div>
      </div>
    ))}

    <p className="budget-note">
      Percentages are planning estimates to guide you through the planning process.
    </p>
  </div>
</article>



           
<article className="result-card result-dark cultural-card">
  <span className="result-kicker">07 / QLOO CULTURAL INTELLIGENCE</span>
  <h3>Start with culture.</h3>

  <p>
    Encore uses cultural recommendations as creative signals
    to help shape an experience around your event brief.
  </p>

  <div className="cultural-source-panel">
    <span className="cultural-label">YOUR CULTURAL DIRECTION</span>
    <strong>
      {{
        "urn:tag:genre:music:afrobeats": "Afrobeats",
        "urn:tag:genre:music:hip-hop": "Hip-hop",
        "urn:tag:genre:music:jazz": "Jazz",
        "urn:tag:genre:music:rock": "Rock",
      }[form.culturalTag] || form.culturalTag}
    </strong>
    <span className="cultural-count">
      {result.culturalSignals?.count ?? artists.length} cultural
      {((result.culturalSignals?.count ?? artists.length) === 1)
        ? " reference"
        : " references"} returned
    </span>
  </div>

  <div className="cultural-results-heading">
    <span className="cultural-label">DISCOVERED BY QLOO</span>
    <span className="qloo-pill">QLOO ↗</span>
  </div>

  <div className="artist-list">
    {artists.map((artist, i) => (
      <span
        className="artist-chip"
        key={artist.entity_id || artist.name || i}
      >
        {artist.name}
      </span>
    ))}

    {artists.length === 0 && (
      <span>No artist recommendations were returned for this brief.</span>
    )}
  </div>

  <div className="cultural-application">
    <span className="cultural-label">HOW ENCORE APPLIES THE SIGNALS</span>
    <p>{concept.culturalRationale}</p>
    <p>
      <strong>Music direction:</strong>{" "}
      {concept.musicDirection}
    </p>
  </div>

  <p className="source-note">
  Cultural intelligence by {result.culturalSignals?.source || "Qloo"} ·
  Curated to inspire your event's creative direction.
</p>
</article>

          </div>









          <section className="decision-trace">
            <div className="decision-trace-heading">
              <span className="result-kicker">08 / INSIDE THE EXPERIENCE</span>
              <h3>Every detail has a <span>reason.</span></h3>
              <p>
                See how your brief and cultural direction come together
                to shape the experience.
              </p>
            </div>

            <div className="decision-trace-grid">
              <article className="trace-card trace-brief">
                <span className="trace-number">01</span>
                <span className="result-kicker">THE BRIEF</span>
                <h4>Start with your people.</h4>
                <p>
                  Encore is designing <strong>{form.eventName}</strong>,
                  a {form.eventType.toLowerCase()} in {form.location},
                  for {form.audience.toLowerCase()}.
                </p>
                <div className="trace-tags">
                  <span>{form.budget} budget</span>
                  <span>{form.atmosphere}</span>
                </div>
              </article>

              <article className="trace-card trace-culture">
                <span className="trace-number">02</span>
                <span className="result-kicker">THE CULTURAL SIGNAL</span>
                <h4>Find the right energy.</h4>
                <p>
                  Your selected direction is{" "}
                  <strong>
                    {{
                      "urn:tag:genre:music:afrobeats": "Afrobeats",
                      "urn:tag:genre:music:hip-hop": "Hip-hop",
                      "urn:tag:genre:music:jazz": "Jazz",
                      "urn:tag:genre:music:rock": "Rock",
                    }[form.culturalTag] || form.culturalTag}
                  </strong>.
                  Qloo returned {artists.length} artist references to
                  help inspire the musical and creative direction.
                </p>
                <div className="trace-tags">
                  {artists.slice(0, 3).map((artist, i) => (
                    <span key={artist.entity_id || artist.name || i}>
                      {artist.name}
                    </span>
                  ))}
                </div>
              </article>

              <article className="trace-card trace-decision">
                <span className="trace-number">03</span>
                <span className="result-kicker">THE CREATIVE DECISION</span>
                <h4>{concept.title}</h4>
                <p>{concept.culturalRationale}</p>
                <p>
                  <strong>Sound:</strong> {concept.musicDirection}
                </p>
              </article>

              <article className="trace-card trace-outcome">
                <span className="trace-number">04</span>
                <span className="result-kicker">THE EXPERIENCE</span>
                <h4>Turn direction into moments.</h4>
                <p>{concept.audienceFit}</p>
                <ul>
                  {(concept.activities || []).slice(0, 3).map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </article>
            </div>

            {refinementMessage.startsWith("Updated:") && (
              <div className="trace-refinement">
                <span className="result-kicker">LATEST REFINEMENT</span>
                <p>{refinementMessage}</p>
                <span>
                  The trace reflects the current event concept and its
                  updated recommendations.
                </span>
              </div>
            )}
          </section>

          <div className="caveats-panel">
            <h3>Bring the experience to life ↗</h3>
            <ul>
              {(concept.organizerChecklist || []).map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
          
<div className="refine-panel">
  <span className="result-kicker">08 / MAKE IT YOURS</span>
  <h3>Good start. Let's make it <span>better.</span></h3>
  <p>
    Tell Encore what you'd like to change. We'll refine your
    event plan around your priorities.
  </p>

  <div className="refine-suggestions">
    {[
      "Make it more affordable",
      "Add more networking",
      "Make it more relaxed",
      "Strengthen the Ghanaian cultural identity",
    ].map((suggestion) => (
      <button
        key={suggestion}
        type="button"
        className="refine-chip"
        onClick={() => setRefinement(suggestion)}
      >
        {suggestion} ↗
      </button>
    ))}
  </div>

  <label className="refine-label" htmlFor="refinement">
    WHAT WOULD YOU LIKE TO CHANGE?
  </label>

  <textarea
    id="refinement"
    value={refinement}
    onChange={(event) => setRefinement(event.target.value)}
    rows={3}
    placeholder="e.g. Make the event more interactive while keeping costs low..."
  />

  
<button
  className="generate-button"
  type="button"
  disabled={!refinement.trim() || refining}
  onClick={handleRefine}
>
  {refining ? "Refining your experience..." : "Refine my experience ↗"}
</button>

{refinementMessage && (
  <p className="refinement-feedback" role="status">
    {refinementMessage}
  </p>
)}

</div>

        </section>
      )}

      <footer className="footer">
        <a className="brand" href="#home">
          <span className="brand-mark">e.</span>
          <span>encore<span className="brand-period">.</span></span>
        </a>
        <p>Culture makes the moment.</p>
        <span>BUILT FOR EXPERIENCES THAT MATTER ✳</span>
      </footer>
    </main>
  );
}

export default App;
