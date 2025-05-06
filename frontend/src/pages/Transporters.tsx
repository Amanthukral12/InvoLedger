import { IoMenu } from "react-icons/io5";
import CompanyHeader from "../components/UI/CompanyHeader";
import NavigationBar from "../components/UI/NavigationBar";
import Sidebar from "../components/UI/Sidebar";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import useTransporterStore from "../store/transporterstore";
import { useTransporter } from "../hooks/transporters";
import { MdDelete } from "react-icons/md";
import { FaRegEdit } from "react-icons/fa";
import { Transporter } from "../types/types";
import axios from "axios";

const Transporters = () => {
  const [showSideBar, setShowSideBar] = useState(false);
  const { transporterQuery, deleteTransporterMutation } = useTransporter();
  const navigate = useNavigate();
  const setSelectedTransporter = useTransporterStore(
    (state) => state.setSelectedTransporter
  );
  const transporters = transporterQuery.data ?? [];
  const deleteHandler = async (id: string) => {
    try {
      await deleteTransporterMutation.mutateAsync(id);
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
      <section className="w-full lg:w-4/5 overflow-y-auto h-full mb-16">
        <CompanyHeader />
        <div className="mx-3">
          <div className="flex justify-between mb-4 mx-0 lg:mx-2">
            <h3 className="text-lg lg:text-2xl font-semibold mb-4">
              Transporters
            </h3>
            <Link to={"/companyTransporters/add"}>
              <button className="text-base md:text-lg font-semibold text-white bg-main px-4 md:px-8 py-1 rounded-xl cursor-pointer">
                Add New Transporter
              </button>
            </Link>
          </div>
          <div className="w-[90%] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
            {transporters?.map((transporter: Transporter) => {
              return (
                <div
                  key={transporter.id}
                  className="bg-white my-1 rounded-lg p-2 text-main shadow-md flex flex-col justify-between"
                >
                  <div className="flex w-full justify-between">
                    <div>
                      <p>Name: {transporter.name}</p>
                      <p>GSTIN: {transporter.GSTIN}</p>
                      <p>Address: {transporter.address}</p>
                      <p>State: {transporter.state}</p>
                    </div>
                    <div className="flex items-center">
                      <FaRegEdit
                        className="text-2xl mx-2"
                        onClick={(e) => {
                          e.preventDefault();
                          setSelectedTransporter(transporter);
                          navigate(
                            `/companytransporters/update/${transporter.id}`
                          );
                        }}
                      />
                      <MdDelete
                        className="text-2xl mx-2"
                        onClick={(e) => {
                          e.preventDefault();
                          deleteHandler(transporter.id);
                        }}
                      />
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

export default Transporters;
