import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { NotificationCard } from "@/components/NotificationCard";
import { Pagination } from "@/components/Pagination";
import { subscribeToNotifications, type NotificationRecord } from "@/services/firebase";

const LIMIT = 100;
const PER_PAGE = 5;

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    const unsubscribe = subscribeToNotifications(LIMIT, (data) => {
      setNotifications(data);
      setLoading(false);
      setRefreshing(false);
    });

    return () => unsubscribe();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setCurrentPage(1);
  }, []);

  const totalPages = Math.ceil(notifications.length / PER_PAGE);
  const pageData = notifications.slice(
    (currentPage - 1) * PER_PAGE,
    currentPage * PER_PAGE
  );
  const unreadCount = notifications.filter((n) => !n.read).length;

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  if (loading) {
    return (
      <View
        style={[
          styles.center,
          { backgroundColor: colors.background, paddingTop: topPad },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Đang tải thông báo...
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View
        style={[
          styles.header,
          {
            paddingTop: topPad + 12,
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View style={styles.headerLeft}>
          <View
            style={[styles.headerIcon, { backgroundColor: colors.primary + "18" }]}
          >
            <Ionicons name="notifications" size={22} color={colors.primary} />
          </View>
          <View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              Thông Báo
            </Text>
            <Text style={[styles.headerSub, { color: colors.textSecondary }]}>
              {notifications.length} thông báo
            </Text>
          </View>
        </View>

        {unreadCount > 0 && (
          <View style={[styles.badge, { backgroundColor: colors.badge }]}>
            <Text style={styles.badgeText}>
              {unreadCount > 99 ? "99+" : unreadCount}
            </Text>
          </View>
        )}
      </View>

      <FlatList
        data={pageData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <NotificationCard notification={item} />}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: bottomPad + 16 },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        scrollEnabled={pageData.length > 0}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View
              style={[
                styles.emptyIcon,
                { backgroundColor: colors.surfaceElevated },
              ]}
            >
              <Ionicons
                name="notifications-off-outline"
                size={40}
                color={colors.textTertiary}
              />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              Chưa có thông báo
            </Text>
            <Text style={[styles.emptyBody, { color: colors.textSecondary }]}>
              Thông báo từ server sẽ xuất hiện ở đây
            </Text>
          </View>
        }
        ListFooterComponent={
          notifications.length > 0 ? (
            <View>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => {
                  setCurrentPage(page);
                }}
              />
              <Text
                style={[styles.pageInfo, { color: colors.textTertiary }]}
              >
                Trang {currentPage}/{totalPages} · {notifications.length} thông báo
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    lineHeight: 24,
  },
  headerSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  badge: {
    minWidth: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: "Inter_700Bold",
  },
  listContent: {
    padding: 16,
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
  },
  emptyBody: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    paddingHorizontal: 32,
    lineHeight: 20,
  },
  pageInfo: {
    textAlign: "center",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: -8,
    marginBottom: 8,
  },
});
