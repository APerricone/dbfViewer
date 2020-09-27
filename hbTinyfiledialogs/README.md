Harbour port of [tiny file dialogs](http://tinyfiledialogs.sourceforge.net).

Minimal library to shows dialogs.
```C
tinyfd_beep()
// cIconType: "info" "warning" "error"
tinyfd_notifyPopup(cTitle,cMessase,cIconType)
// cDialogType: "ok" "okcancel" "yesno" "yesnocancel"
// cIconType: "info" "warning" "error" "question"
// iBtn: 0 for cancel/no , 1 for ok/yes , 2 for no in yesnocancel
tinyfd_messageBox(cTitle,cMessage,cDialogType,cIconType,iDefBtn) -> iSelectedButton
//
tinyfd_inputBox(cTitle,cMessage,cDefaultInput ) -> cValue or nil on cancel
// aFilterPatterns like  {"*.txt"} //they are applied all together
// cSingleFilterDescription like "text files" the name of the filter with aFilterPatterns
tinyfd_saveFileDialog(cTitle,cDefaultPathAndFile,aFilterPatterns, cSingleFilterDescription ) -> cSelected or nil on cancel
// aFilterPatterns like  {"*.jpg","*.png"} //they are applied all together
// cSingleFilterDescription like "image files" the name of the filter with aFilterPatterns
// returns a string or an array of string if lAllowMultipleSelects is true
// nil on cancel
tinyfd_openFileDialog (cTitle,cDefaultPathAndFile,aFilterPatterns,cSingleFilterDescription,lAllowMultipleSelects) -> see comment
//
tinyfd_selectFolderDialog(cTitle,cDefaultPath) -> cSelected or nil on cancel
// cDefault can be nil, a string hex value like "#FF0000" or an array of 3 values for RGB
// return an hex colo like "#FF0000" or nil on cancel
// aResult if passed will be filled an array with 3 values of RGB
tinyfd_colorChooser (cTitle, cDefault, @aResult ) -> cSelectedColor
```
