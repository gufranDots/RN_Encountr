import { Alert, PermissionsAndroid, Platform } from 'react-native'
import { openSettings, request, PERMISSIONS, RESULTS, checkMultiple, requestMultiple } from 'react-native-permissions'
import strings from '../constants/Languages'
import { logoutApi } from '../redux/reduxActions/authActions'

import { getCurrentLocation, openAppSetting, showError } from './helperFunctions'

export const checkLocationSevice = async () => {
  if (Platform.OS === 'android') {
    return new Promise(async (resolve, reject) => {
      const permissionAndroid = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION)
      if (permissionAndroid === 'never_ask_again') {
        Alert.alert(
          'Please Enable Location',
          '',
          [
            {
              text: 'Open Setting',
              onPress: () => openSettings().catch(() => {
                showError('Failed open settings')
                return reject('FAILED')
              })
            },
            {
              text: 'Cancel',
              onPress: () => {
                showError('Please Enable your Location')
                return reject('FAILED')
              }
            }
          ],
          { cancelable: true }
        )
      } else if (permissionAndroid === 'granted') {
        const coords = await getCurrentLocation()
        if (coords) {

          return resolve(coords, 'SUCCESS')
        } else {
          showError('Please Enable your Location')
          return reject('FAILED')
        }
      } else if (permissionAndroid === 'denied') {
        showError('Please Enable your Location')
        return reject('FAILED')
      }
    })
  } else {
    return new Promise(async (resolve, reject) => {
      await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE).then(async (result) => {
        // console.log(result, 'resultresultresultresultresult')

        // await check(
        //   PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
        // )
        //   .then(async (result) => {
            // console.log("lplplp", result);

            switch (result) {
              case RESULTS.UNAVAILABLE:
                showError('This feature is not available (on this device / in this context)')
                break
              case RESULTS.DENIED:
                console.log('The permission has not been requested / is denied but requestable')
                request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE).then(async (result) => {
                  console.log(result, '<==PERMISSIONS.IOS.LOCATION_WHEN_IN_USE')
                  if (result === 'granted') {
                    const coords = await getCurrentLocation()
                    if (coords) {
                      return resolve(coords, 'SUCCESS')
                    } else {
                      showError('Please Enable your Location')
                      return reject('FAILED')
                    }
                  }
                })
                break

              case RESULTS.LIMITED:
                console.log('The permission is limited: some actions are possible')

                const coordss = await getCurrentLocation()
                console.log("gufrannnnnn===>>>", coords);
                if (coordss) {
                  return resolve(coordss)
                } else {
                  showError('Please Enable your Location')
                  return reject('FAILED')
                }
              case RESULTS.GRANTED:
                const coords = await getCurrentLocation()

                if (coords) {
                  return resolve(coords)
                } else {
                  showError('Please Enable your Location')
                  return reject('FAILED')
                }
              case RESULTS.BLOCKED:

                const cords = {
                  latitude: 30.7191,
                  latitudeDelta: 0.0922,
                  longitude: 76.8103,
                  longitudeDelta: 0.0421
                }
                resolve(cords)
                break
            }
          // }
          // )
      }
      )
    }
    )
  }
}


