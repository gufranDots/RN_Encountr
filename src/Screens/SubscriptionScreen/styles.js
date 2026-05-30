import { Platform, StyleSheet } from 'react-native'
import { moderateScale, verticalScale, width } from '../../styles/responsiveSize'
import colors from '../../styles/colors'
// import commonStyles from '../../styles/commonStyles'
import { getTabBarColor } from '../../utils/subscriptionHelpers'
import fontFamily from '../../styles/fontFamily'
import { getColorCodeWithOpactiyNumberHASHES } from '../../utils/helperFunctions'

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  containerTab: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingTop: moderateScale(23)
  },
  descriptionText: { 
    // ...commonStyles.font_16_medium, 
    color: colors.darkBlack, lineHeight: moderateScale(30) },
  tabBar: {
    paddingTop: 0
  },
  tabItem: {
    alignItems: 'center',
    paddingVertical: moderateScale(8),
    paddingHorizontal: 0
  },
  cardStyle: {
    backgroundcolor: colors.darkBlackOpacity20,
    width: width / 3 - moderateScale(14),
    height: moderateScale(102),
    borderRadius: moderateScale(8),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2
  },
  absoluteTextStyle: {
    backgroundcolor: colors.darkBlack,
    paddingVertical: moderateScale(3),
    width: '80%',
    alignItems: 'center',
    borderRadius: moderateScale(8),
    position: 'absolute',
    top: -10,
    zIndex: 20
  },
  headerBgStyle:{
    paddingBottom: verticalScale(20), 
    paddingTop:verticalScale(48),
    flexDirection:'row',
    justifyContent:'center',
    // alignItems:'center',
    paddingHorizontal: verticalScale(4),
  },
  backBtnStyle:{
    borderWidth:0,
    justifyContent: Platform.OS == 'android'? 'flex-start' : 'center',
  },
  offerText: state => ({
    // ...commonStyles.font_12_medium,
    color: state.index === 0 ? '#000' : getTabBarColor(state.index)
  }),
  monthText: state => ({
    // ...commonStyles.font_12_regular,
    marginBottom: moderateScale(3),
    textTransform: 'capitalize'
  }),
  indicatorStyle: (state, TAB_MARGIN) => ({
    backgroundColor: getTabBarColor(state.index),
    height: moderateScale(37),
    left: TAB_MARGIN / 2,
    bottom: moderateScale(5),
    borderRadius: moderateScale(20)
  }),
  tabTitleStyle: focused => ({
    // ...commonStyles.font_12_medium,
    color: focused ? colors.black : colors.white
    // fontFamily: focused ? fontFamily.SemiBold : fontFamily.regular
  }),
  tabBarStyle: {
    backgroundColor: colors.tundora,
    borderRadius: moderateScale(30)
  },
  crossBtn: {
    height: moderateScale(40),
    width: moderateScale(40),
    backgroundColor: colors.blackOpacity10,
    // borderWidth: 1,
    // borderColor: colors.black,
    // borderRadius: moderateScale(12),
    justifyContent: 'center',
    alignItems: 'center'
    // marginLeft: moderateScale(20),
    // top: Platform.OS === 'ios' ? -moderateScale(28) : moderateScale(20)
    // top: DeviceInfo.hasNotch() ? -moderateScale(28) : moderateScale(28)
  },
  logoView: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Platform.OS === 'android' ? moderateScale(50) : moderateScale(80),
    marginTop: Platform.OS === 'android' ? moderateScale(40) : 0,
    width: '70%'
  },
  logoStyle: { height: moderateScale(82), width: moderateScale(152) },
  appLogoStyle: { height: '100%', width: '100%', resizeMode: 'contain' },
  bottomSheetNameText: {
    // ...commonStyles.font_12_regular,
    marginTop: moderateScale(24),
    marginBottom: moderateScale(33),
    lineHeight: moderateScale(18),
    textAlign: 'center',
    paddingHorizontal: moderateScale(22)
  },
  bottomSheetBtn: index => ({
    backgroundColor: getTabBarColor(index)
  }),
  currentPlanText: {
    // ...commonStyles.font_16_medium,
    marginTop: moderateScale(6),
    textAlign: 'center'
  },
  logoStyleView: {
    height: moderateScale(60),
    width: moderateScale(110),
    alignSelf: 'center'
  },
  bottomSheetStyle: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: moderateScale(20),
    borderTopRightRadius: moderateScale(20),
    borderWidth: 1,
    bordercolor: colors.blackOpacity20
  },
  bottomSheetView: {
    backgroundColor: '#1A1A1A',
    paddingTop: moderateScale(24),
    paddingBottom: moderateScale(32),
    paddingHorizontal: moderateScale(12)
  },
  tabContainer: {
    flex: 1,
    paddingBottom: moderateScale(32),
    // paddingHorizontal: moderateScale(24),
    backgroundColor: getColorCodeWithOpactiyNumberHASHES('#797979', 70)
  }
})

export default styles
