export function ActivityDetector(
    keylog,
    startSelect,
    endSelect,
    ActivityCancel,
    TextChangeCancel
) {
    if (keylog.TextContent.length >= 1) {
        // textchange     //activity
        let textNow = String(keylog.TextContent.slice(-2, -1)); // used to guess what happens to the text at the current event.
        let change =
            String(keylog.TextContent.slice(-1)).length -
            String(keylog.TextContent.slice(-2, -1)).length;

        if (change === 0) {
            let start = parseInt(startSelect.slice(-2, -1));
            let end = parseInt(endSelect.slice(-2, -1));

            let start1 = parseInt(startSelect.slice(-2, -1));
            let end1 = parseInt(endSelect.slice(-2, -1));
            let start2 = parseInt(startSelect.slice(-1));
            let end2 = parseInt(endSelect.slice(-1));
            let Text1 = String(keylog.TextContent.slice(-2, -1)).slice(
                start1,
                end1
            );
            let Text2 = String(keylog.TextContent.slice(-1)).slice(
                start2,
                end2
            );

            if (start1 < end1 && start2 < end2 && Text1 === Text2) {
                // when move is detected

                if (start2 > start1 && end2 > end1) {
                    //front move
                    let movedText = String(keylog.TextContent.slice(-1)).slice(
                        start2,
                        end2
                    );
                    keylog.TextChange.push(movedText);
                    TextChangeCancel.push(movedText);
                    keylog.Activity.push(
                        `Move From [${start1}, ${end1}] To [${start2}, ${end2}]`
                    );
                    ActivityCancel.push(
                        `Move From [${start1}, ${end1}] To [${start2}, ${end2}]`
                    );

                    textNow =
                        String(textNow.slice(0, start1)) +
                        String(textNow.slice(end1, end2)) +
                        movedText +
                        textNow.slice(end2, textNow.length);
                } else if (start2 < start1 && end2 < end1) {
                    //back move

                    let movedText = String(keylog.TextContent.slice(-1)).slice(
                        start2,
                        end2
                    );
                    keylog.TextChange.push(movedText);
                    TextChangeCancel.push(movedText);
                    keylog.Activity.push(
                        `Move From [${start1}, ${end1}] To [${start2}, ${end2}]`
                    );
                    ActivityCancel.push(
                        `Move From [${start1}, ${end1}] To [${start2}, ${end2}]`
                    );
                    textNow =
                        textNow.slice(0, start2) +
                        movedText +
                        textNow.slice(start2, start1) +
                        textNow.slice(end1, textNow.length);
                } else if (start2 === start1 && end2 === end1) {
                    // no move in the end

                    keylog.TextChange.push("NoChange");
                    TextChangeCancel.push("NoChange");
                    keylog.Activity.push("Nonproduction");
                    ActivityCancel.push("Nonproduction");
                } else if (start2 < start1 && end2 > end1) {
                    // mistakenly select all the text
                    keylog.TextChange.push("NoChange");
                    TextChangeCancel.push("NoChange");
                    keylog.Activity.push("Nonproduction");
                    ActivityCancel.push("Nonproduction");
                }
            } else if (
                start1 === end1 &&
                start2 < end2 &&
                String(textNow) !== String(keylog.TextContent.slice(-1))
            ) {
                // cancel this move
                let changeN = parseInt(ActivityCancel.length);

                for (let i = 0; i <= changeN - 1; i++) {
                    let num = changeN - 1 - i;
                    let activity = String(ActivityCancel[num]);
                    if (activity.startsWith("Move")) {
                        keylog.TextChange.push(String(TextChangeCancel[num]));
                        TextChangeCancel.splice(num, 1);
                        let index1 = activity.indexOf("[");
                        let index2 = activity.indexOf("]");
                        let index3 = activity.lastIndexOf("[");
                        let secondmove = activity.slice(index1, index2 + 1);
                        let firstmove = activity.slice(index3);
                        keylog.Activity.push(
                            `Move From ${firstmove} To ${secondmove}`
                        );
                        ActivityCancel.splice(num, 1);
                        textNow = String(keylog.TextContent.slice(-1));
                        i = changeN - 1;
                    }

                    if (activity.startsWith("Replace")) {
                        let middleindex = String(
                            TextChangeCancel[num]
                        ).lastIndexOf(" => ");
                        let substitute = String(TextChangeCancel[num]).slice(
                            5,
                            middleindex
                        );
                        let replace = String(TextChangeCancel[num]).slice(
                            middleindex + 4
                        );
                        keylog.TextChange.push(`${replace} => ${substitute}`);
                        keylog.Activity.push("Replace");
                        TextChangeCancel.splice(num, 1);
                        ActivityCancel.splice(num, 1);
                        textNow = String(keylog.TextContent.slice(-1));
                        i = changeN - 1;
                    }
                }
            } else {
                if (textNow === String(keylog.TextContent.slice(-1))) {
                    keylog.TextChange.push("NoChange");
                    keylog.Activity.push("Nonproduction");
                } else {
                    // start the else condition
                    if (start < end) {
                        // replace activity: replace n chracters with n new characters
                        textNow =
                            String(keylog.TextContent.slice(-2, -1)).slice(
                                0,
                                start
                            ) +
                            String(keylog.TextContent.slice(-1)).substr(
                                start,
                                end + change - start
                            ) +
                            String(keylog.TextContent.slice(-2, -1)).slice(
                                end,
                                String(keylog.TextContent.slice(-2, -1)).length
                            );

                        let replaced = String(
                            keylog.TextContent.slice(-2, -1)
                        ).substr(start, end - start);
                        let substitute = String(
                            keylog.TextContent.slice(-1)
                        ).substr(start, end + change - start);
                        if (textNow === String(keylog.TextContent.slice(-1))) {
                            if (replaced !== substitute) {
                                keylog.TextChange.push(
                                    `${replaced} => ${substitute}`
                                );
                                TextChangeCancel.push(
                                    `${replaced} => ${substitute}`
                                );
                                keylog.Activity.push("Replace");
                                ActivityCancel.push("Replace");
                            } else {
                                keylog.TextChange.push("NoChange");
                                keylog.Activity.push("Nonproduction");
                            }
                        } else {
                            AutoCorrectionDector(keylog);
                            // textNow adjustment
                            textNow = String(keylog.TextContent.slice(-1));
                        }
                    }
                    if (start === end) {
                        // irregular replacement
                        AutoCorrectionDector(keylog);
                        // textNow adjustment
                        textNow = String(keylog.TextContent.slice(-1));
                    }
                }
            }
        }

        if (change === 1) {
            let start = parseInt(startSelect.slice(-2, -1));
            let end = parseInt(endSelect.slice(-2, -1));

            let index = parseInt(endSelect.slice(-1));

            textNow =
                textNow.slice(0, index - 1) +
                String(keylog.TextContent.slice(-1))[index - 1] +
                textNow.slice(index - 1);

            if (textNow === String(keylog.TextContent.slice(-1))) {
                // just a common input
                keylog.TextChange.push(
                    String(keylog.TextContent.slice(-1))[index - 1]
                );
                keylog.Activity.push("Input");
            } else {
                /// replace n characters with n+1 new characters

                if (start < end) {
                    /// regular paste activity
                    textNow =
                        String(keylog.TextContent.slice(-2, -1)).slice(
                            0,
                            start
                        ) +
                        String(keylog.TextContent.slice(-1)).substr(
                            start,
                            end + change - start
                        ) +
                        String(keylog.TextContent.slice(-2, -1)).slice(
                            end,
                            String(keylog.TextContent.slice(-2, -1)).length
                        );

                    let replaced = String(
                        keylog.TextContent.slice(-2, -1)
                    ).substr(start, end - start);
                    let substitute = String(
                        keylog.TextContent.slice(-1)
                    ).substr(start, end + change - start);

                    if (textNow === String(keylog.TextContent.slice(-1))) {
                        ReplaceDetector(replaced, substitute, keylog);
                    } else {
                        //irregular paste activity.
                        AutoCorrectionDector(keylog);
                        // textNow adjustment
                        textNow = String(keylog.TextContent.slice(-1));
                    }
                }

                if (start === end) {
                    AutoCorrectionDector(keylog);
                    // textNow adjustment
                    textNow = String(keylog.TextContent.slice(-1));
                }
            }
        }

        if (change > 1) {
            let start = parseInt(startSelect.slice(-2, -1));
            let end = parseInt(endSelect.slice(-2, -1));

            let rangeStart = parseInt(keylog.CursorPosition.slice(-2, -1)); // the time beyond the last time where the cursor is.
            let rangeEnd = parseInt(keylog.CursorPosition.slice(-1)); // the last time where the cursor is.
            let newlyAdded = String(keylog.TextContent.slice(-1)).slice(
                rangeStart,
                rangeEnd
            );

            textNow =
                textNow.slice(0, rangeStart) +
                String(keylog.TextContent.slice(-1)).slice(
                    rangeStart,
                    rangeEnd
                ) +
                textNow.slice(rangeStart);

            if (textNow === String(keylog.TextContent.slice(-1))) {
                // Paste more than 1 character
                keylog.TextChange.push(newlyAdded);
                keylog.Activity.push("Paste");
            } else {
                // replace activity
                if (start < end) {
                    // regular replace activity: replace n characters with n+m characters
                    textNow =
                        String(keylog.TextContent.slice(-2, -1)).slice(
                            0,
                            start
                        ) +
                        String(keylog.TextContent.slice(-1)).substr(
                            start,
                            end + change - start
                        ) +
                        String(keylog.TextContent.slice(-2, -1)).slice(
                            end,
                            String(keylog.TextContent.slice(-2, -1)).length
                        );

                    let replaced = String(
                        keylog.TextContent.slice(-2, -1)
                    ).substr(start, end - start);
                    let substitute = String(
                        keylog.TextContent.slice(-1)
                    ).substr(start, end + change - start);

                    if (textNow === String(keylog.TextContent.slice(-1))) {
                        ReplaceDetector(replaced, substitute, keylog);
                    } else {
                        //irregular paste activity.
                        AutoCorrectionDector(keylog);
                        // textNow adjustment
                        textNow = String(keylog.TextContent.slice(-1));
                    }
                }

                if (start === end) {
                    // irregular replace activity
                    AutoCorrectionDector(keylog);
                    // textNow adjustment
                    textNow = String(keylog.TextContent.slice(-1));
                }
            }
        }

        if (change === -1) {
            let start = parseInt(startSelect.slice(-2, -1));
            let end = parseInt(endSelect.slice(-2, -1));

            let index = parseInt(keylog.CursorPosition.slice(-2, -1));
            let textinfo = String(keylog.TextContent.slice(-2, -1));
            let deleted = "";

            if (
                String(keylog.Output.slice(-2, -1)) === "Delete" &&
                start === end
            ) {
                deleted = textinfo[index];
                textNow = textNow.slice(0, index) + textNow.slice(index + 1);
            } else {
                deleted = textinfo[index - 1]; // curosor position and character position are different
                textNow = textNow.slice(0, index - 1) + textNow.slice(index);
            }

            if (textNow === String(keylog.TextContent.slice(-1))) {
                // backspace or delete to remove just one character
                keylog.TextChange.push(deleted);
                keylog.Activity.push("Remove/Cut");
            } else {
                if (start < end) {
                    // regular replace activity: replace n characters with n-1 new characters
                    textNow =
                        String(keylog.TextContent.slice(-2, -1)).slice(
                            0,
                            start
                        ) +
                        String(keylog.TextContent.slice(-1)).substr(
                            start,
                            end + change - start
                        ) +
                        String(keylog.TextContent.slice(-2, -1)).slice(
                            end,
                            String(keylog.TextContent.slice(-2, -1)).length
                        );

                    let replaced = String(
                        keylog.TextContent.slice(-2, -1)
                    ).substr(start, end - start);
                    let substitute = String(
                        keylog.TextContent.slice(-1)
                    ).substr(start, end + change - start);

                    if (textNow === String(keylog.TextContent.slice(-1))) {
                        ReplaceDetector(replaced, substitute, keylog);
                    } else {
                        //irregular paste activity.
                        AutoCorrectionDector(keylog);
                        // textNow adjustment
                        textNow = String(keylog.TextContent.slice(-1));
                    }
                }

                if (start === end) {
                    AutoCorrectionDector(keylog);
                    // textNow adjustment
                    textNow = String(keylog.TextContent.slice(-1));
                }
            }
        }

        if (change < -1) {
            let start = parseInt(startSelect.slice(-2, -1));
            let end = parseInt(endSelect.slice(-2, -1));

            let rangeStart = parseInt(startSelect.slice(-2, -1));
            let rangeEnd = parseInt(endSelect.slice(-2, -1));

            let textinfo = String(keylog.TextContent.slice(-2, -1));
            let deleted = textinfo.slice(rangeStart, rangeEnd);

            textNow = textNow.slice(0, rangeStart) + textNow.slice(rangeEnd);

            if (textNow === String(keylog.TextContent.slice(-1))) {
                // delete more than 1 characters
                keylog.TextChange.push(deleted);
                keylog.Activity.push("Remove/Cut");
            } else {
                if (start < end) {
                    // regular replace activity: replace n characters with n-m (m<n) new characters
                    textNow =
                        String(keylog.TextContent.slice(-2, -1)).slice(
                            0,
                            start
                        ) +
                        String(keylog.TextContent.slice(-1)).substr(
                            start,
                            end + change - start
                        ) +
                        String(keylog.TextContent.slice(-2, -1)).slice(
                            end,
                            String(keylog.TextContent.slice(-2, -1)).length
                        );

                    let replaced = String(
                        keylog.TextContent.slice(-2, -1)
                    ).substr(start, end - start);
                    let substitute = String(
                        keylog.TextContent.slice(-1)
                    ).substr(start, end + change - start);

                    if (textNow === String(keylog.TextContent.slice(-1))) {
                        ReplaceDetector(replaced, substitute, keylog);
                    } else {
                        //irregular paste activity.
                        AutoCorrectionDector(keylog);
                        // textNow adjustment
                        textNow = String(keylog.TextContent.slice(-1));
                    }
                }

                if (start === end) {
                    AutoCorrectionDector(keylog);
                    // textNow adjustment
                    textNow = String(keylog.TextContent.slice(-1));
                }
            }
        }
    } else {
        keylog.TextChange.push("NoChange");
        keylog.Activity.push("Nonproduction");
    }
    // Sharon added logging:
    console.log("keylog event: ", keylog);
}

