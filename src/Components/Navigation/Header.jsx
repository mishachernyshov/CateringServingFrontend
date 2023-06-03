import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import { Nav, NavDropdown } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import i18n from "i18next";
import {useNavigate, useLocation} from "react-router-dom";


export default function Header () {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const languageNames = {
    'en': 'English',
    'uk': 'Українська',
  }
  const userCanBeAuthenticated = !!localStorage.getItem(process.env.REACT_APP_LOCAL_STORAGE_REFRESH_TOKEN_KEY);

  const changeLanguage = (langCode) => {
     localStorage.setItem(process.env.REACT_APP_LOCAL_STORAGE_LANGUAGE_KEY, langCode);
     i18n.changeLanguage(langCode);
  }

  const unsetTokenData = event => {
    event.preventDefault();

    localStorage.removeItem(process.env.REACT_APP_LOCAL_STORAGE_ACCESS_TOKEN_KEY);
    localStorage.removeItem(process.env.REACT_APP_LOCAL_STORAGE_REFRESH_TOKEN_KEY);

    navigate('/login');
  }

  return (
    <div id='page-header-wrapper'>
      <Navbar bg="primary" variant="dark">
        <Container>
          <Navbar.Brand>Catering serving</Navbar.Brand>
          <Nav className="me-auto">
            {
              userCanBeAuthenticated ?
                <>
                  <Nav.Link
                    href="/catering_establishments"
                    className={location.pathname.startsWith('/catering_establishments') && 'selected-page'}
                  >
                    {t('Establishments catalog')}
                  </Nav.Link>
                  <Nav.Link
                    href="/bookings"
                    className={location.pathname.startsWith('/bookings') && 'selected-page'}
                  >
                    {t('Bookings')}
                  </Nav.Link>
                  <Nav.Link
                    href="/user_catering_establishments/list"
                    className={location.pathname.startsWith('/user_catering_establishments') && 'selected-page'}
                  >
                    {t('My establishments')}
                  </Nav.Link>
                  <Nav.Link
                    onClick={unsetTokenData}
                  >
                    {t('Exit')}
                  </Nav.Link>
                </> :
                <>
                  <Nav.Link
                    href="/login"
                    className={location.pathname === '/login' && 'selected-page'}
                  >
                    {t('Log in')}
                  </Nav.Link>
                  <Nav.Link
                    href="/register"
                    className={location.pathname === '/register' && 'selected-page'}
                  >
                    {t('Register')}
                  </Nav.Link>
                </>
            }
          </Nav>
          <NavDropdown
            title={(
              () => {
                const localStorageLanguage = localStorage.getItem(process.env.REACT_APP_LOCAL_STORAGE_LANGUAGE_KEY);
                const usedLanguage = localStorageLanguage ? localStorageLanguage : 'en';
                return languageNames[usedLanguage];
              })()
            }
            className='lang-switcher'
          >
            <NavDropdown.Item
              onClick={() => changeLanguage('uk')}
            >
              {languageNames['uk']}
            </NavDropdown.Item>
            <NavDropdown.Item
              onClick={() => changeLanguage('en')}
            >
              {languageNames['en']}
            </NavDropdown.Item>
          </NavDropdown>
        </Container>
      </Navbar>
    </div>
  )
}
