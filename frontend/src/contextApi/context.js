import { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { reducer } from './reducer';
import { getAdminInitialState } from '../Utils/service/initiateState';
import strings from '../Utils/constant/stringConstant';
import './loader.css';

const AppContext = createContext();

const initialState = {
  admin: getAdminInitialState(),
};

const AppProvider = ({ children }) => {
  const [store, dispatch] = useReducer(reducer, initialState, () => {
    const storedState = localStorage.getItem(strings.LOCAL_STORAGE_KEY);
    return storedState ? JSON.parse(storedState) : initialState;
  });

  const [isLoading, setIsLoading] = useState(false); // Initially false, loader should be hidden
  const showLoader = () => setIsLoading(true);
  const hideLoader = () => setIsLoading(false);

  useEffect(() => {
    const dummyStore = { ...store };
    localStorage.setItem(strings.LOCAL_STORAGE_KEY, JSON.stringify(dummyStore));
  }, [store]);

  return (
    <AppContext.Provider value={{ store, dispatch, isLoading, showLoader, hideLoader }}>
      {isLoading && (
        <div className="loader">
          <div className="spinner"></div>
        </div>
      )}
      {children}
    </AppContext.Provider>
  );
};

const useAppContext = () => {
  return useContext(AppContext);
};

export { AppProvider, useAppContext };
