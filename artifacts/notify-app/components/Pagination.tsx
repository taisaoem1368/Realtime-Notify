import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

interface Props {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: Props) {
  const colors = useColors();

  if (totalPages <= 1) return null;

  const pages = Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
    if (totalPages <= 5) return i + 1;
    if (currentPage <= 3) return i + 1;
    if (currentPage >= totalPages - 2) return totalPages - 4 + i;
    return currentPage - 2 + i;
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        style={[
          styles.btn,
          {
            backgroundColor: colors.surfaceElevated,
            opacity: currentPage === 1 ? 0.4 : 1,
          },
        ]}
      >
        <Ionicons name="chevron-back" size={18} color={colors.text} />
      </TouchableOpacity>

      {pages.map((page) => (
        <TouchableOpacity
          key={page}
          onPress={() => onPageChange(page)}
          style={[
            styles.btn,
            styles.pageBtn,
            {
              backgroundColor:
                page === currentPage ? colors.primary : colors.surfaceElevated,
            },
          ]}
        >
          <Text
            style={[
              styles.pageText,
              {
                color: page === currentPage ? "#FFFFFF" : colors.text,
                fontWeight: page === currentPage ? "700" : "400",
              },
            ]}
          >
            {page}
          </Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        onPress={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        style={[
          styles.btn,
          {
            backgroundColor: colors.surfaceElevated,
            opacity: currentPage === totalPages ? 0.4 : 1,
          },
        ]}
      >
        <Ionicons name="chevron-forward" size={18} color={colors.text} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    paddingVertical: 16,
  },
  btn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  pageBtn: {
    minWidth: 36,
  },
  pageText: {
    fontSize: 14,
  },
});
