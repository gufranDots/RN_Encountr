
import React, { useState } from 'react'
import { WrapperContainer } from '../../Components'
import strings from '../../constants/Languages'
import WebView from 'react-native-webview'
import { Loader } from '../../Components/Loader'
import { API_BASE_URL } from '../../config/urls'
import { showError, showSuccess } from '../../utils/helperFunctions'
import { StyleSheet } from 'react-native'
import { saveBoomSubscription } from '../../redux/reduxActions/homeActions'

const BoomMe = ({ navigation, route }) => {
  const [loading, setLoading] = useState(true)
  let url = route?.params?.url;

  const onNavigationStateChange = (data) => {
    console.log("gugug",data);
    if (data.url.includes(`${API_BASE_URL}/payment-success`)) {
      saveSubscription()
      showSuccess(strings.Payment_Success)
      navigation.goBack();
    } else if (data.url.includes(`${API_BASE_URL}/payment-failed`)) {
      showError(strings.Payment_Cancel)
      navigation.goBack();
    }
  };

  const saveSubscription = () => {
    setLoading(true);
    saveBoomSubscription()
      .then(res => {
        console.log("response1415", res);
        setLoading(false);
      })
      .catch(error => {
        setLoading(false);
        // showError(ApiError(error));
      });
  };

  return (
    <WrapperContainer isSafeAreaAvailable={true}>
      <WebView
        source={{ uri: url }}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => {
          setTimeout(() => {
            setLoading(false)
          }, 1000)
        }}
        onNavigationStateChange={onNavigationStateChange}
        style={styles.mainContainer}
      />
      <Loader isLoading={loading} />
    </WrapperContainer>
  )
}

export default BoomMe
const styles = StyleSheet.create({
  mainContainer: {
    flex: 1
  }
})