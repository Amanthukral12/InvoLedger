import { useState } from "react";
import ClientHeader from "../components/UI/ClientHeader";
import { useTransaction } from "../hooks/transactions";
import Sidebar from "../components/UI/Sidebar";
import NavigationBar from "../components/UI/NavigationBar";
import { IoMenu } from "react-icons/io5";
import useTransactionStore from "../store/transactionStore";
import { Transaction } from "../types/types";
import { format } from "date-fns";
import { MdDelete } from "react-icons/md";
import axios from "axios";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useQuery } from "@tanstack/react-query";
import api from "../utils/api";
import ExportToExcel from "../components/ExportToExcel";

const Transactions = () => {
  const [showSideBar, setShowSideBar] = useState(false);
  const { id: clientId } = useParams();
  const { selectedYear, setSelectedYear } = useTransactionStore();
  const {
    transactionQuery,
    deleteTransactionMutation,
    createTransactionMutation,
  } = useTransaction();
  const transactions = transactionQuery.data ?? [];

  const { data: fetchedClient } = useQuery({
    queryKey: ["client", clientId],
    queryFn: async () => {
      const { data } = await api.get(`/client/${clientId}`);
      return data.data;
    },
    enabled: !!clientId,
  });

  const formattedData = transactions.map((txn: Transaction) => ({
    Date: new Date(txn.date).toLocaleDateString(),
    "DEBIT Amount": txn.type === "DEBIT" ? txn.amount : "",
    "CREDIT Amount": txn.type === "CREDIT" ? txn.amount : "",
  }));

  const [formData, setFormData] = useState<{
    date: Date;
    amount: number;
    type: "CREDIT" | "DEBIT";
  }>({
    date: new Date(),
    amount: 0,
    type: "CREDIT",
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
      if (!clientId) {
        toast.error("Client ID is missing.");
        return;
      }
      await createTransactionMutation.mutateAsync({
        clientId,
        formData,
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log(error.response?.data.message);
        toast.error(error.response?.data.message);
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
        <ClientHeader />
        <div className="mx-3 mb-4">
          <div className="flex justify-between mb-4 mx-0 lg:mx-2">
            <h3 className="text-lg lg:text-2xl font-semibold mb-4">Ledger</h3>
            <ExportToExcel
              data={formattedData}
              type="transactions"
              balance={`Client Balance: ${fetchedClient?.balance}`}
              headers={["Date", "DEBIT Amount", "CREDIT Amount"]}
              title={`Client Name: ${fetchedClient?.name ?? ""}`}
              clientName={fetchedClient?.name}
              year={selectedYear}
            />
          </div>
          <form
            className="w-full md:w-4/5 flex flex-col md:flex-row mb-4 justify-between p-2 md:mx-auto"
            onSubmit={handleSubmit}
          >
            <input
              type="date"
              name="date"
              onChange={handleChange}
              className="bg-white p-2 mb-2 md:mb-0 border border-gray-200 rounded-lg focus:ring-2 focus:ring-main focus:border-transparent outline-none transition text-base"
              value={format(new Date(formData.date), "yyyy-MM-dd")}
            />
            <input
              type="text"
              placeholder="amount"
              name="amount"
              onChange={handleChange}
              value={formData.amount}
              className="bg-white p-2 mb-2 md:mb-0 border border-gray-200 rounded-lg focus:ring-2 focus:ring-main focus:border-transparent outline-none transition text-base"
            />
            <select
              name="type"
              onChange={handleChange}
              value={formData.type}
              className="bg-white p-2 mb-2 md:mb-0 border border-gray-200 rounded-lg focus:ring-2 focus:ring-main focus:border-transparent outline-none transition text-base"
            >
              <option value="CREDIT">CREDIT</option>
              <option value="DEBIT">DEBIT</option>
            </select>
            <button className="text-lg font-semibold text-white bg-main px-8 py-1 rounded-xl cursor-pointer block">
              Add
            </button>
          </form>
          <div className="flex justify-center mb-3">
            <select
              className=" mr-3 bg-white p-2 rounded-lg text-lg font-medium focus:border-none focus:outline-none"
              onChange={(e) => setSelectedYear(Number(e.target.value))}
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
          <div className="w-full">
            {transactions.length !== 0 && (
              <table className="w-full text-lg border-separate border-spacing-y-2">
                <thead>
                  <tr className="bg-white rounded-md shadow-md">
                    <th className="md:px-2 py-1">Date</th>
                    <th className="md:px-2 py-1">Debit</th>
                    <th className="md:px-2 py-1">Credit</th>
                    <th className="md:px-2 py-1">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction: Transaction) => (
                    <tr
                      key={transaction.id}
                      className="text-center text-lg bg-white shadow-md"
                    >
                      <td className=" py-4">
                        {format(new Date(transaction.date), "dd/MM/yyyy")}
                      </td>
                      <td className="text-red-500">
                        {transaction.type === "DEBIT" ? transaction.amount : 0}
                      </td>
                      <td>
                        {transaction.type === "CREDIT" ? transaction.amount : 0}
                      </td>
                      <td>
                        <button>
                          <MdDelete
                            className="text-3xl cursor-pointer"
                            onClick={(e) => {
                              e.preventDefault();
                              deleteHandler({
                                clientId: transaction.clientId,
                                id: transaction.id,
                              });
                            }}
                          />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {transactions.length === 0 && (
              <p className="text-lg font-semibold">No Transactions found</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Transactions;
