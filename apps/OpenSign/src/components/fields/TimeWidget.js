import React from "react";
import PropTypes from "prop-types";

function TimeWidget(props) {
  const {
    onChange,
    registry: {
      widgets: { BaseInput }
    }
  } = props;
  return (
    <BaseInput
      type="time"
      {...props}
      onChange={(value) => onChange(value || undefined)}
    />
  );
}

if (process.env.NODE_ENV !== "production") {
  TimeWidget.propTypes = {
    value: PropTypes.string
  };
}

export default TimeWidget;
