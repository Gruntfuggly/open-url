# Open URL

Opens a URL with placeholder substitution, using the command "Open URL: Open URL" or the editor context menu.

Currently, the only placeholder supported is for the current selection, but others may be supported in the future, such as the current file.

For example, to open Qt5 documentation for the selected class name, define:

```json
"open-url.url": "https://doc.qt.io/qt-5/${TM_SELECTED_TEXT/downcase/}.html"
```

## Installing

You can install the latest version of the extension via the Visual Studio Marketplace [here](https://marketplace.visualstudio.com/items?itemName=Gruntfuggly.open-url).

### Source Code

The source code is available on GitHub [here](https://github.com/Gruntfuggly/open-url).

## Configuration

### `open-url.url`

The URL to open. `${TM_SELECTED_TEXT}` will be replaced by the current selection. Uppercase and lowercase transformations are also supported. e.g. `${TM_SELECTED_TEXT/downcase/}`.

default: `https://www.google.com/search?q=${TM_SELECTED_TEXT}`

### `open-url.notification`

How to show what URL is being opened. Valid values are `none`, `popup` or `statusBar`.

default: `none`

### `open-url.regex`

A regex to match selections for opening. When this matches the current selection, a button will be shown on the status bar (with a book icon) which can be used to quickly open the URL. For example, set it to `^Q[A-Za-z]+$` to match Qt classes. Note: if a capture group is defined in the regex, it's contents will be substituted instead of the whole selection.

default: `""`

### `open-url.regexes`

An object mapping regexes to URLs. This allows multiple patterns to be defined.

default: `{}`

Example:

```json
"open-url.regexes": {
    "juce::(.*)": "https://docs.juce.com/master/class${TM_SELECTED_TEXT}.html",
    ".*": "https://cmake.org/cmake/help/latest/command/${TM_SELECTED_TEXT}.html
}
```


## Credits

Icon made by [https://www.freepik.com](Freepik) from [https://www.flaticon.com](www.flaticon.com).
