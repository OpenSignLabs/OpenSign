import axios from "axios";
const serverUrl = process.env.SERVER_URL;
const APPID = process.env.APP_ID;
const masterKEY = process.env.MASTER_KEY;

async function saveUser(userDetails) {
  const userQuery = new Parse.Query(Parse.User);
  userQuery.equalTo("username", userDetails.email);
  const userRes = await userQuery.first({ useMasterKey: true });

  if (userRes) {
    const url = `${serverUrl}/loginAs`;
    const axiosRes = await axios({
      method: "POST",
      url: url,
      headers: {
        "Content-Type": "application/json;charset=utf-8",
        "X-Parse-Application-Id": APPID,
        "X-Parse-Master-Key": masterKEY,
      },
      params: {
        userId: userRes.id,
      },
    });
    const login = await axiosRes.data;
    // console.log("login ", login);
    return { id: login.objectId, sessionToken: login.sessionToken };
  } else {
    const user = new Parse.User();
    user.set("username", userDetails.email);
    user.set("password", userDetails.password);
    user.set("email", userDetails.email);
    user.set("phone", userDetails.phone);
    user.set("name", userDetails.name);

    const res = await user.signUp();
    // console.log("res ", res);
    return { id: res.id, sessionToken: res.getSessionToken() };
  }
}
export default async function (request) {
  const userDetails = request.params.userDetails;
  const planDetails = request.params.planDetails;
  const user = await saveUser(userDetails);

  try {
    const extClass = userDetails.role.split("_")[0];

    const extQuery = new Parse.Query(extClass + "_Users");
    extQuery.equalTo("UserId", {
      __type: "Pointer",
      className: "_User",
      objectId: user.id,
    });
    const extUser = await extQuery.first({ useMasterKey: true });
    if (extUser) {
      return { message: "User already exist" };
    } else {
      const roleurl = `${serverUrl}/functions/AddUserToRole`;
      const headers = {
        "Content-Type": "application/json",
        "X-Parse-Application-Id": APPID,
        sessionToken: user.sessionToken, //localStorage.getItem("accesstoken"),
      };
      let body = {
        appName: extClass, //props.appInfo.appname,
        roleName: userDetails.role, //props.appInfo.defaultRole,
        userId: user.id,
      };
      let role = await axios.post(roleurl, body, { headers: headers });
      // console.log("role ", role);
      // props.appInfo.defaultRole
      const partnerCls = Parse.Object.extend("partners_Tenant");
      const partnerQuery = new partnerCls();
      partnerQuery.set("UserId", {
        __type: "Pointer",
        className: "_User",
        objectId: user.id,
      });

      partnerQuery.set("ContactNumber", userDetails.phone);
      partnerQuery.set("TenantName", userDetails.name);
      partnerQuery.set("EmailAddress", userDetails.email);
      partnerQuery.set("IsActive", true);
      partnerQuery.set("CreatedBy", {
        __type: "Pointer",
        className: "_User",
        objectId: user.id,
      });
      if (userDetails && userDetails.pincode) {
        partnerQuery.set("PinCode", userDetails.pincode);
      }
      if (userDetails && userDetails.country) {
        partnerQuery.set("Country", userDetails.country);
      }
      if (userDetails && userDetails.state) {
        partnerQuery.set("State", userDetails.state);
      }
      if (userDetails && userDetails.city) {
        partnerQuery.set("City", userDetails.city);
      }
      if (userDetails && userDetails.address) {
        partnerQuery.set("Address", userDetails.address);
      }
      const tenantRes = await partnerQuery.save(null, { useMasterKey: true });
      // console.log("tenantRes ", tenantRes);
      const extCls = Parse.Object.extend(extClass + "_Users");
      const newObj = new extCls();
      newObj.set("UserId", {
        __type: "Pointer",
        className: "_User",
        objectId: user.id,
      });
      newObj.set("UserRole", userDetails.role); // props.appInfo.defaultRole
      newObj.set("Email", userDetails.email);
      newObj.set("Name", userDetails.name);
      newObj.set("Phone", userDetails.phone);
      newObj.set("TenantId", {
        __type: "Pointer",
        className: "partners_Tenant",
        objectId: tenantRes.id,
      });
      if (userDetails && userDetails.company) {
        newObj.set("Company", userDetails.company);
      }
      if (userDetails && userDetails.jobTitle) {
        newObj.set("JobTitle", userDetails.jobTitle);
      }
      if (planDetails && planDetails.customer_id) {
        newObj.set("Next_billing_date", new Date(planDetails.nextBillingDate));
        newObj.set("Plan", planDetails.plan);
        newObj.set("Customer_id", planDetails.customer_id);
        newObj.set("Subscription_id", planDetails.subscription_id);
      }

      const extRes = await newObj.save(null, { useMasterKey: true });

      return { message: "User sign up", sessionToken: user.sessionToken };
    }
  } catch (err) {
    console.log("Err ", err);
  }
}
