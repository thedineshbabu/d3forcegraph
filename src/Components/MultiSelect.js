import React from "react";
import { default as ReactSelect } from "react-select";
import makeAnimated from "react-select/animated";
import { components } from "react-select";

const Option = (props) => {
  return (
    <div>
      <components.Option {...props}>
        <input
          type="checkbox"
          checked={props.isSelected}
          onChange={() => null}
        />{" "}
        <label>{props.label}</label>
      </components.Option>
    </div>
  );
};

const MultiValue = (props) => (
  <components.MultiValue {...props}>
    <span>{props.data.label}</span>
  </components.MultiValue>
);

const animatedComponents = makeAnimated();

const MultiSelect = ({
  colourOptions,
  optionSelected,
  handleMultiSelectChange,
  defaultProps,
}) => {
  return (
    <div>
      <ReactSelect
        options={[defaultProps.allOption, ...colourOptions]}
        isMulti
        closeMenuOnSelect={false}
        hideSelectedOptions={false}
        components={{ Option, MultiValue, animatedComponents }}
        onChange={handleMultiSelectChange}
        allowSelectAll={true}
        value={optionSelected}
      />
    </div>
  );
};

export default MultiSelect;
