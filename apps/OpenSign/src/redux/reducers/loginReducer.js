const loginReducer = (state = {}, action) => {
  switch (action.type) {
    case "APP_LOGIN":
      return action.payload;
    default:
      return state;
  }
};
export default loginReducer;
