import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../utils/api";
import { inWords } from "../utils/numToWords";
import useAuthStore from "../store/authStore";
import { useClient } from "../hooks/client";
import { useTransporter } from "../hooks/transporters";
import NavigationBar from "../components/UI/NavigationBar";
import { IoMenu } from "react-icons/io5";
import Sidebar from "../components/UI/Sidebar";
import { CiUser } from "react-icons/ci";
import { format } from "date-fns";
import { Client, Invoice, Transporter } from "../types/types";
import { TbBuildingEstate } from "react-icons/tb";
import { STATES } from "../constants/state";
import { MdDelete } from "react-icons/md";
import { IoIosAddCircleOutline } from "react-icons/io";
import axios from "axios";
import { useInvoice } from "../hooks/invoices";
import Loading from "../components/UI/Loading";

const UpdateInvoice = () => {
  const { id } = useParams();
  const [showSideBar, setShowSideBar] = useState(false);
  const [clientState, setClientState] = useState("");
  const navigate = useNavigate();
  const { company } = useAuthStore();
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
  const { updateInvoiceMutation } = useInvoice();
  const { data: fetchedInvoice, isLoading } = useQuery<Invoice>({
    queryKey: ["invoice", id],
    queryFn: async () => {
      const { data } = await api.get(`/invoice/${id}`);
      return data.data;
    },
    enabled: !!id,
  });

  const [formData, setFormData] = useState({
    invoiceNumber: "",
    invoiceDate: new Date(),
    clientId: "",
    shipToPartyId: "",
    amount: 0,
    cartage: 0,
    subTotal: 0,
    taxPercent: 0,
    sgstPercent: 0,
    cgstPercent: 0,
    igstPercent: 0,
    sgst: 0,
    cgst: 0,
    igst: 0,
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
    },
  ]);

  useEffect(() => {
    if (fetchedInvoice) {
      setFormData({
        invoiceNumber: fetchedInvoice.invoiceNumber || "",
        invoiceDate: fetchedInvoice.invoiceDate
          ? new Date(fetchedInvoice.invoiceDate)
          : new Date(),
        clientId: fetchedInvoice.clientId || "",
        shipToPartyId: fetchedInvoice.shipToPartyId || "",
        amount: fetchedInvoice.amount || 0,
        cartage: fetchedInvoice.cartage || 0,
        subTotal: fetchedInvoice.subTotal || 0,
        taxPercent: fetchedInvoice.taxPercent || 0,
        sgstPercent: fetchedInvoice.sgstPercent || 0,
        cgstPercent: fetchedInvoice.cgstPercent || 0,
        igstPercent: fetchedInvoice.igstPercent || 0,
        sgst: fetchedInvoice.sgst || 0,
        cgst: fetchedInvoice.cgst || 0,
        igst: fetchedInvoice.igst || 0,
        totalAmount: fetchedInvoice.totalAmount || 0,
        totalAmountInWords: fetchedInvoice.totalAmountInWords || "",
        reverseCharge: fetchedInvoice.reverseCharge || false,
        transportMode: fetchedInvoice.transportMode || "",
        vehicleNumber: fetchedInvoice.vehicleNumber || "",
        placeOfSupply: fetchedInvoice.placeOfSupply || "",
      });
      setInvoiceItems(fetchedInvoice.invoiceItems || []);
    }
  }, [fetchedInvoice]);

  useEffect(() => {
    const selectedClient = clients.find(
      (client: Client) => client.id === formData.clientId
    );
    if (selectedClient) {
      setClientState(selectedClient.state);
    }
  }, [formData.clientId, clients]);

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
          name === "quantity" || name === "unitPrice" ? Number(value) : value,
      };

      const quantity =
        name === "quantity" ? Number(value) : currentItem.quantity;
      const unitPrice =
        name === "unitPrice" ? Number(value) : currentItem.unitPrice;
      updatedItem.amount = Number(quantity * unitPrice);

      updated[index] = updatedItem;
      return updated;
    });
  };

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
      },
    ]);
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

    const numericFields = [
      "cartage",
      "cgst",
      "sgst",
      "igst",
      "taxPercent",
      "cgstPercent",
      "sgstPercent",
      "igstPercent",
    ];
    setFormData((prev) => ({
      ...prev,
      [name]: numericFields.includes(name) ? Number(value) : value,
    }));
  };

  useEffect(() => {
    const isSameState = clientState ? company?.state === clientState : false;
    if (isSameState) {
      const halfTax = formData.taxPercent / 2;
      const cgst = (halfTax * formData.subTotal) / 100;
      const sgst = (halfTax * formData.subTotal) / 100;

      setFormData((prev) => ({
        ...prev,
        cgstPercent: halfTax,
        sgstPercent: halfTax,
        igstPercent: 0,
        cgst,
        sgst,
        igst: 0,
      }));
    } else {
      const igst = (formData.taxPercent * formData.subTotal) / 100;
      setFormData((prev) => ({
        ...prev,
        cgstPercent: 0,
        sgstPercent: 0,
        igstPercent: formData.taxPercent,
        cgst: 0,
        sgst: 0,
        igst,
      }));
    }
  }, [formData.taxPercent, formData.subTotal, clientState, company?.state]);

  useEffect(() => {
    const itemsAmount = invoiceItems.reduce(
      (sum, item) => sum + item.amount,
      0
    );
    const subTotal = itemsAmount + Number(formData.cartage);
    const totalAmount =
      subTotal +
      Number(formData.sgst) +
      Number(formData.cgst) +
      Number(formData.igst);
    const amountInWords = inWords(totalAmount)?.toLocaleUpperCase() || "";

    setFormData((prev) => ({
      ...prev,
      amount: itemsAmount,
      subTotal,
      totalAmount,
      totalAmountInWords: amountInWords,
    }));
  }, [
    invoiceItems,
    formData.cartage,
    formData.sgst,
    formData.cgst,
    formData.igst,
  ]);
  const handleSubmit = async (e: React.FormEvent) => {
    const finalInvoice = {
      ...formData,
      invoiceDate: new Date(formData.invoiceDate),
      invoiceItems,
    };
    try {
      e.preventDefault();
      await updateInvoiceMutation.mutateAsync({ id, formData: finalInvoice });
      navigate("/companyInvoices");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log(error.response?.data.message);
      } else {
        console.error("Unexpected error:", error);
      }
    }
  };
  if (isLoading) return <Loading />;
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
          <h1 className="font-bold text-3xl m-3  text-main">Update Invoice</h1>
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

              <div className="flex flex-col gap-4 md:hidden">
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
              <table className="w-full border border-gray-300 text-sm hidden md:block">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border md:px-2 py-1">Description</th>
                    <th className="border md:px-2 py-1">HSN Code</th>
                    <th className="border md:px-2 py-1">Quantity</th>
                    <th className="border md:px-2 py-1">Unit Price</th>
                    <th className="border md:px-2 py-1">Amount</th>
                    <th className="border md:px-2 py-1">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceItems.map((item, index) => (
                    <tr key={item.id}>
                      <td className="md:px-2 py-1">
                        <input
                          type="text"
                          name="description"
                          placeholder="Description"
                          value={item.description}
                          onChange={(e) => handleItemChange(index, e)}
                          className="w-full p-1 border border-gray-300"
                        />
                      </td>
                      <td className="px-0.5  md:px-2 py-1">
                        <input
                          type="text"
                          name="hsnCode"
                          placeholder="HSN Code"
                          value={item.hsnCode}
                          onChange={(e) => handleItemChange(index, e)}
                          className="w-full p-1 border border-gray-300"
                        />
                      </td>
                      <td className=" px-2 py-1">
                        <input
                          type="number"
                          name="quantity"
                          placeholder="Quantity"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, e)}
                          className="w-full p-1 border border-gray-300"
                        />
                      </td>
                      <td className=" px-2 py-1">
                        <input
                          type="number"
                          name="unitPrice"
                          placeholder="Unit Price"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(index, e)}
                          className="w-full p-1 border border-gray-300"
                        />
                      </td>
                      <td className=" px-2 py-1">
                        <input
                          type="number"
                          name="amount"
                          value={item.amount}
                          readOnly
                          className="w-full p-1 bg-gray-100 cursor-not-allowed border border-gray-300"
                        />
                      </td>
                      <td className=" px-2 py-1 text-center">
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="ml-auto block"
                        >
                          <MdDelete className="text-4xl text-[#116456]" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
              <div className="flex flex-col">
                <label
                  htmlFor="taxPercent"
                  className="mb-1 text-sm font-medium "
                >
                  Tax Percent
                </label>
                <input
                  type="number"
                  id="taxPercent"
                  name="taxPercent"
                  placeholder="Tax Percent"
                  value={formData.taxPercent}
                  onChange={handleChange}
                  className="pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-main focus:border-transparent outline-none text-sm"
                />
              </div>
              <div className="flex flex-col">
                <label
                  htmlFor="sgstPercent"
                  className="mb-1 text-sm font-medium "
                >
                  SGST Percent
                </label>
                <input
                  type="number"
                  id="sgstPercent"
                  name="sgstPercent"
                  placeholder="sgst Percent"
                  readOnly
                  value={formData.sgstPercent}
                  className="pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-main focus:border-transparent outline-none text-sm"
                />
              </div>
              <div className="flex flex-col">
                <label
                  htmlFor="cgstPercent"
                  className="mb-1 text-sm font-medium "
                >
                  CGST Percent
                </label>
                <input
                  type="number"
                  id="cgstPercent"
                  name="cgstPercent"
                  placeholder="cgst Percent"
                  readOnly
                  value={formData.cgstPercent}
                  className="pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-main focus:border-transparent outline-none text-sm"
                />
              </div>
              <div className="flex flex-col">
                <label
                  htmlFor="igstPercent"
                  className="mb-1 text-sm font-medium "
                >
                  IGST Percent
                </label>
                <input
                  type="number"
                  id="igstPercent"
                  name="igstPercent"
                  placeholder="igst Percent"
                  readOnly
                  value={formData.igstPercent}
                  className="pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-main focus:border-transparent outline-none text-sm"
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="sgst" className="mb-1 text-sm font-medium ">
                  SGST
                </label>
                <input
                  type="number"
                  id="sgst"
                  name="sgst"
                  placeholder="SGST"
                  readOnly
                  value={formData.sgst}
                  className="pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-main focus:border-transparent outline-none text-sm"
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="cgst" className="mb-1 text-sm font-medium ">
                  CGST
                </label>
                <input
                  type="number"
                  id="cgst"
                  name="cgst"
                  placeholder="CGST"
                  readOnly
                  value={formData.cgst}
                  className="pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-main focus:border-transparent outline-none text-sm"
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="igst" className="mb-1 text-sm font-medium ">
                  IGST
                </label>
                <input
                  type="number"
                  id="igst"
                  name="igst"
                  placeholder="IGST"
                  readOnly
                  value={formData.igst}
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
              Update Invoice
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default UpdateInvoice;
