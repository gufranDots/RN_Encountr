import React, { FC, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  Dimensions,
  ActivityIndicator,
  Image,
} from 'react-native';
import FastImage from '../utils/FastImageCompat';
import LinearGradient from 'react-native-linear-gradient';
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';
import { height, moderateScale, scale } from '../styles/responsiveSize';
import imagesPath from '../constants/imagesPath';
import { getMySharedChatImagesApi } from '../redux/reduxActions/chatActions';
import { deleteChatMessage } from '../redux/reduxActions/homeActions';
import { showError } from '../utils/helperFunctions';
import { stableKeyExtractor } from '../utils/stableKeyExtractor';
import { useTheme } from '../theme/ThemeProvider';
import { getCommonStyles } from '../styles/commonStyles';
import { DeleteMsg } from '../constants/Enum';

interface PreviouslySentPhotosProps {
  isVisible: boolean;
  onClose: () => void;
  onSelectPhoto: (photo: any) => void;
  onOpenGallery: () => void;
  onOpenCamera: () => void;
  messages: any[];
  userData: any;
}

const { width } = Dimensions.get('window');
const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

const PreviouslySentPhotos: FC<PreviouslySentPhotosProps> = ({
  isVisible,
  onClose,
  onSelectPhoto,
  onOpenGallery,
  onOpenCamera,
}) => {
  const {theme} = useTheme();
  const commonStyles = getCommonStyles(theme);
  const styles = getStyles(theme, commonStyles);
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);
  const [pendingAction, setPendingAction] = useState<'gallery' | 'camera' | null>(null);
  const [sharedImages, setSharedImages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadedImageMap, setLoadedImageMap] = useState<Record<string, boolean>>({});
  const [deletingPhotoId, setDeletingPhotoId] = useState<string | null>(null);

  // Fetch shared images when modal becomes visible
  useEffect(() => {
    if (isVisible && sharedImages.length === 0) {
      fetchSharedImages();
    }
  }, [isVisible, sharedImages.length]);

  const fetchSharedImages = async () => {
    setIsLoading(true);
    try {
      const response: any = await getMySharedChatImagesApi();
      if (response?.success) {
        setSharedImages(response?.data || []);
        setLoadedImageMap({});
      }
    } catch (error) {
      console.log('Error fetching shared images:', error);
      showError('Failed to load shared images');
    } finally {
      setIsLoading(false);
    }
  };

  // Use shared images instead of filtering current chat messages
  const imageMessages = sharedImages;

  const getPhotoKey = (item: any, index: number) =>
    String(item?.id || item?.message_id || item?.image_url || item?.message || index);

  const markImageLoaded = (photoKey: string) => {
    setLoadedImageMap(prev => {
      if (prev[photoKey]) {
        return prev;
      }
      return {
        ...prev,
        [photoKey]: true,
      };
    });
  };

  const handleDeletePhoto = async (item: any) => {
    const messageId = item?.id || item?.message_id;
    if (!messageId) {
      showError('Unable to delete this photo');
      return;
    }

    const messageIdStr = String(messageId);
    if (deletingPhotoId === messageIdStr) {
      return;
    }

    try {
      setDeletingPhotoId(messageIdStr);
      await deleteChatMessage({
        message_id: messageId,
        delete_type: DeleteMsg.DeleteForMe,
      });

      setSharedImages(prev =>
        prev.filter(photo => (photo?.id || photo?.message_id) !== messageId),
      );

      setLoadedImageMap(prev => {
        const nextState = { ...prev };
        delete nextState[String(messageId)];
        return nextState;
      });

      if ((selectedPhoto?.id || selectedPhoto?.message_id) === messageId) {
        setSelectedPhoto(null);
      }
    } catch (error) {
      showError('Failed to delete image');
    } finally {
      setDeletingPhotoId(null);
    }
  };

  const renderPhotoItem = ({ item, index }: { item: any; index: number }) => {
    const photoKey = getPhotoKey(item, index);
    const isPhotoLoaded = !!loadedImageMap[photoKey];
    const photoUri = item?.image_url || item?.message || item;
    const isDeleting = deletingPhotoId === String(item?.id || item?.message_id);

    return (
      <TouchableOpacity
        style={styles.photoItem}
        onPress={() => setSelectedPhoto(item)}
        activeOpacity={0.8}
      >
        <FastImage
          source={{ uri: photoUri }}
          style={styles.photoImage}
          resizeMode={FastImage.resizeMode.cover}
          onLoadEnd={() => markImageLoaded(photoKey)}
          onError={() => markImageLoaded(photoKey)}
        />
        {!isPhotoLoaded && <ShimmerPlaceholder style={styles.photoShimmer} />}
        {isDeleting && (
          <View style={styles.deleteLoaderOverlay}>
            <ActivityIndicator size="small" color={theme.colors.white} />
          </View>
        )}
        <TouchableOpacity
          style={styles.deleteButton}
          activeOpacity={0.8}
          disabled={isDeleting}
          onPress={(event) => {
            event?.stopPropagation?.();
            handleDeletePhoto(item);
          }}
        >
          <Image source={imagesPath.delete_ic} style={styles.deleteIcon} />
        </TouchableOpacity>
        {/* <View style={styles.photoOverlay}>
          <Text style={styles.photoDate}>
            {new Date(item.created_at || item.createdAt).toLocaleDateString()}
          </Text>
        </View> */}
      </TouchableOpacity>
    );
  };

  const handleResendPhoto = () => {
    if (selectedPhoto) {
      // Create a compatible object for the onSelectPhoto callback
      const photoData = {
        ...selectedPhoto,
        message: selectedPhoto.image_url || selectedPhoto.message,
        createdAt: selectedPhoto.created_at || selectedPhoto.createdAt,
        is_see_once: selectedPhoto.is_see_once || 0,
      };
      onSelectPhoto(photoData);
      setSelectedPhoto(null);
      onClose();
      // Alert.alert("EXPLICIT CONTENT PROHIBITED");
    }
  };

  const handleModalHide = () => {
    if (pendingAction === 'gallery') {
      onOpenGallery();
    } else if (pendingAction === 'camera') {
      onOpenCamera();
    }
    setPendingAction(null);
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <FastImage
        source={imagesPath.ic_gallery}
        style={styles.emptyIcon}
        resizeMode={FastImage.resizeMode.contain}
      />
      <Text style={styles.emptyText}>No shared images yet</Text>
      <Text style={styles.emptySubtext}>
        Images you share in chats will appear here for quick reuse
      </Text>
    </View>
  );

      return (
      <Modal
        visible={isVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={onClose}
        onDismiss={handleModalHide}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Text style={styles.headerTitle}>My Shared Images</Text>
                <Text style={styles.headerSubtitle}>Tap to resend from all your chats</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Photos Grid */}
            <View style={styles.contentContainer}>
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={theme.colors.themecolor2} />
                  <Text style={styles.loadingText}>Loading shared images...</Text>
                </View>
              ) : imageMessages.length > 0 ? (
                <FlatList
                  data={imageMessages}
                  renderItem={renderPhotoItem}
                  keyExtractor={stableKeyExtractor}
                  numColumns={3}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.photoGrid}
                  style={styles.flatListStyle}
                  nestedScrollEnabled={true}
                />
              ) : (
                renderEmptyState()
              )}
            </View>
          </View>

          {/* Photo Preview Modal */}
          <Modal
            visible={!!selectedPhoto}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setSelectedPhoto(null)}
          >
            <View style={styles.previewContainer}>
              <View style={styles.previewContent}>
                              <FastImage
                source={{ uri: selectedPhoto?.image_url || selectedPhoto?.message }}
                style={styles.previewImage}
                resizeMode={FastImage.resizeMode.contain}
              />
                <View style={styles.previewActions}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setSelectedPhoto(null)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.resendButton}
                    onPress={handleResendPhoto}
                  >
                    <Text style={styles.resendButtonText}>Resend</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      </Modal>
  );
};

