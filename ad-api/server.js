import fs from "fs";
import path from "path";
import express from "express";
import cors from "cors";
const app = express();
const PORT = process.env.PORT || 8787;
const DATA_DIR = path.join(process.cwd(), "data");
const EVENTS_FILE = path.join(DATA_DIR, "ad_events.ndjson");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
app.use(cors());          // allow your dev site to call this
app.use(express.json());

// log events
app.post("/api/ad-events", (req, res) => {
  const { event, adId, ts, meta } = req.body || {};
  if (!adId || !event) return res.status(400).json({ ok: false });
  const row = JSON.stringify({
    adId,
    event,
    ts: ts || Date.now(),
    ua: req.headers["user-agent"] || "",
    ip: req.headers["x-forwarded-for"] || req.socket.remoteAddress || "",
    meta: meta || {}
  }) + "\n";
  fs.appendFile(EVENTS_FILE, row, err => {
    if (err) return res.status(500).json({ ok: false });
    res.json({ ok: true });
  });
});

// simple stats
app.get("/api/ad-stats", (req, res) => {
  try {
    if (!fs.existsSync(EVENTS_FILE)) return res.json({});
    const lines = fs.readFileSync(EVENTS_FILE, "utf8").trim().split("\n");
    const stats = {};
    for (const line of lines) {
      if (!line) continue;
      const { adId, event } = JSON.parse(line);
      stats[adId] ||= { impressions: 0, clicks: 0 };
      if (event === "impression") stats[adId].impressions += 1;
      if (event === "click") stats[adId].clicks += 1;
    }
    for (const k of Object.keys(stats)) {
      const s = stats[k];
      s.ctr = s.impressions ? Number((s.clicks / s.impressions) * 100).toFixed(2) + "%" : "0%";
    }
    res.json(stats);
  } catch {
    res.status(500).json({ ok: false });
  }
});

app.listen(PORT, () => console.log("ad api on", PORT));
