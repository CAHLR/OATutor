import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
from google.oauth2 import service_account
import pandas as pd

# Set up firebase credentials
credentials = service_account.Credentials.from_service_account_file('./oatutor-firebase-adminsdk.json')
scoped_credentials = credentials.with_scopes(['https://www.googleapis.com/auth/cloud-platform'])
db=firestore.Client(credentials=scoped_credentials)

# Get update for current semester
current = "Spring 2022"
problemSubmissions = list(db.collection(u'problemSubmissions').where(u'semester', u'==', current).stream())
problemSubmissions_dict = list(map(lambda x: x.to_dict(), problemSubmissions))
df_current_raw = pd.DataFrame(problemSubmissions_dict)
df_current_raw.to_csv("./data/current_sem_submission.csv")
