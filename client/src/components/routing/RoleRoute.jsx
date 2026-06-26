import {Navigate, Outlet} from 'react-router-dom';
import { useAuth } from "../../context/auth";

export default function RoleRoute({allowedRoles}){
    const {user, authLoading} = useAuth();


    if(authLoading) {
        return null;
    }

    if(!user) {
        return <Navigate to="/" replace/>;
    }

    if(!allowedRoles.includes(user.role)){
        if(user.role === 'admin') return <Navigate to="/admin" replace/>

        if(user.role === "teacher") return <Navigate to ="/teacher" replace/>

        return <Navigate to="/" replace/>
    }

    return <Outlet/>;
}
