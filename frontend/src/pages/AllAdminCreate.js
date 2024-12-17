import React from 'react';
import Authform from '../components/common/AuthForm';
import { allAdminCreate } from '../Utils/service/apiService';

const AllAdminCreate = () => {
  return <Authform purpose={'create'} authFormApi={allAdminCreate} />;
};

export default AllAdminCreate;
