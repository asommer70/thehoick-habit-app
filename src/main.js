var React = require('react-native');
var {
  View,
  Text,
  StyleSheet,
  TextInput,
  AsyncStorage,
  TouchableWithoutFeedback,
  Image,
  ScrollView
} = React;
var store = require('react-native-simple-store');

var Button = require('./components/button');

var today = new Date();
var dayKey = today.getMonth().toString() + today.getDate().toString() + today.getFullYear().toString();
var day;


module.exports = React.createClass({
  componentDidMount() {
    // Get the habit from AsyncStorage.
    store.get('habit').then((data) => {
      if (this.isMounted()) {
        this.setState({habit: data, editHabit: false});
      }
    });

    // Get the days array from AsyncStorage, and check if today has been checked.
    store.get('days').then((data) => {
      if (this.isMounted()) {
        //this.setState({days: data});
        var thirty = [];
        for (var i = 0; i < 32; i++) {
          var newDay = {dayId: '0' + i, created_at: Date.now(), habit: this.state.habit};
          thirty.push(newDay);
        }
        this.setState({days: thirty});
      }

      day = data.findIndex(function(day, index, days) {
        if (day.dayId == dayKey) {
          return true;
        }
      });

      if (day !== -1) {
        this.setState({checked: true});
      }
    })
  },

  getInitialState: function() {

    return {
      habit: '',
      checked: false,
      days: [],
      editHabit: true,
    }
  },

  saveHabit: function() {
    if (this.state.text) {
      store.save('habit', this.state.text).then(() => {
        this.setState({habit: this.state.text, editHabit: false});
      });
    } else {
      this.setState({editHabit: false});
    }
  },

  editHabit: function() {
    this.setState({editHabit: true})
  },

  addDay: function() {
    if (this.state.days !== null) {
      day = this.state.days.findIndex(function(day, index, days) {
        if (day.dayId == dayKey) {
          return true;
        }
      });
    } else {
      day = -1;
    }

    if (day === -1) {
      var newDay = {dayId: dayKey, created_at: Date.now(), habit: this.state.habit};

      if (this.state.days === null) {
        this.setState({days: [newDay], checked: true});
      } else {
        this.state.days.push(newDay);
        this.setState({days: this.state.days, checked: true});
      }
      store.save('days', this.state.days);
    }
  },

  restartHabit: function() {
    store.delete('days');
    this.setState({days: [], editHabit: false, checked: false});
  },

  render: function() {
    var input, save;

    if (this.state.editHabit !== true) {
      label = <Text></Text>;
      input = <Text></Text>;
      save = <Text></Text>;
      restart = <Text></Text>;
    } else {
      label = <Text style={styles.label}>Enter Habit</Text>;
      input = <TextInput style={styles.input} onChangeText={(text) => this.setState({text})} value={this.state.habit} />;
      save =  <Button text={'Save'} onPress={this.saveHabit} />;
      restart = <Button text={'Restart Chain'} onPress={this.restartHabit} textType={styles.restartText} buttonType={styles.restartButton} />;
    }

    return (
      <View style={styles.container}>
        <View style={styles.wrapper}>
          <TouchableWithoutFeedback onLongPress={this.editHabit} onPress={this.addDay}>
            <Text style={[styles.habit, this.state.checked && styles.checked]}>{this.state.habit ? this.state.habit : 'No habit configured...'}</Text>
          </TouchableWithoutFeedback>

          <View style={styles.formElement}>
            {label}
            {input}
            {save}
            {restart}
          </View>

          <Text style={styles.days}>{this.state.days ? this.state.days.length : '0'} links in the chain.</Text>
        </View>

        <ScrollView style={[styles.scroll]} automaticallyAdjustContentInsets={true} scrollEventThrottle={200}>
          <View style={styles.chains}>
            {this.state.days.map(function(day) {
              return <Image key={day.dayId} style={styles.icon} source={require('./img/chain-icon.png')} />;
            })}
          </View>
        </ScrollView>
      </View>
    )
  },
});

var styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },

  wrapper: {
    marginTop: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },

  habit: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    fontSize: 35,
    borderWidth: 2,
    borderColor: 'black',
  },

  input: {
    padding: 4,
    height: 40,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 3,
    margin: 5,
    width: 200,
    alignSelf: 'center'
  },

  formElement: {
    backgroundColor: '#eeeeee',
    margin: 10
  },

  label: {
    alignSelf: 'center',
    justifyContent: 'center',
    fontSize: 18,
    marginTop: 10
  },

  days: {
    padding: 10
  },

  icon: {
    padding: 0,
  },

  scroll: {
    height: 300,
  },

  chains: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingLeft: 5,
    paddingRight: 5,
    overflow: 'visible',
  },

  checked: {
    backgroundColor: 'green',
    color: 'white'
  },

  restartButton: {
    borderColor: 'red',
  },

  restartText: {
    color: 'red',
  },
});
