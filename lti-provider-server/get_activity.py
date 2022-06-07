import pandas as pd
import datetime
import sys

BREAK_LEN = 10

def merge_lesson_skill(df, retain="oats_user_id"):
    df = df.copy().drop(columns=["lesson"])
    original = df.merge(lesson_skill_df, how="inner", left_on="problemID", right_on="problem_name")
    original = original.drop_duplicates(subset=[retain, "time_stamp"], keep="first")  # drop duplicate
    hashed = df.merge(lesson_skill_df, how="inner", left_on="problemID", right_on="hashed_name")
    joined = original.append(hashed).reset_index().drop(columns=["index"])
    return joined.sort_values("time_stamp")

def clear_data(df):
    df = df.copy()
    
    df = df[(df["oats_user_id"].notnull())]
    
    df["time"] = pd.to_datetime(df["time_stamp"], unit='ms')
    df = df.sort_values(["time"], ascending=True) 
    
    df = df.reset_index().drop(columns=["index", "Unnamed: 0"])
    
    return df


def analyze_each_problem(df):
    step_correct = sum((df["eventType"] == "answerStep") & (df["firstAttempt"] == True) & (df["isCorrect"] == True))
    step_wrong = sum((df["eventType"] == "answerStep") & (df["firstAttempt"] == True) & (df["isCorrect"] == False))
    hint_count = sum(df["eventType"] == "unlockHint")
    avg_time_diff = df['time_stamp'].diff().div(1000).median()
    return step_correct, step_wrong, hint_count, avg_time_diff


if __name__ == '__main__':
    with open("testFile.txt", "w") as file1:
        file1.write("1")
    semester = sys.argv[1]
    lesson = sys.argv[2]
    canvas_user_id = sys.argv[3]

    retain = "canvas_user_id"

    # Read in and clear data
    data_dir = "./data_script/data/"
    lesson_skill_df = pd.read_csv(data_dir + "lesson_skill.csv", 
                                usecols=["problem_name", "hashed_name", "sheet_name", "skills", "lesson_name"])
    lesson_skill_df = lesson_skill_df.rename({"sheet_name": "lesson", "lesson_name": "course"}, axis="columns")

    df_raw = pd.read_csv(data_dir + "submission.csv")
    df_current_raw = pd.read_csv(data_dir + "current_sem_submission.csv")
    df_current_raw.drop(columns="lesson", inplace=True)
    df_raw = pd.concat([df_raw, df_current_raw]).drop_duplicates(subset="time_stamp")
    df_cleared = clear_data(df_raw)
    canvas_only_df = df_cleared[df_cleared[retain].notnull()]
    anal_df = merge_lesson_skill(canvas_only_df, retain)

    # First attempt
    first_attempt_index = anal_df[anal_df["eventType"] == "answerStep"].reset_index()\
                            .groupby([retain, "stepID"], as_index=False).first()["index"]
    anal_df["firstAttempt"] = False
    anal_df.loc[first_attempt_index, "firstAttempt"] = True
    anal_df.loc[anal_df["eventType"] == "unlockHint", "firstAttempt"] = None
    anal_df.loc[anal_df["eventType"] == "hintScaffoldLog", "firstAttempt"] = None
    anal_df["firstAttempt"] = anal_df["firstAttempt"].astype("boolean")

    # Reorder columns and rows
    anal_df = anal_df.rename(columns={"canvas_user_id": "canvasUserId", "oats_user_id": "oatsUserId"})
    anal_df = anal_df.sort_values("time")
    anal_df = anal_df.reset_index().drop(columns=["index"])

    keep_df = anal_df[(anal_df["semester"] == semester) & (anal_df["lesson"] == lesson) & (anal_df["canvasUserId"] == canvas_user_id)]
    df = keep_df.groupby("problemID").apply(analyze_each_problem).to_frame().reset_index().rename(columns={0: "stat"})
    df = df.iloc[:3]

    for idx, row in df.iterrows():
        print(row["problemID"], row["stat"])
    sys.stdout.flush()
