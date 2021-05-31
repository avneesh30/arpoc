import React, { Component } from 'react';
import { StyleSheet, ActivityIndicator, Text, View, Modal, TouchableOpacity, TouchableHighlight, Image, Alert, PermissionsAndroid, FlatList, ScrollView } from 'react-native';
import { ViroARSceneNavigator } from '@viro-community/react-viro';
import colors from './src/constants/colors';

import renderIf from './src/helpers/renderIf';
var InitialARScene = require('./src/screen/ARHitTestSample');

// Array of 3d models that we use in this sample. This app switches between this these models.
var objArray = [
  require('./src/res/coffee_mug/object_coffee_mug.vrx'),
  require('./src/res/object_flowers/object_flowers.vrx'),
  require('./src/res/emoji_smile/emoji_smile.vrx')];
const numOfColumns = 2;

export default class App extends React.PureComponent {

  constructor() {
    super();

    this._onShowObject = this._onShowObject.bind(this);
    this._renderTrackingText = this._renderTrackingText.bind(this);
    this._onTrackingInit = this._onTrackingInit.bind(this);
    this._onDisplayDialog = this._onDisplayDialog.bind(this);
    this._onLoadStart = this._onLoadStart.bind(this);
    this._onLoadEnd = this._onLoadEnd.bind(this);
    this._setARNavigatorRef = this._setARNavigatorRef.bind(this);
    // this.requestWriteAccessPermission = this.requestWriteAccessPermission.bind(this);
    this._takeScreenshot = this._takeScreenshot.bind(this);
    // this.requestReadAccessPermission = this.requestReadAccessPermission.bind(this);

    this.DATA = [
      { text: 'Coffee Mug', onPress: () => this._onShowObject(0, "coffee_mug", 0) },
      { text: 'Flowers', onPress: () => this._onShowObject(1, "flowers", .290760) },
      { text: 'Smile Emoji', onPress: () => this._onShowObject(2, "smile_emoji", .497823) },
      { text: 'Coffee Mug 2', onPress: () => this._onShowObject(0, "coffee_mug", 0) }
    ];

    this.state = {
      viroAppProps: { displayObject: false, objectSource: objArray[0], yOffset: 0, _onLoadEnd: this._onLoadEnd, _onLoadStart: this._onLoadStart, _onTrackingInit: this._onTrackingInit, index: 0 },
      trackingInitialized: false,
      isLoading: false,
      writeAccessPermission: false,
      screenshot_count: 0,
      visible: false
    }
  }

  _setARNavigatorRef(ARNavigator) {
    this._arNavigator = ARNavigator;
  }

