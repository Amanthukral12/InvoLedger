import { Outlet } from "react-router-dom";
import "./App.css";
import "react-toastify/dist/ReactToastify.css";
import { Bounce, ToastContainer } from "react-toastify";
function App() {
  return (
    <>
      <Outlet />
      <ToastContainer
        theme="light"
        position="top-right"
        hideProgressBar={true}
        autoClose={2500}
        newestOnTop
        closeOnClick
        transition={Bounce}
      />
    </>
  );
}

export default App;
