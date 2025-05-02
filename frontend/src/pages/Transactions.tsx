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

const Transactions = () => {
  const [showSideBar, setShowSideBar] = useState(false);
  const { selectedYear, setSelectedYear } = useTransactionStore();
  const { transactionQuery } = useTransaction();
  const transactions = transactionQuery.data ?? [];
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
        <div className="mx-3">
          <div className="flex justify-between mb-4 mx-0 lg:mx-2">
            <h3 className="text-lg lg:text-2xl font-semibold mb-4">Ledger</h3>
          </div>
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
                          <MdDelete />
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
