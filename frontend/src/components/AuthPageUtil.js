export const isLoggedIn = () => {
    const user = localStorage.getItem("user");
    return user !== null;
  };
  
  export const getUser = () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  };
  
  export const logout = () => {
    localStorage.removeItem("user");
  };
