import React from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
} from "react-router-dom";
import Home from "./routes/Home";
import Navbar from "./components/Navbar";
import Sudoku from "./routes/Sudoku";
import Coin from "./routes/Coin";
import RollDice from "./routes/RollDice";
import Slots from "./routes/Slots";
import RockPaperScissors from "./routes/RockPaperScissors";
import Stats from "./routes/Stats";
import "./components/Navbar.css";

const AppLayout = () => (
  <>
    <Navbar />
    <Outlet />
  </>
);

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "sudoku",
        element: <Sudoku />,
      },
      {
        path: "coin",
        element: <Coin />,
      },
      {
        path: "rolldice",
        element: <RollDice />,
      },
      {
        path: "rockpaperscissors",
        element: <RockPaperScissors />,
      },
      {
        path: "slots",
        element: <Slots />,
      },
      {
        path: "stats",
        element: <Stats />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
);