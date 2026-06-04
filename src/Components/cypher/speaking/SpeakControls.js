import React from 'react';
import {ActionButton, ActionRow} from '../voice/VoiceButton';

const SpeakControls = ({onStop, onNew}) => (
  <ActionRow>
    <ActionButton label="STOP" onPress={onStop} variant="ghost" />
    <ActionButton label="NEW" onPress={onNew} />
  </ActionRow>
);

export default SpeakControls;
