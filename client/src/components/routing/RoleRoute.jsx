import {Navigate, Outlet} from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function RoleRoute({allowedRoles}){
    const {user} = useAuth();

    if(!user) {
        return <Navigate to="/" replace/>;
    }

    if(!allowedRoles.includes(user.role)){
        if(user.role === 'admin') return <Navigate to="/admin" replace/>

        if(user.role === "teacher") return <Navigate to ="/teacher" replace/>

        return <Navigate to="/student" replace/>
    }

    return <Outlet/>;
}