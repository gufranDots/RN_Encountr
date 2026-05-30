import { showMessage } from 'react-native-flash-message'
import ImagePicker from 'react-native-image-crop-picker'
import ActionSheet from 'react-native-action-sheet'
import Geocoder from 'react-native-geocoding'
import colors from '../styles/colors'
import { moderateScale } from '../styles/responsiveSize'
import strings from '../constants/Languages'
import fontFamily from '../styles/fontFamily'
import { requestCameraPermission } from './miscellaneous'
import { BUTTONSandroid, BUTTONSiOS, CANCEL_INDEX } from './staticData'
import {
  Alert,
  Image,
  LayoutAnimation,
  Linking,
  PermissionsAndroid,
  Platform,
  UIManager
} from 'react-native'
import moment from 'moment'
import { saveLiveLocationCoordsToStore } from '../redux/reduxActions/authActions';

import {
  check,
  checkMultiple,
  openSettings,
  PERMISSIONS,
  request,
  requestMultiple,
  RESULTS
} from 'react-native-permissions'
import imagesPath from '../constants/imagesPath'
import { GOOGLE_MAPS_KEY } from '../constants/googleMapCredentials'
import Geolocation from '@react-native-community/geolocation'
// import Geolocation from 'react-native-geolocation-service'

export function ApiError(error) {
  const _error = error?.message || error?.data?.message || strings.error
  return _error
}

const showError = message => {
  showMessage({
    type: 'danger',
    icon: 'danger',
    message: 'Error',
    description: String(message),
    style: { marginTop: moderateScale(32) },
    floating: true,
    duration: 4000,
    style: { marginTop: moderateScale(32) },
    textStyle: {
      fontFamily: fontFamily.medium,
      color: colors.white
    },
    titleStyle: {
      fontFamily: fontFamily.SemiBold,
      color: colors.white
    }
  })
}

const showSuccess = (message, time = 4000) => {
  showMessage({
    message: 'Success',
    description: String(message),
    type: 'success',
    icon: 'success',
    floating: true,
    duration: time,
    style: { marginTop: moderateScale(32) },
    textStyle: {
      fontFamily: fontFamily.medium,
      color: colors.white
    },
    titleStyle: {
      fontFamily: fontFamily.SemiBold,
      color: colors.white
    }
  })
}
const getLocation = async (lat, lng, type) => {
  if (type == 'home') {
    try {
      let res = await Geocoder.geocodePosition({ lat, lng });
      let addr = res[0].formattedAddress;
      return addr;
    } catch (err) { }
  } else if (type == 'address') {
    try {
      let res = await Geocoder.geocodePosition({ lat, lng });

      let addr = res[0].formattedAddress;

      let country_id =
        callingCountries[`${res[0].countryCode}`]?.countryCallingCodes[0];
      let street = res[0].streetName;
      let city = res[0].locality;
      let states = res[0].adminArea;
      let pincode = res[0].postalCode;
      let latitude = res[0].position.lat;
      let longitude = res[0].position.lng;

      let data = {
        address: addr,
        street: street,
        city: city,
        states: states,
        latitude: latitude,
        longitude: longitude,
        country_id: country_id,
        pincode: pincode,
        address_type: '1',
      };

      return data;
    } catch (err) { }
  } else {
    return await Geocoder.geocodePosition({ lat, lng });
  }
};

export const chekLocationPermission = (showAlert = true) =>
  new Promise(async (resolve, reject) => {
    try {
      check(
        Platform.OS === 'ios'
          ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
          : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      )
        .then((result) => {
          console.log("permission result", result)
          switch (result) {
            case RESULTS.UNAVAILABLE:
              showError(strings.LOCATION_UNAVAILABLE);
              break;
            case RESULTS.DENIED:
              request(
                Platform.OS === 'ios'
                  ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
                  : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
              )
                .then((result) => {
                  if (result == "blocked") {
                    if (showAlert) {
                      Alert.alert('', strings.LOCATION_DISABLED_MSG, [
                        {
                          text: strings.CANCEL,
                          onPress: () => resolve('goback'),
                        },
                        {
                          text: strings.CONFIRM,
                          onPress: () => {
                            const locationPath = 'LOCATION_SERVICES';
                            openAppSetting(locationPath);
                          },
                        },
                      ]);
                    }
                  }
                  return resolve(result);
                })
                .catch((error) => {
                  return reject(error);
                });

              break;
            case RESULTS.LIMITED:
              showError(strings.LOCATION_LIMITED);
              break;
            case RESULTS.GRANTED:
              return resolve(result);
            case RESULTS.BLOCKED:
              if (showAlert) {
                Alert.alert('', strings.LOCATION_DISABLED_MSG, [
                  {
                    text: strings.CANCEL,
                    onPress: () => resolve('goback'),
                  },
                  {
                    text: strings.CONFIRM,
                    onPress: () => {
                      const locationPath = 'LOCATION_SERVICES';
                      openAppSetting(locationPath);
                    },
                  },
                ]);
              }
              return resolve(result);
          }
        })
        .catch((error) => {
          return reject(error);
        });
    } catch (error) {
      return reject(error);
    }
  });

