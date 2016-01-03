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
    store.get('habit').then((data) => {
      if (this.isMounted()) {
        this.setState({habit: data, editHabit: false});
      }
    });
  },

  getInitialState: function() {
    return {
      habit: '',
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

  render: function() {
    var input, save;

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
