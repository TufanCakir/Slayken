// src/components/MenuModal.js
import React from "react";
import { View, Modal, FlatList } from "react-native";
import GradientButton from "./GradientButton";
import { menuButtons } from "../data/menuButtons";
import styles from "../styles/MenuModalStyles";

const MenuModal = ({ visible, onClose, navigation }) => {
  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <FlatList
            data={menuButtons}
            keyExtractor={(item) => item.screen}
            numColumns={3}
            renderItem={({ item }) => (
              <GradientButton
                title={item.title}
                onPress={() => {
                  navigation.navigate(item.screen);
                  onClose();
                }}
                style={styles.button}
              />
            )}
          />
          <GradientButton
            title="Close"
            onPress={onClose}
            style={styles.closeButton}
            textStyle={{ fontSize: 30 }}
          />
        </View>
      </View>
    </Modal>
  );
};

export default MenuModal;
