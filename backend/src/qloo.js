const QLOO_BASE_URL =
  process.env.QLOO_BASE_URL || "https://hackathon.api.qloo.com";

async function testQlooConnection() {
  if (!process.env.QLOO_API_KEY) {
    throw new Error("QLOO_API_KEY is missing from the environment");
  }

  const url = new URL(`${QLOO_BASE_URL}/v2/insights`);

  url.searchParams.set("filter.type", "urn:entity:artist");
  url.searchParams.set(
    "signal.interests.tags",
    "urn:tag:genre:music:afrobeats",
  );
  url.searchParams.set("take", "5");

  const response = await fetch(url, {
    headers: {
      "x-api-key": process.env.QLOO_API_KEY,
      Accept: "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(`Qloo returned HTTP ${response.status}`);
    error.status = response.status;
    error.details = data;
    throw error;
  }

  return data;
}

async function getCulturalRecommendations({
  tag,
  type = "urn:entity:artist",
  take = 5,
}) {
  if (!process.env.QLOO_API_KEY) {
    throw new Error("QLOO_API_KEY is missing from the environment");
  }

  const allowedTypes = [
    "urn:entity:artist",
    "urn:entity:movie",
    "urn:entity:book",
    "urn:entity:brand",
    "urn:entity:destination",
    "urn:entity:place",
  ];

  if (typeof tag !== "string" || !tag.startsWith("urn:tag:")) {
    throw new Error(
      "Please provide a valid Qloo tag ID beginning with urn:tag:",
    );
  }

  if (!allowedTypes.includes(type)) {
    throw new Error("Unsupported recommendation type");
  }

  const url = new URL(`${QLOO_BASE_URL}/v2/insights`);

  url.searchParams.set("filter.type", type);
  url.searchParams.set("signal.interests.tags", tag);
  url.searchParams.set(
    "take",
    String(Math.min(Math.max(Number(take) || 5, 1), 10)),
  );

  const response = await fetch(url, {
    headers: {
      "x-api-key": process.env.QLOO_API_KEY,
      Accept: "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(`Qloo returned HTTP ${response.status}`);
    error.status = response.status;
    error.details = data;
    throw error;
  }

  const entities = data.results?.entities ?? [];

  return {
    success: data.success,
    count: entities.length,
    tag,
    recommendationType: type,
    entities: entities.map((entity) => ({
      name: entity.name,
      entity_id: entity.entity_id,
      type: entity.type,
      subtype: entity.subtype,
    })),
  };
}

module.exports = {
  testQlooConnection,
  getCulturalRecommendations,
};
