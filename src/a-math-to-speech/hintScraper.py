import os
import json

# Path to the source file
# Retrieve filepath of all files with DefaultPathway in content-pool directory
output_file = 'src/a-math-to-speech/hint-text-files/scrapedHints.txt'

filepaths = []
for root, dirs, files in os.walk('src/content-sources/oatutor/content-pool'):
    for file in files:
        if 'DefaultPathway' in file:
            filepaths.append(os.path.join(root, file))

with open(output_file, 'w', encoding="utf-8") as outfile:
    for source_file in filepaths:
        # Read the contents of the source file

        with open(source_file, 'r') as file:
            #contents = file.read()
            data = json.load(file)

            # Extract the "text" attribute from each JSON object
            contents = [obj['text'] for obj in data]

            # Write the contents to the output file
            for content in contents:
                outfile.write(content + "\n")

print(f"Contents of {source_file} have been written to {output_file}.")
