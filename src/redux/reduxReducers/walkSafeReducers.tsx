import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'walkSafeReducers',
  initialState: {
    walkSafeUserData: null,
    walkSafeCoordinates: {},
    setWalksafeJourneyApiData: null
  },
  reducers: {
    safeWalkSafeData: (state, action) => {
      state.walkSafeUserData = action.payload;
    },
    saveWalkSafeCoordinates: (state, action) => {
      state.walkSafeCoordinates = action.payload;
    },
    setWalksafeJourneyData: (state, action) => {
      state.setWalksafeJourneyApiData = action.payload;
    },
  },
});
export const { saveWalkSafeCoordinates, safeWalkSafeData, setWalksafeJourneyData } = authSlice.actions;
export default authSlice.reducer;
