import React from 'react';
import { FaPuzzlePiece, FaHandRock, FaDiceD20 } from "react-icons/fa";
import { AiFillHome } from "react-icons/ai";
import { IoIosStats } from "react-icons/io";
import { GiTwoCoins } from "react-icons/gi";

export const SidebarData = [
  {
    title: "Home",
    path: "/",
    icon: <AiFillHome />,
    cName: "nav-text",
  },
  {
    title: "Sudoku",
    path: "/sudoku",
    icon: <FaPuzzlePiece />,
    cName: "nav-text",
  },
  {
    title: "Coin",
    path: "/coin",
    icon: <GiTwoCoins />,
    cName: "nav-text",
  },
  {
    title: "Dices",
    path: "/rolldice",
    icon: <FaDiceD20 />,
    cName: "nav-text",
  },
  {
    title: "RPS",
    path: "/rockpaperscissors",
    icon: <FaHandRock />,
    cName: "nav-text",
  },
  {
    title: "Stats",
    path: "/stats",
    icon: <IoIosStats />,
    cName: "nav-text",
  },
];