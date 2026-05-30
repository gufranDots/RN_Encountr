import { appleAuth } from '@invertase/react-native-apple-authentication';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { NativeModules } from 'react-native';
import { AccessToken, AuthenticationToken, GraphRequest, GraphRequestManager, LoginManager, Profile } from 'react-native-fbsdk-next';
// import {
//   GraphRequest,
//   GraphRequestManager,
//   LoginManager,
// } from 'react-native-fbsdk-next';
// import {socialKeys} from './constants/DynamicAppKeys';
const { RNTwitterSignIn } = NativeModules;
// export const googleLogin = async () => {
//   GoogleSignin.configure();
//   try {
//     // await GoogleSignin.hasPlayServices()
//     // await GoogleSignin.revokeAccess();
//     await GoogleSignin.signOut();
//     const userInfo = await GoogleSignin.signIn();
//     return userInfo;
//   } catch (error) {
//     if (error.code === statusCodes.SIGN_IN_CANCELLED) {
//       console.log('SIGN_IN_CANCELLED');
//       return error;
//     } else if (error.code === statusCodes.IN_PROGRESS) {
//       console.log('IN_PROGRESS');
//       return error;
//     } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
//       console.log('PLAY_SERVICES_NOT_AVAILABLE');
//       return error;
//     } else {
//       console.log(error, 'error in gmail');
//       return error;
//     }
//   }
// };

export const googleLogin = async () => {
  GoogleSignin.configure();
  try {
    await GoogleSignin.signOut();
    const userInfo = await GoogleSignin.signIn();
    return userInfo;
  } catch (error) {
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      console.log('SIGN_IN_CANCELLED');
    } else if (error.code === statusCodes.IN_PROGRESS) {
      console.log('IN_PROGRESS');
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      console.log('PLAY_SERVICES_NOT_AVAILABLE');
    } else {
      console.log(error, 'error in gmail');
    }
    return error;
  }
};

//FaceBook Login
// export const fbLogin = async (resCallback) => {

//   try {
//     const result = await LoginManager.logInWithPermissions(
//       [
//         "public_profile",
//         "email",
//       ],
//     );
//     console.log(result.grantedPermissions.toString(), "resultresultresult FB result");
//     if (Platform.OS === "ios") {
//       const result = await AuthenticationToken.getAuthenticationTokenIOS();
//       console.log(result?.authenticationToken);
//     } else {
//       const result = await AccessToken.getCurrentAccessToken();
//       console.log(result?.accessToken, "result FB token");
//       const currentProfile = Profile.getCurrentProfile().then(
//         function (currentProfile) {
//           if (currentProfile) {
//             console.log(currentProfile, "currentProfile of FB profile")
//           }
//         })
//     }
//   } catch (error) {
//     console.log(error, "errorerrorerror FB Error");
//   }

// };





export const fbLogin = () => {
  return new Promise(async (resolve, reject) => {
    try {
      // Request Facebook login permissions
      const loginResult = await LoginManager.logInWithPermissions([
        "public_profile",
        "email",
      ]);

      console.log(
        loginResult.grantedPermissions?.toString(),
        "Granted Permissions"
      );

      if (loginResult.isCancelled) {
        console.log("Login cancelled by user");
        return;
      }

      if (Platform.OS === "ios") {
        // Fetch Authentication Token for iOS
        const authToken = await AuthenticationToken.getAuthenticationTokenIOS();
        console.log(authToken?.authenticationToken, "iOS Authentication Token");

        if (authToken) {
          const currentProfile = await Profile.getCurrentProfile();
          console.log(currentProfile, "Facebook Profile Info");
          resolve(currentProfile);
        } else {
          reject("Unable to fetch iOS authentication token");
        }
      } else {
        // Fetch Access Token for Android
        const accessToken = await AccessToken.getCurrentAccessToken();
        console.log(accessToken?.accessToken, "Android Access Token");

        if (accessToken) {
          const currentProfile = await Profile.getCurrentProfile();
          resolve(currentProfile)
          if (currentProfile) {
            console.log(currentProfile, "Facebook Profile Info");
          }
        }else{
          reject("unable to find ")
        }
      }
    } catch (error) {
      console.error(error, "Facebook Login Error");
      reject(error);
    }
  })
};





//Apple Login
export const handleAppleLogin = async () => {
  return await new Promise(async (resolve, reject) => {
    try {
      const checkAppleSupport = appleAuth.isSupported;
      if (checkAppleSupport) {
        const appleAuthRequestResponse = await appleAuth.performRequest({
          requestedOperation: appleAuth.Operation.LOGIN,
          requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
        });
        //   /!\ This method must be tested on a real device. On the iOS simulator it always throws an error.
        const credentialState = await appleAuth.getCredentialStateForUser(
          appleAuthRequestResponse.user,
        );

        // use credentialState response to ensure the user is authenticated
        if (credentialState === appleAuth.State.AUTHORIZED) {
          console.log('checking apple login >>> ', appleAuthRequestResponse);
          // user is authenticated
          resolve(appleAuthRequestResponse);
        } else {
          reject(credentialState);
        }
      } else {
        reject('Apple login is not supproted to this device');
      }
    } catch (error) {
      reject(error);
    }
  });
};

export const _twitterSignIn = async () => {
  // RNTwitterSignIn.logOut();
  let data;
  await new Promise((resolve, reject) => {
    RNTwitterSignIn.logIn()
      .then(loginData => {
        data = loginData;
        resolve(loginData);
      })
      .catch(error => {
        reject(error);
      });
  });
  return data;
};
const socialKeys = {
  TWITTER_COMSUMER_KEY: 'R66DHARfuoYAPowApUxNxwbPi',
  TWITTER_CONSUMER_SECRET: 'itcicJ7fUV3b73B8V05GEDBo4tzxGox2Si2q0BCk5pue327k15',
};
