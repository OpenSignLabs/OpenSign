import React, { useState, useEffect } from "react";
import Parse from "parse";
import "../styles/loader.css";
import GetDashboard from "../components/dashboard/GetDashboard";
import { useNavigate, useParams } from "react-router-dom";
import Title from "../components/Title";
import { useDispatch } from "react-redux";
import { saveTourSteps } from "../redux/reducers/TourStepsReducer";
import { useCookies } from "react-cookie";
const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const [dashboard, setdashboard] = useState([]);
  const [classnameArray, setclassnameArray] = useState([]);
  const [loading, setloading] = useState(false);
  const [defaultQuery, setDefaultQuery] = useState("");
  const [, setCookie] = useCookies([
    "TenantId",
    "userDetails",
    "userEmail",
    "profileImg",
    "fev_Icon",
    "accesstoken",
    `Parse/${localStorage.getItem("parseAppId")}/currentUser`,
    "appLogo",
    "baseUrl",
    "domain",
    "parseAppId",
    "username",
    "main_Domain"
  ]);

  useEffect(() => {
    if (localStorage.getItem("accesstoken")) {
      saveCookies();
      if (id !== undefined) {
        getDashboard(id);
      } else {
        getDashboard(localStorage.getItem("PageLanding"));
      }
    } else {
      navigate("/", { replace: true, state: { from: location } });
    }
    // eslint-disable-next-line
  }, [id]);

  //function to use save data in cookies storage
  const saveCookies = () => {
    setCookie("TenantId", localStorage.getItem("TenantId"), { secure: true });
    setCookie("userDetails", localStorage.getItem("userDetails"), {
      secure: true
    });
    setCookie("userEmail", localStorage.getItem("userEmail"), { secure: true });
    setCookie("profileImg", localStorage.getItem("profileImg"), {
      secure: true
    });
    setCookie("fev_Icon", localStorage.getItem("fev_Icon"), { secure: true });
    setCookie("accesstoken", localStorage.getItem("accesstoken"), {
      secure: true
    });
    setCookie(
      `Parse/${localStorage.getItem("parseAppId")}/currentUser`,
      localStorage.getItem(
        `Parse/${localStorage.getItem("parseAppId")}/currentUser`
      ),
      { secure: true }
    );
    setCookie("appLogo", localStorage.getItem("appLogo"), { secure: true });
    setCookie("baseUrl", localStorage.getItem("baseUrl"), { secure: true });
    setCookie("domain", localStorage.getItem("domain"), { secure: true });
    setCookie("parseAppId", localStorage.getItem("parseAppId"), {
      secure: true
    });
    setCookie("username", localStorage.getItem("username"), { secure: true });
    setCookie("main_Domain", window.location.host, { secure: true });
  };
  const getDashboard = async (id) => {
    setloading(true);
    try {
      var forms = Parse.Object.extend("w_dashboard");
      var query = new Parse.Query(forms);
      query.equalTo("objectId", id);
      const results = await query.first();
      const resultjson = results.toJSON();
      let classArray = [];
      let DefaultQuery = "";
      resultjson.rows.forEach((x) => {
        let col_lg = "",
          col_md = "",
          col_xs = "",
          col_sm = "",
          col_ = "",
          obj = {};
        let subItem = [];
        let item = "";
        x.columns.forEach((y) => {
          if (y.widget.type === "customeHtml") {
            DefaultQuery = y.widget.data[0].default;
          }
          if (Number(y["collg"]) > 0) {
            col_lg = "col-lg-" + y["collg"];
          }
          if (Number(y["colmd"]) > 0) {
            col_md = "col-md-" + y["colmd"];
          }
          if (Number(y["colxs"]) > 0) {
            col_xs = "col-xs-" + y["colxs"];
          }
          if (Number(y["colsm"]) > 0) {
            col_sm = "col-sm-" + y["colsm"];
          }
          if (Number(y["col"]) > 0) {
            col_ = "col-" + y["col"];
          }
          item =
            col_lg + " " + col_md + " " + col_xs + " " + col_sm + " " + col_;
          subItem.push(item);
        });
        obj = subItem;
        classArray.push(obj);
      });
      setdashboard(resultjson.rows);
      // console.log("resultjson.rows ", resultjson.rows);
      const arr = resultjson.rows[0].columns
        .filter((col) => {
          if (col.widget.data && col.widget.data.tourSection) {
            return col;
          }
        })
        .map((col) => {
          return {
            selector: `[data-tut=${col.widget.data.tourSection}]`,
            content: col.widget.data.tourMessage,
            position: "top"
            // style: { backgroundColor: "#abd4d2" },
          };
        });
      dispatch(saveTourSteps(arr));
      // console.log("arr ", arr);
      setclassnameArray(classArray);
      if (localStorage.getItem("DashboardDefaultFilter")) {
        setDefaultQuery(localStorage.getItem("DashboardDefaultFilter"));
      } else {
        setDefaultQuery(DefaultQuery);
      }
      setloading(false);
    } catch (e) {
      console.error("Problem", e);
      setloading(false);
    }
  };

  let _dash = (
    <GetDashboard
      dashboard={dashboard}
      classnameArray={classnameArray}
      DefaultQuery={defaultQuery}
    />
  );
  if (loading) {
    _dash = (
      <div style={{ height: "300px", backgroundColor: "white" }}>
        <div
          style={{
            marginLeft: "45%",
            marginTop: "150px",
            fontSize: "45px",
            color: "#3dd3e0"
          }}
          className="loader-37"
        ></div>
      </div>
    );
  }
  return (
    <React.Fragment>
      <Title title="Dashboard" />
      {_dash}
    </React.Fragment>
  );
};

export default Dashboard;
