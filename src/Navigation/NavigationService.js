import { NavigationActions,CommonActions } from '@react-navigation/native'
import navigationString from '../constants/navigationString'

let _navigator

function setTopLevelNavigator (navigatorRef) {
  _navigator = navigatorRef
}

function navigate (routeName, params) {
  // _navigator.navigate(routeName, params)
}

function goBack () {
  _navigator.dispatch(NavigationActions.back())
}
function resetNavigation(routeName = navigationString.LOGINSCREEN, params) {
  const resetAction = CommonActions.reset({
  index: 0,
  routes: [{name: routeName, params}],
  });
  _navigator.dispatch(resetAction);
  }

export default {
  navigate,
  setTopLevelNavigator,
  goBack,
  resetNavigation
}
