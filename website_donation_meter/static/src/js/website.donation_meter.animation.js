odoo.define('website_donation_meter.animation', function (require) {
    'use strict';

    // var core = require('web.core');
    var sAnimation = require('website.content.snippets.animation');

    sAnimation.registry.donation_meter = sAnimation.Class.extend({
        selector: '.donation_meter',
        xmlDependencies: [],
        events: {},

        /**
         * @override
         */
        start: function () {
            // var self = this;
            // var $goal = this.$('.goal_donation_amount');
            // var $progression = this.$('.progress_donation_amount');
            // var $donationError = this.$('.donation_error');

            var def = this._rpc({route: '/website_donation_meter/get_amount_donation'}).then(function (data) {
                // $timeline.empty();
                // $goal.empty();
                // $progression.empty();

                if (data.error) {
                    // $donationError.append(qweb.render('website.Error', {data: data}));
                    return;
                }

                if (_.isEmpty(data)) {
                    return;
                }

                thermometer(data.goal, data.amount, true);
            });

            return $.when(this._super.apply(this, arguments), def);
        },

    });
});


//originally from http://stackoverflow.com/questions/149055/how-can-i-format-numbers-as-money-in-javascript
function formatCurrency(n, c, d, t) {
    "use strict";

    var s, i, j;

    c = isNaN(c = Math.abs(c)) ? 2 : c;
    d = d === undefined ? "." : d;
    t = t === undefined ? "," : t;

    s = n < 0 ? "-" : "";
    i = parseInt(n = Math.abs(+n || 0).toFixed(c), 10) + "";
    j = (j = i.length) > 3 ? j % 3 : 0;

    return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
}

/**
 * Thermometer Progress meter.
 * This function will update the progress element in the "thermometer"
 * to the updated percentage.
 * If no parameters are passed in it will read them from the DOM
 *
 * @param {Number} goalAmount The Goal amount, this represents the 100% mark
 * @param {Number} progressAmount The progress amount is the current amount
 * @param {Boolean} animate Whether to animate the height or not
 *
 */
function thermometer(goalAmount, progressAmount, animate) {
    "use strict";

    var $thermo = $("#thermometer"),
        $progress = $(".progress_donation", $thermo),
        $goal = $(".goal_donation", $thermo),
        percentageAmount;

    goalAmount = goalAmount || parseFloat($goal.text()),
        progressAmount = progressAmount || parseFloat($progress.text()),
        percentageAmount = Math.min(Math.round(progressAmount / goalAmount * 1000) / 10, 100); //make sure we have 1 decimal point

    //let's format the numbers and put them back in the DOM
    $goal.find(".amount").text("$" + formatCurrency(goalAmount));
    $progress.find(".amount").text("$" + formatCurrency(progressAmount));


    //let's set the progress indicator
    $progress.find(".amount").show();
    if (animate !== false) {
        $progress.animate({
            "height": percentageAmount + "%"
        }, 1200, function () {
            $(this).find(".amount").fadeIn(500);
        });
    } else {
        $progress.css({
            "height": percentageAmount + "%"
        });
        $progress.find(".amount").fadeIn(500);
    }
}

$(document).ready(function () {

    //call without the parameters to have it read from the DOM
    // thermometer();
    // or with parameters if you want to update it using JavaScript.
    // you can update it live, and choose whether to show the animation
    // (which you might not if the updates are relatively small)
    //thermometer( 1000000, 425610, false );

});
