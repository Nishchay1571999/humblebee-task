import {
    closeRealm,
    getAllFarmerSubmissions,
    openRealm,
    saveFarmerSubmission,
} from "@/services/realm";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { Alert } from "react-native";

export type FarmerFormValues = {
    farmerName: string;
    contactNumber: string;
    gender: string | null;
    state: string;
    district: string;
    blockName: string;
    streetName: string;
    plotName: string;
};

type FarmerFormContextType = {
    form: UseFormReturn<FarmerFormValues>;
    submitForm: () => Promise<void>;
    saving: boolean;
    loadAllSubmissions: () => Promise<any[]>;
};

const FarmerFormContext = createContext<FarmerFormContextType | undefined>(
    undefined
);

export const FarmerFormProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const form = useForm<FarmerFormValues>({
        mode: "onTouched",
        defaultValues: {
            farmerName: "",
            contactNumber: "",
            gender: null,
            state: "",
            district: "",
            blockName: "",
            streetName: "",
            plotName: "",
        },
    });

    const [saving, setSaving] = useState(false);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                await openRealm();
            } catch (err) {
                console.error("Failed to open Realm:", err);
                if (mounted) Alert.alert("Storage Error", "Could not open local storage (Realm).");
            }
        })();
        return () => {
            mounted = false;
            try {
                closeRealm();
            } catch (err) {
                console.warn("Error closing realm:", err);
            }
        };
    }, []);

    const submitForm = async () => {
        const valid = await form.trigger(); 
        if (!valid) {
            return;
        }

        const data = form.getValues();
        const requiredFields: (keyof FarmerFormValues)[] = [
            "farmerName",
            "contactNumber",
            "gender",
            "state",
            "district",
            "blockName",
            "streetName",
            "plotName",
        ];
        for (const k of requiredFields) {
            const v = data[k];
            if (v === null || v === undefined || String(v).trim() === "") {
                Alert.alert("Validation", `${k} is required`);
                return;
            }
        }

        try {
            setSaving(true);
            const id = await saveFarmerSubmission({
                farmerName: data.farmerName,
                contactNumber: data.contactNumber,
                gender: data.gender as string,
                state: data.state,
                district: data.district,
                blockName: data.blockName,
                streetName: data.streetName,
                plotName: data.plotName,
            });
            setSaving(false);
            Alert.alert("Saved", "Form saved locally.", [{ text: "OK" }]);
            return id;
        } catch (err) {
            setSaving(false);
            console.error("save error", err);
            Alert.alert("Save error", "Unable to save the form locally.");
            throw err;
        }
    };

    const loadAllSubmissions = async () => {
        try {
            const all = await getAllFarmerSubmissions();
            return all;
        } catch (err) {
            console.error("load error", err);
            Alert.alert("Load error", "Unable to read saved forms.");
            return [];
        }
    };

    const value = useMemo(
        () => ({
            form,
            submitForm,
            saving,
            loadAllSubmissions,
        }),
        [form, saving]
    );

    return <FarmerFormContext.Provider value={value}>{children}</FarmerFormContext.Provider>;
};

export const useFarmerForm = () => {
    const ctx = useContext(FarmerFormContext);
    if (!ctx) throw new Error("useFarmerForm must be used within FarmerFormProvider");
    return ctx;
};