const getStyles = (theme:any, commonStyles: any) => StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.blackOpacity50,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: moderateScale(20),
    borderTopRightRadius: moderateScale(20),
    height: '80%',
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: moderateScale(20),
    paddingVertical: moderateScale(15),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.lightGray,
  },
  headerTitle: {
    ...commonStyles.font_18_SemiBold,
    color: theme.colors.black,
  },
  headerLeft: {
    flex: 1,
  },
  headerSubtitle: {
    ...commonStyles.font_12_regular,
    color: theme.colors.gray4,
    marginTop: moderateScale(2),
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cameraButton: {
    backgroundColor: theme.colors.themecolor2,
    paddingHorizontal: moderateScale(15),
    paddingVertical: moderateScale(8),
    borderRadius: moderateScale(6),
    marginRight: moderateScale(8),
  },
  cameraButtonText: {
    ...commonStyles.font_14_SemiBold,
    color: theme.colors.white,
  },
  galleryButton: {
    backgroundColor: theme.colors.themecolor2,
    paddingHorizontal: moderateScale(15),
    paddingVertical: moderateScale(8),
    borderRadius: moderateScale(6),
    marginRight: moderateScale(10),
  },
  galleryButtonText: {
    ...commonStyles.font_14_SemiBold,
    color: theme.colors.white,
  },
  closeButton: {
    padding: moderateScale(5),
  },
  closeButtonText: {
    fontSize: scale(20),
    color: theme.colors.black,
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
  },
  flatListStyle: {
    flex: 1,
  },
  photoGrid: {
    padding: moderateScale(10),
    paddingBottom: moderateScale(20),
  },
  photoItem: {
    width: (width - moderateScale(60)) / 3,
    height: (width - moderateScale(60)) / 3,
    margin: moderateScale(5),
    borderRadius: moderateScale(8),
    overflow: 'hidden',
    position: 'relative',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoShimmer: {
    ...StyleSheet.absoluteFillObject,
  },
  deleteLoaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.blackOpacity50,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  deleteButton: {
    position: 'absolute',
    top: moderateScale(6),
    right: moderateScale(6),
    width: moderateScale(24),
    height: moderateScale(24),
    borderRadius: moderateScale(12),
    backgroundColor: theme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
  },
  deleteIcon: {
    width: moderateScale(14),
    height: moderateScale(14),
    tintColor: theme.colors.red,
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.blackOpacity60,
    padding: moderateScale(5),
  },
  photoDate: {
    ...commonStyles.font_10_regular,
    color: theme.colors.white,
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: moderateScale(40),
  },
  emptyIcon: {
    width: moderateScale(60),
    height: moderateScale(60),
    tintColor: theme.colors.gray4,
    marginBottom: moderateScale(20),
  },
  emptyText: {
    ...commonStyles.font_16_SemiBold,
    color: theme.colors.black,
    marginBottom: moderateScale(10),
  },
  emptySubtext: {
    ...commonStyles.font_14_regular,
    color: theme.colors.gray4,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    maxHeight: height * 0.6,
  },
  loadingText: {
    ...commonStyles.font_14_regular,
    color: theme.colors.gray4,
    marginTop: moderateScale(10),
  },
  previewContainer: {
    flex: 1,
    backgroundColor: theme.colors.blackOpacity90,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewContent: {
    width: '90%',
    height: '80%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: '80%',
    borderRadius: moderateScale(10),
  },
  previewActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: moderateScale(20),
  },
  cancelButton: {
    paddingHorizontal: moderateScale(30),
    paddingVertical: moderateScale(12),
    borderRadius: moderateScale(8),
    backgroundColor: theme.colors.gray4,
  },
  cancelButtonText: {
    ...commonStyles.font_14_SemiBold,
    color: theme.colors.white,
  },
  resendButton: {
    paddingHorizontal: moderateScale(30),
    paddingVertical: moderateScale(12),
    borderRadius: moderateScale(8),
    backgroundColor: theme.colors.themecolor2,
  },
  resendButtonText: {
    ...commonStyles.font_14_SemiBold,
    color: theme.colors.black,
  },
});

export default PreviouslySentPhotos; 
