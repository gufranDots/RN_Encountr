import imagesPath from '../constants/imagesPath'

export const canAddMoreImageFnc = (subscription, galleryImageLength) => {
  switch (subscription) {
    case 1:
      if (galleryImageLength >= 2) {
        return false
      } else {
        return true
      }
    case 2:
      if (galleryImageLength >= 4) {
        return false
      } else {
        return true
      }
    case 3:
      if (galleryImageLength >= 6) {
        return false
      } else {
        return true
      }
    case 4:
      if (galleryImageLength >= 8) {
        return false
      } else {
        return true
      }
    default:
      if (galleryImageLength >= 2) {
        return false
      } else {
        return true
      }
  }
}

export const noOfImagesCanAdd = (subscription) => {
  switch (subscription) {
    case 1:
      return 2
    case 2:
      return 4
    case 3:
      return 6
    case 4:
      return 8
    default:
      return 2
  }
}

export const canSendImages = (subscription) => {
  switch (subscription) {
    case 1:
      return false
    case 2:
      return true
    case 3:
      return true
    case 4:
      return true
    default:
      return false
  }
}

export const canSendVoiceNotes = (subscription) => {
  switch (subscription) {
    case 1:
      return false
    case 2:
      return true
    case 3:
      return true
    case 4:
      return true
    default:
      return false
  }
}

export const getDiamoundIcon = (subscription) => {
  console.log(subscription,"HELLOOOOOO");
  switch (subscription) {
    case 1:
      return null
    case 2:
      return imagesPath.ic_blue_diamond
    case 3:
      return imagesPath.ic_pink_diamond
    case 4:
      return imagesPath.ic_crystal_diamond
    default:
      return null
  }
}
