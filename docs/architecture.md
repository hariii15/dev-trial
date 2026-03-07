

## System Architecture

```mermaid
flowchart TD

%% USER LAYER
subgraph USER_LAYER["User Layer"]
A[Delivery Partner]
end

%% FRONTEND
subgraph FRONTEND_LAYER["Frontend"]
B[React Web Application]
end

%% BACKEND
subgraph BACKEND_LAYER["API Gateway - Node.js / Express"]
C1[Authentication & User Management]
C2[Policy Manager]
C3[Trigger Engine]
C4[Claim Processor]
C5[Scheduler / Cron Jobs]
end

%% AI SERVICE
subgraph AI_LAYER["AI Microservice - FastAPI"]
D1[Risk Prediction Model]
D2[Dynamic Premium Model]
D3[Fraud Detection Model]
end

%% DATA LAYER
subgraph DATA_LAYER["Cloud Database"]
E[Firebase Firestore]
end

%% EXTERNAL DATA
subgraph EXTERNAL_LAYER["External Data Sources"]
F1[Weather API]
F2[AQI API]
F3[Delivery Activity Signals]
end

%% PAYMENT
subgraph PAYMENT_LAYER["Payment System"]
G[Razorpay Sandbox]
end

%% FLOW
A --> B
B --> C1
C1 --> C2
C2 --> E

C3 --> F1
C3 --> F2
C3 --> F3

C5 --> C3

C3 --> C4
C4 --> E

C2 --> D1
C2 --> D2
C4 --> D3

D1 --> E
D2 --> E
D3 --> C4

C4 --> G

%% STYLE COLORS WITH HIGH CONTRAST
style USER_LAYER fill:#E3F2FD,stroke:#0D47A1,stroke-width:3px
style FRONTEND_LAYER fill:#E8F5E9,stroke:#1B5E20,stroke-width:3px
style BACKEND_LAYER fill:#FFF3E0,stroke:#E65100,stroke-width:3px
style AI_LAYER fill:#F3E5F5,stroke:#4A148C,stroke-width:3px
style DATA_LAYER fill:#ECEFF1,stroke:#263238,stroke-width:3px
style EXTERNAL_LAYER fill:#FCE4EC,stroke:#880E4F,stroke-width:3px
style PAYMENT_LAYER fill:#E0F7FA,stroke:#006064,stroke-width:3px
```
> **Figure:** High-level architecture of Safra showing the interaction between the React client, Node.js API gateway, FastAPI AI services, Firebase data layer, and external disruption signals used for parametric insurance triggers.

## Disruption Detection & Claim Automation Pipeline

```mermaid
flowchart LR

%% DATA SOURCES
subgraph DATA_INPUT["External Data Sources"]
A1[Weather API]
A2[AQI API]
A3[Delivery Activity Signals]
end

%% DATA PROCESSING
subgraph DATA_PROCESS["Data Collection Layer"]
B1[Scheduler / Cron Job]
B2[Signal Aggregator]
end

%% FEATURE ENGINEERING
subgraph FEATURE_LAYER["Feature Processing"]
C1[Weather Feature Extraction]
C2[Environmental Risk Metrics]
C3[Delivery Activity Analysis]
end

%% TRIGGER ENGINE
subgraph TRIGGER_LAYER["Disruption Detection Engine"]
D1[Trigger Evaluation Logic]
D2{Disruption Conditions Met?}
end

%% TRIGGERS
subgraph TRIGGERS["Parametric Triggers"]
E1[Heavy Rainfall]
E2[Extreme Heat]
E3[Severe AQI]
E4[Delivery Activity Collapse]
E5[Platform Downtime]
end

%% CLAIM SYSTEM
subgraph CLAIM_LAYER["Claim Automation"]
F1[Claim Processor]
F2[Payout Calculation Engine]
end

%% FRAUD
subgraph FRAUD_LAYER["Fraud Detection"]
G1[Fraud Detection Model]
end

%% PAYOUT
subgraph PAYOUT_LAYER["Compensation"]
H1[Worker Compensation]
H2[Razorpay Sandbox Payment]
end

%% FLOW
A1 --> B2
A2 --> B2
A3 --> B2

B1 --> B2

B2 --> C1
B2 --> C2
B2 --> C3

C1 --> D1
C2 --> D1
C3 --> D1

D1 --> D2

D2 --> E1
D2 --> E2
D2 --> E3
D2 --> E4
D2 --> E5

E1 --> F1
E2 --> F1
E3 --> F1
E4 --> F1
E5 --> F1

F1 --> G1
G1 --> F2

F2 --> H1
H1 --> H2


%% STYLING
style DATA_INPUT fill:#E3F2FD,stroke:#1E88E5
style DATA_PROCESS fill:#E8F5E9,stroke:#43A047
style FEATURE_LAYER fill:#FFF3E0,stroke:#FB8C00
style TRIGGER_LAYER fill:#F3E5F5,stroke:#8E24AA
style TRIGGERS fill:#FCE4EC,stroke:#D81B60
style CLAIM_LAYER fill:#E0F7FA,stroke:#00ACC1
style FRAUD_LAYER fill:#FFF8E1,stroke:#F9A825
style PAYOUT_LAYER fill:#ECEFF1,stroke:#546E7A
```
