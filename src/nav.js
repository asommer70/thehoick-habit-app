var React = require('react-native');
var {
  StyleSheet,
  Navigator
} = React;
var EventEmitter = require('EventEmitter');
var Subscribable = require('Subscribable');

var Main = require('./main');
var Settings = require('./settings');
var Habits = require('./habits');

var ROUTES = {
  main: Main,
  settings: Settings,
  habits: Habits
};

module.exports = React.createClass({
  mixins: [Subscribable.Mixin],

  componentWillMount: function() {
    this.eventEmitter = new EventEmitter();

    this.addListenerOn(this.eventEmitter, 'got-habits', (habits) => {
      this.setState({habits: habits}, () => {
      });
    });
  },

  getInitialState: function() {
    return {
      habits: []
    }
  },

  renderScene: function(route, navigator) {
    var Component = ROUTES[route.name];
    return <Component route={route} navigator={navigator} events={this.eventEmitter} habits={this.state.habits} />;
  },

  render: function() {
    return (
      <Navigator
        style={styles.container}
        initialRoute={{name: 'main'}}
        renderScene={this.renderScene}
        configureScene={() => { return Navigator.SceneConfigs.FadeAndroid; }}
        />
    );
  }
});

var styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
