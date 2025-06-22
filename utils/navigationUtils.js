// utils/navigationUtils.js
export const navigateTo = (navigation, screenName, params = {}) => {
  navigation.navigate(screenName, params);
};

export const resetToHome = (navigation) => {
  navigation.reset({
    index: 0,
    routes: [{ name: "HomeScreen" }],
  });
};
