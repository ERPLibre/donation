odoo.define('website_donation_meter.animation', function (require) {
    'use strict';

    // var core = require('web.core');
    var sAnimation = require('website.content.snippets.animation');
    var ProductConfiguratorMixin = require('sale.ProductConfiguratorMixin');

    sAnimation.registry.donation_meter = sAnimation.Class.extend(ProductConfiguratorMixin, {
        selector: '.donation_meter',
        xmlDependencies: [],
        events: {},
        read_events: {
            'click #don_100': '_onClickDonate100',
            'click #don_50': '_onClickDonate50',
            'click #don_20': '_onClickDonate20',
            'click #don_10': '_onClickDonate10',
            'click #don_5': '_onClickDonate5',
            'click #don_other': '_onClickDonateOther',
            'click #don_other_final': '_onClickDonateOtherFinal',
            'click a.js_add_cart_json': '_onClickAddCartJSON',
            'change input.js_quantity': '_onChangeDonQuantity',
        },

        /**
         * @override
         */
        start: function () {
            // var self = this;
            // var $goal = this.$('.goal_donation_amount');
            // var $progression = this.$('.progress_donation_amount');
            // var $donationError = this.$('.donation_error');

            // TODO set "input" by default at 0

            this.$("#btn_don_other").show();
            this.$("#btn_don_other_final").hide();

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
        //--------------------------------------------------------------------------
        // Handlers
        //--------------------------------------------------------------------------

        /**
         * @private
         */
        _onClickDonate100: function () {
            this._rpc({
                route: "/shop/cart/update_json",
                params: {
                    product_id: 8,
                    add_qty: 1
                },
            }).then(function (data) {
                window.location = '/shop/checkout?express=1';
            });
        },

        /**
         * @private
         */
        _onClickDonate50: function () {
            this._rpc({
                route: "/shop/cart/update_json",
                params: {
                    product_id: 7,
                    add_qty: 1
                },
            }).then(function (data) {
                window.location = '/shop/checkout?express=1';
            });
        },

        /**
         * @private
         */
        _onClickDonate20: function () {
            this._rpc({
                route: "/shop/cart/update_json",
                params: {
                    product_id: 5,
                    add_qty: 1
                },
            }).then(function (data) {
                window.location = '/shop/checkout?express=1';
            });
        },

        /**
         * @private
         */
        _onClickDonate10: function () {
            this._rpc({
                route: "/shop/cart/update_json",
                params: {
                    product_id: 4,
                    add_qty: 1
                },
            }).then(function (data) {
                window.location = '/shop/checkout?express=1';
            });
        },

        /**
         * @private
         */
        _onClickDonate5: function () {
            this._rpc({
                route: "/shop/cart/update_json",
                params: {
                    product_id: 3,
                    add_qty: 1
                },
            }).then(function (data) {
                window.location = '/shop/checkout?express=1';
            });
        },

        /**
         * @private
         */
        _onClickDonateOtherFinal: function (ev) {
            ev.preventDefault();
            var $link = $(ev.currentTarget);
            var $input = $link.parent().parent().find("input");
            var value = parseFloat($input.val() || 0, 10);
            this._rpc({
                route: "/shop/cart/update_json",
                params: {
                    product_id: 6,
                    add_qty: value
                },
            }).then(function (data) {
                window.location = '/shop/checkout?express=1';
            });
        },

        /**
         * @private
         */
        _onClickDonateOther: function () {
            if (this.$("#btn_don_other").is(":visible")) {
                this.$("#btn_don_other").hide();
                this.$("#btn_don_other_final").show();
            } else {
                this.$("#btn_don_other").show();
                this.$("#btn_don_other_final").hide();
            }
        },

        /**
         * @private
         * @param {MouseEvent} ev
         */
        _onClickAddCartJSON: function (ev) {
            this.onClickAddCartJSON(ev);
        },

        /**
         * @private
         * @param {Event} ev
         */
        _onChangeDonQuantity: function (ev) {
            var $input = $(ev.target);
            var value = parseFloat($input.val() || 0, 10);
            if (isNaN(value)){
                value = 0;
            }
            var $text = $input.parent().next().find("font");
            // TODO missing translation
            $text.text("Faire un don de " + value + "$");
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
