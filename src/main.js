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

var Button = require('./components/button');

var today = new Date();
var dayKey = today.getMonth().toString() + today.getDate().toString() + today.getFullYear().toString();
var yesterdayKey = today.getMonth().toString() + (today.getDate() - 1).toString() + today.getFullYear().toString();
var day;


module.exports = React.createClass({
  componentDidMount() {
    // Get the habits from AsyncStorage and set the current habit to the last one.
    store.get('habits').then((data) => {
      console.log('habits data:', data);

      var habit;
      var checked = false;

      if (data === null || data === undefined || data.length == 0) {
        data = [];
        habit = {name: '', days: []};
        store.save('habits', []);
      } else {
        habit = data[data.length - 1];

        day = habit.days.findIndex(function(day, index, days) {
          if (day.dayId == dayKey) {
            return true;
          }
        });

        if (day !== -1) {
          checked = true;
        }
      }

      if (this.isMounted()) {
        this.setState({habit: habit, habits: data, editHabit: false, text: habit.name, checked: checked});
      }
    });

    // Get the days array from AsyncStorage, and check if today has been checked.
    // store.get('days').then((data) => {
    //   if (data === null || data === undefined) {
    //     data = [];
    //     store.save('days', data);
    //   }
    //
    //   if (this.isMounted()) {
    //     this.setState({days: data});
    //
    //     //
    //     // Populate the days with test data.
    //     //
    //     // var thirty = [];
    //     // for (var i = 0; i < 365; i++) {
    //     //   var newDay = {dayId: '0' + i, created_at: Date.now(), habit: this.state.habit};
    //     //   thirty.push(newDay);
    //     // }
    //     // this.setState({days: thirty});
    //   }
    //
    //   day = data.findIndex(function(day, index, days) {
    //     if (day.dayId == dayKey) {
    //       return true;
    //     }
    //   });
    //
    //   if (day !== -1) {
    //     this.setState({checked: true});
    //   }
    // })
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

      // Determine if the habit has been checked.
      var day = storedHabit.days.findIndex(function(day, index, days) {
        if (day.dayId == dayKey) {
          return true;
        }
      });

      var checked;
      if (day !== -1) {
        checked = true;
      } else {
        checked = false;
      }
      this.setState({habits: habits, habit: storedHabit[0], editHabit: false, checked: checked}, function() {
        console.log('habits:', this.state.habits);
        store.save('habits', this.state.habits);
      });
    } else {
      // Create new Habit.
      var habit = {name: this.state.text, days: []};
      var habits = this.state.habits;
      habits.push(habit);

      this.setState({
        habits: habits,
        habit: habit,
        editHabit: false,
        checked: false
      }, function() {
        console.log('this.state.habits:', this.state.habits);
        store.save('habits', this.state.habits);
      })
    }
  },

  editHabit: function() {
    this.setState({editHabit: true})
  },

  addDay: function() {
    if (this.state.habit) {
      day = this.state.habit.days.findIndex(function(day, index, days) {
        if (day.dayId == dayKey) {
          return true;
        }
      });

      if (day === -1) {
        // Create a new day.
        var newDay = {dayId: dayKey, created_at: Date.now(), habit: this.state.habit.name};

        // Update the Habit
        var habit = this.state.habits.pop();
        habit.days.push(newDay);

        // Update this.state.habits with the new Habit.
        var habits = this.state.habits;
        habits.push(habit);

        // Update state.
        this.setState({habits: habits, habit: habit, checked: true});

        // Store the new habits.
        store.save('habits', this.state.habits);
      }
    } else {
      this.setState({editHabit: true});
    }
  },

  restartHabit: function() {
    var habit = this.state.habits.pop();
    habit.days = [];

    var habits = this.state.habits
    haibts.push(habit);

    this.setState({habits: habits, habit: habit, editHabit: false, checked: false});
    store.save('habits', this.state.habits);
  },

  cancelHabitEdit: function() {
    this.setState({editHabit: false});
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
    if (this.state.habit.name != '') {
      chains =  <View style={styles.chains}>
                  {this.state.habit.days.map(function(day, index) {
                    return <Image key={day.dayId} style={styles.icon}
                            source={index % 30 == 0 && index != 0 ? require('./img/chain-icon-green.png') : require('./img/chain-icon.png')} />;
                  })}
                </View>
    } else {
      chains = <View></View>;
    }

    return (
      <View style={styles.container}>
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

          <Text style={styles.days}>{this.state.habit.days ? this.state.habit.days.length : '0'} link{this.state.habit.days.length == 1 ? '' : 's'} in the chain.</Text>
        </View>

        <ScrollView style={[styles.scroll]} automaticallyAdjustContentInsets={true} scrollEventThrottle={200}>
         {chains}
        </ScrollView>

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
