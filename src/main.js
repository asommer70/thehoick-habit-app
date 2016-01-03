var React = require('react-native');
var {
  View,
  Text,
  StyleSheet,
  TextInput,
  AsyncStorage,
  TouchableWithoutFeedback
} = React;
var store = require('react-native-simple-store');

var Button = require('./components/button');


module.exports = React.createClass({
  componentDidMount() {
    // this._loadInitialState().done();
    // var habit = AsyncStorage.getItem('habit', (habit) => {
    //   this.setState({habit: habit})
    // });
    console.log('this.state.habit:', this.state.habit);
    store.get('habit').then((data) => {
      console.log('data:', data);

      if (this.isMounted()) {
        this.setState({habit: data, editHabit: false});
      }
    });
  },
  //
  // async _loadInitialState() {
  //   try {
  //     var value = await AsyncStorage.getItem('habit');
  //     if (value !== null){
  //       this.setState({habit: value});
  //       this._appendMessage('Recovered selection from disk: ' + value);
  //     } else {
  //       this._appendMessage('Initialized with no selection on disk.');
  //     }
  //   } catch (error) {
  //     this._appendMessage('AsyncStorage error: ' + error.message);
  //   }
  // },

  getInitialState: function() {
    return {
      habit: '',
      editHabit: true,
      // messages: [],
    }
  },

  saveHabit: function() {
    console.log('Button pressed...');

    if (this.state.text) {
      store.save('habit', this.state.text).then(() => {
        this.setState({habit: this.state.text, editHabit: false});
      });
    } else {
      this.setState({editHabit: false});
    }



    // this.setState({habit: this.state.habit});
    // try {
    //   await AsyncStorage.setItem('habit', this.state.habit);
    //   this._appendMessage('Saved selection to disk: ' + this.state.habit);
    // } catch (error) {
    //   this._appendMessage('AsyncStorage error: ' + error.message);
    // }

  },

  editHabit: function() {
    console.log('Long press...');
    this.setState({editHabit: true})
  },

  render: function() {
    var input, save;

    console.log('this.state.habit:', this.state.habit);

    if (this.state.editHabit !== true) {
      label = <Text></Text>;
      input = <Text></Text>;
      save = <Text></Text>;
    } else {
      label = <Text style={styles.label}>Enter Habit</Text>;
      input = <TextInput style={styles.input} onChangeText={(text) => this.setState({text})} value={this.state.habit} />;
      save =  <Button text={'Save'} onPress={this.saveHabit} />;
    }

    return (
      <View style={styles.container}>
        <TouchableWithoutFeedback onLongPress={this.editHabit}>
          <Text style={styles.habit}>{this.state.habit ? this.state.habit : 'No habit configured...'}</Text>
        </TouchableWithoutFeedback>
        {label}
        {input}
        {save}
      </View>
    )
  },

  // async _onValueChange(selectedValue) {
  //   this.setState({selectedValue});
  //   try {
  //     await AsyncStorage.setItem(STORAGE_KEY, selectedValue);
  //     this._appendMessage('Saved selection to disk: ' + selectedValue);
  //   } catch (error) {
  //     this._appendMessage('AsyncStorage error: ' + error.message);
  //   }
  // },
  //
  // _appendMessage(message) {
  //   this.setState({messages: this.state.messages.concat(message)});
  // },
});

var styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  habit: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
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

  label: {
    fontSize: 18,
    marginTop: 10
  }
});
