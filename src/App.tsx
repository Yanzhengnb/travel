import { HashRouter, Route, Routes, Navigate } from "react-router-dom";
import TravelList from "./travel/index";
import { Provider } from "react-redux";
import store from "./store";
import TravelEditor from "./travel/TravelEditor";
import Expenses from "./travel/expenses";
export default function App() {
 return (
  <HashRouter>
    <Provider store={store}>
   <div>
    <Routes>
      {/* Redirect root to the landing page */}
     <Route path="/" element={<Navigate to="/TravelList" />} />
     <Route path="/TravelList" element={<TravelList />} />
     <Route path="/travel/new" element={<TravelEditor />} />
     <Route path="/travel/edit/:id" element={<TravelEditor />} />
     <Route path="/expenses" element={<Expenses />} />

    </Routes>
   </div></Provider>
  </HashRouter>
);
}



