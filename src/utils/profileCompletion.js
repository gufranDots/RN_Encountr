export const isUserProfileComplete = (userData = {}) => {
  const hasFilters = Boolean(userData?.filters);
  const hasGalleryPhotos =
    Array.isArray(userData?.photos) && userData.photos.length > 0;
  const hasProfileImage = Boolean(userData?.profile_image);

  return hasFilters && (hasGalleryPhotos || hasProfileImage);
};
