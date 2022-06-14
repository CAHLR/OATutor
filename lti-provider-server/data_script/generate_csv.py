import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
from google.oauth2 import service_account
import pandas as pd
import sys


def merge_lesson_skill(df, retain="oats_user_id"):
    df = df.copy().drop(columns=["lesson"])
    original = df.merge(lesson_skill_df, how="inner", left_on="problemID", right_on="problem_name")
    original = original.drop_duplicates(subset=[retain, "time_stamp"], keep="first")  # drop duplicate
    hashed = df.merge(lesson_skill_df, how="inner", left_on="problemID", right_on="hashed_name")
    joined = pd.concat([original, hashed]).reset_index().drop(columns=["index"])
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

def step_operation(df):
    df = df.copy()
    
    step_answers = (df[df["eventType"] == "answerStep"]["input"]).astype(str).tolist()
    
    df["time_diff"] = (df["time_stamp"].diff(periods=-1) * -0.001).round(2).astype(str)
    time_diff = df[df["eventType"] == "unlockHint"]["time_diff"]
    if len(time_diff) > 0:
        time_diff = time_diff.tolist()
    else:
        time_diff = ["No Hints Used"]
        
    return "; ".join(step_answers) + ",,," + "; ".join(time_diff)


# Set up firebase credentials
credentials = service_account.Credentials.from_service_account_file('./oatutor-firebase-adminsdk.json')
scoped_credentials = credentials.with_scopes(['https://www.googleapis.com/auth/cloud-platform'])
db=firestore.Client(credentials=scoped_credentials)

# Get update for current semester
data_dir = "./data/"

re_read = True
if len(sys.argv) == 2 and sys.argv[1].lower() == "false":
    re_read = False
if re_read:
    current = "Spring 2022"
    problemSubmissions = list(db.collection(u'problemSubmissions').where(u'semester', u'==', current).stream())
    problemSubmissions_dict = list(map(lambda x: x.to_dict(), problemSubmissions))
    df_current_raw = pd.DataFrame(problemSubmissions_dict)
    df_current_raw.to_csv(data_dir + "current_sem_submission.csv")

# Read in and clear data
retain = "canvas_user_id"
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

# Merge isCorrect and hintIsCorrect
anal_df["isCorrect"] = (anal_df["isCorrect"] | anal_df["hintIsCorrect"])
anal_df.drop(columns=["hintIsCorrect"], inplace=True)
anal_df.loc[anal_df["eventType"] == "unlockHint", "isCorrect"] = None
anal_df["isCorrect"] = anal_df["isCorrect"].astype("boolean")

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

# Problem-wise processing
df = anal_df.groupby(["semester", "lesson", "canvasUserId", "problemID", "stepID"]).apply(step_operation).to_frame().reset_index()
df["studentAnswers"] = df[0].str.split(",,,").str[0]
df["timeForHint"] = df[0].str.split(",,,").str[1]
df.drop(columns=[0], inplace=True)
df["problemName"] = df["problemID"].str.extract(r"([0-9a-zA-Z]{7}[a-zA-Z]+)\d+$")
df["problemIndex"] = df["problemID"].str.extract(r"[0-9a-zA-Z]{7}[a-zA-Z]+(\d+)$")

df.to_csv(data_dir + "full_analysis.csv", sep="\t")
