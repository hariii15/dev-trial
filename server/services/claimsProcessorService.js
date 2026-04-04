import axios from "axios";
import { firestore } from "../config/firebase.js";
import { buildFeaturesAndPredict } from "./featureBuilderService.js";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export const processAllClaims = async ({ triggeredBy = "manual-admin" } = {}) => {
  const usersSnap = await firestore
    .collection("users")
    .where("isActive", "==", true)
    .get();

  let processed_users = 0;
  let claims_approved = 0;
  let total_payout = 0;

  for (const docSnap of usersSnap.docs) {
    processed_users += 1;
    const user = docSnap.data();
    const userId = user.userId;

    // skip if last claim < 24h
    if (user.last_claim_time) {
      const last = new Date(user.last_claim_time).getTime();
      if (Date.now() - last < ONE_DAY_MS) continue;
    }

    // 1) call feature builder (zone + time = now)
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    const time = `${hh}:${mm}`;

    const gwdi = await buildFeaturesAndPredict({
      zone: user.zone,
      time
    });

    const { gwdi_score, breakdown } = gwdi;

    // 2) simple eligibility rule
    const activity = breakdown?.activity ?? 0;
    const eligible = gwdi_score > 0.5 || activity > 0.7;
    if (!eligible) continue;

    // 3) determine primary trigger for reason
    let reason = "High GWDI score detected";
    if (activity > 0.7) {
      reason = "Activity collapse detected";
    } else if (breakdown?.rain > 0.7) {
      reason = "Heavy rain disruption detected";
    } else if (breakdown?.pollution > 0.7) {
      reason = "High pollution levels detected";
    } else if (breakdown?.heat > 0.7) {
      reason = "Extreme heat conditions detected";
    }

    // 4) simple payout logic by plan
    let base = 100; // example
    if (user.plan === "standard") base = 200;
    if (user.plan === "premium") base = 300;

    const payout = Number((base * gwdi_score).toFixed(2));

    // 4) write claim + update wallet in a transaction
    await firestore.runTransaction(async (tx) => {
      const userRef = firestore.collection("users").doc(userId);
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
        reason,
        triggered_by: triggeredBy,
        status: "APPROVED"
      });
    });

    claims_approved += 1;
    total_payout += payout;
  }

  total_payout = Number(total_payout.toFixed(2));

  return { processed_users, claims_approved, total_payout };
};

export const runClaimTest = async ({ userId, gwdi_score, activity, triggeredBy = "admin-test" } = {}) => {
  if (!userId) {
    const err = new Error("'userId' is required");
    err.statusCode = 400;
    throw err;
  }

  const userRef = firestore.collection("users").doc(userId);
  const userSnap = await userRef.get();

  if (!userSnap.exists) {
    const err = new Error(`User '${userId}' not found`);
    err.statusCode = 404;
    throw err;
  }

  const user = userSnap.data();
  const gwdi = Number(gwdi_score ?? 0);
  const act = Number(activity ?? 0);
  const eligible = gwdi > 0.5 || act > 0.7;

  let base = 100;
  if (user.plan === "standard") base = 200;
  if (user.plan === "premium") base = 300;

  const payout = Number((base * gwdi).toFixed(2));

  let reason = "High GWDI score detected";
  if (act > 0.7) {
    reason = "Activity collapse detected";
  } else if (gwdi > 0.5) {
    reason = "High GWDI score detected";
  } else {
    reason = "No disruption trigger reached";
  }

  return {
    userId,
    plan: user.plan,
    zone: user.zone,
    gwdi_score: gwdi,
    activity: act,
    eligible,
    payout: eligible ? payout : 0,
    reason,
    triggered_by: triggeredBy
  };
};