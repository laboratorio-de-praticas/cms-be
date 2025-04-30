import { createContext, useContext, useState } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userType, setUserType] = useState("adm"); // valor padrão pode vir da API, login, etc
  const [curso, setCurso] = useState("DSM"); // adicionando o curso (padrão: DSM) E PRO ADM FICAR COM A NAV VERMELHA TB COLOCA DSM

  return (
    <UserContext.Provider value={{ userType, setUserType, curso, setCurso }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);