import React, {useCallback, useMemo} from 'react';
import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {COLORS} from '../../../constants/cypher/colors';
import imagesPath from '../../../constants/imagesPath';
import fontFamily from '../../../styles/fontFamily';
import {moderateScale, textScale, width} from '../../../styles/responsiveSize';
import {ShowGender} from '../../../utils/helperFunctions';
import FastImage from '../../../utils/FastImageCompat';

const CARD_WIDTH = width * 0.64;
const IMAGE_HEIGHT = moderateScale(248);
const INFO_HEIGHT = moderateScale(148);
const CARD_HEIGHT = IMAGE_HEIGHT + INFO_HEIGHT;
const CARD_SPACING = moderateScale(12);
const SNAP_INTERVAL = CARD_WIDTH + CARD_SPACING;

const isValidDetail = value => {
  if (value === null || value === undefined) {
    return false;
  }
  const trimmed = String(value).trim();
  return (
    trimmed !== '' &&
    trimmed !== '0' &&
    trimmed.toLowerCase() !== 'not specified'
  );
};

const getProfileImageUri = item =>
  item?.profile_image?.trim?.() ||
  item?.profile_image_thumb?.trim?.() ||
  null;

const buildDisplayName = item => {
  const fullName = [item?.first_name, item?.last_name]
    .filter(Boolean)
    .join(' ')
    .trim();

  if (fullName && item?.age) {
    return `${fullName}, ${item.age}`;
  }
  if (fullName) {
    return fullName;
  }
  if (item?.user_name) {
    return item.user_name;
  }
  return 'Profile';
};

const buildLocation = item => {
  const city = item?.city?.trim?.() || '';
  const country = item?.country?.trim?.() || '';

  if (city && country) {
    if (city.toLowerCase() === country.toLowerCase()) {
      return country;
    }
    return `${city}, ${country}`;
  }
  return city || country || null;
};

const formatDistance = distance => {
  const numeric =
    typeof distance === 'string' ? parseFloat(distance) : distance;

  if (typeof numeric !== 'number' || Number.isNaN(numeric)) {
    return null;
  }
  if (numeric <= 0) {
    return 'Nearby';
  }
  if (numeric < 1) {
    return `${numeric.toFixed(1)} km away`;
  }
  return `${Math.round(numeric)} km away`;
};

const buildDetailLines = item => {
  const lines = [];
  const location = buildLocation(item);
  const distanceLabel = formatDistance(item?.distance);

  if (location) {
    lines.push({key: 'location', icon: imagesPath.ic_location, text: location});
  }

  if (distanceLabel) {
    lines.push({
      key: 'distance',
      icon: imagesPath.ic_location,
      text: distanceLabel,
    });
  }

  if (isValidDetail(item?.looking_for)) {
    lines.push({key: 'looking_for', text: `Looking for: ${item.looking_for}`});
  }

  if (isValidDetail(item?.body_type)) {
    lines.push({key: 'body_type', text: `Body: ${item.body_type}`});
  }

  if (isValidDetail(item?.height)) {
    lines.push({key: 'height', text: `Height: ${item.height}`});
  }

  if (isValidDetail(item?.highest_education)) {
    lines.push({
      key: 'education',
      text: `Education: ${item.highest_education}`,
    });
  }

  const aboutMe = item?.about_me?.trim?.();
  if (aboutMe) {
    lines.push({key: 'about', text: aboutMe, multiline: true});
  }

  return lines;
};

const GENDER_LABELS = {
  1: 'Female',
  2: 'Male',
  3: 'Trans / Non-binary',
};

