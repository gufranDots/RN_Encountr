//import liraries
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { WrapperContainer } from '../../Components';
import MapView, { Marker } from 'react-native-maps';
import BorderTextInput from '../../Components/BorderTextInput';
import imagesPath from '../../constants/imagesPath';
import colors from '../../styles/colors';
import {
  height,
  moderateScale,
  moderateScaleVertical,
  scale,
} from '../../styles/responsiveSize';

import fontFamily from '../../styles/fontFamily';
import ImageText from '../../Components/ImageText';
import { ScrollView } from 'react-native-gesture-handler';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import {
  chekLocationPermission,
  getCurrentLocation,
} from '../../utils/helperFunctions';
import { Loader } from '../../Components/Loader';
import ButtonComp from '../../Components/ButtonComp';
import strings from '../../constants/Languages';
import { navigationString } from '../../constants';
import { SafeAreaView } from 'react-native-safe-area-context';

// create a component
const Explore = ({ route }) => {
  // console.log(route, 'routerouterouteroute');
  const { updatedData } = route?.params;
  const navigation = useNavigation();
  const [location, setlocation] = useState([]);
  const [selected, setselected] = useState();
  const [inputValue, setinputValue] = useState('');
  const [locationObj, setlocationObj] = useState();
  const [isLoading, setLoading] = useState(true);
  const [addressDetail, setaddressDetail] = useState();
  const [addressDetail2, setaddressDetail2] = useState();
  const [id, setid] = useState();

  useFocusEffect(
    React.useCallback(() => {
      chekLocationPermission(true)
        .then(result => {
          console.log('Proper Result ' + result);

          if (result !== 'goback') {
            getCurrentLocation('home')
              .then(res => {
                console.log(res, 'ressss147');
                if (res) {
                  setlocationObj(res);
                  setid();
                }

                // console.log(locationObj, 'reshgssssjk');
              })
              .catch(err => {
                console.log('error raised', location);
              });
          }
        })
        .catch(error => console.log('error while accessing location', error));
    }, []),
  );

  const apiKey = 'AIzaSyAbOOVcvW6QObCxDywVynr6vz6s5KuWzn0';

  const onPressAddress = async e => {
    try {
      let res = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${e}&key=${apiKey}`,
        {
          method: 'GET',
        },
      );
      let response = await res?.json();
      console.log("gygygygyy", res);

      if (response) {
        setlocation(response?.predictions);
      }
    } catch (e) {
      console.log('erorr in goole place', e);
    }
  };

  const onPressSelected = async (id, region = true) => {
    // console.log(id, 'kmhjkn');
    if (!id || typeof id !== 'string') {
      console.log('Invalid address input');
      return;
    }
    try {
      let res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          id,
        )}&key=${apiKey}`,
        {
          method: 'GET',
        },
      );
      let response = await res.json();
      if (response && response?.results?.length > 0) {
        // console.log(response, 'locationresssssssdsfds');
        setaddressDetail(response?.results[0]?.geometry?.location);
        if (region) {
          setaddressDetail2(response?.results[0]?.geometry?.location);
        }
        sendlocation(response?.results[0]?.geometry?.location);
      }
    } catch (e) {
      console.log('erorr in goole place', e);
    }
  };

  const sendlocation = item => {
    {
      // console.log(item, 'itemm');
    }
    updatedData({
      lat: item?.lat,
      lng: item?.lng,
    });
  };
  const renderlocation = (item, index) => {
    return (
      <TouchableOpacity
        onPress={() => {
          setselected(item?.description);
          setlocation([]);
          setinputValue(item?.description);
          onPressSelected(item?.description);
        }}>
        <ImageText
          source={imagesPath?.newlocation}
          mainstyle={{
            alignItems: 'center',
            paddingVertical: moderateScaleVertical(12),
          }}
          text={item.description}
          txtstyle={{ fontSize: scale(16), color: colors.blackOpacity70 }}
        />
        {index != location.length - 1 && (
          <View style={{ height: 0.5, backgroundColor: colors.blackOpacity20 }} />
        )}
      </TouchableOpacity>
    );
  };

  const handleMapPress = async event => {
    const { coordinate } = event.nativeEvent;
    setaddressDetail({
      lat: coordinate?.latitude || 0,
      lng: coordinate?.longitude || 0,
    });
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coordinate?.latitude},${coordinate?.longitude}&key=${apiKey}`,
        { method: 'GET' },
      );
      let res = await response.json();
      if (res && res?.results.length > 0) {
        const address = res?.results[0]?.formatted_address;
        setselected(address);
        setlocation([]);
        setinputValue(address);
        onPressSelected(address, false);
      }
    } catch (error) {
      console.error('Error fetching location:', error);
    }
  };

  return (
    <SafeAreaView style={styles.mainContainer}>
      {!!locationObj && (
        <MapView
          onPress={handleMapPress}
          scrollEnabled={true}
          style={{
            ...StyleSheet.absoluteFillObject,
          }}
          region={{
            latitude: addressDetail2?.lat
              ? addressDetail2?.lat
              : locationObj?.latitude || 30.733315,
            longitude: addressDetail2?.lng
              ? addressDetail2?.lng
              : locationObj?.longitude || 76.779419,
            latitudeDelta: 0.015,
            longitudeDelta: 0.0121,
          }}
        // showsUserLocation={true}
        >
          {!!addressDetail?.lat ? (
            <Marker
              coordinate={{
                latitude: addressDetail?.lat || 30.733315,
                longitude: addressDetail?.lng || 76.779419,
                latitudeDelta: 0.0122,
                longitudeDelta: 0.032,
              }}
              image={imagesPath.explorehere}></Marker>
          ) : null}
        </MapView>
      )}

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: moderateScaleVertical(20),
        }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ flex: 0.06 }}>
          <Image
            source={imagesPath.backnew}
            style={{
              tintColor: colors.blackOpacity60,
              marginBottom: moderateScaleVertical(26),
            }}
          />
        </TouchableOpacity>

        <BorderTextInput
          value={inputValue}
          onChangeText={e => {
            onPressAddress(e);
            setinputValue(e);
          }}
          leftIcon={imagesPath.searchnew}
          placeholder="Search city zip code..."
          textInputStyle={{
            fontSize: scale(16),
            fontFamily: fontFamily.medium,
            color: colors.blackOpacity70,
          }}
          containerStyle={{
            backgroundColor: colors.white,
            borderRadius: moderateScale(30),
            minHeight: moderateScale(46),
            //   marginTop: moderateScaleVertical(20),
            marginBottom: moderateScale(30),
            flex: 1,
          }}
        />
      </View>
      {location?.length > 0 && (
        <View
          style={{
            backgroundColor: colors.white,
            paddingVertical: moderateScale(10),
            borderRadius: moderateScale(20),
            // height: height / 3.6,
          }}>
          {/* <ScrollView showsVerticalScrollIndicator={false}> */}
            {location.map((item, index) => {
              return renderlocation(item, index);
            })}
          {/* </ScrollView> */}
        </View>
      )}
      {!!selected ? (
        <ButtonComp
          btnText={strings.continue}
          btnStyle={{ width: '100%', marginTop: height / 1.35 }}
          onPressBtn={() => {
            let location = {
              latitude: addressDetail?.lat || 30.733315,
              longitude: addressDetail?.lng || 76.779419,
            };
            console.log('hhh', location);

            navigation.navigate(navigationString.HOME, {
              location: location,
            });
          }}
        />
      ) : null}
    </SafeAreaView>
  );
};

// define your styles
const styles = StyleSheet.create({
  mainContainer:{
    flex:1,
    paddingHorizontal: moderateScale(16)
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2c3e50',
  },
});

export default Explore;
