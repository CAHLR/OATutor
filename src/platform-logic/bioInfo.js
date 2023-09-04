import React, { Component } from "react";
import { AppBar, Toolbar } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import BrandLogoNav from "@components/BrandLogoNav";
import "./bioInfo.css";

class BioInfo extends Component {
    constructor(props) {
        super(props);

        this.state = {
            userInput: {
                gender: "",
                age: "",
                confidenceQ1: "",
                confidenceQ2: "",
                judgementQ1: "",
                judgementQ2: "",
                judgementQ3: "",
                other: "",
            },
            showModal: false,
            allowSave: true,
        };
    }

    componentDidMount() {
        const savedData = localStorage.getItem("bioInfo");
        if (savedData) {
            this.setState({ userInput: JSON.parse(savedData) });
        }
    }

    handleInputChange = (event) => {
        const { value, name } = event.target;
        // console.log(name, value);
        this.setState((prevState) => ({
            userInput: {
                ...prevState.userInput,
                [name]: value,
            },
            allowSave: true,
        }));
    };

    checkValidAnswer = () => {
        const { userInput } = this.state;
        if (
            !userInput.age ||
            !userInput.gender ||
            !userInput.confidenceQ1 ||
            !userInput.confidenceQ2 ||
            !userInput.judgementQ1 ||
            !userInput.judgementQ2 ||
            !userInput.judgementQ3
        ) {
            alert("Empty values detected. Please answer all questions.");
            return false;
        }
        return true;
    };

    handleSave = () => {
        const { userInput } = this.state;
        if (this.checkValidAnswer()) {
            localStorage.setItem("bioInfo", JSON.stringify(userInput));
            // console.log(userInput);
            this.setState({ allowSave: false });
            alert("Information saved successfully!");
        }
    };

    handleDelete = () => {
        this.setState({ showModal: true });
    };

    handleConfirmDelete = () => {
        localStorage.removeItem("bioInfo");
        alert("Information deleted successfully!");
        this.setState({
            userInput: {
                gender: "",
                age: "",
                confidenceQ1: "",
                confidenceQ2: "",
                judgementQ1: "",
                judgementQ2: "",
                judgementQ3: "",
                other: "",
            },
            showModal: false,
            allowSave: true,
        });
    };

    handleCancelDelete = () => {
        this.setState({ showModal: false });
    };

