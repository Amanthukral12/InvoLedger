import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import PrivateRoute2 from "./components/PrivateRoute2.tsx";
import AuthProvider from "./providers/AuthProvider.tsx";
import PrivateRoute from "./components/PrivateRoute.tsx";
import DashBoard from "./pages/DashBoard.tsx";
import Login from "./pages/Login.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Profile from "./pages/Profile.tsx";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import UpdateProfile from "./pages/UpdateProfile.tsx";
import Clients from "./pages/Clients.tsx";
import AddClient from "./pages/AddClient.tsx";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route element={<PrivateRoute2 />}>
        <Route path="/login" element={<Login />} />
      </Route>
      <Route element={<AuthProvider />}>
        <Route element={<PrivateRoute />}>
          <Route path="/" index={true} element={<DashBoard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/update" element={<UpdateProfile />} />
          <Route path="/companyClients" element={<Clients />} />
          <Route path="/companyClients/add" element={<AddClient />} />
        </Route>
      </Route>
    </Route>
  )
);

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={true} />
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>
);
