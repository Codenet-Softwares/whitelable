import strings from '../Utils/constant/stringConstant';
import { getAdminInitialState } from '../Utils/service/initiateState';

export const reducer = (state, action) => {
  switch (action.type) {
    case strings.LOG_IN:
      return { ...state, admin: getAdminInitialState(action.payload) };
    case strings.LOG_OUT:
      return {
        ...state,
        admin: getAdminInitialState({ isLogin: false }),
      };
    case strings.NAVIGATION_BAR:
      return {
        ...state,
        admin: getAdminInitialState({
          ...state.admin,
          navigationBar: action.payload,
        }),
      };


    default:
      return state;
  }
};
