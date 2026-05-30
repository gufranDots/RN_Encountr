import { createSlice } from "@reduxjs/toolkit";
import imagesPath from "../../constants/imagesPath";

const homeSlice = createSlice({
    name: "homeReducer",
    initialState: {
        showHomeTutorial: true,
        liveLocation: "",
        viewedProfile: [],
        latlong:{},
        locationStatus:false,
        weightStatus:false,
        groupUsers:[{
            id: null,
            image: imagesPath.mic,
            name: null
        }],
        chatCount:false,
        changeCount:false
    },
    reducers: {
        saveShowHomeTutorial: (state, action) => {
            console.log("saveShowHomeTutorial action =>", action?.payload);
            state.showHomeTutorial = false;
        },
        saveUserCurrentLocation: (state, action) => {
            console.log("saveShowHomeTutorial action =>", action?.payload);
            state.liveLocation = action?.payload
        },
        saveViewedProfile: (state, action) => {
            // console.log('View profile reducer===>',action?.payload)
            state.viewedProfile = action?.payload
        },
        locationStatus: (state, action) => {
            state.locationStatus = action?.payload
        },
        // accordingStatus: (state, action) => {
        //     state.accordingStatus = action?.payload
        // },
        weightStatus: (state, action) => {
            state.weightStatus = action?.payload
        },
        saveLocatin:(state,action)=>{
            state.latlong = action.payload;
        },
        saveUserGroupListing:(state,action)=>{
            state.groupUsers = state.groupUsers.concat(action.payload);
        },
        resetGroupUsers: (state) => {
            state.groupUsers = [{
                id: null,
                image: imagesPath.mic,
                name: null
            }];
          },
          updateChatCount:(state,action)=>{
            state.chatCount=action.payload
          }
    }
})

export const { saveShowHomeTutorial, saveUserCurrentLocation, saveViewedProfile ,saveLocatin, saveUserGroupListing, resetGroupUsers,locationStatus,weightStatus,updateChatCount, } = homeSlice.actions
export default homeSlice.reducer;