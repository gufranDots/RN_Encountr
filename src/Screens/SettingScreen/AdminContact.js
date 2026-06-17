import React, { useEffect, useState } from 'react';
import { Image, Platform, StyleSheet, Text, View } from 'react-native';
import { WrapperContainer } from '../../Components';
import HeaderComp from '../../Components/HeaderComp';
import imagesPath from '../../constants/imagesPath';
import { moderateScale, moderateScaleVertical, textScale } from '../../styles/responsiveSize';
import strings from '../../constants/Languages';
import fontFamily from '../../styles/fontFamily';
import { getSupportData } from '../../redux/reduxActions/homeActions';
import colors from '../../styles/colors';
import { useTheme } from '../../theme/ThemeProvider';

const AdminContact = ({ navigation }) => {
  const {theme} = useTheme();
  const styles = getStyles(theme)
  const [supportData, setSupportData] = useState({});

  useEffect(() => {
    getCount();
  }, []);

  const getCount = async () => {
    try {
      const res = await getSupportData();
      setSupportData(res?.data);
    } catch (error) {
      console.log('error=>', error);
    }
  };

  const ContactInfo = ({ icon, info }) => (
    <View style={styles.contactContainer}>
      <View style={styles.iconContainer}>
        <Image style={styles.icon} source={icon} />
      </View>
      <Text style={styles.infoText}>{info}</Text>
    </View>
  );

  return (
    <WrapperContainer isSafeAreaAvailable={true}>
      <HeaderComp
        viewStyle={{ marginTop: Platform.OS === 'android' ? moderateScaleVertical(25) : 0 }}
        leftIcon={imagesPath.ic_back}
        onPressBack={() => navigation.goBack()}
        centerText={strings.Contactus}
        centertextstyle={styles.headerText}
      />

      <View>
        <ContactInfo icon={imagesPath.ic_call} info={supportData?.phone} />
        <ContactInfo icon={imagesPath.drawerUserIcon} info={supportData?.email} />
      </View>
    </WrapperContainer>
  );
};

export default AdminContact;

const getStyles = (theme) => StyleSheet.create({
  headerText: {
    fontSize: textScale(18),
    fontFamily: fontFamily.bold,
  },
  contactContainer: {
    flexDirection: 'row',
    marginTop: moderateScale(10),
    alignItems: 'center',
    backgroundColor: theme.colors.lightGray,
    padding: moderateScale(10),
    borderRadius: moderateScale(10),
  },
  iconContainer: {
    padding: moderateScale(5),
    borderRadius: moderateScale(10),
  },
  icon: {
    width: moderateScale(24),
    height: moderateScale(24),
    tintColor: theme.colors.black
  },
  infoText: {
    color: theme.colors.black,
    fontSize: moderateScale(20),
    marginLeft: moderateScale(20),
    fontFamily:fontFamily.SemiBold
  },
});
