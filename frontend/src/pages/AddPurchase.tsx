import { IoMenu } from "react-icons/io5";
import Sidebar from "../components/UI/Sidebar";
import NavigationBar from "../components/UI/NavigationBar";
import React, { useEffect, useState } from "react";
import { CiUser } from "react-icons/ci";
import { useClient } from "../hooks/client";
import { Client } from "../types/types";
import { MdDelete } from "react-icons/md";
import { IoIosAddCircleOutline } from "react-icons/io";
import useAuthStore from "../store/authStore";
import { inWords } from "../utils/numToWords";
import { usePurchase } from "../hooks/purchases";
import axios from "axios";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { roundCurrency } from "../utils/roundCurrency";
const AddPurchase = () => {
  const [showSideBar, setShowSideBar] = useState(false);
  const [clientState, setClientState] = useState("");
  const navigate = useNavigate();
  const { company } = useAuthStore();
  const { createPurchaseMutation } = usePurchase();
  const { clientQuery } = useClient();

  const clients = React.useMemo(
    () => clientQuery.data ?? [],
    [clientQuery.data]
  );

  const [formData, setFormData] = useState({
    invoiceNumber: "",
    invoiceDate: new Date(),
    clientId: "",
    amount: 0,
    cartage: 0,
    subTotal: 0,
    totalGST: 0,
    totalIGST: 0,
    totalCGST: 0,
    totalSGST: 0,
    totalAmount: 0,
    totalAmountInWords: "",
  });

  const [purchaseItems, setPurchaseItems] = useState([
    {
      id: Date.now().toString(),
      invoiceId: "",
      description: "",
      quantity: 0,
      unitPrice: 0,
      unit: "",
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
    setPurchaseItems([
      ...purchaseItems,
      {
        id: Date.now().toString(),
        invoiceId: "",
        description: "",
        quantity: 0,
        unitPrice: 0,
        unit: "",
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

    setPurchaseItems((prev) => {
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
        updatedItem.cgst = parseFloat(
          ((halfTax * updatedItem.amount) / 100).toFixed(2)
        );
        updatedItem.sgst = parseFloat(
          ((halfTax * updatedItem.amount) / 100).toFixed(2)
        );
        updatedItem.igst = 0;
      } else {
        updatedItem.cgstPercent = 0;
        updatedItem.sgstPercent = 0;
        updatedItem.igstPercent = taxPercent;
        updatedItem.cgst = 0;
        updatedItem.sgst = 0;
        updatedItem.igst = parseFloat(
          ((taxPercent * updatedItem.amount) / 100).toFixed(2)
        );
      }

      updated[index] = updatedItem;
      return updated;
    });
  };

  const removeItem = (index: number) => {
    const updatedItems = [...purchaseItems];
    updatedItems.splice(index, 1);
    setPurchaseItems(updatedItems);
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
    const itemsAmount = purchaseItems.reduce(
      (sum, item) => sum + item.amount,
      0
    );
    let cartageTax = 0;
    if (itemsAmount > 0) {
      cartageTax = purchaseItems.reduce((sum, item) => {
        const proportion = item.amount / itemsAmount;
        return sum + formData.cartage * proportion * (item.taxPercent / 100);
      }, 0);
      cartageTax = roundCurrency(cartageTax);
    }

    const isSameState = clientState ? company?.state === clientState : false;

    let cartageCgst = 0,
      cartageSgst = 0,
      cartageIgst = 0;

    if (isSameState) {
      cartageCgst = cartageTax / 2;
      cartageSgst = cartageTax / 2;
    } else {
      cartageIgst = cartageTax;
    }

    const subTotal = itemsAmount + Number(formData.cartage);

    const totalSGST = parseFloat(
      (
        purchaseItems.reduce((sum, item) => sum + item.sgst, 0) + cartageSgst
      ).toFixed(2)
    );
    const totalCGST = parseFloat(
      (
        purchaseItems.reduce((sum, item) => sum + item.cgst, 0) + cartageCgst
      ).toFixed(2)
    );
    const totalIGST = parseFloat(
      (
        purchaseItems.reduce((sum, item) => sum + item.igst, 0) + cartageIgst
      ).toFixed(2)
    );

    const totalGST = totalCGST + totalSGST + totalIGST;

    const totalAmount = Math.round(
      subTotal + Number(totalSGST) + Number(totalCGST) + Number(totalIGST)
    );
    const amountInWords = inWords(totalAmount)?.toLocaleUpperCase() || "";

    setFormData((prev) => ({
      ...prev,
      amount: itemsAmount,
      totalCGST,
      totalSGST,
      totalIGST,
      totalGST,
      subTotal,
      totalAmount,
      totalAmountInWords: amountInWords,
    }));
  }, [purchaseItems, formData.cartage, clientState, company?.state]);

  useEffect(() => {
    if (purchaseItems.length > 0) {
      const isSameState = clientState ? company?.state === clientState : false;

      setPurchaseItems((prevItems) =>
        prevItems.map((item) => {
          const taxPercent = item.taxPercent;
          if (isSameState) {
            const halfTax = taxPercent / 2;
            return {
              ...item,
              sgstPercent: halfTax,
              cgstPercent: halfTax,
              igstPercent: 0,
              sgst: parseFloat(((halfTax * item.amount) / 100).toFixed(2)),
              cgst: parseFloat(((halfTax * item.amount) / 100).toFixed(2)),
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
              igst: parseFloat(((taxPercent * item.amount) / 100).toFixed(2)),
            };
          }
        })
      );
    }
  }, [clientState, company?.state, purchaseItems.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    const finalPurchase = {
      ...formData,
      invoiceDate: new Date(formData.invoiceDate),
      purchaseItems,
    };
    try {
      e.preventDefault();
      await createPurchaseMutation.mutateAsync(finalPurchase);
      navigate("/companyPurchases");
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
          <h1 className="font-bold text-3xl m-3  text-main">
            Add New Purchase
          </h1>
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
                  name="InvoiceDate"
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
              <h3 className="text-2xl font-medium mb-2">Purchase Items</h3>
              <div className="flex flex-col gap-4">
                {purchaseItems.map((item, index) => (
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
                        className="w-full p-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-main focus:border-transparent outline-none mt-1"
                      />
                    </div>
                    <div className="mb-2">
                      <label className="font-semibold text-sm">HSN Code</label>
                      <input
                        type="text"
                        name="hsnCode"
                        value={item.hsnCode}
                        onChange={(e) => handleItemChange(index, e)}
                        className="w-full p-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-main focus:border-transparent outline-none mt-1"
                      />
                    </div>
                    <div className="mb-2">
                      <label className="font-semibold text-sm">Quantity</label>
                      <input
                        type="number"
                        name="quantity"
                        onFocus={(e) =>
                          e.target.addEventListener(
                            "wheel",
                            function (e) {
                              e.preventDefault();
                            },
                            { passive: false }
                          )
                        }
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, e)}
                        className="w-full p-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-main focus:border-transparent outline-none mt-1"
                      />
                    </div>
                    <div className="mb-2">
                      <label className="font-semibold text-sm">Unit</label>
                      <input
                        type="text"
                        name="unit"
                        value={item.unit}
                        onChange={(e) => handleItemChange(index, e)}
                        className="w-full p-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-main focus:border-transparent outline-none mt-1"
                      />
                    </div>
                    <div className="mb-2">
                      <label className="font-semibold text-sm">
                        Unit Price
                      </label>
                      <input
                        type="number"
                        name="unitPrice"
                        onFocus={(e) =>
                          e.target.addEventListener(
                            "wheel",
                            function (e) {
                              e.preventDefault();
                            },
                            { passive: false }
                          )
                        }
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, e)}
                        className="w-full p-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-main focus:border-transparent outline-none mt-1"
                      />
                    </div>
                    <div className="mb-2">
                      <label className="font-semibold text-sm">Amount</label>
                      <input
                        type="number"
                        name="amount"
                        onFocus={(e) =>
                          e.target.addEventListener(
                            "wheel",
                            function (e) {
                              e.preventDefault();
                            },
                            { passive: false }
                          )
                        }
                        value={item.amount}
                        readOnly
                        className="w-full p-1 border bg-gray-100 cursor-not-allowed border-gray-300 rounded-lg focus:ring-2 focus:ring-main focus:border-transparent outline-none mt-1"
                      />
                    </div>
                    <div className="mb-2">
                      <label className="font-semibold text-sm">
                        Tax Percent
                      </label>
                      <input
                        type="number"
                        name="taxPercent"
                        onFocus={(e) =>
                          e.target.addEventListener(
                            "wheel",
                            function (e) {
                              e.preventDefault();
                            },
                            { passive: false }
                          )
                        }
                        value={item.taxPercent}
                        onChange={(e) => handleItemChange(index, e)}
                        className="w-full p-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-main focus:border-transparent outline-none mt-1"
                      />
                    </div>
                    <div className="mb-2">
                      <label className="font-semibold text-sm">
                        SGST Percent
                      </label>
                      <input
                        type="number"
                        name="sgstPercent"
                        onFocus={(e) =>
                          e.target.addEventListener(
                            "wheel",
                            function (e) {
                              e.preventDefault();
                            },
                            { passive: false }
                          )
                        }
                        value={item.sgstPercent}
                        readOnly
                        className="w-full p-1 border bg-gray-100 cursor-not-allowed border-gray-300 rounded-lg focus:ring-2 focus:ring-main focus:border-transparent outline-none mt-1"
                      />
                    </div>
                    <div className="mb-2">
                      <label className="font-semibold text-sm">
                        CGST Percent
                      </label>
                      <input
                        type="number"
                        name="cgstPercent"
                        onFocus={(e) =>
                          e.target.addEventListener(
                            "wheel",
                            function (e) {
                              e.preventDefault();
                            },
                            { passive: false }
                          )
                        }
                        value={item.cgstPercent}
                        readOnly
                        className="w-full p-1 border bg-gray-100 cursor-not-allowed border-gray-300 rounded-lg focus:ring-2 focus:ring-main focus:border-transparent outline-none mt-1"
                      />
                    </div>
                    <div className="mb-2">
                      <label className="font-semibold text-sm">
                        IGST Percent
                      </label>
                      <input
                        type="number"
                        name="igstPercent"
                        onFocus={(e) =>
                          e.target.addEventListener(
                            "wheel",
                            function (e) {
                              e.preventDefault();
                            },
                            { passive: false }
                          )
                        }
                        value={item.igstPercent}
                        readOnly
                        className="w-full p-1 border bg-gray-100 cursor-not-allowed border-gray-300 rounded-lg focus:ring-2 focus:ring-main focus:border-transparent outline-none mt-1"
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

            <div className="w-full md:w-4/5 mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
              <div className="flex flex-col">
                <label htmlFor="amount" className="mb-1 text-sm font-medium ">
                  Amount
                </label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  onFocus={(e) =>
                    e.target.addEventListener(
                      "wheel",
                      function (e) {
                        e.preventDefault();
                      },
                      { passive: false }
                    )
                  }
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
                  onFocus={(e) =>
                    e.target.addEventListener(
                      "wheel",
                      function (e) {
                        e.preventDefault();
                      },
                      { passive: false }
                    )
                  }
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
                  onFocus={(e) =>
                    e.target.addEventListener(
                      "wheel",
                      function (e) {
                        e.preventDefault();
                      },
                      { passive: false }
                    )
                  }
                  id="subTotal"
                  name="subTotal"
                  placeholder="Sub Total"
                  value={formData.subTotal}
                  readOnly
                  className="pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-main focus:border-transparent outline-none text-sm"
                />
              </div>
              <div className="flex flex-col">
                <label
                  htmlFor="totalCGST"
                  className="mb-1 text-sm font-medium "
                >
                  Total CGST
                </label>
                <input
                  type="number"
                  onFocus={(e) =>
                    e.target.addEventListener(
                      "wheel",
                      function (e) {
                        e.preventDefault();
                      },
                      { passive: false }
                    )
                  }
                  id="totalCgst"
                  name="totalCGST"
                  placeholder="Total CGST"
                  value={formData.totalCGST}
                  readOnly
                  className="pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-main focus:border-transparent outline-none text-sm"
                />
              </div>
              <div className="flex flex-col">
                <label
                  htmlFor="totalSGST"
                  className="mb-1 text-sm font-medium "
                >
                  Total SGST
                </label>
                <input
                  type="number"
                  onFocus={(e) =>
                    e.target.addEventListener(
                      "wheel",
                      function (e) {
                        e.preventDefault();
                      },
                      { passive: false }
                    )
                  }
                  id="totalSGST"
                  name="totalSGST"
                  placeholder="Total SGST"
                  value={formData.totalSGST}
                  readOnly
                  className="pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-main focus:border-transparent outline-none text-sm"
                />
              </div>
              <div className="flex flex-col">
                <label
                  htmlFor="totalIGST"
                  className="mb-1 text-sm font-medium "
                >
                  Total IGST
                </label>
                <input
                  type="number"
                  onFocus={(e) =>
                    e.target.addEventListener(
                      "wheel",
                      function (e) {
                        e.preventDefault();
                      },
                      { passive: false }
                    )
                  }
                  id="totalIGST"
                  name="totalIGST"
                  placeholder="Total IGST"
                  value={formData.totalIGST}
                  readOnly
                  className="pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-main focus:border-transparent outline-none text-sm"
                />
              </div>
              <div className="flex flex-col">
                <label
                  htmlFor="totalAmount"
                  className="mb-1 text-sm font-medium "
                >
                  Total Amount
                </label>
                <input
                  type="number"
                  onFocus={(e) =>
                    e.target.addEventListener(
                      "wheel",
                      function (e) {
                        e.preventDefault();
                      },
                      { passive: false }
                    )
                  }
                  name="totalAmount"
                  placeholder="Total Amount"
                  value={formData.totalAmount}
                  readOnly
                  className="pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-main focus:border-transparent outline-none text-sm"
                />
              </div>
            </div>
            <div className="w-full md:w-4/5 mx-auto flex flex-col mb-4">
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

            <button className="w-full md:w-4/5 mx-auto text-lg font-semibold text-white bg-main px-8 py-1 rounded-xl cursor-pointer block">
              Add New Purchase
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default AddPurchase;
