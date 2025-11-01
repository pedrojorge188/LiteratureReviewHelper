import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_APP_API_URL;

export const getHomeData = createAsyncThunk("Home", async () => {
  const response = await axios.get(`${API_URL}/Home`);
  return response.data;
});

export const getNavbarData = createAsyncThunk("Navbar", async () => {
  const response = await axios.get(`${API_URL}/Navbar`);
  return response.data;
});

