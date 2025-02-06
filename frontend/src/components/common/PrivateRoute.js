import { Navigate } from 'react-router-dom';
import { useAppContext } from '../../contextApi/context';

function PrivateRoute({ children }) {
    const { store } = useAppContext();
    console.log("first", store)
    const isLoginFromStore = store.admin.isLogin;

    if (!isLoginFromStore) {
        return <Navigate to="/" />;
    }

    return children;
}

export default PrivateRoute;
