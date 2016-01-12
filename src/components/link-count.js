var React = require('react-native');
var {
  View,
  Text,
  StyleSheet,
} = React;
var Subscribable = require('Subscribable');

module.exports = React.createClass({
  mixins: [Subscribable.Mixin],

  componentDidMount: function() {
    this.addListenerOn(this.props.events, 'got-habits', (habits) => {
      console.log('link-count got-habits event...');

      this.setState({days: habits[habits.length - 1].days});
    });

    this.addListenerOn(this.props.events, 'day-added', (habits) => {
      console.log('link-count day-added event...');
      this.setState({days: habits[habits.length - 1].days});
    });

    this.addListenerOn(this.props.events, 'chain-restarted', () => {
      console.log('link-count chain-restarted event...');
      this.setState({days: []});
    });
  },

  getInitialState: function() {
    return {
      days: []
    }
  },

  render: function() {
    var checkedDays;
    var checks;
    if (this.state.days.length >= 1) {

      // Need an array of checked days starting with today going back to the first unchecked day.
      checks = [];
      for (var i = this.state.days.length; i > 0; i--) {
        if (this.state.days[i - 1].checked) {
          checks.push(this.state.days[i]);
        } else {
          break;
        }
      }
      checkedDays = checks.length;
    } else {
      checkedDays = '0';
      checks = [];
    }

    return (
      <Text style={styles.days}>
        {checkedDays} link{checks.length == 1 ? '' : 's'} in the chain.
      </Text>
    )
  }
})

var styles = StyleSheet.create({
  days: {
    padding: 10,
    color: '#DFD9B9',
    fontSize: 16
  },
})
