import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { WebView } from 'react-native-webview';

interface YouTubePlayerProps {
  videoId: string;
}

export function YouTubePlayer({ videoId }: YouTubePlayerProps) {
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=0`;

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <iframe
          width="100%"
          height="100%"
          src={embedUrl}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ borderRadius: 24 }}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: embedUrl }}
        style={styles.webview}
        allowsFullscreenVideo
        javaScriptEnabled
        domStorageEnabled
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 200,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  webview: {
    flex: 1,
  },
});
