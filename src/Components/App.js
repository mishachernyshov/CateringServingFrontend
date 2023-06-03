import {useEffect} from "react";
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import {QueryClient, QueryClientProvider} from "react-query";
import i18n from "../i18n";

import UserCateringEstablishments from "./UserComponents/CateringEstablishments/CateringEstablishments";
import CateringEstablishmentCreateOrEdit from "./UserComponents/CateringEstablishments/CateringEstablishmentCreateOrEdit";
import Header from "./Navigation/Header";
import Login from "./Auth/Login";
import Registration from "./Auth/Registration";
import PageNotFound from "./Navigation/PageNotFound";
import CateringEstablishments from "./CateringEstablishments/CateringEstablishments";
import CateringEstablishment from "./CateringEstablishments/CateringEstablishment";
import BookingsWrapper from "./Booking/BookingsWrapper";


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // default: true
    },
  },
});

function App() {
  const specifyLanguage = () => {
    const usedLanguage = localStorage.getItem(process.env.REACT_APP_LOCAL_STORAGE_LANGUAGE_KEY);
    if (usedLanguage) {
      i18n.changeLanguage(usedLanguage);
    }
  };

  useEffect(() => {
    specifyLanguage();
  }, []);

  return (
    <div className="App">
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Header />
          <Routes>
            <Route path='/register' element={<Registration />} />
            <Route path='/login' element={<Login />} />
            <Route path='/user_catering_establishments'>
              <Route path='list' element={<UserCateringEstablishments />} />
              <Route path='new' element={<CateringEstablishmentCreateOrEdit />} />
              <Route path='edit/:id' element={<CateringEstablishmentCreateOrEdit />} />
            </Route>
            <Route path='/catering_establishments'>
              <Route path='' element={<CateringEstablishments />} />
              <Route path=':id' element={<CateringEstablishment />} />
            </Route>
            <Route
              path='/bookings'
              element={<BookingsWrapper />}>
            </Route>
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </div>
  );
}

export default App;
