var React = require('react-native');
var {
  Text,
  View,
  ScrollView,
  StyleSheet,
  Modal,
  TouchableHighlight,
  NativeModules,
  BackAndroid
} = React;
var store = require('react-native-simple-store');
var Subscribable = require('Subscribable');
var moment = require('moment');

if (React.Platform.OS != 'ios') {
  var SendIntentAndroid = require('react-native-send-intent');
} else {
  var RNCalendarReminders = require('react-native-calendar-reminders');
}

import Popup from 'react-native-popup';

var Button = require('./components/button');
var HabitForm = require('./components/habit-form');
var LinkCount = require('./components/link-count');
var IOSDate = require('./components/datepicker-ios');

module.exports = React.createClass({
  mixins: [Subscribable.Mixin],

  componentWillMount: function() {
    this.addListenerOn(this.props.events, 'date-changed', (date) => {
      this.setState({chosenDate: date})
    });

    this.addListenerOn(this.props.events, 'got-habits', (habits) => {
      this.setState({habits: habits, habit: habits[habits.length - 1]});
    });
  },

  componentDidMount: function() {
    this.addListenerOn(this.props.events, 'new-habit', (habits) => {
      this.setState({habits: habits})
    });

    BackAndroid.addEventListener('hardwareBackPress', () => {
      if (this.props.navigator.getCurrentRoutes().length > 0) {
       this.goBack();
       return true;
      }
      return false;
    });
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
    if (React.Platform.OS == 'ios') {
      this.setState({modalVisible: true, habitReminderIdx: habitIdx})
    } else {
      this.addAndroidReminder(habitIdx);
    }
  },

  closeModal: function(visible) {
    this.setState({modalVisible: visible});
    // this.props.events.emit('date-picked');
    this.addiOSReminder();
  },

  addiOSReminder: function() {
    var habits = this.props.habits;
    var momentDate = moment(this.state.chosenDate);

    habits[this.state.habitReminderIdx].reminder = momentDate.format('hh:mm');

    this.setState({habits: habits}, () => {
      store.save('habits', this.props.habits);
      this.props.events.emit('new-habit', this.props.habits);
    });

    var habit = this.props.habits[this.state.habitReminderIdx];

    // Set the habit from the Date Picker.
    RNCalendarReminders.authorizeEventStore((error, auth) => {
      console.log('authorizing EventStore...');
    });

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
      reminderObj = {
        location: '',
        notes: 'Reminder from The Hoick Habit App for Habit: ' + habit.name,
        startDate: this.state.chosenDate,
        alarms: [{
          date: -1 // or absolute date
        }],
        recurrence: 'daily'
      };

      if (reminderId !== undefined) {
        reminderObj.id = reminders[i].id;
      }

      RNCalendarReminders.saveReminder(habit.name, reminderObj);
    });
  },

  addAndroidReminder: function(habitIdx) {
    var habits = this.props.habits;

    if (habits[habitIdx].reminder === undefined || habits[habitIdx].reminder === null) {
      // Create new Calendar event.
      NativeModules.DateAndroid.showTimepicker(function() {}, (hour, minute) => {
        // Reound the minute to the nearest 10 to make things look cleaner on the Calendar.
        minute = Math.round(minute / 10) * 10;

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
            recurrence: 'daily'
          });
        });
      });
    } else {
      // Open Calendar for editing reminder event.
      SendIntentAndroid.sendOpenCalendar();
    }
  },

  confirm: function(content, callbackFunc, callbackArgs) {
    // Close the Modal if it's open.
    if (this.state.modalVisible) {
      this.setState({modalVisible: false});
    }

    this.popup.confirm({
        content: content,
        ok: {
            callback: () => {
                this[callbackFunc](callbackArgs);
            },
        },
    });
  },

  removeReminder: function(visible) {
    var habits = this.props.habits;

    if (React.Platform.OS == 'ios') {
      var habit;
      if (visible !== false) {
        habits[visible].reminder = null;
        habit = habits[visible];
      } else {
        habits[this.state.habitReminderIdx].reminder = null;
        habit = habits[this.state.habitReminderIdx];
      }

      this.setState({habits: habits, modalVisible: false}, () => {
        store.save('habits', this.props.habits);
        this.props.events.emit('new-habit', this.props.habits);
      });

      // Remove the Reminder from iOS.
      RNCalendarReminders.fetchAllReminders(reminders => {
        for (var i = 0; i < reminders.length; i++) {
          if (reminders[i].title == habit.name) {
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

  habitComponents: function() {
    var habits = this.props.habits.map((habit, index) => {
      return (
        <View style={styles.habits} key={index}>
          <View style={styles.habitInfo}>
            <TouchableHighlight underlayColor={'gray'} style={styles.habitButton} onPress={() => this.habitSelected(index)}>
              <Text style={styles.habitText}>{habit.name ? habit.name : ''}</Text>
            </TouchableHighlight>

            <LinkCount habit={habit} linkCountStyle={styles.linkCountText} events={this.props.events}/>

            <TouchableHighlight underlayColor={'gray'} style={styles.habitButton} onPress={
                () => this.confirm('Really remove remove reminder?', 'removeReminder', index)
            }>
              <Text style={styles.reminderText}>Reminder: {habit.reminder ? habit.reminder : 'No Reminder'}</Text>
            </TouchableHighlight>
          </View>

          <View style={styles.habitButtons}>
            <Button imageStyle={styles.iconImage} imageSrc={require('./img/alarm-clock-icon.png')} onPress={() => this.openModal(index)} buttonType={styles.restartButton} />
            <Button imageStyle={styles.iconImage} imageSrc={require('./img/reload-icon.png')} onPress={() => this.confirm('Really restart chain?', 'restartHabit', index)} buttonType={styles.restartButton} />
            <Button imageStyle={styles.iconImage} imageSrc={require('./img/trash-icon.png')} onPress={() => this.confirm('Really delete habit?', 'deleteHabit', index)} buttonType={styles.deleteButton} />
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
        <Button imageSrc={require('./img/arrow-left-icon.png')} onPress={this.goBack} imageStyle={styles.iconImage} buttonType={styles.navButton} />

        <View style={styles.wrapper}>
          <Button imageStyle={styles.iconImage} imageSrc={require('./img/plus-icon.png')} onPress={this.editHabit} textType={styles.navText} buttonType={styles.navButton} />
          <HabitForm habits={this.props.habits} events={this.props.events}/>

          <Text style={styles.heading}>Habits</Text>

          <View style={styles.hr}></View>

          <ScrollView style={[styles.mainScroll]} automaticallyAdjustContentInsets={true} showsVerticalScrollIndicator={true}>
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
              <Button text={'Remove Reminder'} onPress={this.confirm.bind(this, 'Really remove remove reminder?', 'removeReminder', false)} textType={styles.deleteText} buttonType={styles.deleteButton} />
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

  mainScroll: {
    height: 300
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

  backButton: {
    borderColor: '#DFD9B9',
    borderRadius: 0,
    flexDirection: 'row'
  },

  iconImage: {
    padding: 2,
    margin: 5
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
    paddingLeft: 5,
    paddingRight: 20,
    alignSelf: 'flex-start',
    width: 140,
  },

  habitText: {
    color: '#DFD9B9',
    fontSize: 20,
    borderColor: '#DFD9B9',
    paddingLeft: 10,
    width: 140
  },

  linkCountText: {
    color: '#DFD9B9',
    fontSize: 12,
    paddingLeft: 10
  },

  reminderText: {
    color: '#DFD9B9',
    fontSize: 12,
    paddingLeft: 10,
    textDecorationLine: 'underline'
  },

  row: {
    flexDirection: 'row',
  },

  habitButtons: {
    flexDirection: 'row',
    marginRight: 15,
  },

  deleteButton: {
    borderColor: '#CE4B41',
    borderRadius: 0,
    marginRight: 1,
    marginTop: 3,
    marginBottom: 3
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
