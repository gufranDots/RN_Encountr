import React, { useEffect, useState } from 'react'
import { View, Text } from 'react-native'
import AudioRecorderPlayer from 'react-native-audio-recorder-player'
import { enableFreeze } from 'react-native-screens'
import { useTheme } from '../../theme/ThemeProvider'
import { getCommonStyles } from '../../styles/commonStyles'
enableFreeze()
const AudioRecordScreen = () => {
  const {theme} = useTheme();
  const commonStyles = getCommonStyles(theme);  
  const audioRecorderPlayer = new AudioRecorderPlayer()

  const [state, setState] = useState({
    recordSecs: 0,
    recordTime: 0
  })

  const onStartRecord = async () => {
    const result = await audioRecorderPlayer.startRecorder()
    this.audioRecorderPlayer.addRecordBackListener(e => {
      setState({
        recordSecs: e.currentPosition,
        recordTime: audioRecorderPlayer.mmssss(Math.floor(e.currentPosition))
      })
    })
    console.log(result)
  }

  const onStopRecord = async () => {
    const result = await audioRecorderPlayer.stopRecorder()
    audioRecorderPlayer.removeRecordBackListener()
    setState({
      ...state,
      recordSecs: 0
    })
    console.log(result)
  }

  const onPausePlay = async () => {
    await audioRecorderPlayer.pausePlayer()
  }

  const onStopPlay = async () => {
    console.log('onStopPlay')
    audioRecorderPlayer.stopPlayer()
    audioRecorderPlayer.removePlayBackListener()
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text
        style={{ ...commonStyles.font_20_bold }}
        onPress={onStartRecord}>
        AudiRecord
      </Text>
    </View>
  )
}

export default AudioRecordScreen
