var React = require('react-native');
var {
  View,
  StyleSheet,
  ScrollView,
} = React;
var store = require('react-native-simple-store');
var Share = require('react-native-share');
var moment = require('moment');
var Subscribable = require('Subscribable');

var Habit = require('./components/habit');
var Button = require('./components/button');
var LinkCount = require('./components/link-count');
var Chains = require('./components/chains');

module.exports = React.createClass({
  mixins: [Subscribable.Mixin],

  componentWillMount: function() {
    this.addListenerOn(this.props.events, 'got-habits', (habits) => {
      this.setState({habits: habits, habit: habits[habits.length - 1]});
    });

    this.addListenerOn(this.props.events, 'new-habit', (habits) => {
      if (habits.length > 1) {
        this.setState({habit: habits[habits.length - 1]});
      } else {
        this.setState({habit: []});
      }
      this.sendData();
    });

    this.addListenerOn(this.props.events, 'day-added', () => {
      this.sendData();
    });
  },

  componentDidMount: function() {
    console.log('React:', React.Platform.OS);
    store.get('settings').then((data) => {
      if (data === null) {
        data = {};
      }
      this.setState({settings: data});
    })
  },

  getInitialState: function() {
    return {
      habits: [],
      habit: {name: '', days: []},
    }
  },

  sendData: function() {
    if (this.state.settings.url !== undefined &&
        this.state.settings.url != '' &&
        this.state.settings.username !== undefined &&
        this.state.settings.username != '') {
      fetch(this.state.settings.url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({username: this.state.settings.username, habits: this.state.habits})
      })
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

  openSettings: function() {
    this.props.navigator.push({name: 'settings'});
  },

  openHabits: function() {
    this.props.navigator.push({name: 'habits'});
  },

  render: function() {
    return (
      <View style={styles.container}>
        <ScrollView style={[styles.mainScroll]} automaticallyAdjustContentInsets={true} scrollEventThrottle={200} showsVerticalScrollIndicator={false}>
          <View style={styles.wrapper}>
            <Habit habits={this.state.habits} events={this.props.events}/>

            <LinkCount habit={this.state.habit} events={this.props.events}/>
          </View>

          <Chains habits={this.state.habits} events={this.props.events}/>
        </ScrollView>

        <View style={styles.buttonRow}>
          <Button text={'Settings'} onPress={this.openSettings} textType={styles.navText} buttonType={styles.shareButton} />
          <Button text={'Share'} imageSrc={require('./img/share-icon.png')} onPress={this.onShare} textType={styles.shareText} buttonType={styles.shareButton} />
          <Button text={'Habits'} onPress={this.openHabits} textType={styles.navText} buttonType={styles.shareButton} />
        </View>
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

  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center'
  },

  navText: {
    textAlign: 'center',
    color: '#DFD9B9',
    fontSize: 18
  },
});
