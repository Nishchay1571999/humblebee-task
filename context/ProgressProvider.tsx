
import * as SecureStore from 'expo-secure-store';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { GestureResponderEvent, LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

type ProgressContextState = {
    currentStep: number;
    totalSteps: number;
    percent: number; // 0-100
    nextStep: () => void;
    prevStep: () => void;
    goTo: (step: number) => void;
    reset: () => void;
    setTotalSteps: (n: number) => void;
};

const DEFAULT_TOTAL = 5;

const ProgressContext = createContext<ProgressContextState | undefined>(undefined);

export const ProgressProvider = ({ children, initialTotal = DEFAULT_TOTAL }: { children: ReactNode; initialTotal?: number }) => {
    const [totalSteps, setTotalSteps] = useState<number>(initialTotal);
    const [currentStep, setCurrentStep] = useState<number>(1);

    useEffect(() => {
        const load = async () => {
            try {
                const raw = await SecureStore.getItemAsync('@blooming_progress');
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (parsed?.currentStep && parsed?.totalSteps) {
                        setCurrentStep(parsed.currentStep);
                        setTotalSteps(parsed.totalSteps);
                    }
                }
            } catch (e) {
            }
        };
        load();
    }, []);

    useEffect(() => {
        const save = async () => {
            try {
                await SecureStore.setItemAsync('@blooming_progress', JSON.stringify({ currentStep, totalSteps }));
            } catch (e) {
                // ignore
            }
        };
        save();
    }, [currentStep, totalSteps]);

    const percent = useMemo(() => {
        if (totalSteps <= 1) return 100;
        const clamped = Math.max(1, Math.min(currentStep, totalSteps));
        return Math.round(((clamped - 1) / (totalSteps - 1)) * 100);
    }, [currentStep, totalSteps]);

    const nextStep = () => setCurrentStep((s) => Math.min(s + 1, totalSteps));
    const prevStep = () => setCurrentStep((s) => Math.max(1, s - 1));
    const goTo = (step: number) => setCurrentStep(Math.max(1, Math.min(step, totalSteps)));
    const reset = () => {
        setCurrentStep(1);
    };

    const value = useMemo(
        () => ({ currentStep, totalSteps, percent, nextStep, prevStep, goTo, reset, setTotalSteps }),
        [currentStep, totalSteps, percent]
    );

    return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
};

export const useProgress = () => {
    const ctx = useContext(ProgressContext);
    if (!ctx) throw new Error('useProgress must be used within ProgressProvider');
    return ctx;
};


type Props = {
    title?: string;
    onBack?: (e?: GestureResponderEvent) => void;
    stepDotSize?: number;
    trackHeight?: number;
    showNumbers?: boolean;
};

