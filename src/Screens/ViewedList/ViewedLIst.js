import { View, Text, Image, TouchableOpacity, StyleSheet, RefreshControl, FlatList, Platform } from 'react-native';
import React, { useEffect, useState } from 'react';
import { HomeHeader, WrapperContainer } from '../../Components';
import CollapsibleHeader from '../../Components/CollapsibleHeader';
import {
  height,
  moderateScale,
  moderateScaleVertical,
  textScale,
} from '../../styles/responsiveSize';
import imagesPath from '../../constants/imagesPath';
import {
  getOtherProfileApi,
  getViewedList,
} from '../../redux/reduxActions/chatActions';
import colors from '../../styles/colors';
import fontFamily from '../../styles/fontFamily';
import { Loader } from '../../Components/Loader';
import { navigationString } from '../../constants';
import strings from '../../constants/Languages';
import CustomImage from '../../Components/CustomImage';
import Geocoder from 'react-native-geocoding';
import moment from 'moment';
import { useSelector } from 'react-redux';
import FastImage from '../../utils/FastImageCompat';
import { useTheme } from '../../theme/ThemeProvider';

const ViewedLIst = ({ navigation }) => {
  const {theme} = useTheme();
  const styles = getStyles(theme)
  const userData = useSelector(state => state?.authReducers?.userData || {});
  const [userlist, setUserList] = useState([]);
  const [count, setCount] = useState([]);
  const [isLoading, setisLoading] = useState(false);
  useEffect(() => {
    Geocoder.init('AIzaSyAbOOVcvW6QObCxDywVynr6vz6s5KuWzn0');
    getLIstOfUsersView();
  }, []);
  const getLIstOfUsersView = () => {
    setisLoading(true);
    getViewedList()
      .then(res => {
        setisLoading(false);
        setCount(res?.data?.count)
        fetchAddresses(res?.data?.list)

      })
      .catch(error => {
        console.log(error, 'getOtherProfileApiLIsttttttt');
      });
  };



  const fetchAddresses = async (dataArr) => {
    const updatedDataArr = await Promise.all(
      dataArr.map(async (item) => {
        const user = item.users;
        if (user?.latitude && user?.longitude) {
          try {
            const response = await Geocoder.from(user.latitude, user.longitude);
            const address = response.results[0].formatted_address;
            return {
              ...item,
              users: {
                ...user,
                address, // Add the address property
              },
            };
          } catch (error) {
            console.error('Error fetching address:', error);
            return item; // Return item as is if geocoding fails
          }
        }
        return item; // Return item as is if latitude/longitude is missing
      })
    );

    setUserList(updatedDataArr);
  };





// Haversine formula to calculate the great-circle distance between two points
const getDistance = (lat1, lon1, lat2, lon2) => {
  const toRadians = (degrees) => (degrees * Math.PI) / 180; // Convert degrees to radians
  
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distanceInKilometers = R * c; // Distance in kilometers
  const distanceInMiles = distanceInKilometers * 0.621371; // Convert to miles
  return distanceInMiles;
};

  const renderList = item => {

    const distance = getDistance(userData?.latitude, userData?.longitude, item?.users?.latitude, item?.users?.longitude);
    console.log(`The distance is ${distance.toFixed(2)} miles.`);
    console.log("item1212222222",userData?.latitude);
    console.log("item1212",item?.users?.latitude);
    
    const dateTimeString = moment(item?.updated_at).format("MMM DD YYYY"); // Adjust according to your data structure
    const dateTime = new Date(item?.updated_at);
    const formattedTime = dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }); // e.g., "04:44 PM"    
    return (
      <>
        {item?.users ? (
          <TouchableOpacity
            onPress={() => {
              navigation.navigate(navigationString.VIEWPROFILE, {
                prevScreenData: item?.users,
              })
            }}
            style={styles.listView}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', }}>


              <CustomImage
                source={item?.users?.profile_image ? { uri: item?.users?.profile_image } : imagesPath.drawerUserIcon}
                style={styles.userImg}
                imgLoaderStyle={styles.userImg}
              />
              <View style={{ flex: 0.5, marginLeft: moderateScale(16) }}>
                <Text
                  style={{
                    fontSize: textScale(20),
                    fontFamily: fontFamily.SemiBold,
                  }}>
                  {item?.users?.first_name}
                </Text>
              </View>
              <View style={{ flex: 0.4, marginLeft: moderateScale(16), alignItems: 'flex-end' }}>
                <Text
                  style={{
                    fontSize: textScale(12),
                    fontFamily: fontFamily.medium,
                  }}>
                  {dateTimeString}
                </Text>
                <Text
                  style={{
                    fontSize: textScale(12),
                    fontFamily: fontFamily.medium,
                  }}>
                  {formattedTime}
                </Text>
              </View>

            </View>
            <View style = {{width:"100%",marginLeft:moderateScale(20), flexDirection:'row',alignItems:'center'}}>
              <FastImage style = {{ 
                width:moderateScale(18), 
                height:moderateScale(18),
                transform: [{ rotate: '-40deg' }]
              }}
              resizeMode="contain"
               source={imagesPath.ic_sent}/>

            <Text style={{ marginTop: moderateScale(10), color: theme.colors.black, fontSize: moderateScale(15), fontFamily: fontFamily.bold }}>{distance.toFixed(2)} miles</Text>
            </View>
          </TouchableOpacity>
        ) : null}
      </>
    );
  };

  return (
    <WrapperContainer isSafeAreaAvailable={Platform.OS == 'ios'}>
      <HomeHeader
        leftIcon={imagesPath.backnew}
        onPressBack={() => navigation.goBack()}
        centerText={strings.UserViewedYourProfile}
        centertextstyle={{
          fontSize: textScale(20),
          marginLeft: moderateScale(10),
        }}
      />
      <View style={styles.countMainView}>
        <Image
          source={imagesPath.drawerUserIcon}
          style={{ height: moderateScaleVertical(34), width: moderateScale(34), tintColor: theme.colors.black }}
        />
        <View style={styles.countNumberView}>
          <Text>{count}</Text>
        </View>
      </View>

      {!!userlist && (
        <FlatList
        showsVerticalScrollIndicator={false}
        style={{ marginTop: moderateScaleVertical(20) }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        data={userlist}
        renderItem={({ item }) => renderList(item)}
        ListEmptyComponent={() => (
          <View style={styles.emptyVIew}>
              <Image source={imagesPath.sorry} style={styles.sorryImg} />
              <Text style={styles.sorryTxt}>{strings.SorryNoOneViewed}</Text>
            </View>
          )}
          refreshControl={
            <RefreshControl
            refreshing={isLoading }
            onRefresh={getLIstOfUsersView}
            />
          }
          />
        )}
        <Loader isLoading={isLoading} />
    </WrapperContainer>
  );
};

const getStyles = (theme) => StyleSheet.create({
  countMainView: {
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: theme.colors.grey,
    height: moderateScaleVertical(70),
    width: moderateScale(70),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: moderateScale(40),
  },
  countNumberView: {
    borderRadius: moderateScale(40),
    height: moderateScaleVertical(20),
    width: moderateScale(20),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.grey,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 1,
  },
  emptyVIew: {
    alignSelf: 'center',
    marginTop: moderateScaleVertical(height / 6),
  },
  sorryImg: {
    height: moderateScaleVertical(100),
    width: moderateScale(100),
    alignSelf: 'center',
  },
  sorryTxt: {
    fontSize: textScale(16),
    marginTop: moderateScaleVertical(6),
    color: theme.colors.black,
  },
  listView: {
    backgroundColor: theme.colors.white,
    padding: moderateScale(10),
    borderRadius: moderateScale(12),
    // flexDirection: 'row',
    alignItems: 'center',
    // justifyContent: 'space-evenly',
    borderWidth: 1,
    borderColor: theme.colors.grey,
  },
  userImg: {
    height: moderateScaleVertical(46),
    width: moderateScale(46),
    borderRadius: moderateScale(30),
  },
});

export default ViewedLIst;