    render() {
        const { userInput, showModal } = this.state;

        return (
            <div className="container">
                <AppBar position="static">
                    <Toolbar>
                        <Grid
                            container
                            spacing={0}
                            role={"navigation"}
                            alignItems={"center"}
                        >
                            <Grid item xs={3} key={1}>
                                <BrandLogoNav
                                    isPrivileged={this.isPrivileged}
                                />
                            </Grid>
                        </Grid>
                    </Toolbar>
                </AppBar>
                <div className="content-container">
                    <h1 className="title">Enter your Bio Information</h1>
                    <div className="survey-quest">
                        <label className="survey-text">
                            What gender do you identify as?
                        </label>
                        <select
                            name="gender"
                            value={userInput.gender}
                            onChange={(e) => this.handleInputChange(e)}
                        >
                            <option value="">Select</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div className="survey-quest">
                        <label className="survey-text">What is your age?</label>
                        <input
                            type="number"
                            name="age"
                            value={userInput.age}
                            onChange={(e) => this.handleInputChange(e)}
                        ></input>
                    </div>
                    <div className="survey-quest">
                        <label className="survey-text">
                            Please select the option you most agree with:
                        </label>
                        <select
                            name="confidenceQ1"
                            value={userInput.confidenceQ1}
                            onChange={(e) => this.handleInputChange(e)}
                        >
                            <option value="">Select</option>
                            <option value="I’m no good at math">
                                I’m no good at math
                            </option>
                            <option
                                value="For some reason, even though I study, math seems
                                unusually hard for me"
                            >
                                For some reason, even though I study, math seems
                                unusually hard for me
                            </option>
                            <option value="I can get good grades in math">
                                I can get good grades in math
                            </option>
                        </select>
                    </div>
                    <div className="survey-quest">
                        <label className="survey-text">
                            Please select the option you most agree with:
                        </label>
                        <select
                            name="confidenceQ2"
                            value={userInput.confidenceQ2}
                            onChange={(e) => this.handleInputChange(e)}
                        >
                            <option value="">Select</option>
                            <option value="I am confident that I can get an A in math">
                                I am confident that I can get an A in math
                            </option>
                            <option value="I am confident that I can get an B in math">
                                I am confident that I can get an B in math
                            </option>
                            <option value="I am confident that I can get an C in math">
                                I am confident that I can get an C in math
                            </option>
                            <option
                                value="I am confident that I can get a passing grade in
                                math"
                            >
                                I am confident that I can get a passing grade in
                                math
                            </option>
                        </select>
                    </div>
                    <div className="survey-quest">
                        <label className="survey-text">
                            If I had more time for practice, I would be better
                            in mathematics.
                        </label>
                        <select
                            name="judgementQ1"
                            value={userInput.judgementQ1}
                            onChange={(e) => this.handleInputChange(e)}
                        >
                            <option value="">Select</option>
                            <option value="Strongly don’t agree">
                                Strongly don’t agree
                            </option>
                            <option value="Don’t agree">Don’t agree</option>
                            <option value="Undecided">Undecided</option>
                            <option value="Agree">Agree</option>
                            <option value="Strongly agree">
                                Strongly agree
                            </option>
                        </select>
                    </div>
                    <div className="survey-quest">
                        <label className="survey-text">
                            If I was more patient while solving mathematical
                            problems, I would be better in mathematics.
                        </label>
                        <select
                            name="judgementQ2"
                            value={userInput.judgementQ2}
                            onChange={(e) => this.handleInputChange(e)}
                        >
                            <option value="">Select</option>
                            <option value="Strongly don’t agree">
                                Strongly don’t agree
                            </option>
                            <option value="Don’t agree">Don’t agree</option>
                            <option value="Undecided">Undecided</option>
                            <option value="Agree">Agree</option>
                            <option value="Strongly agree">
                                Strongly agree
                            </option>
                        </select>
                    </div>
                    <div className="survey-quest">
                        <label className="survey-text">
                            No matter how much time I devote for studying
                            mathematics, I can’t improve my grades.
                        </label>
                        <select
                            name="judgementQ3"
                            value={userInput.judgementQ3}
                            onChange={(e) => this.handleInputChange(e)}
                        >
                            <option value="">Select</option>
                            <option value="Strongly don’t agree">
                                Strongly don’t agree
                            </option>
                            <option value="Don’t agree">Don’t agree</option>
                            <option value="Undecided">Undecided</option>
                            <option value="Agree">Agree</option>
                            <option value="Strongly agree">
                                Strongly agree
                            </option>
                        </select>
                    </div>
                    <div className="survey-quest">
                        <span>Other information</span>
                        <textarea
                            className="input-field"
                            name="other"
                            value={userInput.other}
                            onChange={(e) => this.handleInputChange(e)}
                            placeholder="Enter your information..."
                        />
                    </div>
                    <div className="button-row">
                        <button
                            className="save-button"
                            onClick={this.handleSave}
                            disabled={!this.state.allowSave}
                        >
                            Save
                        </button>
                        <button
                            className="delete-button"
                            onClick={this.handleDelete}
                        >
                            Delete
                        </button>
                    </div>

                    {showModal && (
                        <div className="modal">
                            <div className="modal-content">
                                <h3>Confirm Deletion</h3>
                                <p>
                                    Are you sure you want to delete the
                                    information?
                                </p>
                                <div className="modal-buttons">
                                    <button
                                        className="confirm-button"
                                        onClick={this.handleConfirmDelete}
                                    >
                                        Yes
                                    </button>
                                    <button
                                        className="cancel-button"
                                        onClick={this.handleCancelDelete}
                                    >
                                        No
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

export default BioInfo;
