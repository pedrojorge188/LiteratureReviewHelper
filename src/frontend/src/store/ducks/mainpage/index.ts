import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Query, SearchResponseDto } from "../../../pages/types";

interface MainPageState {
  queries: Query[];
  anoDe: string;
  anoAte: string;
  authors: string[];
  venues: string[];
  excludeAuthors: string[];
  excludeVenues: string[];
  excludeTitles: string[];
  bibliotecas: string[];
  selectedFilters: string[];
  response: SearchResponseDto | null;
}

const initialState: MainPageState = {
  queries: [{ value: "" }],
  anoDe: "",
  anoAte: "",
  authors: [],
  venues: [],
  excludeAuthors: [],
  excludeVenues: [],
  excludeTitles: [],
  bibliotecas: [],
  selectedFilters: [],
  response: null,
};

const mainPageSlice = createSlice({
  name: "MAIN_PAGE",
  initialState,
  reducers: {
    setMainPageState: (
      state,
      action: PayloadAction<Partial<MainPageState>>
    ) => {
      return { ...state, ...action.payload };
    },
    clearMainPageState: () => initialState,
  },
});

export const { setMainPageState, clearMainPageState } = mainPageSlice.actions;
export default mainPageSlice.reducer;
