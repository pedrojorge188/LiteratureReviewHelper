import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { SearchRequestPayload } from "../../../pages/types";

const API_URL = import.meta.env.VITE_APP_API_URL;

export const getHomeData = createAsyncThunk("Home", async () => {
  const response = await axios.get(`${API_URL}/Home`);
  return response.data;
});

export const getNavbarData = createAsyncThunk("Navbar", async () => {
  const response = await axios.get(`${API_URL}/Navbar`);
  return response.data;
});

export const getArticles = createAsyncThunk(
  "Articles",
  async (payload: SearchRequestPayload) => {
    const {
      query,
      apiList,
      author,
      venue,
      title,
      exclude_author,
      exclude_venue,
      exclude_title,
      year_start,
      year_end,
      start = 0,
      rows = 10,
      wt = "bibtex",
    } = payload;

    // const response = await axios.get(`${API_URL}/search?q=${payload.query}&start=0&rows=10&wt=bibtex`,
    const response = await axios.get(`${API_URL}/search`, {
      params: {
        q: query,
        start,
        rows,
        wt,
        author,
        venue,
        title,
        exclude_author,
        exclude_venue,
        exclude_title,
        year_start,
        year_end
      },
      headers: {
        "X-API-KEYS": apiList
      }
    });

    return response.data;
  }
);

//http://localhost:8080/api/search?q=AI&start=0&rows=25&wt=bibtex&api_key=0c2c20ce9ca00510e69e0bd7ffba864e
