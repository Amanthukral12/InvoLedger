import { useEffect, useState } from "react";
import { useAuth } from "../hooks/auth";
import { CustomSession } from "../types/types";
import { SlScreenSmartphone } from "react-icons/sl";
import { FaTabletAlt } from "react-icons/fa";
import { MdMonitor } from "react-icons/md";
import NavigationBar from "../components/UI/NavigationBar";
import Sidebar from "../components/UI/Sidebar";
import CompanyHeader from "../components/UI/CompanyHeader";
import { Link } from "react-router-dom";
import useAuthStore from "../store/authStore";
import { IoMenu } from "react-icons/io5";
import { parseUserAgent } from "../utils/deviceInfo";
const Profile = () => {
  const { getAllSessionsQuery } = useAuth();
  const currentSession = useAuthStore((state) => state.currentSession);
  const [showSideBar, setShowSideBar] = useState(false);
  const setAllSessions = useAuthStore((state) => state.setAllSessions);
  const sessions = useAuthStore((state) => state.allSessions);

  useEffect(() => {
    const fetchSessions = async () => {
      const res = await getAllSessionsQuery.refetch();
      if (res.data) {
        setAllSessions(res.data);
      }
    };

    fetchSessions();
  }, []);

  if (getAllSessionsQuery.isFetching) {
    return <div>Loading sessions...</div>;
  }

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType.toLowerCase()) {
      case "mobile":
        return <SlScreenSmartphone className="w-4 h-4" />;
      case "tablet":
        return <FaTabletAlt className="w-4 h-4" />;
      default:
        return <MdMonitor className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-[#edf7fd] bg-cover min-h-screen lg:h-screen overflow-hidden flex flex-col lg:flex-row w-full text-main">
      <div className=" w-0 lg:w-1/5 z-5">
        <NavigationBar />
      </div>
      <div className="w-full lg:hidden h-14">
        <IoMenu
          onClick={() => setShowSideBar(true)}
          className={`flex lg:hidden h-8 w-8 ml-3 mt-2 text-main ${
            showSideBar ? "hidden" : ""
          }`}
        />
      </div>
      <Sidebar shown={showSideBar} close={() => setShowSideBar(!showSideBar)} />
      <section className="w-full lg:w-4/5 overflow-y-auto h-full mb-16">
        <CompanyHeader />
        <Link to={"/profile/update"} className="block w-fit ml-auto">
          <button className="bg-main cursor-pointer rounded-lg text-lg text-white py-1 px-14 mt-2 mb-2  mr-3 font-semibold block">
            Update Profile
          </button>
        </Link>
        <div className="bg-white mx-3 rounded-lg shadow-xl p-4">
          <h3 className="text-lg font-semibold mb-4">Sessions</h3>
          <div className="space-y-3">
            {sessions?.map((singleSession: CustomSession) => {
              const deviceInfo = parseUserAgent(singleSession.deviceInfo || "");
              const isCurrentSession = singleSession.id === currentSession?.id;
              return (
                <div
                  key={singleSession.id}
                  className={`flex items-center p-3 rounded-lg transition-colors ${
                    isCurrentSession
                      ? "bg-blue-50 border border-blue-200"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <div className="mr-3 text-gray-600">
                    {getDeviceIcon(deviceInfo.deviceType)}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{deviceInfo.browser}</div>
                    <div className="text-sm text-gray-600">
                      {deviceInfo.os} • {deviceInfo.deviceType}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Profile;
