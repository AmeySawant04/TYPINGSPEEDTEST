const n = 10;
const arr = Array.from({ length: n }, (_, i) => i);
console.log(arr); // [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

arr.forEach(a => console.log(a))