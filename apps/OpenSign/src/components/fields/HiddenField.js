import React, { Component } from "react";
import Parse from "parse";
// import axios from "axios";

export class HiddenField extends Component {
  state = {
    baseUrl: localStorage.getItem("baseUrl"),
    parseAppId: localStorage.getItem("parseAppId"),
    _fields: ""
  };
  loadData = async () => {
    if (this.props.schema.default) {
      this.setState({ _fields: this.props.schema.default });
    } else {
      try {
        Parse.serverURL = this.state.baseUrl;
        Parse.initialize(this.state.parseAppId);
        let currentUser = await Parse.User.current();
        if (localStorage.getItem("Extand_Class")) {
          let _rdata = JSON.parse(localStorage.getItem("Extand_Class"));
          let custome_Filed = "";
          let splitArray = this.props.schema.data.valueKey.split(".");
          if (splitArray.length > 1) {
            custome_Filed = _rdata[0][splitArray[0]][splitArray[1]];
          } else {
            let _Filed = _rdata[0][splitArray[0]];
            if (typeof _Filed === "object") {
              custome_Filed = {
                __type: "Pointer",
                className: _Filed["className"],
                objectId: _Filed["objectId"]
              };
            } else {
              custome_Filed = _rdata[0][splitArray[0]];
            }
          }
          this.setState({ _fields: custome_Filed });
        } else {
          if (currentUser) {
            // let url = `${this.state.baseUrl}classes/${localStorage.getItem(
            //   "extended_class"
            // )}?where={"UserId":{"__type":"Pointer","className":"_User","objectId":"${
            //   currentUser.id
            // }"}}&keys=${this.props.schema.data.valueKey}`;
            // const headers = {
            //   "Content-Type": "application/json",
            //   "X-Parse-Application-Id": this.state.parseAppId
            // };
            // await axios.get(url, { headers: headers }).then((res) => {
            //   let custome_Filed = "";
            //   let _rdata = res.data.results;
            //   let splitArray = this.props.schema.data.valueKey.split(".");
            //   if (splitArray.length > 1) {
            //     custome_Filed = _rdata[0][splitArray[0]][splitArray[1]];
            //   } else {
            //     console.log(_rdata[0][splitArray[0]]);
            //     custome_Filed = _rdata[0][splitArray[0]];
            //   }
            //   this.setState({ _fields: custome_Filed });
            // });

            const res = await Parse.Cloud.run("getUserDetails", {
              email: currentUser.get("email")
            });
            let custome_Filed = "";
            const result = res.toJSON();
            let _rdata = [result];
            let splitArray = this.props.schema.data.valueKey.split(".");
            if (splitArray.length > 1) {
              custome_Filed = _rdata[0][splitArray[0]][splitArray[1]];
            } else {
              console.log(_rdata[0][splitArray[0]]);
              custome_Filed = _rdata[0][splitArray[0]];
            }
            this.setState({ _fields: custome_Filed });
          }
        }
      } catch (error) {
        console.log("err", error);
      }
    }
  };
  componentDidMount() {
    this.loadData();
  }

  render() {
    return (
      <input
        type="hidden"
        value={this.state._fields}
        onChange={this.props.onChange(this.state._fields)}
      />
    );
  }
}

export default HiddenField;
