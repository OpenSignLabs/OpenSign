const tourStepReducer = (state = "", action) => {
  switch (action.type) {
    case "SAVE_TOURSTEPS":
      return action.payload;
    case "REMOVE_TOURSTEPS":
      return [];
    default:
      return state;
  }
};
export default tourStepReducer;
