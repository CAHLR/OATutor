import os
import json


filepaths = []
for root, dirs, files in os.walk('src/a-math-to-speech/content-pool-mts'):
    for file in files:
        if 'DefaultPathway' in file:
            filepaths.append(os.path.join(root, file))


# Read the contents of the finishedHints.txt file
with open('src/a-math-to-speech/hint-text-files/conversion-math/combined_finishedHints.txt', 'r', encoding='utf-8') as file: 
    hints = file.readlines()
    hints = [hint.strip() for hint in hints]
file.close()

with open('src/a-math-to-speech/hint-text-files/math.txt', 'r', encoding='utf-8') as file: 
    maths = file.readlines()
    maths = [ "$$" + math.strip().split('@') + "$$" for math in maths]
file.close()

i = 0
for source_file in filepaths:
    # Read the contents of the source file

    with open(source_file, 'r+', encoding='utf-8') as file:
        data = json.load(file)

        # Update the "text" attribute with hints[i]
        for obj in data:
            obj['speech'] = hints[i]
            if maths[i] != '':
                obj['math'] = maths[i]
            i+=1
       
        # Write the updated JSON object to the source file
        file.seek(0)
        file.write(json.dumps(data, indent=4))
        file.truncate()

    file.close()

print(f"Contents have been written")
