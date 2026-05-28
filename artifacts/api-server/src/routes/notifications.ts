import { Router } from "express";
import { Expo, type ExpoPushMessage } from "expo-server-sdk";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { logger } from "../lib/logger";

const router = Router();
const expo = new Expo();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOKENS_FILE = path.join(__dirname, "../../data/tokens.json");
const NOTIFICATIONS_FILE = path.join(__dirname, "../../data/notifications.json");

function ensureDataDir() {
  const dir = path.join(__dirname, "../../data");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function loadTokens(): string[] {
  ensureDataDir();
  if (!fs.existsSync(TOKENS_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(TOKENS_FILE, "utf-8"));
  } catch {
    return [];
  }
}

function saveTokens(tokens: string[]) {
  ensureDataDir();
  fs.writeFileSync(TOKENS_FILE, JSON.stringify([...new Set(tokens)], null, 2));
}

export interface NotificationRecord {
  id: string;
  title: string;
  body: string;
  soundUrl?: string;
  amount?: number;
  createdAt: number;
}

function loadNotifications(): NotificationRecord[] {
  ensureDataDir();
  if (!fs.existsSync(NOTIFICATIONS_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(NOTIFICATIONS_FILE, "utf-8"));
  } catch {
    return [];
  }
}

function saveNotification(record: NotificationRecord) {
  ensureDataDir();
  const notifications = loadNotifications();
  notifications.unshift(record);
  const trimmed = notifications.slice(0, 500);
  fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify(trimmed, null, 2));
}

router.post("/register-token", (req, res) => {
  const { token } = req.body as { token?: string };
  if (!token || !Expo.isExpoPushToken(token)) {
    res.status(400).json({ error: "Invalid or missing Expo push token" });
    return;
  }
  const tokens = loadTokens();
  if (!tokens.includes(token)) {
    tokens.push(token);
    saveTokens(tokens);
    logger.info({ token }, "Registered new push token");
  }
  res.json({ success: true, message: "Token registered" });
});

router.post("/notify", async (req, res) => {
  const { title, body, soundUrl, amount } = req.body as {
    title?: string;
    body?: string;
    soundUrl?: string;
    amount?: number;
  };

  if (!title || !body) {
    res.status(400).json({ error: "Fields 'title' and 'body' are required" });
    return;
  }

  const record: NotificationRecord = {
    id: Date.now().toString() + Math.random().toString(36).slice(2, 9),
    title,
    body,
    soundUrl,
    amount,
    createdAt: Date.now(),
  };

  saveNotification(record);

  const tokens = loadTokens();
  if (tokens.length === 0) {
    res.json({ success: true, message: "Notification saved. No devices registered yet.", id: record.id });
    return;
  }

  const messages: ExpoPushMessage[] = tokens
    .filter((t) => Expo.isExpoPushToken(t))
    .map((token) => ({
      to: token,
      title,
      body,
      sound: "default",
      data: { id: record.id, title, body, soundUrl, amount, createdAt: record.createdAt },
    }));

  try {
    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];
    for (const chunk of chunks) {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    }

    const failed = tickets.filter((t) => t.status === "error");
    if (failed.length > 0) {
      logger.warn({ failed }, "Some push notifications failed");
    }

    logger.info({ title, devicesCount: tokens.length }, "Notification sent");
    res.json({
      success: true,
      id: record.id,
      sentTo: tokens.length,
      failed: failed.length,
    });
  } catch (err) {
    logger.error({ err }, "Failed to send push notifications");
    res.status(500).json({ error: "Failed to send push notifications" });
  }
});

router.get("/notifications", (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 100, 500);
  const page = Math.max(Number(req.query.page) || 1, 1);
  const perPage = Number(req.query.perPage) || 5;

  const all = loadNotifications().slice(0, limit);
  const total = all.length;
  const totalPages = Math.ceil(total / perPage);
  const data = all.slice((page - 1) * perPage, page * perPage);

  res.json({ data, total, page, perPage, totalPages });
});

router.delete("/notifications/:id", (req, res) => {
  const { id } = req.params;
  const notifications = loadNotifications();
  const updated = notifications.filter((n) => n.id !== id);
  ensureDataDir();
  fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify(updated, null, 2));
  res.json({ success: true });
});

router.delete("/tokens", (req, res) => {
  const { token } = req.body as { token?: string };
  if (!token) {
    res.status(400).json({ error: "Token is required" });
    return;
  }
  const tokens = loadTokens().filter((t) => t !== token);
  saveTokens(tokens);
  res.json({ success: true });
});

export default router;
