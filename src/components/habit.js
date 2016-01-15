var React = require('react-native');
var {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  TouchableHighlight,
  ListView
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
    var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

    return {
      checked: false,
      choosing: false,
      habit: {name: '', days: []},
      habits: [],
      dataSource: ds.cloneWithRows([]),
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
        this.setState({habit: habit, habits: data, checked: checked, dataSource: this.state.dataSource.cloneWithRows(data)}, function() {
          this.props.events.emit('got-habits', this.state.habits);
        });
      }
    });
  },

  checked: function(habit) {
    if (habit === undefined) {
      return false;
    }

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
    if (this.state.choosing) {
      this.setState({choosing: false});
    }

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

  chooseHabit: function() {
    this.setState({choosing: true});
  },

  habitSelected: function(habitIdx) {
    var habits = this.state.habits;
    var habit = habits.splice(habitIdx, 1);
    habits.push(habit[0])
    this.setState({habits: habits, habit: habits[habits.length -1], dataSource: this.state.dataSource.cloneWithRows(habits), choosing: false}, () => {
      this.props.events.emit('new-habit', this.state.habits);
      store.save('habits', this.state.habits);
    })
  },

  render: function() {
    var habits;
    if (this.state.choosing) {
      habits = <View style={styles.habitsContainer}>
        <View style={styles.habitsHeader}>
          <Text style={styles.habitsHeaderText}>Choose a Habit</Text>
        </View>
        <View style={styles.habitsWrapper}>
          <ListView
              dataSource={this.state.dataSource}
              renderRow={(rowData, sectionId, rowId) =>
                <TouchableHighlight onPress={() => this.habitSelected(rowId)}>

                  <View style={styles.habits}>
                    <Text style={styles.habitsText}>{rowData.name ? rowData.name : ''}</Text>
                  </View>
                </TouchableHighlight>
              }
              renderSeparator={(sectionId, rowId, adjacentRowHighlighted) =>
                <View style={styles.separator} key={rowId} />
              }
            />
        </View>
      </View>
    } else {
      habits = <View/>
    }

    return (
      <View>
        <View style={styles.shadow}>
          <TouchableWithoutFeedback onLongPress={this.chooseHabit} onPress={this.addDay}>
            <View style={[styles.habit, this.state.checked && styles.checked]}>
              <Text style={styles.habitText}>{this.state.habit && this.state.habit.name != '' ? this.state.habit.name : 'No habit configured...'}</Text>
            </View>
          </TouchableWithoutFeedback>
        </View>
        {habits}
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

  habitsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#DFD9B9',
    borderWidth: 2,
    borderColor: '#DFD9B9',
    paddingLeft: 20,
    paddingRight: 25,
    paddingTop: 10,
    paddingBottom: 25,
    marginTop: 10
  },

  habitsHeader: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 10,
  },

  habitsHeaderText: {
    fontSize: 19,
    color: '#424242',
  },

  habitsWrapper: {
    // justifyContent: 'center',
    // alignItems: 'center',
  },

  habits: {
    marginTop: 5,
    paddingTop: 5,
    paddingBottom: 10,
    backgroundColor: '#DFD9B9',
  },

  habitsText: {
    color: '#424242',
    fontSize: 14,
  },

  separator: {
    backgroundColor: '#424242',
    width: 100,
    padding: 1
  }
});
