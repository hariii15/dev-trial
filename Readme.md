# SAFRA — AI-Powered Income Protection for Gig Workers

Safra is an AI-driven micro-insurance and risk prediction system designed to protect gig economy workers from income loss caused by environmental disruptions, delivery demand fluctuations, and operational instability.

Gig workers such as food delivery riders and courier drivers face daily income volatility due to factors like heavy rainfall, extreme heat, air pollution, traffic congestion, and sudden drops in delivery demand. These disruptions can significantly reduce their earnings even when they are actively working.

Safra introduces an intelligent disruption monitoring and parametric insurance platform that continuously analyzes environmental signals and delivery activity patterns. By combining real-time data streams with predictive analytics, the system can detect potential disruptions and automatically trigger compensation when predefined conditions are met.

Unlike traditional insurance systems that require manual claim submissions and long verification processes, Safra follows a parametric model. This allows claims to be processed automatically based on verified external data, ensuring faster payouts and reducing administrative overhead.

The platform also provides predictive alerts, dynamic risk mapping, and adaptive coverage plans to help workers plan their schedules more effectively and minimize income uncertainty.

---

## Problem Statement

Gig workers operate in highly unpredictable environments where their earnings depend on external conditions beyond their control. Severe weather conditions, pollution spikes, traffic congestion, and sudden drops in order demand can reduce delivery opportunities and directly affect daily income.

Most gig platforms do not provide structured financial protection for such disruptions. As a result, workers bear the entire financial risk when environmental or operational conditions reduce demand.

Safra addresses this problem by introducing an automated disruption detection system and micro-insurance framework designed specifically for gig workers.

---

## Existing Solutions

Current gig platforms primarily focus on operational efficiency and order allocation but rarely provide financial protection against environmental disruptions. Some platforms may offer surge incentives or temporary bonuses, but these mechanisms are not designed to stabilize worker income during severe disruptions.

Traditional insurance products also do not suit gig workers because they require long approval processes, extensive documentation, and are not designed for short-term, micro-scale coverage.

Therefore, there is a clear gap between gig workers’ real-world risks and the financial protection systems available to them.

---

## Safra Approach

Safra introduces a parametric disruption insurance system combined with AI-based risk prediction.

The system continuously collects environmental and operational signals such as rainfall intensity, temperature levels, air quality index, traffic congestion, and delivery activity levels.

These signals are processed through machine learning models that estimate disruption probability in real time. When disruption thresholds are exceeded, the system automatically triggers compensation for affected workers.

In addition to payouts, Safra provides predictive alerts and zone-based risk insights to help workers make better operational decisions.

---

## Gig Worker Disruption Index (GWDI)

Safra introduces the **Gig Worker Disruption Index (GWDI)** to combine multiple disruption signals into a unified risk score.

GWDI =  
0.35 × weather_risk +  
0.25 × pollution_risk +  
0.20 × traffic_risk +  
0.10 × supply_imbalance +  
0.10 × delivery_activity_drop

Where:

weather_risk represents rainfall intensity, storms, and extreme heat conditions.

pollution_risk represents severe air quality conditions that affect outdoor work.

traffic_risk represents heavy congestion levels that slow down delivery operations.

supply_imbalance represents the oversupply of riders in a delivery zone.

delivery_activity_drop represents sudden decreases in delivery demand.

Higher GWDI values indicate a higher probability of income disruption for gig workers.

---

## Parametric Trigger System

Safra follows a parametric trigger system where compensation is automatically activated when predefined disruption thresholds are reached.

Heavy Rainfall Trigger  
Rainfall greater than 50 mm per hour sustained for two hours.

Extreme Heat Trigger  
Temperature exceeding 42°C for two hours.

Air Pollution Trigger  
Air Quality Index exceeding 350 for two hours.

Delivery Activity Collapse Trigger  
If the average number of delivery orders drops by more than 70 percent for two consecutive hours, the system detects an order collapse event.

Platform Downtime Trigger  
If delivery activity falls to zero for one hour, the system detects platform downtime.

Once any of these triggers are activated, the claim process is automatically initiated.

---

## Insurance Model

Safra uses a weekly micro-insurance subscription model designed to remain affordable for gig workers.

Weekly Premium Structure:

