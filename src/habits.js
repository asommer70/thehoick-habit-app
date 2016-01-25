var React = require('react-native');
var {
  Text,
  View,
  ScrollView,
  StyleSheet,
  Modal,
  TouchableHighlight,
  NativeModules
} = React;
var store = require('react-native-simple-store');
var Subscribable = require('Subscribable');
var moment = require('moment');
var RNCalendarReminders = require('react-native-calendar-reminders');
import Popup from 'react-native-popup';
var SendIntentAndroid = require('react-native-send-intent');

var Button = require('./components/button');
var HabitForm = require('./components/habit-form');
var LinkCount = require('./components/link-count');
var IOSDate = require('./components/datepicker-ios');
var AndroidDate = require('./components/datepicker-android');

module.exports = React.createClass({
  mixins: [Subscribable.Mixin],

  componentWillMount: function() {
    this.addListenerOn(this.props.events, 'date-changed', (date) => {
      this.setState({chosenDate: date})
    });

    this.addListenerOn(this.props.events, 'date-picked', () => {
      // var date = this.state.chosenDate;
      var habits = this.props.habits;
      var momentDate = moment(this.state.chosenDate);

      habits[this.state.habitReminderIdx].reminder = momentDate.format('hh:mm');

      this.setState({habits: habits}, () => {
        store.save('habits', this.props.habits);
        this.props.events.emit('new-habit', this.props.habits);
      });

      // Set the habit from the Date Picker.
      RNCalendarReminders.authorizeEventStore((error, auth) => {
        console.log('authorizing EventStore...');
      });

      var habit = this.props.habits[this.props.habits.length - 1];

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
            startDate: this.state.chosenDate,
            alarms: [{
              date: -1 // or absolute date
            }],
            recurrence: 'daily'
          });
        } else {
          RNCalendarReminders.saveReminder(habit.name, {
            location: '',
            notes: 'Reminder from The Hoick Habit App for Habit: ' + habit.name,
            startDate: this.state.chosenDate,
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

    console.log('habits this.props.habits:', this.props.habits);
  },

  getInitialState: function() {
    return {
      // habits: this.props.habits,
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
    var habits = this.props.habits;
    var habit = habits.splice(habitIdx, 1);

    if (React.Platform.OS == 'ios') {
      RNCalendarReminders.fetchAllReminders(reminders => {
        for (var i = 0; i < reminders.length; i++) {
          if (reminders[i].title == habit[0].name) {
            RNCalendarReminders.removeReminder(reminders[i].id);
          }
        }
      });
    }

    // Save the new Habits.
    this.setState({habits: habits}, () => {
      this.props.events.emit('new-habit', this.props.habits);
      store.save('habits', this.props.habits);
    })
  },

  restartHabit: function(habitIdx) {
    var habits = this.props.habits;
    habits[habitIdx].days = [];

    this.setState({habits: habits}, () => {
      this.props.events.emit('chain-restarted', {habits: habits, habitIdx: habitIdx});
      store.save('habits', this.props.habits);
    });
  },

  habitSelected: function(habitIdx) {
    var habits = this.props.habits;
    var habit = habits.splice(habitIdx, 1);
    habits.push(habit[0])
    this.setState({habits: habits, habit: habits[habits.length -1]}, () => {
      this.props.events.emit('new-habit', this.props.habits);
      store.save('habits', this.props.habits);
      this.props.navigator.pop();
    })
  },

  openModal: function(habitIdx) {
    console.log('habits openModal... habitIdx:', habitIdx);
    if (React.Platform.OS == 'ios') {
      this.setState({modalVisible: true, habitReminderIdx: habitIdx})
    } else {
      // this.popup.alert(1, 'beans...');
      // this.popup.tip({
      //     title: 'Choose Reminder Time',
      //     content: <AndroidDate events={this.props.events} />,
      // });
      //return <AndroidDate events={this.props.events} />

      var habits = this.props.habits;

      console.log('habits[habitIdx]:', habits[habitIdx].reminder);

      if (habits[habitIdx].reminder === undefined || habits[habitIdx].reminder === null) {
        // Create new Calendar event.
        NativeModules.DateAndroid.showTimepicker(function() {}, (hour, minute) => {
          console.log(hour + ":" + minute);
          // this.props.events.emit('date-changed', hour + ":" + minute);

          // Reound the minute to the nearest 10 to make things look cleaner on the Calendar.
          minute = Math.round(minute / 10) * 10;

          // var momentDate = moment(this.state.chosenDate);

          habits[habitIdx].reminder = hour + ":" + minute;
          store.save('habits', this.props.habits);

          this.setState({habits: habits}, () => {
            this.props.events.emit('new-habit', this.props.habits);

            // Get the endDate using Moment based on Moment object for the startDate and adding 30 minutes.
            var startDate = moment().format('YYYY-MM-DD') + ' ' + habits[habitIdx].reminder;
            var startMoment = moment(startDate);
            var endMoment = startMoment.add(30, 'm');
            var endDate = endMoment.format('YYYY-MM-DD hh:mm');

            // Create the Calendar Intent.
            SendIntentAndroid.sendAddCalendarEvent({
              title: habits[habitIdx].name,
              description: 'Reminder from The Hoick Habit App for Habit: ' + habits[habitIdx].name,
              startDate: startDate,
              endDate: endDate,
              recurrence: 'weekly'
            });
          });
        });
      } else {
        // Open Calendar for editing reminder event.
        SendIntentAndroid.sendOpenCalendar();
      }
    }
  },

  closeModal: function(visible) {
    this.setState({modalVisible: visible});
    this.props.events.emit('date-picked');
  },

  removeReminder: function(visible) {
    var habits = this.props.habits;

    if (React.Platform.OS == 'ios') {
      habits[this.state.habitReminderIdx].reminder = null;

      this.setState({habits: habits, modalVisible: visible}, () => {
        store.save('habits', this.props.habits);
        this.props.events.emit('new-habit', this.props.habits);
      });

      // Remove the Reminder from iOS.
      RNCalendarReminders.fetchAllReminders(reminders => {
        for (var i = 0; i < reminders.length; i++) {
          if (reminders[i].title == this.props.habits[this.state.habitReminderIdx].name) {
            RNCalendarReminders.removeReminder(reminders[i].id);
          }
        }
      });
    } else {
      habits[visible].reminder = null;

      this.setState({habits: habits}, () => {
        store.save('habits', this.props.habits);
        this.props.events.emit('new-habit', this.props.habits);
      });
    }
  },

  // onPressHandle: function() {
  //     // alert
  //     this.popup.alert(1, 'two');
  // },

  habitComponents: function() {
    var habits = this.props.habits.map((habit, index) => {
      return (
        <View style={styles.habits} key={index}>
          <View style={styles.habitInfo}>
            <TouchableHighlight style={styles.habitButton} onPress={() => this.habitSelected(index)}>
              <Text style={styles.habitText}>{habit.name ? habit.name : ''}</Text>
            </TouchableHighlight>

            <LinkCount habit={habit} linkCountStyle={styles.linkCountText} events={this.props.events}/>

            <TouchableHighlight style={styles.habitButton} onPress={() => this.removeReminder(index)}>
              <Text style={styles.linkCountText}>Reminder: {habit.reminder ? habit.reminder : 'No Reminder'}</Text>
            </TouchableHighlight>
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
          <HabitForm habits={this.props.habits} events={this.props.events}/>

          <Text style={styles.heading}>Habits</Text>

          <View style={styles.hr}></View>

          <ScrollView style={[styles.mainScroll]} automaticallyAdjustContentInsets={true} scrollEventThrottle={200} showsVerticalScrollIndicator={false}>
            {this.habitComponents()}
          </ScrollView>
        </View>
        <Popup ref={(popup) => { this.popup = popup }}/>

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
