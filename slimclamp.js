(function() {
    'use strict';

    /**
     * Polyfill for window.getComputedStyle which allows for the querying of
     * an element's computed style properties.
     * @param  elem - the element whose style is to be queried
     * @param  prop - the name of the style property to query
     * @return the value of elem's computed prop
     */
    function computeStyle(elem, prop) {
        if (!window.getComputedStyle) {
            window.getComputedStyle = function(el) {
                this.getPropertyValue = function(prop, pseudo) {
                    var re = /(\-([a-z]))/g;
                    if (prop === 'float')
                        prop = 'styleFloat';
                    if (re.test(prop)) {
                        prop = prop.replace(re, function() {
                            return arguments[2].toUpperCase();
                        });
                    }
                    return el.currentStyle && el.currentStyle[prop] ? el.currentStyle[prop] : null;
                };
                return this;
            }
        }

        return window.getComputedStyle(elem, null).getPropertyValue(prop);
    }

    // Polyfill for String.trim
    if (!String.prototype.trim) {
        String.prototype.trim = function () {
            return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
        };
    }

    /**
     * Returns whether the provided string is valid.
     * @param  string
     * @return true if string is a valid string, else false
     */
    var invalidString = function(string){
        return typeof string !== 'string' || string === null || string.trim() === '';
    };

    /**
     * Returns the computed line height of the element if it exists, else infers
     * it from the element's computed font size.
     * @param  element - the element whose line height to retrieve
     * @return the element's line height
     */
    var getLineHeight = function(element) {
        var lh = computeStyle(element, 'line-height');
        if (lh === 'normal' || invalidString(lh))
            // Normal line heights vary from browser to browser. The spec recommends
            // a value between 1.0 and 1.2 of the font size.
            return parseInt(computeStyle(element, 'font-size')) * 1.2;
        else
            return parseInt(lh);
    };

    /**
     * Returns a new string with the final numChars characters removed from
     * the provided string.
     * @param  string - the string to truncate
     * @param  numChars - the number of characters to remove
     * @param  appendString - a string to append to the new string (optional)
     * @return string with numChars chars removed from the end
     */
    var removeLastChars = function(string, numChars, appendString){
        var end = string.length - numChars;
        return (end <= 0 ? '' : string.slice(0, end)) +
            (invalidString(appendString) ? '' : appendString);
    };


    var middle = function(stringStart, stringEnd){
        return stringEnd.slice(0, (stringStart.length + stringEnd.length) / 2);
    };

    var rangeTest = function(element, text, admissibleHeightStart, admissibleHeightEnd, truncationString){
        element.innerHTML = text + truncationString;
        return element.clientHeight <= admissibleHeightEnd && element.clientHeight >= admissibleHeightStart;
    };

    var search = function(element, textRangeStart, textRangeEnd, targetRangeStart, targetRangeEnd, truncationString){
        var middleText = middle(textRangeStart, textRangeEnd);
        switch (rangeTest(element, middleText, targetRangeStart, targetRangeEnd, truncationString)) {
          case 0: // passes
            return middleText;
          case -1: // too small
            return search(middleText, textRangeEnd, targetRangeStart, targetRangeEnd);
          case 1: // too large
            return search(textRangeStart, middleText, targetRangeStart, targetRangeEnd);
        }
    };

    var find = function(element, maxHeight, searchThreshold, truncationString){
        return search(element, '', element.innerHTML, maxHeight - searchThreshold, maxHeight, truncationString);
    };

    /**
     * Truncates the text contents of the provided element so that the element's
     * height is less than or equal to maxHeightPx.
     * @param  element - the element whose contents to truncate
     * @param  maxHeightPx - the maximum height (in pixels) of the element
     * @param  truncationString - the string with which to truncate the text
     */
    var truncate = function(element, maxHeightPx, truncationString){
        if (!maxHeightPx || element.clientHeight <= maxHeightPx - SEARCH_THRESHOLD)
            return;

        var originalText = element.innerHTML;
        var text = originalText;
        while ((element.clientHeight > maxHeight || element.clientHeight < maxHeight - SEARCH_THRESHOLD) && text.length > 0) {
            // remove one character from the text until it fits in the limits
            // TODO: use binary search to make this more efficient

            if (element.clientHeight > maxHeight) {
                // too large
                text = firstHalf(text);
            }
            else {
                // too small
            }

            text = removeLastChars(text, 1 + truncationString.length, truncationString);
            element.innerHTML = text;
        }
    };

    var DEFAULT_TRUNCATION_STRING = '…';
    var DEFAULT_LINE_HEIGHT_PX = 16;
    var DEFAULT_SEARCH_THRESHOLD_PX = 5;

    window.$clamp = function(element, numLines, truncationString){
      if (false){
        // if (typeof(element.style.webkitLineClamp) !== 'undefined') {
            // browser supports clamping natively
            element.style.overflow = 'hidden';
            element.style.textOverflow = 'ellipsis';
            element.style.webkitBoxOrient = 'vertical';
            element.style.display = '-webkit-box';
            element.style.webkitLineClamp = numLines;
        }
        else {
            // fall back to iterative clamping method
            var lineHeight = getLineHeight(element);
            if (isNaN(lineHeight))
                lineHeight = DEFAULT_LINE_HEIGHT;
            // truncate(
            //   element,
            //   lineHeight * numLines,
            //   typeof truncationChar !== 'undefined' ? truncationString : DEFAULT_TRUNCATION_STRING);
            var text = find(element, lineHeight * numLines, DEFAULT_SEARCH_THRESHOLD_PX, typeof truncationChar !== 'undefined' ? truncationString : DEFAULT_TRUNCATION_STRING);
        }
    };
})();
