
function buildEventConcept({ eventBrief, artists, culturalTag }) {
  const {
    eventName,
    eventType,
    audience,
    location,
    budget,
    atmosphere,
  } = eventBrief;

  const type = eventType.toLowerCase();
  const mood = atmosphere.toLowerCase();
  const place = location.toLowerCase();

  const isNetworking = /network|professional|meetup/.test(type);
  const isWorkshop = /workshop|training|class|learning/.test(type);
  const isCelebration = /birthday|party|celebration|festival/.test(type);
  const isCreative = /creative|art|design|music/.test(type);
  const isHighEnergy = /energetic|bold|lively|exciting|festive/.test(mood);

  const artistNames = artists.map((artist) => artist.name);

  let activities;

  if (isNetworking) {
    activities = [
      "Use conversation cards to help guests discover shared interests.",
      "Run a short, facilitated introduction round.",
      "Create an open networking session with optional topic-based groups.",
    ];
  } else if (isWorkshop) {
    activities = [
      "Open with a short interactive warm-up.",
      "Run a hands-on activity with a clear outcome.",
      "Close with participant reflections and practical next steps.",
    ];
  } else if (isCelebration) {
    activities = [
      "Create a welcoming photo and guest-message area.",
      "Include a shared group activity or themed challenge.",
      "Finish with a memorable group moment and closing music.",
    ];
  } else if (isCreative) {
    activities = [
      "Invite guests to share a creative influence or inspiration.",
      "Host a collaborative mini-project or creative showcase.",
      "Finish with an informal exchange of ideas and connections.",
    ];
  } else {
    activities = [
      "Open with a short, welcoming icebreaker.",
      "Include an interactive activity tied to the event theme.",
      "Close with a group reflection and informal conversation.",
    ];
  }

  const foodSuggestions = place.includes("ghana") || place.includes("accra")
    ? [
        "Consider locally familiar options such as jollof rice or kelewele.",
        "Offer vegetarian alternatives and clearly labeled ingredients.",
        "Provide water and a selection of non-alcoholic drinks.",
      ]
    : [
        "Choose food options appropriate to the location and audience.",
        "Offer vegetarian alternatives and clearly labeled ingredients.",
        "Provide water and non-alcoholic drinks.",
      ];

  const musicDirection = artistNames.length
    ? `Explore a playlist or DJ brief featuring these Qloo-returned artists: ${artistNames.join(", ")}. Verify availability and suitability before booking anyone.`
    : "Select music that matches the requested atmosphere and audience.";

  const budgetText = budget.toLowerCase();

  let budgetPlan;

  if (/low|tight|small|limited/.test(budgetText)) {
    budgetPlan =
      "Cost-conscious approach: prioritize an affordable venue, a focused menu, " +
      "a curated playlist, and activities that require little equipment. " +
      "Keep a contingency reserve. No supplier prices have been verified.";
  } else if (/high|premium|large|generous/.test(budgetText)) {
    budgetPlan =
      "Enhanced experience: consider investing in venue quality, sound, " +
      "food service, and one memorable signature activity. Keep a contingency reserve. " +
      "No supplier prices have been verified.";
  } else {
    budgetPlan =
      "Balanced approach: allocate resources across the venue, food, music, " +
      "and one or two strong activities. Reserve part of the budget for unexpected costs. " +
      "No supplier prices have been verified.";
  }

  const energyNote = isHighEnergy
    ? "Use lively opening music, bold visual details, and interactive moments while preserving space for conversation."
    : "Use a welcoming pace, comfortable seating, and well-spaced activities that suit the requested atmosphere.";

  const schedule = isNetworking
    ? [
        { time: "00:00", activity: "Guest arrival and welcome music" },
        { time: "00:30", activity: "Host introduction and guided introductions" },
        { time: "01:00", activity: "Main activity or short guest showcase" },
        { time: "02:00", activity: "Food and open networking" },
        { time: "03:00", activity: "Closing remarks and final connections" },
      ]
    : [
        { time: "00:00", activity: "Guest arrival and welcome" },
        { time: "00:30", activity: "Opening and event introduction" },
        { time: "01:00", activity: "Main experience or activity" },
        { time: "02:00", activity: "Food, conversation, and social time" },
        { time: "03:00", activity: "Closing moment" },
      ];

  return {
    title: eventName,

    concept:
      `${eventName} is a ${mood} experience for ${audience} in ${location}. ` +
      `Designed as a ${eventType.toLowerCase()}, it brings people together ` +
      "through shared activities, thoughtful hospitality, and cultural discovery.",

    audienceFit:
      `The plan prioritizes experiences for ${audience}. ` +
      (isNetworking
        ? "Structured introductions help make networking easier."
        : isWorkshop
        ? "Hands-on participation keeps guests actively involved."
        : isCelebration
        ? "Shared moments and social activities create a sense of occasion."
        : "A mix of participation and informal social time gives guests different ways to engage."),

    culturalRationale:
      `The supplied cultural signal is "${culturalTag}". ` +
      (artistNames.length
        ? `Qloo returned these artists for that request: ${artistNames.join(", ")}. ` +
          "They are candidate cultural references, not proof that every attendee prefers them."
        : "No artists were returned, so the plan does not assume specific artist preferences."),

    musicDirection,
    foodSuggestions,
    activities,
    schedule,
    budgetPlan,

    atmosphereDirection: energyNote,

    culturalSignals: {
      source: "Qloo",
      tag: culturalTag,
      artists: artistNames,
    },

    planningStages: [
      "Parsed the event requirements.",
      "Interpreted the requested atmosphere and event type.",
      "Retrieved cultural recommendations from Qloo.",
      "Selected activities using event-type rules.",
      "Adapted food suggestions to the supplied location.",
      "Generated a schedule and budget guidance.",
    ],

    organizerChecklist: [
      "Confirm venue capacity, accessibility, and availability.",
      "Check artist suitability, availability, and music licensing.",
      "Confirm catering costs and guests' dietary requirements.",
      "Verify the plan against the actual budget and event duration.",
    ],

    caveats: [
      "This version uses transparent decision rules, not an LLM.",
      "Recommendations are suggestions, not verified bookings or prices.",
      "Qloo's returned entities are cultural inputs, not guaranteed audience preferences.",
      "The schedule is a draft and should be adjusted to the real event.",
    ],
  };
}

module.exports = { buildEventConcept };
