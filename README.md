# SlimClamp
A stripped-down JavaScript text clamper, inspired by the original [Clamp.js](https://github.com/josephschmitt/Clamp.js/).

In short, this library allows you to limit the number of lines of text that are visible in an HTML element, gracefully truncating the text with an ellipsis if necessary. It uses browser-native functionality to do this if available, but otherwise will fall back to an iterative approach.

This library will improve on the original in the following ways:
- Much smaller file size
- Cleaner code structure
- Fewer bugs
- Full IE8+ compatibility
- Bower support (coming soon)

However this comes at the cost of cutting away some features, such as the 'auto' and '__px' clamping settings. Neither of these were suitable for my use case and I am sceptical that the former does not work in the original library. I may include the latter at a later date. Thus it currently only supports usage in the following way:

```
$clamp(elementToBeClamped, numberOfLinesToClamp);
```
Another difference is that this library will happily split a text string at any character, while the original will iterate through a list of preferred 'split characters' (such as whitespace) before resorting to breaking words arbitrarily.

Note that one limitation which exists on both versions of the library is that text will not be correctly truncated if the clamping is performed before the elements have been fully rendered, if viewing on a browser that lacks native support for text clamping.

TODOs:
- Fully document code
- Add Bower support
- Use binary search for iteration
- Add '__px' config setting (maybe).
