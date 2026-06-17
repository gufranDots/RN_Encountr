import {
  FlatList,
  Image,
  Linking,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import WrapperContainer from '../../Components/WrapperContainer';
import HeaderComp from '../../Components/HeaderComp';
import imagesPath from '../../constants/imagesPath';
import colors from '../../styles/colors';
import {
  clearNotifications,
  getNotifications,
  saveAllHomeData,
  saveCountNotification,
} from '../../redux/reduxActions/authActions';
import { ApiError, showError } from '../../utils/helperFunctions';
import {
  moderateScale,
  moderateScaleVertical,
  textScale,
} from '../../styles/responsiveSize';
import ListEmptyComponent from '../../Components/ListEmptyComponent';
import { Loader } from '../../Components/Loader';
import { updateProfileApi } from '../../redux/reduxActions/profileActions';
import { useSelector } from 'react-redux';
import { saveUserData } from '../../redux/reduxReducers/authReducers';
import strings from '../../constants/Languages';
import { useTheme } from '../../theme/ThemeProvider';
import { getCommonStyles } from '../../styles/commonStyles';

const ContactScreen = props => {
  const {theme} =  useTheme();
  const commonStyles = getCommonStyles(theme);

  const { navigation } = props;
  const userData = useSelector(state => state?.authReducers?.userData || {});

  const [email, setEmail] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notifiList, setnotifiList] = useState([]);
  useEffect(() => {
    getNotifiationList();
  }, []);

  const updateProfile = () => {
    const apiData = {
      first_name: userData?.first_name,
      dob: userData?.dob,
      bio: userData?.bio,
      occupation: userData?.occupation,
      country: userData?.country,
      city: userData?.city,
      gender: userData?.gender || 1,
      church_name: userData?.church_name,
      church_role: userData?.church_role || '',
      body_type: userData?.body_type,
      highest_education: userData?.highest_education,
      looking_for: userData?.looking_for,
      height: userData?.height,
      preference: userData?.preference,
    };
    updateProfileApi(apiData)
      .then(res => {
        console.log(res, 'response from api ==>>>>>');
        saveUserData({ ...userData, is_notification_exist: false });
      })
      .catch(error => {
        console.log(error, 'ERRORRRR');
      });
  };




  const getNotifiationList = () => {
    setLoading(true);
    getNotifications()
      .then(res => {
        console.log(res, 'Gtetnotifications');
        setnotifiList(res?.data);
        setLoading(false);
        // setEmail(res?.data)
        // showSuccess(res?.message || '');
        // saveCountNotification(res?.data.length)
        // saveUserData({ ...userData, is_notification_exist: false })
        updateProfile();
      })
      .catch(error => {
        setLoading(false);
        console.log(error, 'erorrrrrrrrr');
        showError(ApiError(error));
      });
  };



  const getTimeDifference = (timestamp) => {
    const currentTime = new Date();
    const previousTime = new Date(timestamp);
    const difference = currentTime - previousTime;
    const minutes = Math.floor(difference / 60000); // 1 minute = 60000 milliseconds

    if (minutes < 1) {
      return 'Just now';
    } else if (minutes === 1) {
      return '1 minute ago';
    } else if (minutes < 60) {
      return `${minutes} minutes ago`;
    } else {
      const hours = Math.floor(minutes / 60);
      if (hours === 1) {
        return '1 hour ago';
      } else if (hours < 24) {
        return `${hours} hours ago`;
      } else {
        const days = Math.floor(hours / 24);
        if (days === 1) {
          return '1 day ago';
        } else {
          const date = new Date(timestamp);
          const day = date.getDate().toString().padStart(2, '0');
          const month = (date.getMonth() + 1).toString().padStart(2, '0');
          const year = date.getFullYear();
          return `${day}-${month}-${year}`;
          // return `${days} days ago`;
        }
      }
    }
  };



  const _renderItem = ({ item, index }) => {
    return (
      <View
        style={{
          width: "100%",
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: moderateScale(14),
          paddingHorizontal: moderateScale(10),
          borderWidth: 1,
          borderColor: theme.colors.grey12,
          borderRadius: moderateScale(12),
        }}>
        <View style={{
          width: "20%",
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.colors.lightWhite,
          width: moderateScale(40),
          height: moderateScale(40),
          borderRadius: moderateScale(30)
          
        }}>
          <Image
            source={imagesPath.notification}
            style={{
              height: moderateScale(24),
              resizeMode: 'contain',
              width: moderateScale(24),
            }}
          />
        </View>
        

        <View style = {{width:"80%"}}>
          <Text
            style={{
              flex: 1,
              ...commonStyles.font_14_regular,
              marginLeft: moderateScale(10),
              textTransform: 'capitalize',

            }}>
            {item?.message}
          </Text>
          <Text
            style={{
              flex: 1,
              ...commonStyles.font_14_SemiBold,
              marginLeft: moderateScale(10),
              textTransform: 'capitalize',
            }}>
            {getTimeDifference(item?.created_at)}
          </Text>

        </View>
      </View>
    );
  };

  const _listEmptyComponent = () => {
    return (
      <ListEmptyComponent
        icon={imagesPath.ic_empty_inbox}
        firstMessage="No Notifications"
      />
    );
  };

  const confirmClear = () => {
    setLoading(true);
    clearNotifications()
      .then(res => {
        console.log(res, 'clearnotiii');
        getNotifiationList()
        setLoading(false);
      })
      .catch(error => {
        setLoading(false);
        console.log(error, 'erorrrrrrrrr');
        showError(ApiError(error));
      });
  }
  const _onclear = () => {
    Alert.alert(
      strings.appName,
      'Are you sure to delete all the notifications?',
      [
        {
          text: 'Yes',
          onPress: () => {
            confirmClear();
          },
        },
        {
          text: 'No',
          style: 'destructive',
        },
      ],
    );

  }

  return (
    <WrapperContainer isSafeAreaAvailable={true}>
      <HeaderComp
        viewStyle={{ marginTop: Platform.OS === 'android' ? moderateScaleVertical(25) : 0 }}
        leftIcon={imagesPath.ic_back}
        onPressBack={() => navigation.goBack()}
        leftBackTxt={strings.notifications}
        rightText='Clear all'
        righttxtstyle={{ fontSize: textScale(14), color: theme.colors.red }}
        onPressRightText={_onclear}
      />
      <View
        style={{
          flex: 1,
        }}>
        <FlatList
          contentContainerStyle={{
            marginTop: moderateScaleVertical(18),
          }}
          ItemSeparatorComponent={() => (
            <View style={{ height: moderateScaleVertical(18) }} />
          )}
          data={notifiList}
          renderItem={_renderItem}
          ListEmptyComponent={_listEmptyComponent}
          showsVerticalScrollIndicator={false}
        />
      </View>
      <Loader isLoading={loading} />
    </WrapperContainer>
  );
};

export default ContactScreen;
