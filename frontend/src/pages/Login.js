import React from 'react';
import Authform from '../components/common/AuthForm';
import { login } from '../Utils/service/apiService';

const Login = () => {
  return <Authform purpose={'login'} authFormApi={login} />;
};

export default Login;
