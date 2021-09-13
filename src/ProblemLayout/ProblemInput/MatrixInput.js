import React from "react";

class GridInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: null,
    };
  }

  render() {
    return (
      <GridInput {...this.props}/>
    )
  }
}


export default GridInput;
