import useAuthStore from "../../store/authStore";
import Person from "../../assets/Person-svg.svg?react";
const CompanyHeader = () => {
  const { company } = useAuthStore();
  return (
    <div className="bg-white m-3 py-4 px-2 rounded-lg shadow-xl flex flex-col lg:flex-row">
      <div className="flex justify-center  pl-4 mr-2 w-full lg:w-1/5">
        {company?.avatar ? (
          <img
            src={company.avatar}
            alt="company profile photo"
            className="h-48 w-48 rounded-full border-gray-600 border-2"
          />
        ) : (
          <Person />
        )}
      </div>
      <div className="w-4/5">
        <p className="text-xl lg:text-4xl text-main font-semibold mb-2">
          Company Name: {company?.name}
        </p>
        <p className="text-lg text-main font-semibold my-1">
          Company Email: {company?.email}
        </p>
        <p className="text-lg text-main font-semibold my-1">
          Company Address: {company?.Address}
        </p>
        <p className="text-lg text-main font-semibold my-1">
          Company GST: {company?.GST}
        </p>
      </div>
    </div>
  );
};

export default CompanyHeader;
