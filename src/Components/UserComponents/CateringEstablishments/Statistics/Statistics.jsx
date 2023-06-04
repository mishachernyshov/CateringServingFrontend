import BookingsCount from "./BookingsCount";
import DishesOrderingCount from "./DishesOrderingCount";
import {useCallback, useEffect, useState} from "react";
import {makeAuthenticatedRequest} from "../../../../utils/request";
import {useNavigate} from "react-router-dom";
import PageLoading from "../../../Widgets/PageLoading";


export default function Statistics () {
  const [cateringEstablishments, setCateringEstablishments] = useState(null);

  const navigate = useNavigate();

  const getUserCateringEstablishments = useCallback(() => {
    return makeAuthenticatedRequest(
      {
        url: process.env.REACT_APP_BACKEND_URL + process.env.REACT_APP_OWNED_BY_USER_CATERING_ESTABLISHMENTS_URL,
      },
      navigate,
    )
      .then(response => setCateringEstablishments(response.data.results));
  }, [navigate]);

  useEffect(() => {
    getUserCateringEstablishments();
  }, [getUserCateringEstablishments]);

  if (!cateringEstablishments) {
    return <PageLoading />;
  }

  return (
    <div className='page-content-wrapper'>
      <BookingsCount />
      <DishesOrderingCount cateringEstablishments={cateringEstablishments} />
    </div>
  );
};
