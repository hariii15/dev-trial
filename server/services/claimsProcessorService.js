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

    // 3) simple payout logic by plan
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
        reason: "High activity disruption detected",
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