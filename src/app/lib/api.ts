import axios from 'axios';
import { Order } from '@/app/types/chat';


const api = axios.create({
  baseURL: 'https://spawnback.vercel.app/api', // Adjust to your backend URL
});

export const getUserPurchases = (token: string) =>
  api.get<Order[]>('/purchases/purchases', { headers: { 'x-auth-token': token } }).then(res => res.data);

export const getUserSales = (token: string) =>
  api.get<Order[]>('/purchases/sales', { headers: { 'x-auth-token': token } }).then(res => res.data);

export const getOrderById = (orderId: string, token: string) =>
  api.get<Order>(`/purchases/${orderId}`, { headers: { 'x-auth-token': token } }).then(res => res.data);

export const scheduleMeeting = (orderId: string, location: string, time: string, token: string) =>
  api.post(`/purchases/${orderId}/schedule-meeting`, { location, time }, { headers: { 'x-auth-token': token } }).then(res => res.data);

export const releaseFunds = (orderId: string, token: string) =>
  api.post(`/purchases/${orderId}/release-funds`, {}, { headers: { 'x-auth-token': token } }).then(res => res.data);

export const retractFunds = (orderId: string, reason: string, token: string) =>
  api.post(`/purchases/${orderId}/retract-funds`, { reason }, { headers: { 'x-auth-token': token } }).then(res => res.data);

export const rateSeller = (orderId: string, rating: number, token: string) =>
  api.post(`/purchases/${orderId}/rate-seller`, { rating }, { headers: { 'x-auth-token': token } }).then(res => res.data);