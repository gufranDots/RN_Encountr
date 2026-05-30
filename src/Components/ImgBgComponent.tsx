import React,{FC,ReactNode} from 'react'
import { ImageBackground, StyleSheet } from 'react-native'
import { verticalScale } from '../styles/responsiveSize';

interface ImgBgComponentProps {
    children: ReactNode;
    imgSource: object | number;
    bgImgtyle?: object
}

const ImgBgComponent:FC<ImgBgComponentProps> = ({ children, imgSource, bgImgtyle}) => {
  return (
    <ImageBackground source={imgSource} style={{...styles.imgStyle,...bgImgtyle}} >
         {children}
    </ImageBackground>
  )
}
const styles = StyleSheet.create({
    imgStyle:{
        paddingTop: verticalScale(58),
        paddingBottom: verticalScale(10),
        paddingHorizontal: verticalScale(20)
    }
})

export default React.memo(ImgBgComponent);