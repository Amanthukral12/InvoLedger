/// <reference types="vite-plugin-svgr/client" />

import Person from "../../assets/Person-svg.svg?react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import { useAuth } from "../../hooks/auth";
const ProfilePopup = ({
  shown,
  close,
}: {
  shown: boolean;
  close: () => void;
}) => {
  const { company } = useAuthStore();
  const { logoutMutation } = useAuth();
  const navigate = useNavigate();

  const logoutHandler = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      await logoutMutation.mutateAsync();
      navigate("/login");
    } catch (error) {
      console.log(error);
    }
  };
  return shown ? (
    <div
      className="fixed top-0 bottom-0 left-0 right-0 bg-[#00000066] z-[2]"
      onClick={() => close()}
    >
      <div
        className="bg-[#D9D9D9] absolute bottom-4 left-4 w-4/5 lg:w-1/5 h-64 p-2 rounded-lg flex flex-col items-center backdrop:blur-sm"
        onClick={(e) => e.stopPropagation()}
      >
        {company?.avatar ? (
          <img
            src={company.avatar}
            alt="company profile photo"
            className="h-24 w-24 rounded-full border-gray-600 border-2"
          />
        ) : (
          <Person />
        )}
        <p>{company?.name}</p>
        <p>{company?.email}</p>
        <Link to={"/profile/update"}>
          <button className="bg-main cursor-pointer rounded-lg text-lg text-[#D9D9D9] py-1 px-14 mt-2 mb-2 font-semibold">
            Update Profile
          </button>
        </Link>
        <button
          onClick={(e) => logoutHandler(e)}
          className="bg-main cursor-pointer rounded-lg text-lg text-[#D9D9D9] py-1 px-14 mt-2 mb-4 font-semibold"
        >
          Logout
        </button>
      </div>
    </div>
  ) : null;
};

export default ProfilePopup;
