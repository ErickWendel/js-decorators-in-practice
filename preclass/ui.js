const blessed = require('blessed')
const contrib = require('blessed-contrib')
const screen = blessed.screen()
const line = contrib.line({
  // width: 80,
  // height: 30,
  // xLabelPadding: 3,
  // xPadding: 5,
  label: 'Response time (MS)',
  showLegend: true,
  legend: {
    width: 12
  }
})
const initialData = {
  
}
const get = {
  x: Array.from({ length: 10 }, _ => ' '),
  y: Array.from({ length: 10 }, _ => 1),
  title: 'GET',
  style: {
    line: 'yellow'
  }
}
const post = {
  x: Array.from({ length: 10 }, _ => ' '),
  y: Array.from({ length: 10 }, _ => 1),
  title: 'POST',
  // x: [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
  // y: [1, 1, 1, 1, 1, 1, 1, 1],
  style: {
    line: 'green'
  }
}


function initialize() {
  screen.append(line) //must append before setting data
  line.setData([
    get,
    post
  ])
  screen.render()
}

function updateGraph(method, value) {
  if (method === 'GET') {
    get.y.shift()
    get.y.push(value)
  }

  if (method === 'POST') {
    post.y.shift()
    post.y.push(value)
  }

  line.setData([
    get,
    post
  ])
  screen.render()
}

module.exports = {
  updateGraph,
  initialize
}