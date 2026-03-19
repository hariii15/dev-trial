from fastapi import FastAPI
from pydantic import BaseModel
import numpy as np
import joblib

app = FastAPI(title="Safra AI Risk Engine")

# ---------------- LOAD MODELS ----------------
rain_model = joblib.load("rain_risk_model.pkl")
heat_model = joblib.load("heat_risk_model.pkl")
pollution_model = joblib.load("pollution_risk_model.pkl")
activity_model = joblib.load("activity_risk_model.pkl")

# ---------------- INPUT SCHEMA ----------------
class RiskInput(BaseModel):

    # Rain features
    rainfall: float
    temperature: float
    humidity: float
    wind_speed: float
    flood_risk: float
    historical_rain_disruptions: float

    # Heat features
    heat_index: float
    time_of_day: float
    rider_activity_sensitivity: float

    # Pollution features
    pm10: float
    pm25: float
    no2: float
    ozone: float
    aqi_index: float
    historical_pollution_impact: float
    mask_compliance_factor: float

    # Activity features
    hour: float
    orders_per_hour: float
    active_riders: float
    congestion_index: float
    avg_delivery_time: float
    platform_status: float
    order_drop_percentage: float
    oversupply_ratio: float
    peak_hour_flag: float


# ---------------- PREDICT ENDPOINT ----------------
@app.post("/predict")
def predict_risk(data: RiskInput):

    # ---- Rain prediction ----
    rain_features = np.array([[
        data.rainfall,
        data.temperature,
        data.humidity,
        data.wind_speed,
        data.flood_risk,
        data.historical_rain_disruptions
    ]])
    rain_prob = rain_model.predict(rain_features)[0]

    # ---- Heat prediction ----
    heat_features = np.array([[
        data.temperature,
        data.humidity,
        data.heat_index,
        data.time_of_day,
        data.rider_activity_sensitivity
    ]])
    heat_prob = heat_model.predict(heat_features)[0]

    # ---- Pollution prediction ----
    pollution_features = np.array([[
        data.pm10,
        data.pm25,
        data.no2,
        data.ozone,
        data.aqi_index,
        data.historical_pollution_impact,
        data.mask_compliance_factor
    ]])
    pollution_prob = pollution_model.predict(pollution_features)[0]

    # ---- Activity prediction ----
    activity_features = np.array([[
        data.hour,
        data.orders_per_hour,
        data.active_riders,
        data.congestion_index,
        data.avg_delivery_time,
        data.platform_status,
        data.order_drop_percentage,
        data.oversupply_ratio,
        data.peak_hour_flag
    ]])
    activity_prob = activity_model.predict(activity_features)[0]

    # ---- GWDI LOGIC ----
    gwdi = (
        0.20 * rain_prob +
        0.15 * heat_prob +
        0.15 * pollution_prob +
        0.50 * activity_prob
    )

    # ---- Risk Level ----
    if gwdi < 0.25:
        risk_level = "LOW"
    elif gwdi < 0.40:
        risk_level = "MEDIUM"
    else:
        risk_level = "HIGH"

    return {
        "rain_risk": float(rain_prob),
        "heat_risk": float(heat_prob),
        "pollution_risk": float(pollution_prob),
        "activity_risk": float(activity_prob),
        "gwdi_score": float(gwdi),
        "risk_level": risk_level
    }