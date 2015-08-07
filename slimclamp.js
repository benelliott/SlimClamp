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
     * Returns a substring of stringEnd, whose length is half-way between that
     * of stringStart and stringEnd
     * @param  stringStart - the string at the bottom of the range
     * @param  stringEnd - the string at the top of the range
     * @return the string in the middle of the range
     */
    var getMidRangeString = function(stringStart, stringEnd){
        if (stringEnd.length - stringStart.length < 2)
            return stringStart;
        return stringEnd.slice(0, (stringStart.length + stringEnd.length) / 2);
    };

    /**
     * Tests a string of text to determine whether it puts the element in the
     * admissible range of heights when suffixed with the truncationString
     * and used as the element's content.
     * @param  element - the element whose content is being truncated
     * @param  text - the string to test
     * @param  admissibleHeightStartPx - the bottom of the range of admissible heights
     * @param  admissibleHeightEndPx - the top of the range of admissible heights
     * @param  truncationString - the string to append to the element content
     * @return -1 if the height was too low, 0 if it was correct, 1 if it was too high
     */
    var rangeTest = function(element, text, admissibleHeightStartPx, admissibleHeightEndPx, truncationString){
        element.innerHTML = text + truncationString;
        if (element.clientHeight <= admissibleHeightEndPx) {
            return element.clientHeight >= admissibleHeightStartPx ?
                0 : // exactly in rangeTest
                -1; // too small
        }
        else
            return 1; // too big
    };

    /**
     * Uses a binary search to find the truncated text contents that will fit
     * into the element.
     * @param  element - the element whose contents is tested
     * @param  textRangeStart - the string at the bottom of the range to test
     * @param  textRangeEnd - the string at the top of the range to test
     * @param  targetRangeStart - the height at the bottom of the admissible range
     * @param  targetRangeEnd - the height at the top of the admissible range
     * @param  truncationString - the string to append to the element contents
     * @return the truncated text that was converged upon
     */
    var binaryTruncateSearch = function(element, textRangeStart, textRangeEnd, targetRangeStart, targetRangeEnd, truncationString){
        var middleText = getMidRangeString(textRangeStart, textRangeEnd);
        if (middleText === textRangeStart) {
            var truncated = middleText + truncationString;
            element.innerHTML = truncated;
            return truncated;
        }
        switch (rangeTest(element, middleText, targetRangeStart, targetRangeEnd, truncationString)) {
            case 0: // passes
                return middleText;
            case -1: // too small
                return binaryTruncateSearch(element, middleText, textRangeEnd, targetRangeStart, targetRangeEnd, truncationString);
            case 1: // too large
                return binaryTruncateSearch(element, textRangeStart, middleText, targetRangeStart, targetRangeEnd, truncationString);
        }
    };

    /**
     * Converges upon a text content that causes the provided element's height to
     * fit in the admissible range as determined by
     * (maxHeight - searchThreshold) <= h <= maxHeight
     * @param  element - the element whose contents to test
     * @param  maxHeight - the maximum admissible height of the element in px
     * @param  searchThreshold - the search threshold in px
     * @param  truncationString - the string to append to the truncated contents
     * @return the text contents that was converged upon
     */
    var truncateContents = function(element, maxHeight, searchThreshold, truncationString){
        return binaryTruncateSearch(element, '', element.innerHTML, maxHeight - searchThreshold, maxHeight, truncationString);
    };

    var DEFAULT_TRUNCATION_STRING = '…';
    var DEFAULT_LINE_HEIGHT_PX = 16;
    var DEFAULT_SEARCH_THRESHOLD_PX = 5;

    window.$clamp = function(element, numLines, truncationString){
        if (typeof(element.style.webkitLineClamp) !== 'undefined') {
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
                lineHeight = DEFAULT_LINE_HEIGHT_PX;
            var maxHeight = lineHeight * numLines;
            if (element.clientHeight <= maxHeight)
                return; // already fits
            truncateContents(
                element,
                maxHeight,
                DEFAULT_SEARCH_THRESHOLD_PX,
                typeof truncationString !== 'undefined' ? truncationString : DEFAULT_TRUNCATION_STRING);
        }
    };
})();