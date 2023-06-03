import {createContext, useState} from "react";


const TablesContext = createContext();
export default TablesContext;
export const TablesSetContext = createContext();

export function TablesProvider ({children}) {
  const [tables, setTables] = useState(null);

  return (
    <TablesContext.Provider value={tables}>
      <TablesSetContext.Provider value={setTables}>
        {children}
      </TablesSetContext.Provider>
    </TablesContext.Provider>
  )
}
