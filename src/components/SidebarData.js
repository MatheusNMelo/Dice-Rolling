import React from 'react';
import * as FaIcons from "react-icons/fa";
import * as AiIcons from "react-icons/ai";
import * as IoIcons from "react-icons/io";

export const SidebarData = [
  {
    title: "Home",
    path: "/",
    icons: <AiIcons.AiFillHome />,
    cName: "nav-text",
  },
  {
    title: "Sudoku",
    path: "/sudoku",
    icons: <FaIcons.FaCartPlus />,
    cName: "nav-text",
  },
  {
    title: "Coin",
    path: "/coin",
    icons: <IoIcons.IoIosPaper />,
    cName: "nav-text",
  },
  {
    title: "Dices",
    path: "/rolldice",
    icons: <IoIcons.IoIosPaper />,
    cName: "nav-text",
  },
];