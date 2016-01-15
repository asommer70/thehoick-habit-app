var React = require('react-native');
var {
  Text,
  View,
  ScrollView,
  StyleSheet,
  ListView
} = React;
var store = require('react-native-simple-store');
var Subscribable = require('Subscribable');

var Button = require('./components/button');
var Form = require('./components/form');
var LinkCount = require('./components/link-count');

module.exports = React.createClass({
  mixins: [Subscribable.Mixin],

  componentDidMount: function() {
    this.addListenerOn(this.props.events, 'new-habit', (habits) => {
      console.log('habits new-habit event... habits:', habits);
      this.setState({habits: habits, habit: habits[habits.length - 1], dataSource: this.state.dataSource.cloneWithRows(habits)})
    });
  },

  getInitialState: function() {
    var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

    return {
      habits: this.props.habits,
      habit: this.props.habits[this.props.habits.length - 1],
      dataSource: ds.cloneWithRows(this.props.habits),
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
    this.setState({habits: habits, habit: habits[habits.length - 1], dataSource: this.state.dataSource.cloneWithRows(habits)}, () => {
      this.props.events.emit('new-habit', this.state.habits);
      store.save('habits', this.state.habits);
    })
  },

  restartHabit: function(habitIdx) {
    var habits = this.state.habits;
    habits[habitIdx].days = [];

    this.setState({habits: habits, habit: habits[habits.length - 1], dataSource: this.state.dataSource.cloneWithRows(habits)}, () => {
      this.props.events.emit('got-habits', this.state.habits);
      this.props.events.emit('chain-restarted');
      store.save('habits', this.state.habits);
    });
  },

  render: function() {
    return (
      <View style={styles.container}>
        <Button text={'Back'} onPress={this.goBack} textType={styles.navText} buttonType={styles.navButton} />

        <View style={styles.wrapper}>
          <Button text={'Add Habit'} onPress={this.editHabit} textType={styles.navText} buttonType={styles.navButton} />
          <Form habits={this.state.habits} events={this.props.events}/>

          <Text style={styles.heading}>Habits</Text>
          <View style={styles.hr}></View>

          <ListView
            dataSource={this.state.dataSource}
            renderRow={(rowData, sectionId, rowId) =>
              <View style={styles.habits}>
                <View style={styles.habitInfo}>
                  <Text style={styles.habitText}>{rowData.name ? rowData.name : ''}</Text>
                  <LinkCount days={rowData.days} linkCountStyle={styles.linkCountText} events={this.props.events}/>
                </View>

                <View style={styles.habitButtons}>
                  <Button text={'Restart Chain'} onPress={() => this.restartHabit(rowId)} textType={styles.restartText} buttonType={styles.restartButton} />
                  <Button text={'Delete'} onPress={() => this.deleteHabit(rowId)} textType={styles.deleteText} buttonType={styles.deleteButton} />
                </View>
              </View>
            }
          />
        </View>
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

  habitButtons: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    marginLeft: 5
  },

  deleteButton: {
    borderColor: '#CE4B41',
    marginLeft: 1
  },

  deleteText: {
    color: '#CE4B41',
    fontSize: 12
  },

  restartText: {
    textAlign: 'center',
    color: '#DFD9B9',
    fontSize: 12
  },

  restartButton: {
    borderColor: '#DFD9B9',
    borderRadius: 0,
    marginRight: 1
  },
})
