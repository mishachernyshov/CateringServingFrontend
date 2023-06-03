import {memo} from "react";
import Bookings from "./Bookings";

import {UserBookingsProvider} from "./UserBookingsContext";
import {TablesProvider} from "../CateringEstablishments/TablesContext";
import {WorkHoursProvider} from "../CateringEstablishments/WorkHoursContext";


export default memo(function BookingsWrapper () {
  return (
    <UserBookingsProvider>
      <TablesProvider>
        <WorkHoursProvider>
          <Bookings />
        </WorkHoursProvider>
      </TablesProvider>
    </UserBookingsProvider>
  );
});
