import {createContext, useState} from "react";


const UserBookingsContext = createContext();
export default UserBookingsContext;
export const UserBookingsSetContext = createContext();

export function UserBookingsProvider ({children}) {
  const [userBookings, setUserBookings] = useState(null);

  return (
    <UserBookingsContext.Provider value={userBookings}>
      <UserBookingsSetContext.Provider value={setUserBookings}>
        {children}
      </UserBookingsSetContext.Provider>
    </UserBookingsContext.Provider>
  )
}