export default function ProgressHeaderStepper({
    title = "Blooming Report",
    onBack,
    stepDotSize = 16,
    trackHeight = 4,
    showNumbers = true,
}: Props) {
    const { currentStep, totalSteps, goTo } = useProgress();

    const [trackWidth, setTrackWidth] = useState(0);
    const positionsRef = useRef<number[]>([]); 

    const fillValue = useSharedValue(0);

    const onTrackLayout = useCallback((e: LayoutChangeEvent) => {
        const w = e.nativeEvent.layout.width;
        setTrackWidth(w);

        const pos: number[] = [];
        if (totalSteps <= 1) {
            pos.push(w / 2);
        } else {
            for (let i = 0; i < totalSteps; i++) {
                const x = (i / (totalSteps - 1)) * w;
                pos.push(x);
            }
        }
        positionsRef.current = pos;
        const initial = pos[Math.max(0, currentStep - 1)] ?? 0;
        fillValue.value = initial;
    }, [totalSteps, currentStep, fillValue]);

    useEffect(() => {
        if (!positionsRef.current.length) return;
        const target = positionsRef.current[Math.max(0, currentStep - 1)] ?? 0;
        fillValue.value = withTiming(target, { duration: 350 });
    }, [currentStep, fillValue]);

    const animatedFillStyle = useAnimatedStyle(() => ({
        width: fillValue.value,
    }));

    const renderDot = (index: number) => {
        const isActive = index + 1 === currentStep;
        const leftPx = positionsRef.current[index] ?? 0;

        return (
            <Pressable
                key={`dot-${index}`}
                onPress={() => goTo(index + 1)}
                style={[
                    styles.dotPressable,
                    { left: leftPx - stepDotSize / 2, width: stepDotSize, height: stepDotSize },
                ]}
                accessibilityLabel={`Step ${index + 1}`}
            >
                <View
                    style={[
                        styles.dot,
                        {
                            width: stepDotSize,
                            height: stepDotSize,
                            borderRadius: stepDotSize / 2,
                            backgroundColor: isActive ? "#ef4444" : "#ffffff",
                            borderWidth: isActive ? 0 : 1,
                            borderColor: "#e5e7eb",
                            shadowColor: isActive ? "#ef4444" : "#000",
                            elevation: isActive ? 3 : 0,
                        },
                    ]}
                />
                {showNumbers && (
                    <Text style={[styles.dotNumber, isActive ? styles.dotNumberActive : undefined]}>
                        {index + 1}
                    </Text>
                )}
            </Pressable>
        );
    };

    return (
        <View style={styles.card}>
            <View style={styles.headerRow}>
                <Pressable onPress={onBack} style={styles.backBtn}>
                    <Text style={styles.backArrow}>←</Text>
                </Pressable>
                <Text style={styles.title}>{title}</Text>
                <View style={styles.headerSpacer} />
            </View>

            <View style={styles.trackContainer}>
                <View style={styles.trackWrapper} onLayout={onTrackLayout}>
                    <View style={[styles.trackBg, { height: trackHeight }]} />
                    <Animated.View
                        style={[
                            styles.trackFill,
                            { height: trackHeight, left: 0 },
                            animatedFillStyle,
                        ]}
                    />
                    <View style={styles.dotsContainer}>
                        {Array.from({ length: totalSteps }).map((_, i) => renderDot(i))}
                    </View>
                </View>
            </View>

            <View style={styles.footerRow}>
                <Text style={styles.sectionLabel}>Farmer Profile</Text>
            </View>
        </View>
    );
}



const styles = StyleSheet.create({
    headerContainer: { padding: 12, backgroundColor: 'transparent' },
    row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    progressTrack: { flex: 1, backgroundColor: '#eee', borderRadius: 999 },
    progressFill: { backgroundColor: '#4ade80', borderRadius: 999 },
    label: { marginLeft: 8, fontSize: 12, color: '#374151' },
    btn: { padding: 10, backgroundColor: '#f3f4f6', borderRadius: 8 },
    btnSmall: { padding: 6, backgroundColor: '#f3f4f6', borderRadius: 6, marginLeft: 6 },
    card: {
        paddingVertical: 12,
        paddingHorizontal: 14,
        backgroundColor: "white",
        borderBottomLeftRadius: 14,
        borderBottomRightRadius: 14,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 6,
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    backBtn: {
        width: 32,
        height: 32,
        alignItems: "center",
        justifyContent: "center",
    },
    backArrow: {
        fontSize: 18,
        color: "#111827",
    },
    title: {
        flex: 1,
        textAlign: "left",
        fontSize: 16,
        fontWeight: "600",
        color: "#111827",
    },
    headerSpacer: {
        width: 32,
    },

    trackContainer: {
        alignItems: "center",
    },
    trackWrapper: {
        width: "100%",
        minHeight: 48,
        justifyContent: "center",
    },
    trackBg: {
        position: "absolute",
        left: 0,
        right: 0,
        top: -2,
        backgroundColor: "#e6e6e6",
        borderRadius: 999,
    },
    trackFill: {
        position: "absolute",
        top: 0,
        backgroundColor: "#ef4444", // red fill like your screenshot
        borderRadius: 999,
    },
    dotsContainer: {
        position: "absolute",
        left: 0,
        right: 0,
        top: -8,
        bottom: 0,
    },
    dotPressable: {
        position: "absolute",
        alignItems: "center",
    },
    dot: {
        justifyContent: "center",
        alignItems: "center",
    },
    dotNumber: {
        position: "absolute",
        top: 20,
        fontSize: 10,
        color: "#6b7280",
    },
    dotNumberActive: {
        color: "#ef4444",
        fontWeight: "600",
    },
    footerRow: {
        marginTop: 6,
        alignItems: "center",
    },
    sectionLabel: {
        fontSize: 14,
        color: "#374151",
        fontWeight: "500",
    },
});

