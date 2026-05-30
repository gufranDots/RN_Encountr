import {
  BLOCK_USER,
  BONK_CHAT_CONVERSATIONS,
  CHAT_COUNT,
  CHAT_DELETE,
  CHAT_USER_LIST,
  CREATE_AGORA_TOKEN,
  CREATE_GROUP,
  GET_ALL_CHAT_MESSAGES,
  GET_LIKES,
  GET_OTHER_PROFILE,
  GET_VIEWED_LIST,
  REPORT_USER,
  UNBLOCK_USER,
  UPLOAD_AUDIO_FILE,
  UPLOAD_FILE,
  USERS_CHAT_LISTING,
  VIEW_API,
  ADD_GROUP_MEMBER,
  UPDATE_CHAT_GROUP,
  DELETE_CHAT_GROUP,
  DELETE_GROUP_CHAT_CONVERSATION,
  GET_LIKED_CHAT_USER_LIST,
  SET_PROFILE_PIN,
  VERIFY_PROFILE_PIN,
  MUTE_UNMUTE_NOTIFICATION,
  REMOVE_PIN,
  ENABLE_DESABLE_PIN,
  EXIT_GROUP,
  FAVOTITE_CHAT,
  ADD_REMOVE_FAVOTITE_CHAT,
  GET_MY_SHARED_CHAT_IMAGES,
  GET_GROUP_MEMBERS
} from '../../config/urls';
import {apiGet, apiPost} from '../../utils/utils';
import {saveChatCount} from '../reduxReducers/authReducers';
import {
  resetGroupUsers,
  saveUserGroupListing,
} from '../reduxReducers/homeReducers';
import store from '../store';

const {dispatch} = store;

export const saveChatCounter = (data: any) => {
  dispatch(saveChatCount(data));
};

export const saveUserGroupListingToStore = (data: any) => {
  dispatch(saveUserGroupListing(data));
};
export const resetGroupList = () => {
  dispatch(resetGroupUsers());
};
export const usersChatListingApp = (apiPayload: any) => {
  return new Promise((resolve, reject) => {
    apiGet(
      USERS_CHAT_LISTING +
        '?page=' +
        apiPayload?.pageNo +
        '&search=' +
        apiPayload?.searchText,
    )
      .then(res => {
        resolve(res);
      })
      .catch(error => {
        reject(error);
      });
  });
};

export const getAllChatMessagesApi = (apiPayload: any) => {
  return new Promise((resolve, reject) => {

    apiGet(
      GET_ALL_CHAT_MESSAGES +
        apiPayload?.id +
        '&room_type=' +
        apiPayload?.room_type +
        '&page=' +
        apiPayload?.page +
        '&group_id=' +
        apiPayload?.group_id +
        '&lat=' +
        apiPayload?.lat +
        '&long=' +
        apiPayload?.long,
    )
      .then(res => {
        resolve(res);
      })
      .catch(error => {
        reject(error);
      });
  });
};
// GET_LIKED_CHAT_USER_LIST

export const getLikedChatUserListApi = (apiPayload: any) => {
  return new Promise((resolve, reject) => {
    apiPost(GET_LIKED_CHAT_USER_LIST, apiPayload)
      .then(res => {
        resolve(res);
      })
      .catch(error => {
        reject(error);
      });
  });
};

// SET_PROFILE_PIN

export const setProfilePinApi = (apiPayload: any) => {
  return new Promise((resolve, reject) => {
    apiPost(SET_PROFILE_PIN, apiPayload)
      .then(res => {
        resolve(res);
      })
      .catch(error => {
        reject(error);
      });
  });
};

// VERIFY_PROFILE_PIN
export const verifyProfilePinApi = (apiPayload: any) => {
  return new Promise((resolve, reject) => {
    apiPost(VERIFY_PROFILE_PIN, apiPayload)
      .then(res => {
        resolve(res);
      })
      .catch(error => {
        reject(error);
      });
  });
};

