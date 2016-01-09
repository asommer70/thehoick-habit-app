var React = require('react-native');
var {
  View,
  Text,
  StyleSheet,
  TextInput,
  AsyncStorage,
  TouchableWithoutFeedback,
  Image,
  ScrollView,
  TouchableHighlight
} = React;
var store = require('react-native-simple-store');
var Share = require('react-native-share');
var moment = require('moment');

var Button = require('./components/button');

// var today = moment();
// var today = moment().add(1, 'days');
// var today = moment().add(2, 'days');
// var today = moment().add(7, 'days');
//var today = moment().add(8, 'days');
// var today = moment().add(9, 'days');
// var today = moment().add(10, 'days');
// var today = moment().add(11, 'days');
// var today = moment().add(29, 'days');
var today = moment().add(30, 'days');

//var dayKey = today.format('MMDDYYYY');
var dayKey = today.unix();
var day;


module.exports = React.createClass({
  componentDidMount() {
    // Get the habits from AsyncStorage and set the current habit to the last one.
    store.get('habits').then((data) => {
      var habit;
      var checked;

      console.log('componentDidMount data:', data);

      if (data === null || data === undefined || data.length == 0) {
        data = [];
        habit = {name: '', days: []};
        store.save('habits', []);
      } else {
        habit = data[data.length - 1];
        checked = this.checked(habit);

        // Needs reversing... I think cause of the way it gets saved to storage.
        //habit.days.reverse();
        //habit.days.sort(function(a, b) { return b.created_at - a.created_at });
      }

      if (this.isMounted()) {
        this.setState({habit: habit, habits: data, editHabit: false, text: habit.name, checked: checked}, function() {
          console.log('this.state.habits:', this.state.habits);
          console.log('days:', this.state.habit.days);

          //store.save('testHabits', this.state.habits);
        });
      }
    });
  },

  getInitialState: function() {
    return {
      habits: [],
      habit: {name: '', days: []},
      text: '',
      checked: false,
      editHabit: true,
    }
  },

  saveHabit: function() {
    // Check this.state.habits for a habit.name matching this.state.text.
    var habitIdx = this.state.habits.findIndex( (habit, index, habits) => {
      if (habit.name == this.state.text) {
        return true;
      }
    });

    if (habitIdx !== -1) {
      // Move old habit to last (current Habit).
      var habits = this.state.habits;
      var storedHabit = habits.splice(habitIdx, 1);
      habits.push(storedHabit[0]);

      var checked = this.checked(storedHabit[0]);

      this.setState({habits: habits, habit: storedHabit[0], editHabit: false, checked: checked}, function() {
        store.save('habits', this.state.habits);
      });
    } else {
      // Create new Habit.
      var habit = {name: this.state.text, days: []};
      var habits = this.state.habits;
      habits.push(habit);

      this.setState({habits: habits, habit: habit, editHabit: false, checked: false }, function() {
        store.save('habits', this.state.habits);
      })
    }
  },

  editHabit: function() {
    this.setState({editHabit: true})
  },

  restartHabit: function() {
    var habit = this.state.habits.pop();
    habit.days = [];

    var habits = this.state.habits
    habits.push(habit);

    this.setState({habits: habits, habit: habit, editHabit: false, checked: false});
    store.save('habits', this.state.habits);
  },

  cancelHabitEdit: function() {
    this.setState({editHabit: false});
  },

  addDay: function() {
    if (this.state.habit) {
      // Find out if there is an entry in days for today.
      day = this.state.habit.days.findIndex(function(day, index, days) {
        if (day.dayId == dayKey) {
          return true;
        }
      });

      console.log('addDay day:', day);

      // If no entry create one.
      if (day === -1) {
        // Create a new day.
        var newDay = {dayId: dayKey, created_at: today.unix(), habit: this.state.habit.name, checked: true};
        // Get the Habit
        var habit = this.state.habits.pop();
        if (habit) {
          //
          // Maybe extract this figure out the missing days code into it's own function...
          //
          // Find the number of days between today and the last day recorded.
          var lastDay = habit.days[habit.days.length - 1];

          if (lastDay !== undefined) {
            console.log('lastDay:', lastDay);
            var momentLastDay = moment.unix(lastDay.created_at);
            console.log('momentLastDay:', momentLastDay);
            console.log('momentLastDay.format:', momentLastDay.format('MMDDYYYY'));
            var diffOfDays = today.diff(momentLastDay, 'days');
            console.log('diffOfDays:', diffOfDays);

            if (diffOfDays > 1) {
              // Do diffOfDays - 1 to exclude the lastDay entry from being added inside the loop.
              for (var i = diffOfDays - 1; i > 0; i--) {
                var momentBetweenDay = today.subtract(i, 'days');

                var betweenDay = {dayId: momentBetweenDay.unix(), created_at: momentBetweenDay.unix(), habit: this.state.habit.name, checked: false }
                habit.days.push(betweenDay);
              }
            }
          }

          habit.days.push(newDay);

          // Update this.state.habits with the new Habit.
          var habits = this.state.habits;
          habits.push(habit);

          console.log('habits:', habits);

          // Update state.
          this.setState({habits: habits, habit: habit, checked: true});

          // Store the new habits.
          store.save('habits', this.state.habits);
        } else {
          this.setState({editHabit: true});
        }
      }
    } else {
      this.setState({editHabit: true});
    }
  },

  onShare: function() {
    Share.open({
      share_text: 'Habit Progress',
      share_URL: 'For my ' + this.state.habit.name + ' habit I have done ' + this.state.habit.days.length + ' days in a row.  Yay for progress! #thehoickhabitapp',
      title: 'For my ' + this.state.habit.name + ' habit I have done ' + this.state.habit.days.length + ' days in a row.  Yay for progress! #thehoickhabitapp',
    },function(e) {
      console.log(e);
    });
  },

  checked: function(habit) {
    day = habit.days.findIndex(function(day, index, days) {
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

  setTestEnv: function() {
    console.log('Setting test environment...');
    store.get('testHabits').then((data) => {
      console.log('testHabits data:', data);
      this.setState({habits: data, habit: data[data.length - 1]}, function() {
        console.log('setTestEnv this.state.habits:', this.state.habits);
        store.save('habits', this.state.habits);
      });
    })
  },

  render: function() {
    var input, save;

    if (this.state.editHabit !== true) {
      label = <View></View>;
      input = <View></View>;
      save = <View></View>;
      cancel = <View></View>;
      restart = <View></View>;
    } else {
      label = <Text style={styles.label}>Enter Habit</Text>;
      input = <TextInput style={styles.input} onChangeText={(text) => this.setState({text: text})} value={this.state.text} />;
      save =  <Button text={'Save'} onPress={this.saveHabit} textType={styles.saveText} buttonType={styles.saveButton} />;
      cancel =  <Button text={'Cancel'} onPress={this.cancelHabitEdit} />;
      restart = <Button text={'Restart Chain'} onPress={this.restartHabit} textType={styles.restartText} buttonType={styles.restartButton} />;
    }

    var chains;
    var habitDays = this.state.habit.days;
    //habitDays.reverse();
    console.log('habitDays:', habitDays);

    var chainIcons = habitDays.map(function(day, index) {
      var icon;
      if (index % 30 == 0 && index !=0) {
        icon = require('./img/chain-icon-green.png');
      } else {
        icon = require('./img/chain-icon.png');
      }

      if (day.checked == false) {
        icon = require('./img/broken-chain-left-icon.png');
      }

      return <Image key={day.dayId} style={styles.icon}
              source={icon} />;
    });

    if (this.state.habit.name != '') {
      chains =  <View style={styles.chains}>
                  {chainIcons}
                </View>
    } else {
      chains = <View></View>;
    }

    //chainIcons.reverse();

    var checkedDays;
    var checks;
    if (this.state.habit.days.length > 0) {
      //checks = this.state.habit.days.filter(function(day) {  return day.checked });
      //checkedDays = checks.length;

      // Need an array of checked days starting with today going back to the first unchecked day.
      checks = [];
      for (var i = habitDays.length - 1; i > 0; i--) {
        if (habitDays[i].checked) {
          checks.push(habitDays[i]);
        } else {
          break;
        }
      }
      checkedDays = checks.length;
    } else {
      checkdDays = '0';
      checks = [];
    }

    return (
      <View style={styles.container}>
      <ScrollView style={[styles.mainScroll]} automaticallyAdjustContentInsets={true} scrollEventThrottle={200} showsVerticalScrollIndicator={false}>
        <View style={styles.wrapper}>
          <View style={styles.shadow}>
            <TouchableWithoutFeedback onLongPress={this.editHabit} onPress={this.addDay}>
              <View style={[styles.habit, this.state.checked && styles.checked]}>
                <Text style={styles.habitText}>{this.state.habit.name != '' ? this.state.habit.name : 'No habit configured...'}</Text>
              </View>
            </TouchableWithoutFeedback>
          </View>

          <View style={styles.formElement}>
            {label}
            {input}
            <View style={styles.editButtons}>
              {save}
              {cancel}
            </View>
            {restart}
          </View>

          <Text style={styles.days}>
            {checkedDays} link{checks.length == 1 ? '' : 's'} in the chain.
          </Text>
        </View>

        <ScrollView style={[styles.scroll]} automaticallyAdjustContentInsets={true} scrollEventThrottle={200}>
         {chains}
        </ScrollView>
        </ScrollView>
        <Button text={'Test Environment'} onPress={this.setTestEnv} textType={styles.shareText} buttonType={styles.shareButton} />

        <Button text={'Share'} imageSrc={require('./img/share-icon.png')} onPress={this.onShare} textType={styles.shareText} buttonType={styles.shareButton} />
      </View>
    )
  },
});

var styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#045491',
  },

  wrapper: {
    marginTop: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

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

  input: {
    padding: 4,
    height: 40,
    borderWidth: 1,
    borderColor: '#424242',
    borderRadius: 3,
    margin: 5,
    width: 200,
    alignSelf: 'center',
  },

  formElement: {
    backgroundColor: '#eeeeee',
    margin: 5,
  },

  label: {
    alignSelf: 'center',
    justifyContent: 'center',
    fontSize: 18,
    marginTop: 10,
  },

  days: {
    padding: 10,
    color: '#DFD9B9',
    fontSize: 16
  },

  icon: {
    padding: 0,
  },

  mainScroll: {
    height: 500
  },

  scroll: {
    height: 600,
  },

  chains: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 5,
    overflow: 'visible',
    borderColor: '#DFD9B9',
    borderWidth: 1
  },

  restartButton: {
    borderColor: '#CE4B41',
  },

  restartText: {
    color: '#CE4B41',
  },

  saveButton: {
    borderColor: '#4D9E7E',
  },

  saveText: {
    color: '#4D9E7E',
  },

  editButtons: {
    flexDirection: 'row',
    flex: 2,
    alignSelf: 'center',
    justifyContent: 'center',
  },

  share: {
    marginBottom: 15,
    marginTop: 15,
    paddingTop: 5,
    borderColor: '#DFD9B9',
    borderWidth: 1,
    width: 45,
    alignSelf: 'center',
    justifyContent: 'center',
  },

  shareButton: {
    borderColor: '#DFD9B9',
    borderRadius: 0
  },

  shareText: {
    textAlign: 'center',
    color: '#DFD9B9',
    paddingTop: 2
  },
});
