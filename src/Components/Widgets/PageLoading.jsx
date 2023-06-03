import Spinner from "react-bootstrap/Spinner";
import React from "react";


export default function PageLoading () {
  return (
    <div className='centered-page-content-wrapper'>
      <Spinner
        variant="primary"
        className="spinner-border big-loading-spinner centered-page-content"
      />
    </div>
  );
}
