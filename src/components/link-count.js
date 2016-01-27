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
    this.addListenerOn(this.props.events, 'day-added', (habits) => {
      this.setState({habit: habits[habits.length - 1]});
    });
  },

  getInitialState: function() {
    return {
      habit: {name: '', days: []}
    }
  },

  render: function() {
    var checkedDays;
    var checks;
    if (this.props.habit && this.props.habit.days.length >= 1) {

      // Need an array of checked days starting with today going back to the first unchecked day.
      checks = [];
      for (var i = this.props.habit.days.length; i > 0; i--) {
        if (this.props.habit.days[i - 1].checked) {
          checks.push(this.props.habit.days[i]);
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
      <Text style={[styles.days, this.props.linkCountStyle]}>
        {checkedDays} link{checks.length == 1 ? '' : 's'} in the chain.
      </Text>
    )
  }
})

var styles = StyleSheet.create({
  days: {
    padding: 10,
    color: '#DFD9B9',
    fontSize: 16,
    marginTop: 7
  },
})
