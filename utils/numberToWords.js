const util = require('util');

const words = [
    'Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
];

const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function convertNumberToWords(num) {
    if (typeof num !== 'number' || isNaN(num)) return 'Invalid amount';

    // We only handle up to 999,999,999 for simplicity here
    // But since it's fees, this is way more than enough
    if (num === 0) return 'Zero Rupees Only';

    function convertLessThanOneThousand(n) {
        if (n < 20) {
            return words[n];
        }
        if (n < 100) {
            return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + words[n % 10] : '');
        }
        return words[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convertLessThanOneThousand(n % 100) : '');
    }

    let result = '';

    if (Math.floor(num / 10000000) > 0) {
        result += convertLessThanOneThousand(Math.floor(num / 10000000)) + ' Crore ';
        num %= 10000000;
    }

    if (Math.floor(num / 100000) > 0) {
        result += convertLessThanOneThousand(Math.floor(num / 100000)) + ' Lakh ';
        num %= 100000;
    }

    if (Math.floor(num / 1000) > 0) {
        result += convertLessThanOneThousand(Math.floor(num / 1000)) + ' Thousand ';
        num %= 1000;
    }

    if (num > 0) {
        result += convertLessThanOneThousand(num);
    }

    return result.trim() + ' Rupees Only';
}

module.exports = { convertNumberToWords };
