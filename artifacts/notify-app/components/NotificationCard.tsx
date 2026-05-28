import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import type { NotificationRecord } from "@/services/firebase";

interface Props {
  notification: NotificationRecord;
}

function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "Vừa xong";
  if (mins < 60) return `${mins} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  return `${days} ngày trước`;
}

export function NotificationCard({ notification }: Props) {
  const colors = useColors();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: notification.read
            ? colors.surface
            : colors.unread,
          borderColor: notification.read
            ? colors.border
            : colors.unreadBorder,
        },
      ]}
    >
      <View
        style={[styles.iconWrap, { backgroundColor: colors.primary + "18" }]}
      >
        <Ionicons name="notifications" size={20} color={colors.primary} />
        {!notification.read && (
          <View
            style={[styles.unreadDot, { backgroundColor: colors.primary }]}
          />
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text
            style={[
              styles.title,
              {
                color: colors.text,
                fontWeight: notification.read ? "500" : "700",
              },
            ]}
            numberOfLines={1}
          >
            {notification.title}
          </Text>
          <View style={styles.metaRow}>
            {notification.soundUrl && (
              <Ionicons
                name="volume-high"
                size={11}
                color={colors.textTertiary}
                style={styles.soundIcon}
              />
            )}
            <Text style={[styles.time, { color: colors.textTertiary }]}>
              {timeAgo(notification.createdAt)}
            </Text>
          </View>
        </View>
        <Text
          style={[styles.body, { color: colors.textSecondary }]}
          numberOfLines={2}
        >
          {notification.body}
        </Text>
        {notification.amount != null && (
          <Text style={[styles.amount, { color: colors.primary }]}>
            {notification.amount.toLocaleString("vi-VN")}đ
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    gap: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    flexShrink: 0,
  },
  unreadDot: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  title: {
    fontSize: 15,
    flex: 1,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    flexShrink: 0,
  },
  soundIcon: {
    marginRight: 1,
  },
  time: {
    fontSize: 11,
  },
  body: {
    fontSize: 13,
    lineHeight: 19,
  },
  amount: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 2,
  },
});
