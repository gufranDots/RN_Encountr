//import liraries
import React, {Component, useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import {WrapperContainer} from '../../Components';
import colors from '../../styles/colors';
import imagesPath from '../../constants/imagesPath';
import {
  moderateScale,
  moderateScaleVertical,
  textScale,
  width,
} from '../../styles/responsiveSize';
import {FlatList} from 'react-native-gesture-handler';
import ButtonComp from '../../Components/ButtonComp';
import {navigationString} from '../../constants';
import {getCommonStyles, hitSlopProp} from '../../styles/commonStyles';
import ModalNew from 'react-native-modal';
import strings from '../../constants/Languages';
import {Loader} from '../../Components/Loader';
import {
  addMembers,
  createGroup,
  resetGroupList,
  updateChatGroup,
  uploadGroupImg,
} from '../../redux/reduxActions/chatActions';
import {
  ApiError,
  selectSingleImage,
  showError,
  showSuccess,
} from '../../utils/helperFunctions';
import {requestCameraPermission} from '../../utils/miscellaneous';
import CustomImage from '../../Components/CustomImage';
import {checkIsEmpty} from '../../utils/validations';
import {useSelector} from 'react-redux';
import FastImage from '../../utils/FastImageCompat';
import { useTheme } from '../../theme/ThemeProvider';

// create a component
const CreateChatRoom = ({navigation, route}) => {
  const {theme} = useTheme();
  const commonStyles = getCommonStyles(theme);
  const styles = getStyles(theme, commonStyles)
  const {addMember, groupDetails} = route?.params;
  const [groupModal, setGroupModal] = useState(false);
  const [geographicScopeModal, setGeographicScopeModal] = useState(false);
  const [themeTopicModal, setThemeTopicModal] = useState(false);
  const [groupType, setGroupType] = useState([
    {name: strings.Public, value: 'public', id: 1},
    {name: strings.Private, value: 'private', id: 2},
  ]);
  const [selectedType, setSelectedType] = useState(groupType[0]);
  const [geographicScope, setGeographicScope] = useState([
    {name: 'Local', value: 'local', id: 1},
    {name: 'Regional', value: 'regional', id: 2},
    {name: 'National', value: 'national', id: 3},
    {name: 'Global', value: 'global', id: 4},
  ]);
  const [selectedGeographicScope, setSelectedGeographicScope] = useState();
  const [themesTopics, setThemesTopics] = useState([
    {name: 'Technology', value: 'technology', id: 1, selected: false},
    {name: 'Business', value: 'business', id: 2, selected: false},
    {name: 'Health & Fitness', value: 'health_fitness', id: 3, selected: false},
    {name: 'Education', value: 'education', id: 4, selected: false},
    {name: 'Entertainment', value: 'entertainment', id: 5, selected: false},
    {name: 'Sports', value: 'sports', id: 6, selected: false},
    {name: 'Travel', value: 'travel', id: 7, selected: false},
    {name: 'Food & Cooking', value: 'food_cooking', id: 8, selected: false},
    {name: 'Art & Culture', value: 'art_culture', id: 9, selected: false},
    {name: 'Science', value: 'science', id: 10, selected: false},
    {name: 'Politics', value: 'politics', id: 11, selected: false},
    {name: 'Environment', value: 'environment', id: 12, selected: false},
  ]);
  const [selectedThemesTopics, setSelectedThemesTopics] = useState([]);
  const [groupName, setGroupName] = useState(
    groupDetails?.group_name ? groupDetails?.group_name : '',
  );
  const [state, setState] = useState(
    groupDetails?.state ? groupDetails?.state : '',
  );
  const [city, setCity] = useState(
    groupDetails?.city ? groupDetails?.city : '',
  );
  const [description, setDescription] = useState(
    groupDetails?.description ? groupDetails?.description : '',
  );
  const [loading, setLoading] = useState(false);
  const groupUsers = useSelector(state => state?.homeReducers?.groupUsers);
  const [groupIcon, setGroupIcon] = useState(
    groupDetails?.group_image ? groupDetails?.group_image : '',
  );

  useEffect(() => {
    console.log('Geographic Scope Modal State:', geographicScopeModal);
  }, [geographicScopeModal]);

  const onChnageGroupType = option => {
    setSelectedType(option);
    setGroupModal(false);
  };

  const onChnageGeographicScope = option => {
    console.log('Changing geographic scope to:', option.name);
    setSelectedGeographicScope(option);
    setGeographicScopeModal(false);
  };

  const onToggleThemeTopic = option => {
    const updatedThemesTopics = themesTopics.map(item => {
      if (item.id === option.id) {
        return { ...item, selected: !item.selected };
      }
      return item;
    });
    setThemesTopics(updatedThemesTopics);
    
    const selectedItems = updatedThemesTopics.filter(item => item.selected);
    setSelectedThemesTopics(selectedItems);
  };

  const getSelectedThemesText = () => {
    if (selectedThemesTopics.length === 0) {
      return 'Select Theme/Topic';
    } else if (selectedThemesTopics.length === 1) {
      return selectedThemesTopics[0].name;
    } else {
      // Show the names of selected themes separated by commas
      return selectedThemesTopics.map(item => item.name).join(', ');
    }
  };

  const onGoLivePress = () => {
    let payload = {};
    if (addMember == 2) {
      let payload = {
        chat_conversation_id: groupDetails?.id,
        group_name: groupName,
        group_image: groupIcon,
      };
      // Validation: Check if group_name and group_image are not blank
      if (!payload.group_name.trim()) {
        // Display validation message for group_name
        // For example:
        showError('Group name is Empty');
        return; // Exit the function
      } else if (!payload.group_image) {
        showError('Group image is required');
        return; // Exit the function
      }else if (selectedThemesTopics.length === 0) {
        showError('Please select at least one theme/topic');
        return;
      }

      updateChatGroup(payload)
        .then(async res => {
          if (res?.data) {
            await resetGroupList();
            showSuccess(res?.message);
            navigation.navigate(navigationString.GROUP_LIVE_SCREEN, {});
            setLoading(false);
            return;
          }
          setLoading(false);
        })
        .catch(error => {
          setLoading(false);
          console.log('error while creating chat room', error);
          showError(ApiError(error));
        });
    } else {
      const filteredIds = [];
      for (const item of groupUsers) {
        if (item.id !== null) {
          filteredIds.push(item.id);
        }
      }
      if (addMember == 1) {
        if (filteredIds.length < 1) {
          showError(strings.Add_Members);
          return;
        }
      } else {
        if (groupIcon) {
          payload.group_image = groupIcon;
        }

        if (checkIsEmpty(groupName)) {
          showError(strings.Enter_Group);
          return;
        } else if (filteredIds.length < 1) {
          showError(strings.Add_Members);
          return;
        } else if (!groupIcon) {
          showError('Group image is required');
          return; // Exit the function
        } else if (!selectedGeographicScope) {
          showError('Please select a geographic scope');
          return;
        } else if (checkIsEmpty(state)) {
          showError('State is required');
          return;
        } else if (checkIsEmpty(city)) {
          showError('City is required');
          return;
        } else if (checkIsEmpty(description)) {
          showError('Description is required');
          return;
        } else if (selectedThemesTopics.length === 0) {
          showError('Please select at least one theme/topic');
          return;
        }
      }

      if (addMember == 1) {
        setLoading(false);
        setLoading(true);
        let payload = {
          group_id: groupDetails?.id,
          user_id: filteredIds,
        };
        addMembers(payload)
          .then(async res => {
            if (res?.data) {
              await resetGroupList();
              showSuccess(res?.message);
              navigation.navigate(navigationString.GROUP_LIVE_SCREEN, {
                addMember: addMember,
              });
              setLoading(false);
              return;
            }
            setLoading(false);
          })
          .catch(error => {
            setLoading(false);
            showError(ApiError(error));
          });
      } else {
        setLoading(true);
        payload.group_name = groupName;
        payload.user_id = filteredIds;
        payload.chat_type = selectedType?.value;
        payload.geographic_scope = selectedGeographicScope?.value;
        payload.state = state;
        payload.city = city;
        payload.description = description;
        payload.topics = selectedThemesTopics.map(item => item.value); 
        createGroup(payload)
          .then(async res => {
            if (res?.data) {
              await resetGroupList();
              showSuccess(res?.message);
              navigation.navigate(navigationString.GROUP_LIVE_SCREEN, {
                addMember: addMember,
              });
              setLoading(false);
              return;
            }
            setLoading(false);
          })
          .catch(error => {
            setLoading(false);
            console.log('error while creating chat room', error);
            showError(ApiError(error));
          });
      }
    }
  };
  const showAlert = () => {
    Alert.alert(
      '',
      'EXPLICIT CONTENT PROHIBITED',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel button pressed'),
          style: 'cancel',
        },
        {text: 'OK', onPress: _selectImage},
      ],
      {cancelable: true},
    );
  };

  const _selectImage = async () => {
    await requestCameraPermission().then(res => {
      selectSingleImage().then(res => {
        setLoading(true);
        saveImageApi(res);
      });
    });
  };

  const saveImageApi = data => {
    const _formData = new FormData();
    _formData.append('file', {
      uri: data?.path,
      name: 'image.png',
      fileName: 'filename',
      type: 'image/png',
    });

    uploadGroupImg(_formData)
      .then(res => {
        if (res?.data) {
          setGroupIcon(res?.data);
          setLoading(false);
        }
      })
      .catch(error => {
        setLoading(false);
        showError(ApiError(error));
      });
  };
  const addNewUser = () => {
    navigation.navigate(navigationString.ADD_CHAT_MEMBER, {
      groupData: {addMember: 0, groupDetails},
    });
  };

  const renderUserList = useCallback(
    ({item, index}) => {
      return (
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.userIconContainer}
          disabled={index == 0 ? false : true}
          onPress={() => addNewUser(item, index)}>
          {index == 0 ? (
            <Image source={item.image} style={styles.imgPlaceHolder} />
          ) : (
            <CustomImage
              source={{uri: item?.image}}
              style={styles.customImage}
              imgLoaderStyle={styles.customImage}
            />
          )}
        </TouchableOpacity>
      );
    },
    [groupUsers],
  );

  const onCrossIconPress = async () => {
    if (addMember != 1) {
      await resetGroupList();
    }
    navigation.goBack();
  };

  return (
    <WrapperContainer
      statusbarcolorr={theme.colors.themecolor2}
      mainViewStyle={{backgroundColor: theme.colors.themecolor2}}
      isSafeAreaAvailable>
      <View style={styles.headerContainer}>
        {addMember != 1 ? (
          <View style={styles.rowAligned}>
            {addMember != 2 ? (
              <TouchableOpacity activeOpacity={0.8} onPress={showAlert}>
                <CustomImage
                  source={groupIcon ? {uri: groupIcon} : imagesPath.demo}
                  style={styles.profileIcon}
                  imgLoaderStyle={styles.profileIcon}
                />
                <Image
                  source={imagesPath.editIcon}
                  style={styles.editIconStyle}
                />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity activeOpacity={0.8} onPress={_selectImage}>
                <FastImage
                  source={{uri: groupIcon}}
                  style={styles.profileIcon}
                  imgLoaderStyle={styles.profileIcon}
                />
                <FastImage
                  source={imagesPath.editIcon}
                  style={styles.editIconStyle}
                />
              </TouchableOpacity>
            )}
            {addMember != 2 ? (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setGroupModal(true)}
                style={styles.dropDownStyle}>
                <Image
                  source={
                    !!groupIcon ? {uri: groupIcon} : imagesPath.people_group
                  }
                />
                <Text
                  style={{
                    marginHorizontal: moderateScale(6),
                    fontSize: textScale(13),
                    color: theme.colors.activeTintColor,
                  }}>
                  {selectedType.name}
                </Text>
                <Image
                  source={imagesPath.ic_down}
                  style={styles.dropdownArrow}
                />
              </TouchableOpacity>
            ) : null}
          </View>
        ) : null}
        {addMember != 1 ? (
          <TouchableOpacity
            style={{alignItems: 'flex-end', flex: 1}}
            onPress={onCrossIconPress}>
            <Image
              source={imagesPath.ic_CrossIcon}
              style={styles.crossIconStyle}
            />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={{alignItems: 'flex-end', flex: 1}}
            onPress={onCrossIconPress}>
            <Image
              source={imagesPath.ic_CrossIcon}
              style={styles.crossIconStyle}
            />
          </TouchableOpacity>
        )}
      </View>
      {addMember != 1 ? (
        <TextInput
          placeholder="Add a title to the group"
          value={groupName}
          onChangeText={e => setGroupName(e)}
          style={styles.inputStyle}
          selectionColor={theme.colors.whiteOpacity40}
          placeholderTextColor={theme.colors.whiteOpacity40}
        />
      ) : null}
      {addMember != 1 ? (
        <View style={{height: 1.2, backgroundColor: theme.colors.whiteOpacity20}} />
      ) : null}
      {addMember != 1 && (
        <TextInput
          placeholder="Description"
          value={description}
          onChangeText={e => setDescription(e)}
          style={styles.inputStyle}
          selectionColor={theme.colors.whiteOpacity40}
          placeholderTextColor={theme.colors.whiteOpacity40}
        />
      )}
      {addMember != 1 ? (
        <View style={{height: 1.2, backgroundColor: theme.colors.whiteOpacity20}} />
      ) : null}
      {addMember != 1 ? (
        <View
          style={{
            // height: 1.2,
            // backgroundColor: colors.whiteOpacity20,
            marginVertical: moderateScaleVertical(12),
          }}
        />
      ) : null}
      {addMember != 1 && (
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <TextInput
            placeholder="City"
            value={city}
            onChangeText={e => setCity(e)}
            style={[styles.inputStyle, {marginTop: 0,width:'48%'}]}
            selectionColor={theme.colors.whiteOpacity40}
            placeholderTextColor={theme.colors.whiteOpacity40}
          />
          <TextInput
            placeholder="State"
            value={state}
            onChangeText={e => setState(e)}
            style={[styles.inputStyle, {marginTop: 0, width: '48%'}]}
            selectionColor={theme.colors.whiteOpacity40}
            placeholderTextColor={theme.colors.whiteOpacity40}
          />
        </View>
      )}
      {addMember != 1 ? (
        <View
          style={{
            height: 1.2,
            backgroundColor: theme.colors.whiteOpacity20,
            // marginVertical: moderateScaleVertical(12),
          }}
        />
      ) : null}
      
      {addMember != 1 ? <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => {
          setGeographicScopeModal(true);
        }}
        style={[
          styles.dropDownStyle,
          {
            marginLeft: 0,
            borderWidth: 0,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 0,
            marginTop: moderateScaleVertical(12),
          },
        ]}>
        {selectedGeographicScope?.name ? (
          <Text style={{fontSize: textScale(16), color: theme.colors.activeTintColor}}>{selectedGeographicScope?.name}</Text>
        ) : (
          <Text
            style={{
              // marginHorizontal: moderateScale(6),
              fontSize: textScale(18),
              color: theme.colors.whiteOpacity40,
            }}>
            Select Geographic Scope
          </Text>
        )}
        <Image source={imagesPath.ic_down} style={styles.dropdownArrow} />
      </TouchableOpacity> : null}
      {addMember != 1 ? <View style={{height: 1.2, backgroundColor: theme.colors.whiteOpacity20,marginVertical:moderateScaleVertical(12)}} /> : null}
      
      {addMember != 1 ? <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => {
          setThemeTopicModal(true);
        }}
        style={[
          styles.dropDownStyle,
          {
            marginLeft: 0,
            borderWidth: 0,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 0,
            marginTop: moderateScaleVertical(12),
          },
        ]}>
        <Text
          style={{
            fontSize: textScale(16),
            color: selectedThemesTopics.length > 0 ? theme.colors.activeTintColor : theme.colors.whiteOpacity40,
          }}>
          {getSelectedThemesText()}
        </Text>
        <Image source={imagesPath.ic_down} style={styles.dropdownArrow} />
      </TouchableOpacity> : null}
      {addMember != 1 ? <View style={{height: 1.2, backgroundColor: theme.colors.whiteOpacity20,marginVertical:moderateScaleVertical(12)}} /> : null}
      {addMember != 1 ? (
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          {addMember != 2 ? (
            <Image
              source={imagesPath.time}
              style={{
                height: moderateScaleVertical(16),
                width: moderateScale(16),
                tintColor: theme.colors.activeTintColor,
              }}
            />
          ) : null}
          {addMember != 2 ? (
            <Text
              style={{
                fontSize: textScale(14),
                color: theme.colors.activeTintColor,
                marginHorizontal: moderateScale(8),
              }}>
              {strings.Live_Now}
            </Text>
          ) : null}
        </View>
      ) : null}
      {addMember != 2 ? (
        <FlatList
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          numColumns={5}
          data={groupUsers}
          ItemSeparatorComponent={() => (
            <View style={{height: moderateScaleVertical(16)}} />
          )}
          renderItem={({item, index}) => renderUserList({item, index})}
        />
      ) : null}

      {addMember == 2 ? (
        <View style={{marginTop: moderateScale(150)}}></View>
      ) : null}

      <ButtonComp
        onPressBtn={onGoLivePress}
        btnView={styles.liveBtnStyle}
        txtStyle={{fontSize: textScale(16), color: theme.colors.activeTintColor}}
        btnStyle={styles.btnStyle}
        btnText={strings.GO_LIVE}
      />
      <ModalNew
        isVisible={groupModal}
        onBackdropPress={() => {
          setGroupModal(false);
        }}>
        <View style={styles.modalContainer}>
          {groupType.map(option => (
            <TouchableOpacity
              style={styles.renderView}
              activeOpacity={0.8}
              hitSlop={hitSlopProp}
              onPress={() => onChnageGroupType(option)}
              key={option.id}>
              <Image
                source={
                  selectedType?.id === option?.id
                    ? imagesPath.ic_filled_circle
                    : imagesPath.ic_unfilled_circle
                }
                style={styles.modaIcon}
              />
              <Text
                style={{
                  ...commonStyles.font_14_SemiBold,
                  color:
                    selectedType?.id === option?.id
                      ? theme.colors.florsentTheme
                      : theme.colors.darkBlack,
                }}>
                {option?.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ModalNew>

      <ModalNew
        isVisible={geographicScopeModal}
        onBackdropPress={() => {
          console.log('Geographic Scope Modal Backdrop Pressed');
          setGeographicScopeModal(false);
        }}
        style={{margin: 0, justifyContent: 'center', alignItems: 'center'}}>
        <View style={[styles.modalContainer, {zIndex: 9999}]}>
          {/* <Text
            style={{
              fontSize: textScale(16),
              fontWeight: 'bold',
              marginBottom: moderateScale(10),
              color: colors.darkBlack,
            }}>
            Select Geographic Scope
          </Text> */}
          {geographicScope.map(option => (
            <TouchableOpacity
              style={styles.renderView}
              activeOpacity={0.8}
              hitSlop={hitSlopProp}
              onPress={() => {
                console.log('Option selected:', option.name);
                onChnageGeographicScope(option);
              }}
              key={option.id}>
              <Image
                source={
                  selectedGeographicScope?.id === option?.id
                    ? imagesPath.ic_filled_circle
                    : imagesPath.ic_unfilled_circle
                }
                style={styles.modaIcon}
              />
              <Text
                style={{
                  ...commonStyles.font_14_SemiBold,
                  color:
                    selectedGeographicScope?.id === option?.id
                      ? theme.colors.themecolor2
                      : theme.colors.darkBlack,
                }}>
                {option?.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ModalNew>

      <ModalNew
        isVisible={themeTopicModal}
        onBackdropPress={() => {
          setThemeTopicModal(false);
        }}
        style={{margin: 0, justifyContent: 'center', alignItems: 'center'}}>
        <View style={[styles.modalContainer, {zIndex: 9999, maxHeight: '80%'}]}>
          {/* <Text
            style={{
              fontSize: textScale(16),
              fontWeight: 'bold',
              marginBottom: moderateScale(10),
              color: colors.darkBlack,
            }}>
            Select Theme/Topic (Multi-select)
          </Text> */}
          {themesTopics.map(option => (
            <TouchableOpacity
              style={styles.renderView}
              activeOpacity={0.8}
              hitSlop={hitSlopProp}
              onPress={() => onToggleThemeTopic(option)}
              key={option.id}>
              <Image
                source={
                  option.selected
                    ? imagesPath.ic_filled_circle
                    : imagesPath.ic_unfilled_circle
                }
                style={styles.modaIcon}
              />
              <Text
                style={{
                  ...commonStyles.font_14_SemiBold,
                  color: option.selected
                    ? theme.colors.florsentTheme
                    : theme.colors.black,
                }}>
                {option?.name}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[styles.renderView, {marginTop: moderateScale(10),justifyContent:'center',alignItems:'center'}]}
            activeOpacity={0.8}
            onPress={() => setThemeTopicModal(false)}>
            <Text
              style={{
                ...commonStyles.font_14_SemiBold,
                color: theme.colors.activeTintColor,
              }}>
              Done
            </Text>
          </TouchableOpacity>
        </View>
      </ModalNew>
      <Loader isLoading={loading} />
    </WrapperContainer>
  );
};

// define your styles
const getStyles =(theme, commonStyles) => StyleSheet.create({
  profileIcon: {
    height: moderateScale(50),
    width: moderateScale(50),
    resizeMode: 'contain',
    borderRadius: moderateScale(25),
  },
  renderView: {
    paddingVertical: moderateScale(16),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    paddingHorizontal: moderateScale(20),
  },
  modalContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: moderateScale(10),
    width: '65%',
    alignSelf: 'center',
  },
  modaIcon: {
    marginEnd: moderateScale(14),
    tintColor: theme.colors.florsentTheme,
    width: moderateScale(20),
    height: moderateScale(20),
  },
  liveBtnStyle: {
    borderRadius: moderateScale(40),
    height: moderateScaleVertical(44),
    marginTop: moderateScaleVertical(16),
    backgroundColor: theme.colors.white,
    position: 'absolute',
    bottom: 20,
  },
  btnStyle: {
    borderRadius: moderateScale(40),
    width: width / 2,
    alignSelf: 'center',
    marginTop: moderateScaleVertical(40),
  },
  editIconStyle: {
    height: moderateScaleVertical(20),
    width: moderateScale(20),
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: moderateScaleVertical(20),
  },
  rowAligned: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  dropDownStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: moderateScale(8),
    paddingHorizontal: moderateScale(12),
    borderRadius: moderateScale(30),
    borderWidth: 1,
    borderColor: theme.colors.activeTintColor,
    marginLeft: moderateScale(20),
  },
  dropdownArrow: {
    tintColor: theme.colors.white,
    width: moderateScaleVertical(10),
    height: moderateScaleVertical(10),
  },
  crossIconStyle: {
    backgroundColor: theme.colors.activeTintColor,
    tintColor: theme.colors.themecolor2,
    borderRadius: moderateScale(90),
    width: moderateScale(22),
    height: moderateScaleVertical(22),
    marginTop: moderateScaleVertical(20),
  },
  inputStyle: {
    ...commonStyles.font_20_SemiBold,
    marginTop: moderateScaleVertical(30),
    marginBottom: moderateScaleVertical(16),
    color: theme.colors.activeTintColor,
  },
  userIconContainer: {
    height: moderateScaleVertical(56),
    width: moderateScale(56),
    borderWidth: 1,
    borderColor: theme.colors.white,
    borderRadius: moderateScale(80),
    marginRight: moderateScaleVertical(16),
    backgroundColor: theme.colors.whiteOpacity20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingTop: moderateScaleVertical(84),
    paddingBottom: moderateScaleVertical(30),
  },
  imgPlaceHolder: {
    height: moderateScale(20),
    width: moderateScale(20),
    resizeMode: 'contain',
  },
  customImage: {
    height: moderateScaleVertical(56),
    width: moderateScale(56),
    resizeMode: 'contain',
  },
});

//make this component available to the app
export default CreateChatRoom;
