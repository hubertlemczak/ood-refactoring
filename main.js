const Cinema = require('./src/cinema');

const cinema = new Cinema();
console.log(cinema.save('Screen #1', 50));
console.log(cinema.save('Screen #2', 100));

console.log(cinema.addNew('Dune', '12', '2:30'));
console.log(cinema.addNew('The Alpinist', '15', '1:15'));

console.log(cinema.add('The Alpinist', 'Screen #1', '10:00'));
console.log(cinema.add('The Alpinist', 'Screen #2', '10:00'));
console.log(cinema.add('The Alpinist', 'Screen #2', '11:30'));

console.log(cinema.add('Dune', 'Screen #1', '12:40'));
console.log(cinema.add('Dune', 'Screen #1', '19:40'));
console.log(cinema.add('Dune', 'Screen #1', '23:40'));

console.log(cinema.allShowings());
