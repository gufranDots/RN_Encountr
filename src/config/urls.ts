export const GET_COUNTRIES: string =
  'https://countriesnow.space/api/v0.1/countries/states';
export const GET_STATES: string =
  'https://countriesnow.space/api/v0.1/countries/states';
export const GET_CITIES: string =
  'https://countriesnow.space/api/v0.1/countries/cities';

export const SOCKET_URL = 'https://socket.encountr.net'; // Release
// export const SOCKET_URL = "https://encountr-socket.netsolutionindia.com" // Test

// export const API_BASE_URL = 'http://192.168.101.221:8007'; // Dev
export const API_BASE_URL = 'https://encountr.net'; // Release
// export const API_BASE_URL = 'http://192.168.103.21:8001'; // local

export const ZEGOCLOUD_APP_ID = 212302449
export const ZEGOCLOUD_APP_SIGN = '4b530cf96f80d1b2b7784538e23c26693ac96929ffd75361b40f84fcd4947244'

// export const ZEGOCLOUD_APP_ID = 212302449;
// export const ZEGOCLOUD_APP_SIGN =
//   '4b530cf96f80d1b2b7784538e23c26693ac96929ffd75361b40f84fcd4947244';

// export const ZEGOCLOUD_APP_ID = 1458020451
// export const ZEGOCLOUD_APP_SIGN = '26251acb9cec81385ab780f6986af8460defca6a1e22d5e5741fa4a9b3c3f316'

export const STRIPE_TEST_PUBLISHABLE_KEY =
  'pk_test_51OUusiGJujAQY7J6evyEjZEKpMGsjywetvLYB2P0T5n1e5krwGWnDNl6uXBZ3n2uLR9UxXZqLuGLQNvbIpnUqo6l006RksKtZc';
export const STRIPE_LIVE_PUBLISHABLE_KEY =
  'pk_live_51OUusiGJujAQY7J6xMW2cifCjbmJ01zuUjIl9loYn2QgkBeFUNgPgsLj7bVtyM2QM4Z0Ww8Zt7RNPZp95Y4VNi7v00DfLVOlsj';

export const ZENDESK_IOS_CHANNEL_ID =
  'eyJzZXR0aW5nc191cmwiOiJodHRwczovL2Vrb2JyaWRnZS56ZW5kZXNrLmNvbS9tb2JpbGVfc2RrX2FwaS9zZXR0aW5ncy8wMUg2Ukg0S0ZINTJNVlhUSkQ5RzJDTTM1Wi5qc29uIn0=';
export const ZENDESK_ANDROID_CHANNEL_ID =
  'eyJzZXR0aW5nc191cmwiOiJodHRwczovL2hhbGxvd2Vkb25lcy56ZW5kZXNrLmNvbS9tb2JpbGVfc2RrX2FwaS9zZXR0aW5ncy8wMUg2UlFBRjc5WE03U0ZaWU05UjZQVkZEUy5qc29uIn0=';

export const getApiUrl = (endpoint: string) => API_BASE_URL + endpoint;
export const PRIVACY_POLICY = 'https://encountr.net/privacy-policy';
export const TERMS_CONDITION = 'https://encountr.net/terms-&-conditions';
export const MPOX = 'https://encountr.net/mpox';
export const Apple = 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/';
export const SEXUAL_HELTH_FAQ = 'https://encountr.net/faqs';
export const GETKEYWORDS: string = getApiUrl('api/get-keywords');
export const LOGIN_API = getApiUrl('/api/login');
export const GET_DRIVING_DISTANCE_API =
  'https://maps.googleapis.com/maps/api/distancematrix/json';
