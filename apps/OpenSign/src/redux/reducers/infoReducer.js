const infoReducer = (state = {}, action) => {
  switch (action.type) {
    case "FATCH_APPINFO":
      return action.payload;
    default:
      return state;
  }
};
export default infoReducer;
