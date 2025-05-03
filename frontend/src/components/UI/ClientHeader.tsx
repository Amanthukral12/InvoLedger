import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import api from "../../utils/api";
import useClientStore from "../../store/clientstore";
import Loading from "./Loading";
const ClientHeader = () => {
  const { id } = useParams();
  const selectedClient = useClientStore((state) => state.selectedClient);
  const setSelectedClient = useClientStore((state) => state.setSelectedClient);
  const { data: fetchedClient, isLoading } = useQuery({
    queryKey: ["client", id],
    queryFn: async () => {
      const { data } = await api.get(`/client/${id}`);
      setSelectedClient(data.data);
      return data.data;
    },
    enabled: !!id,
  });

  const client = selectedClient || fetchedClient;
  if (isLoading) return <Loading />;
  return (
    <div className="bg-white m-3 py-4 px-2 rounded-lg shadow-xl flex flex-col lg:flex-row">
      <div className="w-4/5">
        <p className="text-xl lg:text-4xl text-main font-semibold mb-2">
          Client Name: {client?.name}
        </p>
        <p className="text-lg text-main font-semibold my-1">
          Client Email: {client?.email}
        </p>
        <p className="text-lg text-main font-semibold my-1">
          Client Address: {client?.address}
        </p>
        <p className="text-lg text-main font-semibold my-1">
          Client GST: {client?.GSTIN}
        </p>
        <p className="text-lg text-main font-semibold my-1">
          Client Balance: {client?.balance}
        </p>
      </div>
    </div>
  );
};

export default ClientHeader;