export const LOGOUT_API = getApiUrl('/api/logout');
export const CHECK_PHONE_NUMBER = getApiUrl('/api/check-phone-number');
export const SEND_OTP = getApiUrl('/api/send-otp');
export const VERIFY_OTP_TO_SIGNUP = getApiUrl('/api/verify-otp');
export const CHECK_USER_EXIST = getApiUrl('/api/check-username');
export const CREATE_NEW_PROFILE = getApiUrl('/api/create-profile');
export const FORGOT_USER_DETAILS = getApiUrl('/api/forgot-user-details');
export const FORGOT_PASSWORD_SEND_OTP = getApiUrl(
  '/api/forgot-password/send-otp',
);
export const VERIFY_OTP_FORGOT_PASSWORD = getApiUrl(
  '/api/forgot-password/verify-otp',
);
export const VERIFY_OTP_FORGOT_USER_DETAILS = getApiUrl(
  '/api/verify-otp-forgot-user-details',
);
export const CREATE_FORGOT_PASSWORD = getApiUrl('/api/forgot-password');
export const DELETE_ACCOUNT = getApiUrl('/api/delete-account');
export const SET_PREFERENCES = getApiUrl('/api/set-filters');
export const UPLOAD_PROFILE_PIC = getApiUrl('/api/upload/image');
export const UPDATE_PROFILE = getApiUrl('/api/update-profile');
export const UPLOAD_FILE = getApiUrl('/api/upload-file');
export const DISCOVER = getApiUrl('/api/discover');
export const UPDATE_LOCATION = getApiUrl('/api/update-location');
export const UPLOAD_PROFILE_MEDIA = getApiUrl('/api/upload/user/images');
export const UPLOAD_VOICE_MESSAGE = getApiUrl('/api/upload/voice-message');
export const DELETE_VOICE_MESSAGE = getApiUrl('/api/delete/voice-message');
export const DELETE_PROFILE_MEDIA_IMAGE = getApiUrl('/api/delete/user/images');
export const CHANGE_PASSWORD = getApiUrl('/api/change-password');
export const TERMS_CONDITION_PRIVACY_POLICY = getApiUrl(
  '/api/get-terms-conditions-and-policy',
);
export const MATCH_USER_LIST = getApiUrl('/api/matchUserList');
export const SEND_REQUESTS = getApiUrl('/api/send-request');
export const WHO_LIKE_ME = getApiUrl('/api/who-like-me');
export const USERS_CHAT_LISTING = getApiUrl('/api/who-accept-me');
export const CHAT_MESSAGES = getApiUrl('/api/chat/messages');
export const GET_ALL_CHAT_MESSAGES = getApiUrl(
  '/api/chat/messages?receiver_id=',
);
export const BLOCK_USER = getApiUrl('/api/block-user');
export const UNBLOCK_USER = getApiUrl('/api/unblock-user');
export const REPORT_USER = getApiUrl('/api/report-user');
export const CHANGE_USER_TYPE = getApiUrl('/api/change-user-type');
export const CHANGE_NOTIFICATION = getApiUrl('/api/notification-enable');
export const GET_BLOCKED_USERS = getApiUrl('/api/blocked-users');
export const GET_ADVERTISEMENT = getApiUrl('/api/get-advertisement');
export const LIKE_ADVERTISEMENT = getApiUrl('/api/like-advertisement');
export const CHECK_EMAIL = getApiUrl('/api/check-email');
export const ADD_TO_FAVOURITE = getApiUrl('/api/add-to-favourite');
export const GET_FAVOURITE_USERS = getApiUrl('/api/get-favourite-users');
export const STRIPE_ENDPOINT = getApiUrl('/api/stripe-endpoint');
export const BONK_CHAT_CONVERSATIONS = getApiUrl('/api/chat/conversations');
export const SET_BONK_FILTERS = getApiUrl('/api/set-bonk-filters');
export const SET_BONKERS_FILTERS = getApiUrl('/api/set-bonker-filters');
export const GET_DATING_TAGS = getApiUrl('/api/dating-tags');
export const SAVE_DATING_TAGS = getApiUrl('/api/save-tags');
export const GET_BONKERS_REQUESTS = getApiUrl('/api/get-requests');
export const GET_LIKES = getApiUrl('/api/get-likes');
export const CREATE_AGORA_TOKEN = getApiUrl('/api/create-agora-token');
export const VERIFY_FACE = getApiUrl('/api/verify-profile');
export const GET_OTHER_PROFILE = getApiUrl('/api/get-other-profile');
export const GET_VIEWED_LIST = getApiUrl('/api/my-view-list');
export const VIEW_API = getApiUrl('/api/add-in-view');
export const UPLOAD_AUDIO_FILE = getApiUrl('/api/upload-file');
export const BUY_STRIPE_SUBSCRIPTION = getApiUrl('/api/buy-subscription');
export const GET_PROFILE = getApiUrl('/api/get-profile');
export const RATING = getApiUrl('/api/rating');
export const GET_BONKERS_FRIENDS = getApiUrl('/api/get-friends');
export const BUY_SUBSCRIPTION = getApiUrl('/api/inapp-subscription');
export const GET_CURRENT_VERSION = getApiUrl('/api/check-version');
export const GET_OCCUPATION_SUGGESTION = getApiUrl(
  '/api/get-occupation-suggestions',
);
export const HIDE_PROFILE = getApiUrl('/api/profile-hide-enable');
export const SWIPE_BACK = getApiUrl('/api/rewind-unlikes');
export const CHAT_COUNT = getApiUrl('/api/chat/count');
export const GET_ADMIN_NOTI = getApiUrl('/api/get-admin-notifications');
export const CHAT_DELETE = getApiUrl('/api/chat/conversation/single/delete');
export const FORGOT_USERNAME = getApiUrl('/api/send-forgot-username-via-phone');
export const UPDATE_VIEW_PROFILE_ID = getApiUrl('/api/add-in-view');
export const SOCAIL_LOGIN_API = getApiUrl('/api/social-login');
export const SAVE_IMAGE = getApiUrl('/api/update-profile-image');
export const USER_NOTIFICATION = getApiUrl('/api/get-user-notification');
export const CLEAR_NOTIFICATION = getApiUrl('/api/delete-user-notification');
export const INCOGNITO_MODE = getApiUrl('/api/incognito-mode');
export const GROUP_CHAT_CONVERSATION = getApiUrl(
  '/api/group/chat/conversations',
);
export const CREATE_NEWGROUP_MEMBERS = getApiUrl(
  '/api/create/new/group-members',
);
export const CREATE_GROUP = getApiUrl('/api/create/new/chat-group');
export const CHAT_USER_LIST = getApiUrl('/api/get-group-chat-user-list');
export const BOOM_PLAN_DETAILS = getApiUrl('/api/purchage-addon-plan');
export const BOOM_CHECKOUT_PLAN = getApiUrl(
  '/api/purchage-addon-plan-checkout',
);
export const CHAT_MESSAGES_DELETE = getApiUrl('/api/chat/messages/delete');
export const CHANGE_LOCATION_STATUS = getApiUrl('/api/update-is_location');
export const CHANGE_WEIGHT_STATUS = getApiUrl('/api/toggle-weight');
export const ADD_GROUP_MEMBER = getApiUrl('/api/create/new/chat-group-members');
export const UPDATE_CHAT_GROUP = getApiUrl('/api/update/chat-group');
export const DELETE_CHAT_GROUP = getApiUrl('/api/delete/chat-group');
export const DELETE_GROUP_CHAT_CONVERSATION = getApiUrl('/api/delete/group/chat');
export const FRESH_USERS = getApiUrl('/api/fresh-users');
export const STOP_LOCATION = getApiUrl('/api/stop/shared/location');
export const EDIT_FAVOURITE_TEXT = getApiUrl('/api/update-favourite-user');
export const GRANT_PRIVATE_GALLERY_ACCESS = getApiUrl(
  '/api/grant-private-gallery-access',
);
export const REMOVE_PRIVATE_GALLERY_ACCESS = getApiUrl(
  '/api/remove-private-gallery-access',
);
export const GET_CHAT_COUNT = getApiUrl('/api/get-chat-count');

