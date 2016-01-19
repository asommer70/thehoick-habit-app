var React = require('react-native');
var {
  Text,
  View,
  ScrollView,
  StyleSheet,
  Modal
} = React;
var store = require('react-native-simple-store');
var Subscribable = require('Subscribable');
var moment = require('moment');

var Button = require('./components/button');
var HabitForm = require('./components/habit-form');
var LinkCount = require('./components/link-count');
var IOSDate = require('./components/datepicker-ios');

module.exports = React.createClass({
  mixins: [Subscribable.Mixin],

  componentWillMount: function() {
    this.addListenerOn(this.props.events, 'date-picked', (date) => {
      console.log('habits date-picked event... date:', date);
      console.log('habits date-picked event... date:', date.get);

      var habits = this.state.habits;
      var momentDate = moment(date.toISOString());

      habits[this.state.habitReminderIdx].reminder = momentDate.format('HH:MM:SS');

      this.setState({habits: habits, dataSource: this.state.dataSource.cloneWithRows(habits)}, () => {
        store.save('habits', this.state.habits);
        this.props.events.emit('new-habit', this.state.habits);
      });

      // Set the habit from the Date Picker.
    });
  },

  componentDidMount: function() {
    this.addListenerOn(this.props.events, 'new-habit', (habits) => {
      console.log('habits new-habit event... habits:', habits);
      this.setState({habits: habits, dataSource: this.state.dataSource.cloneWithRows(habits)})
    });

    // this.setState({dataSource: this.state.dataSource.cloneWithRows(this.state.habits)})
  },

  componentWillReceiveProps: function(nextProps) {
      this.setState({
          dataSource: this.state.dataSource.cloneWithRows( nextProps.data )
      });
  },

  getInitialState: function() {
    // var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => {console.log('row has changed... r1:', r1, 'r2:', r2); r1 !== r2}});
    //var ds = new ListView.DataSource({rowHasChanged: (row1, row2) => true});

    return {
      habits: this.props.habits,
      //dataSource: ds.cloneWithRows(this.props.habits),
      // dataSource: new ListView.DataSource({
      //   rowHasChanged: (row1, row2) => row1 !== row2,
      // }),
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

  addReminder: function(habitIdx) {
    console.log('habits addReminder... habitIdx:', habitIdx);
    // Open modal with Date Picker.
    return <IOSDate />
  },

  openModal: function(habitIdx) {
    console.log('habits openModal... habitIdx:', habitIdx);
    this.setState({modalVisible: true, habitReminderIdx: habitIdx})
  },

  closeModal: function(visible) {
    console.log('habits closeModal... this.state.habitReminderIdx:', this.state.habitReminderIdx);
    this.setState({modalVisible: visible});
  },

  removeReminder: function(visible) {
    console.log('habits closeModal... this.state.habitReminderIdx:', this.state.habitReminderIdx);

    var habits = this.state.habits;
    habits[this.state.habitReminderIdx].reminder = null;

    this.setState({habits: habits, dataSource: this.state.dataSource.cloneWithRows(habits), modalVisible: visible}, () => {
      store.save('habits', this.state.habits);
      this.props.events.emit('new-habit', this.state.habits);
    });
  },

  habitComponents: function() {
    var habits = this.state.habits.map((habit, index) => {
      return (
        <View style={styles.habits} key={index}>
          <View style={styles.habitInfo}>
            <Text style={styles.habitText}>{habit.name ? habit.name : ''}</Text>
            <LinkCount habit={habit} linkCountStyle={styles.linkCountText} events={this.props.events}/>
            <Text style={styles.linkCountText}>Render at: {habit.reminder ? habit.reminder : 'No Reminder'}</Text>
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
              <IOSDate events={this.props.events} />
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
