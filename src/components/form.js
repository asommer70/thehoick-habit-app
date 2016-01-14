var React = require('react-native');
var {
  View,
  Text,
  StyleSheet,
  TextInput
} = React;
var store = require('react-native-simple-store');

var Button = require('./button');
var Subscribable = require('Subscribable');

module.exports = React.createClass({
  mixins: [Subscribable.Mixin],

  getInitialState: function() {
    return {
      text: '',
      editHabit: false,
      habits: this.props.habits
    }
  },

  componentWillMount: function() {
    this.addListenerOn(this.props.events, 'edit-habit', () => {
      this.setState({editHabit: true})
    });

    // this.addListenerOn(this.props.events, 'got-habits', (habits) => {
    //   this.setState({habits: habits});
    // });
  },

  saveHabit: function() {
    // Check this.state.habits for a habit.name matching this.state.text.
    console.log('form this.state.habits:', this.state.habits);
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

      this.setState({habits: habits, habit: storedHabit[0], editHabit: false}, function() {
        this.props.events.emit('new-habit', this.state.habits);
        store.save('habits', this.state.habits);
      });
    } else {
      // Create new Habit.
      var habit = {name: this.state.text, days: []};
      var habits = this.state.habits;
      habits.push(habit);

      this.setState({habits: habits, habit: habit, editHabit: false}, () => {
        this.props.events.emit('new-habit', this.state.habits);
        store.save('habits', this.state.habits);
      })
    }
  },

  cancelHabitEdit: function() {
    this.setState({editHabit: false});
    this.props.events.emit('cancel-habit');
  },

  // restartHabit: function() {
  //   var habit = this.state.habits.pop();
  //   habit.days = [];
  //
  //   var habits = this.state.habits
  //   habits.push(habit);
  //
  //   this.setState({habits: habits, habit: habit, editHabit: false, checked: false}, () => {
  //     store.save('habits', this.state.habits);
  //     this.props.events.emit('got-habits', this.state.habits);
  //     this.props.events.emit('chain-restarted');
  //   });
  // },

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

    return (
      <View style={styles.formElement}>
        {label}
        {input}
        <View style={styles.editButtons}>
          {save}
          {cancel}
        </View>
        {restart}
      </View>
    )
  }
});

var styles = StyleSheet.create({
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
})