const ShowInfo = (message, time = 10000) => {
  showMessage({
    message: 'Info',
    description: String(message),
    type: 'none',
    icon: 'success',
    floating: true,
    duration: time,
    style: {
      marginTop: moderateScale(32),
      backgroundColor: colors.grey12
    },
    textStyle: {
      fontFamily: fontFamily.SemiBold,
      color: colors.white
    },
    titleStyle: {
      fontFamily: fontFamily.bold,
      color: colors.white
    }
  })
}

export const getCurrentLocation = () => {
  return new Promise(async (resolve, reject) => {

    try {
      await Geolocation.getCurrentPosition(position => {
        const cords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }
        setTimeout(() => {
          saveLiveLocationCoordsToStore(cords)
          resolve(cords)
        }, 500),
          (error) => {
            reject(error)
          }
      }
        // , Platform.OS === "ios" && { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      )
    } catch (error) {
      reject(error)
    }
  })
}

export function getColorCodeWithOpactiyNumberHASHES(color, transparency) {
  /*
HEXA VALUE CHANGE IS DIFFRENT IN JS, HERE THE TRANSPERANCY YOU WANT TO ADD IS ADDED AT THE END
Using an alpha value to update a color’s transparency will change the hex code format from #RRGGBB to #RRGGBBAA (red, green, blue, alpha).
The first six values (the red, green, and blue ones) stay the exact same. The only difference is the last two values (the AA).
  */
  switch (String(transparency)) {
    case '10':
      return `${color}1A`
    case '15':
      return `${color}26`
    case '20':
      return `${color}33`
    case '25':
      return `${color}40`
    case '30':
      return `${color}4D`
    case '35':
      return `${color}59`
    case '40':
      return `${color}66`
    case '50':
      return `${color}80`
    case '60':
      return `${color}99`
    case '70':
      return `${color}B3`
  }
}

export const selectSingleImageFromCamera = () =>
  new Promise(async (resolve, reject) => {
    try {
      const imagePickerOptions = {
        compressImageQuality: 0.4,
        mediaType: 'photo',
        width: 300,
        height: 300,
        multiple: false,
        cropping: false
      }
      const pickedImage = await ImagePicker.openCamera(imagePickerOptions)
      console.log(pickedImage, 'pickedImagepickedImagepickedImagepickedImage')
      resolve(pickedImage)
    } catch (error) {
      reject(error)
      console.log('Image Picker Error: ', error)
    }
  })

export const convertToSeconds = (time) => {
  const hms = time // your input string
  const a = hms.split(':') // split it at the colons
  // minutes are worth 60 seconds. Hours are worth 60 minutes.
  const seconds = +a[0] * 60 + +a[1] + +a[2] / 1000
  return seconds
}

export const selectSingleImageFromGallery = () =>
  new Promise(async (resolve, reject) => {
    try {
      const imagePickerOptions = {
        compressImageQuality: 0.4,
        mediaType: 'photo',
        width: 300,
        height: 300,
        multiple: false,
        cropping: false
      }
      const pickedImage = await ImagePicker.openPicker(imagePickerOptions)
      console.log(pickedImage, 'pickedImagepickedImagepickedImagepickedImage')
      resolve(pickedImage)
    } catch (error) {
      reject(error)
      console.log('Image Picker Error: ', error)
    }
  })

export const selectMultipleImageFromGallery = () =>
  new Promise(async (resolve, reject) => {
    try {
      const imagePickerOptions = {
        compressImageQuality: 0.4,
        mediaType: 'photo',
        width: 300,
        height: 300,
        multiple: true,
        cropping: true
      }
      const pickedImage = await ImagePicker.openPicker(imagePickerOptions)
      console.log(pickedImage, 'pickedImagepickedImagepickedImagepickedImage')
      resolve(pickedImage)
    } catch (error) {
      reject(error)
      console.log('Image Picker Error: ', error)
    }
  })
export const selectPrivateMultipleImageFromGallery = () =>
  new Promise(async (resolve, reject) => {
    try {
      const imagePickerOptions = {
        compressImageQuality: 0.4,
        mediaType: 'photo',
        width: 300,
        height: 300,
        multiple: true,
        cropping: true
      }
      const pickedImage = await ImagePicker.openPicker(imagePickerOptions)
      console.log(pickedImage, 'pickedImagepickedImagepickedImagepickedImage')
      resolve(pickedImage)
    } catch (error) {
      reject(error)
      console.log('Image Picker Error: ', error)
    }
  })

