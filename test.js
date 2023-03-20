function highestNumber(n) {
    return parseInt(String(n).split('').sort((a, b) => b - a).join(''))
}

console.log(highestNumber(21445)) //54421
console.log(highestNumber(145263)) //654321
console.log(highestNumber(1254859723)) //9875543221
