import React from "react";
import { Pressable, Image } from "react-native";
import { styles } from "../styles/TeamAvatarStyles";

const TeamAvatar = React.memo(({ player, isSelected, onSelect }) => {
  return (
    <Pressable
      onPress={() => {
        console.log("Spieler ausgewählt:", player.id);
        onSelect(player);
      }}
      style={[
        styles.teamAvatarContainer,
        isSelected && styles.selectedTeamAvatar,
      ]}
    >
      <Image
        source={{ uri: player.imageNoBg || player.image }}
        style={styles.teamAvatar}
      />
    </Pressable>
  );
});

export default TeamAvatar;
