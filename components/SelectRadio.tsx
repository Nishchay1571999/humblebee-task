import React, { useEffect, useRef, useState } from "react";
import { Control, Controller, RegisterOptions } from "react-hook-form";
import {
    Animated,
    Easing,
    Platform,
    Pressable,
    StyleProp,
    StyleSheet,
    Text,
    View,
    ViewStyle,
} from "react-native";

export type Option<T = string> = {
    label: string;
    value: T;
    subtitle?: string;
    accessory?: React.ReactNode;
};

type BaseProps<T = string> = {
    options: Option<T>[];
    value?: T;
    defaultValue?: T;
    onValueChange?: (value: T) => void;
    horizontal?: boolean;
    containerStyle?: StyleProp<ViewStyle>;
    optionStyle?: StyleProp<ViewStyle>;
    circleSize?: number;
    label?: string;
    error?: string | null;
    disabled?: boolean;
    testID?: string;
};

type FormProps = {
    name?: string;
    control?: Control<any>;
    rules?: RegisterOptions;
};

type Props<T = string> = BaseProps<T> & FormProps;

export function SelectRadio<T = string>({
    options,
    value: controlledValue,
    defaultValue,
    onValueChange,
    horizontal = true,
    containerStyle,
    optionStyle,
    circleSize = 22,
    label,
    error: explicitError,
    disabled = false,
    testID,
    name,
    control,
    rules,
}: Props<T>) {
    const isFormMode = Boolean(control && name);

    if (isFormMode) {
        return (
            <Controller
                control={control!}
                name={name!}
                rules={rules}
                render={({ field: { value, onChange }, fieldState: { error } }) => (
                    <SelectRadioView<T>
                        options={options}
                        value={value === null ? undefined : (value as T | undefined)}
                        onValueChange={(v) => onChange(v)}
                        horizontal={horizontal}
                        containerStyle={containerStyle}
                        optionStyle={optionStyle}
                        circleSize={circleSize}
                        label={label}
                        error={explicitError ?? error?.message ?? null}
                        disabled={disabled}
                        testID={testID}
                    />
                )}
            />
        );
    }

    return (
        <SelectRadioView<T>
            options={options}
            value={controlledValue}
            defaultValue={defaultValue}
            onValueChange={onValueChange}
            horizontal={horizontal}
            containerStyle={containerStyle}
            optionStyle={optionStyle}
            circleSize={circleSize}
            label={label}
            error={explicitError ?? null}
            disabled={disabled}
            testID={testID}
        />
    );
}

function SelectRadioView<T = string>({
    options,
    value: controlledValue,
    defaultValue,
    onValueChange,
    horizontal = true,
    containerStyle,
    optionStyle,
    circleSize = 22,
    label,
    error,
    disabled = false,
    testID,
}: BaseProps<T>) {
    const isControlled = controlledValue !== undefined;
    const [value, setValue] = useState<T | undefined>(
        isControlled ? controlledValue : defaultValue
    );

    useEffect(() => {
        if (isControlled) setValue(controlledValue);
    }, [controlledValue, isControlled]);

    const animRef = useRef<Record<string, Animated.Value>>(
        Object.fromEntries(options.map((o) => [String(o.value), new Animated.Value(0)]))
    ).current;

    useEffect(() => {
        options.forEach((opt) => {
            const key = String(opt.value);
            if (!animRef[key]) {
                animRef[key] = new Animated.Value(0);
            }
        });

        options.forEach((opt) => {
            const key = String(opt.value);
            const toVal = value !== undefined && String(value) === key ? 1 : 0;
            Animated.timing(animRef[key], {
                toValue: toVal,
                duration: 180,
                easing: Easing.out(Easing.quad),
                useNativeDriver: Platform.OS !== "web",
            }).start();
        });
    }, [value, options, animRef]);

    const handlePress = (v: T) => {
        if (disabled) return;
        if (!isControlled) setValue(v);
        onValueChange?.(v);
    };

    return (
        <View style={[styles.container, containerStyle]} accessibilityRole="radiogroup">
            {label ? <Text style={styles.label}>{label}</Text> : null}

            <View style={[horizontal ? styles.row : styles.column, disabled && styles.disabled]}>
                {options.map((opt) => {
                    const key = String(opt.value);
                    const selected = value !== undefined && String(value) === key;
                    const innerScale = animRef[key]
                        ? animRef[key].interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.001, 1],
                        })
                        : 0.001;

                    return (
                        <Pressable
                            key={key}
                            style={[styles.option, optionStyle]}
                            onPress={() => handlePress(opt.value)}
                            accessibilityRole="radio"
                            accessibilityState={{ selected }}
                            accessibilityLabel={opt.label}
                            testID={testID ? `${testID}-${key}` : undefined}
                        >
                            <View
                                style={[
                                    styles.circleOuter,
                                    { width: circleSize, height: circleSize, borderRadius: circleSize / 2 },
                                ]}
                            >
                                <Animated.View
                                    style={[
                                        styles.circleInner,
                                        {
                                            transform: [{ scale: innerScale as any }],
                                            width: circleSize * 0.55,
                                            height: circleSize * 0.55,
                                            borderRadius: (circleSize * 0.55) / 2,
                                        },
                                    ]}
                                />
                            </View>

                            <View style={styles.textWrap}>
                                <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>
                                    {opt.label}
                                </Text>
                                {opt.subtitle ? <Text style={styles.subtitle}>{opt.subtitle}</Text> : null}
                            </View>

                            {opt.accessory ? <View style={styles.accessory}>{opt.accessory}</View> : null}
                        </Pressable>
                    );
                })}
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { padding: 16, width: "100%", backgroundColor: "#FFFFFF" },
    label: { marginBottom: 8, fontSize: 13, color: "#222", fontWeight: "600" },
    row: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8 },
    column: { flexDirection: "column", alignItems: "flex-start", gap: 8 },
    option: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 5,
        borderRadius: 10,
        marginRight: 8,
    },
    circleOuter: {
        borderWidth: 1.5,
        borderColor: "#999",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    circleInner: {
        backgroundColor: "#1f6feb",
    },
    textWrap: { justifyContent: "center" },
    optionLabel: { fontSize: 14, color: "#222" },
    optionLabelSelected: { fontWeight: "700" },
    subtitle: { fontSize: 12, color: "#666", marginTop: 2 },
    accessory: { marginLeft: 8 },
    errorText: { color: "#b00020", marginTop: 6, fontSize: 12 },
    disabled: { opacity: 0.5 },
});
export default SelectRadio;
