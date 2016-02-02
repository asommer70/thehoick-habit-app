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
import Popup from 'react-native-popup';

module.exports = React.createClass({
  mixins: [Subscribable.Mixin],

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
      settings: {
        url: '',
        username: ''
      }
    }
  },

  goBack: function() {
    this.props.navigator.pop();
  },

  saveSettings: function() {
    store.save('settings', this.state.settings);

    // Empty habits get data from server.
    fetch(this.state.settings.url + '/' + this.state.settings.username)
      .then((response) => response.text())
      .then((responseText) => {

        var habits = JSON.parse(responseText).habits;
        store.save('habits', habits);

        // Tell the Habit component on Main that we have some Habits, and all the other components.
        this.props.events.emit('got-server-habits', habits);
        this.props.events.emit('got-habits', habits);
      })
      .catch((error) => {
        this.popup.alert('Problem with the URL you entered could not get data.');
      });

    this.props.events.emit('settings-saved', this.state.settings);
    this.popup.alert('Settings saved...');
  },

  render: function() {
    return (
      <View style={styles.container}>
        <ScrollView style={[styles.mainScroll]} automaticallyAdjustContentInsets={true} scrollEventThrottle={200} showsVerticalScrollIndicator={false}>

        <Button imageSrc={require('./img/arrow-left-icon.png')} onPress={this.goBack} imageStyle={styles.backImage} buttonType={styles.navButton} />


        <View style={styles.wrapper}>
          <View style={styles.formWrapper}>

            <View style={styles.formElement}>
              <Text style={styles.label}>Server URL:</Text>
              <TextInput
                style={styles.input}
                onChangeText={(text) => this.setState({settings: {url: text, username: this.state.settings.username}})}
                value={this.state.settings.url ? this.state.settings.url : ''} />
            </View>

            <View style={styles.formElement}>
              <Text style={styles.label}>Username:</Text>
              <TextInput
                style={styles.input}
                onChangeText={(text) => this.setState({settings: {username: text, url: this.state.settings.url}})}
                value={this.state.settings.username ? this.state.settings.username : ''} />
            </View>
          </View>

          <Button
            text={'Save'}
            imagePos={styles.rowButton}
            imageStyle={styles.saveImage}
            imageSrc={require('./img/save-icon.png')}
            onPress={this.saveSettings}
            textType={styles.saveText}
            buttonType={styles.saveButton} />
        </View>

        </ScrollView>
        <Popup ref={(popup) => { this.popup = popup }}/>
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
    alignSelf: 'center',
    flex: 1,
  },

  formWrapper: {
    backgroundColor: '#DFD9B9'
  },

  saveText: {
    color: '#DFD9B9',
    fontSize: 30
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

  saveButton: {
    borderColor: '#DFD9B9',
    borderRadius: 0,
  },

  rowButton: {
    flexDirection: 'row'
  },

  saveImage: {
    marginRight: 5
  },

  backImage: {
    padding: 10,
    margin: 5
  },

  input: {
    padding: 4,
    height: 40,
    borderWidth: 1,
    borderColor: '#424242',
    borderRadius: 3,
    margin: 5,
    width: 200,
    alignSelf: 'flex-end',
    color: '#424242'
  },

  formElement: {
    backgroundColor: '#DFD9B9',
    margin: 5,
    flexDirection: 'row'
  },

  label: {
    alignSelf: 'center',
    justifyContent: 'center',
    fontSize: 18,
    width: 90
  },
})
