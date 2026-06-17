import React, { FC } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import strings from '../constants/Languages';
import colors from '../styles/colors';
import { getCommonStyles, hitSlopProp } from '../styles/commonStyles';
import { ChatInputComponent } from './ChatComponents';
import { useTheme } from '../theme/ThemeProvider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from '../styles/responsiveSize';

interface ChatInputToolBarType {
    sender_id: any
    isBlocked: boolean
    AskToBlockUnblock: () => void
    areYouBlocked: boolean
    onChangeInputText: () => void
    onSend: () => void
    onSendLiveLocation: () => void
    textValue: string
    onPressVoice: () => void
    onStartRecAudio: () => void
    onStopRecAudio: () => void
    onCancelRecAudio?: () => void
    onSendImage: () => void
    onSendCameraImage: () => void
    disabled: boolean
    subscriptionId: any
    roomData:any
    publicRoom:any
    onEndEditing: () => void
    chatId?: string
    onDraftLoaded?: (draftText: string) => void
    messages?: any[]
    userData?: any
    onResendPhoto?: (photo: any) => void
    currentLoc: {lat: number; lng: number}
    mapRegion: {
        latitude: number
        longitude: number
        latitudeDelta: number
        longitudeDelta: number
    }
    setMapRegion: (region: {
        latitude: number
        longitude: number
        latitudeDelta: number
        longitudeDelta: number
    }) => void
    hasActiveReply?: boolean
}

const ChatInputToolBar: FC<ChatInputToolBarType> = ({
    sender_id,
    isBlocked,
    AskToBlockUnblock,
    areYouBlocked,
    onChangeInputText,
    onSend,
    onSendLiveLocation,
    textValue,
    onStartRecAudio,
    onStopRecAudio,
    onCancelRecAudio,
    onSendImage,
    onSendCameraImage,
    disabled,
    roomData,
    publicRoom,
    subscriptionId,
    onEndEditing,
    chatId,
    onDraftLoaded,
    messages,
    userData,
    onResendPhoto,
    currentLoc,
    mapRegion,
    setMapRegion,
    hasActiveReply = false,
}) => {
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    const commonStyles = getCommonStyles(theme);
    const blockedViewStyle = {
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
        width: '100%' as const,
        paddingHorizontal: moderateScale(16),
        marginBottom: Math.max(insets.bottom, moderateScale(16)),
        paddingBottom: moderateScale(8),
    };
    return (
        isBlocked
            ? <TouchableOpacity
                style={blockedViewStyle}
                onPress={AskToBlockUnblock}
                hitSlop={hitSlopProp}
                activeOpacity={0.8}
            >
                <Text style={{
                    ...commonStyles.font_18_regular,
                    textAlign: 'center',
                    color: theme.colors.black,
                }}>{strings.youHaveBlockedThisUser + '\n'}
                    <Text style={{
                        ...commonStyles.font_18_SemiBold,
                        textAlign: 'center',
                        color: theme.colors.florsentTheme,
                    }}>{' ' + strings.tap + ' '}</Text>
                    {strings.toUnblock}</Text>
            </TouchableOpacity>
            : areYouBlocked
                ? <View style={blockedViewStyle}>
                    <Text style={{
                        ...commonStyles.font_18_regular,
                        width: '90%',
                        textAlign: 'center',
                        color: theme.colors.black,
                    }}>{strings.youHaveBeenBlockedThisUser}</Text>
                </View>

                :
                <ChatInputComponent
                onChangeText={onChangeInputText}
                onSend={onSend}
                onSendLiveLocation={onSendLiveLocation}
                textValue={textValue}
                onStartRecAudio={onStartRecAudio}
                onStopRecAudio={onStopRecAudio}
                onCancelRecAudio={onCancelRecAudio}
                onSendImage={onSendImage}
                onSendCameraImage={onSendCameraImage}
                onEndEditing={onEndEditing}
                sender_id={sender_id}
                roomType={roomData}
                publicRoom={publicRoom}
                chatId={chatId}
                onDraftLoaded={onDraftLoaded}
                messages={messages}
                userData={userData}
                onResendPhoto={onResendPhoto}
                currentLoc={currentLoc}
                mapRegion={mapRegion}
                setMapRegion={setMapRegion}
                hasActiveReply={hasActiveReply}
                />
    )
}

export default React.memo(ChatInputToolBar);
