import React from "react";
import { Controller } from "react-hook-form";
import { StyleSheet, Text, TextInput, View, ViewStyle } from "react-native";

interface Props {
    containerStyle?: ViewStyle,
    name: string;
    label: string;
    control: any;
    placeholder?: string;
    keyboardType?: "default" | "numeric" | "email-address" | "phone-pad";
    rules?: object;
    multiline?: boolean;
}

export const TextInputField = ({
    containerStyle,
    name,
    label,
    control,
    placeholder,
    keyboardType = "default",
    rules = {},
    multiline = false,
}: Props) => {
    return (
        <Controller
            control={control}
            name={name}
            rules={rules}
            render={({
                field: { onChange, onBlur, value },
                fieldState: { error },
            }) => (
                <View style={[styles.container, containerStyle]}>
                    <Text style={styles.label}>{label}</Text>

                    <TextInput
                        style={[
                            styles.input,
                            error && { borderColor: "#ff5b5b" },
                            multiline && { height: 100, textAlignVertical: "top" },
                        ]}
                        placeholder={placeholder}
                        placeholderTextColor="#999"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        keyboardType={keyboardType}
                        multiline={multiline}
                    />

                    {error && <Text style={styles.errorText}>{error.message}</Text>}
                </View>
            )}
        />
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#FFFFFF"
    },
    label: {
        fontSize: 14,
        color: "#333",
        fontWeight: "500",
        marginBottom: 6,
    },
    input: {
        height: 48,
        borderWidth: 1,
        borderColor: "#d1d5db",
        borderRadius: 5,
        paddingHorizontal: 12,
        backgroundColor: "#fff",
        fontSize: 15,
        color: "#111",
    },
    errorText: {
        color: "#ff5b5b",
        fontSize: 12,
        marginTop: 4,
    },
});
