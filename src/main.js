var React = require('react-native');
var {
  View,
  Text,
  StyleSheet,
  TextInput,
  AsyncStorage,
  TouchableWithoutFeedback,
  Image,
  ScrollView,
  TouchableHighlight
} = React;
var store = require('react-native-simple-store');
var Share = require('react-native-share');
var moment = require('moment');
var EventEmitter = require('EventEmitter');
var Subscribable = require('Subscribable');

var Habit = require('./components/habit');
var Button = require('./components/button');
var Form = require('./components/form');
var LinkCount = require('./components/link-count');
var Chains = require('./components/chains');


module.exports = React.createClass({
  mixins: [Subscribable.Mixin],

  componentWillMount: function() {
    this.eventEmitter = new EventEmitter();

    this.addListenerOn(this.eventEmitter, 'got-habits', (habits) => {
      this.setState({habits: habits, habit: habits[habits.length - 1]});
    });
  },

  getInitialState: function() {
    return {
      habits: [],
      habit: {name: '', days: []},
    }
  },

  onShare: function() {
    Share.open({
      share_text: 'Habit Progress',
      share_URL: 'For my ' + this.state.habit.name + ' habit I have done ' + this.state.habit.days.length + ' days in a row.  Yay for progress! #thehoickhabitapp',
      title: 'For my ' + this.state.habit.name + ' habit I have done ' + this.state.habit.days.length + ' days in a row.  Yay for progress! #thehoickhabitapp',
    },function(e) {
      console.log(e);
    });
  },


  render: function() {
    return (
      <View style={styles.container}>
        <ScrollView style={[styles.mainScroll]} automaticallyAdjustContentInsets={true} scrollEventThrottle={200} showsVerticalScrollIndicator={false}>
          <View style={styles.wrapper}>
            <Habit habits={this.state.habits} events={this.eventEmitter}/>

            <Form habits={this.state.habits} events={this.eventEmitter}/>

            <LinkCount days={this.state.days} events={this.eventEmitter}/>
          </View>

          <Chains habits={this.state.habits} events={this.eventEmitter}/>
        </ScrollView>

        <Button text={'Share'} imageSrc={require('./img/share-icon.png')} onPress={this.onShare} textType={styles.shareText} buttonType={styles.shareButton} />
      </View>
    )
  },
});

var styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#045491',
  },

  wrapper: {
    marginTop: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  mainScroll: {
    height: 500
  },

  share: {
    marginBottom: 15,
    marginTop: 15,
    paddingTop: 5,
    borderColor: '#DFD9B9',
    borderWidth: 1,
    width: 45,
    alignSelf: 'center',
    justifyContent: 'center',
  },

  shareButton: {
    borderColor: '#DFD9B9',
    borderRadius: 0
  },

  shareText: {
    textAlign: 'center',
    color: '#DFD9B9',
    paddingTop: 2
  },
});