export const selectSingleImage = () =>
  new Promise(async (resolve, reject) => {
    ActionSheet.showActionSheetWithOptions(
      {
        options: Platform.OS === 'ios' ? BUTTONSiOS : BUTTONSandroid,
        cancelButtonIndex: CANCEL_INDEX,
        title: strings.chooseImagesFrom
      },
      async buttonIndex => {
        try {
          // if (buttonIndex === 0 || buttonIndex === 1) {
          //   await requestCameraPermission(buttonIndex);
          // }

          const imagePickerOptions = {
            compressImageQuality: 0.4,
            mediaType: 'photo',
            width: 300,
            height: 400,
            multiple: false,
            includeBase64: true
          }

          switch (buttonIndex) {
            case 0: {
              const pickedImage = await ImagePicker.openCamera(
                imagePickerOptions
              )
              resolve(pickedImage)
              break
            }
            case 1: {
              const pickedImage = await ImagePicker.openPicker(
                imagePickerOptions
              )
              resolve(pickedImage)
              break
            }
            case 2: {
              reject('Select Cancel')
              break
            }
            default: {
              reject('Select Cancel')
              break
            }
          }
        } catch (error) {
          reject(error)
          console.log('Image Picker Error: ', error)
        }
      }
    )
  })
export const selectMultipleImage = () =>
  new Promise(async (resolve, reject) => {
    ActionSheet.showActionSheetWithOptions(
      {
        options: Platform.OS === 'ios' ? BUTTONSiOS : BUTTONSandroid,
        cancelButtonIndex: CANCEL_INDEX,
        title: strings.chooseImagesFrom
      },
      async buttonIndex => {
        try {
          // if (buttonIndex === 0 || buttonIndex === 1) {
          //   await requestCameraPermission(buttonIndex);
          // }

          const imagePickerOptions = {
            compressImageQuality: 0.4,
            mediaType: 'photo',
            width: 300,
            height: 400,
            multiple: true,
            includeBase64: true
          }

          switch (buttonIndex) {
            case 0: {
              const pickedImage = await ImagePicker.openCamera(
                imagePickerOptions
              )
              resolve(pickedImage)
              break
            }
            case 1: {
              const pickedImage = await ImagePicker.openPicker(
                imagePickerOptions
              )
              resolve(pickedImage)
              break
            }
            case 2: {
              reject('Select Cancel')
              break
            }
            default: {
              reject('Select Cancel')
              break
            }
          }
        } catch (error) {
          reject(error)
          console.log('Image Picker Error: ', error)
        }
      }
    )
  })
export const AGE_LIMIT = new Date(
  moment().subtract(18, 'years').format('yyyy-MM-DD')
)

export function InitAnimation() {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true)
  }
}

export function ApplyEaseOutAnimation() {
  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
}

export function ShowGender(_gender) {
  return _gender === 1
    ? (
      <Image source={imagesPath.ic_female} />
    )
    : _gender === 2
      ? (
        <Image source={imagesPath.ic_male} />
      )
      : (
        <Image source={imagesPath.ic_transgender} />
      )
}

export const requestCameraAndAudioPermission = async () => {
  try {
    const granted = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.CAMERA,
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
    ])
    if (
      granted['android.permission.RECORD_AUDIO'] ===
      PermissionsAndroid.RESULTS.GRANTED &&
      granted['android.permission.CAMERA'] ===
      PermissionsAndroid.RESULTS.GRANTED
    ) {
      console.log('You can use the cameras & mic')
    } else {
      console.log('Permission denied')
    }
  } catch (err) {
    console.log(err)
  }
}

export function getCoordinatesFromAddress(address) {
  return new Promise((resolve, reject) => {
    Geocoder.from(address)
      .then(json => {
        const location = json.results[0].geometry.location
        resolve(location)
      })
      .catch(error => {
        reject(error)
      })
  })
}

export const GetAddressFromCoordinates = coords => {
  return new Promise((resolve, reject) => {
    Geocoder.from(coords?.latitude || coords?.lat, coords?.longitude || coords?.lng)
      .then(json => {
        console.log(json, 'GetAddressFromCoordinates')
        let address = json?.results[0]?.formatted_address

        console.log(address.split(' '), 'GetAddressFromCoordinates')

        const adrr = address.split(' ')

        if (adrr[0].includes('+')) {
          console.log('sklskslkslk')
          address = address.replace(adrr[0], '')
        }
        // console.log(json, 'GetAddressFromCoordinates')

        console.log(address, "addressaddressaddress");

        resolve(address)
      })
      .catch(error => {
        reject(error)
        console.log(error, 'errorerror')
      })
  })
}


export function openAppSetting(path) {
  if (Platform.OS === "ios") {
    Linking.openURL(`App-Prefs:${path}`);
  } else {
    Linking.openSettings();
  }
}

export { showError, showSuccess, ShowInfo }

// Function to format height for display
export const formatHeightForDisplay = (heightValue) => {
  if (!heightValue || heightValue === 0) return '0 ft 0 inches';
  
  const feet = Math.floor(heightValue);
  const inches = Math.round((heightValue - feet) * 12);
  
  if (inches === 12) {
    return `${feet + 1} ft 0 inches`;
  } else {
    return `${feet} ft ${inches} inches`;
  }
};

// Function to format height in compact format (5'11")
export const formatHeightCompact = (heightValue) => {
  if (!heightValue || heightValue === 0) return "0'0\"";
  
  const feet = Math.floor(heightValue);
  const inches = Math.round((heightValue - feet) * 12);
  
  if (inches === 12) {
    return `${feet + 1}'0"`;
  } else {
    return `${feet}'${inches}"`;
  }
};
