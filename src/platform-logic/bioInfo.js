import React, { Component } from "react";
import { AppBar, Toolbar } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import BrandLogoNav from "@components/BrandLogoNav";
import "./bioInfo.css";

class BioInfo extends Component {
    constructor(props) {
        super(props);

        this.state = {
            userInput: "",
            showModal: false,
        };
    }

    componentDidMount() {
        const savedData = localStorage.getItem("bioInfo");
        if (savedData) {
            this.setState({ userInput: savedData });
        }
    }

    handleChange = (event) => {
        this.setState({ userInput: event.target.value });
    };

    handleSave = () => {
        const { userInput } = this.state;
        localStorage.setItem("bioInfo", userInput);
        alert("Information saved successfully!");
    };

    handleDelete = () => {
        this.setState({ showModal: true });
    };

    handleConfirmDelete = () => {
        const { userInput } = this.state;
        if (localStorage.getItem("bioInfo") === userInput) {
            localStorage.removeItem("bioInfo");
            alert("Information deleted successfully!");
            this.setState({ userInput: "" });
        } else {
            alert("No matching data found!");
        }
        this.setState({ showModal: false });
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
                    <div className="sample-bio">
                        <span className="sample-bio-title">
                            Sample Bio Information:
                        </span>
                        <span>
                            I'm AskOski, a passionate sophomore majoring in
                            Computer Science at the UC Berkeley. With a deep
                            fascination for coding and technology, I've actively
                            participated in programming competitions, honing my
                            problem-solving skills and exploring algorithms and
                            data structures. I'm particularly intrigued by the
                            intersection of computer science and mathematics.
                        </span>
                    </div>
                    <textarea
                        className="input-field"
                        value={userInput}
                        onChange={this.handleChange}
                        placeholder="Enter your information..."
                    />
                    <div className="button-row">
                        <button
                            className="save-button"
                            onClick={this.handleSave}
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
