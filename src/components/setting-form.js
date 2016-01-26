var React = require('react-native');
var {
  View,
  Text,
  StyleSheet,
  TextInput
} = React;
var store = require('react-native-simple-store');

var Button = require('./button');
var Subscribable = require('Subscribable');

module.exports = React.createClass({
  mixins: [Subscribable.Mixin],

  getInitialState: function() {
    return {
      text: '',
    }
  },

  cancelSetting: function() {
    this.props.events.emit('cancel-' + this.props.setting);
  },

  saveSetting: function() {
    var settings = this.props.settings;
    settings[this.props.setting] = this.state.text;

    // Set the state and save the URL to storage.
    this.props.events.emit('new-settings', settings);
    store.save('settings', settings);
  },

  render: function() {
    return (
      <View style={styles.formElement}>
        <Text style={styles.label}>Enter {this.props.setting.charAt(0).toUpperCase() + this.props.setting.slice(1)}</Text>
        <TextInput style={styles.input} onChangeText={(text) => this.setState({text: text})} value={this.state.text} />
        <View style={styles.editButtons}>
          <Button text={'Save'} onPress={this.saveSetting} textType={styles.saveText} buttonType={styles.saveButton} />
          <Button text={'Cancel'} onPress={this.cancelSetting} />
        </View>
      </View>
    );
  }
})

var styles = StyleSheet.create({
  input: {
    padding: 4,
    height: 40,
    borderWidth: 1,
    borderColor: '#424242',
    borderRadius: 3,
    margin: 5,
    width: 200,
    alignSelf: 'center',
    color: '#424242'
  },

  formElement: {
    backgroundColor: '#DFD9B9',
    margin: 5,
  },

  label: {
    alignSelf: 'center',
    justifyContent: 'center',
    fontSize: 18,
    marginTop: 10,
  },

  restartButton: {
    borderColor: '#CE4B41',
  },

  restartText: {
    color: '#CE4B41',
  },

  saveButton: {
    borderColor: '#4D9E7E',
  },

  saveText: {
    color: '#4D9E7E',
  },

  editButtons: {
    flexDirection: 'row',
    flex: 2,
    alignSelf: 'center',
    justifyContent: 'center',
  },
})
