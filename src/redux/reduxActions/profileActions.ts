import { CHANGE_NOTIFICATION, CHANGE_PASSWORD, CHANGE_USER_TYPE, GET_BLOCKED_USERS, HIDE_PROFILE, STRIPE_ENDPOINT, UPDATE_PROFILE } from "../../config/urls"
import { apiGet, apiPost, getUserData, setUserData } from "../../utils/utils"
import { saveUserDataToStore } from "./homeActions"

export const updateProfileApi = (apiPayload: object) => {
    return new Promise((resolve, reject) => {
        apiPost(UPDATE_PROFILE, apiPayload)
            .then((res) => {
                getUserData().then(cb => {
                    let userData = res?.data
                    userData.token = cb.token
                    userData.jwt_token = cb.jwt_token
                    userData.profile_image = cb.profile_image
                    userData.profile_image_array = cb?.profile_image_array || []

                    setUserData(userData).then(() => {
                        saveUserDataToStore(userData);
                        setTimeout(() => {
                            resolve(res)
                        }, 500);
                    });
                })
            }).catch((error) => {
                reject(error)
            })
    })
}

export const changePasswordApi = (apiPayload: object) => {
    return new Promise((resolve, reject) => {
        apiPost(CHANGE_PASSWORD, apiPayload)
            .then((res) => {
                resolve(res)
            }).catch((error) => {
                reject(error)
            })
    })
}

export const stripeEndpointApi = (apiPayload: object) => {
    return new Promise((resolve, reject) => {
      apiPost(STRIPE_ENDPOINT, apiPayload)
        .then((res) => {
          resolve(res);
        })
        .catch((error) => {
          reject(error);
        });
    });
  };

export const changeUserTypeApi = (apiPayload: object) => {
    return new Promise((resolve, reject) => {
        apiPost(CHANGE_USER_TYPE, apiPayload)
            .then((res) => {
                getUserData().then(cb => {

                    let userData = cb
                    // userData.token = cb.token
                    userData.profile_image = cb.profile_image
                    userData.profile_image_array = cb?.profile_image_array || []
                    userData.user_type = res?.data?.user_type

                    setUserData(userData).then(() => {
                        saveUserDataToStore(userData);
                        setTimeout(() => {
                            resolve(res)
                        }, 0);
                    });
                })
            }).catch((error) => {
                reject(error)
            })
    })
}

export const getAllBlockedUsersApi = () => {
    return new Promise((resolve, reject) => {
        apiGet(GET_BLOCKED_USERS)
            .then((res) => {
                resolve(res)
            }).catch((error) => {
                reject(error)
            })
    })
}

export const changeNotificationApi = (apiPayload: object) => {
    return new Promise((resolve, reject) => {
        apiPost(CHANGE_NOTIFICATION, apiPayload)
            .then((res) => {
                console.log(res,"resresresresresresres");
                
                getUserData().then(cb => {
                    
                    let userData = cb
                    userData.token = cb.token
                    userData.isNotified = res?.data?.isNotified

                    setUserData(userData).then(() => {
                        saveUserDataToStore(userData);
                        setTimeout(() => {
                            resolve(res)
                        }, 0);
                    });
                })
            }).catch((error) => {
                reject(error)
            })
    })
}

export const changeHideProfileApi = (apiPayload: object) => {
    return new Promise((resolve, reject) => {
        apiPost(HIDE_PROFILE, apiPayload)
            .then((res) => {
                console.log(res,"resresresresresresres");
                
                getUserData().then(cb => {
                    let userData = cb
                    userData.token = cb.token
                    userData.is_profile_hidden= res?.data?.is_profile_hidden

                    setUserData(userData).then(() => {
                        saveUserDataToStore(userData);
                        setTimeout(() => {
                            resolve(res)
                        }, 0);
                    });
                })
            }).catch((error) => {
                reject(error)
            })
    })
}