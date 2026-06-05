import React, { useCallback, useMemo, forwardRef } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import { useThemeStore } from '../../stores/themeStore';
import { useColorScheme } from 'react-native';

interface AppBottomSheetProps {
  children: React.ReactNode;
  snapPoints?: string[];
  onClose?: () => void;
  title?: string;
}

export const AppBottomSheet = forwardRef<BottomSheetModal, AppBottomSheetProps>(
  ({ children, snapPoints: customSnapPoints, onClose, title }, ref) => {
    const { theme } = useThemeStore();
    const systemColorScheme = useColorScheme();
    const isDark = (theme === 'system' ? systemColorScheme : theme) === 'dark';

    // Fixed height: set snap points to a single value for consistency (e.g., 90%)
    const snapPoints = useMemo(() => customSnapPoints || ['90%'], [customSnapPoints]);

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsAt={-1}
          appearsAt={0}
          opacity={0.5}
        />
      ),
      []
    );

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        enablePanDownToClose={true}
        // Strict restriction: drag only works from the handle
        enableContentPanningGesture={false} 
        enableHandlePanningGesture={true}
        onDismiss={onClose}
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
        backgroundStyle={{
          backgroundColor: isDark ? '#111827' : '#f9fafb',
        }}
        handleIndicatorStyle={{ backgroundColor: isDark ? '#4b5563' : '#d1d5db', width: 40 }}
      >
        <BottomSheetView style={styles.contentContainer}>
          {title && (
            <View style={styles.header}>
              <Text style={[styles.title, { color: isDark ? '#ffffff' : '#111827' }]}>{title}</Text>
            </View>
          )}
          {children}
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
  },
  header: {
    marginBottom: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
