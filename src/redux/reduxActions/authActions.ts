import {
  BUY_STRIPE_SUBSCRIPTION,
  BUY_SUBSCRIPTION,
  CHECK_EMAIL,
  CHECK_USER_EXIST,
  CLEAR_NOTIFICATION,
  CREATE_FORGOT_PASSWORD,
  CREATE_NEW_PROFILE,
  FORGOT_PASSWORD_SEND_OTP,
  FORGOT_USERNAME,
  FORGOT_USER_DETAILS,
  GETKEYWORDS,
  GET_ADMIN_NOTI,
  GET_CITIES,
  GET_COUNTRIES,
  GET_CURRENT_VERSION,
  GET_DATING_TAGS,
  GET_MY_SENT_REQUESTS,
  GET_OCCUPATION_SUGGESTION,
  GET_PROFILE,
  GET_STATES,
  GET_STATIC_DATA,
  LOGIN_API,
  LOGOUT_API,
  RATING,
  SAVE_DATING_TAGS,
  CHECK_PHONE_NUMBER,
  SEND_OTP,
  SET_PREFERENCES,
  SOCAIL_LOGIN_API,
  SWIPE_BACK,
  TERMS_CONDITION_PRIVACY_POLICY,
  USER_NOTIFICATION,
  VERIFY_FACE,
  VERIFY_OTP_FORGOT_PASSWORD,
  VERIFY_OTP_FORGOT_USER_DETAILS,
  VERIFY_OTP_TO_SIGNUP,
} from '../../config/urls';
import { ApiError, showError } from '../../utils/helperFunctions';
import { apiGet, apiPost, clearAsyncStorage, clearLoginPin, clearUserData, getUserData, removeItem, setUserData } from '../../utils/utils';
// import { configureZegoCloud, removeZegoCloud } from '../../utils/zegoConfigureFile';
import {
  onBoard,
  saveFcmToken,
  saveFilterAddress,
  saveHomeData,
  saveIsIdle,
  saveLiveLocationCoords,
  saveLoginData,
  saveLoginPin,
  saveNotificationCount,
  saveUserData,
} from '../reduxReducers/authReducers';
import store from '../store';
import RNRestart from "react-native-restart";
import { saveCurrentIndex, updateLocationApi } from './homeActions';
import { configureZegoCloud } from '../../utils/zegoConfigureFile';

const { dispatch } = store;

export const getCountry = () => {
  return apiGet(GET_COUNTRIES);
};
export const saveOnBoardData = (data: boolean) => {
  dispatch(onBoard(data));
};

export const saveFcmTokenToRedux = (data: any) => {
  dispatch(saveFcmToken(data));
};

export const saveUserDataToStore = (data: any) => {
  dispatch(saveUserData(data));
};

export const saveLoginPinToStore = (data: any) => {
  dispatch(saveLoginPin(data));
};

export const saveLoginToStore = (data: any) => {
  dispatch(saveLoginData(data));
};

export const saveProfileSetupDoneToStore = (data: any) => {
  dispatch(saveLoginData(data));
};

export const saveAddressFilter = (data: any) => {
  dispatch(saveFilterAddress(data));
};

export const saveAllHomeData = (data: any) => {
  dispatch(saveHomeData(data));
};
export const saveCountNotification = (data: any) => {
  dispatch(saveNotificationCount(data));
};

export const saveIdleData = (data: any) => {
  dispatch(saveIsIdle(data));
};

export const saveLiveLocationCoordsToStore = (data: any) => {
  getUserData().then((res) => {
    if (res?.token) {
      updateLocationApi(data);
    }
  })
  dispatch(saveLiveLocationCoords(data));
};



export const getStates = (data: object, headers = {}) => {
  return new Promise((resolve, reject) => {
    apiPost(GET_STATES, data, headers)
      .then(res => {
        resolve(res);
        console.log(res, 'GET STATES RESPONSE HERE++++');
      })
      .catch(error => {
        reject(error);
        console.log(error, 'GET STATES ERROR');
      });
  });
};

export const getCities = (data: object, headers = {}) => {
  return new Promise((resolve, reject) => {
    apiPost(GET_CITIES, data, headers)
      .then(res => {
        resolve(res);
        console.log(res, 'GET CITIES RESPONSE HERE++++');
      })
      .catch(error => {
        reject(error);
        console.log(error, 'GET CITIES ERROR');
      });
  });
};

export const keywordsData = () => {
  return new Promise((resolve, reject) => {
    apiGet(GETKEYWORDS)
      .then(res => {
        resolve(res);
        console.log(res, 'GETKEYWORDS API DATA HERE>>>>>');
      })
      .catch(error => {
        reject(error);
        console.log(error, 'GETKEYWORDS API ERROR HERE>>>>>');
      });
  });
};

