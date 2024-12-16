// src/Travel/client.ts
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:4000/api';
const TRAVEL_API = `${API_BASE}/travels`;

export const findAllTravels = async () => {
  const response = await axios.get(TRAVEL_API);
  return response.data;
};

export const findTravelById = async (id: string) => {
  const response = await axios.get(`${TRAVEL_API}/${id}`);
  return response.data;
};

export const createTravel = async (travel: any) => {
  const response = await axios.post(TRAVEL_API, travel);
  return response.data;
};

export const updateTravel = async (id: string, travel: any) => {
  const response = await axios.put(`${API_BASE}/travels/${id}`, travel);
  return response.data;
};

export const deleteTravel = async (id: string) => {
  const response = await axios.delete(`${TRAVEL_API}/${id}`);
  return response.data;
};

export const findAllExpenses = async () => {
    const response = await axios.get(`${API_BASE}/expenses`);
    return response.data;
};

export const createExpense = async (expense: any) => {
    const response = await axios.post(`${API_BASE}/expenses`, expense);
    return response.data;
};

export const updateExpense = async (id: string, expense: any) => {
    const response = await axios.put(`${API_BASE}/expenses/${id}`, expense);
    return response.data;
};

export const deleteExpense = async (id: string) => {
    const response = await axios.delete(`${API_BASE}/expenses/${id}`);
    return response.data;
};