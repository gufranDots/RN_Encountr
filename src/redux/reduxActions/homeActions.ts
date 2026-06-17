import {
    ADD_TO_FAVOURITE,
    CHANGE_PASSWORD, DELETE_ACCOUNT,
    DELETE_PROFILE_MEDIA_IMAGE,
    DISCOVER, GET_ADVERTISEMENT, GET_COUNTRIES, LIKE_ADVERTISEMENT, MATCH_USER_LIST, REFRESH_APP, SAVE_IMAGE, SEND_REQUESTS,
    SET_BONKERS_FILTERS,
    SET_BONK_FILTERS,
    UPDATE_LOCATION,
    UPDATE_PROFILE,
    UPDATE_VIEW_PROFILE_ID,
    UPLOAD_PROFILE_MEDIA,
    UPLOAD_PROFILE_PIC,
    UPLOAD_VOICE_MESSAGE,
    DELETE_VOICE_MESSAGE,
    USERS_CHAT_LISTING, WHO_LIKE_ME,
    INCOGNITO_MODE,
    GROUP_CHAT_CONVERSATION,
    CREATE_NEWGROUP_MEMBERS,
    BOOM_PLAN_DETAILS,
    BOOM_CHECKOUT_PLAN,
    CHAT_MESSAGES_DELETE,
    CHANGE_LOCATION_STATUS,
    FRESH_USERS,
    STOP_LOCATION,
    EDIT_FAVOURITE_TEXT,
    CHANGE_WEIGHT_STATUS,
    GRANT_PRIVATE_GALLERY_ACCESS,
    REMOVE_PRIVATE_GALLERY_ACCESS,
    GET_CHAT_COUNT,
    GET_SUPPORT_DATA,
    GET_MEMEBER_LIST
} from '../../config/urls';
import {
    apiDelete,
    apiGet,
    apiPost,
    getUserData,
    setUserData
} from '../../utils/utils';
import {
    saveIndex,
    saveUserData
} from '../reduxReducers/authReducers';
import { saveShowHomeTutorial, saveUserCurrentLocation, saveViewedProfile, weightStatus, updateChatCount,
    locationStatus,
    // accordingStatus,
    
} from '../reduxReducers/homeReducers';
import store from '../store';
import { GroupMemberPayload } from './authTypes';

const { dispatch } = store;

export const getCountry = () => {
    return apiGet(GET_COUNTRIES);
};

export const saveUserDataToStore = (data: any) => {
    dispatch(saveUserData(data));
};

export const saveTutorialStatus = (data: any) => {
    dispatch(saveShowHomeTutorial(data))
}

export const saveCurrentIndex = (data: any) => {
    dispatch(saveIndex(data))
}

export const saveUserCurrentLocationToStore = (data: any) => {
    dispatch(saveUserCurrentLocation(data))
}
export const saveViewedProfileToStore = (data: any) => {
    dispatch(saveViewedProfile(data))
}


export const updateLocationStatus = (data: any) => {
    dispatch(locationStatus(data))
}
// export const updateAccordingStatus = (data: any) => {
//     dispatch(accordingStatus(data))
// }

export const updateWeightStatus = (data: any) => {
    dispatch(weightStatus(data))
}
export const updateAgeStatus = (data: any) => {
    dispatch(locationStatus(data))
}
////////
export const deleteAccountApi = () => {
    return new Promise((resolve, reject) => {
        apiDelete(DELETE_ACCOUNT)
            .then((res) => {
                setUserData({}).then(saved => {
                    saveUserDataToStore({});
                });
                resolve(res);
            }).catch((error) => {
                setUserData({}).then(saved => {
                    saveUserDataToStore({});
                });
                reject(error)
            })
    })
}

// export const updateProfileApi = (apiPayload: object) => {
//     return new Promise((resolve, reject) => {
//         apiPost(UPDATE_PROFILE, apiPayload)
//             .then((res) => {
//                 getUserData().then(cb => {
//                     let userData = res?.data
//                     userData.token = cb.token
//                     userData.profile_image = cb.profile_image
//                     userData.profile_image_array = cb.profile_image_array

