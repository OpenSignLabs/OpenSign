const ShowTenant = (state = "", action) => {
  switch (action.type) {
    case "SHOW_TENANT":
      return action.payload;
    default:
      return state;
  }
};
export default ShowTenant;
