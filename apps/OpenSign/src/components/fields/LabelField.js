import React from "react";
import parse from "html-react-parser";
import PropTypes from "prop-types";

const LabelField = (props) => {
  const { Title, Name, Required, HelpBody, HelpLink } = props;
  const REQUIRED_FIELD_SYMBOL = "*";
  return (
    <div style={{ display: "inline-block" }}>
      <label htmlFor={Name}>
        {Title}
        {Required && <span className="required">{REQUIRED_FIELD_SYMBOL}</span>}
        {HelpBody ? (
          <div className="dropdown pull-right">
            <i
              className="far fa-question-circle dropdown-toggle hovereffect pull-right"
              aria-hidden="true"
              id="dropdownMenuButton"
              data-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="false"
              style={{
                fontSize: "12px",
                color: "purple",
                cursor: "pointer !important",
                position: "relative",
                bottom: "0px",
                left: "0px",
                paddingBottom: "4px",
                paddingLeft: "4px"
              }}
            ></i>
            <div
              className="dropdown-menu"
              aria-labelledby="dropdownMenuButton"
              style={{
                marginleft: "-121px",
                margintop: "-14px",
                position: "absolute",
                padding: "10px",
                top: "102px!important"
              }}
            >
              {parse(`
             ${HelpBody}
           `)}
              <br />
              {HelpLink ? (
                <a
                  href={HelpLink}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-xs btn-primary"
                >
                  Read more..
                </a>
              ) : null}
            </div>
          </div>
        ) : null}
      </label>
    </div>
  );
};

LabelField.propTypes = {
  Name: PropTypes.string.isRequired,
  Title: PropTypes.string.isRequired
};
export default LabelField;
