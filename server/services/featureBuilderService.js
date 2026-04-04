import axios from "axios";
import { AI_BASE_URL } from "../config/aiConfig.js";
import { logJson } from "../utils/logger.js";

// Simple in-service zone -> coordinates mapping.
const ZONE_COORDS = {
  Indiranagar: { lat: 12.9784, lon: 77.6408 },
  Koramangala: { lat: 12.9352, lon: 77.6245 },
  "MG Road": { lat: 12.9757, lon: 77.602 },
  Whitefield: { lat: 12.9698, lon: 77.7499 }
};

const isValidTimeHHMM = (time) => /^([01]\d|2[0-3]):[0-5]\d$/.test(time);

const parseHour = (timeHHMM) => {
  const [hh] = timeHHMM.split(":");
  return Number(hh);
};

const clamp01 = (v) => Math.max(0, Math.min(1, v));
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min, max) => Math.random() * (max - min) + min;

const isPeakHour = (hour) => (hour >= 12 && hour <= 14) || (hour >= 18 && hour <= 22);

const simulateOrdersPerHour = (hour) => {
  if (isPeakHour(hour)) return randInt(60, 140);
  if (hour >= 7 && hour <= 10) return randInt(25, 70);
  if (hour >= 23 || hour <= 5) return randInt(3, 18);
  return randInt(15, 55);
};

const simulatePlatformStatus = () => (Math.random() < 0.93 ? 1 : 0);

const computeHeatIndex = (temperature, humidity) => temperature + 0.1 * humidity;

const computeAqiIndex = ({ pm25, pm10, no2, ozone }) =>
  0.4 * pm25 + 0.3 * pm10 + 0.2 * no2 + 0.1 * ozone;

const normalizeMmTo0to1 = (mm) => clamp01(mm / 20); // heuristic

const getWeather = async ({ lat, lon }) => {
  const url = "https://api.open-meteo.com/v1/forecast";
  const params = {
    latitude: lat,
    longitude: lon,
    current: "temperature_2m,wind_speed_10m",
    hourly: "relative_humidity_2m,precipitation",
    timezone: "auto"
  };

  const { data } = await axios.get(url, { params, timeout: 10000 });

  const temperature = Number(data?.current?.temperature_2m ?? 0);
  const wind_speed = Number(data?.current?.wind_speed_10m ?? 0);

  // Demo: pick first hour as "now" fallback
  const humidity = Number(data?.hourly?.relative_humidity_2m?.[0] ?? 50);
  const rainfall = Number(data?.hourly?.precipitation?.[0] ?? 0);

  return { temperature, wind_speed, humidity, rainfall };
};

const getAirQuality = async ({ lat, lon }) => {
  const url = "https://air-quality-api.open-meteo.com/v1/air-quality";
  const params = {
    latitude: lat,
    longitude: lon,
    hourly: "pm10,pm2_5,nitrogen_dioxide,ozone",
    timezone: "auto"
  };

  const { data } = await axios.get(url, { params, timeout: 10000 });

  const pm10 = Number(data?.hourly?.pm10?.[0] ?? 0);
  const pm25 = Number(data?.hourly?.pm2_5?.[0] ?? 0);
  const no2 = Number(data?.hourly?.nitrogen_dioxide?.[0] ?? 0);
  const ozone = Number(data?.hourly?.ozone?.[0] ?? 0);

  return { pm10, pm25, no2, ozone };
};

const simulateOperationalFeatures = ({ hour, rainfall }) => {
  const peak_hour_flag = isPeakHour(hour) ? 1 : 0;
  const orders_per_hour = simulateOrdersPerHour(hour);
  const active_riders = randInt(35, 110);
  const congestion_index = Number(randFloat(0.3, 0.9).toFixed(3));
  const platform_status = simulatePlatformStatus();

  const rainFactor = normalizeMmTo0to1(rainfall);
  const drop = clamp01(0.02 + 0.18 * rainFactor + 0.25 * congestion_index);
  const order_drop_percentage = Number((drop * 100).toFixed(2));

  const avg_delivery_time = Number((18 + 35 * congestion_index + 10 * rainFactor).toFixed(2));

  const oversupply_ratio = Number((active_riders / Math.max(1, orders_per_hour)).toFixed(3));

  return {
    hour,
    orders_per_hour,
    active_riders,
    congestion_index,
    avg_delivery_time,
    platform_status,
    order_drop_percentage,
    oversupply_ratio,
    peak_hour_flag
  };
};

