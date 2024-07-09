import os
import json

# Path to the source file
#source_file = 'src/content-sources/oatutor/content-pool/a0a04b1divmonomial1/steps/a0a04b1divmonomial1a/tutoring/a0a04b1divmonomial1aDefaultPathway.json'
# Retrieve filepath of all files with DefaultPathway in content-pool directory
# output_file = 'src/a-math-to-speech/hintStrings.txt'

filepaths = []
for root, dirs, files in os.walk('src/a-math-to-speech/content-pool-mts'):
    for file in files:
        if 'DefaultPathway' in file:
            filepaths.append(os.path.join(root, file))


# Read the contents of the finishedHints.txt file
with open('src/a-math-to-speech/finishedHints.txt', 'r') as file:
    hints = file.readlines()
    hints = [hint.strip() for hint in hints]
file.close()

i = 0
for source_file in filepaths:
    # Read the contents of the source file

    with open(source_file, 'r+') as file:
        data = json.load(file)

        # Update the "text" attribute with hints[i]
        for obj in data:
            obj['speech'] = hints[i]
            i+=1
       
        # Write the updated JSON object to the source file
        file.seek(0)
        file.write(json.dumps(data, indent=4))
        file.truncate()

    file.close()
        #contents = file.read()
#         data = json.load(file)

#         # Extract the "text" attribute from each JSON object
#         contents = [obj['text'] for obj in data]

#         # Write the contents to the output file
#         for content in contents:
#             outfile.write(content + "\n")

print(f"Contents have been written")