  async requestWriteAccessPermission() {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          'title': 'write Permission',
          'message': 'App needs to access your photos / videos augmented scenes.'
        }
      )
      if (granted == PermissionsAndroid.RESULTS.GRANTED) {
        this.setState({
          writeAccessPermission: true,
        });
      } else {
        this.setState({
          writeAccessPermission: false,
        });
      }
    } catch (err) {
      console.warn("[PermissionsAndroid]" + err)
    }
  }

  async requestReadAccessPermission() {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        {
          'title': 'write Permission',
          'message': 'App needs to access your photos / videos augmented scenes.'
        }
      )
      if (granted == PermissionsAndroid.RESULTS.GRANTED) {
        this.setState({
          readAccessPermission: true,
        });
      } else {
        this.setState({
          readAccessPermission: false,
        });
      }
    } catch (err) {
      console.warn("[PermissionsAndroid]" + err)
    }
  }

  async _takeScreenshot() {
    // check for write permissions, if not then request
    if (!this.state.writeAccessPermission) {
      this.requestWriteAccessPermission();
    }else{
			this._takeScreenshotAfterPermission();
		}
		
  }

	async _takeScreenshotAfterPermission(){			
		
		await this._arNavigator._takeScreenshot(`ARimage_${Math.floor(Date.now() / 1000)}_${this.state.screenshot_count}`, true).then((retDict) => {
      if (retDict && !retDict.success) {
        Alert.alert("something went wrong please try again")
        return;
      }
      let currentCount = this.state.screenshot_count + 1;
      this.setState({
        videoUrl: "file://" + retDict.url,
        haveSavedMedia: false,
        playPreview: false,
        screenshot_count: currentCount,
      });
      Alert.alert("Successfully saved image.")
    });
	}

	formatData = (data, numOfColumns) => {
		const numberOfFullRows = Math.floor(data.length / numOfColumns);
	
		let numberOfElementLastRow = data.length - (numberOfFullRows * numOfColumns);
	
		while (numberOfElementLastRow !== numOfColumns && numberOfElementLastRow !== 0) {
		 data.push({ key: 'blank-' + { numberOfElementLastRow }, empty: true });
		 numberOfElementLastRow = numberOfElementLastRow + 1;
		}
		return data;
	 }

  render() {
    return (
      <View style={localStyles.outer} >
        <ViroARSceneNavigator
          style={localStyles.arView}
          ref={(c)=> this._arNavigator = c }
          apiKey="YOUR API KEY"
          initialScene={{ scene: InitialARScene }}
          viroAppProps={this.state.viroAppProps}
        />

        {this._renderTrackingText()}

        {renderIf(this.state.isLoading,
          <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size='large' animating={this.state.isLoading} color='#ffffff' />
          </View>)
        }

        <Modal
          animationType="slide"
          transparent={true}
          visible={this.state.visible}
          onRequestClose={() => { this.setState({ visible: false }) }}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <ScrollView style={{ width: '100%' }}>
                <FlatList 
								  data={this.DATA}
                  // data={this.formatData(this.DATA, numOfColumns)}
									numColumns={numOfColumns}
										renderItem={({ item, index, separators }) => (
											<View
												 style={[styles.itemContainer,{ 
												marginLeft: index %2 ==0 ? 10 :5,
												marginRight: index %2 ==0 ? 5 : 10,
												marginTop: index <= numOfColumns-1 ? 10 : 0	}]}>
											{/* <View style={styles.categoryItem}> */}
											{/* <View style={styles.item}> */}

												<TouchableOpacity onPress={() => {
													item.onPress()
													this.setState({ visible: false })
												}}>
													<View style={{flex: 1}}>													
															<View style={styles.shadowContainer}>
																<View style={styles.imageContainer}>
																	<Image style={styles.imageContainer}																
																		source={
																			item.text === 'Coffee Mug' ?
																			require("./src/res/img2.png")
																			: item.text === 'Flowers' ?
																			require("./src/res/img1.png")
																			: item.text === 'Smile Emoji' ?
																			require("./src/res/img3.png")
																			:
																			require("./src/res/img2.png")
																		}
																	/>
																</View>
															</View>
	
															<View style={styles.titleContainer}>
																<Text style={styles.title}>{item.text}</Text>
															</View>
														</View>
												</TouchableOpacity>
											</View>
											// </View>
										)}
                />
              </ScrollView>
            </View>
          </View>
        </Modal>

        <View style={{ position: 'absolute', left: 10, bottom: 77 }}>
          <TouchableHighlight style={localStyles.buttons}
            onPress={() => this.showDialog()}
            underlayColor={'#00000000'} >
            <Image source={require("./src/res/btn_mode_objects.png")} />
          </TouchableHighlight>
        </View>

        <View style={{ position: 'absolute', right: 10, bottom: 68 }}>
          <TouchableHighlight style={localStyles.buttons}
            onPress={() => this._takeScreenshot()}
            underlayColor={'#00000000'} >
            <Image source={require("./src/res/btn_camera.png")} />
          </TouchableHighlight>
        </View>
      </View>
    );
  }

  // Invoked when a model has started to load, we show a loading indictator.
  _onLoadStart() {
    this.setState({
      isLoading: true,
    });
  }

  // Invoked when a model has loaded, we hide the loading indictator.
  _onLoadEnd() {
    this.setState({
      isLoading: false,
    });
  }

  _renderTrackingText() {
    if (this.state.trackingInitialized) {
      return (<View style={{ position: 'absolute', backgroundColor: "#ffffff22", left: 30, right: 30, top: 30, alignItems: 'center' }}>
        <Text style={{ fontSize: 12, color: "#ffffff" }}>Tracking initialized.</Text>
      </View>);
    } else {
      return (<View style={{ position: 'absolute', backgroundColor: "#ffffff22", left: 30, right: 30, top: 30, alignItems: 'center' }}>
        <Text style={{ fontSize: 12, color: "#ffffff" }}>Waiting for tracking to initialize.</Text>
      </View>);
    }
  }

  _onTrackingInit() {
    this.setState({
      trackingInitialized: true,
    });
  }

  showDialog() {
    this.setState({ visible: true })
  };

  hideDialog() {
    this.setState({ visible: false })
  };

  _onDisplayDialog() {
    Alert.alert(
      'Choose an object',
      'Select an object to place in the world!',
      [
        { text: 'Coffee Mug', onPress: () => this._onShowObject(0, "coffee_mug", 0) },
        { text: 'Flowers', onPress: () => this._onShowObject(1, "flowers", .290760) },
        { text: 'Smile Emoji', onPress: () => this._onShowObject(2, "smile_emoji", .497823) },
        { text: 'Coffee Mug', onPress: () => this._onShowObject(0, "coffee_mug", 0) },
      ],
    );
  }

  _onShowObject(objIndex, objUniqueName, yOffset) {
    this.setState({
      viroAppProps: { ...this.state.viroAppProps, displayObject: true, yOffset: yOffset, displayObjectName: objUniqueName, objectSource: objArray[objIndex], index: objIndex },
    });
  }

}

