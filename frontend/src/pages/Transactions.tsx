import React, { useState } from "react";
import { useTransaction } from "../hooks/transactions";
import Sidebar from "../components/UI/Sidebar";
import NavigationBar from "../components/UI/NavigationBar";
import { IoMenu } from "react-icons/io5";
import { Client, CustomTransactionData } from "../types/types";
import { format } from "date-fns";
import { MdDelete } from "react-icons/md";
import axios from "axios";
import { toast } from "react-toastify";
import CompanyHeader from "../components/UI/CompanyHeader";
import { useClient } from "../hooks/client";
import { monthNames } from "../constants/months";
import { useFilterStore } from "../store/filterStore";
import { useAuth } from "../hooks/auth";
import { generateExcelForTransactions } from "../utils/generateExcelForTransactions";

const Transactions = () => {
  const [showSideBar, setShowSideBar] = useState(false);
  const { selectedYear, setYear, selectedMonth, setMonth } = useFilterStore();
  const { company } = useAuth();
  const { clientQuery } = useClient();
  const {
    getAllTransactionsForCompanyForMonth,
    getAllTransactionsForCompanyForMonthGroupedByClient,
    deleteTransactionMutation,
    createTransactionMutation,
  } = useTransaction();
  const transactions = getAllTransactionsForCompanyForMonth.data ?? [];
  const transactionsGroupedByClient =
    getAllTransactionsForCompanyForMonthGroupedByClient.data ?? [];
  const clients = React.useMemo(
    () => clientQuery.data ?? [],
    [clientQuery.data]
  );

  const companyName = company?.name || "";

  const [formData, setFormData] = useState<{
    date: Date;
    clientId: string;
    description: string;
    bankName: string;
    amount: number;
    type: "CREDIT" | "DEBIT";
  }>({
    date: new Date(),
    amount: 0,
    type: "CREDIT",
    clientId: "",
    description: "",
    bankName: "",
  });

  const deleteHandler = async ({
    clientId,
    id,
  }: {
    clientId: string;
    id: string;
  }) => {
    try {
      await deleteTransactionMutation.mutateAsync({ clientId, id });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log(error.response?.data.message);
      } else {
        console.error("Unexpected error:", error);
      }
    }
  };

  const handleExcelExport = async () => {
    if (!getAllTransactionsForCompanyForMonth || transactions.length === 0) {
      alert("No invoices data available for export");
      return;
    }

    try {
      await generateExcelForTransactions(
        transactionsGroupedByClient,
        selectedMonth,
        selectedYear,
        companyName
      );
    } catch (error) {
      console.error("Error generating Excel:", error);
      alert("Error generating Excel file");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "amount"
          ? Number(value)
          : name === "date"
          ? new Date(value)
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      if (!formData.clientId) {
        toast.error("Client ID is missing.");
        return;
      }

      await createTransactionMutation.mutateAsync({
        clientId: formData.clientId,
        formData,
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log(error.response?.data.message);
        toast.error(error.response?.data.message);
      } else {
        console.error("Unexpected error:", error);
      }
    } finally {
      setFormData({
        date: new Date(),
        amount: 0,
        type: "CREDIT",
        clientId: "",
        description: "",
        bankName: "",
      });
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
        <div className="mx-3 mb-4">
          <div className="flex justify-between mb-4 mx-0 lg:mx-2">
            <h3 className="text-lg lg:text-2xl font-semibold mb-4">
              Transactions
            </h3>
            <button
              onClick={handleExcelExport}
              className="text-lg font-semibold text-white bg-main px-8 py-1 rounded-xl cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={
                getAllTransactionsForCompanyForMonth.isLoading ||
                !getAllTransactionsForCompanyForMonth ||
                transactions.length === 0
              }
            >
              {getAllTransactionsForCompanyForMonth.isLoading
                ? "Loading..."
                : "Export to Excel"}
            </button>
          </div>
          <form
            className="w-full md:w-4/5 flex flex-col mb-4 justify-between p-2 md:mx-auto"
            onSubmit={handleSubmit}
          >
            <input
              type="date"
              name="date"
              onChange={handleChange}
              className="bg-white p-2 mb-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-main focus:border-transparent outline-none transition text-base"
              value={format(new Date(formData.date), "yyyy-MM-dd")}
            />
            <select
              name="clientId"
              required
              value={formData.clientId}
              onChange={handleChange}
              className="bg-white p-2 mb-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-main focus:border-transparent outline-none transition text-base"
            >
              <option value="">Select Client</option>
              {clients?.map((client: Client) => (
                <option key={client.id} value={client.id}>
                  {client.name} - {client.GSTIN}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Description"
              name="description"
              onChange={handleChange}
              value={formData.description}
              className="bg-white p-2 mb-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-main focus:border-transparent outline-none transition text-base"
            />
            <input
              type="text"
              placeholder="amount"
              name="amount"
              onChange={handleChange}
              value={formData.amount}
              className="bg-white p-2 mb-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-main focus:border-transparent outline-none transition text-base"
            />
            <input
              type="text"
              placeholder="Bank Name"
              name="bankName"
              onChange={handleChange}
              value={formData.bankName}
              className="bg-white p-2 mb-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-main focus:border-transparent outline-none transition text-base"
            />
            <select
              name="type"
              onChange={handleChange}
              value={formData.type}
              className="bg-white p-2 mb-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-main focus:border-transparent outline-none transition text-base"
            >
              <option value="CREDIT">CREDIT</option>
              <option value="DEBIT">DEBIT</option>
            </select>
            <button className=" text-lg font-semibold text-white bg-main px-8 py-1 rounded-xl cursor-pointer block my-2">
              Add
            </button>
          </form>
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

          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-lg border-separate border-spacing-y-2">
              <thead>
                <tr className="bg-white shadow-md">
                  <th className="px-2 py-1">Date</th>
                  <th className="px-2 py-1">Client</th>
                  <th className="px-2 py-1">Description</th>
                  <th className="px-2 py-1">Debit</th>
                  <th className="px-2 py-1">Credit</th>
                  <th className="px-2 py-1">Bank</th>
                  <th className="px-2 py-1">Action</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction: CustomTransactionData) => (
                  <tr
                    key={transaction.id}
                    className="bg-white text-sm shadow-md"
                  >
                    <td className="py-3 text-center">
                      {format(new Date(transaction.date), "dd/MM/yyyy")}
                    </td>
                    <td className="py-3 text-wrap text-center">
                      {transaction.client?.name}
                    </td>
                    <td className="py-3 text-wrap text-center">
                      {transaction.description}
                    </td>
                    <td className="text-red-500 text-center">
                      {transaction.type === "DEBIT" ? transaction.amount : "-"}
                    </td>
                    <td className="text-green-500 text-center">
                      {transaction.type === "CREDIT" ? transaction.amount : "-"}
                    </td>
                    <td className="py-3 text-center">{transaction.bankName}</td>
                    <td>
                      <MdDelete
                        className="text-2xl cursor-pointer mx-auto"
                        onClick={() =>
                          deleteHandler({
                            clientId: transaction.clientId,
                            id: transaction.id,
                          })
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-4">
            {transactions.map((transaction: CustomTransactionData) => (
              <div
                key={transaction.id}
                className="bg-white p-3 rounded-lg shadow-md text-sm"
              >
                <p>
                  <span className="font-semibold">Date:</span>{" "}
                  {format(new Date(transaction.date), "dd/MM/yyyy")}
                </p>
                <p>
                  <span className="font-semibold">Client:</span>{" "}
                  {transaction.client?.name}
                </p>
                <p>
                  <span className="font-semibold">Description:</span>{" "}
                  {transaction.description}
                </p>
                <p>
                  <span className="font-semibold">Debit:</span>{" "}
                  {transaction.type === "DEBIT" ? transaction.amount : "-"}
                </p>
                <p>
                  <span className="font-semibold">Credit:</span>{" "}
                  {transaction.type === "CREDIT" ? transaction.amount : "-"}
                </p>
                <p>
                  <span className="font-semibold">Bank:</span>{" "}
                  {transaction.bankName}
                </p>
                <button className="mt-2 flex items-center">
                  <MdDelete
                    className="text-4xl cursor-pointer"
                    onClick={() =>
                      deleteHandler({
                        clientId: transaction.clientId,
                        id: transaction.id,
                      })
                    }
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Transactions;
