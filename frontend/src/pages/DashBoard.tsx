import { useState } from "react";
import NavigationBar from "../components/UI/NavigationBar";
import Sidebar from "../components/UI/Sidebar";
import { IoMenu } from "react-icons/io5";
import CompanyHeader from "../components/UI/CompanyHeader";
import useInvoiceStore from "../store/invoiceStore";
import { Link } from "react-router-dom";
import { useInvoice } from "../hooks/invoices";
import BarChartComponent from "../components/UI/BarChart";
const DashBoard = () => {
  const [showSideBar, setShowSideBar] = useState(false);
  const { selectedYear, setYear } = useInvoiceStore();
  const { invoiceCountQuery } = useInvoice();
  const data = invoiceCountQuery.data;
  return (
    <div className="bg-[#edf7fd] bg-cover min-h-screen lg:h-screen overflow-hidden flex flex-col lg:flex-row w-full text-main">
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
      <section className="w-full lg:w-4/5 overflow-y-auto h-full">
        <CompanyHeader />
        <div className="mx-3">
          <div className="flex justify-between mb-4 mx-0 lg:mx-2">
            <h3 className="text-lg lg:text-2xl font-semibold mb-4">Invoices</h3>
            <Link to={"/companyInvoices/add"}>
              <button className="text-lg font-semibold text-white bg-main px-8 py-1 rounded-xl cursor-pointer">
                Add New Invoice
              </button>
            </Link>
          </div>
          <div className="flex justify-center mb-3">
            <select
              className=" mr-3 bg-white p-2 rounded-lg text-lg font-medium focus:border-none focus:outline-none"
              onChange={(e) => setYear(Number(e.target.value))}
              value={selectedYear}
            >
              {Array.from(
                { length: 60 },
                (_, i) => new Date().getFullYear() - 29 + i
              ).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-16">
            {data && data.monthlyCount && (
              <BarChartComponent data={data.monthlyCount} />
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default DashBoard;
