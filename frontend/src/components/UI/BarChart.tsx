import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const BarChartComponent = ({
  data,
}: {
  data: { monthName: string; count: number }[];
}) => {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data} margin={{ top: 20, right: 0, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="monthName"
          interval={0}
          angle={-45}
          textAnchor="end"
          height={70}
          tick={{ fill: "#1B9B85" }}
        />
        <YAxis />
        <Tooltip />
        <Bar dataKey="count" fill="#1B9B85" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default BarChartComponent;
