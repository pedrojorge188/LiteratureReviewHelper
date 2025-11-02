import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_APP_API_URL;
//Estão apenas para exemplo
export const getHomeData = createAsyncThunk("Home", async () => {
  const response = await axios.get(`${API_URL}/Home`);
  return response.data;
});

export const getNavbarData = createAsyncThunk("Navbar", async () => {
  const response = await axios.get(`${API_URL}/Navbar`);
  return response.data;
});

//http://localhost:8080/api/search?q=AI&start=0&rows=25&wt=bibtex&api_key=0c2c20ce9ca00510e69e0bd7ffba864e
