var React = require('react-native');
var {
  Text,
  View,
  ScrollView,
  StyleSheet,
  Modal,
  TouchableHighlight
} = React;
var store = require('react-native-simple-store');
var Subscribable = require('Subscribable');
var moment = require('moment');
var RNCalendarReminders = require('react-native-calendar-reminders');

var Button = require('./components/button');
var HabitForm = require('./components/habit-form');
var LinkCount = require('./components/link-count');
var IOSDate = require('./components/datepicker-ios');

module.exports = React.createClass({
  mixins: [Subscribable.Mixin],

  componentWillMount: function() {
    this.addListenerOn(this.props.events, 'date-picked', (date) => {
      var habits = this.state.habits;
      var momentDate = moment(date);

      habits[this.state.habitReminderIdx].reminder = momentDate.format('hh:mm');

      this.setState({habits: habits}, () => {
        store.save('habits', this.state.habits);
        this.props.events.emit('new-habit', this.state.habits);
      });

      // Set the habit from the Date Picker.
      RNCalendarReminders.authorizeEventStore((error, auth) => {
        console.log('authorizing EventStore...');
      });

      var habit = this.state.habits[this.state.habits.length - 1];

      // Search for the Reminder.
      RNCalendarReminders.fetchAllReminders(reminders => {
        // Find the Reminder ID.
        var reminderId;
        for (var i = 0; i < reminders.length; i++) {
          if (reminders[i].title == habit.name) {
            reminderId = reminders[i].id;
            break;
          }
        }

        // Update the Reminder, or create a new one.
        if (reminderId !== undefined) {
          RNCalendarReminders.saveReminder(habit.name, {
            id: reminders[i].id,
            location: '',
            notes: 'Reminder from The Hoick Habit App for Habit: ' + habit.name,
            startDate: date,
            alarms: [{
              date: -1 // or absolute date
            }],
            recurrence: 'daily'
          });
        } else {
          RNCalendarReminders.saveReminder(habit.name, {
            location: '',
            notes: 'Reminder from The Hoick Habit App for Habit: ' + habit.name,
            startDate: date,
            alarms: [{
              date: -1 // or absolute date
            }],
            recurrence: 'daily'
          });
        }
      });
    });
  },

  componentDidMount: function() {
    this.addListenerOn(this.props.events, 'new-habit', (habits) => {
      this.setState({habits: habits})
    });
  },

  getInitialState: function() {
    return {
      habits: this.props.habits,
      modalVisible: false,
      habitReminderIdx: null,
    }
  },

  goBack: function() {
    this.props.navigator.pop();
  },

  editHabit: function() {
    this.props.events.emit('edit-habit');
  },

  deleteHabit: function(habitIdx) {
    var habits = this.state.habits;
    habits.splice(habitIdx, 1);

    // Save the new Habits.
    this.setState({habits: habits, dataSource: this.state.dataSource.cloneWithRows(habits)}, () => {
      this.props.events.emit('new-habit', this.state.habits);
      store.save('habits', this.state.habits);
    })
  },

  restartHabit: function(habitIdx) {
    var habits = this.state.habits;
    habits[habitIdx].days = [];

    this.setState({habits: habits}, () => {
      this.props.events.emit('chain-restarted', {habits: habits, habitIdx: habitIdx});
      store.save('habits', this.state.habits);
    });
  },

  habitSelected: function(habitIdx) {
    var habits = this.state.habits;
    var habit = habits.splice(habitIdx, 1);
    habits.push(habit[0])
    this.setState({habits: habits, habit: habits[habits.length -1]}, () => {
      this.props.events.emit('new-habit', this.state.habits);
      store.save('habits', this.state.habits);
      this.props.navigator.pop();
    })
  },

  openModal: function(habitIdx) {
    this.setState({modalVisible: true, habitReminderIdx: habitIdx})
  },

  closeModal: function(visible) {
    this.setState({modalVisible: visible});
  },

  removeReminder: function(visible) {
    var habits = this.state.habits;
    habits[this.state.habitReminderIdx].reminder = null;

    this.setState({habits: habits, modalVisible: visible}, () => {
      store.save('habits', this.state.habits);
      this.props.events.emit('new-habit', this.state.habits);
    });

    // Remove the Reminder from iOS.
    RNCalendarReminders.fetchAllReminders(reminders => {
      for (var i = 0; i < reminders.length; i++) {
        if (reminders[i].title == this.state.habits[this.state.habitReminderIdx].name) {
          RNCalendarReminders.removeReminder(reminders[i].id);
        }
      }
    });
  },

  habitComponents: function() {
    var habits = this.state.habits.map((habit, index) => {
      return (
        <View style={styles.habits} key={index}>
          <View style={styles.habitInfo}>
            <TouchableHighlight style={styles.habitButton} onPress={() => this.habitSelected(index)}>
              <Text style={styles.habitText}>{habit.name ? habit.name : ''}</Text>
            </TouchableHighlight>
            <LinkCount habit={habit} linkCountStyle={styles.linkCountText} events={this.props.events}/>
            <Text style={styles.linkCountText}>Reminder: {habit.reminder ? habit.reminder : 'No Reminder'}</Text>
          </View>

          <View style={styles.habitButtons}>
            <Button text={'Set Reminder'} onPress={() => this.openModal(index)} textType={styles.restartText} buttonType={styles.restartButton} />
            <Button text={'Restart Chain'} onPress={() => this.restartHabit(index)} textType={styles.restartText} buttonType={styles.restartButton} />
            <Button text={'Delete'} onPress={() => this.deleteHabit(index)} textType={styles.deleteText} buttonType={styles.deleteButton} />
          </View>
        </View>
      )
    });
    return habits;
  },

  iosDatePicker: function() {
    return (
      <IOSDate events={this.props.events} />
    )
  },

  render: function() {
    return (
      <View style={styles.container}>
        <Button text={'Back'} onPress={this.goBack} textType={styles.navText} buttonType={styles.navButton} />

        <View style={styles.wrapper}>
          <Button text={'Add Habit'} onPress={this.editHabit} textType={styles.navText} buttonType={styles.navButton} />
          <HabitForm habits={this.state.habits} events={this.props.events}/>

          <Text style={styles.heading}>Habits</Text>

          <View style={styles.hr}></View>

          <ScrollView style={[styles.mainScroll]} automaticallyAdjustContentInsets={true} scrollEventThrottle={200} showsVerticalScrollIndicator={false}>
            {this.habitComponents()}
          </ScrollView>
        </View>
        <Modal
          animated={true}
          transparent={false}
          visible={this.state.modalVisible}>
          <View style={styles.modal}>
            <View style={[styles.innerContainer]}>
              {React.Platform.OS == 'ios' ? <IOSDate events={this.props.events} /> : <View/>}
              <Button text={'Set Time'} onPress={this.closeModal.bind(this, false)} textType={styles.restartText} buttonType={styles.restartButton} />
              <Button text={'Remove Reminder'} onPress={this.removeReminder.bind(this, false)} textType={styles.deleteText} buttonType={styles.deleteButton} />
            </View>
          </View>
        </Modal>
      </View>
    )
  }
})

var styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 15,
    backgroundColor: '#045491',
  },

  wrapper: {
    marginTop: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  navText: {
    textAlign: 'center',
    color: '#DFD9B9',
    fontSize: 18
  },

  navButton: {
    borderColor: '#DFD9B9',
    borderRadius: 0,
    alignSelf: 'flex-start'
  },

  heading: {
    color: '#DFD9B9',
    fontSize: 30
  },

  hr: {
    flex: 1,
    width: 300,
    marginTop: 10,
    marginBottom: 10,
    padding: 1,
    backgroundColor: '#DFD9B9'
  },

  habits: {
    paddingTop: 10,
    paddingBottom: 10,
    flex: 2,
    borderColor: '#DFD9B9',
    borderWidth: 1,
    width: 300,
    flexDirection: 'row',
  },

  habitInfo: {
    alignSelf: 'flex-start'
  },

  habitText: {
    color: '#DFD9B9',
    fontSize: 20,
    borderColor: '#DFD9B9',
    paddingLeft: 10,
    width: 120
  },

  linkCountText: {
    color: '#DFD9B9',
    fontSize: 12,
    paddingLeft: 10
  },

  row: {
    flexDirection: 'row',
  },

  habitButtons: {
    marginLeft: 45
  },

  deleteButton: {
    borderColor: '#CE4B41',
    marginTop: 3,
  },

  deleteText: {
    color: '#CE4B41',
    fontSize: 12
  },

  restartText: {
    textAlign: 'center',
    color: '#DFD9B9',
    fontSize: 12,
  },

  restartButton: {
    borderColor: '#DFD9B9',
    borderRadius: 0,
    marginRight: 1,
    marginTop: 3,
    marginBottom: 3
  },

  modal: {
    paddingTop: 25,
    backgroundColor: '#045491',
  },
})
