import ProgressHeaderStepper, { ProgressProvider } from '@/context/ProgressProvider'
import { Stack } from 'expo-router'
import React from 'react'
import { StyleSheet } from 'react-native'

const _layout = () => {
    return (
        <ProgressProvider>
            <ProgressHeaderStepper title="Blooming Report" onBack={() => {/* navigation.goBack() */ }} />
            <Stack initialRouteName='farmerDetails' screenOptions={{ headerShown: false }} />
        </ProgressProvider>
    )
}

export default _layout

const styles = StyleSheet.create({})