export const swipeBack = () => {
  return new Promise((resolve, reject) => {
    apiGet(SWIPE_BACK)
      .then(res => {
        resolve(res);
        console.log(res, 'SWIPEBACK API DATA HERE>>>>>');
      })
      .catch(error => {
        reject(error);
        console.log(error, 'SWIPEBACK API ERROR HERE>>>>>');
      });
  });
};

export const getUserProfile = () => {
  return new Promise((resolve, reject) => {
    apiGet(GET_PROFILE)
      .then(res => {
        getUserData().then(response => {
          // if(userData?.subscription === null){
          //   userData = {...userData, subscription: {
          //     subscription_id: 1,
          //     swipes_left: '9',
          //     likes_left: '3',
          //     subscription_type: '1 month'
          //   }}
          // }

          let userData = res?.data
          userData.token = response.token
          // console.log(userData, 'responsesadasdasdasdasdasd34234');
          setUserData(userData).then(() => {
            saveUserDataToStore(userData);
          });
        });
        resolve(res);
      })
      .catch(error => {
        reject(error);
        console.log(error, 'getting profile ===>>>>>>>');
      });
  });
};

export const buyStripe = (data: any) => {
  return new Promise((resolve, reject) => {
    apiPost(BUY_STRIPE_SUBSCRIPTION, data)
      .then(res => {
        resolve(res);
        getUserData().then(response => {
          let userData = { ...response, ...res?.data };
          console.log(userData, 'response jljlkjlkjlkjlkjlkj');
          setUserData(userData).then(() => {
            saveUserDataToStore(userData);
          });
        });
        setTimeout(() => {
          resolve(res);
        }, 500);
      })
      .catch(error => {
        reject(error);
        console.log(error, 'GET SUBSCRIPTION API DATA HERE>>>>>');
      });
  });
};

export const buySubscription = (data: any) => {
  const headers = {
    "content-type": "multipart/form-data",
  };
  return new Promise((resolve, reject) => {
    console.log("inapp-subscription req", JSON.stringify(data));

    apiPost(BUY_SUBSCRIPTION, data)
      .then(res => {
        console.log("inapp-subscription res", JSON.stringify(res));
        resolve(res);
        // getUserData().then(response => {
        //   let userData = { ...response, ...res?.data };
        //   console.log(userData, 'response jljlkjlkjlkjlkjlkj');
        //   setUserData(userData).then(() => {
        //     saveUserDataToStore(userData);
        //   });
        // });
        setTimeout(() => {
          resolve(res);
        }, 1500);
      })
      .catch(error => {
        reject(error);
        console.log(error, 'GET SUBSCRIPTION API DATA HERE>>>>>123');
      });
  });
};

////////
export const loginApi = (apiPayload: object) => {
  return new Promise((resolve, reject) => {
    apiPost(LOGIN_API, apiPayload)
      .then(res => {
        configureZegoCloud({
          id: String(res?.data?.id),
          user_name: res?.data?.user_name || 'Encountr',
        });
        // configureZegoCloud({
        //   id: String(res?.data?.id),
        //   user_name: res?.data?.user_name || "Bonkers"
        // }).then(() => {
        //   setUserData(res?.data).then(() => {
        //     resolve(res);
        //     saveUserDataToStore(res?.data);
        //   }).catch(error => {
        //     reject(error);
        //   });
        // })

        var userData = res?.data;
        if (res?.data?.subscription === null) {
          userData = {
            ...userData, subscription: {
              subscription_id: 1,
              swipes_left: '9',
              likes_left: '3',
              subscription_type: '1 month'
            }
          }
        }

        console.log(userData, 'userdata ==>>>>>>>>>')

        setUserData(userData).then(() => {
          resolve(res);

          saveUserDataToStore(userData);
        }).catch(error => {
          reject(error);
        });

        // setUserData(res?.data).then(() => {
        //   resolve(res);
        //   saveUserDataToStore(res?.data);
        // }).catch(error => {
        //   reject(error);
        // });
      }).catch(error => {
        reject(error);
      });
  });
};

/////
export const logoutApi = () => {
  // removeItem('FCM_TOKEN')
  removeItem('walksafeUserData')
  saveLoginToStore(false)
  saveLoginPinToStore(null)
  clearLoginPin()
  saveCurrentIndex(0)
  return new Promise((resolve, reject) => {
    apiPost(LOGOUT_API)
      .then(res => {
        setUserData({}).then(() => {
          saveUserDataToStore({});
          clearUserData()
          // removeZegoCloud()
          RNRestart.Restart()
        });
        resolve(res);
      })
      .catch(error => {
        setUserData({}).then(() => {
          saveUserDataToStore({});
        });
        reject(error);
      });
  });
};


