// src/screens/NewsScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useNewsLogic } from "../logic/NewsLogic";
import { styles } from "../styles/NewsStyles";
import Footer from "../components/Footer";

export default function NewsScreen() {
  const { newsItems } = useNewsLogic();
  const [loading, setLoading] = useState(false);

  return (
    <View style={styles.background}>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFF" />
        </View>
      )}
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.newsContainer}>
          {newsItems.map((item) => {
            const imageUri =
              item.image && item.image.trim() !== ""
                ? item.image
                : item.characterBackground &&
                  item.characterBackground.trim() !== ""
                ? item.characterBackground
                : "https://via.placeholder.com/600x300?text=Default+Background";

            return (
              <Pressable key={item.id} style={styles.newsCard}>
                <Image source={{ uri: imageUri }} style={styles.newsImage} />
                <View style={styles.newsContent}>
                  <Text style={styles.newsTitle}>{item.title}</Text>
                  <Text style={styles.newsDate}>{item.date}</Text>
                  <Text style={styles.newsText}>{item.content}</Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
      <Footer />
    </View>
  );
}
