var React = require('react-native');
var {
  Text,
  View,
  StyleSheet,
  ListView
} = React;
var store = require('react-native-simple-store');
var Subscribable = require('Subscribable');

var Button = require('./button');

module.exports = React.createClass({
  mixins: [Subscribable.Mixin],

  componentDidMount: function() {
    // Actually need to get Reminders from whatever mechanism the devices uses.
    // If ios...
    // If android...
    // Get Reminders from storage.
    store.get('reminders').then((data) => {
      this.setState({reminders: data, dataSource: this.state.dataSource.cloneWithRows(data)})
    });
  },

  getInitialState: function() {
    var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

    return {
      reminders: [],
      dataSource: ds.cloneWithRows([]),
    }
  },

  render: function() {
    return (
      <ListView
        dataSource={this.state.dataSource}
        renderRow={(rowData, sectionId, rowId) =>
          <View style={styles.habits}>
            <View style={styles.habitInfo}>
              <Text style={styles.habitText}>{rowData.name ? rowData.name : ''}</Text>
              <LinkCount days={rowData.days} linkCountStyle={styles.linkCountText} events={this.props.events}/>
            </View>

            <View style={styles.habitButtons}>
              <Button text={'Restart Chain'} onPress={() => this.restartHabit(rowId)} textType={styles.restartText} buttonType={styles.restartButton} />
              <Button text={'Delete'} onPress={() => this.deleteHabit(rowId)} textType={styles.deleteText} buttonType={styles.deleteButton} />
            </View>
          </View>
        }
      />
    )
  }
});