Low risk zones require a weekly premium of ₹20.

Moderate risk zones require a weekly premium of ₹30.

High risk zones require a weekly premium of ₹45.

Coverage Amount:

Workers receive compensation of ₹400 per disruption day.

Weekly Payout Limit:

Maximum compensation allowed per worker per week is ₹2000.

Adaptive Coverage Plans:

Basic Plan  
Premium: ₹20  
Coverage: ₹200 per disruption day

Standard Plan  
Premium: ₹35  
Coverage: ₹400 per disruption day

Premium Plan  
Premium: ₹50  
Coverage: ₹700 per disruption day

---

## Innovation Features

Safra extends beyond traditional disruption insurance by introducing multiple innovation layers designed specifically for gig worker realities.

Oversupply Imbalance Protection identifies zones where too many riders are competing for limited delivery orders. When oversupply is detected, workers receive alerts recommending nearby zones with higher demand. Workers who migrate to better zones may receive migration rewards or reduced premiums.

Predictive Risk Alerts notify workers about potential disruptions before they occur. For example, if heavy rainfall is predicted in the next two hours, workers receive alerts allowing them to plan breaks, change zones, or adjust schedules.

Real-Time Risk Map Dashboard visually represents disruption risk across delivery zones. Zones are color-coded to help workers quickly identify safer areas.

Green zones represent normal working conditions.  
Yellow zones represent moderate disruption risk.  
Red zones represent severe disruption probability.  
Purple zones indicate rider oversupply.

Worker Trust Score acts as a reputation system similar to financial credit scoring. Riders who consistently follow system recommendations and submit accurate reports receive higher trust scores. Higher scores unlock lower premiums and faster claim approvals.

Rider Network Early Warning System allows workers to submit quick reports about low order activity, traffic congestion, or operational delays. These crowd-sourced signals improve disruption prediction accuracy.

Income Shield Weekly Report provides riders with a breakdown of their weekly income losses due to disruptions and the compensation Safra provided. The system also generates a suggested work schedule for the following week based on predicted risk patterns.

Pre-Disruption Income Buffer offers small instant advances when the system predicts severe disruption events. This helps workers manage immediate expenses such as fuel or food until normal operations resume.

---

## AI Components

Safra integrates multiple AI modules to monitor and predict disruption risks.

The Risk Prediction Model processes environmental signals and operational data to estimate disruption probability.

The Dynamic Premium Model adjusts coverage costs based on zone-level disruption risk.

The Fraud Detection System analyzes claim patterns to detect suspicious or duplicate claims.

These models operate through a Python FastAPI microservice integrated with the backend API gateway.

---

## Technology Stack

Frontend  
React

Backend  
Node.js with Express

AI Services  
Python FastAPI

Database  
Firebase Firestore

External Data Sources  
Weather APIs  
Air Quality APIs  
Delivery activity signals

Payments  
Razorpay Sandbox

---

## System Architecture

```mermaid
flowchart TD
A[Delivery Partner] --> B[React Frontend]
B --> C[Node.js API Gateway]
C --> D[FastAPI AI Service]
D --> E[Firebase Firestore]
C --> F[External APIs]
C --> G[Razorpay Sandbox]

Future Scope
Safra can expand to protect workers across multiple gig economy sectors such as ride-hailing drivers, logistics couriers, and on-demand service providers.
Future improvements may include blockchain-based claim verification, deeper integration with gig platforms, improved predictive risk models, and real-time digital wallet payouts.
Development Roadmap
timeline
title Safra Development Roadmap

Week 1 : Problem Research
        : Persona Definition
        : Architecture Design
        : Tech Stack Finalization

Week 2 : Frontend Setup
        : Backend API Setup
        : Firebase Integration
        : Worker Registration Interface

Week 3 : AI Model Development
        : Risk Prediction Model
        : Dynamic Premium Model
        : Fraud Detection Model

Week 4 : Trigger Engine Implementation
        : Weather API Integration
        : AQI API Integration
        : Delivery Activity Monitoring

Week 5 : Claim Automation System
        : Claim Processor
        : Payout Logic
        : Razorpay Integration

Week 6 : System Testing
        : Integration Testing
        : Performance Optimization
        : Final Demo Preparation