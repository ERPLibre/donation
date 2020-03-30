from odoo import http
from odoo.http import request


class WebsiteDonationMeter(http.Controller):
    @http.route(['/website_donation_meter/get_amount_donation'], type='json',
                auth="public", website=True)
    def get_donation_amount(self):
        # TODO use the goal from module donation with campaign MISSING
        # TODO validate filter to detect real donation
        so_filter = [
            ('state', '=', 'sale')
        ]
        so_ids = request.env['sale.order'].sudo().search(so_filter)
        # Exclude tax, it's not a donation
        amount = sum([a.amount_untaxed for a in so_ids])
        return {"goal": 5000, "amount": amount}
