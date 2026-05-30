// import liraries
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import HeaderComp from '../../Components/HeaderComp';
import { Loader } from '../../Components/Loader';
import WrapperContainer from '../../Components/WrapperContainer';
import imagesPath from '../../constants/imagesPath';
import strings from '../../constants/Languages';
import { changeNotificationApi } from '../../redux/reduxActions/profileActions';
import {getCommonStyles} from '../../styles/commonStyles';
import { moderateScale, textScale, moderateScaleVertical } from '../../styles/responsiveSize';
import { ApiError, showError, showSuccess } from '../../utils/helperFunctions';
import { enableFreeze } from 'react-native-screens';
import fontFamily from '../../styles/fontFamily';
import { Switch } from 'react-native-switch';
import reduxActions from '../../redux/reduxActions';
import { setTheme } from '../../redux/reduxReducers/themeReducers';
import { useTheme } from '../../theme/ThemeProvider';

enableFreeze();
const ProfilePermissions = ({ navigation }) => {
    const {theme} = useTheme();
    const dispatch = useDispatch();
    const commonStyles = getCommonStyles(theme);
    const styles = getStyles(theme, commonStyles);
    const userData = useSelector(state => state?.authReducers?.userData || {});
    const mode = useSelector(state => state?.themeReducers?.mode);
    const [isLoading, setLoading] = useState(false);
    const isDarkModeEnabled = mode === 'dark';

    const [notificationEnabled, setIsNotificationEnabled] = useState(userData?.isNotified === 1);
    const [showMyAge, setshowMyAge] = useState(userData?.is_age == 0 || null ? false : true);
    const [showMyWeight, setShowMyWeight] = useState(userData?.is_weight_visible == 0 || null ? false : true);
    const [showMyLocation, setshowMyLocation] = useState(userData?.is_location == 0 || null ? false : true);
    const [according, setAccording] = useState(userData?.is_bio_visible == 0 || null ? false : true);
    const [height, setHeight] = useState(userData?.is_height_visible == 0 || null ? false : true);
    const [bodyType, setBodyType] = useState(userData?.is_body_type_visible == 0 || null ? false : true);
    const [lookingFor, setLookingFor] = useState(userData?.is_looking_for_visible == 0 || null ? false : true);
    const [relationStatus, setRelationStatus] = useState(userData?.is_relationship_status_visible == 0 || null ? false : true);
    const [facbookLink, setFacbookLink] = useState(userData?.is_facebook_link_visible == 0 || null ? false : true);
    const [instagramLink, setInstagramLink] = useState(userData?.is_instagram_link_visible == 0 || null ? false : true);
    const [twitterLink, setTwitterLink] = useState(userData?.is_twitter_link_visible == 0 || null ? false : true);
    const [linkedinLink, setLinkedinLink] = useState(userData?.is_linkedin_link_visible == 0 || null ? false : true);
    const [hivStatus, setHivStatus] = useState(userData?.is_hiv_status_visible == 0 || null ? false : true);
    const [lastTested, setLastTested] = useState(userData?.is_last_tested_visible == 0 || null ? false : true);
    const [vaccinationsStatus, setVaccinationsStatus] = useState(userData?.is_vaccinations_visible == 0 || null ? false : true);
    const [privateGallery, setPrivateGallery] = useState(userData?.is_private_gallery_visible == 0 || null ? false : true);
    const [gallery, setGallery] = useState(userData?.is_gallery_visible == 0 || null ? false : true);
    const [position, setPosition] = useState(userData?.is_position_visible == 0 || null ? false : true);
    
    const [tribes, setTribes] = useState(userData?.is_tribes_visible == 0 || null ? false : true);
    
    const [meetAt, setMeetAt] = useState(userData?.is_meet_at_visible == 0 || null ? false : true);
    const [nsfw, setnsfw] = useState(userData?.is_nsfw_visible == 0 || null ? false : true);
    const [expectations, setExpectations] = useState(userData?.is_expectations_visible == 0 || null ? false : true);


    const _changeNotification = () => {
        const apiData = {
            is_notify: userData?.isNotified == 0 ? 1 : 0,
        };
        setIsNotificationEnabled(!notificationEnabled);
        changeNotificationApi(apiData)
            .then(() => {
            })
            .catch(error => {
                showError(ApiError(error));
            });
    };

    const onToggleDarkMode = (value) => {
        dispatch(setTheme(value ? 'dark' : 'system'));
    };

    const changeAgeStatus = () => {
        reduxActions
            .changeLocationStatus({ type: 'Age', is_age: !showMyAge })
            .then(res => {
                if (res?.success == true) {
                    reduxActions.updateAgeStatus(!showMyAge);
                    setshowMyAge(!showMyAge);
                    showSuccess(res?.message);
                }
            })
            .catch(error => {
                showError(ApiError(error));
            });
    };

    const changeWeightStatus = () => {
        reduxActions
            .changeWeightStatus({ is_weight_visible: !showMyWeight })
            .then(res => {
                if (res?.success) {
                    reduxActions.updateWeightStatus(!showMyWeight);
                    setShowMyWeight(!showMyWeight);
                    showSuccess(res?.message);
                }
            })
            .catch(error => {
                showError(ApiError(error));
            });
    };



    const changeLocationStatus = (params) => {
        reduxActions
            .changeLocationStatus(params)
            .then(res => {
                if (res?.success == true) {
                    reduxActions.updateLocationStatus(!showMyLocation);
                    showSuccess(res?.message);
                }
            })
            .catch(error => {
                showError(ApiError(error));
            });
    };

    return (
        console.log("userData?.is_hiv_status_visible",userData?.is_hiv_status_visible),
        
        <WrapperContainer isSafeAreaAvailable={true}>
            <HeaderComp
                leftIcon={imagesPath.ic_back}
                onPressBack={() => navigation.goBack()}
                centerText={strings.PROFILE_PERMISSIONS}
                centertextstyle={{ fontSize: textScale(18), fontFamily: fontFamily.bold }}
            />

            <Text
                style={{
                    marginTop: moderateScaleVertical(22),
                    marginBottom: moderateScaleVertical(8),
                    ...commonStyles.font_12_SemiBold,
                    color: theme.colors.blackOpacity50,
                }}>
                {strings.PERMISSIONS}
            </Text>

            <View style={styles.mainView}>
                <ScrollView showsVerticalScrollIndicator={false}>

                    <View style={styles.containerTopredies}>
                        <View style={styles.pushView}>
                            <Image
                                source={imagesPath.notificationew}
                                style={styles.pushIcon}
                            />
                            <Text style={styles.pushNotification}>
                                {strings.PushNotification}
                            </Text>
                        </View>
                        <Switch
                            onValueChange={_changeNotification}
                            value={notificationEnabled}
                            circleSize={20}
                            backgroundActive={theme.colors.themecolor2}
                            backgroundInactive={theme.colors.lightgreynew}
                            circleInActiveColor={theme.colors.toggle}
                            renderActiveText={false}
                            renderInActiveText={false}
                        />

                    </View>

                    <View
                        style={styles.lineStyle}
                    />
                    <View style={styles.container}>
                        <View style={styles.pushView}>
                            <Image
                                source={imagesPath.themeIcon}
                                style={styles.pushIcon}
                            />
                            <Text style={styles.pushNotification}>
                                {strings.darkMode}
                            </Text>
                        </View>
                        <Switch
                            onValueChange={onToggleDarkMode}
                            value={isDarkModeEnabled}
                            circleSize={20}
                            backgroundActive={theme.colors.themecolor2}
                            backgroundInactive={theme.colors.lightgreynew}
                            circleInActiveColor={theme.colors.toggle}
                            renderActiveText={false}
                            renderInActiveText={false}
                        />
                    </View>

                    <View
                        style={styles.lineStyle}
                    />
                    <View style={styles.container}>
                        <View style={styles.pushView}>
                            <Image source={imagesPath.calendarF} style={styles.pushIcon} />
                            <Text style={styles.pushNotification}>{strings.Show_My_Age}</Text>
                        </View>
                        <Switch
                            onValueChange={changeAgeStatus}
                            value={showMyAge}
                            circleSize={20}
                            backgroundActive={theme.colors.themecolor2}
                            backgroundInactive={theme.colors.lightgreynew}
                            circleInActiveColor={theme.colors.toggle}
                            renderActiveText={false}
                            renderInActiveText={false}
                        />
                    </View>

                    <View
                        style={styles.lineStyle}
                    />

                    <View style={styles.container}>
                        <View style={styles.pushView}>
                            <Image source={imagesPath.weight} style={styles.pushIcon} />
                            <Text style={styles.pushNotification}>
                                {strings.Show_My_Weight}
                            </Text>
                        </View>
                        <Switch
                            onValueChange={changeWeightStatus}
                            value={showMyWeight}
                            circleSize={20}
                            backgroundActive={theme.colors.themecolor2}
                            backgroundInactive={theme.colors.lightgreynew}
                            circleInActiveColor={theme.colors.toggle}
                            renderActiveText={false}
                            renderInActiveText={false}
                        />
                    </View>

                    <View
                        style={styles.lineStyle}
                    />

                    <View
                        style={styles.lineStyle}
                    />
                    <View style={styles.container}>
                        <View style={styles.pushView}>
                            <Image source={imagesPath.location} style={styles.newlocation} />
                            <Text style={styles.pushNotification}>
                                {strings.Show_My_Location}
                            </Text>
                        </View>
                        <Switch
                            onValueChange={() => {
                                changeLocationStatus({ type: "Location", is_location: !showMyLocation })
                                setshowMyLocation(!showMyLocation);
                            }}
                            value={showMyLocation}
                            circleSize={20}
                            backgroundActive={theme.colors.themecolor2}
                            backgroundInactive={theme.colors.lightgreynew}
                            circleInActiveColor={theme.colors.toggle}
                            renderActiveText={false}
                            renderInActiveText={false}
                        />
                    </View>
                    <View
                        style={styles.lineStyle}
                    />

                    {/* ACCORDING_TO_ME */}
                    <View>
                        <View style={styles.container}>
                            <View style={styles.pushView}>
                                <Image source={imagesPath.location} style={styles.newlocation} />
                                <Text style={styles.pushNotification}>
                                    {strings.ACCORDING_TO_ME}
                                </Text>
                            </View>
                            <Switch
                                onValueChange={() => {
                                    changeLocationStatus({ type: "according_to_me", is_bio_visible: !according })
                                    setAccording(!according)
                                    // reduxActions.updateAccordingStatus(!according);
                                }}
                                value={according}
                                circleSize={20}
                                backgroundActive={theme.colors.themecolor2}
                                backgroundInactive={theme.colors.lightgreynew}
                                circleInActiveColor={theme.colors.toggle}
                                renderActiveText={false}
                                renderInActiveText={false}
                            />
                        </View>
                        <View
                            style={styles.lineStyle}
                        />
                    </View>


                    {/* height */}

                    <View>
                        <View style={styles.container}>
                            <View style={styles.pushView}>
                                <Image source={imagesPath.location} style={styles.newlocation} />
                                <Text style={styles.pushNotification}>
                                    {strings.height}
                                </Text>
                            </View>
                            <Switch
                                onValueChange={() => {
                                    changeLocationStatus({ type: "height", is_height_visible: !height })
                                    setHeight(!height)
                                }}
                                value={height}
                                circleSize={20}
                                backgroundActive={theme.colors.themecolor2}
                                backgroundInactive={theme.colors.lightgreynew}
                                circleInActiveColor={theme.colors.toggle}
                                renderActiveText={false}
                                renderInActiveText={false}
                            />
                        </View>
                        <View
                            style={styles.lineStyle}
                        />
                    </View>


                    {/* body_type */}


                    <View>
                        <View style={styles.container}>
                            <View style={styles.pushView}>
                                <Image source={imagesPath.location} style={styles.newlocation} />
                                <Text style={styles.pushNotification}>
                                    {strings.bodyType}
                                </Text>
                            </View>
                            <Switch
                                onValueChange={() => {
                                    changeLocationStatus({ type: "body_type", is_body_type_visible: !bodyType })
                                    setBodyType(!bodyType)
                                }}
                                value={bodyType}
                                circleSize={20}
                                backgroundActive={theme.colors.themecolor2}
                                backgroundInactive={theme.colors.lightgreynew}
                                circleInActiveColor={theme.colors.toggle}
                                renderActiveText={false}
                                renderInActiveText={false}
                            />
                        </View>
                        <View
                            style={styles.lineStyle}
                        />
                    </View>


                    {/* looking_for */}
                    <View>
                        <View style={styles.container}>
                            <View style={styles.pushView}>
                                <Image source={imagesPath.location} style={styles.newlocation} />
                                <Text style={styles.pushNotification}>
                                    {strings.LOOKING_FOR}
                                </Text>
                            </View>
                            <Switch
                                onValueChange={() => {
                                    changeLocationStatus({ type: "looking_for", is_looking_for_visible: !lookingFor })
                                    setLookingFor(!lookingFor)
                                }}
                                value={lookingFor}
                                circleSize={20}
                                backgroundActive={theme.colors.themecolor2}
                                backgroundInactive={theme.colors.lightgreynew}
                                circleInActiveColor={theme.colors.toggle}
                                renderActiveText={false}
                                renderInActiveText={false}
                            />
                        </View>
                        <View
                            style={styles.lineStyle}
                        />
                    </View>


                    {/* looking_for */}
                    <View>
                        <View style={styles.container}>
                            <View style={styles.pushView}>
                                <Image source={imagesPath.location} style={styles.newlocation} />
                                <Text style={styles.pushNotification}>
                                    {"Preferences"}
                                </Text>
                            </View>
                            <Switch
                                onValueChange={() => {
                                    changeLocationStatus({ type: "position", is_position_visible: !position })
                                    setPosition(!position)
                                }}
                                value={position}
                                circleSize={20}
                                backgroundActive={theme.colors.themecolor2}
                                backgroundInactive={theme.colors.lightgreynew}
                                circleInActiveColor={theme.colors.toggle}
                                renderActiveText={false}
                                renderInActiveText={false}
                            />
                        </View>
                        <View
                            style={styles.lineStyle}
                        />
                    </View>

                    {/* relationship_status */}


                    <View>
                        <View style={styles.container}>
                            <View style={styles.pushView}>
                                <Image source={imagesPath.location} style={styles.newlocation} />
                                <Text style={styles.pushNotification}>
                                    {strings.relationShipStatus}
                                </Text>
                            </View>
                            <Switch
                                onValueChange={() => {
                                    changeLocationStatus({ type: "relationship_status", is_relationship_status_visible: !relationStatus })
                                    setRelationStatus(!relationStatus)
                                }}
                                value={relationStatus}
                                circleSize={20}
                                backgroundActive={theme.colors.themecolor2}
                                backgroundInactive={theme.colors.lightgreynew}
                                circleInActiveColor={theme.colors.toggle}
                                renderActiveText={false}
                                renderInActiveText={false}
                            />
                        </View>
                        <View
                            style={styles.lineStyle}
                        />
                    </View>


                    {/* facebook_link */}



                    <View>
                        <View style={styles.container}>
                            <View style={styles.pushView}>
                                <Image source={imagesPath.location} style={styles.newlocation} />
                                <Text style={styles.pushNotification}>
                                    {strings.facebook_Link}
                                </Text>
                            </View>
                            <Switch
                                onValueChange={() => {
                                    changeLocationStatus({ type: "facebook_link", is_facebook_link_visible: !facbookLink })
                                    setFacbookLink(!facbookLink)
                                }}
                                value={facbookLink}
                                circleSize={20}
                                backgroundActive={theme.colors.themecolor2}
                                backgroundInactive={theme.colors.lightgreynew}
                                circleInActiveColor={theme.colors.toggle}
                                renderActiveText={false}
                                renderInActiveText={false}
                            />
                        </View>
                        <View
                            style={styles.lineStyle}
                        />
                    </View>


                    {/* instagram_link */}

                    <View>
                        <View style={styles.container}>
                            <View style={styles.pushView}>
                                <Image source={imagesPath.location} style={styles.newlocation} />
                                <Text style={styles.pushNotification}>
                                    {strings.instagram_Link}
                                </Text>
                            </View>
                            <Switch
                                onValueChange={() => {
                                    changeLocationStatus({ type: "instagram_link", is_instagram_link_visible: !instagramLink })
                                    setInstagramLink(!instagramLink)
                                }}
                                value={instagramLink}
                                circleSize={20}
                                backgroundActive={theme.colors.themecolor2}
                                backgroundInactive={theme.colors.lightgreynew}
                                circleInActiveColor={theme.colors.toggle}
                                renderActiveText={false}
                                renderInActiveText={false}
                            />
                        </View>
                        <View
                            style={styles.lineStyle}
                        />
                    </View>

                    {/* linkedin_link */}
                    <View>
                        <View style={styles.container}>
                            <View style={styles.pushView}>
                                <Image source={imagesPath.location} style={styles.newlocation} />
                                <Text style={styles.pushNotification}>
                                    {strings.LINKEDIN_LINK}
                                </Text>
                            </View>
                            <Switch
                                onValueChange={() => {
                                    changeLocationStatus({ type: "linkedin_link", is_linkedin_link_visible: !linkedinLink })
                                    setLinkedinLink(!linkedinLink)
                                }}
                                value={linkedinLink}
                                circleSize={20}
                                backgroundActive={theme.colors.themecolor2}
                                backgroundInactive={theme.colors.lightgreynew}
                                circleInActiveColor={theme.colors.toggle}
                                renderActiveText={false}
                                renderInActiveText={false}
                            />
                        </View>
                        <View
                            style={styles.lineStyle}
                        />
                    </View>



                    {/* twitter_link */}
                    <View>
                        <View style={styles.container}>
                            <View style={styles.pushView}>
                                <Image source={imagesPath.location} style={styles.newlocation} />
                                <Text style={styles.pushNotification}>
                                    {strings.twitter_Link}
                                </Text>
                            </View>
                            <Switch
                                onValueChange={() => {
                                    changeLocationStatus({ type: "twitter_link", is_twitter_link_visible: !twitterLink })
                                    setTwitterLink(!twitterLink)
                                }}
                                value={twitterLink}
                                circleSize={20}
                                backgroundActive={theme.colors.themecolor2}
                                backgroundInactive={theme.colors.lightgreynew}
                                circleInActiveColor={theme.colors.toggle}
                                renderActiveText={false}
                                renderInActiveText={false}
                            />
                        </View>
                        <View
                            style={styles.lineStyle}
                        />
                    </View>


                    {/* hiv_status */}
                    <View>
                        <View style={styles.container}>
                            <View style={styles.pushView}>
                                <Image source={imagesPath.location} style={styles.newlocation} />
                                <Text style={styles.pushNotification}>
                                    {strings.HIV_STATUS}
                                </Text>
                            </View>
                            <Switch
                                onValueChange={() => {
                                    changeLocationStatus({ type: "hiv_status", is_hiv_status_visible: !hivStatus })
                                    setHivStatus(!hivStatus)
                                }}
                                value={hivStatus}
                                circleSize={20}
                                backgroundActive={theme.colors.themecolor2}
                                backgroundInactive={theme.colors.lightgreynew}
                                circleInActiveColor={theme.colors.toggle}
                                renderActiveText={false}
                                renderInActiveText={false}
                            />
                        </View>
                        <View
                            style={styles.lineStyle}
                        />
                    </View>


                    {/* tribes */}
                    <View>
                        <View style={styles.container}>
                            <View style={styles.pushView}>
                                <Image source={imagesPath.location} style={styles.newlocation} />
                                <Text style={styles.pushNotification}>Tribes</Text>
                            </View>
                            <Switch
                                onValueChange={() => {
                                    changeLocationStatus({ type: "tribes", is_tribes_visible: !tribes })
                                    setTribes(!tribes)
                                }}
                                value={tribes}
                                circleSize={20}
                                backgroundActive={theme.colors.themecolor2}
                                backgroundInactive={theme.colors.lightgreynew}
                                circleInActiveColor={theme.colors.toggle}
                                renderActiveText={false}
                                renderInActiveText={false}
                            />
                        </View>
                        <View
                            style={styles.lineStyle}
                        />
                    </View>


                    {/* Meet at */}
                    <View>
                        <View style={styles.container}>
                            <View style={styles.pushView}>
                                <Image source={imagesPath.location} style={styles.newlocation} />
                                <Text style={styles.pushNotification}>Meet at</Text>
                            </View>
                            <Switch
                                onValueChange={() => {
                                    changeLocationStatus({ type: "meet_at", is_meet_at_visible: !meetAt })
                                    setMeetAt(!meetAt)
                                }}
                                value={meetAt}
                                circleSize={20}
                                backgroundActive={theme.colors.themecolor2}
                                backgroundInactive={theme.colors.lightgreynew}
                                circleInActiveColor={theme.colors.toggle}
                                renderActiveText={false}
                                renderInActiveText={false}
                            />
                        </View>
                        <View
                            style={styles.lineStyle}
                        />
                    </View>


                    {/* Accept NSFW Pics */}
                    <View>
                        <View style={styles.container}>
                            <View style={styles.pushView}>
                                <Image source={imagesPath.location} style={styles.newlocation} />
                                <Text style={styles.pushNotification}>Accept NSFW Pics</Text>
                            </View>
                            <Switch
                                onValueChange={() => {
                                    changeLocationStatus({ type: "nsfw", is_nsfw_visible: !nsfw })
                                    setnsfw(!nsfw)
                                }}
                                value={nsfw}
                                circleSize={20}
                                backgroundActive={theme.colors.themecolor2}
                                backgroundInactive={theme.colors.lightgreynew}
                                circleInActiveColor={theme.colors.toggle}
                                renderActiveText={false}
                                renderInActiveText={false}
                            />
                        </View>
                        <View
                            style={styles.lineStyle}
                        />
                    </View>


                    {/* expectations */}
                    <View>
                        <View style={styles.container}>
                            <View style={styles.pushView}>
                                <Image source={imagesPath.location} style={styles.newlocation} />
                                <Text style={styles.pushNotification}>Expectations</Text>
                            </View>
                            <Switch
                                onValueChange={() => {
                                    changeLocationStatus({ type: "expectations", is_expectations_visible: !expectations })
                                    setExpectations(!expectations)
                                }}
                                value={expectations}
                                circleSize={20}
                                backgroundActive={theme.colors.themecolor2}
                                backgroundInactive={theme.colors.lightgreynew}
                                circleInActiveColor={theme.colors.toggle}
                                renderActiveText={false}
                                renderInActiveText={false}
                            />
                        </View>
                        <View
                            style={styles.lineStyle}
                        />
                    </View>


                    {/* last_tested */}
                    <View>
                        <View style={styles.container}>
                            <View style={styles.pushView}>
                                <Image source={imagesPath.location} style={styles.newlocation} />
                                <Text style={styles.pushNotification}>
                                    {strings.LAST_TESTED}
                                </Text>
                            </View>
                            <Switch
                                onValueChange={() => {
                                    changeLocationStatus({ type: "last_tested", is_last_tested_visible: !lastTested })
                                    setLastTested(!lastTested)
                                }}
                                value={lastTested}
                                circleSize={20}
                                backgroundActive={theme.colors.themecolor2}
                                backgroundInactive={theme.colors.lightgreynew}
                                circleInActiveColor={theme.colors.toggle}
                                renderActiveText={false}
                                renderInActiveText={false}
                            />
                        </View>
                        <View
                            style={styles.lineStyle}
                        />
                    </View>


                    {/* vaccinations */}
                    <View>
                        <View style={styles.container}>
                            <View style={styles.pushView}>
                                <Image source={imagesPath.location} style={styles.newlocation} />
                                <Text style={styles.pushNotification}>
                                    {strings.VACCINATIONS}
                                </Text>
                            </View>
                            <Switch
                                onValueChange={() => {
                                    changeLocationStatus({ type: "vaccinations", is_vaccinations_visible: !vaccinationsStatus })
                                    setVaccinationsStatus(!vaccinationsStatus)
                                }}
                                value={vaccinationsStatus}
                                circleSize={20}
                                backgroundActive={theme.colors.themecolor2}
                                backgroundInactive={theme.colors.lightgreynew}
                                circleInActiveColor={theme.colors.toggle}
                                renderActiveText={false}
                                renderInActiveText={false}
                            />
                        </View>
                        <View
                            style={styles.lineStyle}
                        />
                    </View>



                    {/* private_gallery */}
                    <View>
                        <View style={styles.container}>
                            <View style={styles.pushView}>
                                <Image source={imagesPath.location} style={styles.newlocation} />
                                <Text style={styles.pushNotification}>
                                    {strings.privateGallery}
                                </Text>
                            </View>
                            <Switch
                                onValueChange={() => {
                                    changeLocationStatus({ type: "private_gallery", is_private_gallery_visible: !privateGallery })
                                    setPrivateGallery(!privateGallery)
                                }}
                                value={privateGallery}
                                circleSize={20}
                                backgroundActive={theme.colors.themecolor2}
                                backgroundInactive={theme.colors.lightgreynew}
                                circleInActiveColor={theme.colors.toggle}
                                renderActiveText={false}
                                renderInActiveText={false}
                            />
                        </View>
                        <View
                            style={styles.lineStyle}
                        />
                    </View>

                    {/* Gallery */}
                    <View>
                        <View style={[styles.container,{borderBottomLeftRadius:moderateScale(20), borderBottomRightRadius:moderateScale(20)}]}>
                            <View style={styles.pushView}>
                                <Image source={imagesPath.location} style={styles.newlocation} />
                                <Text style={styles.pushNotification}>
                                    {strings.Gallery}
                                </Text>
                            </View>
                            <Switch
                                onValueChange={() => {
                                    changeLocationStatus({ type: "gallery", is_gallery_visible: !gallery })
                                    setGallery(!gallery)
                                }}
                                value={gallery}
                                circleSize={20}
                                backgroundActive={theme.colors.themecolor2}
                                backgroundInactive={theme.colors.lightgreynew}
                                circleInActiveColor={theme.colors.toggle}
                                renderActiveText={false}
                                renderInActiveText={false}
                            />
                        </View>
                    
                    </View>



                </ScrollView>
            </View>
            <Loader isLoading={isLoading} />
        </WrapperContainer>
    );
};

// define your styles
const getStyles = (theme, commonStyles) => StyleSheet.create({
    mainView: {
        flex: 0.95,
        justifyContent: 'space-between',
        borderRadius: 40,
    },
    container: {
        height: moderateScale(58),
        padding: moderateScale(16),
        marginTop: moderateScale(0),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: theme.colors.lightGray,
    },
    containerTopredies: {
        height: moderateScale(58),
        padding: moderateScale(16),
        marginTop: moderateScale(0),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: theme.colors.lightGray,
        borderTopLeftRadius: moderateScale(10),
        borderTopRightRadius: moderateScale(10)
    },
    pushView: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    pushIcon: {
        width: moderateScale(20),
        height: moderateScale(20),
        marginRight: moderateScale(10),
        tintColor: theme.colors.black,
    },
    newlocation: {
        width: moderateScale(20),
        height: moderateScale(20),
        marginRight: moderateScale(10),
        tintColor: theme.colors.black,
    },
    pushNotification: {
        ...commonStyles.font_16_medium,
        color: theme.colors.black,
    },
    lineStyle:{
        height: 0.7,
        backgroundColor: theme.colors.grey,
        marginHorizontal: moderateScale(16),
    }
});

export default ProfilePermissions;

