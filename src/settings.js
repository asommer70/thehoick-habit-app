var React = require('react-native');
var {
  Text,
  View,
  ScrollView,
  StyleSheet
} = React;
var Subscribable = require('Subscribable');

var Button = require('./components/button');

module.exports = React.createClass({
  mixins: [Subscribable.Mixin],

  componentWillMount: function() {
  },

  getInitialState: function() {
    return {
      habits: this.props.habits,
      habit: this.props.habits[this.props.habits.length - 1]
    }
  },

  goBack: function() {
    this.props.navigator.pop();
  },

  render: function() {
    return (
      <View style={styles.container}>
        <Button text={'Back'} onPress={this.goBack} textType={styles.navText} buttonType={styles.navButton} />

        <View style={styles.wrapper}>
          <Text style={styles.white}>Settings...  {this.state.habit.name}</Text>
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

  white: {
    color: '#DFD9B9'
  },
})
