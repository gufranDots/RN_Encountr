import { SafeAreaView, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { WrapperContainer } from '../../Components'
import { moderateScale, textScale } from '../../styles/responsiveSize'
import MapView, { Marker } from 'react-native-maps'
import imagesPath from '../../constants/imagesPath'
import HeaderComp from '../../Components/HeaderComp'
import strings from '../../constants/Languages'
import fontFamily from '../../styles/fontFamily'
import { socketRef } from '../../utils/utils'

const MapScreen = ({ navigation, route }) => {
    const { lat, long } = route?.params

    const [location, setLocation] = useState(route?.params)
    console.log("data", lat);
    const handleMapPress = () => {

    }
    // useEffect(() => {

        socketRef.on('trackLiveLocation', (response, err) => {
            console.log("trackLiveLocation??", response);

            setLocation(response)
            console.log("trackLiveLocation==", err);
          })
    // }, [])
    


    return (
        <WrapperContainer paddingAvailable={moderateScale(0)}>
            <HeaderComp
                leftIcon={imagesPath.ic_back}
                onPressBack={() => navigation.goBack()}
                leftIconStyle={{ marginLeft: moderateScale(10) }}
                centerText={strings.SelectLocation}
                centertextstyle={{ fontSize: textScale(18), fontFamily: fontFamily.bold }}
            />
            <MapView
                onPress={handleMapPress}
                scrollEnabled={true}
                style={{ flex: 1, }}
                initialRegion={{
                    latitude:location? Number(location?.lat): 25.7617,
                    longitude:location? Number(location?.long): 80.1918,
                    latitudeDelta: 0.0122,
                    longitudeDelta: 0.032,
                }}
                region={{
                    latitude:location? Number(location?.lat): 25.7617,
                    longitude:location? Number(location?.long): 80.1918,
                    latitudeDelta: 0.0122,
                    longitudeDelta: 0.032,
                }}
                showsUserLocation={false}
                showsMyLocationButton={true}
                >
                <Marker
                    coordinate={{
                        latitude:location? Number(location?.lat): 25.7617,
                        longitude:location? Number(location?.long): 80.1918,
                        latitudeDelta: 0.0122,
                        longitudeDelta: 0.032,
                    }}
                    image={imagesPath.icLocationNew}>
                </Marker>
            </MapView>
        </WrapperContainer>
    )
}

export default MapScreen

const styles = StyleSheet.create({})