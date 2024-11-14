import React from 'react';
import { FaDice } from "react-icons/fa";
import { AiFillHome } from "react-icons/ai";
import { IoIosStats } from "react-icons/io";
import { GiTwoCoins, GiRock } from "react-icons/gi";
import { BsTable } from "react-icons/bs";

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
    icon: <BsTable />,
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
    icon: <FaDice />,
    cName: "nav-text",
  },
  {
    title: "RPS",
    path: "/rockpaperscissors",
    icon: <GiRock />,
    cName: "nav-text",
  },
  {
    title: "Stats",
    path: "/stats",
    icon: <IoIosStats />,
    cName: "nav-text",
  },
];