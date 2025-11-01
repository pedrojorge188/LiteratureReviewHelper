import { IHomeState, InitialHomeData } from "./types";
import { createSlice } from "@reduxjs/toolkit";
import { getHomeData, getNavbarData } from "./thunks";

const initialState: IHomeState = {
  homeData: InitialHomeData,
  homeDataLoaded: false,
  navbarData: {},
  navbarDataLoaded: false,
  lang: "",
  langLoaded: false,
};

const homeSlice = createSlice({
  name: "Home",
  initialState,
  reducers: {
    setLang(state, action) {
      state.lang = action.payload;
      state.langLoaded = true;
    },
    clearHomeData(state) {
      state.homeData = initialState.homeData;
      state.homeDataLoaded = false;
    },
    clearNavbarData(state) {
      state.navbarData = initialState.navbarData;
      state.navbarDataLoaded = false;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getHomeData.pending, (state) => {
      return {
        ...state,
        homeDataLoaded: false,
      };
    });
    builder.addCase(getHomeData.fulfilled, (state, action) => {
      return {
        ...state,
        homeData: action.payload,
        homeDataLoaded: true,
      };
    });
    builder.addCase(getNavbarData.pending, (state) => {
      return {
        ...state,
        navbarDataLoaded: false,
      };
    });
    builder.addCase(getNavbarData.fulfilled, (state, action) => {
      return {
        ...state,
        navbarData: action.payload,
        navbarDataLoaded: true,
      };
    });
  },
});

export const { setLang, clearHomeData, clearNavbarData } = homeSlice.actions;
export default homeSlice.reducer;
