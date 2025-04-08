import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { AppProvider } from "./contextApi/context";
import Login from "./pages/Login";
import AdminLayout from "./Layout/AdminLayout";
import AllAdminCreate from "./pages/AllAdminCreate";
import Wallet from "./pages/Wallet";
import CreateSubAdmin from "./pages/CreateSubAdmin";
import SubAdminView from "./pages/SubAdminView";
import ViewSubAdminPermission from "./pages/ViewSubAdminPermission";
import HierarchyPageView from "./components/HierarchyPageView";
import AccountLandingModal from "./profileAccount/AccountLandingModal";

import AdminAccountStatement from "./pages/AdminAccountStatement";
import AgentDelete from "./pages/AgentDelete";
import WelcomePage from "./pages/welcomepage/WelcomePage";
import View_AddCash_history from "./pages/View_AddCash_history";
import Market_Analysis from "./pages/Market_Analysis";
import User_BetMarket from "./pages/User_BetMarket";
import BetHistoryForPl from "./profileAccount/BetHistoryForPl";
import BetHistoryLotteryForPl from "./profileAccount/BetHistoryLotteryForPl";

import ResetPassword from "./components/ResetPassword/ResetPassword";
import DemoNavside from "./Layout/DemoNavside";
import LotteryMarketAnalysis from "./pages/LotteryMarketAnalysis";
import DemoMarket_Analysis from "./pages/DemoMarket_Analysis";
import PrivateRoute from "./components/common/PrivateRoute";
import EventProfitLoss from "./pages/MyReport/EventProfitLoss";
import DownlineProfitLoss from "./pages/MyReport/DownlineProfitLoss";
// import WelcomePage from "./screen/WelcomePage";

function App() {
  return (
    <React.Fragment>
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route index path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <AdminLayout />
                </PrivateRoute>
              }
            >
              <Route path="welcome" element={<WelcomePage />} />
              <Route path="allAdminCreate" element={<AllAdminCreate />} />
              <Route
                path="/adminaccountstatement"
                element={<AdminAccountStatement />}
              />
              <Route path="/agentDelete" element={<AgentDelete />} />
              <Route
                path="hierarchyView/:userName"
                element={<HierarchyPageView />}
              />
              {/* <Route
                path="/account-landing/:userName"
                element={<AccountLandingModal />}
              /> */}
              <Route
                path="/account-landing/:userName/:toggle"
                element={<AccountLandingModal />}
              />
              <Route path="wallet" element={<Wallet />} />
              <Route path="CreateSubAdmin" element={<CreateSubAdmin />} />
              <Route path="Demo" element={<DemoMarket_Analysis />} />
              <Route path="ViewAllSubAdmin" element={<SubAdminView />} />
              <Route
                path="ViewSubAdminPermission/:id"
                element={<ViewSubAdminPermission />}
              />
              <Route
                path="View_AddCash_history"
                element={<View_AddCash_history />}
              />
              <Route path="Market_analysis" element={<Market_Analysis />} />
              <Route
                path="betHistForPL/:userName/:runnerId"
                element={<BetHistoryForPl />}
              />
              <Route
                path="/User_BetMarket/:marketId"
                element={<User_BetMarket />}
              />
              <Route
                path="betHistLotteryForPL/:userName/:id"
                element={<BetHistoryLotteryForPl />}
              />

              <Route
                path="/Lottery_Market_Analysis/:marketId"
                element={<LotteryMarketAnalysis />}
              />

              <Route path="/event-profit-loss" element={<EventProfitLoss />} />
              <Route
                path="/downline-profit-loss"
                element={<DownlineProfitLoss />}
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </React.Fragment>
  );
}

export default App;