//                     setUserData(userData).then(() => {
//                         saveUserDataToStore(res?.data);
//                         setTimeout(() => {
//                             resolve(res)
//                         }, 500);
//                     });
//                 })
//             }).catch((error) => {
//                 reject(error)
//             })
//     })
// }

export const uploadProfilePicApi = (apiPayload: object) => {
    let headers = { 'Content-Type': 'multipart/form-data' }
    return new Promise((resolve, reject) => {
        apiPost(UPLOAD_PROFILE_PIC, apiPayload, headers).then((res) => {
            getUserData().then(cb => {
                let userData = cb
                userData.profile_image = res?.data[0]?.thumb_path
                userData.profile_image_array = res?.data[0] || []
                setUserData(userData).then(() => {
                    saveUserDataToStore(userData);
                    setTimeout(() => {
                        resolve(res)
                    }, 100);
                });
            }).catch((error) => {
                reject(error)
            })
        }).catch((error) => {
            reject(error)
        })
    })
}

export const uploadProfileMediaApi = (apiPayload: object) => {
    let headers = { 'Content-Type': 'multipart/form-data' }
    return new Promise((resolve, reject) => {
        apiPost(UPLOAD_PROFILE_MEDIA, apiPayload, headers).then((res) => {
            // resolve(res)
            getUserData().then(cb => {
                let userData = cb;
                userData.photos = [...res?.data] || []
                setUserData(userData).then(() => {
                    saveUserDataToStore(userData);
                    setTimeout(() => {
                        resolve(res)
                    }, 500);
                });
            }).catch((error) => {
                reject(error)
            })
        }).catch((error) => {
            reject(error)
        })
    })
}

export const uploadVoiceMessageApi = (apiPayload: object) => {
    let headers = { 'Content-Type': 'multipart/form-data' }
    return new Promise((resolve, reject) => {
        apiPost(UPLOAD_VOICE_MESSAGE, apiPayload, headers).then((res) => {
            getUserData().then(cb => {
                let userData = cb || {};
                const voiceUrl =
                    res?.data?.voice_message ||
                    res?.data?.path ||
                    res?.data?.url ||
                    res?.data?.file ||
                    null;
                if (voiceUrl) {
                    userData.voice_message = voiceUrl;
                }
                setUserData(userData).then(() => {
                    saveUserDataToStore(userData);
                    setTimeout(() => {
                        resolve(res)
                    }, 300);
                });
            }).catch(() => {
                resolve(res)
            })
        }).catch((error) => {
            reject(error)
        })
    })
}

export const deleteVoiceMessageApi = () => {
    return new Promise((resolve, reject) => {
        apiGet(DELETE_VOICE_MESSAGE).then((res: any) => {
            if (res?.success) {
                getUserData().then(cb => {
                    let userData = cb || {};
                    userData.voice_message = null;
                    setUserData(userData).then(() => {
                        saveUserDataToStore(userData);
                        resolve(res);
                    });
                }).catch(() => {
                    resolve(res);
                })
            } else {
                resolve(res);
            }
        }).catch((error) => {
            reject(error);
        })
    })
}

export const uploadPrivateProfileMediaApi = (apiPayload: object) => {
    let headers = { 'Content-Type': 'multipart/form-data' }
    return new Promise((resolve, reject) => {
        apiPost(UPLOAD_PROFILE_MEDIA, apiPayload, headers).then((res) => {
            // resolve(res)
            getUserData().then(cb => {
                let userData = cb;
                userData.privatephotos = [...res?.data] || []
                setUserData(userData).then(() => {
                    saveUserDataToStore(userData);
                    setTimeout(() => {
                        resolve(res)
                    }, 500);
                });
            }).catch((error) => {
                reject(error)
            })
        }).catch((error) => {
            reject(error)
        })
    })
}

