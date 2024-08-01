# Writes all updated speech and math information to the content-source json files

import os
import json


filepaths = []
for root, dirs, files in os.walk('src/content-sources/oatutor/content-pool'):  # inactivated to only run when intended
    for file in files:
        if 'DefaultPathway' in file:
            filepaths.append(os.path.join(root, file))


# Read the contents of the combinedFinishedHints.txt file
# with open('src/math-to-speech/hint-text-files/conversion-math/translatedHintsPost.txt', 'r', encoding='utf-8') as file:  # TODO: Change this path
#     hints = file.readlines()
#     hints = [hint.strip() for hint in hints]

with open('src/math-to-speech/finished-translations/pacedTranslatedHintsPost.txt', 'r', encoding='utf-8') as file:  
    hints = file.readlines()
    hints = [hint.strip().split('£') for hint in hints]

i = 0 
for source_file in filepaths:
    # Read the contents of the source file

    with open(source_file, 'r+', encoding='utf-8') as file:
        data = json.load(file)

        for obj in data:
            obj['pacedSpeech'] = hints[i]
            i+=1
       
        # Write the updated JSON object to the source file
        file.seek(0)
        file.write(json.dumps(data, indent=4))
        file.truncate()

    file.close()

print(f"Contents have been written")
