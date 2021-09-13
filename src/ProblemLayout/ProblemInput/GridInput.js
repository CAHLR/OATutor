import React from "react";
import './GridInput.css'
import { TextField } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import clsx from 'clsx';

class GridInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      gridState: this.EMPTY_GRID(),
    };
    this.clearCells = this.clearCells.bind(this)
  }

  EMPTY_GRID = () => new Array(this.props.numRows || 1)
    .fill(0)
    .map(_ => new Array(this.props.numCols || 1).fill(""))

  textFieldChange(evt, idx, jdx) {
    const gridState = this.state.gridState
    gridState[idx][jdx] = evt.target.value;

    this.setState({
      gridState
    }, () => {
      this.props.onChange(JSON.stringify(this.state.gridState))
    })
  }

  clearCells() {
    this.setState({
      gridState: this.EMPTY_GRID()
    })
  }

  render() {
    const { numCols = 1, numRows = 1 } = this.props;

    const revealClear = this.state.gridState.reduce(
      (acc, cur, _) => acc + cur.reduce(
        (_acc, _cur, __) => _acc + _cur.length,
        0
      ),
      0) > 0; // only reveal the clear button if there is at least something in a cell

    return (
      <div style={{ textAlign: "center" }}>
        <div className={"grid-holder"} style={{
          gridTemplateColumns: `repeat(${numCols}, 1fr)`
        }}>
          {
            new Array(numRows)
              .fill(1)
              .map((_, idx) =>
                new Array(numCols)
                  .fill(1)
                  .map((_, jdx) => {
                    return (
                      <TextField
                        key={`cell-${idx}-${jdx}`}
                        value={this.state.gridState[idx][jdx]}
                        variant={"outlined"} title={`Grid cell #${idx + 1}`}
                        onChange={(evt) => this.textFieldChange(evt, idx, jdx)}
                      />
                    )
                  })
              )
          }
        </div>
        <div style={{
          marginTop: 5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end'
        }}>
          <Button variant="contained" color="secondary" onClick={this.clearCells}
                  className={clsx("revealable", revealClear && "revealed")}>clear all cells</Button>
        </div>
      </div>
    )
  }

}


export default GridInput;
