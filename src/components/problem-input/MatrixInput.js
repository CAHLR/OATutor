import React from "react";
import GridInput from "./GridInput";

class MatrixInput extends React.Component {
    // "$$\begin{bmatrix} -840 & 650 & -530 \\ 330 & 360 & 250 \\ -10 & 900 & 110 \end{bmatrix}$$"

    render() {
        return (
            <GridInput {...this.props} isMatrix={true}/>
        )
    }
}


export default MatrixInput;
