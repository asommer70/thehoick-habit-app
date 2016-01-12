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

var today = moment();
// var today = moment().add(1, 'days');
// var today = moment().add(2, 'days');
// var today = moment().add(7, 'days');
//var today = moment().add(8, 'days');
// var today = moment().add(9, 'days');
// var today = moment().add(10, 'days');
// var today = moment().add(11, 'days');
// var today = moment().add(29, 'days');
//var today = moment().add(30, 'days');

var dayKey = today.format('MMDDYYYY');
var day;


module.exports = React.createClass({
  mixins: [Subscribable.Mixin],

  componentWillMount: function() {
    this.eventEmitter = new EventEmitter();
    this.addListenerOn(this.eventEmitter, 'got-habits', (habits) => {
      console.log('got-habits event...');
      this.setState({habits: habits});
    });
  },

  componentDidMount: function() {
  },

  getInitialState: function() {
    return {
      habits: [],
      habit: {name: '', days: []},
      text: '',
      checked: false,
      editHabit: true,
    }
  },


  // editHabit: function() {
  //   this.setState({editHabit: true})
  // },
  //
  // cancelHabitEdit: function() {
  //   this.setState({editHabit: false});
  // },

  onShare: function() {
    Share.open({
      share_text: 'Habit Progress',
      share_URL: 'For my ' + this.state.habit.name + ' habit I have done ' + this.state.habit.days.length + ' days in a row.  Yay for progress! #thehoickhabitapp',
      title: 'For my ' + this.state.habit.name + ' habit I have done ' + this.state.habit.days.length + ' days in a row.  Yay for progress! #thehoickhabitapp',
    },function(e) {
      console.log(e);
    });
  },

  checked: function(habit) {
    day = habit.days.findIndex(function(day, index, days) {
      if (day.dayId == dayKey) {
        return true;
      }
    });

    if (day !== -1) {
      return true;
    }  else {
      return false;
    }
  },

  setTestEnv: function() {
    store.get('testHabits').then((data) => {
      this.setState({habits: data, habit: data[data.length - 1]}, function() {
        store.save('habits', this.state.habits);
      });
    })
  },

  render: function() {

    var chains;
    var habitDays = this.state.habit.days;

    var chainIcons = habitDays.map(function(day, index) {
      var icon;
      if (index % 30 == 0 && index !=0) {
        icon = require('./img/chain-icon-green.png');
      } else {
        icon = require('./img/chain-icon.png');
      }

      if (day.checked == false) {
        icon = require('./img/broken-chain-left-icon.png');
      }

      return <Image key={day.dayId} style={styles.icon}
              source={icon} />;
    });

    if (this.state.habit.name != '') {
      chains =  <View style={styles.chains}>
                  {chainIcons}
                </View>
    } else {
      chains = <View></View>;
    }

    return (
      <View style={styles.container}>
      <ScrollView style={[styles.mainScroll]} automaticallyAdjustContentInsets={true} scrollEventThrottle={200} showsVerticalScrollIndicator={false}>
        <View style={styles.wrapper}>
          <Habit habits={this.state.habits} events={this.eventEmitter}/>

          <Form habits={this.state.habits} events={this.eventEmitter}/>

          <LinkCount days={this.state.days} events={this.eventEmitter}/>
        </View>

        <ScrollView style={[styles.scroll]} automaticallyAdjustContentInsets={true} scrollEventThrottle={200}>
         {chains}
        </ScrollView>
        </ScrollView>
        <Button text={'Test Environment'} onPress={this.setTestEnv} textType={styles.shareText} buttonType={styles.shareButton} />

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

  icon: {
    padding: 0,
  },

  mainScroll: {
    height: 500
  },

  scroll: {
    height: 600,
  },

  chains: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 5,
    overflow: 'visible',
    borderColor: '#DFD9B9',
    borderWidth: 1
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
