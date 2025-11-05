import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type ButtonType = "primary" | "secondary" | "disabled";

interface AppButtonProps {
    type?: ButtonType;
    label: string;
    subtext?: string;
    icon?: keyof typeof Ionicons.glyphMap;
    onPress?: () => void;
    isDisabled?: boolean
}

export const AppButton: React.FC<AppButtonProps> = ({
    type = "primary",
    label,
    subtext,
    icon,
    onPress,
    isDisabled
}) => {

    const backgroundColor =
        type === "primary"
            ? "#D4391b" // green
            : type === "secondary"
                ? "#FDE6E3" // light green
                : "#F2F2F2"; // greyed out

    const textColor =
        type === "primary"
            ? "#FFFFFF"
            : type === "secondary"
                ? "#D4391b"
                : "#A0A0A0";

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPress}
            disabled={isDisabled}
            style={{
                backgroundColor,
                paddingVertical: 14,
                paddingHorizontal: 16,
                borderRadius: 12,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                opacity: isDisabled ? 0.9 : 1,
            }}
        >
            <View style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
            }}>
                {icon && (
                    <Ionicons
                        name={icon}
                        size={22}
                        color={textColor}
                        style={{ marginRight: 12 }}
                    />
                )}
                <View>

                    <Text style={{ color: textColor, fontWeight: "600", fontSize: 16 }}>
                        {label}
                    </Text>
                    {subtext && (
                        <Text style={{ color: textColor, opacity: 0.8, fontSize: 13 }}>
                            {subtext}
                        </Text>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};
