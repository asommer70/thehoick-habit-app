var React = require('react-native');
var {
  Text,
  View,
  ScrollView,
  StyleSheet,
  TextInput,
  BackAndroid
} = React;
var store = require('react-native-simple-store');
var Subscribable = require('Subscribable');

var Button = require('./components/button');
var SettingForm = require('./components/setting-form');

module.exports = React.createClass({
  mixins: [Subscribable.Mixin],

  componentWillMount: function() {
    this.addListenerOn(this.props.events, 'cancel-url', () => {
      this.setState({urlForm: false});
    });

    this.addListenerOn(this.props.events, 'cancel-username', () => {
      this.setState({usernameForm: false});
    });

    this.addListenerOn(this.props.events, 'new-settings', (settings) => {
      this.setState({settings: settings, urlForm: false, usernameForm: false});
    });
  },

  componentDidMount: function() {
    store.get('settings').then((data) => {
      if (data === null) {
        data = {};
      }
      this.setState({settings: data});
    })

    BackAndroid.addEventListener('hardwareBackPress', () => {
      if (this.props.navigator.getCurrentRoutes().length > 0) {
       this.goBack();
       return true;
      }
      return false;
    });
  },

  getInitialState: function() {
    return {
      settings: {},
      urlForm: false,
      usernameForm: false,
    }
  },

  goBack: function() {
    this.props.navigator.pop();
  },

  showUrlForm: function() {
    this.setState({urlForm: true});
  },

  showUsernameForm: function() {
    this.setState({usernameForm: true});
  },

  render: function() {
    var url;
    if (this.state.urlForm) {
      urlForm = <SettingForm events={this.props.events} val={this.state.settings.url} setting={'url'} settings={this.state.settings} />;
    } else {
      urlForm = <View/>;
    }

    if (this.state.usernameForm) {
      usernameForm = <SettingForm events={this.props.events} val={this.state.settings.username} setting={'username'} settings={this.state.settings} />;
    } else {
      usernameForm = <View/>;
    }

    return (
      <View style={styles.container}>
        <ScrollView style={[styles.mainScroll]} automaticallyAdjustContentInsets={true} scrollEventThrottle={200} showsVerticalScrollIndicator={false}>

        <Button imageSrc={require('./img/arrow-left-icon.png')} onPress={this.goBack} imageStyle={styles.backImage} buttonType={styles.navButton} />


        <View style={styles.wrapper}>

          <Text style={styles.heading}>Send Data URL</Text>
          <View style={styles.hr}></View>

          <Text style={styles.whiteText}>{this.state.settings.url ? this.state.settings.url : 'No URL configured at this time.'}</Text>

          <View style={styles.wrapper}>
            <Button text={'Set URL'} onPress={this.showUrlForm} textType={styles.navText} buttonType={styles.navButton} />
            {urlForm}
          </View>

          <View style={styles.hr}></View>

          <Text style={styles.heading}>Username</Text>
          <View style={styles.hr}></View>

            <Text style={styles.whiteText}>{this.state.settings.username ? this.state.settings.username : 'No username configured at this time.'}</Text>

            <View style={styles.wrapper}>
              <Button text={'Set Username'} onPress={this.showUsernameForm} textType={styles.navText} buttonType={styles.navButton} />
              {usernameForm}
            </View>
          </View>
        </ScrollView>
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

  backButton: {
    borderColor: '#DFD9B9',
    borderRadius: 0,
    flexDirection: 'row'
  },

  backImage: {
    padding: 10,
    margin: 5
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

  whiteText: {
    color: '#DFD9B9',
    fontSize: 16
  }
})
