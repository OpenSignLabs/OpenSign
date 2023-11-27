import React, { useState, useEffect } from "react";
import Parse from "parse";
import "../styles/loader.css";
import GetDashboard from "../components/dashboard/GetDashboard";
import { useNavigate, useParams } from "react-router-dom";
import Title from "../components/Title";
import { save_tourSteps } from "../redux/actions";
import { connect } from "react-redux";
const Dashboard = (props) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [dashboard, setdashboard] = useState([]);
  const [classnameArray, setclassnameArray] = useState([]);
  const [loading, setloading] = useState(false);
  const [parseBaseUrl] = useState(localStorage.getItem("baseUrl"));
  const [parseAppId] = useState(localStorage.getItem("parseAppId"));
  const [defaultQuery, setDefaultQuery] = useState("");

  useEffect(() => {
    if (localStorage.getItem("accesstoken")) {
      if (id !== undefined) {
        getDashboard(id);
      } else {
        getDashboard(localStorage.getItem("PageLanding"));
      }
    } else {
      navigate("/", { replace: true });
    }
    // eslint-disable-next-line
  }, [id]);

  const getDashboard = async (id) => {
    setloading(true);
    try {
      Parse.serverURL = parseBaseUrl;
      Parse.initialize(parseAppId);
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
      props.save_tourSteps(arr);
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

export default connect(null, {
  save_tourSteps
})(Dashboard);
