import React from 'react';
import * as FaIcons from "react-icons/fa";
import * as AiIcons from "react-icons/ai";
import * as IoIcons from "react-icons/io";

export const SidebarData = [
  {
    title: "Home",
    path: "/",
    icon: <AiIcons.AiFillHome />,
    cName: "nav-text",
  },
  {
    title: "Sudoku",
    path: "/sudoku",
    icon: <FaIcons.FaPuzzlePiece />, // Changed icon for Sudoku
    cName: "nav-text",
  },
  {
    title: "Coin",
    path: "/coin",
    icon: <IoIcons.IoIosCash />, // Changed icon for Coin
    cName: "nav-text",
  },
  {
    title: "Dices",
    path: "/rolldice",
    icon: <FaIcons.FaDiceD20 />, // Changed icon for Dices
    cName: "nav-text",
  },
  {
    title: "RPS",
    path: "/rockpaperscissors",
    icon: <FaIcons.FaHandRock />, // Changed icon for RPS
    cName: "nav-text",
  },
];