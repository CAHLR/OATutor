import React from 'react';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import Paper from '@material-ui/core/Paper';
import { withStyles } from '@material-ui/core/styles';
import styles from './problemCardStyles.js';

class LessonSelection extends React.Component {
	constructor(props) {
		super(props);
		this.lessonPlans = [
			{
				name: "Lesson 1",
				topics: "Pythagorean Theorem",
				learningObjectives: {
					pythagorean: 0.95
				}
			}, {
				name: "Lesson 2",
				topics: "Circles",
				learningObjectives: {
					circle: 0.95
				}
			}, {
				name: "Lesson 3",
				topics: "Slope",
				learningObjectives: {
					slope: 0.95
				}
			}, {
				name: "Lesson 4",
				topics: "Cumulative Review",
				learningObjectives: {
					pythagorean: 0.95,
					circle: 0.95,
					slope: 0.95
				}
			},
		]
	}

	render() {
		const { classes } = this.props;
		return (
			<Grid
				container
				spacing={0}
				direction="column"
				alignItems="center"
				justify="center"
			>
				<Box width="75%" maxWidth={1500} >
					<center>
						<h1>Welcome to OpenITS!</h1>
						<h2>Please select a lesson plan</h2>
					</center>
					<Divider />
					<br />
					<Grid container spacing={3} >
						{this.lessonPlans.map((lesson, i) => {
							return (
								<Grid item xs={4} id={i}>
									<center>
										<Paper className={classes.paper}>
											<h2 style={{ marginTop: "5px", marginBottom: "10px" }}>{lesson.name}</h2>
											<h3 style={{ marginTop: "5px" }}>{lesson.topics}</h3>
											<Button variant="contained" color="primary" className={classes.button} style={{ marginBottom: "10px" }} onClick={() => this.props.selectLesson(lesson.learningObjectives)}>
												Select
										</Button>
										</Paper>
									</center>
								</Grid>
							)
						})}
					</Grid>
				</Box>
			</Grid>
		);
	}
}

export default withStyles(styles)(LessonSelection);