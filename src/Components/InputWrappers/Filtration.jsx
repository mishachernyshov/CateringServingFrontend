import React from "react";
import {useTranslation} from "react-i18next";
import Button from "react-bootstrap/Button";

export default React.memo(function Filtration ({children, className, applyFiltrationHandler}) {
  const {t} = useTranslation();

  return (
    <div className='filtration-wrapper'>
      <div>{t('Filtration')}</div>
      <div className={`filters-container ${className ? className : ''}`}>{children}</div>
      <Button
        variant='outline-primary'
        onClick={applyFiltrationHandler}
      >
        {t('Apply filters')}
      </Button>
    </div>
  )
});
