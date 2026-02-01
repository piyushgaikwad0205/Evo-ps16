#!/usr/bin/env node
require("dotenv").config();
const { sendToTokens } = require("../services/fcm");

async function main() {
  const token = process.argv[2];
  if (!token) {
    console.error("Usage: node send-fcm.js <FCM_TOKEN>");
    process.exit(1);
  }
  const res = await sendToTokens([token], { title: "Campus Connect", body: "Test notification" }, { type: "test", id: "123" });
  console.log("Result:", res);
}

main();

