import axios from "axios";
import { firestore } from "../config/firebase.js";
import { buildFeaturesAndPredict } from "./featureBuilderService.js";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export const processClaimForUser = async ({ userId, triggeredBy = "manual-admin" }) => {
  if (!userId) {
    const err = new Error("userId is required");
    err.statusCode = 400;
    throw err;
  }

  const userRef = firestore.collection("users").doc(userId);
  const snap = await userRef.get();
  if (!snap.exists) {
    const err = new Error(`User ${userId} not found`);
    err.statusCode = 404;
    throw err;
  }

  const user = snap.data();

  // Skip if last claim < 24h
  if (user.last_claim_time) {
    const last = new Date(user.last_claim_time).getTime();
    if (Date.now() - last < ONE_DAY_MS) {
      return {
        processed_users: 1,
        claims_approved: 0,
        total_payout: 0,
        reason: "recent_claim"
      };
    }
  }

  // 1) Call feature builder (zone + time = now)
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const time = `${hh}:${mm}`;

  const gwdi = await buildFeaturesAndPredict({
    zone: user.zone,
    time
  });

  const { gwdi_score, breakdown } = gwdi;

  // 2) Eligibility rule (same as bulk)
  const activity = breakdown?.activity ?? 0;
  const eligible = gwdi_score > 0.5 || activity > 0.7;

  if (!eligible) {
    return {
      processed_users: 1,
      claims_approved: 0,
      total_payout: 0,
      reason: "not_eligible",
      gwdi_score,
      activity
    };
  }

  // 3) Payout by plan (same as bulk)
  let base = 100;
  if (user.plan === "standard") base = 200;
  if (user.plan === "premium") base = 300;
  const payout = Number((base * gwdi_score).toFixed(2));

  // 4) Transaction: update wallet + add claim
  await firestore.runTransaction(async (tx) => {
    const fresh = await tx.get(userRef);
    const cur = fresh.data() || {};
    const newBalance = Number((cur.wallet_balance || 0) + payout);

    tx.update(userRef, {
      wallet_balance: newBalance,
      last_claim_time: new Date().toISOString()
    });

    const claimRef = firestore.collection("claims").doc();
    tx.set(claimRef, {
      userId,
      timestamp: new Date().toISOString(),
      gwdi_score,
      payout,
      reason: "High activity disruption detected",
      triggered_by: triggeredBy,
      status: "APPROVED"
    });
  });

  return {
    processed_users: 1,
    claims_approved: 1,
    total_payout: payout,
    gwdi_score
  };
};