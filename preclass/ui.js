const blessed = require('blessed')
const contrib = require('blessed-contrib')
const screen = blessed.screen()

const createList = (len, val) => Array.from({
  length: len
}, _ => val)
const getEmptyCoordinates = () => ({
  x: createList(10, ' '),
  y: createList(10, 1),
})

class Ui {
  line = contrib.line({
    label: 'Response time (MS)',
    showLegend: true,
    legend: {
      width: 12
    }
  })

  getRequest = {
    ...getEmptyCoordinates(),
    title: 'GET',
    style: {
      line: 'yellow'
    }
  }
  postRequest = {
    ...getEmptyCoordinates(),
    title: 'POST',
    style: {
      line: 'green'
    }
  }
  constructor() {
    this.screen = screen
    this.screen.append(this.line)
    this.renderGraph()
  }

  renderGraph() {
    this.line.setData([
      this.getRequest,
      this.postRequest
    ])
    this.screen.render()
  }

  updateGraph(method, value) {
    const target = method === 'GET' ?
      this.getRequest :
      this.postRequest

    target.y.shift()
    target.y.push(value)

    this.renderGraph()
  }
}

module.exports = Ui