export const ratingsApi = (apiPayload: object) => {
  return new Promise((resolve, reject) => {
    apiPost(RATING, apiPayload)
      .then(res => {
        resolve(res);
      })
      .catch(error => {
        reject(error);
      });
  });
};


export const checkPhoneNumberApi = (apiPayload: object) => {
  return new Promise((resolve, reject) => {
    apiPost(CHECK_PHONE_NUMBER, apiPayload)
      .then(res => {
        if (res?.success === false) {
          return reject(res);
        }
        resolve(res);
      })
      .catch(error => {
        reject(error);
      });
  });
};

export const sendOtpApi = (apiPayload: object) => {
  return new Promise((resolve, reject) => {
    checkPhoneNumberApi(apiPayload)
      .then(() => apiPost(SEND_OTP, apiPayload))
      .then(res => {
        if (res?.success === false) {
          return reject(res);
        }
        resolve(res);
      })
      .catch(error => {
        reject(error);
      });
  });
};

///////
export const verifyOtpToSignupApi = (apiPayload: object) => {
  return new Promise((resolve, reject) => {
    apiPost(VERIFY_OTP_TO_SIGNUP, apiPayload)
      .then(res => {
        resolve(res);
      })
      .catch(error => {
        reject(error);
      });
  });
};

//////////
export const checkUserNameApi = (apiPayload: object) => {
  return new Promise((resolve, reject) => {
    apiPost(CHECK_USER_EXIST, apiPayload)
      .then(res => {
        console.log("user details", JSON.stringify(res))
        resolve(res);
      })
      .catch(error => {
        reject(error);
      });
  });
};

////////
export const createNewProfileApi = (apiPayload: object) => {
  return new Promise((resolve, reject) => {
    apiPost(CREATE_NEW_PROFILE, apiPayload)
      .then((res: any) => {

        // configureZegoCloud({
        //   id: String(res?.id),
        //   user_name: res?.user_name || "Bonkers"
        // })

        setUserData(res.data).then((saved: any) => {
          configureZegoCloud({
            id: String(res.data?.id),
            user_name: res.data?.user_name || 'Encountr',
          })
          saveUserDataToStore(res?.data);
          setTimeout(() => {
            resolve(res);
          }, 300);
        });
      })
      .catch((error: any) => {
        reject(error);
      });
  });
};

export const forgotPasswordSendOtp = (apiPayload: object) => {
  return new Promise((resolve, reject) => {
    apiPost(FORGOT_PASSWORD_SEND_OTP, apiPayload)
      .then(res => {
        resolve(res);
      })
      .catch(error => {
        reject(error);
      });
  });
};

export const getOccupationSuggestions = (apiPayload: object) => {
  return new Promise((resolve, reject) => {
    apiPost(GET_OCCUPATION_SUGGESTION, apiPayload)
      .then(res => {
        resolve(res);
      })
      .catch(error => {
        reject(error);
      });
  });
};

export const getLoginDetailsSendOtp = (apiPayload: object) => {
  return new Promise((resolve, reject) => {
    apiPost(FORGOT_USER_DETAILS, apiPayload)
      .then(res => {
        resolve(res);
      })
      .catch(error => {
        reject(error);
      });
  });
};

export const verifyOtpForgotPassword = (apiPayload: object) => {
  return new Promise((resolve, reject) => {
    apiPost(VERIFY_OTP_FORGOT_PASSWORD, apiPayload)
      .then(res => {
        resolve(res);
      })
      .catch(error => {
        reject(error);
      });
  });
};

export const verifyOtpGetLoginDetails = (apiPayload: object) => {
  return new Promise((resolve, reject) => {
    apiPost(VERIFY_OTP_FORGOT_USER_DETAILS, apiPayload)
      .then(res => {
        resolve(res);
      })
      .catch(error => {
        reject(error);
      });
  });
};

export const createForgotPasswordApi = (apiPayload: object) => {
  return new Promise((resolve, reject) => {
    apiPost(CREATE_FORGOT_PASSWORD, apiPayload)
      .then(res => {
        resolve(res);
      })
      .catch(error => {
        reject(error);
      });
  });
};

export const setPreferances = (apiPayload: object) => {
  return new Promise((resolve, reject) => {
    apiPost(SET_PREFERENCES, apiPayload)
      .then(res => {
        getUserData().then(response => {
          let userData = { ...response, ...res?.data?.data, filters: apiPayload };
          console.log(userData, 'response');
          setUserData(userData).then(() => {
            saveUserDataToStore(userData);
          });
        });
        setTimeout(() => {
          resolve(res);
        }, 500);
      })
      .catch(error => {
        reject(error);
      });
  });
};

