var React = require('react-native');
var {
  AppStateIOS,
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

    if (React.Platform.OS == 'ios') {
      AppStateIOS.removeEventListener('change', this._handleAppStateChange);
    }
  },

  _handleAppStateChange: function(currentAppState) {
    this.setState({ currentAppState, });
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

  getSceneConfig: function() {
    if (React.Platform.OS == 'ios') {
      return Navigator.SceneConfigs.FloatFromBottom;
    } else {
      return Navigator.SceneConfigs.FadeAndroid;
    }
  },

  render: function() {
    return (
      <Navigator
        style={styles.container}
        initialRoute={{name: 'main'}}
        renderScene={this.renderScene}
        configureScene={() => { return this.getSceneConfig(); }}
        />
    );
  }
});

var styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
