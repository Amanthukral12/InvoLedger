import { IoMenu } from "react-icons/io5";
import Sidebar from "../components/UI/Sidebar";
import NavigationBar from "../components/UI/NavigationBar";
import React, { useEffect, useState } from "react";
import { CiUser } from "react-icons/ci";
import { useClient } from "../hooks/client";
import { useTransporter } from "../hooks/transporters";
import { Client, Transporter } from "../types/types";
import { TbBuildingEstate } from "react-icons/tb";
import { STATES } from "../constants/state";
import { MdDelete } from "react-icons/md";
import { IoIosAddCircleOutline } from "react-icons/io";
import useAuthStore from "../store/authStore";
import { inWords } from "../utils/numToWords";
import { useInvoice } from "../hooks/invoices";
import axios from "axios";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
const AddInvoice = () => {
  const [showSideBar, setShowSideBar] = useState(false);
  const [clientState, setClientState] = useState("");
  const navigate = useNavigate();
  const { company } = useAuthStore();
  const { createInvoiceMutation } = useInvoice();
  const { clientQuery } = useClient();
  const { transporterQuery } = useTransporter();
  const clients = React.useMemo(
    () => clientQuery.data ?? [],
    [clientQuery.data]
  );
  const transporters = React.useMemo(
    () => transporterQuery.data ?? [],
    [transporterQuery.data]
  );
  const [formData, setFormData] = useState({
    invoiceNumber: "",
    invoiceDate: new Date(),
    clientId: "",
    shipToPartyId: "",
    amount: 0,
    cartage: 0,
    subTotal: 0,
    totalAmount: 0,
    totalAmountInWords: "",
    reverseCharge: false,
    transportMode: "",
    vehicleNumber: "",
    placeOfSupply: "",
  });

  const [invoiceItems, setInvoiceItems] = useState([
    {
      id: Date.now().toString(),
      invoiceId: "",
      description: "",
      quantity: 0,
      unitPrice: 0,
      hsnCode: "",
      amount: 0,
      taxPercent: 0,
      sgstPercent: 0,
      cgstPercent: 0,
      igstPercent: 0,
      sgst: 0,
      cgst: 0,
      igst: 0,
    },
  ]);

  const addItem = () => {
    setInvoiceItems([
      ...invoiceItems,
      {
        id: Date.now().toString(),
        invoiceId: "",
        description: "",
        quantity: 0,
        unitPrice: 0,
        hsnCode: "",
        amount: 0,
        taxPercent: 0,
        sgstPercent: 0,
        cgstPercent: 0,
        igstPercent: 0,
        sgst: 0,
        cgst: 0,
        igst: 0,
      },
    ]);
  };

  const handleItemChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    setInvoiceItems((prev) => {
      const updated = [...prev];
      const currentItem = updated[index];

      const updatedItem = {
        ...currentItem,
        [name]:
          name === "quantity" || name === "unitPrice" || name === "taxPercent"
            ? Number(value)
            : value,
      };

      const quantity =
        name === "quantity" ? Number(value) : currentItem.quantity;
      const unitPrice =
        name === "unitPrice" ? Number(value) : currentItem.unitPrice;
      updatedItem.amount = Number(quantity * unitPrice);

      const isSameState = clientState ? company?.state === clientState : false;
      const taxPercent =
        name === "taxPercent" ? Number(value) : currentItem.taxPercent;
      if (isSameState) {
        const halfTax = taxPercent / 2;
        updatedItem.cgstPercent = halfTax;
        updatedItem.sgstPercent = halfTax;
        updatedItem.igstPercent = 0;
        updatedItem.cgst = (halfTax * updatedItem.amount) / 100;
        updatedItem.sgst = (halfTax * updatedItem.amount) / 100;
        updatedItem.igst = 0;
      } else {
        updatedItem.cgstPercent = 0;
        updatedItem.sgstPercent = 0;
        updatedItem.igstPercent = taxPercent;
        updatedItem.cgst = 0;
        updatedItem.sgst = 0;
        updatedItem.igst = (taxPercent * updatedItem.amount) / 100;
      }

      updated[index] = updatedItem;
      return updated;
    });
  };

  const removeItem = (index: number) => {
    const updatedItems = [...invoiceItems];
    updatedItems.splice(index, 1);
    setInvoiceItems(updatedItems);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "clientId") {
      const selectedClient = clients.find(
        (client: Client) => client.id === value
      );
      if (selectedClient) {
        setClientState(selectedClient.state);
      }
    }
    const numericFields = ["cartage"];
    setFormData((prev) => ({
      ...prev,
      [name]: numericFields.includes(name) ? Number(value) : value,
    }));
  };

  useEffect(() => {
    const itemsAmount = invoiceItems.reduce(
      (sum, item) => sum + item.amount,
      0
    );
    const totalSgst = invoiceItems.reduce((sum, item) => sum + item.sgst, 0);
    const totalCgst = invoiceItems.reduce((sum, item) => sum + item.cgst, 0);
    const totalIgst = invoiceItems.reduce((sum, item) => sum + item.igst, 0);

    const subTotal = itemsAmount + Number(formData.cartage);
    const totalAmount = Math.floor(
      subTotal + Number(totalSgst) + Number(totalCgst) + Number(totalIgst)
    );
    const amountInWords = inWords(totalAmount)?.toLocaleUpperCase() || "";

    setFormData((prev) => ({
      ...prev,
      amount: itemsAmount,
      subTotal,
      totalAmount,
      totalAmountInWords: amountInWords,
    }));
  }, [invoiceItems, formData.cartage]);

  useEffect(() => {
    if (invoiceItems.length > 0) {
      const isSameState = clientState ? company?.state === clientState : false;

      setInvoiceItems((prevItems) =>
        prevItems.map((item) => {
          const taxPercent = item.taxPercent;
          if (isSameState) {
            const halfTax = taxPercent / 2;
            return {
              ...item,
              sgstPercent: halfTax,
              cgstPercent: halfTax,
              igstPercent: 0,
              sgst: (halfTax * item.amount) / 100,
              cgst: (halfTax * item.amount) / 100,
              igst: 0,
            };
          } else {
            return {
              ...item,
              sgstPercent: 0,
              cgstPercent: 0,
              igstPercent: taxPercent,
              sgst: 0,
              cgst: 0,
              igst: (taxPercent * item.amount) / 100,
            };
          }
        })
      );
    }
  }, [clientState, company?.state, invoiceItems.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    const finalInvoice = {
      ...formData,
      invoiceDate: new Date(formData.invoiceDate),
      invoiceItems,
    };
    try {
      e.preventDefault();
      await createInvoiceMutation.mutateAsync(finalInvoice);
      navigate("/companyInvoices");
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
    <div className="bg-[#edf7fd] bg-cover min-h-screen overflow-hidden lg:h-screen flex flex-col lg:flex-row w-full text-main">
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
      <section className="w-full lg:w-4/5 overflow-y-auto min-h-screen mb-16 flex justify-center items-start">
        <div className="w-[90%] bg-white shadow-md rounded-lg py-3 mb-4 mt-10 flex flex-col items-center px-1 md:px-0">
          <h1 className="font-bold text-3xl m-3  text-main">Add New Invoice</h1>
          <form className="w-full" onSubmit={handleSubmit}>
            <div className="w-full md:w-4/5 mx-auto flex">
              <div className="w-full md:w-4/5 mx-auto relative mb-4 mr-4">
                <CiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Invoice Number"
                  name="invoiceNumber"
                  required
                  value={formData.invoiceNumber}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-main focus:border-transparent outline-none transition text-base md:text-sm"
                />
              </div>
              <div className="w-full md:w-4/5 mx-auto relative mb-4">
                <CiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="date"
                  placeholder="Invoice Date"
                  name="invoiceDate"
                  required
                  value={format(new Date(formData.invoiceDate), "yyyy-MM-dd")}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-main focus:border-transparent outline-none transition text-base md:text-sm"
                />
              </div>
            </div>

            <div className="w-full md:w-4/5 mx-auto relative mb-4">
              <CiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                name="clientId"
                required
                value={formData.clientId}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-main focus:border-transparent outline-none transition text-base md:text-sm"
              >
                <option value="">Select Client</option>
                {clients?.map((client: Client) => (
                  <option key={client.id} value={client.id}>
                    {client.name} - {client.GSTIN}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-full md:w-4/5 mx-auto relative mb-4">
              <label htmlFor="placeOfSupply" className=" text-sm font-medium ">
                Place of Supply
              </label>
              <TbBuildingEstate className="absolute left-3 top-1/2 transform text-gray-400 h-5 w-5" />
              <select
                name="placeOfSupply"
                required
                value={formData.placeOfSupply}
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
            <div className="w-full md:w-4/5 mx-auto relative mb-4">
              <h3 className="text-2xl font-medium mb-2">Invoice Items</h3>
              <div className="flex flex-col gap-4">
                {invoiceItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="border rounded-lg p-4 shadow-sm bg-white"
                  >
                    <div className="mb-2">
                      <label className="font-semibold text-sm">
                        Description
                      </label>
                      <input
                        type="text"
                        name="description"
                        value={item.description}
                        onChange={(e) => handleItemChange(index, e)}
                        className="w-full p-1 border border-gray-300 mt-1"
                      />
                    </div>
                    <div className="mb-2">
                      <label className="font-semibold text-sm">HSN Code</label>
                      <input
                        type="text"
                        name="hsnCode"
                        value={item.hsnCode}
                        onChange={(e) => handleItemChange(index, e)}
                        className="w-full p-1 border border-gray-300 mt-1"
                      />
                    </div>
                    <div className="mb-2">
                      <label className="font-semibold text-sm">Quantity</label>
                      <input
                        type="number"
                        name="quantity"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, e)}
                        className="w-full p-1 border border-gray-300 mt-1"
                      />
                    </div>
                    <div className="mb-2">
                      <label className="font-semibold text-sm">
                        Unit Price
                      </label>
                      <input
                        type="number"
                        name="unitPrice"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, e)}
                        className="w-full p-1 border border-gray-300 mt-1"
                      />
                    </div>
                    <div className="mb-2">
                      <label className="font-semibold text-sm">Amount</label>
                      <input
                        type="number"
                        name="amount"
                        value={item.amount}
                        readOnly
                        className="w-full p-1 border bg-gray-100 cursor-not-allowed border-gray-300 mt-1"
                      />
                    </div>
                    <div className="mb-2">
                      <label className="font-semibold text-sm">
                        Tax Percent
                      </label>
                      <input
                        type="number"
                        name="taxPercent"
                        value={item.taxPercent}
                        onChange={(e) => handleItemChange(index, e)}
                        className="w-full p-1 border border-gray-300 mt-1"
                      />
                    </div>
                    <div className="mb-2">
                      <label className="font-semibold text-sm">
                        SGST Percent
                      </label>
                      <input
                        type="number"
                        name="sgstPercent"
                        value={item.sgstPercent}
                        readOnly
                        className="w-full p-1 border bg-gray-100 cursor-not-allowed border-gray-300 mt-1"
                      />
                    </div>
                    <div className="mb-2">
                      <label className="font-semibold text-sm">
                        CGST Percent
                      </label>
                      <input
                        type="number"
                        name="cgstPercent"
                        value={item.cgstPercent}
                        readOnly
                        className="w-full p-1 border bg-gray-100 cursor-not-allowed border-gray-300 mt-1"
                      />
                    </div>
                    <div className="mb-2">
                      <label className="font-semibold text-sm">
                        IGST Percent
                      </label>
                      <input
                        type="number"
                        name="igstPercent"
                        value={item.igstPercent}
                        readOnly
                        className="w-full p-1 border bg-gray-100 cursor-not-allowed border-gray-300 mt-1"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="ml-auto block"
                    >
                      <MdDelete className="text-5xl text-[#116456]" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addItem}
                className="text-[#116456] text-5xl"
              >
                <IoIosAddCircleOutline className="text-4xl mt-2" />
              </button>
            </div>

            <div className="w-full md:w-4/5 mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
              <div className="flex flex-col">
                <label htmlFor="amount" className="mb-1 text-sm font-medium ">
                  Amount
                </label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  placeholder="Amount"
                  readOnly
                  value={formData.amount}
                  className="pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-main focus:border-transparent outline-none text-sm"
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="cartage" className="mb-1 text-sm font-medium ">
                  Cartage
                </label>
                <input
                  type="number"
                  id="cartage"
                  name="cartage"
                  placeholder="Cartage"
                  value={Number(formData.cartage)}
                  onChange={handleChange}
                  className="pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-main focus:border-transparent outline-none text-sm"
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="subTotal" className="mb-1 text-sm font-medium ">
                  Sub Total
                </label>
                <input
                  type="number"
                  id="subTotal"
                  name="subTotal"
                  placeholder="Sub Total"
                  value={formData.subTotal}
                  onChange={handleChange}
                  className="pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-main focus:border-transparent outline-none text-sm"
                />
              </div>
            </div>
            <div className="w-full md:w-4/5 mx-auto flex mb-4">
              <div className="flex flex-col mr-4 w-1/3 md:w-1/5">
                <label
                  htmlFor="totalAmount"
                  className="mb-1 text-sm font-medium "
                >
                  Total Amount
                </label>
                <input
                  type="number"
                  name="totalAmount"
                  placeholder="Total Amount"
                  value={formData.totalAmount}
                  readOnly
                  className="pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-main focus:border-transparent outline-none text-sm"
                />
              </div>
              <div className="flex flex-col w-2/3 md:w-4/5">
                <label
                  htmlFor="totalAmountInWords"
                  className="mb-1 text-sm font-medium "
                >
                  Total Amount in Words
                </label>
                <input
                  type="text"
                  name="totalAmountInWords"
                  placeholder="Total Amount in Words"
                  value={formData.totalAmountInWords}
                  readOnly
                  className="pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-main focus:border-transparent outline-none text-sm"
                />
              </div>
            </div>

            <div className="w-full md:w-4/5 mx-auto relative mb-4">
              <CiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                name="shipToPartyId"
                value={formData.shipToPartyId}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-main focus:border-transparent outline-none transition text-base md:text-sm"
              >
                <option value="">Select Transporter</option>
                {transporters?.map((transporter: Transporter) => (
                  <option key={transporter.id} value={transporter.id}>
                    {transporter.name} - {transporter.GSTIN}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-full md:w-4/5 mx-auto flex">
              <div className="w-full md:w-4/5 mx-auto relative mb-4 mr-4">
                <CiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="input"
                  placeholder="Transport Mode"
                  name="transportMode"
                  required
                  value={formData.transportMode}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-main focus:border-transparent outline-none transition text-base md:text-sm"
                />
              </div>
              <div className="w-full md:w-4/5 mx-auto relative mb-4">
                <CiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="input"
                  placeholder="Vehicle Number"
                  name="vehicleNumber"
                  required
                  value={formData.vehicleNumber}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-main focus:border-transparent outline-none transition text-base md:text-sm"
                />
              </div>
            </div>
            <button className="w-full md:w-4/5 mx-auto text-lg font-semibold text-white bg-main px-8 py-1 rounded-xl cursor-pointer block">
              Add New Invoice
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default AddInvoice;