const buildFullDetailLines = item => {
  const lines = [];

  if (isValidDetail(item?.user_name)) {
    lines.push({key: 'username', text: `@${item.user_name}`});
  }

  if (item?.gender === 1 || item?.gender === 2 || item?.gender === 3) {
    lines.push({
      key: 'gender',
      text: `Gender: ${GENDER_LABELS[item.gender]}`,
    });
  }

  const location = buildLocation(item);
  if (location) {
    lines.push({key: 'location', icon: imagesPath.ic_location, text: location});
  }

  const distanceLabel = formatDistance(item?.distance);
  if (distanceLabel) {
    lines.push({
      key: 'distance',
      icon: imagesPath.ic_location,
      text: distanceLabel,
    });
  }

  if (isValidDetail(item?.looking_for)) {
    lines.push({key: 'looking_for', text: `Looking for: ${item.looking_for}`});
  }

  if (isValidDetail(item?.body_type)) {
    lines.push({key: 'body_type', text: `Body type: ${item.body_type}`});
  }

  if (isValidDetail(item?.height)) {
    lines.push({key: 'height', text: `Height: ${item.height}`});
  }

  if (isValidDetail(item?.highest_education)) {
    lines.push({
      key: 'education',
      text: `Education: ${item.highest_education}`,
    });
  }

  if (item?.match_score !== null && item?.match_score !== undefined) {
    const score = String(item.match_score).trim();
    if (score !== '') {
      lines.push({key: 'match_score', text: `Match score: ${score}`});
    }
  }

  if (typeof item?.online_status === 'boolean') {
    lines.push({
      key: 'online_status',
      text: item.online_status ? 'Online now' : 'Offline',
    });
  }

  if (item?.is_matched === true) {
    lines.push({key: 'is_matched', text: 'Already matched'});
  }

  if (item?.is_requested === true) {
    lines.push({key: 'is_requested', text: 'Request sent'});
  }

  const aboutMe = item?.about_me?.trim?.();
  if (aboutMe) {
    lines.push({key: 'about', text: aboutMe, multiline: true});
  }

  return lines;
};

