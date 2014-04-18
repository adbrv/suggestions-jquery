    var utils = (function () {
        var uniqueId = 0;
        return {
            escapeRegExChars: function (value) {
                return value.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
            },
            getDefaultType: function () {
                return ($.support.cors ? 'POST' : 'GET');
            },
            getDefaultContentType: function () {
                return ($.support.cors ? 'application/json' : 'application/x-www-form-urlencoded');
            },
            serialize: function (data) {
                if ($.support.cors) {
                    return JSON.stringify(data);
                } else {
                    return $.param(data, true);
                }
            },
            compact: function (array) {
                return $.grep(array, function (el) {
                    return !!el;
                });
            },
            delay: function (handler, delay) {
                return setTimeout(handler, delay || 0);
            },
            uniqueId: function (prefix) {
                return (prefix || '') + ++uniqueId;
            },
            slice: function(obj, start) {
                return Array.prototype.slice.call(obj, start);
            },
            abortRequests: function(){
                $.each(arguments, function(i, request){
                    if (request) {
                        request.abort();
                    }
                })
            },
            /**
             * Returns array1 minus array2
             */
            arrayMinus: function(array1, array2) {
                return $.grep(array1, function(el, i){
                    return $.inArray(el, array2) === -1;
                });
            },
            getWords: function(str, stopwords) {
                var words = str.split(/[.,\s]+/g);
                return this.arrayMinus(this.compact(words), stopwords);
            },
            /**
             * Returns normalized string without stopwords
             */
            normalize: function(str, stopwords) {
                var that = this;
                return that.getWords(str, stopwords).join(' ');
            },
            /**
             * Returns true if str1 includes str2 plus something else, false otherwise.
             */
            stringEncloses: function(str1, str2) {
                return str1.indexOf(str2) !== -1 && str1.length > str2.length;
            },
            haveSameParent: function(suggestions) {
                if (suggestions.length === 0) {
                    return false;
                } else if (suggestions.length === 1) {
                    return true;
                } else {
                    var parentValue = suggestions[0].value;
                    var aliens = $.grep(suggestions, function(suggestion) {
                        return suggestion.value.indexOf(parentValue) === 0;
                    }, true);
                    return aliens.length === 0;
                }
            },
            /**
             * Matches query against suggestions, removing all the stopwords.
             */
            matchByNormalizedQuery: function(query, suggestions, stopwords) {
                var index = -1,
                    queryLowerCase = query.toLowerCase();

                // match query with suggestions
                var normalizedQuery = utils.normalize(queryLowerCase, stopwords);
                var matches = [];
                $.each(suggestions, function(i, suggestion) {
                    var suggestedValue = suggestion.value.toLowerCase();
                    // if query encloses suggestion, than it has already been selected
                    // so we should not select it anymore
                    if (utils.stringEncloses(queryLowerCase, suggestedValue)) {
                        return false;
                    }
                    if (normalizedQuery === utils.normalize(suggestedValue, stopwords)) {
                        matches.push(i);
                    }
                });

                if (matches.length === 1) {
                    index = matches[0];
                }

                return index;
            },
            /**
             * Matches query against suggestions word-by-word (with respect to stopwords).
             * Matches if query words are a subset of suggested words.
             */
            matchByWords: function(query, suggestions, stopwords) {
                var index = -1,
                    queryLowerCase = query.toLowerCase();

                var sameParent = utils.haveSameParent(suggestions);
                if (sameParent) {
                    $.each(suggestions, function(i, suggestion) {
                        var suggestedValue = suggestion.value.toLowerCase();
                        if (utils.stringEncloses(queryLowerCase, suggestedValue)) {
                            return false;
                        }
                        // check if query words are a subset of suggested words
                        var queryWords = utils.getWords(queryLowerCase, stopwords);
                        var suggestionWords = utils.getWords(suggestedValue, stopwords);
                        if (utils.arrayMinus(queryWords, suggestionWords).length === 0) {
                            index = i;
                            return false;
                        }
                    });
                }
                return index;
            }
        };
    }());