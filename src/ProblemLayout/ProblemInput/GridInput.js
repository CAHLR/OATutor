import React, { createRef } from "react";
import './GridInput.css'
import Button from "@material-ui/core/Button";
import clsx from 'clsx';
import EquationEditor from "equation-editor-react";
import { Box, ClickAwayListener, Grow, Paper, Popper, TextField } from "@material-ui/core";
import CloseIcon from '@material-ui/icons/Close';
import { toast } from "react-toastify";
import { EQUATION_EDITOR_AUTO_COMMANDS, EQUATION_EDITOR_AUTO_OPERATORS } from "../../config/config";
import generateRandomInt from "../../util/generateRandomInt";
import { stagingProp } from "../../util/addStagingProperty";

class GridInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            gridState: props.defaultValue || this.genEmptyGrid(0, 0),
            numRows: props.numRows || 0,
            numCols: props.numCols || 0,
            openChangeDimensions: false,
            fer: Math.random() // fer: force equation-editor remount
        };

        this.gridRef = createRef()

        this.changeDimRef = createRef()

        this.rowId = `matrix-row-count-${generateRandomInt()}`
        this.colId = `matrix-col-count-${generateRandomInt()}`

        this.clearCells = this.clearCells.bind(this)
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

    dimensionFieldChange(evt, idx) {
        if (idx === 0) {
            this.setState({
                numRows: +evt.target.value
            })
        } else {
            this.setState({
                numCols: +evt.target.value
            })
        }
    }

    clearCells(evt) {
        if (evt != null && evt.type === 'submit') {
            evt.preventDefault()
        }
        const { numRows, numCols } = this.state;

        if (isNaN(numRows) || numRows <= 0 || isNaN(numCols) || numCols <= 0) {
            toast.error('Matrix must be at least 1 x 1')
            return
        }

        this.setState({
            gridState: this.genEmptyGrid(numRows, numCols),
            fer: Math.random()
        }, () => {
            this.props.onChange(JSON.stringify(this.state.gridState))
        })
    }

    toggleChangeDimensionsPopover(to) {
        this.setState({
            openChangeDimensions: to
        })
    }

    render() {
        const { classes, index } = this.props;

        const { gridState, fer } = this.state;

        const revealClearButton = gridState.reduce((acc, cur, _) =>
                acc + cur.reduce((_acc, _cur, __) =>
                    _acc + _cur.length, 0
                ), 0
        ) > 0; // only reveal the clear button if there is at least something in a cell

        const showInitialSlide = gridState.length === 0;

        return (
            <Box textAlign={'center'} display={'flex'} flexDirection={'column'} alignItems={'center'} pt={1} pb={1}>
                {showInitialSlide ? (
                    <form onSubmit={this.clearCells}>
                        <Box className={'grid-input-notice-container'} p={2} bgcolor={'rgb(249,249,250)'}
                             borderRadius={8}>
                            <div style={{
                                fontWeight: 700,
                                fontSize: 18
                            }}>
                                Enter in matrix dimensions.
                            </div>
                            <p>(This can be changed later)</p>
                            <Box display={'flex'} justifyContent={'center'} alignItems={'center'} mt={1}>
                                <TextField
                                    id={this.rowId}
                                    inputProps={{
                                        "aria-labelledby": `${this.rowId}-label`
                                    }}
                                    variant={"outlined"} label={`# rows (Q${index})`} type={'number'}
                                    className={'grid-input-dim-input'}
                                    {...stagingProp({
                                        "data-selenium-target": `grid-answer-row-input-${index}`
                                    })}
                                    onChange={(evt) => this.dimensionFieldChange(evt, 0)}
                                />
                                <CloseIcon/>
                                <TextField
                                    id={this.colId}
                                    inputProps={{
                                        "aria-labelledby": `${this.colId}-label`
                                    }}
                                    variant={"outlined"} label={`# cols (Q${index})`} type={'number'}
                                    className={'grid-input-dim-input'}
                                    {...stagingProp({
                                        "data-selenium-target": `grid-answer-col-input-${index}`
                                    })}
                                    onChange={(evt) => this.dimensionFieldChange(evt, 1)}
                                />
                            </Box>
                            <Box mt={2}>
                                <Button variant={'contained'} color={'primary'} type={'submit'}
                                        {...stagingProp({
                                            "data-selenium-target": `grid-answer-next-${index}`
                                        })}
                                >
                                    Next
                                </Button>
                            </Box>
                        </Box>
                    </form>
                ) : (
                    <div style={{
                        maxWidth: '100%'
                    }}>
                        <Box mb={1} display={'flex'} width={'100%'} alignItems={'center'} justifyContent={'flex-end'}>
                            <Button variant="contained" color="primary"
                                    onClick={() => this.toggleChangeDimensionsPopover(true)}
                                    ref={this.changeDimRef}>DIMENSIONS: {gridState.length} x {gridState[0].length}</Button>
                            <Popper open={this.state.openChangeDimensions}
                                    anchorEl={this.changeDimRef.current} role={undefined}
                                    transition disablePortal
                                    placement={'bottom-end'}
                                    style={{
                                        zIndex: 10
                                    }}
                            >
                                {({ TransitionProps, placement }) => (
                                    <Grow
                                        {...TransitionProps}
                                        style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}
                                    >
                                        <Paper>
                                            <ClickAwayListener
                                                onClickAway={() => this.toggleChangeDimensionsPopover(false)}>
                                                <form onSubmit={(e) => {
                                                    e.preventDefault()
                                                    this.clearCells()
                                                    this.toggleChangeDimensionsPopover(false)
                                                }}>
                                                    <Box className={'grid-input-notice-container'} p={2}
                                                         display={'flex'}
                                                         flexDirection={'column'} alignItems={'flex-end'} boxShadow={3}
                                                         borderRadius={3}>
                                                        <Box display={'flex'} justifyContent={'center'}
                                                             alignItems={'center'} mt={1}>
                                                            <TextField
                                                                size={'small'}
                                                                variant={"filled"} label={'# Rows'} type={'number'}
                                                                className={'grid-input-dim-input'}
                                                                onChange={(evt) => this.dimensionFieldChange(evt, 0)}
                                                            />
                                                            <CloseIcon/>
                                                            <TextField
                                                                size={'small'}
                                                                variant={"filled"} label={'# Cols'} type={'number'}
                                                                className={'grid-input-dim-input'}
                                                                onChange={(evt) => this.dimensionFieldChange(evt, 1)}
                                                            />
                                                        </Box>
                                                        <Box mt={1}>
                                                            <Button variant={'contained'} color={'primary'}
                                                                    type={'submit'} size={'small'}>
                                                                Done
                                                            </Button>
                                                        </Box>
                                                    </Box>
                                                </form>
                                            </ClickAwayListener>
                                        </Paper>
                                    </Grow>
                                )}
                            </Popper>
                        </Box>
                        <div ref={this.gridRef} className={clsx(this.props.isMatrix && 'matrix-container')}>
                            {this.props.isMatrix && <div className={'matrix-bracket-left'}/>}
                            <Box display={'grid'}
                                 gridTemplateColumns={`repeat(${gridState[0].length}, 1fr)`}
                                 overflow={'auto'}
                                 pt={1}
                                 pb={1}
                                 gridGap={8}
                                 justifyItems={'center'}
                            >
                                {
                                    gridState.map((row, idx) =>
                                        row.map((val, jdx) => {
                                            return (
                                                <center
                                                    className={clsx(classes.textBoxLatex, 'grid-cell')}
                                                    key={`cell-${idx}-${jdx}-${fer}`}
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
                            {this.props.isMatrix && <div className={'matrix-bracket-right'}/>}
                        </div>
                        <Box mt={1} display={'flex'} width={'100%'} alignItems={'center'} justifyContent={'flex-end'}>
                            <Button variant="contained" color="secondary" onClick={this.clearCells}
                                    className={clsx("revealable", revealClearButton && "revealed")}>clear all
                                cells</Button>
                        </Box>
                    </div>
                )}
            </Box>
        )
    }

}


export default GridInput;
