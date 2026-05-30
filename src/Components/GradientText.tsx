import React, {FC} from 'react';
import {Text, View} from 'react-native';
import {LinearGradientText} from 'react-native-linear-gradient-text';
import colors from '../styles/colors';

interface GradientTextInterface {
  text?: string;
  textStyle?: object;
  start?: any;
  end?: any;
  colorArray?: string[];
}

const GradientText: FC<GradientTextInterface> = ({
  text = '',
  textStyle,
  start,
  end,
  colorArray = [colors.darkBlack, colors.darkBlack],
}) => {
  return (

    <Text style = {textStyle}>{text}</Text>
    // <LinearGradientText
    //   colors={colorArray}
    //   text={text}
    //   start={{x: 0, y: 0.7, ...start}}
    //   end={{x: 0.9, y: 1, ...end}}
    //   textStyle={textStyle}
    // />
  );
};

export default React.memo(GradientText);