// MUTE_UNMUTE_NOTIFICATION
export const muteUnmuteNotificationApi = (apiPayload: any) => {
  return new Promise((resolve, reject) => {
    apiPost(MUTE_UNMUTE_NOTIFICATION, apiPayload)
      .then(res => {
        resolve(res);
      })
      .catch(error => {
        reject(error);
      });
  });
};
// EXIT GURUP
export const exitGroupApi = (apiPayload: any) => {
  return new Promise((resolve, reject) => {
    apiPost(EXIT_GROUP, apiPayload)
      .then(res => {
        resolve(res);
      })
      .catch(error => {
        reject(error);
      });
  });
};

// REMOVE_PIN
export const removeProfilePinApi = (apiPayload: any) => {
  return new Promise((resolve, reject) => {
    apiPost(REMOVE_PIN, apiPayload)
      .then(res => {
        resolve(res);
      })
      .catch(error => {
        reject(error);
      });
  });
};

// REMOVE_PIN
export const enableDesableProfilePinApi = (apiPayload: any) => {
  return new Promise((resolve, reject) => {
    apiPost(ENABLE_DESABLE_PIN, apiPayload)
      .then(res => {
        resolve(res);
      })
      .catch(error => {
        reject(error);
      });
  });
};

export const getAllTaps = () => {
  return new Promise((resolve, reject) => {
    apiGet(GET_LIKES)
      .then(res => {
        resolve(res);
      })
      .catch(error => {
        reject(error);
      });
  });
};

export const bonkChatConversationsApi = (apiPayload: any) => {
  return new Promise((resolve, reject) => {
    apiGet(
      BONK_CHAT_CONVERSATIONS +
        '?page=' +
        apiPayload?.pageNo +
        '&q=' +
        apiPayload?.searchText,
    )
      .then(res => {
        resolve(res);
      })
      .catch(error => {
        reject(error);
      });
  });
};

export const blockUserApi = (apiPayload: any) => {
  return new Promise((resolve, reject) => {
    apiPost(BLOCK_USER, apiPayload)
      .then(res => {
        resolve(res);
      })
      .catch(error => {
        reject(error);
      });
  });
};

export const unblockUserApi = (apiPayload: any) => {
  return new Promise((resolve, reject) => {
    apiPost(UNBLOCK_USER, apiPayload)
      .then(res => {
        resolve(res);
      })
      .catch(error => {
        reject(error);
      });
  });
};

export const reportUserApi = (apiPayload: any) => {
  return new Promise((resolve, reject) => {
    apiPost(REPORT_USER, apiPayload)
      .then(res => {
        resolve(res);
      })
      .catch(error => {
        reject(error);
      });
  });
};

export const createAgoraTokenApi = (apiPayload: any) => {
  return new Promise((resolve, reject) => {
    apiPost(CREATE_AGORA_TOKEN, apiPayload)
      .then(res => {
        resolve(res);
      })
      .catch(error => {
        reject(error);
      });
  });
};

export const getOtherProfileApi = (apiPayload: any) => {
  return new Promise((resolve, reject) => {
    apiPost(GET_OTHER_PROFILE, apiPayload)
      .then(res => {
        resolve(res);
      })
      .catch(error => {
        reject(error);
      });
  });
};

export const getViewedList = (apiPayload: any) => {
  return new Promise((resolve, reject) => {
    apiGet(GET_VIEWED_LIST)
      .then(res => {
        resolve(res);
      })
      .catch(error => {
        reject(error);
      });
  });
};
export const favoriteChatList = (apiPayload: any) => {
  return new Promise((resolve, reject) => {
    apiGet(FAVOTITE_CHAT)
      .then(res => {
        resolve(res);
      })
      .catch(error => {
        reject(error);
      });
  });
};

export const viewApi = (apiPayload: any) => {
  return new Promise((resolve, reject) => {
    apiPost(VIEW_API, apiPayload)
      .then(res => {
        resolve(res);
      })
      .catch(error => {
        reject(error);
      });
  });
};

