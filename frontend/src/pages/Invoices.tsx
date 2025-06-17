import { IoMenu } from "react-icons/io5";
import CompanyHeader from "../components/UI/CompanyHeader";
import NavigationBar from "../components/UI/NavigationBar";
import Sidebar from "../components/UI/Sidebar";
import { useInvoice } from "../hooks/invoices";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useInvoiceStore from "../store/invoiceStore";
import { CustomInvoiceData } from "../types/types";
import { format } from "date-fns";
import { FaRegEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { monthNames } from "../constants/months";
import axios from "axios";
import Loading from "../components/UI/Loading";
import { debounce } from "../utils/debounce";
const Invoices = () => {
  const [showSideBar, setShowSideBar] = useState(false);

  const {
    selectedYear,
    selectedMonth,
    setMonth,
    setYear,
    currentPage,
    pageSize,
    setCurrentPage,
    searchTerm,
    setSearchTerm,
  } = useInvoiceStore();
  const { invoiceQuery, deleteInvoiceMutation, generateInvoiceMutation } =
    useInvoice();
  const [invoiceType, setInvoiceType] = useState("ORIGINAL");
  const [inputValue, setInputValue] = useState(searchTerm);
  const data = invoiceQuery.data;
  const invoices = data?.invoices ?? [];
  const totalCount = data?.totalCount ?? 0;
  const navigate = useNavigate();

  const deleteHandler = async (id: string) => {
    try {
      await deleteInvoiceMutation.mutateAsync(id);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log(error.response?.data.message);
      } else {
        console.error("Unexpected error:", error);
      }
    }
  };

  const handleDownload = async ({
    id,
    invoiceNumber,
    clientName,
    invoiceType,
  }: {
    id: string;
    invoiceNumber: number;
    clientName: string;
    invoiceType: string;
  }) => {
    await generateInvoiceMutation.mutateAsync({
      id,
      invoiceNumber,
      clientName,
      invoiceType,
    });
  };

  const debouncedSetSearchTerm = useCallback(
    debounce((value: string) => {
      setSearchTerm(value);
    }, 500),
    []
  );

  useEffect(() => {
    debouncedSetSearchTerm(inputValue);
  }, [inputValue, debouncedSetSearchTerm]);

  if (invoiceQuery.isLoading) {
    return <Loading />;
  }

  if (invoiceQuery.isError) {
    return <p>Error loading invoices: {invoiceQuery.error.message}</p>;
  }

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
            <h3 className="text-lg lg:text-2xl font-semibold mb-4">Invoices</h3>
            <Link to={"/companyInvoices/add"}>
              <button className="text-lg font-semibold text-white bg-main px-8 py-1 rounded-xl cursor-pointer">
                Add New Invoice
              </button>
            </Link>
          </div>
          <div className="w-[90%] mx-auto">
            <input
              type="text"
              placeholder="Search Invoices..."
              className="w-full p-2 border-1 bg-white  rounded-lg focus:ring-2 focus:ring-main focus:border-transparent outline-none mt-1 mb-4"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
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
          {totalCount !== 0 && (
            <p className="text-lg font-semibold">Total {totalCount} Invoices</p>
          )}
          {totalCount === 0 && (
            <p className="text-lg font-semibold">No Invoices found</p>
          )}
          <div className="w-[90%] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 mb-8">
            {invoices.map((invoice: CustomInvoiceData) => (
              <div
                key={invoice.id}
                className="bg-white my-1 rounded-lg p-2 text-main shadow-md flex flex-col justify-between font-medium"
              >
                <div className="flex w-full justify-between">
                  <div className="leading-8">
                    <p>Invoice Number: {invoice.invoiceNumber}</p>
                    <p>Client Name: {invoice.client.name}</p>
                    <p>
                      Invoice Date:{" "}
                      {format(new Date(invoice.invoiceDate), "dd/MM/yyyy")}
                    </p>
                    <div>
                      <label>Invoice Type: </label>
                      <select onChange={(e) => setInvoiceType(e.target.value)}>
                        <option value="ORIGINAL">ORIGINAL</option>
                        <option value="DUPLICATE">DUPLICATE</option>
                        <option value="OFFICE COPY">OFFICE COPY</option>
                      </select>
                    </div>

                    <button
                      className="text-lg font-semibold text-white bg-main px-8 py-1 rounded-xl cursor-pointer block my-2 mx-auto"
                      onClick={() => {
                        handleDownload({
                          id: invoice.id,
                          invoiceNumber: invoice.invoiceNumber,
                          clientName: invoice.client.name,
                          invoiceType,
                        });
                      }}
                    >
                      Download Invoice
                    </button>
                  </div>
                  <div className="flex items-center">
                    <FaRegEdit
                      className="text-2xl mx-2"
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(`/companyInvoices/update/${invoice.id}`);
                      }}
                    />
                    <MdDelete
                      className="text-2xl mx-2"
                      onClick={(e) => {
                        e.preventDefault();
                        deleteHandler(invoice.id);
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          {totalCount > 0 && (
            <div className="flex justify-center items-center gap-4 my-6">
              <button
                onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                className="px-4 py-2 bg-main text-white rounded cursor-pointer disabled:cursor-default disabled:opacity-50"
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span className="text-lg font-semibold">
                Page {currentPage} of {Math.ceil(totalCount / pageSize)}
              </span>
              <button
                onClick={() => {
                  setCurrentPage(
                    Math.min(currentPage + 1, Math.ceil(totalCount / pageSize))
                  );
                }}
                className="px-4 py-2 bg-main text-white rounded cursor-pointer disabled:cursor-default disabled:opacity-50"
                disabled={currentPage >= Math.ceil(totalCount / pageSize)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Invoices;