export const discoverApi = (apiPayload: object) => {
    return new Promise((resolve, reject) => {
        apiPost(DISCOVER, apiPayload)
            .then((res) => {
                resolve(res)
            }).catch((error) => {
                reject(error)
            })
    })
}

export const updateLocationApi = (apiPayload: object) => {
    return new Promise((resolve, reject) => {
        apiPost(UPDATE_LOCATION, apiPayload)
            .then((res) => {
                console.log(res, "CURRENT LOCATIOn");
                resolve(res)
            }).catch((error) => {
                reject(error)
                console.log(error, "CURRENT LOCATIOn");
            })
    })
}

export const deleteGalleryImageApi = (apiPayload: object, restImages: object) => {
    let headers = { 'Content-Type': 'multipart/form-data' }
    return new Promise((resolve, reject) => {
        apiPost(DELETE_PROFILE_MEDIA_IMAGE, apiPayload, headers)
            .then((res) => {
                getUserData().then(cb => {
                    let userData = cb;
                    userData.photos = restImages || []
                    setUserData(userData).then(() => {
                        saveUserDataToStore(userData);
                        setTimeout(() => {
                            resolve(res)
                        }, 500);
                    });
                }).catch((error) => {
                    reject(error)
                })
            }).catch((error) => {
                reject(error)
            })
    })
}
export const deletePrivateGalleryImageApi = (apiPayload: object, restImages: object) => {
    let headers = { 'Content-Type': 'multipart/form-data' }
    return new Promise((resolve, reject) => {
        apiPost(DELETE_PROFILE_MEDIA_IMAGE, apiPayload, headers)
            .then((res) => {
                getUserData().then(cb => {
                    let userData = cb;
                    userData.privatephotos = restImages || []
                    setUserData(userData).then(() => {
                        saveUserDataToStore(userData);
                        setTimeout(() => {
                            resolve(res)
                        }, 500);
                    });
                }).catch((error) => {
                    reject(error)
                })
            }).catch((error) => {
                reject(error)
            })
    })
}

export const matchUserListApi = (apiPayload: any, query: any) => {
    console.log('apiPayload',apiPayload)
    return new Promise((resolve, reject) => {
        apiPost(MATCH_USER_LIST + "?page=" + query, apiPayload)
            .then((res) => {
                resolve(res)
            }).catch((error) => {
                reject(error)
            })
    })
}

export const likeDislikeUserApi = (apiPayload: any) => {
    return new Promise((resolve, reject) => {
        apiPost(SEND_REQUESTS, apiPayload)
            .then((res) => {
                resolve(res)
            }).catch((error) => {
                reject(error)
            })
    })
}

export const getAdvertisementApi = () => {
    return new Promise((resolve, reject) => {
        apiGet(GET_ADVERTISEMENT)
            .then((res) => {
                resolve(res)
            }).catch((error) => {
                reject(error)
            })
    })
}

export const likeAdvertisementApi = (apiPayload: any) => {
    return new Promise((resolve, reject) => {
        apiPost(LIKE_ADVERTISEMENT, apiPayload)
            .then((res) => {
                resolve(res)
            }).catch((error) => {
                reject(error)
            })
    })
}

export const addToFavouriteApi = (apiPayload: any) => {
    return new Promise((resolve, reject) => {

        console.log("gyugugyy",apiPayload)
        
        apiPost(ADD_TO_FAVOURITE, apiPayload)
            .then((res) => {
                resolve(res)
            }).catch((error) => {
                reject(error)
            })
    })
}

export const setBonkFiltersApi = (apiPayload: any) => {
    let headers = { 'Content-Type': 'multipart/form-data' }
    return new Promise((resolve, reject) => {
        apiPost(SET_BONK_FILTERS, apiPayload, headers)
            .then((res) => {

                console.log(res, "resresresresresres");

                // resolve(res)
                getUserData().then(cb => {
                    let userData = {
                        ...cb,
                        ...res?.data,
                        token: cb.token,
                        photos: res?.data?.photos?.length ? res.data.photos : cb.photos,
                    };
                    setUserData(userData).then(() => {
                        saveUserDataToStore(userData);
                        setTimeout(() => {
                            resolve(res)
                        }, 500);
                    });
                }).catch((error) => {
                    reject(error)
                })

            }).catch((error) => {
                reject(error)
            })
    })
}

