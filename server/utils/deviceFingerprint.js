const crypto = require("crypto");
const UAParser = require("ua-parser-js");

/**
 * Generate a device fingerprint from request
 * Combines user agent, IP, and other headers
 */
function generateDeviceFingerprint(req) {
    const components = [
        req.headers["user-agent"] || "",
        req.ip || req.connection.remoteAddress || "",
        req.headers["accept-language"] || "",
        req.headers["accept-encoding"] || "",
    ];

    const fingerprintString = components.join("|");
    return crypto.createHash("sha256").update(fingerprintString).digest("hex");
}

/**
 * Parse device information from user agent
 */
function parseDeviceInfo(req) {
    const parser = new UAParser(req.headers["user-agent"]);
    const result = parser.getResult();

    return {
        userAgent: req.headers["user-agent"] || "Unknown",
        ip: req.ip || req.connection.remoteAddress || "Unknown",
        browser: `${result.browser.name || "Unknown"} ${result.browser.version || ""}`.trim(),
        os: `${result.os.name || "Unknown"} ${result.os.version || ""}`.trim(),
        device: result.device.type || "desktop",
    };
}

/**
 * Verify device fingerprint matches
 */
function verifyDeviceFingerprint(req, storedFingerprint) {
    const currentFingerprint = generateDeviceFingerprint(req);
    return currentFingerprint === storedFingerprint;
}

module.exports = {
    generateDeviceFingerprint,
    parseDeviceInfo,
    verifyDeviceFingerprint,
};
