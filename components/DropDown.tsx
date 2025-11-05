import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import { Control, Controller, RegisterOptions } from "react-hook-form";
import {
    FlatList,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type Option<T = string> = { label: string; value: T };

type DropdownProps<T = string> = {
    allowOpen?: boolean
    name: string;
    control: Control<any>;
    options: Option<T>[];
    label?: string;
    placeholder?: string;
    rules?: RegisterOptions;
    testID?: string;
};

export function Dropdown<T = string>({
    name,
    control,
    options,
    label,
    placeholder = "Select...",
    rules,
    testID,
    allowOpen
}: DropdownProps<T>) {
    const [open, setOpen] = useState(false);

    const selectedLabel = (value: T | undefined) => {
        const found = options.find((o) => o.value === value);
        return found ? found.label : placeholder;
    };

    return (
        <View style={styles.container}>
            {!!label && <Text style={styles.label}>{label}</Text>}

            <Controller
                name={name}
                control={control}
                rules={rules}
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                    <>
                        <Pressable
                            testID={testID}
                            onPress={() => allowOpen && setOpen((prev) => !prev)}
                            style={[
                                styles.dropdownButton,
                                !!error && styles.errorBorder,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.selectedText,
                                    !value && styles.placeholderText,
                                ]}
                                numberOfLines={1}
                            >
                                {value !== "" ? selectedLabel(value) : placeholder}
                            </Text>
                            <View
                                style={{ borderColor: "#ef4444", borderWidth: 1, height: 40, width: 40, alignItems: "center", justifyContent: "center", borderRadius: 8 }}>
                                <Feather
                                    name={open ? "chevron-up" : "chevron-down"}
                                    size={20}
                                    color="#555"
                                />
                            </View>
                        </Pressable>

                        {error ? (
                            <Text style={styles.errorText}>{error.message ?? "Required"}</Text>
                        ) : null}
                        <Modal
                            visible={open}
                            transparent
                            animationType="fade"
                            onRequestClose={() => setOpen(false)}
                        >
                            <TouchableOpacity
                                activeOpacity={1}
                                style={styles.modalOverlay}
                                onPress={() => setOpen(false)}
                            />

                            <View style={styles.modalContent}>
                                <FlatList
                                    data={options}
                                    keyExtractor={(item) => String(item.value)}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            style={styles.optionItem}
                                            onPress={() => {
                                                onChange(item.value);
                                                setOpen(false);
                                            }}
                                        >
                                            <Text
                                                style={[
                                                    styles.optionText,
                                                    value === item.value && styles.optionSelected,
                                                ]}
                                            >
                                                {item.label}
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                />
                            </View>
                        </Modal>
                    </>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        color: "#222",
        marginBottom: 6,
        fontWeight: "500",
    },
    dropdownButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderWidth: 1.2,
        borderColor: "#ccc",
        borderRadius: 8,
        backgroundColor: "#fff",
    },
    selectedText: {
        fontSize: 16,
        color: "#111",
        flex: 1,
        marginLeft: 16
    },
    placeholderText: {
        color: "#999",
    },
    errorBorder: {
        borderColor: "#E03A3A",
    },
    errorText: {
        color: "#E03A3A",
        fontSize: 12,
        marginTop: 4,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.3)",
    },
    modalContent: {
        position: "absolute",
        left: 20,
        right: 20,
        top: "30%",
        backgroundColor: "#fff",
        borderRadius: 10,
        maxHeight: "50%",
        elevation: 6,
        paddingVertical: 8,
    },
    optionItem: {
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    optionText: {
        fontSize: 16,
        color: "#333",
    },
    optionSelected: {
        color: "#007AFF",
        fontWeight: "600",
    },
});