export const requestCameraPermission = async type =>
  new Promise(async (resolve, reject) => {
    if (Platform.OS === 'ios') {
      await requestMultiple([
        PERMISSIONS.IOS.CAMERA,
        PERMISSIONS.IOS.PHOTO_LIBRARY,
      ])
        .then(async statuses => {
          console.log(statuses, 'statuses');
          const cameraPermission = statuses[PERMISSIONS.IOS.CAMERA];
          const photoLibPermission = statuses[PERMISSIONS.IOS.PHOTO_LIBRARY];

          console.log(cameraPermission, 'cameraPermission');
          console.log(photoLibPermission, 'photoLibPermission');

          await checkMultiple([
            PERMISSIONS.IOS.CAMERA,
            PERMISSIONS.IOS.PHOTO_LIBRARY,
          ]).then(async statuses => {
            console.log(statuses, 'statuses');
            const cameraPermission = statuses[PERMISSIONS.IOS.CAMERA];
            const photoLibPermission = statuses[PERMISSIONS.IOS.PHOTO_LIBRARY];

            console.log(cameraPermission, 'cameraPermission');
            console.log(photoLibPermission, 'photoLibPermission');

            if (cameraPermission == 'denied') {
              await requestIOSCameraPermission();
            } else if (photoLibPermission == 'denied') {
              await requestIOSCameraPermission();
            } else if (cameraPermission == 'blocked') {
              _openSettingsToCameraFiles('Please allow camera permission.');
            } else if (photoLibPermission == 'blocked') {
              _openSettingsToCameraFiles('Please allow photo permission.');
            }
            // else if (cameraPermission == "limited") {
            //     _openSettingsToCameraFiles("Please allow camera permission.")
            // } else if (photoLibPermission == "limited") {
            //     _openSettingsToCameraFiles("Please allow photo permission.")
            // }
            else {
              return resolve();
            }

            /// ////////////////////////////////////

            // if (type == 0) {
            //     if (cameraPermission == "blocked" || cameraPermission == "limited") {
            //         Alert.alert(
            //             "Permission Blocked",
            //             "Please enable Camera permission from setting.",
            //             [
            //                 {
            //                     text: "Open Setting",
            //                     onPress: () => openSettings().catch(() => showError("Can't open setting.")),
            //                 },
            //                 {
            //                     text: strings.cancel,
            //                 }
            //             ],
            //             { cancelable: true }
            //         )
            //     } else if (cameraPermission == "denied") {
            //         requestIOSCameraPermission()
            //     }
            // } else {
            //     if (photoLibPermission == "blocked" || photoLibPermission == "limited") {
            //         Alert.alert(
            //             "Permission Blocked",
            //             "Please enable Photo Liberary permission from setting.",
            //             [
            //                 {
            //                     text: "Open Setting",
            //                     onPress: () => openSettings().catch(() => showError("Can't open setting.")),
            //                 },
            //                 {
            //                     text: strings.cancel,
            //                 }
            //             ],
            //             { cancelable: true }
            //         )
            //     } else if (photoLibPermission == "denied") {
            //         requestIOSCameraPermission()
            //     }
            // }
          });
        })
        .catch(error => {
          console.log(error, 'PERMISSIONS.IOS ERror');
          return reject();
        });
    } else {
      return PermissionsAndroid.requestMultiple([
        PERMISSIONS.ANDROID.CAMERA,
        // PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
        // PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE
      ])
        .then(grantedResponse => {
          const cameraPermission = grantedResponse['android.permission.CAMERA'];
          // const readExtStoragePermission = grantedResponse['android.permission.READ_EXTERNAL_STORAGE']
          // const writeExtStoragePermission = grantedResponse['android.permission.WRITE_EXTERNAL_STORAGE']

          console.log(grantedResponse, 'grantedResponse');
          // if (cameraPermission == "granted") {

          // } else if (readExtStoragePermission == "granted") {

          // } else if (writeExtStoragePermission == "granted") {

          // } else
          if (cameraPermission == 'never_ask_again') {
            _openSettingsToCameraFiles(
              'Please allow camera permission to to capture images.',
            );
          } else if (cameraPermission == 'denied') {
            const camPermission = _requestAndroidCameraPermission();
            console.log(camPermission, 'camPermission');
          } else {
            return resolve();
          }
          // return resolve();
        })
        .catch(error => {
          console.log('Ask Camera permission error: ', error);
          return reject(error);
        });
    }
  });

const _openSettingsToCameraFiles = (label) => {
  Alert.alert(
    'Permission Blocked',
    label,
    [
      {
        text: 'Open Setting',
        onPress: () => openSettings().catch(() => showError("Can't open setting."))
      },
      {
        text: strings.cancel
      }
    ],
    { cancelable: true }
  )
}

const requestIOSCameraPermission = async () => new Promise(async (resolve, reject) => {
  return await requestMultiple([PERMISSIONS.IOS.CAMERA, PERMISSIONS.IOS.PHOTO_LIBRARY])
})

const _requestAndroidCameraPermission = async () => new Promise(async (resolve, reject) => {
  console.log('Requesting...   requestAndroidCameraPermission')
  return await PermissionsAndroid.requestMultiple([
    PermissionsAndroid.PERMISSIONS.CAMERA,
    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
  ])
})

export const AskVoicePermission = async () => {
  if (Platform.OS === 'android') {
    try {
      const grants = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
      ])

      console.log('write external stroage', grants)

      if (
        grants['android.permission.WRITE_EXTERNAL_STORAGE'] ===
        PermissionsAndroid.RESULTS.GRANTED &&
        grants['android.permission.READ_EXTERNAL_STORAGE'] ===
        PermissionsAndroid.RESULTS.GRANTED &&
        grants['android.permission.RECORD_AUDIO'] ===
        PermissionsAndroid.RESULTS.GRANTED
      ) {
        console.log('Permissions granted')
      } else {
        console.log('All required permissions not granted')
        return
      }
    } catch (err) {
      console.log(err)
    }
  }
}

export const CheckLocationForSession = () => {
  if (Platform.OS === 'android') {
    return new Promise(async (resolve, reject) => {
      const permissionAndroid = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION)
      if (permissionAndroid === 'never_ask_again') {
        showError('Please enable your location from settings to continue.')
        logoutApi()
      } else if (permissionAndroid === 'denied') {
        showError('Please enable your location from settings to continue.')
        logoutApi()
      }
    })
  } else {
    return new Promise(async (resolve, reject) => {
      await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE).then(async (result) => {
        // console.log(result, 'resultresultresultresultresult')

        await check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE)
          .then(async (result) => {
            switch (result) {
              case RESULTS.UNAVAILABLE:
                showError('Please enable your location from settings to continue.')
                logoutApi()
                break
              case RESULTS.DENIED:
                showError('Please enable your location from settings to continue.')
                logoutApi()
                break
              case RESULTS.BLOCKED:
                showError('Please enable your location from settings to continue.')
                logoutApi()
                break
            }
          })
      })
    })
  }
}
