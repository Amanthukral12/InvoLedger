import { Link, useNavigate, useParams } from "react-router-dom";
import useClientStore from "../store/clientstore";
import api from "../utils/api";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useClient } from "../hooks/client";
import { STATES } from "../constants/state";
import { TbBuildingEstate } from "react-icons/tb";
import { IoMdArrowBack, IoMdPhonePortrait } from "react-icons/io";
import { TfiEmail } from "react-icons/tfi";
import { CiUser } from "react-icons/ci";
import Sidebar from "../components/UI/Sidebar";
import { IoMenu } from "react-icons/io5";
import NavigationBar from "../components/UI/NavigationBar";
import axios from "axios";

const UpdateClient = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showSideBar, setShowSideBar] = useState(false);
  const selectedClient = useClientStore((state) => state.selectedClient);
  const setSelectedClient = useClientStore((state) => state.setSelectedClient);
  const { updateClientMutation } = useClient();
  const [formData, setFormData] = useState({
    name: "",
    GSTIN: "",
    address: "",
    email: "",
    phonenumber: "",
    state: "",
  });

  const { data: fetchedClient, isLoading } = useQuery({
    queryKey: ["client", id],
    queryFn: async () => {
      const { data } = await api.get(`/client/${id}`);
      setSelectedClient(data.data);
      return data.data;
    },
    enabled: !selectedClient,
  });

  const client = selectedClient || fetchedClient;

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name || "",
        GSTIN: client.GSTIN || "",
        address: client.address || "",
        email: client.email || "",
        phonenumber: client.phonenumber || "",
        state: client.state || "",
      });
    }
  }, [client]);

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
      await updateClientMutation.mutateAsync({ id, updates: formData });
      navigate("/companyClients");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log(error.response?.data.message);
      } else {
        console.error("Unexpected error:", error);
      }
    }
  };

  if (isLoading) return <p>Loading...</p>;

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
          <Link to={"/companyClients"} className="w-[90%] flex items-center">
            <IoMdArrowBack className="w-8 h-8 mr-2" />
            <h3 className="">Go Back</h3>
          </Link>
          <h1 className="font-bold text-3xl m-3  text-main">Add New Client</h1>
          <form className="w-full" onSubmit={handleSubmit}>
            <div className="w-4/5 mx-auto relative mb-4">
              <CiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Client Name"
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
                placeholder="Client Address"
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
                placeholder="Client GSTIN"
                name="GSTIN"
                required
                value={formData.GSTIN}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-main focus:border-transparent outline-none transition text-base md:text-sm"
              />
            </div>
            <div className="w-4/5 mx-auto relative mb-4">
              <TfiEmail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Client Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-main focus:border-transparent outline-none transition text-base md:text-sm"
              />
            </div>
            <div className="w-4/5 mx-auto relative mb-4">
              <IoMdPhonePortrait className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Client Phone Number"
                name="phonenumber"
                value={formData.phonenumber}
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
              Update Client
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default UpdateClient;
