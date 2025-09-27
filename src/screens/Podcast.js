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
import { useTranslation } from 'react-i18next';
import axios from 'axios';

// Import your enhanced components
import Header from '../components/Header';
import Button from '../components/Button';

const { width, height } = Dimensions.get('window');

// Move API credentials to environment variables or config file
const YOUTUBE_API_KEY = 'AIzaSyAdePDcYUZOjEqOCkGdJB2ccvO8hIMv83M';
const CHANNEL_ID = 'UCFCWIvyEKpUfOgvxSfOm0sw';

const PodcastScreen = ({ navigation }) => {
  const { t } = useTranslation();
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
      setError(t('unable_to_load_podcasts_check_connection'));
      
      Alert.alert(
        t('connection_error'),
        t('unable_to_load_podcast_videos_check_connection'),
        [
          { text: t('retry'), onPress: () => fetchVideos() },
          { text: t('cancel'), style: 'cancel' }
        ]
      );
    } finally {
      setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const openVideo = (videoId, title) => {
    const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
    
    Alert.alert(
      t('open_podcast'),
      t('watch_video_on_youtube', { title }),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('watch'),
          onPress: () => {
            Linking.canOpenURL(youtubeUrl)
              .then((supported) => {
                if (supported) {
                  Linking.openURL(youtubeUrl);
                } else {
                  Alert.alert(
                    t('cannot_open_video'),
                    t('youtube_not_available_device'),
                    [{ text: t('ok') }]
                  );
                }
              })
              .catch(() => {
                Alert.alert(
                  t('error'),
                  t('unable_to_open_video_try_again'),
                  [{ text: t('ok') }]
                );
              });
          },
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

    if (diffDays === 1) return t('one_day_ago');
    if (diffDays < 30) return t('days_ago', { days: diffDays });
    if (diffDays < 365) return t('months_ago', { months: Math.floor(diffDays / 30) });
    return t('years_ago', { years: Math.floor(diffDays / 365) });
  };

  const renderItem = ({ item, index }) => {
    const { videoId } = item.id;
    const { title, thumbnails, publishedAt, description } = item.snippet;

    if (!videoId) return null;

    return (
      <TouchableOpacity
        onPress={() => openVideo(videoId, title)}
        style={[styles.card, index === 0 && styles.featuredCard]}
        activeOpacity={0.8}
      >
        <View style={styles.thumbnailContainer}>
          <Image
            source={{ uri: thumbnails?.high?.url || thumbnails?.default?.url }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
          <View style={styles.playButton}>
            <Ionicons name="play" size={20} color="white" />
          </View>
          {index === 0 && (
            <View style={styles.featuredBadge}>
              <MaterialIcons name="star" size={16} color="white" />
              <Text style={styles.featuredText}>{t('latest')}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.contentContainer}>
          <Text style={styles.title} numberOfLines={2}>{title}</Text>
          <Text style={styles.description} numberOfLines={3}>
            {description || t('brain_stroke_awareness_prevention_tips')}
          </Text>
          <View style={styles.metaInfo}>
            <View style={styles.metaItem}>
              <MaterialIcons name="access-time" size={14} color={colors.textMuted} />
              <Text style={styles.metaText}>{formatDuration(publishedAt)}</Text>
            </View>
            <View style={styles.metaItem}>
              <MaterialIcons name="local-hospital" size={14} color={colors.secondary} />
              <Text style={styles.healthTag}>{t('health_education')}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialIcons name="video-library" size={64} color={colors.textMuted} />
      <Text style={styles.emptyTitle}>{t('no_podcasts_available')}</Text>
      <Text style={styles.emptyText}>
        {t('working_on_bringing_health_content')}
      </Text>
      <Button
        title={t('retry')}
        onPress={() => fetchVideos()}
        style={styles.retryButton}
      />
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerContent}>
      <View style={styles.titleSection}>
        <Text style={styles.heading}>{t('health_podcasts')}</Text>
        <Text style={styles.subheading}>{t('brain_stroke_awareness_prevention')}</Text>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{videos.length}</Text>
          <Text style={styles.statLabel}>{t('episodes')}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{t('free')}</Text>
          <Text style={styles.statLabel}>{t('access')}</Text>
        </View>
      </View>
      
      <Text style={styles.channelInfo}>{t('brainline_channel')}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>{t('loading_health_podcasts')}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.primary} />
      
      {/* Fixed Header with proper spacing */}
      <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
        <Header />
      </View>

      <FlatList
        data={videos}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.videoId}
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
      />
    </SafeAreaView>
  );
};

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
    fontSize: 18,
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
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  channelInfo: {
    fontSize: 16,
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
  },
});

export default PodcastScreen;
