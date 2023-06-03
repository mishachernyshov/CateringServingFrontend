import {createContext, useState} from "react";


const WorkHoursContext = createContext();
export default WorkHoursContext;
export const WorkHoursSetContext = createContext();


export function WorkHoursProvider ({children}) {
  const [workHours, setWorkHours] = useState(null);

  return (
    <WorkHoursContext.Provider value={workHours}>
      <WorkHoursSetContext.Provider value={setWorkHours}>
        {children}
      </WorkHoursSetContext.Provider>
    </WorkHoursContext.Provider>
  )
}
