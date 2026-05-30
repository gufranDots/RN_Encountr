import { useIsFocused } from '@react-navigation/native'
import React, { useEffect, useLayoutEffect, useState } from 'react'
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { useSelector } from 'react-redux'
import RNFetchBlob from 'rn-fetch-blob'

import ButtonComp from '../../Components/ButtonComp'
import HeaderComp from '../../Components/HeaderComp'
import { Loader } from '../../Components/Loader'
import WrapperContainer from '../../Components/WrapperContainer'
import imagesPath from '../../constants/imagesPath'
import strings from '../../constants/Languages'
import navigationString from '../../constants/navigationString'
import {
  getDatingTags,
  saveDatingTagsApi
} from '../../redux/reduxActions/authActions'
import colors from '../../styles/colors'
import { moderateScale } from '../../styles/responsiveSize'
import { ApiError, showError, showSuccess } from '../../utils/helperFunctions'
import { getItem, removeItem, setItem } from '../../utils/utils'
import AddMediaScreen from '../AddMediaScreen/AddMediaScreen'
import { getCommonStyles } from '../../styles/commonStyles'

const SelectTags = props => {
  const { navigation } = props
  const {theme} = useTheme();
  const commonStyles = getCommonStyles(theme);
  const styles = getStyles(theme, commonStyles);

  const userData = useSelector(state => state?.authReducers?.userData || {})
  const isFocused = useIsFocused()

  const [isLoading, setLoading] = useState(true)
  const [tags, setTags] = useState([])

  const fs = RNFetchBlob.fs
  let imagePath = null

  // useEffect(() => {
  //   _convertImageToBase64()
  // }, [])

  useLayoutEffect(() => {
    // if (Array.isArray(userData?.tags) && userData && userData?.tags.length > 1) {
    //   navigation.navigate(navigationString.ADDMEDIASCREEN)
    // } else {
    _convertImageToBase64()
    _getAllTags()
    // }
  }, [isFocused])

  const _convertImageToBase64 = async () => {
    const base64Image = await getItem('PROFILE_BASE_64')
    console.log(base64Image, 'base64Imagebase64Image')
    if (base64Image != null) {
      return
    }
    console.log(base64Image, 'base64Imagebase64Image 122222')

    RNFetchBlob.config({
      fileCache: true
    })
      .fetch('GET', userData?.profile_image)
      .then(resp => {
        imagePath = resp.path()
        return resp.readFile('base64')
      })
      .then(base64Data => {
        console.log(base64Data, 'fcdd ojkjkjk')
        setItem('PROFILE_BASE_64', base64Data)
        return fs.unlink(imagePath)
      })
  }

  const _getAllTags = () => {
    getDatingTags()
      .then(res => {
        const tagsArr = res?.data
        if (Array.isArray(tagsArr) && tagsArr && tagsArr.length > 0) {
          const _arr = tagsArr.map((it, id) => {
            return { ...it, isSelected: false }
          })
          setTags(_arr)
        }
        setLoading(false)
      })
      .catch(error => {
        setLoading(false)
      })
  }

  const _onSelectTags = (item, index) => {
    const _arr = tags.map((it, ind) => {
      if (it.id == item.id) {
        it.isSelected = !it.isSelected
      }
      return it
    })
    setTags(_arr)
  }

  const _onContinue = () => {

    const _selectedTags = tags.map(item => {
      if (item?.isSelected) {
        return item.id
      }
    })
    const _filterSelectedTags = _selectedTags.filter(item => item)

    if (_filterSelectedTags && _filterSelectedTags.length === 0) {
      return showError(strings.pleaseselectatleastonetag)
    }

    const apiData = new FormData()
    apiData.append('tags', _filterSelectedTags)
    
    setLoading(true)
    saveDatingTagsApi(apiData)
      .then(res => {
        // showSuccess(res?.message)
        setLoading(false)
        if(Array.isArray(userData?.photos) && userData && userData?.photos.length > 1){
          navigation.navigate(navigationString.ADDMEDIASCREEN)
        }
        else{
          navigation.navigate(navigationString.ADDMEDIASCREEN)
        }
      })
      .catch(error => {
        console.log(error,'errrrrrrr');
        setLoading(false)
        showError(ApiError(error))
      })
  }

  return (
    <WrapperContainer paddingAvailable={false}>
      <Text style={styles.heading}>{"Interests"}</Text>
      <Text style={styles.subHeading}>
        {strings.Selectyourtagsfrombelowsuggestions}
      </Text>

      <View style={styles.tagMainView}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contStyles}>
          <View style={styles.cellView}>
            {tags.map((item, index) => (
              <TouchableOpacity
                key={item.toString() + index.toString()}
                style={{
                  backgroundColor: item?.isSelected
                    ? theme.colors.lightPinkOpacity50
                    : theme.colors.skyblueOpacity50,
                  ...styles.cell
                }}
                activeOpacity={0.9}
                onPress={() => _onSelectTags(item, index)}>
                <Text
                  style={{
                    ...styles.tagText,
                    color: item?.isSelected ? theme.colors.white : theme.colors.black
                  }}>
                  {item?.tag_name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <ButtonComp
        btnStyle={styles.btnStyle}
        btnText={strings.continue}
        onPressBtn={_onContinue}
      />

      <Loader isLoading={isLoading} />
    </WrapperContainer>
  )
}

const getStyles = (theme, commonStyles) => StyleSheet.create({
  tagMainView: {
    flex: 0.94
  },
  heading: {
    ...commonStyles.font_32_bold,
    marginHorizontal: moderateScale(16),
    // color: colors.themecolor2,
    marginTop: moderateScale(6)
  },
  subHeading: {
    ...commonStyles.font_12_SemiBold,
    marginTop: moderateScale(8),
    marginHorizontal: moderateScale(16),
    color: theme.colors.likePink
  },
  btnStyle: {
    paddingHorizontal: moderateScale(20)
  },
  cellView: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: moderateScale(10)
  },
  cell: {
    borderRadius: moderateScale(6),
    marginTop: moderateScale(8),
    alignSelf: 'flex-start',
    marginStart: moderateScale(8)
  },
  tagText: {
    ...commonStyles.font_12_SemiBold,
    margin: moderateScale(12)
  },
  contStyles: {
    paddingBottom: moderateScale(60)
  }
})

export default SelectTags
