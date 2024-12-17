import React from 'react';
import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <div class="container-fluid p-0 ">
      <Outlet />
    </div>
  );
};

export default Layout;