export const getFreshUsers = () => {
    return new Promise((resolve, reject) => {
        apiGet(FRESH_USERS)
            .then((res) => {
                resolve(res)
            }).catch((error) => {
                reject(error)
            })
    })
}

export const setBonkersFiltersApi = (apiPayload: any) => {
    let headers = { 'Content-Type': 'multipart/form-data' }
    return new Promise((resolve, reject) => {
        apiPost(SET_BONKERS_FILTERS, apiPayload, headers)
            .then((res) => {
                console.log(res, "resresresresresres")
                getUserData().then(cb => {
                    let userData = {
                        ...cb,
                        ...res?.data,
                        token: cb.token,
                        photos: res?.data?.photos?.length ? res.data.photos : cb.photos,
                    };
                    setUserData(userData).then(() => {
                        saveUserDataToStore(userData);
                        setTimeout(() => {
                            resolve(res)
                        }, 500);
                    });
                }).catch((error) => {
                    reject(error)
                })

            }).catch((error) => {
                reject(error)
            })
    })
}

export const clearFilters = (apiPayload: any) => {
    return new Promise((resolve, reject) => {
        apiPost(SET_BONKERS_FILTERS, apiPayload)
            .then((res) => {
                resolve(res)
            }).catch((error) => {
                reject(error)
            })
    })
}
export const saveImage = (apiPayload: any) => {
    return new Promise((resolve, reject) => {
        apiPost(SAVE_IMAGE, apiPayload)
            .then((res) => {
                resolve(res)
            }).catch((error) => {
                reject(error)
            })
    })
}


// saveViewedProfileIds
export const updateViewProfileIds = (apiPayload: any) => {
    return new Promise((resolve, reject) => {
        apiPost(UPDATE_VIEW_PROFILE_ID, apiPayload)
            .then((res) => {
                resolve(res)
            }).catch((error) => {
                reject(error)
            })
    })
}
export const saveLocation = (data: any) => {
    dispatch(saveLocation(data));
};


export const incognitoMode = (apiPayload: any) => {
    return new Promise((resolve, reject) => {
        // console.log("apiiiiiiii", apiPayload);

        apiGet(INCOGNITO_MODE + "?mode=" + apiPayload)
            .then((res) => {
                // console.log("apiiiiiiii;;;", res);

                resolve(res)
            }).catch((error) => {
                reject(error)
            })
    })
}
export const groupChatConversations = () => {
    return new Promise((resolve, reject) => {

        apiGet(GROUP_CHAT_CONVERSATION)
            .then((res) => {
                // console.log("apiiiiiiii;;;", res);

                resolve(res)
            }).catch((error) => {
                reject(error)
            })
    })
}

export const getGroupMemebers = (payload: GroupMemberPayload) => {
    return new Promise((resolve, reject) => {
        apiGet(`${GET_MEMEBER_LIST}?group_id=${payload?.groupId}&page=${payload?.page}`)
            .then((res) => {
                resolve(res)
            }).catch((error) => {
                reject(error)
            })
    })
}
export const getBoomPlanDetails = () => {
    return new Promise((resolve, reject) => {
        apiGet(BOOM_PLAN_DETAILS).then((res) => {
            resolve(res)
        }).catch((error) => {
            reject(error)
        })
    })
}
export const checkOutBoomPlan = () => {
    return new Promise((resolve, reject) => {
        apiGet(BOOM_CHECKOUT_PLAN).then((res) => {
            resolve(res)
        }).catch((error) => {
            reject(error)
        })
    })
}
export const saveBoomSubscription = () => {
    return new Promise((resolve, reject) => {
        apiGet(SAVE_BOOM_SUBSCRIPTION).then((res) => {
            resolve(res)
        }).catch((error) => {
            reject(error)
        })
    })
}


