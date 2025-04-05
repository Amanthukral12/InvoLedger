import { useAuth } from "../hooks/auth";
import { motion } from "framer-motion";
import { FiFileText } from "react-icons/fi";
import { Link } from "react-router-dom";
import Button from "../components/UI/Button";
const Login = () => {
  const { initiateGoogleLogin } = useAuth();
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Link
        to="#"
        className="fixed top-4 left-4 flex items-center space-x-2 text-gray-600 hover:text-gray-900"
      >
        ← Back to home
      </Link>

      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md"
        >
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-2">
              <FiFileText className="w-10 h-10 text-primary" />
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                InvoLedger
              </span>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-center mb-2">Welcome Back!</h2>
          <p className="text-gray-600 text-center mb-8">
            Sign in to manage your business
          </p>

          <Button
            className="w-full flex items-center justify-center space-x-2 mb-4"
            onClick={initiateGoogleLogin}
          >
            <img
              src="https://www.google.com/favicon.ico"
              alt="Google"
              className="w-5 h-5"
            />
            <span>Continue with Google</span>
          </Button>

          <p className="text-sm text-center text-gray-500">
            By continuing, you agree to our{" "}
            <a href="#" className="text-primary hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-primary hover:underline">
              Privacy Policy
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
