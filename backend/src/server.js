const path = require("path");

const { buildEventConcept } = require("./eventPlanner");

const { testQlooConnection, getCulturalRecommendations } = require("./qloo");

const express = require("express");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

/* 
app.get("/", (req, res) => {
  res.json({
    name: "Encore",
    message: "Encore backend is running!",
    status: "ok",
  });
}); */

app.get("/api/health", (req, res) => {
  res.json({
    name: "Encore",
    message: "Encore backend is running!",
    status: "ok",
  });
});

app.get("/api/qloo/test", async (req, res) => {
  try {
    const data = await testQlooConnection();
    const entities = data.results?.entities ?? [];
    //res.json(data);
    res.json({
      success: data.success,
      count: entities.length,
      entities: entities.map((entity) => ({
        name: entity.name,
        entity_id: entity.entity_id,
        type: entity.type,
        subtype: entity.subtype,
      })),
    });
  } catch (error) {
    console.error("Qloo request failed:", error.status || error.message);

    res.status(error.status || 500).json({
      error: "Qloo request failed",
      status: error.status || 500,
      details: error.details || undefined,
    });
  }
});

app.get("/api/qloo/recommendations", async (req, res) => {
  try {
    const { tag, type, take } = req.query;

    const data = await getCulturalRecommendations({
      tag,
      type: type || "urn:entity:artist",
      take: take || 5,
    });

    res.json(data);
  } catch (error) {
    console.error("Qloo recommendations failed:", error.message);

    res.status(error.status || 400).json({
      error: "Could not get cultural recommendations",
      message: error.message,
      details: error.details || undefined,
    });
  }
});

app.post("/api/events/brief", async (req, res) => {
  try {
    const {
      eventName,
      eventType,
      audience,
      location,
      budget,
      atmosphere,
      culturalTag,
    } = req.body;

    // Validate required fields
    const requiredFields = {
      eventName,
      eventType,
      audience,
      location,
      budget,
      atmosphere,
      culturalTag,
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([, value]) => typeof value !== "string" || !value.trim())
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: "Please complete all required event fields",
        missingFields,
      });
    }

    // Ask Qloo for cultural recommendations
    const culturalData = await getCulturalRecommendations({
      tag: culturalTag.trim(),
      type: "urn:entity:artist",
      take: 5,
    });

    const eventBrief = {
  eventName: eventName.trim(),
  eventType: eventType.trim(),
  audience: audience.trim(),
  location: location.trim(),
  budget: budget.trim(),
  atmosphere: atmosphere.trim(),
};

const eventConcept = buildEventConcept({
  eventBrief,
  artists: culturalData.entities,
  culturalTag: culturalData.tag,
});

    // Return the brief and its cultural recommendations
    res.json({
  success: true,
  eventBrief,
  culturalSignals: {
    source: "Qloo",
    tag: culturalData.tag,
    recommendationType: culturalData.recommendationType,
    count: culturalData.count,
    artists: culturalData.entities,
  },
  eventConcept,
});
  } catch (error) {
    console.error("Event brief failed:", error.message);

    res.status(error.status || 500).json({
      error: "Could not process event brief",
      message: error.message,
    });
  }
});

app.post("/api/events/generate", async (req, res) => {
  try {
    const {
      eventName,
      eventType,
      audience,
      location,
      budget,
      atmosphere,
      culturalTag,
    } = req.body;

    const requiredFields = {
      eventName,
      eventType,
      audience,
      location,
      budget,
      atmosphere,
      culturalTag,
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([, value]) => !value || !String(value).trim())
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: "Please provide all required event details.",
        missingFields,
      });
    }

    // Retrieve cultural recommendations from Qloo.
    const culturalData = await getCulturalRecommendations({
      tag: culturalTag,
      type: "urn:entity:artist",
      take: 5,
    });

    // Normalize the event details.
    const eventBrief = {
      eventName,
      eventType,
      audience,
      location,
      budget,
      atmosphere,
      culturalTag,
    };

    // Generate the event plan locally—no paid LLM required.
    const eventConcept = buildEventConcept({
      eventBrief,
      artists: culturalData.entities || [],
      culturalTag,
    });

    return res.json({
      success: true,
      generatedBy: "Encore local planning engine + Qloo",
      eventBrief,
      culturalSignals: {
        source: "Qloo",
        tag: culturalData.tag,
        recommendationType: culturalData.recommendationType,
        count: culturalData.count,
        artists: culturalData.entities || [],
      },
      eventConcept,
    });
  } catch (error) {
    console.error("Event generation failed:", error.message);

    return res.status(500).json({
      success: false,
      error: "Unable to generate the event concept.",
      details: error.message,
    });
  }
});

// Serve the production React frontend.
const frontendDist = path.resolve(
  __dirname,
  "../../frontend/dist"
);

app.use(express.static(frontendDist));

// Support frontend routes without intercepting API requests.
app.get(/^(?!\/api\/).*/, (req, res) => {
  res.sendFile(path.join(frontendDist, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Encore server running on http://localhost:${PORT}`);
});
