import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard";

function App(){
  return (
    <>
    <Routes>
      <Route path="/" element={<Landing/>}/>

      <Route path="/dashboard" element={<DashboardLayout/>}>

      <Route index element={<Dashboard/>}/>
      

      </Route>
      
    </Routes>
    </>
  )
}

export default App;