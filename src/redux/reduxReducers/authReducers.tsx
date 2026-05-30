import {createSlice} from '@reduxjs/toolkit';
import { setItem } from '../../utils/utils';

const authSlice = createSlice({
  name: 'authReducer',
  initialState: {
    onBoard: true,
    token: null,
    userData: {},
    loginData: false,
    coordinates: {},
    loginPin: null,
    index: 0,
    filterAddress: '',
    chatCount:0,
    homeData:[],
    isIdle:"",
    count:''
  },
  reducers: {
    onBoard: (state, action) => {
      // console.log('onBoardAction action =>', action?.payload);
      state.onBoard = action?.payload;
      setItem('onBoard', action?.payload);
    },
    saveFcmToken: (state, action) => {
      // console.log('saveUserData action =>', action?.payload);
      state.token = action.payload;
    },
    saveUserData: (state, action) => {
      // console.log('saveUserData action =>1122', action?.payload);
      state.userData = action.payload;
    },
    saveLoginData: (state, action) => {
      // console.log('saveLoginData action =>', action?.payload);
      state.loginData = action.payload;
    },
    saveLiveLocationCoords: (state, action) => {
      // console.log('saveLiveLocationCoords action =>', action?.payload);
      state.coordinates = action.payload;
    },
    saveLoginPin: (state, action) => {
      // console.log('saveLoginPin action =>', action?.payload);
      state.loginPin = action.payload;
    },
    saveIndex: (state, action) => {
      // console.log('index action =>', action?.payload);
      state.index = action.payload;
    },
    saveFilterAddress: (state, action) => {
      // console.log('index action =>', action?.payload);
      state.filterAddress = action.payload;
    },
    saveChatCount: (state, action) => {
      // console.log('index action =>', action?.payload);
      state.chatCount = action.payload;
    },
    saveHomeData: (state, action) => {
      // console.log('index action =>', action?.payload);
      state.homeData = action.payload;
    },
    saveNotificationCount: (state, action) => {
      // console.log('indexcoumntttttt', action?.payload);
      state.count = action.payload;
    },
    saveIsIdle:(state,action)=>{
      state.index = action.payload;
    }
  },
});
export const {
  onBoard,
  saveFcmToken,
  saveUserData,
  saveLoginData,
  saveLiveLocationCoords,
  saveLoginPin,
  saveIndex,
  saveFilterAddress,
  saveChatCount,
  saveHomeData,
  saveNotificationCount,
  saveIsIdle
} = authSlice.actions;
export default authSlice.reducer;