const styles = StyleSheet.create({
  itemContainer: {
    backgroundColor: "#eee",
		flex: .5,
    marginVertical: 4,
    width: '100%',
    // borderBottomWidth: 1,
    // borderBottomColor: '#eee',
    // paddingHorizontal: 15,

		width: 120,
		// height: 150,		
		backgroundColor: colors.white,
		borderRadius:5,
		marginTop:5,
		marginBottom: 10,
  },
  header: {
    fontSize: 32,
    backgroundColor: "#fff"
  },
  
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
		width: '100%',
  },
  modalView: {
    width: '85%',
    height: 'auto',
		marginTop: 10,
		marginRight: 10,
    backgroundColor: colors.greyBorderColor,
    
    borderRadius: 5,
		alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2
  },
  buttonOpen: {
    backgroundColor: "#F194FF",
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center"
  },
	categoryItem: {
		// flex: 1,
		width: 120,
		height: 150,		
		marginBottom: 10,
		backgroundColor: colors.white,
		borderRadius:5,
		marginBottom: 10,
	},
	shadowContainer: {
		justifyContent: 'center',
		alignItems: 'center',
		// backgroundColor: '#f9f9f9',
		justifyContent: 'center',
		alignSelf: 'center',
		borderRadius: 5,
		height: 88,
		width: 88,
	},
	imageContainer: {
		height: 88,
		width: 88,
		resizeMode: 'contain',
		justifyContent: 'center',
		alignItems: 'center',
		alignSelf: 'center'
	},
	titleContainer: {
		flex:1,
		// position: 'absolute',
		marginTop: 15,
		justifyContent: 'center',
		alignItems: 'center',
		alignSelf: 'center'
	},
	title: {
    fontSize: 18, 
		paddingVertical: 5,
		justifyContent: "center",
    alignItems: "center",
		alignSelf: 'center'
  },	
});

var localStyles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: '#333'
  },

  arView: {
    flex: 1,
  },

  buttons: {
    height: 80,
    width: 80,
    paddingTop: 20,
    paddingBottom: 20,
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: '#00000000',    
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ffffff00',
  },
  cameraIcon: {
    position: 'absolute',
    height: 40,
    width: 40,
    top: 25,
    left: 25,
  },
});