export const termsAndConditionApi = (apiPayload: object) => {
  return new Promise((resolve, reject) => {
    apiGet(TERMS_CONDITION_PRIVACY_POLICY + `?${apiPayload?.type}`)
      .then(res => {
        resolve(res);
      })
      .catch(error => {
        reject(error);
      });
  });
};

export const checkEmailApi = (apiPayload: object) => {
  return new Promise((resolve, reject) => {
    apiPost(CHECK_EMAIL, apiPayload)
      .then(res => {
        resolve(res);
      })
      .catch(error => {
        reject(error);
      });
  });
};

export const getDatingTags = () => {
  return new Promise((resolve, reject) => {
    apiGet(GET_DATING_TAGS)
      .then(res => {
        resolve(res);
      })
      .catch(error => {
        reject(error);
      });
  });
};

export const getCurrentVersion = () => {
  return new Promise((resolve, reject) => {
    apiGet(GET_CURRENT_VERSION)
      .then(res => {
        resolve(res);
      })
      .catch(error => {
        reject(error);
      });
  });
};

export const saveDatingTagsApi = (apiPayload: object) => {
  let headers = { 'Content-Type': 'multipart/form-data' };
  return new Promise((resolve, reject) => {
    apiPost(SAVE_DATING_TAGS, apiPayload, headers)
      .then(res => {
        resolve(res);
      })
      .catch(error => {
        reject(error);
      });
  });
};

export const verifyFaceApi = (apiPayload: object) => {
  return new Promise((resolve, reject) => {
    apiPost(VERIFY_FACE, apiPayload)
      .then(res => {
        resolve(res)
        // getUserData()
        //   .then(cb => {
        //     let userData = cb;
        //     userData.token = cb.token;
        //     userData.is_profile_verified = 1;

        //     setUserData(userData).then(() => {
        //       saveUserDataToStore(userData);
        //       setTimeout(() => {
        //         resolve(res);
        //       }, 500);
        //     });
        //   })
        //   .catch(() => {
        //     setTimeout(() => {
        //       resolve(res);
        //     }, 500);
        //   });
      })
      .catch(error => {
        reject(error);
      });
  });
};


export const getNotifications = () => {
  return new Promise((resolve, reject) => {
    // apiGet(GET_ADMIN_NOTI)
    apiGet(USER_NOTIFICATION)
      .then(res => {
        resolve(res);
        console.log(res, 'GET_ADMIN_NOTI API DATA HERE>>>>>');
      })
      .catch(error => {
        reject(error);
        console.log(error, 'GET_ADMIN_NOTI API ERROR HERE>>>>>');
      });
  });
};
export const clearNotifications = () => {
  return new Promise((resolve, reject) => {
    // apiGet(GET_ADMIN_NOTI)
    apiGet(CLEAR_NOTIFICATION)
      .then(res => {
        resolve(res);
        console.log(res, 'GET_ADMIN_NOTI API DATA HERE>>>>>');
      })
      .catch(error => {
        reject(error);
        console.log(error, 'GET_ADMIN_NOTI API ERROR HERE>>>>>');
      });
  });
};

export const forgotUsername = (data: object, headers = {}) => {
  return new Promise((resolve, reject) => {
    apiPost(FORGOT_USERNAME, data, headers)
      .then(res => {
        resolve(res);
        console.log(res, 'GET STATES RESPONSE HERE++++');
      })
      .catch(error => {
        reject(error);
        console.log(error, 'GET STATES ERROR');
      });
  });
};

export const socailLogin = (data: any, headers = {}) => {
  return new Promise((resolve, reject) => {
    apiPost(SOCAIL_LOGIN_API, data, headers)
      .then((res) => {
        resolve(res);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

export const getMySentRequests = (page = 1, perPage = 10) => {
  return new Promise((resolve, reject) => {
    const url = `${GET_MY_SENT_REQUESTS}?page=${page}&per_page=${perPage}`;
    apiGet(url)
      .then(res => {
        resolve(res);
        console.log(res, 'GET_MY_SENT_REQUESTS API DATA HERE>>>>>');
      })
      .catch(error => {
        reject(error);
        console.log(error, 'GET_MY_SENT_REQUESTS API ERROR HERE>>>>>');
      });
  });
};

export const getStaticDataApi = () => {
  return new Promise((resolve, reject) => {
    apiGet(GET_STATIC_DATA)
      .then(res => {
        resolve(res);
        console.log(res, 'GET_STATIC_DATA API DATA HERE>>>>>');
      })
      .catch(error => {
        reject(error);
        console.log(error, 'GET_STATIC_DATA API ERROR HERE>>>>>');
      });
  });
};