export const uploadAudioFile = (apiPayload: any) => {
  let headers = {'Content-Type': 'multipart/form-data'};
  return new Promise((resolve, reject) => {
    console.log('image req))))))))))))', apiPayload);

    apiPost(UPLOAD_AUDIO_FILE, apiPayload, headers)
      .then(res => {
        console.log('image res))))))))))))', JSON.stringify(res));

        resolve(res);
      })
      .catch(error => {
        reject(error);
      });
  });
};

export const getChatCount = () => {
  return new Promise((resolve, reject) => {
    apiGet(CHAT_COUNT)
      .then(res => {
        resolve(res);
      })
      .catch(error => {
        reject(error);
      });
  });
};

export const chatDelete = (apiPayload: any) => {
  return new Promise((resolve, reject) => {
    apiPost(CHAT_DELETE, apiPayload)
      .then(res => {
        resolve(res);
      })
      .catch(error => {
        reject(error);
      });
  });
};
export const createGroup = (apiPayload: any) => {
  return new Promise((resolve, reject) => {
    apiPost(CREATE_GROUP, apiPayload)
      .then(res => {
        resolve(res);
      })
      .catch(error => {
        reject(error);
      });
  });
};
export const addMembers = (apiPayload: any) => {
  return new Promise((resolve, reject) => {
    apiPost(ADD_GROUP_MEMBER, apiPayload)
      .then(res => {
        resolve(res);
      })
      .catch(error => {
        reject(error);
      });
  });
};

export const updateChatGroup = (apiPayload: any) => {
  return new Promise((resolve, reject) => {
    apiPost(UPDATE_CHAT_GROUP, apiPayload)
      .then(res => {
        resolve(res);
      })
      .catch(error => {
        reject(error);
      });
  });
};

export const deleteChatGroup = (apiPayload: any) => {
  return new Promise((resolve, reject) => {
    apiPost(DELETE_CHAT_GROUP, apiPayload)
      .then(res => {
        resolve(res);
      })
      .catch(error => {
        reject(error);
      });
  });
};

export const deleteGroupChatConversation = (apiPayload: any) => {
  return new Promise((resolve, reject) => {
    apiPost(DELETE_GROUP_CHAT_CONVERSATION, apiPayload)
      .then(res => {
        resolve(res);
      })
      .catch(error => {
        reject(error);
      });
  });
};

export const addRemoveFavorateChat = (apiPayload: any) => {
  return new Promise((resolve, reject) => {
    apiPost(ADD_REMOVE_FAVOTITE_CHAT, apiPayload)
      .then(res => {
        resolve(res);
      })
      .catch(error => {
        reject(error);
      });
  });
};

export const uploadGroupImg = (apiPayload: object) => {
  let headers = {'Content-Type': 'multipart/form-data'};
  return new Promise((resolve, reject) => {
    apiPost(UPLOAD_FILE, apiPayload, headers)
      .then(res => {
        setTimeout(() => {
          resolve(res);
        }, 500);
      })
      .catch(error => {
        reject(error);
      });
  });
};

export const getChatMembers = (apiPayload: any) => {
  return new Promise((resolve, reject) => {
    apiPost(
      CHAT_USER_LIST +
        '?page=' +
        apiPayload?.pageNo +
        '&search=' +
        apiPayload?.searchText,
    )
      .then(res => {
        resolve(res);
      })
      .catch(error => {
        reject(error);
      });
  });
};

export const getMySharedChatImagesApi = () => {
  return new Promise((resolve, reject) => {
    apiPost(GET_MY_SHARED_CHAT_IMAGES, {})
      .then(res => {
        resolve(res);
      })
      .catch(error => {
        reject(error);
      });
  });
};

export const getMemberList = (payload: any) => {
  return new Promise((resolve, reject) => {
    const url = `${GET_GROUP_MEMBERS}?groud_id=${payload?.group_id}&page=${payload?.pageNo}&pageSize=${payload.perPage}`;
    apiGet(url)
      .then(res => {
        resolve(res);
      })
      .catch(error => {
        reject(error);
      });
  });
};