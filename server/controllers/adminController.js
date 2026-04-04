import { processAllClaims, runClaimTest as runClaimTestService } from "../services/claimsProcessorService.js";
import { firestore } from "../config/firebase.js";
import { buildFeaturesAndPredict } from "../services/featureBuilderService.js";
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

// --- bulk processing: all active users ---
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

    const result = await processClaimInternal({ user, userId, triggeredBy });
    if (result.approved) {
      claims_approved += 1;
      total_payout += result.payout;
    }
  }

  return {
    processed_users,
    claims_approved,
    total_payout: Number(total_payout.toFixed(2))
  };
};

// --- single user processing (by userId) ---
export const processClaimForUser = async ({
  userId,
  triggeredBy = "manual-admin-single"
}) => {
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

  const result = await processClaimInternal({ user, userId, triggeredBy });

  return {
    processed_users: 1,
    claims_approved: result.approved ? 1 : 0,
    total_payout: result.approved ? result.payout : 0,
    gwdi_score: result.gwdi_score,
    activity: result.activity,
    reason: result.reason
  };
};

// --- shared internal logic used by both functions ---
const processClaimInternal = async ({ user, userId, triggeredBy }) => {
  // 24h duplicate check
  
  // if (user.last_claim_time) {
  //   const last = new Date(user.last_claim_time).getTime();
  //   if (Date.now() - last < ONE_DAY_MS) {
  //     return { approved: false, payout: 0, reason: "recent_claim" };
  //   }
  // }

  // feature builder call (zone + current time)
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const time = `${hh}:${mm}`;

  const gwdi = await buildFeaturesAndPredict({
    zone: user.zone,
    time
  });

  const { gwdi_score, breakdown } = gwdi;
  const activity = breakdown?.activity ?? 0;

  // eligibility rule
  const eligible = gwdi_score > 0.5 || activity > 0.7;
  if (!eligible) {
    return {
      approved: false,
      payout: 0,
      gwdi_score,
      activity,
      reason: "not_eligible"
    };
  }

  // payout by plan
  let base = 100;
  if (user.plan === "standard") base = 200;
  if (user.plan === "premium") base = 300;

  const payout = Number((base * gwdi_score).toFixed(2));

  // transaction: update wallet + create claim
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
      reason: "High activity disruption detected",
      triggered_by: triggeredBy,
      status: "APPROVED"
    });
  });

  return { approved: true, payout, gwdi_score, activity, reason: "approved" };
};

// --- HTTP controllers used by routes ---

// POST /api/admin/run-claims  (all users)
export const runClaimsEngine = async (req, res) => {
  try {
    const { triggered_by } = req.body || {};

    const summary = await processAllClaims({
      triggeredBy: triggered_by || "manual-admin"
    });

    return res.status(200).json({
      success: true,
      data: summary
    });
  } catch (err) {
    console.error("runClaimsEngine failed", err);
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Failed to run claims engine"
    });
  }
};

// POST /api/admin/run-claim/:userId  (single user)
export const runClaimForUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { triggered_by } = req.body || {};

    const summary = await processClaimForUser({
      userId,
      triggeredBy: triggered_by || "manual-admin-single"
    });

    return res.status(200).json({
      success: true,
      data: summary
    });
  } catch (err) {
    console.error("runClaimForUser failed", err);
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Failed to run claim for user"
    });
  }
};
// --- test-only internal helper: use manual gwdi/activity instead of AI ---
const processTestClaimInternal = async ({
  user,
  userId,
  triggeredBy,
  gwdi_score,
  activity
}) => {
  // 24h duplicate check (keep it so you don't spam the same user)
  // if (user.last_claim_time) {
  //   const last = new Date(user.last_claim_time).getTime();
  //   if (Date.now() - last < ONE_DAY_MS) {
  //     return { approved: false, payout: 0, reason: "recent_claim" };
  //   }
  // }

  const eligible = gwdi_score > 0.5 || activity > 0.7;
  if (!eligible) {
    return {
      approved: false,
      payout: 0,
      gwdi_score,
      activity,
      reason: "not_eligible_test"
    };
  }

  let base = 100;
  if (user.plan === "standard") base = 200;
  if (user.plan === "premium") base = 300;

  const payout = Number((base * gwdi_score).toFixed(2));

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
      reason: "Test claim – manual GWDI/activity",
      triggered_by: triggeredBy,
      status: "APPROVED"
    });
  });

  return {
    approved: true,
    payout,
    gwdi_score,
    activity,
    reason: "approved_test"
  };
};

// --- HTTP endpoint: POST /api/admin/run-claim-test/:userId ---
export const runTestClaimForUser = async (req, res) => {
  try {
    const { userId } = req.params;
    let { gwdi_score, activity, triggered_by } = req.body || {};

    if (!userId) {
      return res.status(400).json({ success: false, message: "userId required" });
    }

    gwdi_score = Number(gwdi_score);
    activity = Number(activity);

    if (Number.isNaN(gwdi_score) || Number.isNaN(activity)) {
      return res.status(400).json({
        success: false,
        message: "gwdi_score and activity must be numbers"
      });
    }

    const userRef = firestore.collection("users").doc(userId);
    const snap = await userRef.get();
    if (!snap.exists) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const user = snap.data();

    const result = await processTestClaimInternal({
      user,
      userId,
      triggeredBy: triggered_by || "manual-admin-test",
      gwdi_score,
      activity
    });

    return res.status(200).json({
      success: true,
      data: {
        processed_users: 1,
        claims_approved: result.approved ? 1 : 0,
        total_payout: result.approved ? result.payout : 0,
        gwdi_score: result.gwdi_score,
        activity: result.activity,
        reason: result.reason
      }
    });
  } catch (err) {
    console.error("runTestClaimForUser failed", err);
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Failed to run test claim for user"
    });
  }
};