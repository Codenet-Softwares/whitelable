import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { RequireAuth } from '../Utils/RequireAuth';
import Authform from '../Components/AuthForm';
import Login from '../Pages/Accounts/Login/Login';

import Temp from '../screen/Temp';
import AdminLayout from '../Layout/AdminLayout';



const AppRoutes = () => {
  const userrole = sessionStorage.getItem('role') || '';

  return (
    <BrowserRouter>
      <Routes>
        <Route path="authform" element={<Authform />} />
        <Route index element={<Login />} />
        {/* <Route path="*" element={<ErrorPage />} /> */}
        <Route
          path="/"
          element={
            <RequireAuth>
              <AdminLayout/>
            </RequireAuth>
          }
        >
          <Route
            path="welcome"
            element={
              <RequireAuth>
                <Temp />
              </RequireAuth>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
