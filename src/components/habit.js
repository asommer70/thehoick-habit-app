var React = require('react-native');
var {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
} = React;
var store = require('react-native-simple-store');
var Subscribable = require('Subscribable');
var moment = require('moment');

var today = moment();
// var today = moment().add(1, 'days');
// var today = moment().add(7, 'days');
// var today = moment().add(8, 'days');
var dayKey = today.format('MMDDYYYY');

module.exports = React.createClass({
  mixins: [Subscribable.Mixin],

  componentWillMount: function() {
    this.addListenerOn(this.props.events, 'new-habit', (habits) => {
      var habit = habits[habits.length - 1];
      var checked = this.checked(habit);

      this.setState({habits: habits, habit: habit, checked: checked})
    });

    this.addListenerOn(this.props.events, 'chain-restarted', () => {
      this.setState({checked: false});
    });
  },

  getInitialState: function() {
    return {
      checked: false,
      habit: {name: '', days: []},
      habits: [],
    }
  },

  componentDidMount: function() {
    // Get the habits from AsyncStorage and set the current habit to the last one.
    store.get('habits').then((data) => {
      var habit;
      var checked;

      habit = data[data.length - 1];
      checked = this.checked(habit);

      if (this.isMounted()) {
        this.setState({habit: habit, habits: data, checked: checked}, function() {
          this.props.events.emit('got-habits', this.state.habits);
        });
      }
    });
  },

  editHabit: function() {
    this.props.events.emit('edit-habit');
  },

  checked: function(habit) {
    var day = habit.days.findIndex(function(day, index, days) {
      if (day.dayId == dayKey) {
        return true;
      }
    });

    if (day !== -1) {
      return true;
    }  else {
      return false;
    }
  },

  addDay: function() {
    if (this.state.habit.name != '') {
      // Find out if there is an entry in days for today.
      var day = this.state.habit.days.findIndex(function(day, index, days) {
        if (day.dayId == dayKey) {
          return true;
        }
      });

      // If no entry create one.
      if (day === -1) {
        var newDay = {dayId: dayKey, created_at: today.unix(), habit: this.state.habit.name, checked: true};
        var habit = this.state.habits.pop();

        if (habit) {
          // Find the number of days between today and the last day recorded.
          var lastDay = habit.days[habit.days.length - 1];

          if (lastDay !== undefined) {
            var momentLastDay = moment.unix(lastDay.created_at);
            var diffOfDays = today.diff(momentLastDay, 'days');

            if (diffOfDays > 1) {
              // Do diffOfDays - 1 to exclude the lastDay entry from being added inside the loop.
              for (var i = diffOfDays - 1; i > 0; i--) {
                var momentBetweenDay = today.subtract(i, 'days');

                var betweenDay = {dayId: momentBetweenDay.format('MMDDYYYY'), created_at: momentBetweenDay.unix(), habit: this.state.habit.name, checked: false }
                habit.days.push(betweenDay);
              }
            }
          }

          habit.days.push(newDay);

          // Update this.state.habits with the new Habit.
          var habits = this.state.habits;
          habits.push(habit);

          // Update state.
          this.setState({habits: habits, habit: habit, checked: true});

          // Store the new habits.
          store.save('habits', this.state.habits);

          this.props.events.emit('day-added', this.state.habits);
        } else {
          this.setState({editHabit: true});
        }
      }
    } else {
      this.setState({editHabit: true});
    }
  },

  render: function() {
    return (
      <View style={styles.shadow}>
        <TouchableWithoutFeedback onLongPress={this.editHabit} onPress={this.addDay}>
          <View style={[styles.habit, this.state.checked && styles.checked]}>
            <Text style={styles.habitText}>{this.state.habit.name != '' ? this.state.habit.name : 'No habit configured...'}</Text>
          </View>
        </TouchableWithoutFeedback>
      </View>
    )
  }
})

var styles = StyleSheet.create({
  habit: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    borderWidth: 2,
    borderColor: '#DFD9B9',
  },

  shadow: {
    shadowColor: '#424242',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.7,
    shadowRadius: 3,
    elevation: 3
  },

  habitText: {
    fontSize: 35,
    color: '#DFD9B9'
  },

  checked: {
    backgroundColor: '#4D9E7E',
  },

});
