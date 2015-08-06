(function(){
    /**
     * Return the current style for an element.
     * @param {HTMLElement} elem The element to compute.
     * @param {string} prop The style property.
     * @returns {number}
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

    if (!String.prototype.trim) {
        String.prototype.trim = function () {
            return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
        };
    }

    var invalidString = function(string){
        return typeof string !== 'string' || string === null || string.trim() === '';
    };

    /**
     * Returns the line-height of an element as an integer.
     */
    var getLineHeight = function(element) {
        var lh = computeStyle(element, 'line-height');
        if (lh === 'normal' || invalidString(lh))
            // Normal line heights vary from browser to browser. The spec recommends
            // a value between 1.0 and 1.2 of the font size. Using 1.1 to split the diff.
            return parseInt(computeStyle(element, 'font-size')) * 1.1;
        else
            return parseInt(lh);
    };

    var removeLastChars = function(string, numChars){
        return string.slice(0, string.length - numChars);
    };

    var truncate = function(element, maxHeightPx, truncationChar){
        if (!maxHeightPx || element.clientHeight <= maxHeightPx)
            return;

        var text = element.innerHTML;

        while (element.clientHeight > maxHeightPx) {
            text = removeLastChars(text, 1);
            element.innerHTML = text;
        }

        text = removeLastChars(text, 3); // TODO -- bit of a hack that assumes the truncation char is < 3 chars wide
        element.innerHTML = text + truncationChar;
    };

    var DEFAULT_TRUNCATION_CHAR = '…';
    var DEFAULT_LINE_HEIGHT = 16;

    window.$clamp = function(element, numLines){
        if (typeof(element.style.webkitLineClamp) !== 'undefined') {
            element.style.overflow = 'hidden';
            element.style.textOverflow = 'ellipsis';
            element.style.webkitBoxOrient = 'vertical';
            element.style.display = '-webkit-box';
            element.style.webkitLineClamp = numLines;
        }
        else {
            var lineHeight = getLineHeight(element);
            if (isNaN(lineHeight))
                lineHeight = DEFAULT_LINE_HEIGHT;
            truncate(element, lineHeight * numLines, DEFAULT_TRUNCATION_CHAR);
        }
    };
})();