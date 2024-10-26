import React from 'react';
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
  Route,
  Link,
  Outlet,
  createRoutesFromElements,
} from 'react-router-dom';
import Header from './components/Header';
import Navbar from './components/Navbar';
import Sudoku from './routes/Sudoku';
import Home from './routes/Home';
import './App.css';

const AppLayout = () => {
  <>
    <Navbar />
    <Outlet />
  </>
};

const router = createBrowserRouter(createRoutesFromElements(
  <Route element={<AppLayout />}>
    <Route path="/" element={<Home />} />
    <Route path="/sudoku" element={<Sudoku />} />
  </Route>
))

createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
);