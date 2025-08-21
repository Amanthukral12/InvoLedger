import { lazy, Suspense, useState } from "react";
import NavigationBar from "../components/UI/NavigationBar";
import Sidebar from "../components/UI/Sidebar";
import { IoMenu } from "react-icons/io5";
import CompanyHeader from "../components/UI/CompanyHeader";
import { Link } from "react-router-dom";
import { useInvoice } from "../hooks/invoices";
import { monthNames } from "../constants/months";
import { generateExcel } from "../utils/generateExcel";
import { useAuth } from "../hooks/auth";
import { usePurchase } from "../hooks/purchases";
import { generateExcelForPurchase } from "../utils/generateExcelForPurchase";
import { useFilterStore } from "../store/filterStore";

const BarChartComponent = lazy(() => import("../components/UI/BarChart"));

const DashBoard = () => {
  const [showSideBar, setShowSideBar] = useState(false);
  const { selectedYear, setYear, selectedMonth, setMonth } = useFilterStore();
  const { company } = useAuth();
  const { invoiceCountQuery, invoicesSummary, invoicesForMonthCompany } =
    useInvoice();
  const { purchasesForMonthCompany, purchasesSummary } = usePurchase();
  const data = invoiceCountQuery.data;
  const companyInvoicesSummary = invoicesSummary.data;
  const invoicesForCompany = invoicesForMonthCompany.data?.invoicesData ?? [];
  const purchasesForCompany = purchasesForMonthCompany.data ?? [];
  const companyPurchasesSummary = purchasesSummary.data;
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
  const handleExcelExportForPurchases = async () => {
    if (!purchasesForCompany || purchasesForCompany.length === 0) {
      alert("No purchases data available for export");
      return;
    }

    try {
      await generateExcelForPurchase(
        purchasesForCompany,
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

  const totalPurchaseTax =
    companyPurchasesSummary?.total?._sum.totalCGST +
    companyPurchasesSummary?.total?._sum.totalSGST +
    companyPurchasesSummary?.total?._sum.totalIGST;

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
          <div className="bg-white rounded-lg shadow-xl mx-3 py-4 px-2 mb-4">
            <div className="flex justify-between ">
              <h3 className="text-lg lg:text-xl font-semibold mb-4">
                Sale Summary
              </h3>
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
                      ? companyInvoicesSummary?.total?._sum.totalAmount.toFixed(
                          2
                        )
                      : 0}
                  </p>
                  <p>Total Tax: {totalTax ? totalTax.toFixed(2) : 0}</p>
                  <p>
                    Total CGST:{" "}
                    {companyInvoicesSummary?.total?._sum.totalCgst
                      ? companyInvoicesSummary?.total?._sum.totalCgst.toFixed(2)
                      : 0}
                  </p>
                  <p>
                    Total SGST:{" "}
                    {companyInvoicesSummary?.total?._sum.totalSgst
                      ? companyInvoicesSummary?.total?._sum.totalSgst.toFixed(2)
                      : 0}
                  </p>
                  <p>
                    Total IGST:{" "}
                    {companyInvoicesSummary?.total?._sum.totalIgst
                      ? companyInvoicesSummary?.total?._sum.totalIgst.toFixed(2)
                      : 0}
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-xl mx-3 py-4 px-2">
            <div className="flex justify-between ">
              <h3 className="text-lg lg:text-xl font-semibold mb-4">
                Purchase Summary
              </h3>
              <button
                onClick={handleExcelExportForPurchases}
                className="text-lg font-semibold text-white bg-main px-8 py-1 rounded-xl cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={
                  purchasesForMonthCompany.isLoading ||
                  !purchasesForCompany ||
                  purchasesForCompany.length === 0
                }
              >
                {purchasesForMonthCompany.isLoading
                  ? "Loading..."
                  : "Export to Excel"}
              </button>
            </div>
            <div className="my-4">
              {companyPurchasesSummary?.total?._sum && (
                <div className="flex flex-col items-center lg:flex-row lg:justify-between mx-3 font-medium text-lg">
                  <p>
                    Total Amount:{" "}
                    {companyPurchasesSummary?.total?._sum.totalAmount
                      ? companyPurchasesSummary?.total?._sum.totalAmount.toFixed(
                          2
                        )
                      : 0}
                  </p>
                  <p>
                    Total Tax:{" "}
                    {totalPurchaseTax ? totalPurchaseTax.toFixed(2) : 0}
                  </p>
                  <p>
                    Total CGST:{" "}
                    {companyPurchasesSummary?.total?._sum.totalCGST
                      ? companyPurchasesSummary?.total?._sum.totalCGST.toFixed(
                          2
                        )
                      : 0}
                  </p>
                  <p>
                    Total SGST:{" "}
                    {companyPurchasesSummary?.total?._sum.totalSGST
                      ? companyPurchasesSummary?.total?._sum.totalSGST.toFixed(
                          2
                        )
                      : 0}
                  </p>
                  <p>
                    Total IGST:{" "}
                    {companyPurchasesSummary?.total?._sum.totalIGST
                      ? companyPurchasesSummary?.total?._sum.totalIGST.toFixed(
                          2
                        )
                      : 0}
                  </p>
                </div>
              )}
            </div>
          </div>
          <h3 className="text-lg lg:text-xl font-semibold mt-4 mx-3">
            Invoices Counts
          </h3>
          <div className="mb-16 -ml-6">
            <Suspense fallback={<div>Loading Chart...</div>}>
              {data && data.monthlyCount && (
                <BarChartComponent data={data.monthlyCount} />
              )}
            </Suspense>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DashBoard;
