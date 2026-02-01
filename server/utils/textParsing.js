const extractHashtags = (text) => {
  if (!text || typeof text !== "string") return [];
  const tags = text.match(/(^|\s)#([a-zA-Z0-9_]{2,50})/g) || [];
  return Array.from(
    new Set(
      tags
        .map((t) => t.trim().replace(/^#/, ""))
        .filter((t) => t.length > 0)
        .map((t) => t.toLowerCase())
    )
  );
};

const extractMentionUsernames = (text) => {
  if (!text || typeof text !== "string") return [];
  const names = text.match(/(^|\s)@([a-zA-Z0-9_\.]{3,30})/g) || [];
  return Array.from(
    new Set(
      names
        .map((n) => n.trim().replace(/^@/, ""))
        .filter((n) => n.length > 0)
        .map((n) => n.toLowerCase())
    )
  );
};

module.exports = { extractHashtags, extractMentionUsernames };

