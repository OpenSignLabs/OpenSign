async function getUserById(request) {
    try {
      const objectId = request.params.userId;
      const query = new Parse.Query(Parse.User);
      query.equalTo('objectId', objectId);
      
      const user = await query.first({ useMasterKey: true });
      return user;
    } catch (err) {
      console.log('err', err);
      return err;
    }
  }
  export default getUserById;
  