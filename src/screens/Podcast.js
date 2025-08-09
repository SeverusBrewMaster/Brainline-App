<<<<<<< HEAD
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';

// Import your enhanced components
import Header from '../components/Header';
import Button from '../components/Button';

const { width, height } = Dimensions.get('window');

// Move API credentials to environment variables or config file
const YOUTUBE_API_KEY = 'AIzaSyAdePDcYUZOjEqOCkGdJB2ccvO8hIMv83M';
const CHANNEL_ID = 'UCFCWIvyEKpUfOgvxSfOm0sw';

const PodcastScreen = ({ navigation }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  
  // Get safe area insets to handle notch and status bar
  const insets = useSafeAreaInsets();

  const fetchVideos = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      setError(null);

      const response = await axios.get(
        `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=20&type=video`
      );
      
      setVideos(response.data.items);
    } catch (error) {
      console.error('Error fetching YouTube videos:', error);
      setError('Unable to load podcasts. Please check your internet connection.');
      
      Alert.alert(
        'Connection Error',
        'Unable to load podcast videos. Please check your internet connection and try again.',
        [
          { text: 'Retry', onPress: () => fetchVideos() },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } finally {
      setLoading(false);
      if (isRefresh) setRefreshing(false);
=======

import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import axios from 'axios';

const YOUTUBE_API_KEY = 'AIzaSyAdePDcYUZOjEqOCkGdJB2ccvO8hIMv83M'; //Majhi youtube API Key
const CHANNEL_ID = 'UCFCWIvyEKpUfOgvxSfOm0sw'; // Brainline channel ID

const PodcastScreen = () => {
  const [videos, setVideos] = useState([]);

  const fetchVideos = async () => {
    try {
      const response = await axios.get(
        `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=10`
      );
      setVideos(response.data.items);
    } catch (error) {
      console.error('Error fetching YouTube videos:', error);
>>>>>>> 3af4c8bbfd4c76e4139eaf99b6ee9328453f1008
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

<<<<<<< HEAD
  const openVideo = (videoId, title) => {
    const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
    
    Alert.alert(
      'Open Podcast',
      `Watch "${title}" on YouTube?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Watch',
          onPress: () => {
            Linking.canOpenURL(youtubeUrl)
              .then((supported) => {
                if (supported) {
                  Linking.openURL(youtubeUrl);
                } else {
                  Alert.alert(
                    'Cannot Open Video',
                    'YouTube is not available on this device.',
                    [{ text: 'OK' }]
                  );
                }
              })
              .catch(() => {
                Alert.alert(
                  'Error',
                  'Unable to open video. Please try again.',
                  [{ text: 'OK' }]
                );
              });
          }
        }
      ]
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchVideos(true);
  };

  const formatDuration = (publishedAt) => {
    const publishDate = new Date(publishedAt);
    const now = new Date();
    const diffTime = Math.abs(now - publishDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const renderItem = ({ item, index }) => {
    const { videoId } = item.id;
    const { title, thumbnails, publishedAt, description } = item.snippet;
=======
  const openVideo = (videoId) => {
    Linking.openURL(`https://www.youtube.com/watch?v=${videoId}`);
  };

  const renderItem = ({ item }) => {
    const { videoId } = item.id;
    const { title, thumbnails } = item.snippet;
>>>>>>> 3af4c8bbfd4c76e4139eaf99b6ee9328453f1008

    if (!videoId) return null;

    return (
<<<<<<< HEAD
      <TouchableOpacity
        onPress={() => openVideo(videoId, title)}
        style={[styles.card, index === 0 && styles.featuredCard]}
        activeOpacity={0.8}
      >
        <View style={styles.thumbnailContainer}>
          <Image 
            source={{ uri: thumbnails.high?.url || thumbnails.medium.url }} 
            style={styles.thumbnail} 
          />
          <View style={styles.playButton}>
            <Ionicons name="play" size={24} color={colors.white} />
          </View>
          {index === 0 && (
            <View style={styles.featuredBadge}>
              <Ionicons name="star" size={16} color={colors.white} />
              <Text style={styles.featuredText}>Latest</Text>
            </View>
          )}
        </View>
        
        <View style={styles.contentContainer}>
          <Text style={styles.title} numberOfLines={2}>{title}</Text>
          <Text style={styles.description} numberOfLines={2}>
            {description || 'Brain stroke awareness and prevention tips'}
          </Text>
          
          <View style={styles.metaInfo}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.metaText}>{formatDuration(publishedAt)}</Text>
            </View>
            <View style={styles.metaItem}>
              <MaterialIcons name="health-and-safety" size={16} color={colors.secondary} />
              <Text style={styles.healthTag}>Health Education</Text>
            </View>
          </View>
        </View>
=======
      <TouchableOpacity onPress={() => openVideo(videoId)} style={styles.card}>
        <Image source={{ uri: thumbnails.medium.url }} style={styles.thumbnail} />
        <Text style={styles.title}>{title}</Text>
>>>>>>> 3af4c8bbfd4c76e4139eaf99b6ee9328453f1008
      </TouchableOpacity>
    );
  };

<<<<<<< HEAD
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="videocam-outline" size={64} color={colors.textMuted} />
      <Text style={styles.emptyTitle}>No Podcasts Available</Text>
      <Text style={styles.emptyText}>
        We're working on bringing you the latest health awareness content. Check back soon!
      </Text>
      <Button
        title="Retry"
        variant="outline"
        onPress={() => fetchVideos()}
        style={styles.retryButton}
      />
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerContent}>
      <View style={styles.titleSection}>
        <Text style={styles.heading}>Health Podcasts</Text>
        <Text style={styles.subheading}>Brain Stroke Awareness & Prevention</Text>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{videos.length}</Text>
          <Text style={styles.statLabel}>Episodes</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>Free</Text>
          <Text style={styles.statLabel}>Access</Text>
        </View>
      </View>
      
      <Text style={styles.channelInfo}>
        <Ionicons name="tv-outline" size={16} color={colors.primary} /> Brainline Channel
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
        <Header navigation={navigation} title="Podcasts" currentScreen="Podcast" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading health podcasts...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      {/* Fixed Header with proper spacing */}
      <View style={styles.headerContainer}>
        <Header 
          navigation={navigation} 
          title="Podcasts" 
          currentScreen="Podcast"
        />
      </View>
      
=======
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Our Podcasts</Text>
      <Text style={styles.subheading}>A Motive to Brain Stroke Awareness</Text>
>>>>>>> 3af4c8bbfd4c76e4139eaf99b6ee9328453f1008
      <FlatList
        data={videos}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.videoId}
<<<<<<< HEAD
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
=======
        contentContainerStyle={{ paddingBottom: 100 }}
>>>>>>> 3af4c8bbfd4c76e4139eaf99b6ee9328453f1008
      />
    </View>
  );
};

<<<<<<< HEAD
// Health app color scheme (consistent with your other components)
const colors = {
  primary: '#2563eb',
  secondary: '#10b981',
  background: '#f8fafc',
  cardBackground: '#ffffff',
  textPrimary: '#1e293b',
  textSecondary: '#64748b',
  textMuted: '#94a3b8',
  warning: '#f59e0b',
  white: '#ffffff',
  border: '#e2e8f0',
  shadow: '#000000',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  // Fixed header container to prevent cut-off
  headerContainer: {
    zIndex: 1000,
    backgroundColor: colors.primary,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  
  listContent: {
    paddingBottom: 100,
  },
  
  headerContent: {
    padding: 20,
    backgroundColor: colors.cardBackground,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  
  titleSection: {
    marginBottom: 20,
  },
  
  heading: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  
  subheading: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 32,
  },
  
  statItem: {
    alignItems: 'center',
  },
  
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  
  channelInfo: {
    fontSize: 14,
    color: colors.textSecondary,
    backgroundColor: colors.background,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  
  card: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: colors.border,
  },
  
  featuredCard: {
    borderColor: colors.primary,
    borderWidth: 2,
    shadowColor: colors.primary,
    shadowOpacity: 0.2,
  },
  
  thumbnailContainer: {
    position: 'relative',
  },
  
  thumbnail: {
    width: '100%',
    height: 200,
    backgroundColor: colors.border,
  },
  
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -20,
    marginLeft: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  featuredBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  featuredText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  
  contentContainer: {
    padding: 16,
  },
  
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
    lineHeight: 24,
  },
  
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  metaText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  
  healthTag: {
    fontSize: 12,
    color: colors.secondary,
    fontWeight: '600',
    marginLeft: 4,
  },
  
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: height * 0.5,
  },
  
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  
  retryButton: {
    minWidth: 120,
=======
const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#0d6efd',
  },
  subheading: {
    fontSize: 16,
    marginBottom: 16,
    color: '#666',
  },
  card: {
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
  },
  thumbnail: {
    width: '100%',
    height: 200,
  },
  title: {
    padding: 10,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
>>>>>>> 3af4c8bbfd4c76e4139eaf99b6ee9328453f1008
  },
});

export default PodcastScreen;