export const deleteChatMessage = (apiPayload: any) => {
    return new Promise((resolve, reject) => {
        apiPost(CHAT_MESSAGES_DELETE,apiPayload )
            .then((res) => {
                resolve(res)
            }).catch((error) => {
                console.log("Chat Data Delete erroe_++_+_",error);
                reject(error)
            })
    })
}

export const changeLocationStatus = (apiPayload: any) => {
    return new Promise((resolve, reject) => {
        console.log("JokerNotification222222",apiPayload);
        apiPost(CHANGE_LOCATION_STATUS, apiPayload)
            .then((res) => {
                console.log("JokerNotification___RES",res);
                
                resolve(res)
            }).catch((error) => {
                reject(error)
            })
    })
}

export const changeWeightStatus = (apiPayload: any) => {
    return new Promise((resolve, reject) => {
        console.log("WEIGHT_STATUS_PAYLOAD",apiPayload);
        apiPost(CHANGE_WEIGHT_STATUS, apiPayload)
            .then((res) => {
                console.log("WEIGHT_STATUS_RESPONSE",res);
                
                resolve(res)
            }).catch((error) => {
                reject(error)
            })
    })
}
export const stopLocation = (apiPayload: any) => {
    return new Promise((resolve, reject) => {
        console.log("JokerNotification222222",apiPayload);
        apiPost(STOP_LOCATION, apiPayload)
            .then((res) => {
                console.log("JokerNotification___RES",res);
                
                resolve(res)
            }).catch((error) => {
                reject(error)
            })
    })
}
export const updateFavouriteTxt = (apiPayload: any) => {
    return new Promise((resolve, reject) => {
        console.log("JokerNotification222222",apiPayload);
        apiPost(EDIT_FAVOURITE_TEXT, apiPayload)
            .then((res) => {
                console.log("JokerNotification___RES",res);
                
                resolve(res)
            }).catch((error) => {
                reject(error)
            })
    })
}

export const grantPrivateGallery = (apiPayload: any) => {
    return new Promise((resolve, reject) => {
        console.log("JokerNotification222222",apiPayload);
        apiPost(GRANT_PRIVATE_GALLERY_ACCESS, apiPayload)
            .then((res) => {
                console.log("JokerNotification___RES",res);
                
                resolve(res)
            }).catch((error) => {
                console.log("errer", error);
                
                reject(error)
            })
    })
}
export const removePrivateGallery = (apiPayload: any) => {
    return new Promise((resolve, reject) => {
        console.log("JokerNotification222222",apiPayload);
        apiPost(REMOVE_PRIVATE_GALLERY_ACCESS, apiPayload)
            .then((res) => {
                console.log("JokerNotification___RES",res);
                
                resolve(res)
            }).catch((error) => {
                console.log("errer", error);
                
                reject(error)
            })
    })
}

export const getChatCounts = () => {
    return new Promise((resolve, reject) => {
        apiGet(GET_CHAT_COUNT).then((res) => {
            resolve(res)
        }).catch((error) => {
            reject(error)
        })
    })
}
export const getSupportData = () => {
    return new Promise((resolve, reject) => {
        apiGet(GET_SUPPORT_DATA).then((res) => {
            resolve(res)
        }).catch((error) => {
            reject(error)
        })
    })
}

export const updateChatCOunt =(data:Boolean)=>{
    // console.log(data,'testdatatatt')
    dispatch(updateChatCount(data))
}

// Test function to manually trigger notification dot (for development/testing)
export const testNotificationDot = () => {
    console.log('Testing notification dot...')
    dispatch(updateChatCount(true))
    // Auto-clear after 3 seconds for testing
    setTimeout(() => {
        dispatch(updateChatCount(false))
    }, 3000)
}

// Function to clear notification dot when user opens inbox
export const clearNotificationDot = () => {
    console.log('Clearing notification dot...')
    dispatch(updateChatCount(false))
}