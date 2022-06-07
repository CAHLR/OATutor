import pandas as pd
import sys

def analyze_each_problem(df):
    step_correct = sum((df["eventType"] == "answerStep") & (df["firstAttempt"] == True) & (df["isCorrect"] == True))
    step_wrong = sum((df["eventType"] == "answerStep") & (df["firstAttempt"] == True) & (df["isCorrect"] == False))
    hint_count = sum(df["eventType"] == "unlockHint")
    avg_time_diff = df['time_stamp'].diff().div(1000).median()
    return step_correct, step_wrong, hint_count, avg_time_diff


if __name__ == '__main__':
    semester = sys.argv[1]
    lesson = sys.argv[2]
    canvas_user_id = sys.argv[3]
    # Read in and clear data
    data_dir = "./data_script/data/"
    anal_df = pd.read_csv(data_dir + "full_analysis.csv")
    keep_df = anal_df[(anal_df["semester"] == semester) & (anal_df["lesson"] == lesson) & (anal_df["canvasUserId"] == canvas_user_id)]
    df = keep_df.groupby("problemID").apply(analyze_each_problem).to_frame().reset_index().rename(columns={0: "stat"})

    for idx, row in df.iterrows():
        print(row["problemID"], row["stat"])
    sys.stdout.flush()
