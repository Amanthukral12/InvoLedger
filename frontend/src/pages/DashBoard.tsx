import { useState } from "react";
import NavigationBar from "../components/UI/NavigationBar";
import Sidebar from "../components/UI/Sidebar";
import { IoMenu } from "react-icons/io5";
const DashBoard = () => {
  const [showSideBar, setShowSideBar] = useState(false);
  return (
    <div className="bg-[#edf7fd] bg-cover min-h-screen lg:h-screen overflow-hidden flex flex-col lg:flex-row w-full">
      <div className="w-0 lg:w-1/5 z-5">
        <NavigationBar />
      </div>
      <div className="w-full lg:hidden">
        <IoMenu
          onClick={() => setShowSideBar(true)}
          className={`flex lg:hidden h-8 w-8 ml-3 mt-2 text-main ${
            showSideBar ? "hidden" : ""
          }`}
        />
        <Sidebar
          shown={showSideBar}
          close={() => setShowSideBar(!showSideBar)}
        />
      </div>
    </div>
  );
};

export default DashBoard;
