/// <reference types="vite-plugin-svgr/client" />
import useAuthStore from "../../store/authStore";
import { NavLink } from "react-router-dom";
import Logo from "../../assets/involedger.svg?react";
import { FaHome } from "react-icons/fa";
import { IoIosPeople } from "react-icons/io";
import { IoMdPerson } from "react-icons/io";
import { FaFileInvoice } from "react-icons/fa";
import { GrTransaction } from "react-icons/gr";
import { useState } from "react";
import ProfilePopup from "./ProfilePopup";
const NavigationBar = () => {
  const { company } = useAuthStore();
  const [showPopup, setShowPopup] = useState(false);
  return (
    <div className="hidden bg-[#ffffff] m-3 p-2.5 h-screen rounded-2xl lg:flex lg:flex-col items-center z-10 shadow-2xl text-main">
      <div className="flex flex-col justify-center items-center my-7">
        <Logo className="w-1/2 rounded-3xl " />
        <h1 className="text-2xl font-bold text-main">InvoLedger</h1>
      </div>
      <hr className="w-[90%] border-t-2 border-main mb-4" />
      <div className="flex-1 w-full overflow-y-auto pr-1">
        <NavLink
          className={({ isActive }) =>
            `p-2.5 w-[90%] text-lg  font-bold flex items-center mb-1 ${
              isActive ? "bg-main !text-white rounded-2xl !shadow-lg" : ""
            }`
          }
          to="/"
        >
          <FaHome className="h-8 w-8 mr-2.5" />
          Home
        </NavLink>
        <NavLink
          className={({ isActive }) =>
            `p-2.5 w-[90%] text-lg  font-bold flex items-center mb-1 ${
              isActive ? "bg-main !text-white rounded-2xl !shadow-2xl" : ""
            }`
          }
          to="/companyInvoices"
        >
          <FaFileInvoice className="h-8 w-8 mr-2.5" />
          Invoices
        </NavLink>
        <NavLink
          className={({ isActive }) =>
            `p-2.5 w-[90%] text-lg  font-bold flex items-center mb-1 ${
              isActive ? "bg-main !text-white rounded-2xl !shadow-2xl" : ""
            }`
          }
          to="/companyPurchases"
        >
          <FaFileInvoice className="h-8 w-8 mr-2.5" />
          Purchases
        </NavLink>
        <NavLink
          className={({ isActive }) =>
            `p-2.5 w-[90%] text-lg  font-bold flex items-center mb-1 ${
              isActive ? "bg-main !text-white rounded-2xl !shadow-2xl" : ""
            }`
          }
          to="/companyTransactions"
        >
          <GrTransaction className="h-8 w-8 mr-2.5" />
          Transactions
        </NavLink>
        <NavLink
          className={({ isActive }) =>
            `p-2.5 w-[90%] text-lg  font-bold flex items-center mb-1 ${
              isActive ? "bg-main !text-white rounded-2xl !shadow-2xl" : ""
            }`
          }
          to="/companyClients"
        >
          <IoIosPeople className="h-8 w-8 mr-2.5" />
          Clients
        </NavLink>
        <NavLink
          className={({ isActive }) =>
            `p-2.5 w-[90%] text-lg  font-bold flex items-center mb-1 ${
              isActive ? "bg-main !text-white rounded-2xl !shadow-2xl" : ""
            }`
          }
          to="/companyTransporters"
        >
          <IoIosPeople className="h-8 w-8 mr-2.5" />
          Transporters
        </NavLink>
        <NavLink
          className={({ isActive }) =>
            `p-2.5 w-[90%] text-lg  font-bold flex items-center mb-1 ${
              isActive ? "bg-main !text-white rounded-2xl !shadow-2xl" : ""
            }`
          }
          to="/profile"
        >
          <IoMdPerson className="h-8 w-8 mr-2.5" />
          Profile
        </NavLink>
      </div>

      <div
        className="flex items-center mt-auto mr-auto mb-4 cursor-pointer"
        onClick={() => setShowPopup(!showPopup)}
      >
        <img
          src={company?.avatar || undefined}
          className="rounded-full h-16 w-16 mr-3"
          alt=""
        />
        <h2 className="text-xl text-main font-bold cursor-pointer">
          {company?.name}
        </h2>
        <ProfilePopup
          shown={showPopup}
          close={() => setShowPopup(!showPopup)}
        />
      </div>
    </div>
  );
};

export default NavigationBar;