//////// this function is used to handle irregular replace activities -- or detect auto correction or completion activities
function AutoCorrectionDector(keylog) {
    let oldText = String(keylog.TextContent.slice(-2, -1));
    let newText = String(keylog.TextContent.slice(-1));

    if (oldText !== newText) {
        let oldTextLen = oldText.length;
        let newTextLen = newText.length;

        // Find the index at which the change ended (relative to the end of the string)
        let e = 0; //use current cursor position
        while (
            e < oldTextLen &&
            e < newTextLen &&
            oldText[oldTextLen - 1 - e] === newText[newTextLen - 1 - e]
        ) {
            e++;
        }
        // the change end of old text and new text
        let oldTextChangeEnd = oldTextLen - e;
        let newTextChangeEnd = newTextLen - e;

        // find the index at which the change started -- to avoid processing too much information, limit the numer of changed characters to 100
        let s;
        if (oldTextLen - e <= 100 || newTextLen - e <= 100) {
            s = 0;
            while (
                s < oldTextLen &&
                s < newTextLen &&
                oldText[s] === newText[s]
            ) {
                s++;
            }
        } else {
            s = Math.min(oldTextLen - e, newTextLen - e);
            while (
                s < oldTextLen &&
                s < newTextLen &&
                oldText[s] === newText[s]
            ) {
                s++;
            }
        }

        let replaced = oldText.slice(s, oldTextChangeEnd);
        let substitute = newText.slice(s, newTextChangeEnd);
        if (replaced.length > 0 && substitute.length > 0) {
            if (replaced !== substitute) {
                keylog.TextChange.push(`${replaced} => ${substitute}`);
                keylog.Activity.push("AutoCorrectionReplace");
            } else {
                keylog.TextChange.push("NoChange");
                keylog.Activity.push("Nonproduction");
            }
        } else if (replaced.length > 0 && substitute.length === 0) {
            keylog.TextChange.push(replaced);
            keylog.Activity.push("AutoCorrectionRemove/Cut");
        } else if (replaced.length === 0 && substitute.length > 0) {
            keylog.TextChange.push(substitute);
            keylog.Activity.push("AutocorrectionPaste");
        } else {
            keylog.TextChange.push("NoChange");
            keylog.Activity.push("Nonproduction");
        }

        // cursorPosition adjustment
        let thisPosition = newTextChangeEnd;
        keylog.CursorPosition.pop(); // remove the last value
        keylog.CursorPosition.push(thisPosition); // add the new position
    } else {
        keylog.TextChange.push("NoChange");
        keylog.Activity.push("Nonproduction");
    }
}

// this function is used to detect replace events in different conditions
function ReplaceDetector(replaced, substitute, keylog) {
    if (replaced.length > 0 && substitute.length > 0) {
        if (replaced !== substitute) {
            keylog.TextChange.push(`${replaced} => ${substitute}`);
            keylog.Activity.push("Replace");
        } else {
            keylog.TextChange.push("NoChange");
            keylog.Activity.push("Nonproduction");
        }
    } else if (replaced.length > 0 && substitute.length === 0) {
        keylog.TextChange.push(replaced);
        keylog.Activity.push("Remove/Cut");
    } else if (replaced.length === 0 && substitute.length > 0) {
        keylog.TextChange.push(substitute);
        keylog.Activity.push("Paste");
    } else {
        keylog.TextChange.push("NoChange");
        keylog.Activity.push("Nonproduction");
    }
}
