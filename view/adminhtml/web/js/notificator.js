/*jshint jquery:true*/
define(["jquery", "jquery/jquery.cookie"], function($){
    'use strict';

    $(document).ready(function() {
        var messagesContainer = $('#customers_notifications .message-system-inner');
        var requestInterval = 15000;
        var buildSearchCriteria = function() {
            if ($.cookie('atwix_recent_user_date') == undefined) {
                var fromDate = getCurrentDateFormatted();
                setCookie('atwix_recent_user_date', fromDate);
            } else {
                fromDate = $.cookie('atwix_recent_user_date');
            }

            return {
                "search_criteria": {
                    "filter_groups": [
                        {
                            "filters": [
                                {
                                    "field": "created_at",
                                    "value": fromDate,
                                    "condition_type": "gt"
                                }
                            ]
                        }
                    ],
                    "current_page": 1,
                    "page_size": 3
                }
            };
        };

        var getCurrentDateFormatted = function() {
            function pad(n){ return n<10 ? '0'+n : n }
            var d = new Date();
            return d.getUTCFullYear()+'-'
                + pad(d.getUTCMonth()+1)+'-'
                + pad(d.getUTCDate()) +' '
                + pad(d.getUTCHours())+':'
                + pad(d.getUTCMinutes())+':'
                + pad(d.getUTCSeconds())
        };

        var getRecentUsers = function() {
            $.ajax({
                url: '/rest/V1/customers/search',
                type: 'GET',
                data: buildSearchCriteria(),
                dataType: 'json',
                showLoader: false,
                success: function(data) {
                    if (data.items.length > 0) {
                        messagesContainer.html('');
                        for (var _counter = 0, itemsCount = data.items.length; _counter < itemsCount; _counter++) {
                            var item = data.items[_counter];
                            messagesContainer.append(
                                '<p>New customer registered: <b>' + item.firstname + ' ' + item.lastname + '</b></p>'
                            );
                            setCookie('atwix_recent_user_date', item.created_at);
                        }
                        $('#customers_notifications').show();
                    }
                }
            });
        };

        var setCookie = function(cookieName, cookieValue) {
            $.cookie(cookieName, cookieValue, {path: '/'});
        };

        setInterval(function() { getRecentUsers() }, requestInterval);
    });
});