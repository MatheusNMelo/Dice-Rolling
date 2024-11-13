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
    icon: <FaIcons.FaPuzzlePiece />,
    cName: "nav-text",
  },
  {
    title: "Coin",
    path: "/coin",
    icon: <IoIcons.IoIosCash />,
    cName: "nav-text",
  },
  {
    title: "Dices",
    path: "/rolldice",
    icon: <FaIcons.FaDiceD20 />,
    cName: "nav-text",
  },
  {
    title: "RPS",
    path: "/rockpaperscissors",
    icon: <FaIcons.FaHandRock />,
    cName: "nav-text",
  },
  {
    title: "Stats",
    path: "/stats",
    icon: <FaIcons.FaHandRock />,
    cName: "nav-text",
  },
];