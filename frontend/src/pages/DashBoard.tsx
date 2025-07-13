import { useState } from "react";
import NavigationBar from "../components/UI/NavigationBar";
import Sidebar from "../components/UI/Sidebar";
import { IoMenu } from "react-icons/io5";
import CompanyHeader from "../components/UI/CompanyHeader";
import useInvoiceStore from "../store/invoiceStore";
import { Link } from "react-router-dom";
import { useInvoice } from "../hooks/invoices";
import BarChartComponent from "../components/UI/BarChart";
import { monthNames } from "../constants/months";
import { generateExcel } from "../utils/generateExcel";
import { useAuth } from "../hooks/auth";
const DashBoard = () => {
  const [showSideBar, setShowSideBar] = useState(false);
  const { selectedYear, setYear, selectedMonth, setMonth } = useInvoiceStore();
  const { company } = useAuth();
  const { invoiceCountQuery, invoicesSummary, invoicesForMonthCompany } =
    useInvoice();
  const data = invoiceCountQuery.data;
  const companyInvoicesSummary = invoicesSummary.data;
  const invoicesForCompany = invoicesForMonthCompany.data?.invoicesData ?? [];
  const companyName = company?.name ?? "";
  const handleExcelExport = async () => {
    if (!invoicesForCompany || invoicesForCompany.length === 0) {
      alert("No invoices data available for export");
      return;
    }

    try {
      await generateExcel(
        invoicesForCompany,
        selectedMonth,
        selectedYear,
        companyName
      );
    } catch (error) {
      console.error("Error generating Excel:", error);
      alert("Error generating Excel file");
    }
  };

  const totalTax =
    companyInvoicesSummary?.total?._sum.totalCgst +
    companyInvoicesSummary?.total?._sum.totalSgst +
    companyInvoicesSummary?.total?._sum.totalIgst;
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
        <div className="w-full">
          <div className="flex justify-between mb-4 mx-3 lg:mx-3">
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
              onChange={(e) => setMonth(Number(e.target.value))}
              value={selectedMonth}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                <option key={month} value={month}>
                  {monthNames[month - 1]}
                </option>
              ))}
            </select>
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
          <div className="flex justify-end mx-3">
            <button
              onClick={handleExcelExport}
              className="text-lg font-semibold text-white bg-main px-8 py-1 rounded-xl cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={
                invoicesForMonthCompany.isLoading ||
                !invoicesForCompany ||
                invoicesForCompany.length === 0
              }
            >
              {invoicesForMonthCompany.isLoading
                ? "Loading..."
                : "Export to Excel"}
            </button>
          </div>
          <div className="my-4">
            {companyInvoicesSummary?.total?._sum && (
              <div className="flex flex-col items-center lg:flex-row lg:justify-between mx-3 font-medium text-lg">
                <p>
                  Total Amount:{" "}
                  {companyInvoicesSummary?.total?._sum.totalAmount
                    ? companyInvoicesSummary?.total?._sum.totalAmount
                    : 0}
                </p>
                <p>Total Tax: {totalTax ? totalTax : 0}</p>
                <p>
                  Total CGST:{" "}
                  {companyInvoicesSummary?.total?._sum.totalCgst
                    ? companyInvoicesSummary?.total?._sum.totalCgst
                    : 0}
                </p>
                <p>
                  Total SGST:{" "}
                  {companyInvoicesSummary?.total?._sum.totalSgst
                    ? companyInvoicesSummary?.total?._sum.totalSgst
                    : 0}
                </p>
                <p>
                  Total IGST:{" "}
                  {companyInvoicesSummary?.total?._sum.totalIgst
                    ? companyInvoicesSummary?.total?._sum.totalIgst
                    : 0}
                </p>
              </div>
            )}
          </div>
          <div className="mb-16 -ml-6">
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
