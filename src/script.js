function convert(str, fromBase, toBase) {
    const isNumber = letter => !Number.isNaN(+letter)

    function fromCode(letter) {
        return 10 + 'ABCDEFGHIJKLMNOPR'.indexOf(letter)
    }

    if (fromBase === toBase) {
        return str
    }

    function toDec(str, fromBase) {
        const [int, float] = str.split(".")
        let intInDec = parseInt(int, fromBase).toString()
        if (intInDec === '0' && str[0] === '-') {
            intInDec = '-' + intInDec
        }
        let floatInDec = 0
        if (float) {
            for (let i = 0; i < float.length; i++) {
                const letter = float[i];
                const digit = isNumber(letter) ? +letter : fromCode(letter);
                floatInDec += digit * (1 / (Math.pow(fromBase, i + 1)))
                floatInDec = +(floatInDec.toFixed(i + 1));
            }
            floatInDec = '.' + floatInDec.toString().split('.')[1]
        }

        return float ? intInDec + floatInDec : intInDec
    }

    function fromDec(numberInDec, toBase) {
        if (toBase === 10) {
            return numberInDec.toString()
        }

        const [int, float] = numberInDec.toString().split(".")
        let convertedInt = Number(int).toString(toBase)
        if (convertedInt === '0' && numberInDec[0] === '-') {
            convertedInt = '-' + convertedInt
        }
        let convertedFloat = '';
        if (float) {
            let remainder = +`0.${float}`;
            let i = 0;
            while (i < 100) {
                const frac = 1 / Math.pow(toBase, i + 1);
                if (frac <= remainder) {
                    convertedFloat += Math.floor(remainder / frac);
                    remainder -= remainder - (remainder % frac)
                } else {
                    convertedFloat += '0'
                }
                if (remainder === 0) {
                    break;
                }
                i++
            }
        }


        return float ? convertedInt + '.' + convertedFloat : convertedInt;
    }

    if (typeof str == 'number') {
        throw Error("number must be string")
    }

    function isPower(x, y) {
        while (x % y === 0) x = Math.floor(x / y);
        return x === 1
    }

    let result = ''
    if (isPower(fromBase, toBase)) {
        const decode = str => {
            for (let i = 0; i < str.length; i++) {
                const letter = str[i]
                const digit = isNumber(letter) ? +letter : fromCode(letter)
                result += Math.floor(digit / toBase)
                result += digit % toBase
            }
        }
        const [int, float] = str.split('.')
        decode(int)
        if (float) {
            result += '.'
            decode(float)
        }
    } else {
        const numberInDec = toDec(str, fromBase);
        result = fromDec(numberInDec, toBase)
    }

    let resultStr = ''
    for (let i = 0; i < result.length; i++) {
        const letter = result[i]
        resultStr += letter !== '.' && !isNumber(letter) ? letter.toUpperCase() : letter
    }

    return resultStr
}

function zm(str, from, to) {
    function reverseString(str) {
        let s = "";
        let i = str.length;
        while (i > 0) {
            s += str.substring(i - 1, i);
            i--;
        }
        return s;
    }

    const negate = digit => {
        if (digit === '0') {
            return '1'
        }
        if (digit === '1') {
            return '0'
        }

        return digit
    }

    const systems = ['zm', 'zu1', 'zu2']

    if (!systems.includes(from) || !systems.includes(to)) {
        throw Error('Zły system')
    }

    function toZm(str, from) {


        function fromZu1(str) {
            let result = str[0]

            for (let i = 1; i < str.length; i++) {
                const digit = str[i];
                result += negate(digit);
            }

            return result
        }

        if (from === 'zm') {
            return str
        }

        if (str[0] === '0') {
            return str
        }

        if (from === 'zu1') {
            return fromZu1(str);
        }

        if (from === 'zu2') {
            if (str === '10') {
                throw Error('Invalid zu2: 10')
            }
            let result = '';
            let firstOne = false
            for (let i = 0; i < str.length - 1; i++) {
                const letter = reverseString(str)[i]
                result += firstOne ? negate(letter) : letter
                if (letter === '1') {
                    firstOne = true
                }
            }

            return str[0] + reverseString(result);
        }
    }

    function fromZm(str, to) {
        function toZu1() {
            let result = str[0]
            for (let i = 1; i < str.length; i++) {
                const letter = str[i]
                result += negate(letter)
            }

            return result
        }

        if (to === 'zm') {
            return zm
        }

        if (str[0] === '0') {
            return zm
        }

        if (to === 'zu1') {
            return toZu1()
        }

        if (to === 'zu2') {
            const zu1 = toZu1()
            let result = ''
            let done = false
            for (let i = 0; i < str.length - 1; i++) {
                const letter = reverseString(zu1)[i]
                if (done || letter === '.') {
                    result += letter
                    continue
                }

                if (letter === '1') {
                    result += '0';
                } else {
                    result += '1'
                    done = true
                }
            }

            return str[0] + reverseString(result)
        }
    }

    const zm = toZm(str, from)

    return fromZm(zm, to)
}

function add(num1, num2, system = 'zm') {
    if (typeof num1 === 'number' || typeof num2 === 'number') {
        throw Error('nums must be strings')
    }

    const systems = ['zm', 'zu1', 'zu2']
    if (!systems.includes(system)) {
        throw Error('zły system')
    }

    if (num1.split('.')[0].length < 2 || num2.split('.')[0].length < 2) {
        throw Error('brak bitu znaku');
    }

    num1 = zm(num1, system, 'zm')
    num2 = zm(num2, system, 'zm')

    const decode = num => +(num[0] === '0' ? convert(num.substring(1), 2, 10) : -convert(num.substring(1), 2, 10));
    num1 = decode(num1)
    num2 = decode(num2)


    return zm(toZm(convert((num1 + num2).toString(), 10, 2)), 'zm', system);
}

function toZm(num, bits) {
    let result
    if (num.startsWith('-')) {
        result = '1' + num.substring(1);
    } else {
        result = '0' + num;
    }

    if (bits) {
        while (result.length - 1 < bits) {
            result = result[0] + '0' + result.substring(1)
        }
    }

    return result
}

function fromZm(num) {
    let result
    if (num.startsWith('1')) {
        result = '-' + num.substring(1);
    } else {
        result = num.substring(1);
    }

    let result2 = ''
    let firstOne = false
    for (let i = 0; i < result.length; i++) {
        const letter = result[i]
        if (letter === '0' && !firstOne) {
            continue
        }
        if (letter === '1' || letter === '.') {
            firstOne = true
        }
        result2 += letter;
    }

    if (result2.split('.')[0].length === 0) {
        result2 = '0' + result2
    }

    return result2.length === 0 ? '0' : result2;
}

const oneB = convert('1.25', 10, 2)
const oneZm = toZm(oneB)
const oneZu1 = zm(oneZm, 'zm', 'zu1')

const twoB = convert('-0.5', 10, 2)
const twoZm = toZm(twoB)
const twoZu1 = zm(twoZm, 'zm', 'zu1')

const resultZu1 = add(oneZu1, twoZu1, 'zu1')
const resultZm = zm(resultZu1, 'zu1', 'zm')
const resultB = fromZm(resultZm)
const resultDec = convert(resultB, 2, 10)
console.log(resultDec);
