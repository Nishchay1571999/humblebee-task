// screens/FarmerDetailsPage.tsx
import { AppButton } from "@/components/Button";
import { Dropdown } from "@/components/DropDown";
import { Option, SelectRadio } from "@/components/SelectRadio";
import { TextInputField } from "@/components/TextInput";
import { useNetwork } from "@/context/NetworkProvider";
import { useProgress } from "@/context/ProgressProvider";
import { useFarmerForm } from "@/forms/Blooming";
import React, { useMemo, useState } from "react";
import { useWatch } from "react-hook-form";
import { Alert, ScrollView, Text, View } from "react-native";


const GENDER_OPTIONS: Option<string>[] = [
    { label: "Male", value: "male" },
    { label: "Female", value: "female" },
];
const STATE_DISTRICT_DATA = {
    Karnataka: ["Bangalore Urban", "Mysuru", "Kodagu", "Dharwad"],
    Maharashtra: ["Mumbai", "Pune", "Nagpur", "Nashik"],
    TamilNadu: ["Chennai", "Coimbatore", "Madurai", "Salem"],
    Kerala: ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur"],
    Gujarat: ["Ahmedabad", "Surat", "Vadodara", "Rajkot"],
    Rajasthan: ["Jaipur", "Udaipur", "Jodhpur", "Kota"],
    Punjab: ["Amritsar", "Ludhiana", "Patiala", "Jalandhar"],
    UttarPradesh: ["Lucknow", "Kanpur", "Varanasi", "Agra"],
    WestBengal: ["Kolkata", "Howrah", "Darjeeling", "Siliguri"],
    Assam: ["Guwahati", "Silchar", "Dibrugarh", "Tezpur"],
} as const;

const STATES = Object.keys(STATE_DISTRICT_DATA).map((s) => ({
    label: s,
    value: s,
}));

/**
 * Inner form page that consumes the context
 */
const FarmerDetailsInner = () => {
    const { isInternetReachable } = useNetwork();
    const [addManually, setAddManually] = useState<boolean>(false);
    const { form, submitForm, saving } = useFarmerForm();
    const { control, handleSubmit } = form;
    const { nextStep } = useProgress()
    const selectedState = useWatch({ control, name: "state" });

    const districtOptions = useMemo(() => {
        if (!selectedState) return [];
        return STATE_DISTRICT_DATA[selectedState as keyof typeof STATE_DISTRICT_DATA].map((d) => ({
            label: d,
            value: d,
        }));
    }, [selectedState]);

    return (
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
            <TextInputField
                name="farmerName"
                label="Farmer Name *"
                control={control}
                placeholder="Enter farmer's full name"
                rules={{ required: "Name is required" }}
                containerStyle={{
                    marginTop: 16,
                    paddingVertical: 16,
                    paddingHorizontal: 16,
                }}
            />
            <TextInputField
                name="contactNumber"
                label="Contact Number *"
                control={control}
                placeholder="Enter contact number"
                rules={{
                    required: "Contact is required",
                    pattern: {
                        value: /^[0-9]{7,15}$/,
                        message: "Enter a valid phone number",
                    },
                }}
                containerStyle={{
                    marginTop: 16,
                    paddingVertical: 16,
                    paddingHorizontal: 16,
                }}
                keyboardType="phone-pad"
            />
            <SelectRadio
                name="gender"
                label="Select a Gender"
                control={control}
                rules={{ required: "Please select a gender" }}
                options={GENDER_OPTIONS}
                horizontal={false}
            />
            <View style={{ marginTop: 16 }} />
            {!isInternetReachable && (
                <>
                    <Text style={{ textAlign: "center", maxWidth: 280, alignSelf: "center" }}>
                        You are offline right now, please connect to the internet to use map features.
                    </Text>
                    <Text style={{ textAlign: "center", maxWidth: 250, alignSelf: "center" }}>Or</Text>
                    <Text style={{ textAlign: "center", maxWidth: 250, alignSelf: "center", marginBottom: 16 }}>
                        Fill details manually
                    </Text>
                </>
            )}

            {!isInternetReachable || addManually ? (
                <View style={{ gap: 16, backgroundColor: "#FFFFFF", padding: 16 }}>
                    <Dropdown
                        name="state"
                        control={control}
                        label="Select State"
                        placeholder="Choose a State"
                        options={STATES}
                        allowOpen={true}
                        rules={{ required: "State is required" }}
                    />
                    <Dropdown
                        name="district"
                        control={control}
                        label="Select District"
                        placeholder={selectedState ? "Choose a District" : "Select a State first"}
                        allowOpen={selectedState !== ""}
                        options={districtOptions}
                        rules={{
                            required: "District is required",
                            validate: (value: any) => {
                                if (!selectedState) return "Please select a State first";
                                return true;
                            },
                        }}
                    />
                    <TextInputField
                        name="blockName"
                        label="Enter Block Name"
                        control={control}
                        placeholder="Enter Block name"
                        rules={{ required: "Block Name is required" }}
                    />
                    <TextInputField
                        name="streetName"
                        label="Enter Street Name"
                        control={control}
                        placeholder="Enter Street name/number"
                        rules={{ required: "Street Name is required" }}
                    />
                    <TextInputField
                        name="plotName"
                        label="Enter Plot Name"
                        control={control}
                        placeholder="03/003/0003"
                        rules={{ required: "Plot number is required" }}
                    />
                </View>
            ) : (
                <View style={{ gap: 16, backgroundColor: "#FFFFFF", padding: 16 }}>
                    <Text style={{ marginBottom: 16 }}>House Location*</Text>
                    <AppButton
                        type="secondary"
                        icon="location"
                        label="Fetch Location"
                        subtext="Use current GPS location"
                        onPress={() => Alert.alert("Not implemented", "Maps functionality not configured yet.")}
                    />
                    <AppButton
                        type="disabled"
                        icon="create-outline"
                        label="Manually Enter Address"
                        subtext="Enable once location unavailable"
                        onPress={() => {
                            setAddManually(true);
                        }}
                    />
                </View>
            )}

            <View style={{ width: "100%", padding: 16 }}>
                <AppButton
                    type="primary"
                    label={saving ? "Saving..." : "Complete the Form"}
                    onPress={async () => {
                        try {
                            await handleSubmit(async () => {
                                await submitForm();
                                nextStep()
                            })();
                        } catch (err) {
                            console.error("Submit exception", err);
                        }
                    }}
                    isDisabled={saving}
                />
            </View>
        </ScrollView>
    );
};

export default FarmerDetailsInner;
