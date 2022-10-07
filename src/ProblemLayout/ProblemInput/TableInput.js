import React, { createRef } from "react";
import './GridInput.css'
import Button from "@material-ui/core/Button";
import clsx from 'clsx';
import EquationEditor from "equation-editor-react";
import { Box,TextField } from "@material-ui/core";
import { EQUATION_EDITOR_AUTO_COMMANDS, EQUATION_EDITOR_AUTO_OPERATORS } from "../../config/config";
import { stagingProp } from "../../util/addStagingProperty";

class TableInput extends React.Component {
    
    constructor(props) {
     
        super(props);
        this.state = {
            gridState: props.defaultValue || this.genEmptyGrid(props.numRows, props.numCols),
        };
        this.gridRef = createRef()
        this.clearCells = this.clearCells.bind(this)
        this.numRows = props.numRows;
        this.numCols = props.numCols;
        this.headers = props.headers;
    }


    genEmptyGrid = (numRows, numCols) => new Array(numRows)
        .fill(0)
        .map(_ => new Array(numCols).fill(""))

    cellFieldChange(str, idx, jdx) {
        const gridState = this.state.gridState
        gridState[idx][jdx] = str;

        this.setState({
            gridState
        }, () => {
            this.props.onChange(JSON.stringify(this.state.gridState))
        })
    }

    clearCells(evt) {
        if (evt != null && evt.type === 'submit') {
            evt.preventDefault()
        }
        
        this.setState({
            gridState: this.genEmptyGrid(this.numRows, this.numCols)
        })
        if (this.gridRef.current) {
            this.gridRef.current
                .querySelectorAll(".mq-editable-field > *[mathquill-command-id], .mq-root-block > *[mathquill-command-id]")
                .forEach(node => {
                    node.remove()
                })
        }
    }


    render() {
        const { classes, index } = this.props;
        
        const { gridState } = this.state;

        const revealClearButton = gridState.reduce((acc, cur, _) =>
                acc + cur.reduce((_acc, _cur, __) =>
                    _acc + _cur.length, 0
                ), 0
        ) > 0; // only reveal the clear button if there is at least something in a cell

        return (
            <div>
                <div ref={this.gridRef}>
                    
                <Box
                    display={'grid'}
                    gridTemplateColumns={`repeat(3, 0fr)`}
                    overflow={'hidden'}
                    pt={0}
                    pb={0}
                    gridGap={1}
                    gridColumnGap={1}
                    justifyItems={'center'}
                    justifyContent={'center'}
                    sx={{
                        '& .MuiTextField-root': { m: 1, width: 'min(120px, 19vw)', borderRadius: 0,
                         outline: "1px solid #c4c4c4", borderTop: '1px solid #c4c4c4', 
                         borderBottom: '1px solid #c4c4c4', background: '#ececec'}
                    }}
                    >
                        
                        {
                            gridState[0].map((row, col) => {
                                    return (
                                    <TextField
                                        disabled
                                        id="filled-disabled"
                                        label="Disabled"
                                        defaultValue={this.props.headers[col]}
                                        key ={col}
                                        className={'grid-cell'}
                                    />
                                    )
                                })
                        }
    
                    </Box>
                    <Box display={'grid'}
                            gridTemplateColumns={`repeat(${gridState[0].length}, 0fr)`}
                            overflow={'auto'}
                            pt={0}
                            pb={1}
                            gridGap={1}
                            gridColumnGap={1}
                            justifyItems={'center'}
                            justifyContent={'center'}
                            
                    >
                        {
                            gridState.map((row, idx) =>
                                row.map((val, jdx) => {
                                    return (
                                        <center
                                            className={clsx(classes.textTblLatex, 'grid-cell')}
                                            key={`cell-${idx}-${jdx}`}
                                            aria-label={`Cell (${idx}, ${jdx})`}
                                            {...stagingProp({
                                                "data-selenium-target": `grid-answer-cell-${jdx + idx * this.state.numCols}-${index}`
                                            })}
                                        >
                                            <EquationEditor
                                                value={val}
                                                onChange={(str) => this.cellFieldChange(str, idx, jdx)}
                                                style={{ width: "100%" }}
                                                autoCommands={EQUATION_EDITOR_AUTO_COMMANDS}
                                                autoOperatorNames={EQUATION_EDITOR_AUTO_OPERATORS}
                                            />
                                        
                                        </center>
                                        
                                    )
                                })
                            )
                        }
                    </Box>
                </div>
                <Box mt={1} display={'grid'} width={'100%'} alignItems={'center'} justifyContent={'center'}>
                    <Button variant="contained" color="secondary" onClick={this.clearCells}
                            className={clsx("revealable", revealClearButton && "revealed")}>clear all
                        cells</Button>
                </Box>
            </div>
        )
    }

}


export default TableInput;