export const GET_LIKED_CHAT_USER_LIST = getApiUrl('/api/get-chat-like-users');
export const SET_PROFILE_PIN = getApiUrl('/api/update-profile-pin');
export const VERIFY_PROFILE_PIN = getApiUrl('/api/verify-profile-pin');
export const MUTE_UNMUTE_NOTIFICATION = getApiUrl(
  '/api/mute-unmute-notification',
);
export const REMOVE_PIN = getApiUrl('/api/remove-pin');
export const EXIT_GROUP = getApiUrl('/api/exit/chat-group');
export const ENABLE_DESABLE_PIN = getApiUrl('/api/enable-disable-pin');
export const FAVOTITE_CHAT = getApiUrl('/api/favorite/chat/conversations');
export const ADD_REMOVE_FAVOTITE_CHAT = getApiUrl('/api/add-remove-chat-from-favorite');
export const GET_MY_SHARED_CHAT_IMAGES = getApiUrl('/api/get-my-shared-chat-images');
export const GET_SUPPORT_DATA = getApiUrl('/api/get-support-data');
export const GET_MY_SENT_REQUESTS = getApiUrl('/api/my-sent-requests');
export const GET_MEMEBER_LIST = getApiUrl('/api/get-group-member-list');
export const GET_STATIC_DATA = getApiUrl('/api/get-static-data');
