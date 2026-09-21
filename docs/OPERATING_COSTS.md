# ShadowID — Operating Cost Worksheet (INR)

> **Dated:** 21 September 2026  
> **Team GIGABYTE:** Anshul, Tanishq, and Himank  
> **Infrastructure Model:** Modular Monolith (API + Worker + DB + Storage + Frontend)  
> **Base Currency:** Indian Rupee (INR / ₹) with values stored as integer paise.

---

## 1. Operating Assumptions

1. **Deployment Architecture:**
   - Single compute container or VM for FastAPI backend + Always-running Python OCR Worker (Dockerized).
   - Managed Supabase PostgreSQL database and private S3-compatible Object Storage in India (`ap-south-1`, Mumbai).
   - Redis queue for background job dispatch.
   - Frontend static build deployed to edge CDN.
2. **Analysis Cost:**
   - Core analytical algorithms (Exposure Intelligence, Impersonation heuristic comparator, OpenCV + Tesseract OCR, and Shadow Score) operate on local CPU compute with zero paid third-party per-token AI costs or unconsented scraping fees.
3. **Usage Estimates:**
   - Development Tier: Up to 500 scans/month.
   - Production Baseline: Up to 5,000 scans/month.

---

## 2. Monthly Operating Cost Breakdown (Estimates)

| Infrastructure Component | Provider & Tier | Monthly Cost (USD) | Monthly Cost (INR @ ₹84.50/USD) | Cost in Paise |
| :--- | :--- | :---: | :---: | :---: |
| **Compute (API + OCR Worker)** | AWS Lightsail / EC2 (`t4g.small` 2 vCPU, 2GB RAM, Mumbai) | $10.00 | ₹845.00 | 84,500 paise |
| **Database & Auth (Postgres)** | Supabase Pro Plan (Mumbai Region) | $25.00 | ₹2,112.50 | 211,250 paise |
| **Redis Queue Broker** | Upstash Serverless / Redis Cloud Free/Basic | $5.00 | ₹422.50 | 42,250 paise |
| **Private File Storage** | Supabase / S3 (10GB Private Bucket) | $1.50 | ₹126.75 | 12,675 paise |
| **Edge CDN & Web Hosting** | Vercel / Cloudflare Pages (Static Assets) | $0.00 | ₹0.00 | 0 paise |
| **Razorpay Payment Gateway** | 2% + GST per successful ₹499 transaction | Variable | ~₹11.80 / order | ~1,180 paise / order |
| **Estimated Fixed Monthly Total** | | **$41.50** | **₹3,506.75** | **350,675 paise** |

---

## 3. Unit Economics & Pricing Model

- **Free Tier:** ₹0 / month. 1 baseline synthetic assessment per subject.
- **Pro Pass (Launch Offer):** ₹499 (49,900 paise) one-time for 30 days of multi-module assessments.
- **Breakeven Volume:**
  $$\text{Breakeven Orders} = \frac{₹3,506.75}{₹499 - ₹11.80} \approx 7.2 \text{ orders / month}$$
  Just 8 Pro Pass activations per month cover 100% of baseline production infrastructure costs.
