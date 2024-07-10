import os
import json

# Path to the source file
# Retrieve filepath of all files with DefaultPathway in content-pool directory
output_file = 'src/a-math-to-speech/variabilization/allVariabilizations.json'


filepaths = []
for root, dirs, files in os.walk('src/content-sources/oatutor/content-pool'):
    for file in files:
        if 'DefaultPathway' in file:
            filepaths.append(os.path.join(root, file))



# have all the filepaths
# filter out those with variabilization: "variabilization": {} is not empty
contents = []
with open(output_file, 'w') as outfile:
    for source_file in filepaths:
        # Read the contents of the source file

        with open(source_file, 'r') as file:
            #contents = file.read()
            data = json.load(file)
            
            for obj in data:
                if obj['variabilization'] != {}:
                    contents.append(json.dumps(obj, indent=2))
                    
# Write the contents to the output file
if len(contents) > 0:
    outfile.write(contents)

print(f"Contents  have been written to {output_file}!.")