const UserResultCard = React.memo(({item, cardWidth = CARD_WIDTH, infoHeight = INFO_HEIGHT}) => {
  const displayName = buildDisplayName(item);
  const username = useMemo(() => {
    if (!item?.user_name) {
      return null;
    }
    const handle = String(item.user_name).trim();
    if (!handle) {
      return null;
    }
    if (displayName.toLowerCase().includes(handle.toLowerCase())) {
      return null;
    }
    return `@${handle}`;
  }, [item?.user_name, displayName]);

  const detailLines = useMemo(() => buildDetailLines(item), [item]);
  const imageUri = getProfileImageUri(item);
  const showGender =
    item?.gender === 1 || item?.gender === 2 || item?.gender === 3;

  return (
    <View style={[styles.cardOuter, {width: cardWidth}]} pointerEvents="none">
      <View style={styles.imageSection}>
        {imageUri ? (
          <FastImage
            source={{uri: imageUri, priority: 'high'}}
            style={styles.profileImage}
            resizeMode="cover"
          />
        ) : (
          <FastImage
            source={imagesPath.noImage}
            style={styles.profileImage}
            resizeMode="cover"
          />
        )}

        {showGender ? (
          <View style={styles.genderBadge}>{ShowGender(item.gender)}</View>
        ) : null}
      </View>

      <View style={[styles.infoPanel, {height: infoHeight}]}>
        <Text style={styles.name} numberOfLines={1}>
          {displayName}
        </Text>

        {!!username && (
          <Text style={styles.username} numberOfLines={1}>
            {username}
          </Text>
        )}

        <ScrollView
          style={styles.detailsScroll}
          contentContainerStyle={styles.detailsContent}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
          bounces={false}>
          {detailLines.map(line => (
            <View key={line.key} style={styles.detailRow}>
              {!!line.icon && (
                <Image
                  source={line.icon}
                  style={styles.detailIcon}
                  resizeMode="contain"
                />
              )}
              <Text
                style={line.multiline ? styles.aboutText : styles.detailText}
                numberOfLines={line.multiline ? 2 : 1}>
                {line.text}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
});

const SINGLE_CARD_WIDTH = width * 0.88;
const SINGLE_IMAGE_HEIGHT = moderateScale(260);
const SINGLE_INFO_HEIGHT = moderateScale(220);
const SINGLE_CARD_HEIGHT = SINGLE_IMAGE_HEIGHT + SINGLE_INFO_HEIGHT;

export const UserProfileDetailCard = React.memo(({profile}) => {
  if (!profile) {
    return null;
  }

  const displayName = buildDisplayName(profile);
  const detailLines = useMemo(() => buildFullDetailLines(profile), [profile]);
  const imageUri = getProfileImageUri(profile);
  const showGender =
    profile?.gender === 1 || profile?.gender === 2 || profile?.gender === 3;

  return (
    <View style={styles.singleContainer}>
      <Text style={styles.title}>PROFILE VIEW</Text>
      <View
        style={[
          styles.cardOuter,
          styles.singleCardOuter,
          {width: SINGLE_CARD_WIDTH, height: SINGLE_CARD_HEIGHT},
        ]}
        pointerEvents="none">
        <View style={[styles.imageSection, {height: SINGLE_IMAGE_HEIGHT}]}>
          {imageUri ? (
            <FastImage
              source={{uri: imageUri, priority: 'high'}}
              style={styles.profileImage}
              resizeMode="cover"
            />
          ) : (
            <FastImage
              source={imagesPath.noImage}
              style={styles.profileImage}
              resizeMode="cover"
            />
          )}

          {showGender ? (
            <View style={styles.genderBadge}>{ShowGender(profile.gender)}</View>
          ) : null}
        </View>

        <View style={[styles.infoPanel, {height: SINGLE_INFO_HEIGHT}]}>
          <Text style={styles.name} numberOfLines={1}>
            {displayName}
          </Text>

          <ScrollView
            style={styles.detailsScroll}
            contentContainerStyle={styles.detailsContent}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled
            bounces={false}>
            {detailLines.map(line => (
              <View key={line.key} style={styles.detailRow}>
                {!!line.icon && (
                  <Image
                    source={line.icon}
                    style={styles.detailIcon}
                    resizeMode="contain"
                  />
                )}
                <Text
                  style={line.multiline ? styles.aboutText : styles.detailText}
                  numberOfLines={line.multiline ? 4 : 2}>
                  {line.text}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </View>
  );
});

const UserResultsCarousel = ({users}) => {
  const renderItem = useCallback(
    ({item}) => <UserResultCard item={item} />,
    [],
  );

  const keyExtractor = useCallback(item => String(item?.id), []);

  if (!users?.length) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>PROFILES FOUND</Text>
      <FlatList
        horizontal
        data={users}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        snapToInterval={SNAP_INTERVAL}
        decelerationRate="fast"
        snapToAlignment="start"
        disableIntervalMomentum
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    minHeight: CARD_HEIGHT + moderateScale(36),
    paddingTop: moderateScale(8),
  },
  title: {
    fontFamily: fontFamily.medium,
    fontSize: textScale(9),
    color: COLORS.purple200,
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: moderateScale(12),
  },
  listContent: {
    paddingHorizontal: moderateScale(16),
    paddingBottom: moderateScale(12),
  },
  singleContainer: {
    width: '100%',
    minHeight: SINGLE_CARD_HEIGHT + moderateScale(36),
    alignItems: 'center',
    paddingTop: moderateScale(8),
  },
  singleCardOuter: {
    marginRight: 0,
  },
  cardOuter: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    marginRight: CARD_SPACING,
    borderRadius: moderateScale(16),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.35)',
    backgroundColor: COLORS.bgDeep,
  },
  imageSection: {
    width: '100%',
    height: IMAGE_HEIGHT,
    backgroundColor: COLORS.bgMid,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  genderBadge: {
    position: 'absolute',
    top: moderateScale(10),
    right: moderateScale(10),
    zIndex: 2,
  },
  infoPanel: {
    height: INFO_HEIGHT,
    paddingHorizontal: moderateScale(12),
    paddingTop: moderateScale(10),
    paddingBottom: moderateScale(10),
    backgroundColor: 'rgba(18,8,40,0.98)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(168,85,247,0.25)',
  },
  name: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(16),
    color: COLORS.white,
    marginBottom: moderateScale(2),
  },
  username: {
    fontFamily: fontFamily.medium,
    fontSize: textScale(10),
    color: COLORS.purple200,
    marginBottom: moderateScale(6),
  },
  detailsScroll: {
    flex: 1,
  },
  detailsContent: {
    paddingBottom: moderateScale(2),
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: moderateScale(5),
  },
  detailIcon: {
    width: moderateScale(12),
    height: moderateScale(12),
    tintColor: COLORS.purple100,
    marginRight: moderateScale(6),
    marginTop: moderateScale(2),
  },
  detailText: {
    flex: 1,
    fontFamily: fontFamily.regular,
    fontSize: textScale(11),
    color: COLORS.purple100,
    lineHeight: textScale(15),
  },
  aboutText: {
    flex: 1,
    fontFamily: fontFamily.regular,
    fontSize: textScale(11),
    color: COLORS.purple200,
    lineHeight: textScale(15),
  },
});

export default React.memo(UserResultsCarousel);
