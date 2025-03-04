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

export const updateStoredUsername = (newUsername) => {
  const userData = getUser();
  if (userData) {
    userData.username = newUsername;
    localStorage.setItem('user', JSON.stringify(userData));
  }
};
