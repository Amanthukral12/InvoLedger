import { useEffect, useState } from "react";
import { useClient } from "../hooks/client";
import CompanyHeader from "../components/UI/CompanyHeader";
import NavigationBar from "../components/UI/NavigationBar";
import { IoMenu } from "react-icons/io5";
import Sidebar from "../components/UI/Sidebar";
import { Client } from "../types/types";
import { MdDelete } from "react-icons/md";
import { FaRegEdit } from "react-icons/fa";
import { Link } from "react-router-dom";

const Clients = () => {
  const { clientQuery } = useClient();
  const [clients, setClients] = useState([]);
  const [showSideBar, setShowSideBar] = useState(false);

  useEffect(() => {
    const fetchClients = async () => {
      const res = await clientQuery.refetch();
      if (res.data) {
        setClients(res.data);
      }
    };
    fetchClients();
  }, []);

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
            <h3 className="text-lg font-semibold mb-4">Clients</h3>
            <Link to={"/companyClients/add"}>
              <button className="text-lg font-semibold text-white bg-main px-8 py-1 rounded-xl cursor-pointer">
                Add New Client
              </button>
            </Link>
          </div>
          <div className="w-[90%] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
            {clients?.map((client: Client) => {
              return (
                <div
                  key={client.id}
                  className="bg-white my-1 rounded-lg p-2 text-main shadow-md flex flex-col justify-between"
                >
                  <div className="flex w-full justify-between">
                    <div>
                      <p>Name: {client.name}</p>
                      <p>GSTIN: {client.GSTIN}</p>
                      {client.phonenumber ? (
                        <p>Phone Number: {client.phonenumber}</p>
                      ) : null}
                      <p>Address: {client.address}</p>
                      {client.email ? <p>Email: {client.email}</p> : null}
                      <p>State: {client.state}</p>
                    </div>
                    <div className="flex items-center">
                      <FaRegEdit
                        className="text-2xl mx-2"
                        onClick={(e) => {
                          e.preventDefault();
                        }}
                      />
                      <MdDelete
                        className="text-2xl mx-2"
                        onClick={(e) => {
                          e.preventDefault();
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

export default Clients;
