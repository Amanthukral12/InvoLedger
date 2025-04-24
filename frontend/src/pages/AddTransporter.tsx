import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTransporter } from "../hooks/transporters";
import axios from "axios";
import { STATES } from "../constants/state";
import { TbBuildingEstate } from "react-icons/tb";
import { CiUser } from "react-icons/ci";
import Sidebar from "../components/UI/Sidebar";
import NavigationBar from "../components/UI/NavigationBar";
import { IoMenu } from "react-icons/io5";
import { IoMdArrowBack } from "react-icons/io";

const AddTransporter = () => {
  const [showSideBar, setShowSideBar] = useState(false);
  const navigate = useNavigate();
  const { createTransporterMutation } = useTransporter();
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    GSTIN: "",
    state: "",
  });
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      await createTransporterMutation.mutateAsync(formData);
      navigate("/companyTransporters");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log(error.response?.data.message);
      } else {
        console.error("Unexpected error:", error);
      }
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
      <section className="w-full lg:w-4/5 overflow-y-auto h-full mb-16 flex justify-center items-center">
        <div className="w-[90%] lg:w-1/2 bg-white shadow-md rounded-lg py-6 flex flex-col items-center">
          <Link
            to={"/companyTransporters"}
            className="w-[90%] flex items-center"
          >
            <IoMdArrowBack className="w-8 h-8 mr-2" />
            <h3 className="">Go Back</h3>
          </Link>
          <h1 className="font-bold text-3xl m-3  text-main">
            Add New Transporter
          </h1>
          <form className="w-full" onSubmit={handleSubmit}>
            <div className="w-4/5 mx-auto relative mb-4">
              <CiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Transporter Name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-main focus:border-transparent outline-none transition text-base md:text-sm"
              />
            </div>
            <div className="w-4/5 mx-auto relative mb-4">
              <TbBuildingEstate className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Transporter Address"
                name="address"
                required
                value={formData.address}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-main focus:border-transparent outline-none transition text-base md:text-sm"
              />
            </div>
            <div className="w-4/5 mx-auto relative mb-4">
              <CiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Transporter GSTIN"
                name="GSTIN"
                required
                value={formData.GSTIN}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-main focus:border-transparent outline-none transition text-base md:text-sm"
              />
            </div>

            <div className="w-4/5 mx-auto relative mb-4">
              <TbBuildingEstate className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                name="state"
                required
                value={formData.state}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-main focus:border-transparent outline-none transition text-base md:text-sm"
              >
                <option value="">Select a state</option>
                {STATES.map((state) => (
                  <option
                    key={state.code}
                    value={`${state.code} - ${state.name}`}
                  >
                    {" "}
                    {state.code} - {state.name}
                  </option>
                ))}
              </select>
            </div>
            <button className="w-4/5 mx-auto text-lg font-semibold text-white bg-main px-8 py-1 rounded-xl cursor-pointer block">
              Add New Transporter
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default AddTransporter;