const buildPayload = ({ weather, airQuality, operational }) => {
  const { temperature, humidity, wind_speed, rainfall } = weather;
  const { pm10, pm25, no2, ozone } = airQuality;

  const heat_index = computeHeatIndex(temperature, humidity);
  const aqi_index = computeAqiIndex({ pm25, pm10, no2, ozone });

  const flood_risk = clamp01(0.15 + 0.6 * normalizeMmTo0to1(rainfall));
  const historical_rain_disruptions = 2; // placeholder

  const time_of_day = operational.hour;
  const rider_activity_sensitivity = 0.5; // placeholder

  const historical_pollution_impact = 0.4; // placeholder
  const mask_compliance_factor = 0.7; // placeholder

  return {
    rainfall,
    temperature,
    humidity,
    wind_speed,
    flood_risk,
    historical_rain_disruptions,

    heat_index,
    time_of_day,
    rider_activity_sensitivity,

    pm10,
    pm25,
    no2,
    ozone,
    aqi_index,
    historical_pollution_impact,
    mask_compliance_factor,

    hour: operational.hour,
    orders_per_hour: operational.orders_per_hour,
    active_riders: operational.active_riders,
    congestion_index: operational.congestion_index,
    avg_delivery_time: operational.avg_delivery_time,
    platform_status: operational.platform_status,
    order_drop_percentage: operational.order_drop_percentage,
    oversupply_ratio: operational.oversupply_ratio,
    peak_hour_flag: operational.peak_hour_flag
  };
};

export const buildFeaturesAndPredict = async ({ zone, time, requestId } = {}) => {
  logJson("info", "FeatureBuilder START", { requestId, zone, time });

  if (!zone || typeof zone !== "string") {
    const err = new Error("'zone' is required and must be a string");
    err.statusCode = 400;
    throw err;
  }
  if (!time || typeof time !== "string" || !isValidTimeHHMM(time)) {
    const err = new Error("'time' is required in HH:MM (24h) format");
    err.statusCode = 400;
    throw err;
  }

  const coords = ZONE_COORDS[zone];
  if (!coords) {
    const err = new Error(
      `Unknown zone '${zone}'. Supported zones: ${Object.keys(ZONE_COORDS).join(", ")}`
    );
    err.statusCode = 400;
    throw err;
  }

  const hour = parseHour(time);
  logJson("info", "Zone resolved", { requestId, zone, coords, hour });

  try {
    const [weather, airQuality] = await Promise.all([getWeather(coords), getAirQuality(coords)]);
    logJson("info", "Weather collected", { requestId, weather });
    logJson("info", "Air quality collected", { requestId, airQuality });

    const operational = simulateOperationalFeatures({ hour, rainfall: weather.rainfall });
    logJson("info", "Operational features simulated", { requestId, operational });

    const payload = buildPayload({ weather, airQuality, operational });
    logJson("info", "ML payload built", { requestId, payload });

    const aiUrl = process.env.AI_PREDICT_URL || `${AI_BASE_URL}/predict`;
    logJson("info", "Calling AI prediction service", { requestId, aiUrl });

    const { data: ai } = await axios.post(aiUrl, payload, { timeout: 15000 });
    logJson("info", "AI prediction received", { requestId, ai });

    const response = {
      zone,
      gwdi_score: ai.gwdi_score,
      risk_level: ai.risk_level,
      breakdown: {
        rain: ai.rain_risk,
        heat: ai.heat_risk,
        pollution: ai.pollution_risk,
        activity: ai.activity_risk
      },
      // keep for debugging; remove if you want smaller output
      features: payload
    };

    logJson("info", "FeatureBuilder END (response to client)", { requestId, response });

    return response;
  } catch (e) {
    const status = e?.response?.status;
    const message = e?.response?.data ? e.response.data : e.message;

    logJson("error", "FeatureBuilder FAILED", { requestId, status, error: message });

    const err = new Error(
      `FeatureBuilder/Predict failed${status ? ` (HTTP ${status})` : ""}: ${
        typeof message === "string" ? message : JSON.stringify(message)
      }`
    );
    err.statusCode = 502;
    throw err;
  }
};