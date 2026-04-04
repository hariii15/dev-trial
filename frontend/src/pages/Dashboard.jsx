import { useEffect, useState } from "react";
import { doc, onSnapshot, collection, query, where } from "firebase/firestore";
import { db } from "../config/firebase";
import Navbar from "../components/Navbar";
import RiskCard from "../components/RiskCard";
import PremiumCard from "../components/PremiumCard";
import ClaimsTable from "../components/ClaimsTable";
import { checkCurrentRisk } from "../services/riskService";
import { calculatePremium } from "../services/pricingService";

export default function Dashboard({ user }) {
  const [profile, setProfile] = useState(null);
  const [risk, setRisk] = useState(null);
  const [pricing, setPricing] = useState(null);
  const [claims, setClaims] = useState([]);
  const [loadingRisk, setLoadingRisk] = useState(false);
  const [loadingPremium, setLoadingPremium] = useState(false);

  useEffect(() => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    const unsub = onSnapshot(userRef, (snap) => {
      if (snap.exists()) setProfile({ id: snap.id, ...snap.data() });
    });
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "claims"), where("userId", "==", user.uid));
    const unsub = onSnapshot(q, (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setClaims(rows.sort((a, b) => (b.timestamp?.seconds ?? 0) - (a.timestamp?.seconds ?? 0)));
    });
    return () => unsub();
  }, [user]);

  const handleCheckRisk = async () => {
    if (!profile) return;
    setLoadingRisk(true);
    try {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      const res = await checkCurrentRisk({ zone: profile.zone, time: `${hh}:${mm}` });
      setRisk(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingRisk(false);
    }
  };

  const handleCalculatePremium = async () => {
    if (!profile) return;
    setLoadingPremium(true);
    try {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      const res = await calculatePremium({
        zone: profile.zone,
        time: `${hh}:${mm}`,
        plan: profile.plan,
        trust_score: profile.trust_score ?? 0.5
      });
      setPricing(res.data);
      setRisk(res.data?.gwdi ?? null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPremium(false);
    }
  };

  return (
    <div className="app-shell">
      <Navbar user={profile} isAdmin={profile?.isAdmin} />
      <main className="main">
        <section className="header-row">
          <div>
            <h2>Welcome, {profile?.name}</h2>
            <p className="muted">
              Zone: <strong>{profile?.zone}</strong> · Plan: <strong>{profile?.plan}</strong>
            </p>
          </div>
          <div className="wallet-card">
            <span>Wallet Balance</span>
            <strong>₹{profile?.wallet_balance?.toFixed?.(2) ?? "0.00"}</strong>
          </div>
        </section>

        <section className="actions-row">
          <button className="btn" onClick={handleCheckRisk} disabled={loadingRisk}>
            {loadingRisk ? "Checking Risk..." : "Check Current Risk"}
          </button>
          <button className="btn btn-secondary" onClick={handleCalculatePremium} disabled={loadingPremium}>
            {loadingPremium ? "Calculating..." : "Calculate Premium"}
          </button>
        </section>

        <section className="cards-row">
          <RiskCard risk={risk} />
          <PremiumCard pricing={pricing} risk={risk} />
        </section>

        <section className="claims-row">
          <ClaimsTable claims={claims} />
        </section>
      </main>
    </div>
  );
}
